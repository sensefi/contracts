// SPDX-License-Identifier: MIT
pragma solidity 0.6.12;


import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";
import "./SenseToken.sol";
import "./uniswapv2/interfaces/IUniswapV2Pair.sol";
import "./uniswapv2/interfaces/IUniswapV2Factory.sol";
import "./uniswapv2/interfaces/IWETH.sol";

// IickInitialMinter is the owner of TickToken at the initial phase
// The owner right will be changed to timelock at the specified condition
contract SenseMinter {
    using SafeMath for uint256;
    using SafeERC20 for IERC20;

    address payable public devaddr;
    SenseToken public sense;
    address public timelock;
    
    address public univ2Factory;
    address public usdt;
    address public weth;

    mapping(address => uint256) public lpAssets;
    mapping(address => uint256) public ethAssets;
    uint256 public totalLpAssets;
    
    uint256 public startBlock;
    bool public close;
    bool public finish;
    bool public lpFinish;
    uint256 private constant _MAX_ETH_BAL = 100000 ether;
    uint256 private constant _MIN_ETH_BAL = 2000 ether;

    constructor(
        SenseToken _sense,
        address _weth,
        address _usdt,
        address _univ2Factory,
        uint256 _startBlock
    ) public {
        require(_startBlock > block.number);
        devaddr = msg.sender;
        sense = _sense;
        weth = _weth;
        usdt = _usdt;
        univ2Factory = _univ2Factory;
        startBlock = _startBlock;
    }

    receive() external payable {
        join();
    }

    function join() public payable {
        require(!close, "close");
        require(!finish, "finish");
        require(msg.value <= 100 ether, "too much");
        require(msg.value >= 1 ether, "not enough");

        uint256 amount = msg.value;
        uint256 price = uint256(2000).sub(address(this).balance.mul(1000).div(_MAX_ETH_BAL));
    
        sense.mint(msg.sender, amount.mul(price));
        lpAssets[msg.sender] = lpAssets[msg.sender].add(amount.mul(price));
        ethAssets[msg.sender] = ethAssets[msg.sender].add(amount); 
        totalLpAssets = totalLpAssets.add(amount.mul(price));

        if (address(this).balance >= _MAX_ETH_BAL) {
            finish = true;
        }
    }

    function addLp () public {
        require(msg.sender == devaddr);
        require (finish);

        // rebase then move all eth to LP
        uint256 senseReserve; 
        uint256 senseEthReserve;
        uint256 ethReserve;
        uint256 usdReserve;
        address senseLp = IUniswapV2Factory(univ2Factory).getPair(address(sense), weth);
        address ethUsdLp = IUniswapV2Factory(univ2Factory).getPair(usdt, weth);
        require(senseLp != address(0), "sense Lp should be existed");
        require(ethUsdLp != address(0), "eth usd Lp should be existed");
        if (IUniswapV2Pair(senseLp).token1() == weth) {
            (senseReserve, senseEthReserve,) = IUniswapV2Pair(senseLp).getReserves();
        } else {
            (senseEthReserve, senseReserve,) = IUniswapV2Pair(senseLp).getReserves();
        }
        if (IUniswapV2Pair(ethUsdLp).token1() == weth) {
            (usdReserve, ethReserve,) = IUniswapV2Pair(ethUsdLp).getReserves();
        } else {
            (ethReserve, usdReserve,) = IUniswapV2Pair(ethUsdLp).getReserves();
        }
        uint256 targetSenseReserve = senseEthReserve.mul(usdReserve).div(ethReserve);
        sense.rebase(0, targetSenseReserve.mul(1 ether).div(senseReserve));
        IUniswapV2Pair(senseLp).sync();

        if (IUniswapV2Pair(senseLp).token1() == weth) {
            (senseReserve, senseEthReserve,) = IUniswapV2Pair(senseLp).getReserves();
        } else {
            (senseEthReserve, senseReserve,) = IUniswapV2Pair(senseLp).getReserves();
        }
        
        uint256 ethBal = address(this).balance;
        uint256 devBal = ethBal.div(50);
        uint256 lpBal = ethBal.sub(devBal);
        uint256 mintAmount = lpBal.mul(senseReserve).div(senseEthReserve);
        sense.mint(address(this), mintAmount);

        IWETH(weth).deposit{value: lpBal}();
        IWETH(weth).transfer(senseLp, lpBal);
        devaddr.transfer(devBal);
        IERC20(sense).safeTransfer(senseLp, mintAmount);
        IUniswapV2Pair(senseLp).mint(address(this));
        
        lpFinish = true;
    }

    function claimLp() public {
        require(lpFinish);
        uint asset = lpAssets[msg.sender];
        address senseLp = IUniswapV2Factory(univ2Factory).getPair(address(sense), weth);
        uint amount = IERC20(senseLp).balanceOf(address(this)).mul(asset).div(totalLpAssets).mul(80).div(100);
        IERC20(senseLp).safeTransfer(msg.sender, amount);
        lpAssets[msg.sender] = 0;
        totalLpAssets = totalLpAssets.sub(asset);
    }

    function claimEth() public {
        require(close, "should be closed");
        uint amount = ethAssets[msg.sender];
        msg.sender.transfer(amount);
        ethAssets[msg.sender] = 0;
    }

    function devClose() public {
        require(msg.sender == devaddr);
        require(address(this).balance < _MIN_ETH_BAL);
        close = true;
    }

    function anyClose() public {
        require(address(this).balance < _MIN_ETH_BAL);
        require(!close);
        require(startBlock.add(600000) > block.number);
        close = true;
    }

    function devFinish() public {
        require(msg.sender == devaddr);
        require(address(this).balance >= _MIN_ETH_BAL);
        finish = true;
    }

    address public _proposedTimelock;
    uint public _proposedFromBlock;
    uint private constant _VOTE_PERIOD = 17280; // about 3 days
    uint public supportVotes;
    mapping (address => mapping (address => bool)) private _hasVotes;

    function proposeTimelock(address _timelock) public {
        require(lpFinish, "LP not finished");
        require(sense.getPriorVotes(msg.sender, uint(block.number).sub(1)) > sense.totalGonSupply().div(100), "not enough votes");
        require(_proposedFromBlock.add(_VOTE_PERIOD) < block.number, "vote is running");
        require(_proposedTimelock != _timelock, "already proposed");
        _proposedTimelock = _timelock;
        _proposedFromBlock = block.number;
    }

    function voteTimelock() public {
        require(supportVotes < sense.totalGonSupply().div(25), "already finished");
        require(block.number < _proposedFromBlock.add(_VOTE_PERIOD), "time expired");
        require(!_hasVotes[_proposedTimelock][msg.sender], "already vote");
        uint _votes = sense.getPriorVotes(msg.sender, _proposedFromBlock);
        _hasVotes[_proposedTimelock][msg.sender] = true;
        if (_votes > 0) {
            supportVotes = supportVotes.add(_votes);
            if (supportVotes >= sense.totalGonSupply().div(25)) {
                timelock = _proposedTimelock;
            }
        }
    }

    function transferSenseOwnership() public {
        require(msg.sender == devaddr);
        require(timelock != address(0));
        sense.transferOwnership(timelock);
    }

    function devDestruct() public {
        require(msg.sender == devaddr);
        require(sense.owner() != address(this));
        require(lpFinish);
        require(totalLpAssets == 0);
        address senseLp = IUniswapV2Factory(univ2Factory).getPair(address(sense), weth);
        uint amount = IERC20(senseLp).balanceOf(address(this));
        IERC20(senseLp).safeTransfer(msg.sender, amount);
        selfdestruct(msg.sender);
    }

    function dev(address payable _devaddr) public {
        require(msg.sender == devaddr, "dev: wut?");
        devaddr = _devaddr;
    }
}


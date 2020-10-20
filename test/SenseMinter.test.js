const { time, expectRevert } = require('@openzeppelin/test-helpers');
const SenseToken = artifacts.require('SenseToken');
const SenseMinter = artifacts.require('SenseMinter')
const MockERC20 = artifacts.require('MockERC20');
const UniswapV2Factory = artifacts.require('UniswapV2Factory');
const UniswapV2Pair = artifacts.require('UniswapV2Pair');
const WETH = artifacts.require('WETH');

function toBN(x) {
    return '0x' + (Math.floor(x * (10 ** 18))).toString(16);
}

function toBN2(x) {
    return Math.floor(x * (10 ** 18));
}

contract('SenseMinter', ([alice, bob, carol, duck]) => {
    beforeEach(async () => {
        
        this.eth = await WETH.new({from: alice});
        this.usd = await MockERC20.new('USD', 'USD', toBN(100000.8), {from: bob});
        this.factory = await UniswapV2Factory.new(alice, {from: alice});

        this.sense = await SenseToken.new({ from: alice});
        this.minter = await SenseMinter.new(this.sense.address, this.eth.address, this.usd.address, this.factory.address, 100000);
        
        this.ethUsdLp = await UniswapV2Pair.at((await this.factory.createPair(this.eth.address, this.usd.address)).logs[0].args.pair);
        await this.eth.sendTransaction({from: bob, value: toBN(1)});
        await this.eth.transfer(this.ethUsdLp.address, toBN(1), {from: bob});
        await this.usd.transfer(this.ethUsdLp.address, toBN(500), {from: bob});
        await this.ethUsdLp.mint(bob);

        await this.sense.start(this.eth.address, this.factory.address, {from: alice, value: 10 ** 18})
        await this.sense.transferOwnership(this.minter.address);
    });

    /*it("check", async () => {
        await expectRevert(this.minter.sendTransaction({from: alice, value: toBN(1000)}), "too much");
        await this.minter.sendTransaction({from: alice, value: toBN(100)});
        assert.equal((await this.minter.totalLpAssets()).valueOf(), toBN2(199900));
        assert.equal((await this.minter.lpAssets(alice)).valueOf(), toBN2(199900));
        await this.minter.sendTransaction({from: bob, value: toBN(100)});
        assert.equal((await this.minter.totalLpAssets()).valueOf(), toBN2(399700));
        assert.equal((await this.minter.lpAssets(bob)).valueOf(), toBN2(199800));
        for (var i = 0; i < 332; i++) {
            await this.minter.sendTransaction({from: alice, value: toBN(100)});
            await this.minter.sendTransaction({from: bob, value: toBN(100)});
            await this.minter.sendTransaction({from: carol, value: toBN(100)});
        }
        await this.minter.sendTransaction({from: alice, value: toBN(100)});
        await this.minter.sendTransaction({from: bob, value: toBN(100)});
        await expectRevert(this.minter.sendTransaction({from: alice, value: toBN(100)}), "finish");
            
    });*/

    /*
    it("join and claim eth", async () => {
        await expectRevert(this.minter.sendTransaction({from: alice, value: toBN(1000)}), "too much");
        await expectRevert(this.minter.sendTransaction({from: alice, value: toBN(0.1)}), "not enough");
        await this.minter.join({from: alice, value: 10 ** 18});
        assert.equal((await this.minter.totalLpAssets()).valueOf(), 2000 * (10 ** 18));
        assert.equal((await this.minter.lpAssets(alice)).valueOf(), 2000 * (10 ** 18));
        assert.equal((await this.minter.ethAssets(alice)).valueOf(), 1 * (10 ** 18));
        await this.minter.sendTransaction({from: bob, value: toBN(10)});
        assert.equal((await this.minter.totalLpAssets()).valueOf(), 22000 * (10 ** 18));
        assert.equal((await this.minter.lpAssets(bob)).valueOf(), 20000 * (10 ** 18));
        assert.equal((await this.minter.ethAssets(bob)).valueOf(), toBN2(10));

        await expectRevert(this.minter.claimEth({from: alice}), "should be closed");
        await this.minter.devClose({from: alice});
        await this.minter.claimEth({from: alice});
        await this.minter.claimEth({from: bob});
        assert.equal((await this.minter.ethAssets(alice)), 0);
        assert.equal((await this.minter.ethAssets(bob)), 0);

        await expectRevert(this.minter.sendTransaction({from: alice, value: toBN(100)}), "close");
    });*/

    
    it("addlp and claim lp", async () => {
        await this.minter.sendTransaction({from: alice, value: toBN(100)});
        await this.minter.sendTransaction({from: bob, value: toBN(100)});
        await this.minter.sendTransaction({from: carol, value: toBN(100)});
        await this.minter.sendTransaction({from: alice, value: toBN(10)});
        await this.minter.sendTransaction({from: bob, value: toBN(10)});
        await this.minter.sendTransaction({from: carol, value: toBN(10)});
        await this.minter.sendTransaction({from: alice, value: toBN(100)});
        await this.minter.sendTransaction({from: bob, value: toBN(100)});
        await this.minter.sendTransaction({from: carol, value: toBN(100)});
        await this.minter.sendTransaction({from: alice, value: toBN(100)});
        await this.minter.sendTransaction({from: bob, value: toBN(100)});
        await this.minter.sendTransaction({from: carol, value: toBN(100)});
        await this.minter.sendTransaction({from: alice, value: toBN(100)});
        await this.minter.sendTransaction({from: bob, value: toBN(100)});
        await this.minter.sendTransaction({from: carol, value: toBN(100)});
        await this.minter.sendTransaction({from: alice, value: toBN(100)});
        await this.minter.sendTransaction({from: bob, value: toBN(100)});
        await this.minter.sendTransaction({from: carol, value: toBN(100)});
        await this.minter.sendTransaction({from: alice, value: toBN(100)});
        await this.minter.sendTransaction({from: bob, value: toBN(100)});
        await this.minter.sendTransaction({from: carol, value: toBN(100)});
        await this.minter.sendTransaction({from: alice, value: toBN(100)});
        await this.minter.sendTransaction({from: bob, value: toBN(100)});
        await this.minter.sendTransaction({from: carol, value: toBN(100)});
        await this.minter.sendTransaction({from: alice, value: toBN(100)});
        await this.minter.sendTransaction({from: bob, value: toBN(100)});
        await this.minter.sendTransaction({from: carol, value: toBN(100)});
        await this.minter.sendTransaction({from: alice, value: toBN(100)});
        await this.minter.sendTransaction({from: bob, value: toBN(100)});
        await this.minter.sendTransaction({from: carol, value: toBN(100)});
        await this.minter.sendTransaction({from: alice, value: toBN(100)});
        await this.minter.sendTransaction({from: bob, value: toBN(100)});
        await this.minter.sendTransaction({from: carol, value: toBN(100)});

        this.senseLp = await UniswapV2Pair.at((await this.factory.getPair(this.eth.address, this.sense.address)).valueOf());
        //console.log((await this.ethUsdLp.getReserves()));
        //console.log((await this.senseLp.getReserves()));
        
        await this.minter.devFinish({from: alice});
        await this.minter.addLp({from: alice});
        
        console.log((await this.minter.totalLpAssets()));
        console.log((await this.minter.lpAssets(alice)));
        console.log((await this.minter.lpAssets(bob)));
        console.log((await this.minter.lpAssets(carol)));

        console.log((await this.senseLp.balanceOf(this.minter.address)));
        await this.minter.claimLp({from: bob});
        console.log((await this.senseLp.balanceOf(this.minter.address)));
        console.log((await this.senseLp.balanceOf(bob)));

        await this.minter.claimLp({from: alice});
        console.log((await this.senseLp.balanceOf(this.minter.address)));
        console.log((await this.senseLp.balanceOf(alice)));

        await expectRevert(this.minter.sendTransaction({from: alice, value: toBN(100)}), "finish");

    });

    
    /*it("tansfer owner to timelock", async () => {
        await this.minter.sendTransaction({from: alice, value: toBN(100)});
        await this.minter.sendTransaction({from: bob, value: toBN(100)});
        await this.minter.sendTransaction({from: carol, value: toBN(100)});
        await this.minter.sendTransaction({from: alice, value: toBN(10)});
        await this.minter.sendTransaction({from: bob, value: toBN(10)});
        await this.minter.sendTransaction({from: carol, value: toBN(10)});
        await this.minter.sendTransaction({from: alice, value: toBN(100)});
        await this.minter.sendTransaction({from: bob, value: toBN(100)});
        await this.minter.sendTransaction({from: carol, value: toBN(100)});
        await this.minter.sendTransaction({from: alice, value: toBN(100)});
        await this.minter.sendTransaction({from: bob, value: toBN(100)});
        await this.minter.sendTransaction({from: carol, value: toBN(100)});
        await this.minter.sendTransaction({from: alice, value: toBN(100)});
        await this.minter.sendTransaction({from: bob, value: toBN(100)});
        await this.minter.sendTransaction({from: carol, value: toBN(100)});
        await this.minter.sendTransaction({from: alice, value: toBN(100)});
        await this.minter.sendTransaction({from: bob, value: toBN(100)});
        await this.minter.sendTransaction({from: carol, value: toBN(100)});
        await this.minter.sendTransaction({from: alice, value: toBN(100)});
        await this.minter.sendTransaction({from: bob, value: toBN(100)});
        await this.minter.sendTransaction({from: carol, value: toBN(100)});
        await this.minter.sendTransaction({from: alice, value: toBN(100)});
        await this.minter.sendTransaction({from: bob, value: toBN(100)});
        await this.minter.sendTransaction({from: carol, value: toBN(100)});
        await this.minter.sendTransaction({from: alice, value: toBN(100)});
        await this.minter.sendTransaction({from: bob, value: toBN(100)});
        await this.minter.sendTransaction({from: carol, value: toBN(100)});
        await this.minter.sendTransaction({from: alice, value: toBN(100)});
        await this.minter.sendTransaction({from: bob, value: toBN(100)});
        await this.minter.sendTransaction({from: carol, value: toBN(100)});
        await this.minter.sendTransaction({from: alice, value: toBN(100)});
        await this.minter.sendTransaction({from: bob, value: toBN(100)});
        await this.minter.sendTransaction({from: carol, value: toBN(100)});

        await this.minter.devFinish({from: alice});
        await this.minter.addLp({from: alice});     

        await this.sense.delegate(alice, {from: alice});
        await this.sense.delegate(bob, {from: bob});

        await this.minter.proposeTimelock(duck, {from: alice});
        await this.minter.voteTimelock({from: alice});

        assert.equal((await this.minter.timelock()).valueOf(), duck);

        await this.minter.transferSenseOwnership({from: alice});
        assert.equal((await this.sense.owner()).valueOf(), duck);
    });*/

});
const { expectRevert } = require('@openzeppelin/test-helpers');
const SenseToken = artifacts.require('SenseToken');

function toBN(x) {
    return '0x' + (Math.floor(x * (10 ** 18))).toString(16);
}

function toBN2(x) {
    return Math.floor(x * (10 ** 18));
}

contract('SenseToken', ([alice, bob, carol]) => {
    beforeEach(async () => {
        this.sense = await SenseToken.new({ from: alice });
    });

    it("show have correct name and symbol", async () => {
        const name = await this.sense.name();
        const symbol = await this.sense.symbol();
        const decimals = await this.sense.decimals();
        assert.equal(name.valueOf(), 'SenseToken');
        assert.equal(symbol.valueOf(), 'SENSE');
        assert.equal(decimals.valueOf(), '18');
    });

    it('show mint', async () => {
        const totalSupply = await this.sense.totalSupply();
        const aliceBal = await this.sense.balanceOf(alice);
        const gonSupply = await this.sense.totalGonSupply();
        assert.equal(totalSupply.valueOf(), toBN2(10000));
        assert.equal(gonSupply.valueOf(), toBN2(10000 * 10 ** 18));
        assert.equal(aliceBal.valueOf(), toBN2(10000));
    });

    it('should only allow owner to mint token', async () => {
        await this.sense.mint(alice, '100', { from: alice });
        await this.sense.mint(bob, '1000', { from: alice });
        await expectRevert(
            this.sense.mint(carol, '1000', { from: bob }),
            'Ownable: caller is not the owner',
        );
        const totalSupply = await this.sense.totalSupply();
        const aliceBal = await this.sense.balanceOf(alice);
        const bobBal = await this.sense.balanceOf(bob);
        const carolBal = await this.sense.balanceOf(carol);
        assert.equal(totalSupply.valueOf(), '10000000000000000001111');
        assert.equal(aliceBal.valueOf(), '10000000000000000000111');
        assert.equal(bobBal.valueOf(), '1000');
        assert.equal(carolBal.valueOf(), '0');
    });

    it('should supply token transfers properly', async () => {
        await this.sense.mint(alice, '100', { from: alice });
        await this.sense.mint(bob, '1000', { from: alice });
        await this.sense.transfer(carol, '10', { from: alice });
        await this.sense.transfer(carol, '100', { from: bob });
        const totalSupply = await this.sense.totalSupply();
        const aliceBal = await this.sense.balanceOf(alice);
        const bobBal = await this.sense.balanceOf(bob);
        const carolBal = await this.sense.balanceOf(carol);
        assert.equal(totalSupply.valueOf(), '10000000000000000001111');
        assert.equal(aliceBal.valueOf(), '10000000000000000000101');
        assert.equal(bobBal.valueOf(), '900');
        assert.equal(carolBal.valueOf(), '110');
    });

    it('should fail if you try to do bad transfers', async () => {
        await this.sense.mint(alice, '100', { from: alice });
        await expectRevert(
            this.sense.transfer(carol, '110', { from: bob }),
            'ERC20: transfer amount exceeds balance',
        );
        await expectRevert(
            this.sense.transfer(carol, '1', { from: bob }),
            'ERC20: transfer amount exceeds balance',
        );
    });

    it('check delegate', async () => {
        await this.sense.delegate(bob);
        const alice_votes = await this.sense.getCurrentVotes(alice);
        const bob_votes = await this.sense.getCurrentVotes(bob);
        assert.equal(alice_votes.valueOf(), '0');
        assert.equal(bob_votes.valueOf(), '10000000000000000000000000000000000000000');
    });

    it('check rebase', async () => {
        await this.sense.rebase(0, toBN(10), {from: alice});
        assert.equal((await this.sense.totalSupply()).valueOf(), toBN2(100000));
        assert.equal((await this.sense.totalGonSupply()).valueOf(), toBN2(10000 * 10 ** 18));
        assert.equal((await this.sense.balanceOf(alice)).valueOf(), toBN2(100000));

        await this.sense.rebase(0, toBN(0.1), {from: alice});
        assert.equal((await this.sense.totalSupply()).valueOf(), toBN2(10000));
        assert.equal((await this.sense.totalGonSupply()).valueOf(), toBN2(10000 * 10 ** 18));
        assert.equal((await this.sense.balanceOf(alice)).valueOf(), toBN2(10000));

        await this.sense.rebase(0, toBN(0.1), {from: alice});
        assert.equal((await this.sense.totalSupply()).valueOf(), toBN2(1000));
        assert.equal((await this.sense.totalGonSupply()).valueOf(), toBN2(10000 * 10 ** 18));
        assert.equal((await this.sense.balanceOf(alice)).valueOf(), toBN2(1000));

        await expectRevert(
            this.sense.rebase(1, toBN(1000), {from: alice}),
            'invalid rate',
        );

        await expectRevert(
            this.sense.rebase(1, toBN(0.001), {from: alice}),
            'invalid rate',
        );

    });

    
});
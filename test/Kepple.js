const { expect } = require("chai");

describe("Token contract", function () {
  let owner, acc2, swap, kepple, timelock, keppledao;

  beforeEach(async function () {
    [owner, acc2] = await ethers.getSigners();

    const Swap = await ethers.getContractFactory("SwapOldQlc");
    swap = await Swap.deploy();

    const Kepple = await ethers.getContractFactory("Kepple");
    kepple = await Kepple.deploy();

    const Timelock = await ethers.getContractFactory("Timelock");
    timelock = await Timelock.deploy(86400, [], [], owner.address);
  });

  const balanceFromSwap = ethers.BigNumber.from("600000000000000000000000000");
  const balanceToGuard = ethers.BigNumber.from("250000000000000000000000000");

  beforeEach(async function() {
    await kepple.mint(swap.address, balanceFromSwap);
    await kepple.mint(timelock.address, balanceToGuard);
  });

  it("Deployment should mint the initial supply to the Timelock and Swap contracts", async function () {
    expect(await kepple.balanceOf(swap.address)).to.equal(balanceFromSwap);
    expect(await kepple.balanceOf(timelock.address)).to.equal(balanceToGuard);
  });

  beforeEach(async function() {
    await kepple.transferOwnership(timelock.address);
  });

  it("Deployment should not be able to mint once the ownership is transferred", async function () {
    await expect(kepple.mint(swap.address, ethers.BigNumber.from("1"))).to.be.revertedWith('Ownable: caller is not the owner');
  });

  const balanceToSwap = ethers.BigNumber.from("100"); 

  it("Deployer should be able to execute a swap", async function () {
    await swap.swap(kepple.address, balanceToSwap, acc2.address, "test");
    expect(await kepple.balanceOf(acc2.address)).to.equal(balanceToSwap);
  });

  it("Other account should not be able to execute a swap", async function () {
    await expect(swap.connect(acc2).swap(kepple.address, balanceToSwap, acc2.address, "test2")).to.be.revertedWith('Ownable: caller is not the owner');
  });

  it("Deployer should not be able to execute a duplicated swap", async function () {
    await swap.swap(kepple.address, balanceToSwap, acc2.address, "test");
    await expect(swap.swap(kepple.address, balanceToSwap, acc2.address, "test")).to.be.revertedWith("Duplicated swap");
  });

  beforeEach(async function() {
    const KeppleDAO = await ethers.getContractFactory("KeppleDAO");
    keppleDAO = await KeppleDAO.deploy(kepple.address, timelock.address);
  });
});

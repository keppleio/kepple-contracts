const vestedStakingAddr = "0xFdDb9939edc3229242CbcA3DC7b56f5b56664232";
const vestedEmpowermentAddr = "0x50E0aAAB9d436C78f771Ca4208101CbfA84443Ea";
const initialSupply = ethers.utils.parseUnits("600000000");
const stakingSupply = ethers.utils.parseUnits("24000000");
const empowermentSupply = ethers.utils.parseUnits("126000000");
const vestTime = 86400 * 365 * 2 // 2 years

async function main() {
  const [{address:myAddress}] = await ethers.getSigners();

  const Swap = await ethers.getContractFactory("SwapOldQlc");
  const swap = await Swap.deploy();
  console.log("Swap contract deployed to address:", swap.address);

  const Kepple = await ethers.getContractFactory("Kepple");
  const kepple = await Kepple.deploy(); 
  console.log("Kepple token contract deployed to address:", kepple.address);

  await kepple.mint(swap.address, initialSupply);
  console.log("Minted 600,000,000 KPL to the Swap contract");

  const Timelock = await ethers.getContractFactory("Timelock");
  const timelock = await Timelock.deploy(86400, [], [], myAddress);
  console.log("Timelock contract deployed to address:", timelock.address);

  const VestedStaking = await ethers.getContractFactory("TimeVest");
  const VestedEmpowerment = await ethers.getContractFactory("TimeVest");
  const vestedStaking = await VestedStaking.deploy(vestedStakingAddr, (await ethers.provider.getBlock(await ethers.provider.getBlockNumber())).timestamp, vestTime);

  console.log("Staking time vest contract deployed to address:", vestedStaking.address);

  const vestedEmpowerment = await VestedEmpowerment.deploy(vestedEmpowermentAddr, (await ethers.provider.getBlock(await ethers.provider.getBlockNumber())).timestamp, vestTime);
  console.log("Empowerment fund vest contract deployed to address:", vestedEmpowerment.address);

  await kepple.mint(vestedEmpowerment.address, empowermentSupply);
  console.log("Minted 126,000,000 KPL to the Empowerment Fund vested address");

  await kepple.mint(vestedStaking.address, stakingSupply);
  console.log("Minted 24,000,000 KPL to the Staking vested address");

  const KeppleDAO = await ethers.getContractFactory("KeppleDAO");
  const keppleDAO = await KeppleDAO.deploy(kepple.address, timelock.address);
  console.log("KeppleDAO contract deployed to address:", keppleDAO.address);

  await timelock.grantRole(await timelock.PROPOSER_ROLE(), keppleDAO.address);
  console.log("Granted proposer role to KeppleDAO");
  await timelock.grantRole(await timelock.EXECUTOR_ROLE(), keppleDAO.address);
  console.log("Granted executor role to KeppleDAO");
  await timelock.grantRole(await timelock.TIMELOCK_ADMIN_ROLE(), timelock.address);
  console.log("Granted admin role to Timelock");
  await timelock.renounceRole(await timelock.TIMELOCK_ADMIN_ROLE(), myAddress);
  console.log("Renounced admin role");
  await kepple.transferOwnership(timelock.address);
  console.log("Transferred ownership to Timelock");
}

main()
 .then(() => process.exit(0))
 .catch(error => {
   console.error(error);
   process.exit(1);
  });

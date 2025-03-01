const { ethers } = require("hardhat");
require("dotenv").config();

async function deployContract(name, factory, ...args) {
  console.log(`\nDeploying ${name}...`);
  const gasPrice = (await ethers.provider.getGasPrice()).mul(120).div(100);
  const contract = await factory.deploy(...args, { gasPrice });
  await contract.deployed();
  console.log(`${name} deployed to:`, contract.address);
  return contract;
}

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", ethers.utils.formatEther(await deployer.getBalance()), "ETH");

  try {
    // Assume AccessManager, IoTDataLedger, and TokenRewards are already deployed
    const accessManagerAddress = "0x18C792C368279C490042E85fb4DCC2FB650CE44e"; // Replace with existing address
    const iotDataLedgerAddress = "0xf6A7E3d41611FcAf815C6943807B690Ee9Bf8220"; // Replace with existing address
    const tokenRewardsAddress = "0xca276186Eb9f3a58FCdfc4adA247Cbe8d935778a"; // Replace with existing address

    const DeviceRegistry = await ethers.getContractFactory("DeviceRegistry");
    const deviceRegistry = await deployContract("DeviceRegistry", DeviceRegistry, accessManagerAddress);

    const OracleIntegration = await ethers.getContractFactory("OracleIntegration");
    const jobId = ethers.utils.formatBytes32String(process.env.CHAINLINK_JOB_ID || "default-job-id");
    const oracleIntegration = await deployContract(
      "OracleIntegration",
      OracleIntegration,
      accessManagerAddress,
      process.env.CHAINLINK_TOKEN,
      process.env.CHAINLINK_ORACLE,
      jobId,
      process.env.CHAINLINK_FEE || ethers.utils.parseEther("0.1"),
      iotDataLedgerAddress,
      tokenRewardsAddress
    );

    console.log("\nWaiting for confirmations...");
    await Promise.all([
      deviceRegistry.deployTransaction.wait(5),
      oracleIntegration.deployTransaction.wait(5),
    ]);

    console.log("\nVerifying contracts on Etherscan...");
    await hre.run("verify:verify", { address: deviceRegistry.address, constructorArguments: [accessManagerAddress] });
    await hre.run("verify:verify", {
      address: oracleIntegration.address,
      constructorArguments: [
        accessManagerAddress,
        process.env.CHAINLINK_TOKEN,
        process.env.CHAINLINK_ORACLE,
        jobId,
        process.env.CHAINLINK_FEE || ethers.utils.parseEther("0.1"),
        iotDataLedgerAddress,
        tokenRewardsAddress,
      ],
    });

    const deploymentInfo = {
      network: "sepolia",
      deviceRegistry: deviceRegistry.address,
      oracleIntegration: oracleIntegration.address,
      timestamp: new Date().toISOString(),
    };

    const fs = require("fs");
    fs.writeFileSync("redeployment-info.json", JSON.stringify(deploymentInfo, null, 2)); // Fixed typo
    console.log("\nRedeployment info saved to redeployment-info.json");

  } catch (error) {
    console.error("\nError during redeployment:", error);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
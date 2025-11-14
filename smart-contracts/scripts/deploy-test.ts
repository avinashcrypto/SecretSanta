import { ethers } from "hardhat";

async function main() {
  console.log("🧪 Deploying SecretSanta TEST contract to Sepolia testnet...\n");
  console.log("⚠️  This uses TEST-FRIENDLY parameters for quick iteration!\n");

  // Get deployer account
  const [deployer] = await ethers.getSigners();
  console.log("📝 Deploying with account:", deployer.address);

  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("💰 Account balance:", ethers.formatEther(balance), "ETH\n");

  // TEST PARAMETERS - Moderate testing (12 minutes total)
  const REGISTRATION_PERIOD = 5 * 60; // 5 minutes
  const MATCHING_PERIOD = 5 * 60; // 5 minutes
  const REVEAL_DELAY = 2 * 60; // 2 minutes
  const ENTRY_FEE = ethers.parseEther("0.001"); // 0.001 ETH (test-friendly)
  const MIN_PARTICIPANTS = 3; // Contract requires at least 3
  const MAX_PARTICIPANTS = 10;

  console.log("📋 Constructor parameters (TEST MODE):");
  console.log("   Registration Period:", REGISTRATION_PERIOD, "seconds (5 minutes)");
  console.log("   Matching Period:", MATCHING_PERIOD, "seconds (5 minutes)");
  console.log("   Reveal Delay:", REVEAL_DELAY, "seconds (2 minutes)");
  console.log("   Entry Fee:", ethers.formatEther(ENTRY_FEE), "ETH");
  console.log("   Min Participants:", MIN_PARTICIPANTS);
  console.log("   Max Participants:", MAX_PARTICIPANTS);
  console.log();

  // Deploy contract
  console.log("🚀 Deploying contract...");
  const SecretSanta = await ethers.getContractFactory("SecretSanta");

  const secretSanta = await SecretSanta.deploy(
    REGISTRATION_PERIOD,
    MATCHING_PERIOD,
    REVEAL_DELAY,
    ENTRY_FEE,
    MIN_PARTICIPANTS,
    MAX_PARTICIPANTS
  );

  await secretSanta.waitForDeployment();

  const contractAddress = await secretSanta.getAddress();
  console.log("✅ SecretSanta TEST contract deployed to:", contractAddress);
  console.log();

  // Save deployment info
  console.log("📄 Deployment Summary:");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("Contract Address:", contractAddress);
  console.log("Deployer:", deployer.address);
  console.log("Network:", (await ethers.provider.getNetwork()).name);
  console.log("Chain ID:", (await ethers.provider.getNetwork()).chainId);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log();

  // Verify contract command
  console.log("🔍 To verify the contract on Etherscan, run:");
  console.log(`npx hardhat verify --network sepolia ${contractAddress} \\`);
  console.log(`  ${REGISTRATION_PERIOD} ${MATCHING_PERIOD} ${REVEAL_DELAY} \\`);
  console.log(`  ${ENTRY_FEE.toString()} ${MIN_PARTICIPANTS} ${MAX_PARTICIPANTS}`);
  console.log();

  // Frontend configuration
  console.log("⚙️  Update frontend configuration:");
  console.log(`VITE_CONTRACT_ADDRESS=${contractAddress}`);
  console.log(`VITE_CHAIN_ID=11155111`);
  console.log();

  console.log("🎮 Quick Test Timeline:");
  console.log("  0:00 - Deploy contract & users register");
  console.log("  0:00-5:00 - Registration period");
  console.log("  5:00 - Admin starts matching");
  console.log("  5:00-10:00 - Users submit gifts");
  console.log("  10:00-12:00 - Wait for reveal time");
  console.log("  12:00+ - Admin triggers reveal, see results!");
  console.log();

  console.log("✨ Test deployment complete! Happy testing!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });

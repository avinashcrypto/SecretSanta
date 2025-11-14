import { ethers } from "hardhat";

async function main() {
  console.log("⚡ Deploying SecretSanta DEMO contract to Sepolia testnet...\n");
  console.log("🎬 This uses ULTRA-FAST parameters for quick demonstrations!\n");
  console.log("⏱️  Total demo time: ~5 minutes from start to finish\n");

  // Get deployer account
  const [deployer] = await ethers.getSigners();
  console.log("📝 Deploying with account:", deployer.address);

  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("💰 Account balance:", ethers.formatEther(balance), "ETH\n");

  // DEMO PARAMETERS - Ultra-fast for demonstrations (6 minutes total)
  const REGISTRATION_PERIOD = 3 * 60; // 3 minutes
  const MATCHING_PERIOD = 2 * 60; // 2 minutes
  const REVEAL_DELAY = 1 * 60; // 1 minute
  const ENTRY_FEE = ethers.parseEther("0.0001"); // 0.0001 ETH (very low for demo)
  const MIN_PARTICIPANTS = 3; // Contract requires at least 3
  const MAX_PARTICIPANTS = 5; // Small group for quick demo

  console.log("📋 Constructor parameters (DEMO MODE - Ultra Fast):");
  console.log("   Registration Period:", REGISTRATION_PERIOD, "seconds (3 minutes)");
  console.log("   Matching Period:", MATCHING_PERIOD, "seconds (2 minutes)");
  console.log("   Reveal Delay:", REVEAL_DELAY, "seconds (1 minute)");
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
  console.log("✅ SecretSanta DEMO contract deployed to:", contractAddress);
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

  console.log("🎬 Quick Demo Timeline (Perfect for video demonstrations):");
  console.log("  0:00 - Deploy contract");
  console.log("  0:00-3:00 - Users register (3-5 people)");
  console.log("  3:00 - Admin starts matching");
  console.log("  3:00-5:00 - Users submit gifts");
  console.log("  5:00-6:00 - Wait for reveal time");
  console.log("  6:00+ - Admin triggers reveal, see results!");
  console.log();
  console.log("💡 Tip: This configuration is perfect for:");
  console.log("   - Recording demo videos");
  console.log("   - Live demonstrations to judges");
  console.log("   - Quick functionality verification");
  console.log();

  console.log("✨ Demo deployment complete! Time to showcase your dApp!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });

import { ethers } from "hardhat";

async function main() {
  console.log("🎅 Deploying SecretSanta PRODUCTION contract to Sepolia testnet...\n");
  console.log("🏭 This uses PRODUCTION parameters for real-world usage!\n");

  // Get deployer account
  const [deployer] = await ethers.getSigners();
  console.log("📝 Deploying with account:", deployer.address);

  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("💰 Account balance:", ethers.formatEther(balance), "ETH\n");

  // PRODUCTION PARAMETERS - Real-world usage (6 days total)
  const REGISTRATION_PERIOD = 3 * 24 * 60 * 60; // 3 days in seconds
  const MATCHING_PERIOD = 2 * 24 * 60 * 60; // 2 days
  const REVEAL_DELAY = 1 * 24 * 60 * 60; // 1 day
  const ENTRY_FEE = ethers.parseEther("0.01"); // 0.01 ETH
  const MIN_PARTICIPANTS = 3;
  const MAX_PARTICIPANTS = 20;

  console.log("📋 Constructor parameters (PRODUCTION MODE):");
  console.log("   Registration Period:", REGISTRATION_PERIOD, "seconds (3 days)");
  console.log("   Matching Period:", MATCHING_PERIOD, "seconds (2 days)");
  console.log("   Reveal Delay:", REVEAL_DELAY, "seconds (1 day)");
  console.log("   Entry Fee:", ethers.formatEther(ENTRY_FEE), "ETH");
  console.log("   Min Participants:", MIN_PARTICIPANTS);
  console.log("   Max Participants:", MAX_PARTICIPANTS);
  console.log();
  console.log("⏱️  Total game duration: ~6 days");
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
  console.log("✅ SecretSanta PRODUCTION contract deployed to:", contractAddress);
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
  console.log(`  ${ENTRY_FEE} ${MIN_PARTICIPANTS} ${MAX_PARTICIPANTS}`);
  console.log();

  // Frontend configuration
  console.log("⚙️  Update frontend configuration:");
  console.log(`VITE_CONTRACT_ADDRESS=${contractAddress}`);
  console.log(`VITE_CHAIN_ID=11155111`);
  console.log();

  console.log("🏭 Production Game Timeline:");
  console.log("  Day 0 - Deploy contract, users start registering");
  console.log("  Day 0-3 - Registration period (3 days)");
  console.log("  Day 3 - Admin starts matching");
  console.log("  Day 3-5 - Users submit gifts (2 days)");
  console.log("  Day 5-6 - Wait for reveal time (1 day)");
  console.log("  Day 6+ - Admin triggers reveal, everyone sees their gifts!");
  console.log();
  console.log("💡 Tip: This configuration is suitable for:");
  console.log("   - Real user communities");
  console.log("   - Company holiday events");
  console.log("   - Friend group exchanges");
  console.log();

  console.log("✨ Production deployment complete!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });

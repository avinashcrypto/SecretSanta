import { ethers } from "hardhat";

async function main() {
  console.log("💰 检查 Sepolia 账户余额...\n");

  try {
    // Get deployer account
    const [deployer] = await ethers.getSigners();
    console.log("📝 账户地址:", deployer.address);

    // Get balance
    const balance = await ethers.provider.getBalance(deployer.address);
    const balanceInEth = ethers.formatEther(balance);

    console.log("💵 当前余额:", balanceInEth, "ETH");
    console.log();

    // Check network
    const network = await ethers.provider.getNetwork();
    console.log("🌐 网络:", network.name);
    console.log("🔗 Chain ID:", network.chainId.toString());
    console.log();

    // Deployment cost estimate
    const estimatedDeployCost = 0.06; // ~3M gas * 20 gwei

    console.log("📊 部署成本估算:");
    console.log("   合约部署: ~0.06 ETH");
    console.log("   测试交互: ~0.01 ETH");
    console.log("   建议余额: >= 0.1 ETH");
    console.log();

    // Check if sufficient
    const balanceNum = parseFloat(balanceInEth);
    if (balanceNum < 0.001) {
      console.log("❌ 余额不足！请从水龙头获取 Sepolia ETH:");
      console.log("   - https://sepoliafaucet.com/");
      console.log("   - https://www.alchemy.com/faucets/ethereum-sepolia");
      process.exit(1);
    } else if (balanceNum < 0.1) {
      console.log("⚠️  余额较低，建议获取更多测试币以确保部署成功");
    } else {
      console.log("✅ 余额充足，可以进行部署！");
    }
  } catch (error) {
    console.error("❌ 检查余额失败:", error);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

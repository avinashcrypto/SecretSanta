/**
 * 验证部署参数脚本
 * 检查所有部署脚本的参数是否符合合约要求
 */

// Demo 环境参数
const DEMO_PARAMS = {
  name: "Demo",
  REGISTRATION_PERIOD: 3 * 60,
  MATCHING_PERIOD: 2 * 60,
  REVEAL_DELAY: 1 * 60,
  ENTRY_FEE: "0.0001",
  MIN_PARTICIPANTS: 3,
  MAX_PARTICIPANTS: 5,
};

// Test 环境参数
const TEST_PARAMS = {
  name: "Test",
  REGISTRATION_PERIOD: 5 * 60,
  MATCHING_PERIOD: 5 * 60,
  REVEAL_DELAY: 2 * 60,
  ENTRY_FEE: "0.001",
  MIN_PARTICIPANTS: 3,
  MAX_PARTICIPANTS: 10,
};

// Production 环境参数
const PROD_PARAMS = {
  name: "Production",
  REGISTRATION_PERIOD: 3 * 24 * 60 * 60,
  MATCHING_PERIOD: 2 * 24 * 60 * 60,
  REVEAL_DELAY: 1 * 24 * 60 * 60,
  ENTRY_FEE: "0.01",
  MIN_PARTICIPANTS: 3,
  MAX_PARTICIPANTS: 20,
};

// 验证函数
function validateParams(params) {
  const errors = [];
  const warnings = [];

  console.log(`\n🔍 验证 ${params.name} 环境参数...`);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

  // 1. 检查 MIN_PARTICIPANTS
  if (params.MIN_PARTICIPANTS < 3) {
    errors.push(`❌ MIN_PARTICIPANTS (${params.MIN_PARTICIPANTS}) 必须 >= 3（合约要求）`);
  } else {
    console.log(`✅ MIN_PARTICIPANTS: ${params.MIN_PARTICIPANTS} (valid)`);
  }

  // 2. 检查 MAX_PARTICIPANTS
  if (params.MAX_PARTICIPANTS > 256) {
    errors.push(`❌ MAX_PARTICIPANTS (${params.MAX_PARTICIPANTS}) 必须 <= 256（euint8 限制）`);
  } else {
    console.log(`✅ MAX_PARTICIPANTS: ${params.MAX_PARTICIPANTS} (valid)`);
  }

  // 3. 检查 MIN <= MAX
  if (params.MIN_PARTICIPANTS > params.MAX_PARTICIPANTS) {
    errors.push(`❌ MIN_PARTICIPANTS (${params.MIN_PARTICIPANTS}) 不能大于 MAX_PARTICIPANTS (${params.MAX_PARTICIPANTS})`);
  } else {
    console.log(`✅ MIN_PARTICIPANTS <= MAX_PARTICIPANTS (valid)`);
  }

  // 4. 检查时间参数
  if (params.REGISTRATION_PERIOD < 60) {
    warnings.push(`⚠️  REGISTRATION_PERIOD (${params.REGISTRATION_PERIOD}s) 非常短，可能不够用户注册`);
  } else {
    console.log(`✅ REGISTRATION_PERIOD: ${params.REGISTRATION_PERIOD}s (${formatTime(params.REGISTRATION_PERIOD)})`);
  }

  if (params.MATCHING_PERIOD < 60) {
    warnings.push(`⚠️  MATCHING_PERIOD (${params.MATCHING_PERIOD}s) 非常短`);
  } else {
    console.log(`✅ MATCHING_PERIOD: ${params.MATCHING_PERIOD}s (${formatTime(params.MATCHING_PERIOD)})`);
  }

  if (params.REVEAL_DELAY < 60) {
    warnings.push(`⚠️  REVEAL_DELAY (${params.REVEAL_DELAY}s) 非常短`);
  } else {
    console.log(`✅ REVEAL_DELAY: ${params.REVEAL_DELAY}s (${formatTime(params.REVEAL_DELAY)})`);
  }

  // 5. 计算总时长
  const totalTime = params.REGISTRATION_PERIOD + params.MATCHING_PERIOD + params.REVEAL_DELAY;
  console.log(`✅ ENTRY_FEE: ${params.ENTRY_FEE} ETH`);
  console.log(`📊 Total game duration: ${formatTime(totalTime)}`);

  // 输出结果
  if (errors.length > 0) {
    console.log("\n❌ 验证失败！");
    errors.forEach((err) => console.log(err));
    return false;
  }

  if (warnings.length > 0) {
    console.log("\n⚠️  警告：");
    warnings.forEach((warn) => console.log(warn));
  }

  console.log(`\n✅ ${params.name} 环境参数验证通过！`);
  return true;
}

// 时间格式化函数
function formatTime(seconds) {
  if (seconds < 60) {
    return `${seconds} seconds`;
  } else if (seconds < 3600) {
    const minutes = Math.floor(seconds / 60);
    return `${minutes} minute${minutes > 1 ? "s" : ""}`;
  } else if (seconds < 86400) {
    const hours = Math.floor(seconds / 3600);
    return `${hours} hour${hours > 1 ? "s" : ""}`;
  } else {
    const days = Math.floor(seconds / 86400);
    return `${days} day${days > 1 ? "s" : ""}`;
  }
}

// 运行验证
console.log("🎅 Secret Santa 部署参数验证工具");
console.log("═══════════════════════════════════════════");

const results = [
  validateParams(DEMO_PARAMS),
  validateParams(TEST_PARAMS),
  validateParams(PROD_PARAMS),
];

console.log("\n" + "═".repeat(43));
console.log("\n📋 验证总结：");
console.log(`  Demo 环境: ${results[0] ? "✅ 通过" : "❌ 失败"}`);
console.log(`  Test 环境: ${results[1] ? "✅ 通过" : "❌ 失败"}`);
console.log(`  Production 环境: ${results[2] ? "✅ 通过" : "❌ 失败"}`);

if (results.every((r) => r)) {
  console.log("\n🎉 所有环境参数验证通过！可以安全部署。\n");
  process.exit(0);
} else {
  console.log("\n❌ 部分环境参数验证失败！请修正后再部署。\n");
  process.exit(1);
}

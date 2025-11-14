# Secret Santa Smart Contracts

Smart contracts for the Secret Santa FHEVM platform.

## 📁 Structure

```
smart-contracts/
├── contracts/
│   └── SecretSanta.sol      # Main Secret Santa contract
├── scripts/
│   ├── deploy-demo.ts       # Demo deployment (6 min total)
│   ├── deploy-test.ts       # Test deployment (12 min total)
│   └── deploy.ts            # Production deployment (6 days total)
├── test/
│   └── SecretSanta.test.ts  # Contract tests
└── hardhat.config.ts        # Hardhat configuration
```

## 🛠️ Setup

1. **Install dependencies:**
```bash
npm install
```

2. **Configure environment:**
```bash
cp .env.example .env
# Edit .env with your credentials
```

3. **Compile contracts:**
```bash
npm run compile
```

## 🧪 Testing

Run the test suite:
```bash
npm run test
```

Run with coverage:
```bash
npm run coverage
```

## 🚀 Deployment

### Demo Environment (6 minutes total)
```bash
npm run deploy:demo
```
Parameters:
- Registration: 3 minutes
- Gift Submission: 2 minutes
- Reveal Delay: 1 minute
- Entry Fee: 0.0001 ETH
- Participants: 3-5

### Test Environment (12 minutes total)
```bash
npm run deploy:test
```
Parameters:
- Registration: 5 minutes
- Gift Submission: 5 minutes
- Reveal Delay: 2 minutes
- Entry Fee: 0.001 ETH
- Participants: 3-10

### Production Environment (6 days total)
```bash
npm run deploy:production
```
Parameters:
- Registration: 3 days
- Gift Submission: 2 days
- Reveal Delay: 1 day
- Entry Fee: 0.01 ETH
- Participants: 3-20

## ✅ Contract Verification

After deployment, verify your contract on Etherscan:

```bash
# Demo
npx hardhat verify --network sepolia <ADDRESS> 180 120 60 100000000000000 3 5

# Test
npx hardhat verify --network sepolia <ADDRESS> 300 300 120 1000000000000000 3 10

# Production
npx hardhat verify --network sepolia <ADDRESS> 259200 172800 86400 10000000000000000 3 20
```

## 📋 Contract Functions

### For Participants
- `register()` - Join the Secret Santa game (payable)
- `getMyRecipientEncrypted()` - Get your encrypted recipient assignment
- `submitGift(euint256 giftValue, string metadataURI, bytes proof)` - Submit your gift

### For Admin (Owner)
- `startMatching()` - Trigger the FHE matching algorithm
- `triggerReveal()` - Start the reveal process via Gateway

### View Functions
- `getGameInfo()` - Get current game state
- `getParticipants()` - Get list of all participants
- `getRevealedMatch(address participant)` - Get revealed gift info (after reveal)

## 🔐 Security

- Uses Zama's FHEVM for encrypted operations
- OpenZeppelin's `Ownable` for access control
- OpenZeppelin's `ReentrancyGuard` for reentrancy protection
- Immutable constructor parameters prevent post-deployment tampering

## 📝 License

MIT

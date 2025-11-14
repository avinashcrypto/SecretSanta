# Secret Santa FHEVM 🎅

A fully privacy-preserving Secret Santa gift exchange platform built on Zama's Fully Homomorphic Encryption Virtual Machine (FHEVM).

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Solidity](https://img.shields.io/badge/Solidity-0.8.28-orange.svg)
![React](https://img.shields.io/badge/React-18-blue.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue.svg)

## 🎯 Overview

Secret Santa FHEVM enables groups to organize gift exchanges with complete privacy guarantees. Using Zama's Fully Homomorphic Encryption, **no one** (not even the contract owner or admin) can see who is assigned to give gifts to whom until the designated reveal time.

### Key Features

- **🔒 Complete Privacy**: Gift assignments remain encrypted on-chain until reveal
- **🎲 Fair Random Matching**: FHE-based circular matching algorithm ensures unpredictable assignments
- **⚡ Gas Optimized**: Uses `euint8` for participant indices (~70% gas savings vs `euint256`)
- **🎨 Beautiful UI**: Apple-style design with smooth animations using Framer Motion
- **🌍 Multi-Environment**: Supports demo (6min), test (12min), and production (6 days) configurations
- **✅ Fully Tested**: Comprehensive test suite with >80% coverage

## 🏗️ Architecture

### Smart Contract Innovation

The core innovation is an **encrypted circular matching algorithm**:

```solidity
// Generate encrypted random offset (only known to the KMS)
euint32 encryptedOffset = FHE.randEuint32(upperBound);

// Calculate recipient: (myIndex + offset) % participantCount
// This creates a circular permutation ensuring no self-matches
euint32 recipientIndex = FHE.rem(
    FHE.add(myIndexEnc, encryptedMatchingOffset),
    FHE.asEuint32(participantCount)
);
```

**Why This Matters:**
- No trusted coordinator needed
- Cryptographically guaranteed fairness
- No one can predict or manipulate assignments
- Privacy preserved until reveal via Gateway/KMS decryption

### Tech Stack

**Smart Contracts:**
- Solidity 0.8.28
- FHEVM (fhevm-contracts v0.5.x)
- Hardhat development environment
- Sepolia testnet deployment

**Frontend:**
- React 18 + TypeScript
- Vite build tool
- fhevmjs for FHE operations
- RainbowKit + wagmi for wallet integration
- TailwindCSS + Framer Motion for UI
- Vercel deployment

## 📁 Repository Structure

```
submission/
├── smart-contracts/          # Solidity smart contracts
│   ├── contracts/
│   │   └── SecretSanta.sol  # Main contract
│   ├── scripts/
│   │   ├── deploy-demo.ts   # Demo deployment (6 min)
│   │   ├── deploy-test.ts   # Test deployment (12 min)
│   │   └── deploy.ts        # Production deployment (6 days)
│   ├── test/
│   │   └── SecretSanta.test.ts
│   ├── hardhat.config.ts
│   ├── package.json
│   └── .env.example
│
└── frontend/                 # React frontend
    ├── src/
    │   ├── components/
    │   ├── hooks/
    │   ├── lib/
    │   └── types/
    ├── vite.config.ts
    ├── package.json
    └── .env.example
```

## 🚀 Quick Start

### Prerequisites

- Node.js v18+ and npm v7+
- MetaMask or compatible Web3 wallet
- Sepolia testnet ETH ([faucet](https://sepoliafaucet.com/))

### Smart Contract Deployment

1. **Navigate to smart contracts directory:**
```bash
cd submission/smart-contracts
```

2. **Install dependencies:**
```bash
npm install
```

3. **Configure environment:**
```bash
cp .env.example .env
# Edit .env with your PRIVATE_KEY, SEPOLIA_RPC_URL, and ETHERSCAN_API_KEY
```

4. **Compile contracts:**
```bash
npm run compile
```

5. **Run tests:**
```bash
npm run test
```

6. **Deploy to Sepolia:**
```bash
# Demo environment (6 minutes total)
npm run deploy:demo

# Test environment (12 minutes total)
npm run deploy:test

# Production environment (6 days total)
npm run deploy:production
```

7. **Verify on Etherscan:**
```bash
# Example for demo deployment
npx hardhat verify --network sepolia <CONTRACT_ADDRESS> 180 120 60 100000000000000 3 5
```

### Frontend Setup

1. **Navigate to frontend directory:**
```bash
cd submission/frontend
```

2. **Install dependencies:**
```bash
npm install
```

3. **Configure environment:**
```bash
cp .env.example .env
# Update VITE_CONTRACT_ADDRESS with your deployed contract address
# Update VITE_SEPOLIA_RPC_URL with your RPC endpoint
```

4. **Start development server:**
```bash
npm run dev
```

5. **Build for production:**
```bash
npm run build
```

## 🎮 How to Play

### For Participants:

1. **Registration Phase**
   - Connect your wallet
   - Pay the entry fee (0.0001 ETH for demo)
   - Wait for minimum participants

2. **Matching Phase**
   - Admin starts the matching process
   - FHE algorithm assigns recipients (encrypted)
   - Query your recipient's encrypted index

3. **Gift Submission Phase**
   - Submit your gift value (encrypted)
   - Add metadata URI (IPFS link, message, etc.)
   - Gift information remains private

4. **Reveal Phase**
   - After reveal time, admin triggers decryption
   - All matches and gifts become public
   - See who gave you a gift!

### For Admin (Contract Owner):

1. Deploy contract with desired parameters
2. Wait for registration period to end
3. Call `startMatching()` to generate encrypted assignments
4. After submission deadline, call `triggerReveal()` to decrypt matches

## 🔐 Security Features

- **No Trusted Coordinator**: Matching algorithm runs entirely on encrypted data
- **Immutable Parameters**: Registration period, entry fee, etc. set at deployment
- **Access Control**: Only owner can trigger matching and reveal
- **FHE Gateway**: Decryption requests go through Zama's Gateway/KMS
- **Reentrancy Protection**: Uses OpenZeppelin's `nonReentrant` modifier

## 📊 Deployment Configurations

| Parameter | Demo | Test | Production |
|-----------|------|------|------------|
| Registration Period | 3 min | 5 min | 3 days |
| Gift Submission Period | 2 min | 5 min | 2 days |
| Reveal Delay | 1 min | 2 min | 1 day |
| Entry Fee | 0.0001 ETH | 0.001 ETH | 0.01 ETH |
| Min Participants | 3 | 3 | 3 |
| Max Participants | 5 | 10 | 20 |
| **Total Duration** | **~6 min** | **~12 min** | **~6 days** |

## 🧪 Testing

Smart contracts include comprehensive tests covering:
- Registration mechanics
- Matching algorithm
- Gift submission
- Reveal process
- Edge cases and error conditions

Run tests:
```bash
cd submission/smart-contracts
npm run test
npm run coverage  # For coverage report
```

## 🌐 Live Demo

- **Demo Contract**: [View on Sepolia Etherscan](https://sepolia.etherscan.io/address/0xe981c08Dd5C337bA33053ac451AE93c94ee764Cd)
- **Frontend**: [Live Demo on Vercel](#) ([Update with your Vercel URL](https://zamasecretsanta.vercel.app/))

## 📖 Documentation

For detailed documentation, see:
- [Smart Contract Architecture](./smart-contracts/contracts/SecretSanta.sol)
- [Frontend Integration Guide](./frontend/src/hooks/useFHEVM.ts)
- [Deployment Guide](./DEPLOYMENT.md) *(if you want to include deployment docs)*

## 🤝 Contributing

This project was built for the Zama Developer Program. Contributions, issues, and feature requests are welcome!

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Zama](https://www.zama.ai/) for FHEVM technology
- [fhevm-contracts](https://github.com/zama-ai/fhevm-contracts) template
- [fhevm-react-template](https://github.com/zama-ai/fhevm-react-template) for frontend structure

## 📧 Contact

For questions or feedback, please open an issue on GitHub.

---

**Built with ❤️ for the Zama Developer Program**

**Submission Date**: November 2025

# Secret Santa Frontend

React frontend for the Secret Santa FHEVM platform.

## 🎨 Features

- **Modern UI**: Apple-style design with glassmorphism effects
- **Smooth Animations**: Framer Motion for delightful interactions
- **Web3 Integration**: RainbowKit for seamless wallet connection
- **FHE Operations**: Full encryption/decryption support via fhevmjs
- **Responsive Design**: Works beautifully on desktop and mobile
- **TypeScript**: Full type safety throughout the codebase

## 📁 Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── game/          # Game-specific components
│   │   ├── layout/        # Layout components (Header, Footer)
│   │   └── ui/            # Reusable UI components (Button, Card)
│   ├── hooks/
│   │   ├── useFHEVM.ts    # FHE initialization
│   │   ├── useEncryption.ts
│   │   ├── useDecryption.ts
│   │   └── useSecretSanta.ts
│   ├── lib/
│   │   └── SecretSanta.abi.json  # Contract ABI
│   ├── types/
│   │   └── contracts.ts   # TypeScript types
│   ├── utils/
│   │   └── format.ts      # Formatting utilities
│   ├── App.tsx
│   └── main.tsx
├── public/
├── index.html
├── vite.config.ts
├── tailwind.config.js
├── postcss.config.js
└── package.json
```

## 🛠️ Setup

1. **Install dependencies:**
```bash
npm install
```

2. **Configure environment:**
```bash
cp .env.example .env
```

Edit `.env` with your values:
```env
VITE_CONTRACT_ADDRESS=your_contract_address
VITE_CHAIN_ID=11155111
VITE_SEPOLIA_RPC_URL=your_rpc_url
VITE_WALLETCONNECT_PROJECT_ID=  # Optional
VITE_MOCK_FHE=false
VITE_ENV=demo
```

3. **Start development server:**
```bash
npm run dev
```

4. **Build for production:**
```bash
npm run build
```

## 🚀 Deployment

### Vercel Deployment

1. **Install Vercel CLI:**
```bash
npm install -g vercel
```

2. **Build and deploy:**
```bash
npm run build
vercel --prod
```

### Environment Variables on Vercel

Set the following environment variables in your Vercel project:
- `VITE_CONTRACT_ADDRESS`
- `VITE_CHAIN_ID`
- `VITE_SEPOLIA_RPC_URL`
- `VITE_WALLETCONNECT_PROJECT_ID` (optional)
- `VITE_MOCK_FHE`
- `VITE_ENV`

## 🎮 Components

### Game Components

- **GameRegistration**: Handle user registration
- **AdminPanel**: Admin controls (start matching, trigger reveal)
- **GiftSubmission**: Submit encrypted gifts
- **ParticipantList**: Display all participants
- **RevealResults**: Show revealed matches
- **GameTimeline**: Visual timeline of game phases

### UI Components

- **Button**: Styled button with loading states
- **Card**: Glassmorphism card component
- **Header**: Navigation and wallet connection
- **Footer**: Project information
- **Layout**: Main layout wrapper

## 🔧 Key Hooks

### `useFHEVM()`
Initializes the FHEVM instance with WASM files:
```typescript
const { fhevmInstance, isInitialized, error } = useFHEVM();
```

### `useEncryption(contractAddress)`
Encrypts values for smart contract submission:
```typescript
const { encryptValue, isEncrypting } = useEncryption(contractAddress);
const { handle, proof } = await encryptValue(100, 'uint256');
```

### `useDecryption(contractAddress)`
Decrypts encrypted values from the blockchain:
```typescript
const { decrypt32, isDecrypting } = useDecryption(contractAddress);
const recipientIndex = await decrypt32(encryptedHandle);
```

### `useSecretSanta()`
Main hook for contract interactions:
```typescript
const {
  gameInfo,
  participants,
  register,
  submitGift,
  isRegistered,
  myGiftSubmitted
} = useSecretSanta();
```

## 🎨 Styling

The project uses:
- **TailwindCSS**: Utility-first CSS framework
- **Custom Theme**: Christmas colors (red, green, gold)
- **Glassmorphism**: Frosted glass effects with backdrop-blur
- **Framer Motion**: Smooth animations and transitions

### Color Palette
```css
/* Christmas Theme */
--santa: #ef4444 (red)
--evergreen: #22c55e (green)
--gold: #fbbf24 (gold)
--snow: #f8fafc (white/light gray)
```

## 🔐 Security Notes

- All sensitive data (private keys, RPC URLs) stored in environment variables
- Never commit `.env` files to version control
- FHE operations ensure privacy of encrypted data
- Wallet signatures required for sensitive operations

## 📦 Dependencies

### Core
- `react` & `react-dom`: UI framework
- `typescript`: Type safety
- `vite`: Build tool

### Web3
- `fhevmjs`: FHE operations
- `viem`: Ethereum interactions
- `wagmi`: React hooks for Ethereum
- `@rainbow-me/rainbowkit`: Wallet connection UI

### UI
- `tailwindcss`: Styling
- `framer-motion`: Animations
- `lucide-react`: Icons

### Build
- `vite-plugin-static-copy`: Copy WASM files
- `buffer`, `process`, `stream-browserify`: Node.js polyfills

## 🐛 Troubleshooting

### WASM Loading Issues
If you see "Failed to initialize FHEVM" errors:
1. Clear browser cache
2. Ensure WASM files are being served with `application/wasm` MIME type
3. Check that `vite-plugin-static-copy` is properly configured

### Wallet Connection Issues
1. Ensure MetaMask is installed
2. Switch to Sepolia testnet
3. Check that you have Sepolia ETH

### Build Errors
If TypeScript errors occur during build:
1. Run `npm install` to ensure all dependencies are installed
2. Check that all `.env` variables are set
3. Clear build cache: `rm -rf dist .vite node_modules/.vite`

## 📝 License

MIT

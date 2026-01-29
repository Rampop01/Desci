# DSDM Smart Contracts

Smart contracts for the Decentralized Scientific Dataset Marketplace.

## Contracts

### DatasetNFT.sol
ERC-721 NFT contract representing ownership of scientific datasets.

Features:
- Mint dataset ownership NFTs with SHA-256 hash verification
- Store IPFS content hashes for decentralized data storage
- Verify dataset authenticity against stored hashes
- Standard ERC-721 functionality (transfer, approve, etc.)

### DatasetMarketplace.sol
Marketplace contract for licensing scientific datasets.

Features:
- List datasets for licensing (not transferring ownership)
- Purchase licenses with ETH
- Support for Research and Commercial license types
- 2.5% platform fee (configurable)
- Track all licensees per dataset
- Reentrancy protection

## Deployment

### Prerequisites

1. Install dependencies:
```bash
cd contracts
npm install
```

2. Create a `.env` file:
```bash
# Your private key (without 0x prefix)
PRIVATE_KEY=your_private_key_here

# RPC URLs
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
MUMBAI_RPC_URL=https://polygon-mumbai.infura.io/v3/YOUR_INFURA_KEY

# For contract verification
ETHERSCAN_API_KEY=your_etherscan_api_key
POLYGONSCAN_API_KEY=your_polygonscan_api_key
```

### Deploy to Local Network

1. Start a local Hardhat node:
```bash
npm run node
```

2. In another terminal, deploy:
```bash
npm run deploy:local
```

### Deploy to Sepolia Testnet

1. Get Sepolia ETH from a faucet:
   - https://sepoliafaucet.com/
   - https://faucet.sepolia.dev/

2. Deploy:
```bash
npm run deploy:sepolia
```

### Deploy to Polygon Mumbai

1. Get MATIC from a faucet:
   - https://faucet.polygon.technology/

2. Deploy:
```bash
npm run deploy:mumbai
```

## After Deployment

After deploying, you'll see output like:
```
NEXT_PUBLIC_DATASET_NFT_ADDRESS=0x...
NEXT_PUBLIC_MARKETPLACE_ADDRESS=0x...
```

Add these to your Next.js app's environment variables:

1. For local development, add to `.env.local`:
```
NEXT_PUBLIC_DATASET_NFT_ADDRESS=0x...
NEXT_PUBLIC_MARKETPLACE_ADDRESS=0x...
```

2. For Vercel deployment, add as environment variables in the Vercel dashboard.

## Testing

```bash
npm test
```

## Contract Addresses (Example)

| Network | DatasetNFT | Marketplace |
|---------|-----------|-------------|
| Sepolia | TBD | TBD |
| Mumbai | TBD | TBD |

## License

MIT

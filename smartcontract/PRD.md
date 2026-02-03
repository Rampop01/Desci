# Product Requirements Document (PRD)

## Product Name
Decentralized Scientific Dataset Marketplace (DSDM)

## Product Category
Web3 / Science Infrastructure / Data Economy
## Target Context
Hackathon MVP (48–72 hours)
## Problem Statement
Scientific and research datasets are valuable assets, but today they are:
- shared without clear ownership attribution
- reused without proper consent or licensing
- monetized by intermediaries, not creators
- difficult to track once published
Researchers lack transparent tools to prove ownership, control access, and receive fair compensation for their datasets.
## Solution Overview
The Decentralized Scientific Dataset Marketplace enables researchers to own, license, and monetize datasets using blockchain-based ownership and access control.
Datasets are stored off-chain, while ownership, licensing terms, and access permissions are enforced on-chain using NFTs and smart contracts.
## Goals
- Establish verifiable ownership of datasets
- Enable programmable dataset licensing
- Provide transparent access control
- Incentivize high-quality data creation
## Non-Goals
- Hosting large datasets on-chain
- Replacing institutional repositories
- Automated data labeling or cleaning
- Complex legal enforcement in MVP
## Target Users
### Primary
- Independent researchers
- Academic labs
- Data scientists
### Secondary
- AI researchers
- Startups
- Educational institutions
## Core Features
1. Dataset Ownership NFT
- Each dataset is represented by an NFT
- NFT proves ownership and authorship
- Metadata includes dataset description, hash, and license type
2. Dataset Listing Marketplace
- Researchers list datasets
- Public metadata preview
- License type displayed clearly
3. Licensing & Access Control (MVP)
- Supported licenses:
- Research-only use
- Commercial use
#### Smart contracts enforce:
- Payment before access
- License visibility
4. Access Request Flow
- Buyer requests access
- Payment executed via smart contract
- Access granted (off-chain delivery)
5. Creator Dashboard
- View listed datasets
- Track purchases
- Monitor access status
## User Flows
### Flow 1: Publish Dataset
- Creator uploads dataset to off-chain storage
- Dataset hash generated
- Ownership NFT minted
- Dataset listed with license terms
### Flow 2: Discover Dataset
- Buyer browses marketplace
- Views dataset metadata
- Selects license type
### Flow 3: Purchase Access
- Buyer pays license fee
- Smart contract records access permission
- Buyer receives dataset access link
## Functional Requirements
### Smart Contracts
- Dataset ownership NFT
- Marketplace contract
- License enforcement logic
- Payment handling
### Frontend
- Dataset listing page
- Creator dashboard
- Buyer access dashboard
- Wallet connection
## Technical Architecture
```text
Researcher
   ↓
Ownership NFT + License Contract
   ↓
Marketplace UI
   ↓
Buyer
```

## Security & Privacy Considerations
- Datasets stored off-chain
- Only hashes stored on-chain
- No personal data exposed
- Clear license visibility
## Success Metrics (Hackathon)
- Dataset NFT successfully minted
- Dataset purchased with license
- Access granted post-payment
- Clear demo end-to-end flow
## Demo Scenario
"A researcher publishes a dataset and licenses it for research-only use. A buyer purchases access and receives permission transparently."
## Future Enhancements
Revenue sharing for contributors
DAO-based dataset curation
Usage tracking
Citation incentives
## Risks & Mitigations
Adoption risk: start with niche datasets
Legal ambiguity: license as informational in MVP
Scope creep: restrict to 1–2 license types
## Conclusion
The Decentralized Scientific Dataset Marketplace introduces ownership, transparency, and fair incentives into scientific data sharing. By separating storage from control, it enables a more open and ethical data economy while remaining feasible for a hackathon MVP
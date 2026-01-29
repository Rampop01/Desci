// Data store for DSDM platform
// Supports both mock mode (for demo) and contract mode (real blockchain)

import { isContractMode, type DatasetMetadata, type Purchase } from "./contracts"
import * as contractService from "./contract-service"

// Sample datasets for demo/mock mode
const sampleDatasets: DatasetMetadata[] = [
  {
    id: "1",
    tokenId: 1,
    title: "COVID-19 Genomic Sequences Dataset",
    description:
      "Comprehensive collection of SARS-CoV-2 genomic sequences from 50+ countries, including metadata on variants, collection dates, and geographic distribution. Ideal for epidemiological research and variant tracking.",
    datasetHash: "0x7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069",
    ipfsHash: "bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi",
    licenseType: "research",
    price: "0.05",
    owner: "0x742d35Cc6634C0532925a3b844Bc9e7595f000aB",
    createdAt: Date.now() - 86400000 * 30,
    fileType: "json",
    fileSize: 15728640,
    purchaseCount: 12,
  },
  {
    id: "2",
    tokenId: 2,
    title: "Climate Sensor Network Data 2020-2024",
    description:
      "High-resolution temperature, humidity, and atmospheric pressure readings from 1,200 global sensor stations. Includes daily averages and anomaly detection markers for climate modeling.",
    datasetHash: "0x3e23e8160039594a33894f6564e1b1348bbd7a0088d42c4acb73eeaed59c009d",
    ipfsHash: "bafybeihkoviema7g3gxyt6la7vd5ho32bshgpclmsmvgyxlldilqcxk3vi",
    licenseType: "commercial",
    price: "0.15",
    owner: "0x8ba1f109551bD432803012645Hc136dcc5579Dd",
    createdAt: Date.now() - 86400000 * 15,
    fileType: "csv",
    fileSize: 52428800,
    purchaseCount: 8,
  },
  {
    id: "3",
    tokenId: 3,
    title: "Protein Folding Simulation Results",
    description:
      "Machine learning-generated protein structure predictions for 10,000 proteins with confidence scores. Compatible with AlphaFold and RoseTTAFold analysis pipelines.",
    datasetHash: "0x2c624232cdd221771294dfbb310aca000a0df6ac8b66b696d90ef06fdefb1dfa",
    ipfsHash: "bafybeiczsscdsbs7ffqz55asqdf3smv6klcw3gofszvwlyarci47bgf354",
    licenseType: "research",
    price: "0.08",
    owner: "0x1CBd3b2770909D4e10f157caBc84C7264073C9Ec",
    createdAt: Date.now() - 86400000 * 7,
    fileType: "json",
    fileSize: 31457280,
    purchaseCount: 23,
  },
  {
    id: "4",
    tokenId: 4,
    title: "Neural Activity Recordings Dataset",
    description:
      "Multi-electrode array recordings from 500 neurons during cognitive tasks. Includes spike train data, local field potentials, and behavioral annotations for neuroscience research.",
    datasetHash: "0x4e07408562bedb8b60ce05c1decfe3ad16b72230967de01f640b7e4729b49fce",
    ipfsHash: "bafybeihdwdcefgh4dqkjv67uzcmw7ojee6xedzdetojuzjevtenxquvyku",
    licenseType: "research",
    price: "0.12",
    owner: "0x742d35Cc6634C0532925a3b844Bc9e7595f000aB",
    createdAt: Date.now() - 86400000 * 3,
    fileType: "csv",
    fileSize: 78643200,
    purchaseCount: 5,
  },
]

const samplePurchases: Purchase[] = [
  {
    id: "p1",
    datasetId: "1",
    buyer: "0xDef1C0ded9bec7F1a1670819833240f027b25EfF",
    purchasedAt: Date.now() - 86400000 * 5,
    transactionHash: "0xabc123def456789012345678901234567890123456789012345678901234567890",
  },
  {
    id: "p2",
    datasetId: "3",
    buyer: "0xDef1C0ded9bec7F1a1670819833240f027b25EfF",
    purchasedAt: Date.now() - 86400000 * 2,
    transactionHash: "0xdef456abc789012345678901234567890123456789012345678901234567890abc",
  },
]

// In-memory store for mock mode
let datasets: DatasetMetadata[] = [...sampleDatasets]
let purchases: Purchase[] = [...samplePurchases]
let nextTokenId = 5

// ========== Read Functions ==========

export function getAllDatasets(): DatasetMetadata[] {
  return datasets
}

export function getDatasetById(id: string): DatasetMetadata | undefined {
  return datasets.find((d) => d.id === id)
}

export function getDatasetByTokenId(tokenId: number): DatasetMetadata | undefined {
  return datasets.find((d) => d.tokenId === tokenId)
}

export function getDatasetsByOwner(owner: string): DatasetMetadata[] {
  return datasets.filter((d) => d.owner.toLowerCase() === owner.toLowerCase())
}

export function getPurchasesByBuyer(buyer: string): Purchase[] {
  return purchases.filter((p) => p.buyer.toLowerCase() === buyer.toLowerCase())
}

export function getPurchasedDatasets(buyer: string): DatasetMetadata[] {
  const buyerPurchases = getPurchasesByBuyer(buyer)
  const purchasedIds = new Set(buyerPurchases.map((p) => p.datasetId))
  return datasets.filter((d) => purchasedIds.has(d.id))
}

export function hasPurchased(datasetId: string, buyer: string): boolean {
  return purchases.some(
    (p) => p.datasetId === datasetId && p.buyer.toLowerCase() === buyer.toLowerCase()
  )
}

export function getEarningsByOwner(owner: string): { total: number; purchaseCount: number } {
  const ownerDatasets = getDatasetsByOwner(owner)
  const total = ownerDatasets.reduce(
    (sum, d) => sum + d.purchaseCount * Number.parseFloat(d.price),
    0
  )
  const purchaseCount = ownerDatasets.reduce((sum, d) => sum + d.purchaseCount, 0)
  return { total, purchaseCount }
}

// ========== Write Functions (Mock Mode) ==========

export function addDataset(
  dataset: Omit<DatasetMetadata, "id" | "tokenId" | "createdAt" | "purchaseCount">
): DatasetMetadata {
  const newDataset: DatasetMetadata = {
    ...dataset,
    id: String(nextTokenId),
    tokenId: nextTokenId,
    createdAt: Date.now(),
    purchaseCount: 0,
  }
  nextTokenId++
  datasets = [newDataset, ...datasets]
  return newDataset
}

export function addDatasetWithTokenId(
  tokenId: number,
  dataset: Omit<DatasetMetadata, "id" | "tokenId" | "createdAt" | "purchaseCount">
): DatasetMetadata {
  const newDataset: DatasetMetadata = {
    ...dataset,
    id: String(tokenId),
    tokenId,
    createdAt: Date.now(),
    purchaseCount: 0,
  }
  if (tokenId >= nextTokenId) {
    nextTokenId = tokenId + 1
  }
  datasets = [newDataset, ...datasets]
  return newDataset
}

export function purchaseDataset(datasetId: string, buyer: string): Purchase {
  const dataset = getDatasetById(datasetId)
  if (!dataset) {
    throw new Error("Dataset not found")
  }

  if (hasPurchased(datasetId, buyer)) {
    throw new Error("Already purchased")
  }

  const purchase: Purchase = {
    id: `p${Date.now()}`,
    datasetId,
    buyer,
    purchasedAt: Date.now(),
    transactionHash: `0x${Array.from(crypto.getRandomValues(new Uint8Array(32)))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("")}`,
  }

  datasets = datasets.map((d) =>
    d.id === datasetId ? { ...d, purchaseCount: d.purchaseCount + 1 } : d
  )

  purchases = [...purchases, purchase]
  return purchase
}

export function addPurchase(purchase: Purchase): void {
  purchases = [...purchases, purchase]
  // Update dataset purchase count
  datasets = datasets.map((d) =>
    d.id === purchase.datasetId ? { ...d, purchaseCount: d.purchaseCount + 1 } : d
  )
}

// ========== Contract Mode Functions ==========

export async function mintAndListDataset(params: {
  title: string
  description: string
  datasetHash: string
  ipfsHash: string
  licenseType: "research" | "commercial"
  price: string
  owner: string
  fileType: "csv" | "json"
  fileSize: number
}): Promise<{ dataset: DatasetMetadata; transactionHash: string }> {
  if (!isContractMode()) {
    // Mock mode - simulate delay and add to local store
    await new Promise((resolve) => setTimeout(resolve, 2000))
    const dataset = addDataset(params)
    return {
      dataset,
      transactionHash: `0x${Array.from(crypto.getRandomValues(new Uint8Array(32)))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("")}`,
    }
  }

  // Contract mode - mint NFT and list on marketplace
  // Create metadata URI (in production, upload to IPFS)
  const metadataURI = `ipfs://${params.ipfsHash}/metadata.json`

  // Step 1: Mint the NFT
  const mintResult = await contractService.mintDatasetNFT(
    params.datasetHash,
    params.ipfsHash,
    metadataURI
  )

  // Step 2: List on marketplace
  await contractService.listDataset({
    tokenId: mintResult.tokenId,
    priceInEth: params.price,
    licenseType: params.licenseType,
    title: params.title,
    description: params.description,
  })

  // Add to local cache
  const dataset = addDatasetWithTokenId(mintResult.tokenId, params)

  return {
    dataset,
    transactionHash: mintResult.transactionHash,
  }
}

export async function purchaseDatasetLicense(
  datasetId: string,
  buyer: string
): Promise<{ purchase: Purchase; transactionHash: string }> {
  const dataset = getDatasetById(datasetId)
  if (!dataset) {
    throw new Error("Dataset not found")
  }

  if (!isContractMode()) {
    // Mock mode
    await new Promise((resolve) => setTimeout(resolve, 2500))
    const purchase = purchaseDataset(datasetId, buyer)
    return { purchase, transactionHash: purchase.transactionHash }
  }

  // Contract mode - purchase license
  const result = await contractService.purchaseLicense(dataset.tokenId, dataset.price)

  const purchase: Purchase = {
    id: `p${Date.now()}`,
    datasetId,
    buyer,
    purchasedAt: Date.now(),
    transactionHash: result.transactionHash,
  }

  addPurchase(purchase)

  return { purchase, transactionHash: result.transactionHash }
}

export async function checkDatasetAccess(datasetId: string, userAddress: string): Promise<boolean> {
  const dataset = getDatasetById(datasetId)
  if (!dataset) return false

  // Check if owner
  if (dataset.owner.toLowerCase() === userAddress.toLowerCase()) return true

  if (!isContractMode()) {
    // Mock mode - check local purchases
    return hasPurchased(datasetId, userAddress)
  }

  // Contract mode - check on-chain
  return contractService.checkAccess(dataset.tokenId, userAddress)
}

// ========== Utility Functions ==========

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`
}

export function shortenAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

export function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

export function isUsingContracts(): boolean {
  return isContractMode()
}

// Contract interaction service using ethers.js
// This handles all blockchain interactions for the DSDM platform

import { BrowserProvider, Contract, parseEther, formatEther } from "ethers"
import {
  DATASET_NFT_ABI,
  MARKETPLACE_ABI,
  CONTRACT_ADDRESSES,
  LICENSE_TYPE_MAP,
  isContractMode,
  type LicenseType,
} from "./contracts"

// Get provider from MetaMask
export function getProvider(): BrowserProvider | null {
  if (typeof window === "undefined" || !window.ethereum) {
    return null
  }
  return new BrowserProvider(window.ethereum)
}

// Get signer for transactions
export async function getSigner() {
  const provider = getProvider()
  if (!provider) throw new Error("No provider available")
  return provider.getSigner()
}

// Get contract instances
export async function getDatasetNFTContract(withSigner = false) {
  if (!isContractMode()) throw new Error("Contracts not deployed")

  const provider = getProvider()
  if (!provider) throw new Error("No provider available")

  if (withSigner) {
    const signer = await getSigner()
    return new Contract(CONTRACT_ADDRESSES.datasetNFT, DATASET_NFT_ABI, signer)
  }
  return new Contract(CONTRACT_ADDRESSES.datasetNFT, DATASET_NFT_ABI, provider)
}

export async function getMarketplaceContract(withSigner = false) {
  if (!isContractMode()) throw new Error("Contracts not deployed")

  const provider = getProvider()
  if (!provider) throw new Error("No provider available")

  if (withSigner) {
    const signer = await getSigner()
    return new Contract(CONTRACT_ADDRESSES.marketplace, MARKETPLACE_ABI, signer)
  }
  return new Contract(CONTRACT_ADDRESSES.marketplace, MARKETPLACE_ABI, provider)
}

// ========== NFT Contract Functions ==========

export interface MintResult {
  tokenId: number
  transactionHash: string
}

/**
 * Mint a new dataset NFT
 */
export async function mintDatasetNFT(
  datasetHash: string,
  ipfsHash: string,
  metadataURI: string
): Promise<MintResult> {
  const contract = await getDatasetNFTContract(true)
  const signer = await getSigner()
  const address = await signer.getAddress()

  const tx = await contract.mintDatasetNFT(address, datasetHash, ipfsHash, metadataURI)
  const receipt = await tx.wait()

  // Parse the DatasetMinted event to get the token ID
  const event = receipt.logs.find(
    (log: { fragment?: { name: string } }) => log.fragment?.name === "DatasetMinted"
  )

  let tokenId = 0
  if (event && "args" in event) {
    tokenId = Number(event.args[0])
  } else {
    // Fallback: get current token ID - 1
    const currentId = await contract.getCurrentTokenId()
    tokenId = Number(currentId) - 1
  }

  return {
    tokenId,
    transactionHash: receipt.hash,
  }
}

/**
 * Get the owner of a token
 */
export async function getTokenOwner(tokenId: number): Promise<string> {
  const contract = await getDatasetNFTContract()
  return contract.ownerOf(tokenId)
}

/**
 * Get the dataset hash for a token
 */
export async function getDatasetHash(tokenId: number): Promise<string> {
  const contract = await getDatasetNFTContract()
  return contract.getDatasetHash(tokenId)
}

/**
 * Get the IPFS hash for a token
 */
export async function getIPFSHash(tokenId: number): Promise<string> {
  const contract = await getDatasetNFTContract()
  return contract.getIPFSHash(tokenId)
}

/**
 * Verify a dataset hash matches the stored hash
 */
export async function verifyDataset(tokenId: number, hash: string): Promise<boolean> {
  const contract = await getDatasetNFTContract()
  return contract.verifyDataset(tokenId, hash)
}

/**
 * Get total number of tokens minted
 */
export async function getTotalMinted(): Promise<number> {
  const contract = await getDatasetNFTContract()
  const total = await contract.totalMinted()
  return Number(total)
}

// ========== Marketplace Contract Functions ==========

export interface ListDatasetParams {
  tokenId: number
  priceInEth: string
  licenseType: LicenseType
  title: string
  description: string
}

/**
 * List a dataset for licensing on the marketplace
 */
export async function listDataset(params: ListDatasetParams): Promise<string> {
  const contract = await getMarketplaceContract(true)

  const priceWei = parseEther(params.priceInEth)
  const licenseTypeNum = LICENSE_TYPE_MAP[params.licenseType]

  const tx = await contract.listDataset(
    params.tokenId,
    priceWei,
    licenseTypeNum,
    params.title,
    params.description
  )
  const receipt = await tx.wait()
  return receipt.hash
}

/**
 * Remove a dataset listing
 */
export async function delistDataset(tokenId: number): Promise<string> {
  const contract = await getMarketplaceContract(true)
  const tx = await contract.delistDataset(tokenId)
  const receipt = await tx.wait()
  return receipt.hash
}

/**
 * Update the price of a listing
 */
export async function updateListingPrice(tokenId: number, newPriceInEth: string): Promise<string> {
  const contract = await getMarketplaceContract(true)
  const priceWei = parseEther(newPriceInEth)
  const tx = await contract.updatePrice(tokenId, priceWei)
  const receipt = await tx.wait()
  return receipt.hash
}

export interface PurchaseResult {
  transactionHash: string
  tokenId: number
  buyer: string
}

/**
 * Purchase a license for a dataset
 */
export async function purchaseLicense(tokenId: number, priceInEth: string): Promise<PurchaseResult> {
  const contract = await getMarketplaceContract(true)
  const signer = await getSigner()
  const buyer = await signer.getAddress()

  const priceWei = parseEther(priceInEth)

  const tx = await contract.purchaseLicense(tokenId, { value: priceWei })
  const receipt = await tx.wait()

  return {
    transactionHash: receipt.hash,
    tokenId,
    buyer,
  }
}

/**
 * Check if a user has access to a dataset (owner or licensee)
 */
export async function checkAccess(tokenId: number, userAddress: string): Promise<boolean> {
  const contract = await getMarketplaceContract()
  return contract.hasAccess(tokenId, userAddress)
}

/**
 * Check if a user has a license for a specific dataset
 */
export async function checkLicense(tokenId: number, userAddress: string): Promise<boolean> {
  const contract = await getMarketplaceContract()
  return contract.hasLicense(tokenId, userAddress)
}

export interface Listing {
  seller: string
  price: string // in ETH
  licenseType: LicenseType
  isActive: boolean
  title: string
  description: string
}

/**
 * Get listing details for a dataset
 */
export async function getListing(tokenId: number): Promise<Listing | null> {
  const contract = await getMarketplaceContract()

  try {
    const result = await contract.getListing(tokenId)
    const [seller, price, licenseType, isActive, title, description] = result

    if (!isActive) return null

    return {
      seller,
      price: formatEther(price),
      licenseType: licenseType === 0 ? "research" : "commercial",
      isActive,
      title,
      description,
    }
  } catch {
    return null
  }
}

/**
 * Get the number of licenses sold for a dataset
 */
export async function getLicenseCount(tokenId: number): Promise<number> {
  const contract = await getMarketplaceContract()
  const count = await contract.getLicenseCount(tokenId)
  return Number(count)
}

export interface License {
  tokenId: number
  buyer: string
  licenseType: LicenseType
  purchasedAt: number
  pricePaid: string // in ETH
}

/**
 * Get all licenses purchased by a buyer
 */
export async function getBuyerLicenses(buyerAddress: string): Promise<License[]> {
  const contract = await getMarketplaceContract()

  try {
    const licenses = await contract.getBuyerLicenses(buyerAddress)
    return licenses.map(
      (license: {
        tokenId: bigint
        buyer: string
        licenseType: number
        purchasedAt: bigint
        pricePaid: bigint
      }) => ({
        tokenId: Number(license.tokenId),
        buyer: license.buyer,
        licenseType: license.licenseType === 0 ? ("research" as const) : ("commercial" as const),
        purchasedAt: Number(license.purchasedAt) * 1000,
        pricePaid: formatEther(license.pricePaid),
      })
    )
  } catch {
    return []
  }
}

/**
 * Get all licensees for a dataset
 */
export async function getLicensees(tokenId: number): Promise<string[]> {
  const contract = await getMarketplaceContract()
  return contract.getLicensees(tokenId)
}

// ========== Utility Functions ==========

/**
 * Format wei to ETH string
 */
export function weiToEth(wei: bigint | string): string {
  return formatEther(typeof wei === "string" ? BigInt(wei) : wei)
}

/**
 * Parse ETH string to wei
 */
export function ethToWei(eth: string): bigint {
  return parseEther(eth)
}

/**
 * Wait for a transaction to be confirmed
 */
export async function waitForTransaction(txHash: string): Promise<boolean> {
  const provider = getProvider()
  if (!provider) return false

  try {
    const receipt = await provider.waitForTransaction(txHash)
    return receipt?.status === 1
  } catch {
    return false
  }
}

/**
 * Get the current block number
 */
export async function getCurrentBlock(): Promise<number> {
  const provider = getProvider()
  if (!provider) return 0
  return provider.getBlockNumber()
}

/**
 * Get ETH balance of an address
 */
export async function getEthBalance(address: string): Promise<string> {
  const provider = getProvider()
  if (!provider) return "0"
  const balance = await provider.getBalance(address)
  return formatEther(balance)
}

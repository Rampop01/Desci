// Mock IPFS implementation for MVP
// In production, this would use actual IPFS (Pinata, Infura, etc.)

export async function uploadToIPFS(file: File): Promise<{ hash: string; url: string }> {
  // Simulate upload delay
  await new Promise((resolve) => setTimeout(resolve, 1500))

  // Generate a mock IPFS hash (CIDv1 format)
  const randomBytes = new Uint8Array(32)
  crypto.getRandomValues(randomBytes)
  const hash = `bafybeig${Array.from(randomBytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
    .slice(0, 52)}`

  return {
    hash,
    url: `https://ipfs.io/ipfs/${hash}`,
  }
}

export async function generateFileHash(file: File): Promise<string> {
  const buffer = await file.arrayBuffer()
  const hashBuffer = await crypto.subtle.digest("SHA-256", buffer)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("")
  return `0x${hashHex}`
}

export function getIPFSUrl(hash: string): string {
  return `https://ipfs.io/ipfs/${hash}`
}

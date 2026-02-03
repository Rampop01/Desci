"use client"

import { use, useState } from "react"
import Link from "next/link"
import { useWeb3 } from "@/lib/web3-context"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
  getDatasetById,
  hasPurchased,
  purchaseDatasetLicense,
  formatFileSize,
  shortenAddress,
  formatDate,
} from "@/lib/store"
import { getIPFSUrl } from "@/lib/ipfs"
import {
  ArrowLeft,
  FileJson,
  FileSpreadsheet,
  Shield,
  Users,
  Calendar,
  Hash,
  Download,
  ExternalLink,
  Loader2,
  CheckCircle2,
  Wallet,
  AlertCircle,
} from "lucide-react"

interface PageProps {
  params: Promise<{ id: string }>
}

export default function DatasetDetailPage({ params }: PageProps) {
  const { id } = use(params)
  const { account, isConnected, connect, isConnecting } = useWeb3()
  const [isPurchasing, setIsPurchasing] = useState(false)
  const [purchaseComplete, setPurchaseComplete] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const dataset = getDatasetById(id)

  if (!dataset) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 text-center sm:px-6 lg:px-8">
        <h1 className="text-2xl font-semibold">Dataset Not Found</h1>
        <p className="mt-2 text-muted-foreground">
          The dataset you&apos;re looking for doesn&apos;t exist or has been removed.
        </p>
        <Button asChild className="mt-6">
          <Link href="/marketplace">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Marketplace
          </Link>
        </Button>
      </div>
    )
  }

  const isOwner = account?.toLowerCase() === dataset.owner.toLowerCase()
  const alreadyPurchased = account ? hasPurchased(dataset.id, account) : false
  const hasAccess = isOwner || alreadyPurchased || purchaseComplete

  const handlePurchase = async () => {
    if (!account) return

    setIsPurchasing(true)
    setError(null)

    try {
      // Use the unified purchase function (works in both mock and contract mode)
      await purchaseDatasetLicense(dataset.id, account)
      setPurchaseComplete(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Purchase failed")
    } finally {
      setIsPurchasing(false)
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Button asChild variant="ghost" className="mb-6">
        <Link href="/marketplace">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Marketplace
        </Link>
      </Button>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-secondary">
              {dataset.fileType === "json" ? (
                <FileJson className="h-7 w-7 text-primary" />
              ) : (
                <FileSpreadsheet className="h-7 w-7 text-primary" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant={dataset.licenseType === "research" ? "secondary" : "default"}>
                  {dataset.licenseType === "research" ? "Research Only" : "Commercial"}
                </Badge>
                {isOwner && (
                  <Badge variant="outline" className="border-primary text-primary">
                    You own this
                  </Badge>
                )}
                {alreadyPurchased && !isOwner && (
                  <Badge variant="outline" className="border-primary text-primary">
                    Licensed
                  </Badge>
                )}
              </div>
              <h1 className="mt-2 text-2xl font-bold sm:text-3xl text-balance">{dataset.title}</h1>
            </div>
          </div>

          <Separator className="my-6" />

          <div>
            <h2 className="text-lg font-semibold">Description</h2>
            <p className="mt-2 whitespace-pre-wrap text-muted-foreground text-pretty">
              {dataset.description}
            </p>
          </div>

          <Separator className="my-6" />

          <div>
            <h2 className="mb-4 text-lg font-semibold">Dataset Details</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex items-center gap-3 rounded-lg bg-secondary/50 p-4">
                <Hash className="h-5 w-5 text-muted-foreground" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-muted-foreground">File Type</p>
                  <p className="font-medium uppercase">{dataset.fileType}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-lg bg-secondary/50 p-4">
                <Shield className="h-5 w-5 text-muted-foreground" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-muted-foreground">File Size</p>
                  <p className="font-medium">{formatFileSize(dataset.fileSize)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-lg bg-secondary/50 p-4">
                <Users className="h-5 w-5 text-muted-foreground" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-muted-foreground">Licenses Sold</p>
                  <p className="font-medium">{dataset.purchaseCount}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-lg bg-secondary/50 p-4">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-muted-foreground">Published</p>
                  <p className="font-medium">{formatDate(dataset.createdAt)}</p>
                </div>
              </div>
            </div>
          </div>

          <Separator className="my-6" />

          <div>
            <h2 className="mb-4 text-lg font-semibold">Technical Information</h2>
            <div className="space-y-3 rounded-lg bg-secondary/50 p-4 font-mono text-sm">
              <div>
                <p className="text-xs text-muted-foreground">Dataset Hash (SHA-256)</p>
                <p className="truncate">{dataset.datasetHash}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">IPFS Content Hash</p>
                <p className="truncate">{dataset.ipfsHash}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">NFT Token ID</p>
                <p>#{dataset.tokenId}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-primary">{dataset.price}</span>
                <span className="text-lg text-muted-foreground">ETH</span>
              </CardTitle>
              <CardDescription>
                License fee for {dataset.licenseType === "research" ? "research" : "commercial"} use
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {hasAccess ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-primary">
                    <CheckCircle2 className="h-5 w-5" />
                    <span className="font-medium">You have access to this dataset</span>
                  </div>
                  <Button asChild className="w-full">
                    <a
                      href={getIPFSUrl(dataset.ipfsHash)}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Download from IPFS
                    </a>
                  </Button>
                  <Button asChild variant="outline" className="w-full bg-transparent">
                    <a
                      href={`https://ipfs.io/ipfs/${dataset.ipfsHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="mr-2 h-4 w-4" />
                      View on IPFS Gateway
                    </a>
                  </Button>
                </div>
              ) : !isConnected ? (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Connect your wallet to purchase a license for this dataset.
                  </p>
                  <Button onClick={connect} disabled={isConnecting} className="w-full">
                    <Wallet className="mr-2 h-4 w-4" />
                    {isConnecting ? "Connecting..." : "Connect Wallet"}
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <Button
                    onClick={handlePurchase}
                    disabled={isPurchasing}
                    className="w-full"
                    size="lg"
                  >
                    {isPurchasing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>Purchase License</>
                    )}
                  </Button>
                  {error && (
                    <div className="flex items-center gap-2 text-sm text-destructive">
                      <AlertCircle className="h-4 w-4" />
                      {error}
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground text-center">
                    Payment will be processed through the smart contract
                  </p>
                </div>
              )}

              <Separator />

              <div className="space-y-2">
                <p className="text-sm font-medium">Dataset Owner</p>
                <a
                  href={`https://etherscan.io/address/${dataset.owner}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 font-mono text-sm text-muted-foreground hover:text-foreground"
                >
                  {shortenAddress(dataset.owner)}
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

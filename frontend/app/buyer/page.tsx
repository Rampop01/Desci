"use client"

import Link from "next/link"
import { useWeb3 } from "@/lib/web3-context"
import { ConnectWalletPrompt } from "@/components/connect-wallet-prompt"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  getPurchasedDatasets,
  getPurchasesByBuyer,
  formatFileSize,
  formatDate,
  shortenAddress,
} from "@/lib/store"
import { getIPFSUrl } from "@/lib/ipfs"
import {
  Download,
  ExternalLink,
  FileJson,
  FileSpreadsheet,
  ShoppingBag,
  ArrowRight,
} from "lucide-react"

export default function BuyerDashboardPage() {
  const { account, isConnected } = useWeb3()

  if (!isConnected) {
    return (
      <ConnectWalletPrompt
        title="My Purchases"
        description="Connect your wallet to view your purchased dataset licenses and download links."
      />
    )
  }

  const purchasedDatasets = getPurchasedDatasets(account!)
  const purchases = getPurchasesByBuyer(account!)

  // Create a map of dataset ID to purchase info
  const purchaseMap = new Map(purchases.map((p) => [p.datasetId, p]))

  // Calculate total spent
  const totalSpent = purchasedDatasets.reduce(
    (sum, d) => sum + Number.parseFloat(d.price),
    0
  )

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">My Purchases</h1>
          <p className="mt-1 text-muted-foreground">
            Access your licensed datasets and download links
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/">
            Browse Marketplace
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <ShoppingBag className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{purchasedDatasets.length}</p>
              <p className="text-sm text-muted-foreground">Licensed Datasets</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <Download className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-primary">{totalSpent.toFixed(3)} ETH</p>
              <p className="text-sm text-muted-foreground">Total Spent</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Purchased Datasets */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold">Your Licensed Datasets</h2>
        {purchasedDatasets.length > 0 ? (
          <div className="mt-4 space-y-4">
            {purchasedDatasets.map((dataset) => {
              const purchase = purchaseMap.get(dataset.id)
              return (
                <Card key={dataset.id} className="overflow-hidden">
                  <CardContent className="p-0">
                    <div className="flex flex-col lg:flex-row">
                      {/* Dataset Info */}
                      <div className="flex flex-1 items-start gap-4 p-4 lg:p-6">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-secondary">
                          {dataset.fileType === "json" ? (
                            <FileJson className="h-6 w-6 text-primary" />
                          ) : (
                            <FileSpreadsheet className="h-6 w-6 text-primary" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-semibold">{dataset.title}</h3>
                            <Badge
                              variant={dataset.licenseType === "research" ? "secondary" : "default"}
                              className="text-xs"
                            >
                              {dataset.licenseType === "research" ? "Research" : "Commercial"}
                            </Badge>
                          </div>
                          <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                            {dataset.description}
                          </p>
                          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                            <span>{formatFileSize(dataset.fileSize)}</span>
                            <span className="uppercase">{dataset.fileType}</span>
                            <span>by {shortenAddress(dataset.owner)}</span>
                            {purchase && (
                              <span>Purchased {formatDate(purchase.purchasedAt)}</span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex shrink-0 flex-col gap-2 border-t border-border bg-secondary/30 p-4 lg:w-64 lg:border-l lg:border-t-0">
                        <p className="mb-1 text-sm font-medium">Download Dataset</p>
                        <Button asChild size="sm" className="w-full">
                          <a
                            href={getIPFSUrl(dataset.ipfsHash)}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Download className="mr-2 h-4 w-4" />
                            Download
                          </a>
                        </Button>
                        <Button asChild variant="outline" size="sm" className="w-full bg-transparent">
                          <a
                            href={`https://ipfs.io/ipfs/${dataset.ipfsHash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <ExternalLink className="mr-2 h-4 w-4" />
                            IPFS Gateway
                          </a>
                        </Button>
                        <Button asChild variant="ghost" size="sm" className="w-full">
                          <Link href={`/dataset/${dataset.id}`}>
                            View Details
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                    </div>

                    {/* Transaction Info */}
                    {purchase && (
                      <div className="border-t border-border bg-secondary/20 px-4 py-2 lg:px-6">
                        <div className="flex flex-wrap items-center justify-between gap-2 font-mono text-xs">
                          <span className="text-muted-foreground">
                            Tx: {shortenAddress(purchase.transactionHash)}
                          </span>
                          <a
                            href={`https://etherscan.io/tx/${purchase.transactionHash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-primary hover:underline"
                          >
                            View on Etherscan
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        ) : (
          <Card className="mt-4">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-secondary">
                <ShoppingBag className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="mt-4 text-lg font-medium">No purchases yet</h3>
              <p className="mt-1 text-center text-sm text-muted-foreground">
                Browse the marketplace to find datasets for your research.
              </p>
              <Button asChild className="mt-6">
                <Link href="/">
                  Browse Marketplace
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

"use client"

import Link from "next/link"
import { useWeb3 } from "@/lib/web3-context"
import { ConnectWalletPrompt } from "@/components/connect-wallet-prompt"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getDatasetsByOwner, getEarningsByOwner, formatFileSize, formatDate } from "@/lib/store"
import {
  Plus,
  Database,
  Coins,
  Users,
  TrendingUp,
  FileJson,
  FileSpreadsheet,
  ArrowRight,
  Package,
} from "lucide-react"

export default function CreatorDashboardPage() {
  const { account, isConnected } = useWeb3()

  if (!isConnected) {
    return (
      <ConnectWalletPrompt
        title="Creator Dashboard"
        description="Connect your wallet to view your published datasets and earnings."
      />
    )
  }

  const datasets = getDatasetsByOwner(account!)
  const earnings = getEarningsByOwner(account!)

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">Creator Dashboard</h1>
          <p className="mt-1 text-muted-foreground">
            Manage your published datasets and track earnings
          </p>
        </div>
        <Button asChild>
          <Link href="/publish">
            <Plus className="mr-2 h-4 w-4" />
            Publish Dataset
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Datasets
            </CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{datasets.length}</div>
            <p className="text-xs text-muted-foreground">Published on marketplace</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Earnings
            </CardTitle>
            <Coins className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{earnings.total.toFixed(3)} ETH</div>
            <p className="text-xs text-muted-foreground">From all license sales</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Licenses Sold
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{earnings.purchaseCount}</div>
            <p className="text-xs text-muted-foreground">Total purchases</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Avg. Price
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {datasets.length > 0
                ? (
                    datasets.reduce((sum, d) => sum + Number.parseFloat(d.price), 0) /
                    datasets.length
                  ).toFixed(3)
                : "0.000"}{" "}
              ETH
            </div>
            <p className="text-xs text-muted-foreground">Per dataset</p>
          </CardContent>
        </Card>
      </div>

      {/* Datasets List */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold">Your Datasets</h2>
        {datasets.length > 0 ? (
          <div className="mt-4 space-y-4">
            {datasets.map((dataset) => (
              <Card key={dataset.id} className="group transition-colors hover:border-primary/50">
                <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-start gap-4">
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
                      <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                        <span>{formatFileSize(dataset.fileSize)}</span>
                        <span>Published {formatDate(dataset.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-6 sm:gap-8">
                    <div className="text-center">
                      <p className="text-lg font-bold">{dataset.purchaseCount}</p>
                      <p className="text-xs text-muted-foreground">Sales</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold text-primary">
                        {(dataset.purchaseCount * Number.parseFloat(dataset.price)).toFixed(3)}
                      </p>
                      <p className="text-xs text-muted-foreground">ETH earned</p>
                    </div>
                    <Button asChild variant="ghost" size="icon">
                      <Link href={`/dataset/${dataset.id}`}>
                        <ArrowRight className="h-4 w-4" />
                        <span className="sr-only">View dataset</span>
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="mt-4">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-secondary">
                <Package className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="mt-4 text-lg font-medium">No datasets yet</h3>
              <p className="mt-1 text-center text-sm text-muted-foreground">
                Publish your first dataset to start earning from your research data.
              </p>
              <Button asChild className="mt-6">
                <Link href="/publish">
                  <Plus className="mr-2 h-4 w-4" />
                  Publish Your First Dataset
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

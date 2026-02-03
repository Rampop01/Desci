"use client"

import { useState, useMemo } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DatasetCard } from "@/components/dataset-card"
import { getAllDatasets } from "@/lib/store"
import { Search, Database, Shield, Zap } from "lucide-react"
import type { LicenseType } from "@/lib/contracts"

type FilterType = "all" | LicenseType

export default function MarketplacePage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [licenseFilter, setLicenseFilter] = useState<FilterType>("all")

  const datasets = getAllDatasets()

  const filteredDatasets = useMemo(() => {
    return datasets.filter((dataset) => {
      const matchesSearch =
        dataset.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        dataset.description.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesLicense = licenseFilter === "all" || dataset.licenseType === licenseFilter
      return matchesSearch && matchesLicense
    })
  }, [datasets, searchQuery, licenseFilter])

  return (
    <div className="pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-border bg-gradient-to-b from-secondary/50 to-background">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(74,222,128,0.08),transparent_50%)]" />
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
          <div className="relative">
            <Badge variant="outline" className="mb-4">
              Decentralized Scientific Data
            </Badge>
            <h1 className="max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl text-balance">
              Own, License & Share{" "}
              <span className="text-primary">Scientific Datasets</span>
            </h1>
            <p className="mt-6 max-w-2xl text-lg text-muted-foreground text-pretty">
              A decentralized marketplace where researchers publish datasets, prove ownership with
              NFTs, and license access using blockchain technology.
            </p>

            {/* Search Bar */}
            <div className="mt-8 flex max-w-xl gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search datasets..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Stats */}
            <div className="mt-12 flex flex-wrap gap-8">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Database className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{datasets.length}</p>
                  <p className="text-sm text-muted-foreground">Datasets</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Shield className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">NFT</p>
                  <p className="text-sm text-muted-foreground">Ownership</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Zap className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">IPFS</p>
                  <p className="text-sm text-muted-foreground">Storage</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Marketplace Section */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-semibold">Available Datasets</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Browse and license scientific datasets from researchers worldwide
            </p>
          </div>

          {/* Filter Buttons */}
          <div className="flex gap-2">
            <Button
              variant={licenseFilter === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setLicenseFilter("all")}
            >
              All
            </Button>
            <Button
              variant={licenseFilter === "research" ? "default" : "outline"}
              size="sm"
              onClick={() => setLicenseFilter("research")}
            >
              Research Only
            </Button>
            <Button
              variant={licenseFilter === "commercial" ? "default" : "outline"}
              size="sm"
              onClick={() => setLicenseFilter("commercial")}
            >
              Commercial
            </Button>
          </div>
        </div>

        {/* Dataset Grid */}
        {filteredDatasets.length > 0 ? (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredDatasets.map((dataset) => (
              <DatasetCard key={dataset.id} dataset={dataset} />
            ))}
          </div>
        ) : (
          <div className="mt-16 text-center">
            <Database className="mx-auto h-12 w-12 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-medium">No datasets found</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              {searchQuery
                ? "Try adjusting your search or filter criteria"
                : "Be the first to publish a dataset!"}
            </p>
          </div>
        )}
      </section>
    </div>
  )
}

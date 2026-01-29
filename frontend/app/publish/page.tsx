"use client"

import React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useWeb3 } from "@/lib/web3-context"
import { ConnectWalletPrompt } from "@/components/connect-wallet-prompt"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { uploadToIPFS, generateFileHash } from "@/lib/ipfs"
import { mintAndListDataset } from "@/lib/store"
import type { LicenseType } from "@/lib/contracts"
import {
  Upload,
  FileJson,
  FileSpreadsheet,
  CheckCircle2,
  Loader2,
  AlertCircle,
  Database,
  Shield,
  Coins,
} from "lucide-react"

type PublishStep = "upload" | "metadata" | "confirm" | "success"

interface FileData {
  file: File
  hash: string
  ipfsHash: string
  ipfsUrl: string
}

export default function PublishPage() {
  const router = useRouter()
  const { account, isConnected } = useWeb3()

  const [step, setStep] = useState<PublishStep>("upload")
  const [isUploading, setIsUploading] = useState(false)
  const [isPublishing, setIsPublishing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [fileData, setFileData] = useState<FileData | null>(null)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [licenseType, setLicenseType] = useState<LicenseType>("research")
  const [price, setPrice] = useState("")

  const [publishedDatasetId, setPublishedDatasetId] = useState<string | null>(null)

  if (!isConnected) {
    return (
      <ConnectWalletPrompt
        title="Connect to Publish"
        description="Connect your wallet to publish datasets and mint ownership NFTs."
      />
    )
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    const isJson = file.type === "application/json" || file.name.endsWith(".json")
    const isCsv = file.type === "text/csv" || file.name.endsWith(".csv")

    if (!isJson && !isCsv) {
      setError("Please upload a CSV or JSON file")
      return
    }

    setError(null)
    setIsUploading(true)

    try {
      // Generate file hash
      const hash = await generateFileHash(file)

      // Upload to IPFS
      const { hash: ipfsHash, url: ipfsUrl } = await uploadToIPFS(file)

      setFileData({
        file,
        hash,
        ipfsHash,
        ipfsUrl,
      })
      setStep("metadata")
    } catch {
      setError("Failed to upload file. Please try again.")
    } finally {
      setIsUploading(false)
    }
  }

  const handleMetadataSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !description.trim() || !price) {
      setError("Please fill in all fields")
      return
    }
    setError(null)
    setStep("confirm")
  }

  const handlePublish = async () => {
    if (!fileData || !account) return

    setIsPublishing(true)
    setError(null)

    try {
      // Use the unified mint and list function (works in both mock and contract mode)
      const { dataset } = await mintAndListDataset({
        title,
        description,
        datasetHash: fileData.hash,
        ipfsHash: fileData.ipfsHash,
        licenseType,
        price,
        owner: account,
        fileType: fileData.file.name.endsWith(".json") ? "json" : "csv",
        fileSize: fileData.file.size,
      })

      setPublishedDatasetId(dataset.id)
      setStep("success")
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to publish dataset"
      setError(message)
    } finally {
      setIsPublishing(false)
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {["Upload", "Details", "Confirm", "Complete"].map((label, index) => {
            const stepIndex = ["upload", "metadata", "confirm", "success"].indexOf(step)
            const isActive = index === stepIndex
            const isCompleted = index < stepIndex

            return (
              <div key={label} className="flex flex-1 items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-medium transition-colors ${
                      isCompleted
                        ? "bg-primary text-primary-foreground"
                        : isActive
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary text-muted-foreground"
                    }`}
                  >
                    {isCompleted ? <CheckCircle2 className="h-5 w-5" /> : index + 1}
                  </div>
                  <span
                    className={`mt-2 text-xs font-medium ${isActive || isCompleted ? "text-foreground" : "text-muted-foreground"}`}
                  >
                    {label}
                  </span>
                </div>
                {index < 3 && (
                  <div
                    className={`mx-2 h-0.5 flex-1 ${isCompleted ? "bg-primary" : "bg-border"}`}
                  />
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Step Content */}
      {step === "upload" && (
        <Card>
          <CardHeader>
            <CardTitle>Upload Dataset</CardTitle>
            <CardDescription>
              Upload your scientific dataset file (CSV or JSON format)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <label
              htmlFor="file-upload"
              className="group flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border p-12 transition-colors hover:border-primary/50 hover:bg-secondary/50"
            >
              {isUploading ? (
                <>
                  <Loader2 className="h-12 w-12 animate-spin text-primary" />
                  <p className="mt-4 text-sm font-medium">Uploading to IPFS...</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Generating hash and storing file
                  </p>
                </>
              ) : (
                <>
                  <Upload className="h-12 w-12 text-muted-foreground transition-colors group-hover:text-primary" />
                  <p className="mt-4 text-sm font-medium">
                    Drop your file here or click to browse
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Supports CSV and JSON files up to 100MB
                  </p>
                  <div className="mt-4 flex gap-4">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <FileSpreadsheet className="h-4 w-4" />
                      CSV
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <FileJson className="h-4 w-4" />
                      JSON
                    </div>
                  </div>
                </>
              )}
              <input
                id="file-upload"
                type="file"
                accept=".csv,.json,application/json,text/csv"
                onChange={handleFileSelect}
                className="sr-only"
                disabled={isUploading}
              />
            </label>
            {error && (
              <div className="mt-4 flex items-center gap-2 text-sm text-destructive">
                <AlertCircle className="h-4 w-4" />
                {error}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {step === "metadata" && fileData && (
        <Card>
          <CardHeader>
            <CardTitle>Dataset Details</CardTitle>
            <CardDescription>
              Provide information about your dataset for potential buyers
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-6 flex items-center gap-3 rounded-lg bg-secondary p-3">
              {fileData.file.name.endsWith(".json") ? (
                <FileJson className="h-8 w-8 text-primary" />
              ) : (
                <FileSpreadsheet className="h-8 w-8 text-primary" />
              )}
              <div className="flex-1 min-w-0">
                <p className="truncate font-medium">{fileData.file.name}</p>
                <p className="text-xs text-muted-foreground">
                  {(fileData.file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
              <CheckCircle2 className="h-5 w-5 text-primary" />
            </div>

            <form onSubmit={handleMetadataSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Dataset Title</Label>
                <Input
                  id="title"
                  placeholder="e.g., COVID-19 Genomic Sequences Dataset"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe your dataset, including methodology, size, and potential use cases..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  required
                />
              </div>

              <div className="space-y-3">
                <Label>License Type</Label>
                <RadioGroup
                  value={licenseType}
                  onValueChange={(value) => setLicenseType(value as LicenseType)}
                  className="grid gap-3 sm:grid-cols-2"
                >
                  <label
                    htmlFor="research"
                    className={`flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition-colors ${
                      licenseType === "research" ? "border-primary bg-primary/5" : "border-border"
                    }`}
                  >
                    <RadioGroupItem value="research" id="research" className="mt-0.5" />
                    <div>
                      <p className="font-medium">Research Only</p>
                      <p className="text-sm text-muted-foreground">
                        For academic and non-commercial research
                      </p>
                    </div>
                  </label>
                  <label
                    htmlFor="commercial"
                    className={`flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition-colors ${
                      licenseType === "commercial" ? "border-primary bg-primary/5" : "border-border"
                    }`}
                  >
                    <RadioGroupItem value="commercial" id="commercial" className="mt-0.5" />
                    <div>
                      <p className="font-medium">Commercial</p>
                      <p className="text-sm text-muted-foreground">
                        For commercial and business use
                      </p>
                    </div>
                  </label>
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label htmlFor="price">Price (ETH)</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.001"
                  min="0"
                  placeholder="0.05"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  required
                />
              </div>

              {error && (
                <div className="flex items-center gap-2 text-sm text-destructive">
                  <AlertCircle className="h-4 w-4" />
                  {error}
                </div>
              )}

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep("upload")}
                >
                  Back
                </Button>
                <Button type="submit" className="flex-1">
                  Continue
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {step === "confirm" && fileData && (
        <Card>
          <CardHeader>
            <CardTitle>Confirm Publication</CardTitle>
            <CardDescription>
              Review your dataset details before minting the ownership NFT
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Database className="mt-0.5 h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Title</p>
                  <p className="font-medium">{title}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Shield className="mt-0.5 h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">License</p>
                  <p className="font-medium capitalize">{licenseType}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Coins className="mt-0.5 h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Price</p>
                  <p className="font-medium">{price} ETH</p>
                </div>
              </div>
            </div>

            <div className="rounded-lg bg-secondary p-4 font-mono text-xs">
              <p className="mb-2 font-sans text-sm font-medium">Technical Details</p>
              <p className="truncate">
                <span className="text-muted-foreground">Dataset Hash: </span>
                {fileData.hash}
              </p>
              <p className="truncate">
                <span className="text-muted-foreground">IPFS Hash: </span>
                {fileData.ipfsHash}
              </p>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-sm text-destructive">
                <AlertCircle className="h-4 w-4" />
                {error}
              </div>
            )}

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep("metadata")} disabled={isPublishing}>
                Back
              </Button>
              <Button onClick={handlePublish} disabled={isPublishing} className="flex-1">
                {isPublishing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Minting NFT...
                  </>
                ) : (
                  "Publish & Mint NFT"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === "success" && (
        <Card className="text-center">
          <CardContent className="pt-8">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <CheckCircle2 className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-2xl font-semibold">Dataset Published!</h2>
            <p className="mt-2 text-muted-foreground">
              Your dataset ownership NFT has been minted and the dataset is now listed on the
              marketplace.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Button onClick={() => router.push(`/dataset/${publishedDatasetId}`)}>
                View Dataset
              </Button>
              <Button variant="outline" onClick={() => router.push("/creator")}>
                Go to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

"use client"

import Link from "next/link"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { FileJson, FileSpreadsheet, Users, ArrowRight } from "lucide-react"
import type { DatasetMetadata } from "@/lib/contracts"
import { formatFileSize, shortenAddress, formatDate } from "@/lib/store"

interface DatasetCardProps {
  dataset: DatasetMetadata
}

export function DatasetCard({ dataset }: DatasetCardProps) {
  return (
    <Card className="group flex flex-col transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-secondary">
            {dataset.fileType === "json" ? (
              <FileJson className="h-5 w-5 text-primary" />
            ) : (
              <FileSpreadsheet className="h-5 w-5 text-primary" />
            )}
          </div>
          <Badge
            variant={dataset.licenseType === "research" ? "secondary" : "default"}
            className="shrink-0"
          >
            {dataset.licenseType === "research" ? "Research Only" : "Commercial"}
          </Badge>
        </div>
        <h3 className="mt-3 line-clamp-2 text-lg font-semibold leading-tight text-balance">
          {dataset.title}
        </h3>
      </CardHeader>
      <CardContent className="flex-1 pb-3">
        <p className="line-clamp-3 text-sm text-muted-foreground">{dataset.description}</p>
        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
          <span className="font-mono">{formatFileSize(dataset.fileSize)}</span>
          <span className="uppercase">{dataset.fileType}</span>
          <span className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            {dataset.purchaseCount} licenses
          </span>
        </div>
      </CardContent>
      <CardFooter className="flex items-center justify-between border-t border-border pt-4">
        <div className="flex flex-col">
          <span className="text-lg font-bold text-primary">{dataset.price} ETH</span>
          <span className="text-xs text-muted-foreground">
            by {shortenAddress(dataset.owner)}
          </span>
        </div>
        <Button asChild size="sm" variant="ghost" className="group-hover:bg-secondary">
          <Link href={`/dataset/${dataset.id}`}>
            View
            <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  )
}

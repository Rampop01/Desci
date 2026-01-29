"use client"

import { useWeb3 } from "@/lib/web3-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Wallet } from "lucide-react"

interface ConnectWalletPromptProps {
  title?: string
  description?: string
}

export function ConnectWalletPrompt({
  title = "Connect Your Wallet",
  description = "Please connect your wallet to access this feature.",
}: ConnectWalletPromptProps) {
  const { connect, isConnecting, error } = useWeb3()

  return (
    <div className="flex min-h-[60vh] items-center justify-center p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-secondary">
            <Wallet className="h-8 w-8 text-primary" />
          </div>
          <CardTitle>{title}</CardTitle>
          <CardDescription className="text-balance">{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={connect} disabled={isConnecting} className="w-full" size="lg">
            <Wallet className="mr-2 h-5 w-5" />
            {isConnecting ? "Connecting..." : "Connect MetaMask"}
          </Button>
          {error && <p className="mt-4 text-sm text-destructive">{error}</p>}
          <p className="mt-4 text-xs text-muted-foreground">
            Make sure you have MetaMask installed in your browser
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

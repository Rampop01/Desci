"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useWeb3 } from "@/lib/web3-context"
import { Button } from "@/components/ui/button"
import { Database, Wallet, LogOut, Menu, X, AlertTriangle } from "lucide-react"
import { shortenAddress, isUsingContracts } from "@/lib/store"
import { useState } from "react"
import { SUPPORTED_CHAINS } from "@/lib/contracts"

const navLinks = [
  { href: "/marketplace", label: "Marketplace" },
  { href: "/publish", label: "Publish" },
  { href: "/creator", label: "Creator Dashboard" },
  { href: "/buyer", label: "My Purchases" },
]

export function Header() {
  const pathname = usePathname()
  const {
    account,
    isConnected,
    isConnecting,
    connect,
    disconnect,
    chainName,
    isCorrectNetwork,
    switchNetwork,
    error,
  } = useWeb3()
  const contractMode = isUsingContracts()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <Database className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-semibold tracking-tight">DSDM</span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${pathname === link.href
                    ? "bg-secondary text-foreground"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          {/* Mode indicator */}
          {!contractMode && (
            <div className="hidden items-center gap-1.5 rounded-full bg-amber-500/10 px-2.5 py-1 text-xs font-medium text-amber-500 sm:flex">
              Demo Mode
            </div>
          )}

          {isConnected ? (
            <div className="hidden items-center gap-2 sm:flex">
              {/* Network indicator */}
              {chainName && (
                <div
                  className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${isCorrectNetwork
                      ? "bg-primary/10 text-primary"
                      : "bg-amber-500/10 text-amber-500"
                    }`}
                >
                  {!isCorrectNetwork && <AlertTriangle className="h-3 w-3" />}
                  {chainName}
                </div>
              )}
              <div className="flex items-center gap-2 rounded-full bg-secondary px-3 py-1.5">
                <div className="h-2 w-2 rounded-full bg-primary" />
                <span className="font-mono text-sm">{shortenAddress(account!)}</span>
              </div>
              <Button variant="ghost" size="icon" onClick={disconnect} title="Disconnect">
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <Button
              onClick={connect}
              disabled={isConnecting}
              className="hidden sm:flex"
            >
              <Wallet className="mr-2 h-4 w-4" />
              {isConnecting ? "Connecting..." : "Connect Wallet"}
            </Button>
          )}

          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="border-t border-border bg-background md:hidden">
          <nav className="flex flex-col p-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${pathname === link.href
                    ? "bg-secondary text-foreground"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  }`}
              >
                {link.label}
              </Link>
            ))}
            <div className="mt-4 border-t border-border pt-4">
              {isConnected ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-primary" />
                    <span className="font-mono text-sm">{shortenAddress(account!)}</span>
                  </div>
                  <Button variant="ghost" size="sm" onClick={disconnect}>
                    Disconnect
                  </Button>
                </div>
              ) : (
                <Button onClick={connect} disabled={isConnecting} className="w-full">
                  <Wallet className="mr-2 h-4 w-4" />
                  {isConnecting ? "Connecting..." : "Connect Wallet"}
                </Button>
              )}
            </div>
          </nav>
        </div>
      )}

      {error && (
        <div className="border-t border-destructive/50 bg-destructive/10 px-4 py-2 text-center text-sm text-destructive">
          {error}
        </div>
      )}
    </header>
  )
}

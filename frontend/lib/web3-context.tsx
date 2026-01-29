"use client"

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react"
import { SUPPORTED_CHAINS } from "./contracts"

// Supported chain IDs
const SUPPORTED_CHAIN_IDS = [
  SUPPORTED_CHAINS.sepolia.id,
  SUPPORTED_CHAINS.localhost.id,
]

interface Web3ContextType {
  account: string | null
  isConnected: boolean
  isConnecting: boolean
  chainId: number | null
  chainName: string | null
  isCorrectNetwork: boolean
  connect: () => Promise<void>
  disconnect: () => void
  switchNetwork: (chainId: number) => Promise<void>
  error: string | null
}

const Web3Context = createContext<Web3ContextType | undefined>(undefined)

function getChainName(chainId: number | null): string | null {
  if (!chainId) return null
  if (chainId === SUPPORTED_CHAINS.sepolia.id) return "Sepolia"
  if (chainId === SUPPORTED_CHAINS.localhost.id) return "Localhost"
  if (chainId === 1) return "Ethereum Mainnet"
  if (chainId === 137) return "Polygon"
  if (chainId === 80001) return "Polygon Mumbai"
  if (chainId === 8453) return "Base"
  if (chainId === 84531) return "Base Goerli"
  return `Chain ${chainId}`
}

export function Web3Provider({ children }: { children: ReactNode }) {
  const [account, setAccount] = useState<string | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)
  const [chainId, setChainId] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  const chainName = getChainName(chainId)
  const isCorrectNetwork = chainId ? SUPPORTED_CHAIN_IDS.includes(chainId) : false

  const switchNetwork = useCallback(async (targetChainId: number) => {
    if (typeof window === "undefined" || !window.ethereum) {
      setError("MetaMask is not installed")
      return
    }

    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: `0x${targetChainId.toString(16)}` }],
      })
    } catch (switchError: unknown) {
      // This error code indicates that the chain has not been added to MetaMask
      if (
        switchError &&
        typeof switchError === "object" &&
        "code" in switchError &&
        switchError.code === 4902
      ) {
        // Add the chain
        if (targetChainId === SUPPORTED_CHAINS.sepolia.id) {
          try {
            await window.ethereum.request({
              method: "wallet_addEthereumChain",
              params: [
                {
                  chainId: `0x${targetChainId.toString(16)}`,
                  chainName: "Sepolia Testnet",
                  nativeCurrency: {
                    name: "Sepolia ETH",
                    symbol: "SEP",
                    decimals: 18,
                  },
                  rpcUrls: ["https://rpc.sepolia.org"],
                  blockExplorerUrls: ["https://sepolia.etherscan.io"],
                },
              ],
            })
          } catch (addError) {
            console.error("Failed to add network", addError)
          }
        }
      } else {
        console.error("Failed to switch network", switchError)
      }
    }
  }, [])

  const connect = useCallback(async () => {
    if (typeof window === "undefined" || !window.ethereum) {
      setError("MetaMask is not installed. Please install MetaMask to continue.")
      return
    }

    setIsConnecting(true)
    setError(null)

    try {
      const accounts = (await window.ethereum.request({
        method: "eth_requestAccounts",
      })) as string[]

      if (accounts && accounts.length > 0) {
        setAccount(accounts[0])
        const chainIdHex = (await window.ethereum.request({
          method: "eth_chainId",
        })) as string
        const newChainId = Number.parseInt(chainIdHex, 16)
        setChainId(newChainId)

        // Prompt to switch to Sepolia if on wrong network
        if (!SUPPORTED_CHAIN_IDS.includes(newChainId)) {
          setError(
            `Please switch to Sepolia testnet. Current network: ${getChainName(newChainId)}`
          )
        }
      }
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to connect wallet"
      setError(errorMessage)
    } finally {
      setIsConnecting(false)
    }
  }, [])

  const disconnect = useCallback(() => {
    setAccount(null)
    setChainId(null)
    setError(null)
  }, [])

  useEffect(() => {
    if (typeof window === "undefined" || !window.ethereum) return

    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        disconnect()
      } else {
        setAccount(accounts[0])
      }
    }

    const handleChainChanged = (chainIdHex: string) => {
      const newChainId = Number.parseInt(chainIdHex, 16)
      setChainId(newChainId)

      if (!SUPPORTED_CHAIN_IDS.includes(newChainId)) {
        setError(
          `Please switch to Sepolia testnet. Current network: ${getChainName(newChainId)}`
        )
      } else {
        setError(null)
      }
    }

    window.ethereum.on("accountsChanged", handleAccountsChanged)
    window.ethereum.on("chainChanged", handleChainChanged)

    // Check if already connected
    window.ethereum
      .request({ method: "eth_accounts" })
      .then((accounts) => {
        const accountList = accounts as string[]
        if (accountList.length > 0) {
          setAccount(accountList[0])
          window.ethereum
            ?.request({ method: "eth_chainId" })
            .then((chainIdHex) => {
              setChainId(Number.parseInt(chainIdHex as string, 16))
            })
        }
      })
      .catch(console.error)

    return () => {
      window.ethereum?.removeListener("accountsChanged", handleAccountsChanged)
      window.ethereum?.removeListener("chainChanged", handleChainChanged)
    }
  }, [disconnect])

  return (
    <Web3Context.Provider
      value={{
        account,
        isConnected: !!account,
        isConnecting,
        chainId,
        chainName,
        isCorrectNetwork,
        connect,
        disconnect,
        switchNetwork,
        error,
      }}
    >
      {children}
    </Web3Context.Provider>
  )
}

export function useWeb3() {
  const context = useContext(Web3Context)
  if (context === undefined) {
    throw new Error("useWeb3 must be used within a Web3Provider")
  }
  return context
}

declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: unknown[] }) => Promise<unknown>
      on: (event: string, callback: (...args: unknown[]) => void) => void
      removeListener: (
        event: string,
        callback: (...args: unknown[]) => void
      ) => void
    }
  }
}

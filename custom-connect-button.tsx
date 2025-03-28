"use client"

import { useState, useEffect } from "react"
import { useAccount, useConnect, useDisconnect, useBalance, useChainId, useSwitchChain } from "wagmi"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Loader2, ChevronDown, LogOut, Copy, ExternalLink } from "lucide-react"
import { abstract, abstractTestnet } from "viem/chains"

export function CustomConnectButton() {
  const [mounted, setMounted] = useState(false)
  const { address, isConnected } = useAccount()
  const { connect, connectors, isPending: isConnecting } = useConnect()
  const { disconnect } = useDisconnect()
  const { data: balance } = useBalance({ address })
  const chainId = useChainId()
  const { switchChain, isPending: isSwitchingChain } = useSwitchChain()

  // Ensure component is mounted before rendering to avoid hydration issues
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  // Format address for display
  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  // Copy address to clipboard
  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address)
      // You could add a toast notification here
    }
  }

  // View on explorer
  const viewOnExplorer = () => {
    if (address) {
      const baseUrl =
        chainId === abstract.id ? "https://abstractscan.com/address/" : "https://testnet.abstractscan.com/address/"
      window.open(`${baseUrl}${address}`, "_blank")
    }
  }

  if (!isConnected) {
    return (
      <Button onClick={() => connect({ connector: connectors[0] })} disabled={isConnecting} className="rainbow-button">
        {isConnecting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Connecting...
          </>
        ) : (
          "Connect Wallet"
        )}
      </Button>
    )
  }

  return (
    <div className="flex items-center gap-2">
      {/* Network Switcher */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="flex items-center gap-1">
            {chainId === abstract.id ? "🌐" : "🧪"}
            {chainId === abstract.id ? "Abstract" : "Testnet"}
            <ChevronDown className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => switchChain({ chainId: abstract.id })} disabled={isSwitchingChain}>
            <div className="flex items-center gap-2">
              <span>🌐</span>
              <span>Abstract Mainnet</span>
              {chainId === abstract.id && <span className="ml-2">✓</span>}
            </div>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => switchChain({ chainId: abstractTestnet.id })} disabled={isSwitchingChain}>
            <div className="flex items-center gap-2">
              <span>🧪</span>
              <span>Abstract Testnet</span>
              {chainId === abstractTestnet.id && <span className="ml-2">✓</span>}
            </div>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Account Button */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="rainbow-account">
            <span>{address && formatAddress(address)}</span>
            {balance && (
              <span className="text-sm text-muted-foreground">
                {Number.parseFloat(balance.formatted).toFixed(4)} {balance.symbol}
              </span>
            )}
            <ChevronDown className="h-4 w-4 ml-1" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={copyAddress}>
            <Copy className="mr-2 h-4 w-4" />
            <span>Copy Address</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={viewOnExplorer}>
            <ExternalLink className="mr-2 h-4 w-4" />
            <span>View on Explorer</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => disconnect()}>
            <LogOut className="mr-2 h-4 w-4" />
            <span>Disconnect</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}


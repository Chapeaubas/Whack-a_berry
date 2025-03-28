"use client"

import { useState } from "react"
import { Check, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useNetwork, useSwitchNetwork } from "wagmi"
import { abstract, abstractTestnet } from "viem/chains"

const networks = [
  {
    id: abstract.id,
    name: "Abstract Mainnet",
    icon: "🌐",
  },
  {
    id: abstractTestnet.id,
    name: "Abstract Testnet",
    icon: "🧪",
  },
]

export function NetworkSwitcher() {
  const [open, setOpen] = useState(false)
  const { chain } = useNetwork()
  const { switchNetwork } = useSwitchNetwork()

  const currentNetwork = networks.find((network) => network.id === chain?.id) || networks[1]

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <span>{currentNetwork.icon}</span>
          <span>{currentNetwork.name}</span>
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {networks.map((network) => (
          <DropdownMenuItem
            key={network.id}
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => {
              if (switchNetwork) {
                switchNetwork(network.id)
              }
              setOpen(false)
            }}
          >
            <span>{network.icon}</span>
            <span>{network.name}</span>
            {currentNetwork.id === network.id && <Check className="h-4 w-4 ml-auto" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}


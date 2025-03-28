import { createConfig } from "wagmi"
import { abstractTestnet, abstract } from "viem/chains" // Use abstract for mainnet
import { createClient, http } from "viem"
import { eip712WalletActions } from "viem/zksync"
import { connectors } from "./connectors"

// Add a theme for RainbowKit
import { darkTheme } from "@rainbow-me/rainbowkit"

export const rainbowKitTheme = darkTheme()

export const config = createConfig({
  connectors,
  chains: [abstractTestnet, abstract],
  client({ chain }) {
    return createClient({
      chain,
      transport: http(),
    }).extend(eip712WalletActions())
  },
  ssr: true,
})


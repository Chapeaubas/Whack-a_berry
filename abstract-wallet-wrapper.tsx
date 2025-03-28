"use client"

import React, { type ReactNode, useState } from "react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { WagmiProvider } from "wagmi"
import { config } from "@/lib/wallet/config"

interface AbstractWalletWrapperProps {
  children: ReactNode
}

export default function AbstractWalletWrapper({ children }: AbstractWalletWrapperProps) {
  // Create a client
  const [queryClient] = useState(() => new QueryClient())

  // Use a client-side only rendering approach
  const [mounted, setMounted] = useState(false)
  React.useEffect(() => setMounted(true), [])

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  )
}


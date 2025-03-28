"use client"

import { Button } from "@/components/ui/button"
import { ConnectButton } from "@rainbow-me/rainbowkit"
import { Loader2 } from "lucide-react"

export function WalletConnectButton() {
  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        openAccountModal,
        openChainModal,
        openConnectModal,
        authenticationStatus,
        mounted,
        isConnecting,
      }) => {
        // Note: If your app doesn't use authentication, you
        // can remove all 'authenticationStatus' checks
        const ready = mounted && authenticationStatus !== "loading"
        const connected =
          ready && account && chain && (!authenticationStatus || authenticationStatus === "authenticated")

        return (
          <div
            {...(!ready && {
              "aria-hidden": true,
              style: {
                opacity: 0,
                pointerEvents: "none",
                userSelect: "none",
              },
            })}
          >
            {(() => {
              if (!connected) {
                return (
                  <Button onClick={openConnectModal} disabled={isConnecting}>
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

              if (chain.unsupported) {
                return (
                  <Button onClick={openChainModal} variant="destructive">
                    Wrong network
                  </Button>
                )
              }

              return (
                <div className="flex gap-3">
                  <Button onClick={openChainModal} variant="outline" className="flex items-center gap-2">
                    {chain.hasIcon ? (
                      <div
                        style={{
                          background: chain.iconBackground,
                          width: 16,
                          height: 16,
                          borderRadius: 999,
                          overflow: "hidden",
                        }}
                      >
                        {chain.iconUrl && (
                          <img
                            alt={chain.name ?? "Chain icon"}
                            src={chain.iconUrl || "/placeholder.svg"}
                            style={{ width: 16, height: 16 }}
                          />
                        )}
                      </div>
                    ) : chain.name === "Abstract" ? (
                      "🌐"
                    ) : chain.name === "Abstract Testnet" ? (
                      "🧪"
                    ) : null}
                    {chain.name}
                  </Button>

                  <Button onClick={openAccountModal}>
                    {account.displayName}
                    {account.displayBalance ? ` (${account.displayBalance})` : ""}
                  </Button>
                </div>
              )
            })()}
          </div>
        )
      }}
    </ConnectButton.Custom>
  )
}


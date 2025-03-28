import { connectorsForWallets } from "@rainbow-me/rainbowkit"
import { abstractWallet } from "@abstract-foundation/agw-react/connectors"

export const connectors = connectorsForWallets(
  [
    {
      groupName: "Abstract",
      wallets: [abstractWallet],
    },
  ],
  {
    appName: "Abstract Wallet Demo",
    projectId: "",
    appDescription: "A demo application for Abstract Global Wallet integration",
    appIcon: "",
    appUrl: "",
  },
)


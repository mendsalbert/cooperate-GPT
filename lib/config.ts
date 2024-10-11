// lib/config.ts

import { defaultWagmiConfig } from "@web3modal/wagmi/react/config";
import { cookieStorage, createStorage } from "wagmi";

export const projectId = "6a1ea1cb75d52415bb4110fa68566498";

if (!projectId) throw new Error("Project ID is not defined");

const metadata = {
  name: "Web3Modal Example",
  description: "Web3Modal Example",
  url: "https://web3modal.com",
  icons: ["https://avatars.githubusercontent.com/u/37784886"],
};

const zkEVMCardonaTestnet = {
  id: 1029,
  name: "BitTorrent Chain Donau",
  network: "BitTorrent Chain Donau",
  nativeCurrency: {
    decimals: 18,
    name: "BitTorrent Chain Donau",
    symbol: "ETH",
  },
  rpcUrls: {
    default: {
      http: ["https://pre-rpc.bt.io/"],
    },
  },
  blockExplorers: {
    default: {
      name: "BTTC Explorer",
      url: "https://testnet.bttcscan.com/",
    },
  },
  testnet: true,
};

export const config = defaultWagmiConfig({
  chains: [zkEVMCardonaTestnet],
  projectId,
  metadata,
  ssr: true,
  storage: createStorage({
    storage: cookieStorage,
  }),
  enableEmail: false,
});

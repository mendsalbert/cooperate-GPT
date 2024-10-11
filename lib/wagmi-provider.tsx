"use client";

import React, { ReactNode } from "react";
import { createWeb3Modal } from "@web3modal/wagmi/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { State, WagmiProvider } from "wagmi";
import { config, projectId } from "./config";

const BitTorrent = {
  chainId: 1029,
  name: "BitTorrent Chain Donau",
  currency: "BTTC",
  explorerUrl: "https://testnet.bttcscan.com/",
  rpcUrl: "https://pre-rpc.bt.io/",
} as any;

createWeb3Modal({
  wagmiConfig: config,
  projectId,
  defaultChain: BitTorrent,
  enableAnalytics: true, // Optional
  themeMode: "light",
});

export const WagmiProviderComp = ({
  children,
  initialState,
}: {
  children: ReactNode;
  initialState?: State;
}) => {
  const [queryClient] = React.useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <WagmiProvider config={config} initialState={initialState}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  );
};
export default WagmiProviderComp;

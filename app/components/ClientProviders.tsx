"use client";

import { PrivyProvider } from "@privy-io/react-auth";
import WagmiProviderComp from "../../lib/wagmi-provider";
import { ThemeProvider } from "./ThemeProvider";
import { ReactNode } from "react";

interface ClientProvidersProps {
  children: ReactNode;
  initialState: any; // Replace 'any' with the correct type from wagmi
}

export default function ClientProviders({
  children,
  initialState,
}: ClientProvidersProps) {
  return (
    <WagmiProviderComp initialState={initialState}>
      <PrivyProvider
        appId="cm1kyvhwa055nhjlbploahmxa"
        config={{
          appearance: {
            theme: "light",
            accentColor: "#676FFF",
            logo: "https://i.postimg.cc/fygCbFMw/shield-chevron.png",
          },
          embeddedWallets: {
            createOnLogin: "users-without-wallets",
          },
        }}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </PrivyProvider>
    </WagmiProviderComp>
  );
}

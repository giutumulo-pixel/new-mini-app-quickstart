"use client";
import { ReactNode } from "react";
import { base } from "wagmi/chains";
import { OnchainKitProvider } from "@coinbase/onchainkit";
import "@coinbase/onchainkit/styles.css";

export function RootProvider({ children }: { children: ReactNode }) {
  // Fallback API key for development - replace with your actual CDP API key
  const apiKey = process.env.NEXT_PUBLIC_ONCHAINKIT_API_KEY || "demo-key";
  
  return (
    <OnchainKitProvider
      apiKey={apiKey}
      chain={base}
      config={{
        appearance: {
          mode: "auto",
        },
        wallet: {
          display: "modal",
          preference: "all",
        },
      }}
      miniKit={{
        enabled: true,
        autoConnect: true,
        notificationProxyUrl: undefined,
      }}
    >
      {children}
    </OnchainKitProvider>
  );
}

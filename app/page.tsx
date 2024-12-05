"use client"

import Image from "next/image";
import InvoiceDashboardPage from "@/components/invoice-dashboard";
import { Provider } from "@/utils/context";
import { WagmiProvider } from "wagmi";
import { rainbowKitConfig } from "@/utils/wagmiConfig";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { Navbar } from "@/components/common";

export default function Home() {
  const queryClient = new QueryClient();
  return (
   <div>
     <WagmiProvider config={rainbowKitConfig}>
        <QueryClientProvider client={queryClient}>
          <RainbowKitProvider>
            <Provider>
              <Navbar />
              <InvoiceDashboardPage />
            </Provider>
          </RainbowKitProvider>
        </QueryClientProvider>
      </WagmiProvider>

   </div>
  );
}

"use client"

import Image from "next/image";
import CreateInvoice from "@/components/create-invoice";
import { Provider } from "@/utils/context";
import { WagmiProvider } from "wagmi";
import { rainbowKitConfig } from "@/utils/wagmiConfig";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { RainbowKitProvider } from "@rainbow-me/rainbowkit";

export default function Home() {
  const queryClient = new QueryClient();
  return (
   <div>
     <WagmiProvider config={rainbowKitConfig}>
        <QueryClientProvider client={queryClient}>
          <RainbowKitProvider>
            <Provider>
              <CreateInvoice />
            </Provider>
          </RainbowKitProvider>
        </QueryClientProvider>
      </WagmiProvider>

   </div>
  );
}

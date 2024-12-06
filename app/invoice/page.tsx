"use client";

import Head from "next/head";
import dynamic from "next/dynamic";
import { config } from "@/lib/config";
import { useAppContext } from "@/lib/context";
import { currencies } from "@/lib/currencies";
import { rainbowKitConfig as wagmiConfig } from "@/lib/wagmiConfig";
import Spinner from "@/components/ui/Spinner";
import { Button } from "@/components/ui/button";
import { FaPlus } from "react-icons/fa6";
import { useRouter } from "next/navigation";
import Footer from "@/components/Footer/Footer";
import type { CurrencyTypes } from "@requestnetwork/types";

const InvoiceDashboard = dynamic(() => import("@requestnetwork/invoice-dashboard/react"), { ssr: false, loading: () => <Spinner /> });

export default function InvoiceDashboardPage() {
  const { requestNetwork } = useAppContext();
  const router = useRouter();

  return (
    <>
      <Head>
        <title>Request Invoicing</title>
      </Head>

      <div className="container m-auto  w-[100%] mt-16">
        <InvoiceDashboard
          config={config}
          currencies={currencies as CurrencyTypes.CurrencyInput[]}
          requestNetwork={requestNetwork}
          wagmiConfig={wagmiConfig}
        />
      </div>
      <div className="mt-4 absolute right-[43rem]" onClick={() => router.push("/create-invoice")}>
        <Button>
          <FaPlus /> Create Invoice
        </Button>
      </div>
      <Footer />
    </>
  );
}

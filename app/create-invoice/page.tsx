"use client";

import Head from "next/head";
import dynamic from "next/dynamic";
import { config } from "@/lib/config";
import { useAppContext } from "@/lib/context";
import { currencies } from "@/lib/currencies";
import { rainbowKitConfig as wagmiConfig } from "@/lib/wagmiConfig";
import Spinner from "@/components/ui/Spinner";
import type { CurrencyTypes } from "@requestnetwork/types";

const CreateInvoiceForm = dynamic(() => import("@requestnetwork/create-invoice-form/react"), { ssr: false, loading: () => <Spinner /> });

export default function CreateInvoice() {
  const { requestNetwork } = useAppContext();

  return (
    <>
      <Head>
        <title>Request Invoicing - Create an Invoice</title>
      </Head>
      <div className="container m-auto  w-[100%] mt-32">
        <CreateInvoiceForm
          config={config}
          currencies={currencies as CurrencyTypes.CurrencyInput[]}
          wagmiConfig={wagmiConfig}
          requestNetwork={requestNetwork}
        />
      </div>
    </>
  );
}

import Head from "next/head";
import dynamic from "next/dynamic";
import { config } from "@/utils/config";
import { useAppContext } from "@/utils/context";
import { currencies } from "@/utils/currencies";
import { rainbowKitConfig as wagmiConfig } from "@/utils/wagmiConfig";
import { Spinner } from "@/components/ui";
import { useState } from "react";
import { useAccount } from 'wagmi'
import { useMarketplaceContract } from '@/hooks/useMarketplaceContract'

// Define the invoice details type
interface InvoiceDetails {
  invoiceId: string;
  amount: number;
  currency: string;
  // Add other fields as needed
}

// Extend the CreateInvoiceForm props type
interface CreateInvoiceFormProps {
  config: any;
  currencies: any[];
  wagmiConfig: any;
  requestNetwork: any;
  onInvoiceCreated?: (details: InvoiceDetails) => void;
}

const CreateInvoiceForm = dynamic<CreateInvoiceFormProps>(
  () => import("@requestnetwork/create-invoice-form/react"),
  { ssr: false, loading: () => <Spinner /> }
);

export default function CreateInvoice() {
  const { requestNetwork } = useAppContext();
  const [isListed, setIsListed] = useState(false);
  const [tokenId, setTokenId] = useState<number | null>(null);
  const { address } = useAccount();
  const { listInvoice } = useMarketplaceContract();

  const createInvoiceNFT = (invoiceDetails: InvoiceDetails): number => {
    // Dummy implementation - replace with actual NFT creation logic
    console.log('Creating NFT for invoice:', invoiceDetails);
    return 1; // Return dummy tokenId
  }

  return (
    <>
      <Head>
        <title>Request Invoicing - Sell Invoice</title>
      </Head>
      <div className="container m-auto w-[100%]">
        {!isListed ? (
          <CreateInvoiceForm
            config={config}
            currencies={currencies}
            wagmiConfig={wagmiConfig}
            requestNetwork={requestNetwork}
            onInvoiceCreated={(invoiceDetails: InvoiceDetails) => {
              const createdTokenId = createInvoiceNFT(invoiceDetails);
              setTokenId(createdTokenId);
              setIsListed(true);
            }}
          />
        ) : (
          <div>
            <button 
              onClick={async () => {
                if (tokenId !== null && listInvoice) {
                  await listInvoice({ args: [BigInt(tokenId)] });
                }
              }}
              className="bg-blue-500 text-white p-2 rounded"
            >
              List Invoice for Auction
            </button>
          </div>
        )}
      </div>
    </>
  );
}

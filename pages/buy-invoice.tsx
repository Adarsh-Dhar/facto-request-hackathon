import Head from "next/head";
import { useState, useEffect } from "react";
import { useMarketplaceContract } from "@/hooks/useMarketplaceContract";
import { useContractRead } from "wagmi";
import { Spinner } from "@/components/ui";
import { MARKETPLACE_CONTRACT_ADDRESS, InvoiceNFTMarketplaceABI } from "@/hooks/useMarketplaceContract";

// Define the invoice details type
interface InvoiceDetails {
  tokenId: number;
  amount: number;
  deadline: number;
  // Add other fields as needed
}

export default function BuyInvoice() {
  const [invoices, setInvoices] = useState<InvoiceDetails[]>([]);
  const { listInvoice } = useMarketplaceContract();

  // Read all invoices from the marketplace contract
  const { data: allInvoices, isLoading } = useContractRead({
    address: MARKETPLACE_CONTRACT_ADDRESS,
    abi: InvoiceNFTMarketplaceABI,
    functionName: 'getAllInvoiceNFTs',
  });

  useEffect(() => {
    if (allInvoices) {
      setInvoices(allInvoices as InvoiceDetails[]);
    }
  }, [allInvoices]);

  const handleBidOnInvoice = async (tokenId: number) => {
    try {
      await listInvoice({ args: [BigInt(tokenId)] });
    } catch (error) {
      console.error("Error bidding on invoice:", error);
    }
  };

  return (
    <>
      <Head>
        <title>Invoice Marketplace - Buy Invoices</title>
      </Head>
      <div className="container m-auto w-[100%] p-4">
        <h1 className="text-2xl font-bold mb-4">Invoice Marketplace</h1>
        {isLoading ? (
          <Spinner />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {invoices.map((invoice) => (
              <div 
                key={invoice.tokenId} 
                className="border p-4 rounded-lg shadow-md"
              >
                <h2 className="text-xl font-semibold">
                  Invoice #{invoice.tokenId}
                </h2>
                <p>Amount: {invoice.amount} USD</p>
                <p>Deadline: {new Date(invoice.deadline * 1000).toLocaleDateString()}</p>
                <button 
                  onClick={() => handleBidOnInvoice(invoice.tokenId)}
                  className="mt-2 bg-blue-500 text-white p-2 rounded"
                >
                  Place Bid
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

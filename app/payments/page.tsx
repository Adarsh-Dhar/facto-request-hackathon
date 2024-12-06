"use client";

import { useEffect, useState } from "react";
import { columns } from "./columns";
import { DataTable } from "./data-table";
import { BACKEND_URL } from "@/constants";
import { useAccount } from "wagmi";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TabsContent } from "@radix-ui/react-tabs";
import { Loader2 } from "lucide-react";
import Footer from "@/components/Footer/Footer";

export type Payment = {
  id: string;
  amount: string;
  currency: string;
  status: string;
  dueDate: string;
  payer?: string;
  payee?: string;
  reason: string;
};

const PaymentsPage = () => {
  const { address } = useAccount();
  const [receivedPayments, setReceivedPayments] = useState<Payment[] | null>(null);
  const [sentPayments, setSentPayments] = useState<Payment[] | null>(null);

  const getRequests = async () => {
    if (!address) return;

    const data = await fetch(`${BACKEND_URL}/request/address/${address}`);

    const requests = await data.json();

    const receivedPaymentsData = [];
    const sentPaymentsData = [];

    for (const request of requests) {
      if (request.state === "created" && request.balance?.balance >= request.expectedAmount) {
        //outgoing request
        if (request.payee.value.toLowerCase() === address.toLowerCase()) {
          receivedPaymentsData.push({
            id: request.requestId,
            payer: request.payer.value,
            currency: request.currency,
            amount: request.expectedAmount,
            reason: request.contentData.reason,
            status: "paid",
            dueDate: request.contentData.dueDate,
          });
        }
        if (request.payer.value.toLowerCase() === address.toLowerCase()) {
          sentPaymentsData.push({
            id: request.requestId,
            payer: request.extensionsData[0].parameters.paymentAddress,
            currency: request.currency,
            amount: request.expectedAmount,
            reason: request.contentData.reason,
            status: "paid",
            dueDate: request.contentData.dueDate,
          });
        }
      }
    }

    console.log("data", sentPaymentsData);
    console.log("data 2", receivedPaymentsData);

    setReceivedPayments(receivedPaymentsData);
    setSentPayments(sentPaymentsData);
  };

  useEffect(() => {
    if (!address) return;
    getRequests();
  }, [address]);

  return (
    <>
      <div className="ml-[24%] mt-[8rem]">
        <h1 className="text-[2.5rem] leading-loose font-semibold">Payments</h1>
        <h3 className="text-lg text-zinc-500 font-medium">View and manage your payments</h3>
        <Tabs defaultValue="receivedPayments" className="w-[67%] mt-10">
          <TabsList>
            <TabsTrigger value="receivedPayments">Incoming Payments</TabsTrigger>
            <TabsTrigger value="sentPayments">Outgoing Payments</TabsTrigger>
          </TabsList>
          <TabsContent value="receivedPayments">
            {" "}
            <div className=" mt-4">
              {receivedPayments ? (
                <DataTable columns={columns} data={receivedPayments} />
              ) : (
                <Loader2 className="animate-spin m-auto text-zinc-500 mt-16" />
              )}
            </div>
          </TabsContent>
          <TabsContent value="sentPayments">
            {" "}
            <div className="mt-4">{sentPayments && <DataTable columns={columns} data={sentPayments} />}</div>
          </TabsContent>
        </Tabs>
        {/* <div className="w-[67%] mt-4">{incomingRequests && <DataTable columns={columns} data={incomingRequests} />}</div> */}
      </div>
      <Footer />
    </>
  );
};

export default PaymentsPage;

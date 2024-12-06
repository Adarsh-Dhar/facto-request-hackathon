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

export type Request = {
  id: string;
  amount: string;
  currency: string;
  status: string;
  dueDate: string;
  payer?: string;
  payee?: string;
  reason: string;
};

const RequestsPage = () => {
  const { address } = useAccount();
  const [incomingRequests, setIncomingRequests] = useState<Request[] | null>(null);
  const [outgoingRequests, setOutgoingRequests] = useState<Request[] | null>(null);

  const getRequests = async () => {
    if (!address) return;

    const data = await fetch(`${BACKEND_URL}/request/address/${address}`);

    const requests = await data.json();

    const incomingRequestData = [];
    const outgoingRequestData = [];

    for (const request of requests) {
      if (request.state === "created" && request.balance?.balance < request.expectedAmount) {
        //outgoing request
        if (request.payee.value.toLowerCase() === address.toLowerCase()) {
          outgoingRequestData.push({
            id: request.requestId,
            payer: request.payer.value,
            currency: request.currency,
            amount: request.expectedAmount,
            reason: request.contentData.reason,
            status: request.state,
            dueDate: request.contentData.dueDate,
          });
        }
        if (request.payer.value.toLowerCase() === address.toLowerCase()) {
          incomingRequestData.push({
            id: request.requestId,
            payer: request.extensionsData[0].parameters.paymentAddress,
            currency: request.currency,
            amount: request.expectedAmount,
            reason: request.contentData.reason,
            status: request.state,
            dueDate: request.contentData.dueDate,
          });
        }
      }
    }

    console.log("data", incomingRequestData);
    console.log("data 2", outgoingRequestData);

    setIncomingRequests(incomingRequestData);
    setOutgoingRequests(outgoingRequestData);
  };

  useEffect(() => {
    if (!address) return;
    getRequests();
  }, [address]);

  return (
    <>
      <div className="ml-[24%] mt-[8rem]">
        <h1 className="text-[2.5rem] leading-loose font-semibold">Requests</h1>
        <h3 className="text-lg text-zinc-500 font-medium">View and manage your requests</h3>
        <Tabs defaultValue="incomingRequests" className="w-[67%] mt-10">
          <TabsList>
            <TabsTrigger value="incomingRequests">Incoming Requests</TabsTrigger>
            <TabsTrigger value="outgoingRequests">Outgoing Requests</TabsTrigger>
          </TabsList>
          <TabsContent value="incomingRequests">
            {" "}
            <div className=" mt-4">
              {incomingRequests ? (
                <DataTable columns={columns} data={incomingRequests} />
              ) : (
                <Loader2 className="animate-spin m-auto text-zinc-500 mt-16" />
              )}
            </div>
          </TabsContent>
          <TabsContent value="outgoingRequests">
            {" "}
            <div className="mt-4">{outgoingRequests && <DataTable columns={columns} data={outgoingRequests} />}</div>
          </TabsContent>
        </Tabs>

        {/* <div className="w-[67%] mt-4">{incomingRequests && <DataTable columns={columns} data={incomingRequests} />}</div> */}
      </div>
      <Footer />
    </>
  );
};

export default RequestsPage;

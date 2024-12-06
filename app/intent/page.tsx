"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ToggleGroup, ToggleGroupItem } from "@radix-ui/react-toggle-group";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { VscArrowUp } from "react-icons/vsc";
import { LuBadgeDollarSign } from "react-icons/lu";
import { RiBillFill } from "react-icons/ri";
import { AiOutlineAlert } from "react-icons/ai";
import { useState } from "react";
import { useWalletClient } from "wagmi";
import { ThreeDots } from "react-loader-spinner";
import { useAccount } from "wagmi";
import { BACKEND_URL } from "@/constants";
import { sleep } from "@/lib/sleep";
import { createRequest } from "@/request-network/create";
import { payToRequest } from "@/request-network/pay";
import { ToastContainer, toast } from "react-toastify";
import { FaMoneyCheckDollar } from "react-icons/fa6";
import "react-toastify/dist/ReactToastify.css";
import { ethers } from "ethers";
import { useRouter } from "next/navigation";
import { approveAndPayToEscrow, payFromEscrow } from "@/request-network/escrow";
import Footer from "@/components/Footer/Footer";

type AiOption = {
  label: string;
  subOptions: string[];
  imageUrl: () => JSX.Element;
};

const options: AiOption[] = [
  {
    label: "Pay",
    subOptions: ["Pay 10 USDC ", "Pay 10 FAU ", "Pay 100 USDC ", "Pay 100 FAU "],
    imageUrl: () => {
      return <LuBadgeDollarSign className="text-green-600 text-lg" />;
    },
  },
  {
    label: "Request",
    subOptions: ["Request 10 USDC ", "Request 10 FAU ", "Request 100 USDC ", "Request 100 FAU "],
    imageUrl: () => {
      return <FaMoneyCheckDollar className="text-blue-600 text-lg" />;
    },
  },
  {
    label: "Alert",
    subOptions: ["Alert ", "Alert ", "Alert "],
    imageUrl: () => {
      return <AiOutlineAlert className="text-red-700 text-lg" />;
    },
  },
  {
    label: "Invoice",
    subOptions: ["Show me all the invoices ", "I want to generate a new invoice "],
    imageUrl: () => {
      return <RiBillFill className="text-pink-600 text-lg" />;
    },
  },
];

const IntentPage = () => {
  const { address } = useAccount();
  const { data: walletClient } = useWalletClient();
  const [selectedOption, setSelectedOption] = useState<AiOption | null>(null);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sentMessage, setSentMessage] = useState("");
  const [receivedMessage, setReceviedMessage] = useState("");
  const router = useRouter();

  const sendDM = async () => {
    try {
      if (!input || !address) return;
      setIsLoading(true);
      setSentMessage(input);
      setReceviedMessage("");
      setInput("");

      const data = await fetch(`${BACKEND_URL}/agent`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: input,
          userAddress: address,
        }),
      });

      if (data.status !== 200) {
        //!add an error message here
        toast.error("Something went wrong");
        setIsLoading(false);
        return;
      }

      const response = await data.json();
      setReceviedMessage(response.reply);

      console.log("response is", response);

      await sleep(500);

      const transaction = JSON.parse(response.transaction);

      console.log("tt", transaction);

      if (transaction.type === "CREATE") {
        await createRequest(
          walletClient,
          ethers.utils.getAddress(transaction.payerAddress),
          ethers.utils.getAddress(transaction.payeeAddress),
          transaction.tokenAddress,
          transaction.amountInWei,
          transaction.reason,
          transaction.dueDate,
          transaction.tokenType
        );
        toast.success("Request created successfully");
      } else if (transaction.type === "PAY") {
        await payToRequest(transaction.requestId);
        toast.success("Payment made successfully");
      } else if (transaction.type === "CREATE-INVOICE") {
        router.push("/create-invoice");
      } else if (transaction.type === "VIEW-INVOICE") {
        router.push("/invoice");
      } else if (transaction.type === "CREATE-ESCROW") {
        await approveAndPayToEscrow(transaction.requestId, transaction.tokenAddress);
        toast.success("Payment added to escrow successfully");
      } else if (transaction.type === "PAY-ESCROW") {
        await payFromEscrow(transaction.requestId);
        toast.success("Payment made successfully via escrow");
      }
      setIsLoading(false);
    } catch (error) {
      console.log("error: ", error);
      setIsLoading(false);
      toast.error("Something went wrong");
    }
  };

  return (
    <div className="mt-[12%]">
      {sentMessage === "" && (
        <div className="mb-6 m-auto w-[400px] text-3xl font-semibold pt-24">
          <h1 className="text-center">What can I help with?</h1>
        </div>
      )}
      {sentMessage !== "" && (
        <div className="flex flex-col justify-center w-[28%] m-auto mb-6">
          <h2 className="text-lg bg-primary px-4 pt-2 pb-2 block text-white rounded-2xl w-[56%] text-left ml-[350px] ">{sentMessage}</h2>
          {receivedMessage !== "" && <h2 className="text-lg bg-secondary px-4 pt-2 pb-2 rounded-2xl w-[56%] text-left mt-4">{receivedMessage}</h2>}
        </div>
      )}
      <div className="m-auto flex w-full max-w-3xl items-center space-x-2 h-full">
        <Input
          type="text"
          placeholder="Ask me something..."
          className="h-[3.7rem] z-10 rounded-full pl-8 text-[1.1rem]"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />

        <Button type="submit" onClick={sendDM} className="rounded-full z-10 w-[64px] h-[60px] ml-8">
          {isLoading ? (
            <ThreeDots visible={true} height={100} width={100} color="white" radius={9} />
          ) : (
            <VscArrowUp className="w-[3rem] h-[1.5rem]" />
          )}
        </Button>
      </div>
      {!selectedOption && (
        <div className="flex justify-center mt-6">
          <ToggleGroup type="multiple">
            {(options as AiOption[])?.map((option: AiOption) => {
              return (
                <ToggleGroupItem
                  key={option.label}
                  value={option.label}
                  className="ml-[0.75rem] mr-[0.75rem] border-zinc-200 border-[1px] rounded-sm w-[6.2rem] h-[2.1rem]"
                  onClick={() => {
                    setSelectedOption(option);
                  }}
                >
                  <h1 className="flex justify-center text-center">
                    <span className="pt-[4px]">{option.imageUrl()}</span>
                    <span className="pl-[4px] text-[1.025rem]">{option.label}</span>
                  </h1>
                </ToggleGroupItem>
              );
            })}
          </ToggleGroup>
        </div>
      )}
      {/* <div className="fixed bottom-0 left-[30%]">
        <Image src="https://stnx-static.s3.us-east-1.amazonaws.com/landing-page/gmoon.svg" alt="gmoon" height={1200} width={1200} />
      </div> */}
      {selectedOption && (
        <div className="w-[27%] m-auto pr-16 mt-2">
          <Table>
            <TableBody>
              {selectedOption.subOptions.map((subOption) => (
                <TableRow
                  key={subOption}
                  onClick={() => {
                    setInput(subOption);
                    setSelectedOption(null);
                  }}
                >
                  <TableCell className="font-medium">{subOption}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
      <ToastContainer position="bottom-right" />
      <Footer />
    </div>
  );
};

export default IntentPage;

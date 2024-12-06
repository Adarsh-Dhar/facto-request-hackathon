import { REQUEST_NETWORK_URL } from "@/constants";
import { approveErc20ForEscrow, payEscrow, payRequestFromEscrow } from "@requestnetwork/payment-processor/dist/payment/erc20-escrow-payment";
import { RequestNetwork } from "@requestnetwork/request-client.js";
import { BigNumber, ethers } from "ethers";

export async function approveAndPayToEscrow(requestId: string, tokenAddress: string) {
  const requestClient = new RequestNetwork({
    nodeConnectionConfig: {
      baseURL: REQUEST_NETWORK_URL,
    },
  });

  const request = await requestClient.fromRequestId(requestId);
  const requestData = request.getData();

  const provider = new ethers.providers.Web3Provider(window.ethereum);

  const signer = provider.getSigner();

  const approvalTx = await approveErc20ForEscrow(requestData, tokenAddress, signer);

  await approvalTx.wait(2);

  const paymentTx = await payEscrow(requestData, signer, requestData.expectedAmount, "1", { gasLimit: BigNumber.from("500000") });

  await paymentTx.wait(2);
}

export async function payFromEscrow(requestId: string) {
  const requestClient = new RequestNetwork({
    nodeConnectionConfig: {
      baseURL: REQUEST_NETWORK_URL,
    },
  });

  const request = await requestClient.fromRequestId(requestId);
  const requestData = request.getData();

  const provider = new ethers.providers.Web3Provider(window.ethereum);

  const signer = provider.getSigner();

  await payRequestFromEscrow(requestData, signer);
}

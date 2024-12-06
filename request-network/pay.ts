import { REQUEST_NETWORK_URL } from "@/constants";
import { hasSufficientFunds, hasErc20Approval, approveErc20, payRequest } from "@requestnetwork/payment-processor";
import { RequestNetwork, Types } from "@requestnetwork/request-client.js";
import { ethers } from "ethers";

export async function getAllRequests(userAddress: string) {
  const requestClient = new RequestNetwork({
    nodeConnectionConfig: {
      baseURL: REQUEST_NETWORK_URL,
    },
  });

  const requests = await requestClient.fromIdentity({
    type: Types.Identity.TYPE.ETHEREUM_ADDRESS,
    value: userAddress,
  });

  return requests;
}

export async function payToRequest(requestId: string) {
  const requestClient = new RequestNetwork({
    nodeConnectionConfig: {
      baseURL: REQUEST_NETWORK_URL,
    },
  });

  const request = await requestClient.fromRequestId(requestId);
  const requestData = request.getData();

  const provider = new ethers.providers.Web3Provider(window.ethereum);

  const signer = provider.getSigner();

  const address = await signer.getAddress();

  const _hasSufficientFunds = await hasSufficientFunds({ request: requestData, address, providerOptions: { provider } });

  if (!_hasSufficientFunds) throw new Error("Funds are not sufficient");

  const _hasErc20Approval = await hasErc20Approval(requestData, address, provider);

  if (!_hasErc20Approval) {
    const approvalTx = await approveErc20(requestData, signer);
    await approvalTx.wait(2);
  }

  const paymentTx = await payRequest(requestData, signer);
  await paymentTx.wait(2);
}

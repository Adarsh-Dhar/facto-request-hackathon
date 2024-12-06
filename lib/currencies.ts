import { Types } from "@requestnetwork/request-client.js";

export const currencies = [
  {
    symbol: "FAU",
    address: "0x370DE27fdb7D1Ff1e1BaA7D11c5820a324Cf623C",
    network: "sepolia",
    decimals: 18,
    type: Types.RequestLogic.CURRENCY.ERC20,
  },
  {
    symbol: "USDC",
    address: "0xf08A50178dfcDe18524640EA6618a1f965821715",
    network: "sepolia",
    decimals: 6,
    type: Types.RequestLogic.CURRENCY.ERC20,
  },
];



// Dummy ABI - Replace with actual ABI when available
export const MARKETPLACE_CONTRACT_ADDRESS = '0x1234567890123456789012345678901234567890' 

export const InvoiceNFTMarketplaceABI = [
  {
    inputs: [{ internalType: 'uint256', name: 'tokenId', type: 'uint256' }],
    name: 'listInvoiceForAuction',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const

export function useMarketplaceContract() {
    //@ts-ignore
  const { writeAsync: listInvoice } = useContractWrite({
    //@ts-ignore
    address: MARKETPLACE_CONTRACT_ADDRESS,
    abi: InvoiceNFTMarketplaceABI,
    functionName: 'listInvoiceForAuction',
  })

  return { listInvoice }
} 
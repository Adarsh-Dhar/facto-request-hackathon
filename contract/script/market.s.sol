// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;
import {Script, console} from "forge-std/Script.sol";
import {InvoiceNFTMarketplace} from "../src/market.sol";
contract InvoiceNFTMarketplaceScript is Script {
    
    
    InvoiceNFTMarketplace public invoicenftmarketplace;
    function setUp() public {
        // If you need to set up any prerequisites before deployment
    }
    function run() public {
        // Replace these with actual addresses of deployed contracts
        address invoiceNFTAddress = address(0xb82d46669a849E1094bc5177988c09C0fa9c0D49);
        
        // Start broadcasting transactions
        vm.startBroadcast();
        // Deploy the Mira contract
        invoicenftmarketplace = new InvoiceNFTMarketplace(
        invoiceNFTAddress
        );
        // Log the deployed contract address
        console.log("Invoice marketplace deployed at:", address(invoicenftmarketplace));
        // Stop broadcasting
        vm.stopBroadcast();
    }
}
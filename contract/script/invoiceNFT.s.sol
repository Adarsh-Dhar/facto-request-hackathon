// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import {Script, console} from "forge-std/Script.sol";
import {InvoiceNFT} from "../src/InvoiceNFT.sol";

contract InvoiceNFTScript is Script {
    InvoiceNFT public invoiceNFTContract;

    function setUp() public {
        // Optional setup logic
        // For example, you might want to log some deployment information
        console.log("Preparing to deploy InvoiceNFT Contract");
    }

    function run() public {
        // Retrieve the deployer address from the private key
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        
        // Start broadcasting transactions with the deployer's address
        vm.startBroadcast(deployerPrivateKey);

        // Deploy the InvoiceNFT contract
        // Since the original contract uses a parameterless constructor
        invoiceNFTContract = new InvoiceNFT();

        // Log the deployed contract address
        console.log("InvoiceNFT Contract deployed at:", address(invoiceNFTContract));

        // Optional: Demonstrate creating an initial invoice NFT
        // Uncomment and modify parameters as needed
        /*
        uint256 firstInvoiceId = invoiceNFTContract.createInvoiceNFT(
            1,                      // Invoice Number
            1000,                   // Amount
            block.timestamp + 30 days,  // Deadline (30 days from now)
            0x1234567890123456789012345678901234567890,  // Recipient Address
            "Initial Test Invoice", // Description
            "USD"                   // Currency
        );
        console.log("First Invoice NFT created with ID:", firstInvoiceId);
        */

        // Stop broadcasting
        vm.stopBroadcast();
    }
}
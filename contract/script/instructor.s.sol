// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;
import {Script, console} from "forge-std/Script.sol";
import {Instructor} from "../src/instructor.sol";
contract InstructorScript is Script {
    Instructor public instructorContract;
    function setUp() public {
        // If you need to set up any prerequisites before deployment
    }
    function run() public {
        // Replace these with actual addresses of deployed contracts
        
        // Start broadcasting transactions
        vm.startBroadcast();
        // Deploy the Instructor contract
        instructorContract = new Instructor();
        // Log the deployed contract address
        console.log("Instructor Contract deployed at:", address(instructorContract));
        // Stop broadcasting
        vm.stopBroadcast();
    }
}
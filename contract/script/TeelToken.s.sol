// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import {Script, console} from "forge-std/Script.sol";
import {TeelToken} from "../src/TeelToken.sol";

contract TeelTokenScript is Script {
    TeelToken public token;
    uint256 constant THRESHOLD = 100 ether;

    function setUp() public {}

    function run() public {
        // Read NETWORK environment variable
        string memory network = vm.envString("NETWORK");

        // Determine the network to deploy to
        if (keccak256(bytes(network)) == keccak256(bytes("sepolia"))) {
            vm.createSelectFork("sepolia");
            console.log("Deploying to Sepolia testnet...");
        } else {
            vm.createSelectFork("local");
            console.log("No network specified in env. Deploying locally...");
        }

        vm.startBroadcast();

        token = new TeelToken("Teel Token", "TEEL", THRESHOLD);

        vm.stopBroadcast();

        console.log("Deployment complete!");
        console.log("Token address:", address(token));

        // Write ABI to frontend's abi folder
        vm.writeJson(json, "frontend/src/abi/TeelToken.json");
    }
}

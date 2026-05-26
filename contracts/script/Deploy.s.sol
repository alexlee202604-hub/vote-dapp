// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/Crowdfunding.sol";
import "../src/DAOToken.sol";
import "../src/ZKVoting.sol";
import "../src/Verifier.sol";

contract Deploy is Script {
    function run() external {
        vm.startBroadcast();
        
        // Deploy DAOToken
        DAOToken daoToken = new DAOToken();
        console.log("DAOToken deployed at:", address(daoToken));
        
        // Deploy Crowdfunding
        Crowdfunding crowdfunding = new Crowdfunding();
        console.log("Crowdfunding deployed at:", address(crowdfunding));
        
        // Deploy Verifier
        Groth16Verifier verifier = new Groth16Verifier();
        console.log("Verifier deployed at:", address(verifier));
        
        // Deploy ZKVoting
        ZKVoting zkVoting = new ZKVoting(address(verifier));
        console.log("ZKVoting deployed at:", address(zkVoting));
        
        vm.stopBroadcast();
    }
}

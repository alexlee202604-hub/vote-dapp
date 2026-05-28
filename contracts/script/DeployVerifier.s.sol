// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/Verifier.sol";
import "../src/ZKVoting.sol";

/// @notice Redeploy only Verifier + ZKVoting (preserves DAOToken and Crowdfunding)
contract DeployVerifier is Script {
    function run() external {
        vm.startBroadcast();

        // Deploy Verifier
        Groth16Verifier verifier = new Groth16Verifier();
        console.log("Verifier deployed at:", address(verifier));

        // Deploy ZKVoting
        ZKVoting zkVoting = new ZKVoting(address(verifier));
        console.log("ZKVoting deployed at:", address(zkVoting));

        vm.stopBroadcast();
    }
}

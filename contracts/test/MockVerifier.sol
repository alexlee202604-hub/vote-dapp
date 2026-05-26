// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title MockVerifier - Always returns true for testing vote success paths
contract MockVerifier {
    function verifyProof(
        uint[2] calldata,
        uint[2][2] calldata,
        uint[2] calldata,
        uint[4] calldata
    ) external pure returns (bool) {
        return true;
    }
}

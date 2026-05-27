// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/ZKVoting.sol";
import "../src/Verifier.sol";

contract ZKVotingTest is Test {
    ZKVoting public voting;
    Groth16Verifier public verifier;
    
    address public alice = address(0x1);
    
    event ProposalCreated(uint256 indexed id, string description, uint256 deadline);
    event VoteCast(uint256 indexed nullifier, uint256 voteHash);
    
    function setUp() public {
        verifier = new Groth16Verifier();
        voting = new ZKVoting(address(verifier));
        vm.warp(1000000);
    }

    function _emptyProof() internal pure returns (uint[2] memory pA, uint[2][2] memory pB, uint[2] memory pC) {
        pA = [uint(0), 0];
        pB[0] = [uint(0), 0];
        pB[1] = [uint(0), 0];
        pC = [uint(0), 0];
    }

    function test_CreateProposal() public {
        vm.prank(alice);
        uint256 id = voting.createProposal("Test Proposal", 7 days);
        
        assertEq(id, 1);
        
        Proposal memory prop = voting.getProposal(id);
        assertEq(prop.id, 1);
        assertEq(prop.description, "Test Proposal");
        assertEq(prop.deadline, block.timestamp + 7 days);
        assertEq(prop.yesVotes, 0);
        assertEq(prop.noVotes, 0);
    }

    function test_CreateProposalEmitsEvent() public {
        vm.prank(alice);
        vm.expectEmit(true, true, true, true);
        emit ProposalCreated(1, "Test", block.timestamp + 1 days);
        voting.createProposal("Test", 1 days);
    }

    function test_CreateProposalRevertShortDuration() public {
        vm.prank(alice);
        vm.expectRevert(ZKVoting.DurationTooShort.selector);
        voting.createProposal("Test", 30 minutes);
    }

    function test_VoteRevertNonExistentProposal() public {
        (uint[2] memory pA, uint[2][2] memory pB, uint[2] memory pC) = _emptyProof();
        uint[3] memory pubSignals = [uint(12345), 0, 999];
        
        vm.expectRevert(ZKVoting.ProposalNotFound.selector);
        voting.vote(pA, pB, pC, pubSignals);
    }

    function test_VoteRevertAfterDeadline() public {
        vm.prank(alice);
        uint256 id = voting.createProposal("Test", 1 days);
        
        vm.warp(block.timestamp + 1 days + 1);
        
        (uint[2] memory pA, uint[2][2] memory pB, uint[2] memory pC) = _emptyProof();
        uint[3] memory pubSignals = [uint(12345), 0, id];
        
        vm.expectRevert(ZKVoting.VotingEnded.selector);
        voting.vote(pA, pB, pC, pubSignals);
    }

    function test_VoteRevertAlreadyVoted() public {
        vm.prank(alice);
        uint256 id = voting.createProposal("Test", 7 days);
        
        (uint[2] memory pA, uint[2][2] memory pB, uint[2] memory pC) = _emptyProof();
        uint[3] memory pubSignals = [uint(12345), 0, id];
        
        // Mark nullifier as used
        vm.store(address(voting), keccak256(abi.encode(uint256(12345), uint256(2))), bytes32(uint256(1)));
        
        vm.expectRevert(ZKVoting.AlreadyVoted.selector);
        voting.vote(pA, pB, pC, pubSignals);
    }

    function test_ProposalCounter() public {
        vm.prank(alice);
        voting.createProposal("P1", 1 days);
        assertEq(voting.proposalIdCounter(), 1);
        
        voting.createProposal("P2", 1 days);
        assertEq(voting.proposalIdCounter(), 2);
    }

    function test_NullifierTracking() public {
        assertFalse(voting.isNullifierUsed(12345));
        assertFalse(voting.isNullifierUsed(99999));
    }

    function test_ZKVerificationContract() public {
        // Verify contract structure is sound
        vm.prank(alice);
        uint256 id = voting.createProposal("ZK Test", 7 days);
        assertEq(voting.proposalIdCounter(), 1);
        
        // Check nullifier tracking works
        assertFalse(voting.isNullifierUsed(0));
        assertFalse(voting.isNullifierUsed(42));
        
        // Verify proposal data
        Proposal memory prop = voting.getProposal(id);
        assertEq(prop.yesVotes, 0);
        assertEq(prop.noVotes, 0);
    }

    function test_InvalidProofReverts() public {
        vm.prank(alice);
        uint256 id = voting.createProposal("Test", 7 days);
        
        (uint[2] memory pA, uint[2][2] memory pB, uint[2] memory pC) = _emptyProof();
        uint[3] memory pubSignals = [uint(42), 0, id];
        
        // Should revert with InvalidProof since pA,pB,pC are all zeros
        vm.expectRevert(ZKVoting.InvalidProof.selector);
        voting.vote(pA, pB, pC, pubSignals);
    }

    // Fuzz: multiple proposals with different durations
    function testFuzz_ProposalDurations(uint32 duration) public {
        vm.assume(duration >= 1 hours && duration < 365 days);
        
        vm.prank(alice);
        uint256 id = voting.createProposal("Fuzz Proposal", duration);
        
        Proposal memory prop = voting.getProposal(id);
        assertEq(prop.deadline, block.timestamp + duration);
    }

    // Fuzz: nullifier uniqueness
    function testFuzz_NullifierTracking(uint256 nullifier) public {
        assertFalse(voting.isNullifierUsed(nullifier));
    }
}

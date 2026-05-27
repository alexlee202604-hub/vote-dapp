// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./Verifier.sol";

struct Proposal {
    uint256 id;
    string description;
    uint256 deadline;
    uint256 yesVotes;
    uint256 noVotes;
}

/// @title ZKVoting - Anonymous voting using Groth16 zero-knowledge proofs
/// @notice Users prove DAO membership via ZK proofs and vote anonymously
contract ZKVoting {
    uint256 public proposalIdCounter;
    mapping(uint256 => Proposal) public proposals;
    mapping(uint256 => bool) public usedNullifiers;
    
    Groth16Verifier public verifier;

    event ProposalCreated(uint256 indexed id, string description, uint256 deadline);
    event VoteCast(uint256 indexed nullifier, uint256 voteHash);
    
    error ProposalNotFound();
    error VotingEnded();
    error AlreadyVoted();
    error InvalidProof();
    error DurationTooShort();

    constructor(address _verifier) {
        verifier = Groth16Verifier(_verifier);
    }

    /// @notice Create a new voting proposal
    function createProposal(string calldata description, uint256 duration) external returns (uint256) {
        if (duration < 1 hours) revert DurationTooShort();
        
        proposalIdCounter++;
        uint256 id = proposalIdCounter;
        
        proposals[id] = Proposal({
            id: id,
            description: description,
            deadline: block.timestamp + duration,
            yesVotes: 0,
            noVotes: 0
        });
        
        emit ProposalCreated(id, description, block.timestamp + duration);
        return id;
    }

    /// @notice Cast an anonymous vote using a Groth16 ZK proof
    /// @dev pubSignals layout: [nullifier, voteHash, proposalId]
    function vote(
        uint[2] calldata pA,
        uint[2][2] calldata pB,
        uint[2] calldata pC,
        uint[3] calldata pubSignals
    ) external {
        uint256 nullifier = pubSignals[0];
        uint256 voteHash = pubSignals[1];
        uint256 proposalId = pubSignals[2];
        
        if (usedNullifiers[nullifier]) revert AlreadyVoted();
        
        Proposal storage prop = proposals[proposalId];
        if (prop.id == 0) revert ProposalNotFound();
        if (block.timestamp > prop.deadline) revert VotingEnded();
        
        if (!verifier.verifyProof(pA, pB, pC, pubSignals)) {
            revert InvalidProof();
        }
        
        usedNullifiers[nullifier] = true;
        
        // Last bit of voteHash determines choice: 0=yes, 1=no
        if (voteHash % 2 == 0) {
            prop.yesVotes++;
        } else {
            prop.noVotes++;
        }
        
        emit VoteCast(nullifier, voteHash);
    }

    function getProposal(uint256 _proposalId) external view returns (Proposal memory) {
        Proposal memory prop = proposals[_proposalId];
        if (prop.id == 0) revert ProposalNotFound();
        return prop;
    }

    function isNullifierUsed(uint256 nullifier) external view returns (bool) {
        return usedNullifiers[nullifier];
    }
}

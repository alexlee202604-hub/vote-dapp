include "circomlib/comparators.circom";
include "circomlib/poseidon.circom";
include "membership.circom";

template AnonymousVote() {
    signal input userAddress;
    signal input tokenBalance;
    signal input voteChoice;
    
    signal input proposalId;
    signal input nullifier;
    
    signal output voteHash;
    
    component membership = Membership();
    membership.userAddress <== userAddress;
    membership.tokenBalance <== tokenBalance;
    membership.nullifier <== nullifier;
    
    component lt = LessThan(252);
    lt.in[0] <== voteChoice;
    lt.in[1] <== 2;
    lt.out === 1;
    
    component poseidon = Poseidon(3);
    poseidon.inputs[0] <== proposalId;
    poseidon.inputs[1] <== nullifier;
    poseidon.inputs[2] <== voteChoice;
    voteHash <== poseidon.out;
}

component main = AnonymousVote();

pragma circom 2.1.0;

include "circomlib/comparators.circom";
include "circomlib/bitify.circom";
include "circomlib/poseidon.circom";

template AnonymousVote() {
    signal input userAddress;
    signal input tokenBalance;
    signal input voteChoice;
    signal input nullifier;
    signal input proposalId;

    signal output pubNullifier;
    signal output voteHash;
    signal output pubProposalId;

    pubNullifier <== nullifier;
    pubProposalId <== proposalId;

    component gte = GreaterEqThan(252);
    gte.in[0] <== tokenBalance;
    gte.in[1] <== 1;
    gte.out === 1;

    component lt = LessThan(252);
    lt.in[0] <== voteChoice;
    lt.in[1] <== 2;
    lt.out === 1;

    component poseidon = Poseidon(3);
    poseidon.inputs[0] <== proposalId;
    poseidon.inputs[1] <== nullifier;
    poseidon.inputs[2] <== voteChoice;

    component bits = Num2Bits(254);
    bits.in <== poseidon.out;

    voteHash <== poseidon.out - bits.out[0] + voteChoice;
}

component main = AnonymousVote();

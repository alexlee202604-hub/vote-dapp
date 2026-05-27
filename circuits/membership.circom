include "circomlib/comparators.circom";
include "circomlib/poseidon.circom";

template Membership() {
    signal input userAddress;
    signal input tokenBalance;
    signal input nullifier;
    
    signal output commitment;
    
    component gte = GreaterEqThan(252);
    gte.in[0] <== tokenBalance;
    gte.in[1] <== 1;
    gte.out === 1;
    
    component poseidon = Poseidon(2);
    poseidon.inputs[0] <== userAddress;
    poseidon.inputs[1] <== nullifier;
    commitment <== poseidon.out;
}


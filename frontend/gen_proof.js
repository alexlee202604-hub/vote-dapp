const snarkjs = require('snarkjs');
const fs = require('fs');

async function main() {
  const inp = JSON.parse(fs.readFileSync('/tmp/input.json', 'utf8'));
  const { proof, publicSignals } = await snarkjs.groth16.fullProve(
    inp,
    'public/circuits/anonymous_vote.wasm',
    'public/circuits/anonymous_vote_final.zkey'
  );
  const dump = {
    a: [proof.pi_a[0], proof.pi_a[1]],
    b: [[proof.pi_b[0][0], proof.pi_b[0][1]], [proof.pi_b[1][0], proof.pi_b[1][1]]],
    c: [proof.pi_c[0], proof.pi_c[1]],
    pub: publicSignals
  };
  fs.writeFileSync('/tmp/ffi_proof.json', JSON.stringify(dump, null, 2));
  console.log('A:', JSON.stringify(dump.a));
  console.log('B:', JSON.stringify(dump.b));
  console.log('C:', JSON.stringify(dump.c));
  console.log('pub:', JSON.stringify(publicSignals));
}

main().catch(e => { console.error(e.message); process.exit(1); });

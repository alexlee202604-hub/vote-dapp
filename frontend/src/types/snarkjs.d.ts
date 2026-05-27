declare module "snarkjs" {
  export namespace groth16 {
    function fullProve(
      inputs: Record<string, string | number | bigint>,
      wasmPath: string,
      zkeyPath: string
    ): Promise<{
      proof: {
        pi_a: string[];
        pi_b: string[][];
        pi_c: string[];
      };
      publicSignals: string[];
    }>;
  }
}

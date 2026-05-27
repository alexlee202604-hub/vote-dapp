"use client";

import { useState, useCallback } from "react";
import { groth16 } from "snarkjs";

export interface SnarkProofResult {
  proof: {
    pi_a: [bigint, bigint, bigint];
    pi_b: [[bigint, bigint], [bigint, bigint], [bigint, bigint]];
    pi_c: [bigint, bigint, bigint];
  };
  publicSignals: [bigint, bigint, bigint, bigint];
}

function calculateVoteHash(voteChoice: number, secret: bigint): bigint {
  let hash = secret ^ BigInt(voteChoice);
  hash ^= hash >> 16n;
  hash ^= hash << 8n;
  hash ^= hash >> 4n;
  hash &= BigInt("0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF");
  return hash;
}

export function randomBigint(): bigint {
  const arr = new Uint8Array(32);
  crypto.getRandomValues(arr);
  let result = 0n;
  for (let i = 0; i < 32; i++) {
    result = (result << 8n) | BigInt(arr[i]);
  }
  return result;
}

export function useSnarkProof() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateProof = useCallback(
    async (
      voteChoice: number,
      nullifier: bigint,
      secret: bigint
    ): Promise<SnarkProofResult> => {
      setIsGenerating(true);
      setError(null);

      if (typeof window === "undefined") {
        throw new Error("ZK proof generation is only supported in browser");
      }

      try {
        const voteHash = calculateVoteHash(voteChoice, secret);

        const { proof: rawProof, publicSignals: rawSignals } =
          await groth16.fullProve(
            {
              voteHash: voteHash.toString(),
              nullifier: nullifier.toString(),
              secret: secret.toString(),
            },
            "/circuits/anonymous_vote.wasm",
            "/circuits/anonymous_vote_final.zkey"
          );

        return {
          proof: {
            pi_a: [
              BigInt(rawProof.pi_a[0]),
              BigInt(rawProof.pi_a[1]),
              BigInt(rawProof.pi_a[2]),
            ],
            pi_b: [
              [BigInt(rawProof.pi_b[0][0]), BigInt(rawProof.pi_b[0][1])],
              [BigInt(rawProof.pi_b[1][0]), BigInt(rawProof.pi_b[1][1])],
              [BigInt(rawProof.pi_b[2][0]), BigInt(rawProof.pi_b[2][1])],
            ],
            pi_c: [
              BigInt(rawProof.pi_c[0]),
              BigInt(rawProof.pi_c[1]),
              BigInt(rawProof.pi_c[2]),
            ],
          },
          publicSignals: [
            BigInt(rawSignals[0]),
            BigInt(rawSignals[1]),
            BigInt(rawSignals[2]),
            BigInt(rawSignals[3]),
          ],
        } as SnarkProofResult;
      } catch (err) {
        const msg =
          err instanceof Error ? err.message : "Failed to generate ZK proof";
        setError(msg);
        throw err;
      } finally {
        setIsGenerating(false);
      }
    },
    []
  );

  return { generateProof, isGenerating, error };
}

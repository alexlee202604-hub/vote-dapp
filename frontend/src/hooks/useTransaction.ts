import { useState } from "react";
import { toast } from "sonner";
import type { Address } from "viem";

type TxState = "idle" | "pending" | "confirmed" | "failed";

export function useTransaction() {
  const [state, setState] = useState<TxState>("idle");
  const [txHash, setTxHash] = useState<Address | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const handleTx = async (txPromise: Promise<Address>) => {
    setState("pending");
    setError(null);
    setTxHash(null);

    try {
      const hash = await txPromise;
      setTxHash(hash);
      setState("confirmed");
      toast.success("Transaction confirmed", {
        description: `Tx: ${hash.slice(0, 10)}...${hash.slice(-6)}`,
      });
      return hash;
    } catch (err) {
      const error = err as Error;
      setError(error);
      setState("failed");
      toast.error("Transaction failed", {
        description: error.message?.slice(0, 100) ?? "Unknown error",
      });
      throw error;
    }
  };

  return { state, txHash, error, handleTx, isLoading: state === "pending" };
}

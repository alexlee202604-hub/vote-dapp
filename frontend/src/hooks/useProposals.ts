import { useReadContract, useReadContracts, useWriteContract } from "wagmi";
import { CONTRACT_ADDRESSES, ZKVOTING_ABI } from "@/config/contracts";

export function useProposalCount() {
  return useReadContract({
    address: CONTRACT_ADDRESSES.zkVoting,
    abi: ZKVOTING_ABI,
    functionName: "proposalIdCounter",
  });
}

export function useProposal(id: number | undefined) {
  return useReadContract({
    address: CONTRACT_ADDRESSES.zkVoting,
    abi: ZKVOTING_ABI,
    functionName: "getProposal",
    args: id !== undefined ? [BigInt(id)] : undefined,
    query: { enabled: id !== undefined && id >= 0 },
  });
}

export function useAllProposals(limit?: number) {
  const { data: count } = useProposalCount();
  const total = Number(count ?? 0n);
  const max = limit ? Math.min(total, limit) : total;
  const ids = Array.from({ length: max }, (_, i) => i + 1);

  const contracts = ids.map((id) => ({
    address: CONTRACT_ADDRESSES.zkVoting,
    abi: ZKVOTING_ABI,
    functionName: "getProposal" as const,
    args: [BigInt(id)] as const,
  }));

  const { data, isLoading, error } = useReadContracts({ contracts });

  const proposals = (data ?? [])
    .filter((r) => r.status === "success" && r.result)
    .map((r) => r.result as { id: bigint; description: string; deadline: bigint; yesVotes: bigint; noVotes: bigint });

  return {
    data: proposals,
    isLoading,
    error: error ?? null,
    count: total,
  };
}

export function useCreateProposal() {
  return useWriteContract();
}

export function useCastVote() {
  return useWriteContract();
}

export function useIsNullifierUsed(nullifier: bigint | undefined) {
  return useReadContract({
    address: CONTRACT_ADDRESSES.zkVoting,
    abi: ZKVOTING_ABI,
    functionName: "isNullifierUsed",
    args: nullifier !== undefined ? [nullifier] : undefined,
    query: { enabled: nullifier !== undefined },
  });
}

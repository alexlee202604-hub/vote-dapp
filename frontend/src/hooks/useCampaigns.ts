import { useReadContract, useReadContracts, useWriteContract } from "wagmi";
import { CONTRACT_ADDRESSES, CROWDFUNDING_ABI } from "@/config/contracts";
import type { Address } from "viem";

export function useCampaignCount() {
  return useReadContract({
    address: CONTRACT_ADDRESSES.crowdfunding,
    abi: CROWDFUNDING_ABI,
    functionName: "campaignIdCounter",
  });
}

export function useCampaign(id: number | undefined) {
  return useReadContract({
    address: CONTRACT_ADDRESSES.crowdfunding,
    abi: CROWDFUNDING_ABI,
    functionName: "getCampaign",
    args: id !== undefined ? [BigInt(id)] : undefined,
    query: { enabled: id !== undefined && id > 0 },
  });
}

export function useAllCampaigns(limit?: number) {
  const { data: count } = useCampaignCount();
  const total = Number(count ?? 0n);
  const max = limit ? Math.min(total, limit) : total;
  const ids = Array.from({ length: Math.max(0, max) }, (_, i) => i + 1);

  const contracts = ids.map((id) => ({
    address: CONTRACT_ADDRESSES.crowdfunding,
    abi: CROWDFUNDING_ABI,
    functionName: "getCampaign" as const,
    args: [BigInt(id)] as const,
  }));

  const { data, isLoading, error } = useReadContracts({ contracts });

  const campaigns = (data ?? [])
    .filter((r) => r.status === "success" && r.result)
    .map((r) => r.result as { id: bigint; creator: Address; name: string; token: Address; target: bigint; deadline: bigint; raised: bigint; status: number });

  return {
    data: campaigns,
    isLoading,
    error: error ?? null,
    count: total,
  };
}

export function useCreateCampaign() {
  return useWriteContract();
}

export function useContribute() {
  return useWriteContract();
}

export function useWithdraw() {
  return useWriteContract();
}

export function useRefund() {
  return useWriteContract();
}

export function useUserContribution(campaignId: number | undefined, userAddress: Address | undefined) {
  return useReadContract({
    address: CONTRACT_ADDRESSES.crowdfunding,
    abi: CROWDFUNDING_ABI,
    functionName: "getUserContribution",
    args: campaignId !== undefined && userAddress ? [BigInt(campaignId), userAddress] : undefined,
    query: { enabled: campaignId !== undefined && !!userAddress && campaignId > 0 },
  });
}

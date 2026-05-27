import { useReadContract, useWriteContract } from "wagmi";
import { CONTRACT_ADDRESSES, DAOTOKEN_ABI } from "@/config/contracts";
import type { Address } from "viem";

export function useTokenBalance(address: Address | undefined) {
  return useReadContract({
    address: CONTRACT_ADDRESSES.daoTokens,
    abi: DAOTOKEN_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });
}

export function useTokenTotalSupply() {
  return useReadContract({
    address: CONTRACT_ADDRESSES.daoTokens,
    abi: DAOTOKEN_ABI,
    functionName: "totalSupply",
  });
}

export function useTokenName() {
  return useReadContract({
    address: CONTRACT_ADDRESSES.daoTokens,
    abi: DAOTOKEN_ABI,
    functionName: "name",
  });
}

export function useTokenSymbol() {
  return useReadContract({
    address: CONTRACT_ADDRESSES.daoTokens,
    abi: DAOTOKEN_ABI,
    functionName: "symbol",
  });
}

export function useTokenDecimals() {
  return useReadContract({
    address: CONTRACT_ADDRESSES.daoTokens,
    abi: DAOTOKEN_ABI,
    functionName: "decimals",
  });
}

export function useMintTokens() {
  return useWriteContract();
}

export function useApproveToken() {
  return useWriteContract();
}

"use client";

import { use, useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { useAccount, useChainId, useReadContract } from "wagmi";
import { CONTRACT_ADDRESSES, ZKVOTING_ABI, DAOTOKEN_ABI } from "@/config/contracts";
import { useProposal, useCastVote } from "@/hooks";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Loader2, AlertCircle, ArrowLeft, Wallet, Clock, Shield, CheckCircle2,
  EyeOff, ThumbsUp, ThumbsDown,
} from "lucide-react";
import { groth16 } from "snarkjs";
import { keccak256, toBytes } from "viem";
import { toast } from "sonner";
import { useTransaction } from "@/hooks";
import { useCurrentTimestamp } from "@/lib/useCurrentTimestamp";
import Link from "next/link";
import { ConnectButton } from "@rainbow-me/rainbowkit";

const SEPOLIA = 11155111;

type ProposalData = {
  id: bigint;
  description: string;
  deadline: bigint;
  yesVotes: bigint;
  noVotes: bigint;
};

type VoteChoice = 0 | 1;

export default function ProposalDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const proposalId = Number(id);
  const t = useTranslations("proposals");
  const commonT = useTranslations("common");
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { state: txState, txHash, handleTx } = useTransaction();
  const { writeContractAsync: castVoteAsync } = useCastVote();

  const { data: rawProposal, isLoading, isError } = useProposal(proposalId);
  const proposal = rawProposal as ProposalData | undefined;

  const { data: tokenBalance } = useReadContract({
    address: CONTRACT_ADDRESSES.daoTokens,
    abi: DAOTOKEN_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  const [voteChoice, setVoteChoice] = useState<VoteChoice | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [proofState, setProofState] = useState<"idle" | "generating" | "ready" | "submitting" | "done" | "error">("idle");
  const [proofError, setProofError] = useState<string | null>(null);

  const now = useCurrentTimestamp();
  const isActive = proposal ? proposal.deadline > now : false;
  const totalVotes = proposal ? proposal.yesVotes + proposal.noVotes : 0n;
  const yesPct = totalVotes > 0n && proposal ? Number((proposal.yesVotes * 10000n) / totalVotes) / 100 : 0;
  const noPct = totalVotes > 0n && proposal ? Number((proposal.noVotes * 10000n) / totalVotes) / 100 : 0;
  const isWrongNetwork = chainId !== SEPOLIA;
  const daysLeft = proposal ? Math.ceil(Number(proposal.deadline - now) / 86400) : 0;
  const hasVoted = txState === "confirmed";

  const handleVote = useCallback(async () => {
    if (!address || voteChoice === null || !proposal) return;

    setProofState("generating");
    setProofError(null);

    try {
      const nullifier = BigInt(keccak256(toBytes(`${address.toLowerCase()}-${proposal.id.toString()}`)));

      const circuitInputs = {
        userAddress: BigInt(address),
        tokenBalance: tokenBalance ?? 0n,
        voteChoice: BigInt(voteChoice),
        nullifier,
        proposalId: proposal.id,
      };

      const { proof, publicSignals: proofPublicSignals } = await groth16.fullProve(
        circuitInputs,
        "/circuits/anonymous_vote.wasm",
        "/circuits/anonymous_vote_final.zkey"
      );

      setProofState("ready");

      const pA: [bigint, bigint] = [BigInt(proof.pi_a[0]), BigInt(proof.pi_a[1])];
      // snarkjs proof.pi_b is in (real, imag) order, but Verifier.sol expects (imag, real) for G2 points
      const pB: [[bigint, bigint], [bigint, bigint]] = [
        [BigInt(proof.pi_b[0][1]), BigInt(proof.pi_b[0][0])],
        [BigInt(proof.pi_b[1][1]), BigInt(proof.pi_b[1][0])],
      ];
      const pC: [bigint, bigint] = [BigInt(proof.pi_c[0]), BigInt(proof.pi_c[1])];
      const pubSignals = proofPublicSignals.map((s) => BigInt(s)) as unknown as [bigint, bigint, bigint];

      setProofState("submitting");

       await handleTx(castVoteAsync({
         address: CONTRACT_ADDRESSES.zkVoting,
         abi: ZKVOTING_ABI,
         functionName: "vote",
         args: [pA, pB, pC, pubSignals],
          gas: 2000000n,
       }));

      setProofState("done");
      toast.success(t("voteSuccess"));
      setDialogOpen(false);
    } catch (err) {
      const message = err instanceof Error ? err.message.slice(0, 120) : t("voteError");
      setProofError(message);
      setProofState("error");
      toast.error(t("voteError"), { description: message });
    }
  }, [address, voteChoice, proposal, tokenBalance, handleTx, castVoteAsync, t]);

  const openVoteDialog = (choice: VoteChoice) => {
    setVoteChoice(choice);
    setProofState("idle");
    setProofError(null);
    setDialogOpen(true);
  };

  const voteLabel = (choice: VoteChoice): string => {
    return choice === 0 ? t("voteFor") : t("voteAgainst");
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10 space-y-6">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (isError || !proposal) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <AlertCircle className="mx-auto h-12 w-12 text-destructive mb-4" />
        <h2 className="text-xl font-bold text-foreground">{t("detailTitle")}</h2>
        <p className="text-muted-foreground mt-2">{commonT("noData")}</p>
        <Link href="/proposals">
          <Button variant="outline" className="mt-6">{commonT("back")}</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <Link
        href="/proposals"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        {commonT("back")}
      </Link>

      <div className="space-y-6">
        <Card className="border-border/50 shadow-sm">
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-2xl tracking-tight">
                    #{proposal.id.toString()}
                  </CardTitle>
                  <Badge
                    variant={isActive ? "default" : yesPct > noPct ? "secondary" : "destructive"}
                    className="font-medium"
                  >
                    {isActive
                      ? t("filters.active")
                      : yesPct > noPct
                        ? t("filters.passed")
                        : t("filters.rejected")}
                  </Badge>
                </div>
                <CardDescription className="flex items-center gap-3 text-xs mt-1.5">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {isActive
                      ? `${daysLeft} ${commonT("days")}`
                      : t("status")}
                  </span>
                  {hasVoted && (
                    <span className="flex items-center gap-1 text-success">
                      <CheckCircle2 className="h-3 w-3" />
                      {t("vote")}
                    </span>
                  )}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1.5">
                {t("description")}
              </h3>
              <p className="text-sm leading-relaxed text-foreground/90 whitespace-pre-wrap">
                {proposal.description}
              </p>
            </div>
            <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5 rounded-md border border-border/50 px-2.5 py-1.5">
                <Shield className="h-3 w-3" />
                {t("poweredByZK")}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">{t("votes")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="flex items-center gap-1.5 font-medium text-success">
                  <ThumbsUp className="h-3.5 w-3.5" />
                  {t("votesFor")}
                </span>
                <span className="text-muted-foreground">
                  {proposal.yesVotes.toString()} ({yesPct.toFixed(1)}%)
                </span>
              </div>
              <Progress
                value={yesPct}
                className="h-2.5 bg-muted [&>div]:bg-success"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="flex items-center gap-1.5 font-medium text-destructive">
                  <ThumbsDown className="h-3.5 w-3.5" />
                  {t("votesAgainst")}
                </span>
                <span className="text-muted-foreground">
                  {proposal.noVotes.toString()} ({noPct.toFixed(1)}%)
                </span>
              </div>
              <Progress
                value={noPct}
                className="h-2.5 bg-muted [&>div]:bg-destructive"
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{t("totalVotes")}</span>
              <span className="font-semibold text-foreground">
                {totalVotes.toString()}
              </span>
            </div>
          </CardContent>
        </Card>

        {isActive && (
          <Card className="border-border/50 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <EyeOff className="h-4 w-4 text-primary" />
                {t("vote")}
              </CardTitle>
              <CardDescription>{t("connectToVote")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!isConnected ? (
                <div className="text-center py-4">
                  <Wallet className="mx-auto h-8 w-8 text-muted-foreground mb-3" />
                  <p className="text-sm text-muted-foreground mb-4">
                    {t("connectToVote")}
                  </p>
                  <ConnectButton />
                </div>
              ) : isWrongNetwork ? (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  {commonT("chain.incorrect")}
                </div>
              ) : hasVoted ? (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-success/10 text-success text-sm">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  {t("voteSuccess")}
                  {txHash && (
                    <a
                      href={`https://sepolia.etherscan.io/tx/${txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-auto underline underline-offset-2 hover:text-success/80 transition-colors"
                    >
                      {commonT("viewAll")}
                    </a>
                  )}
                </div>
              ) : (
                <>
                  <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <Shield className="h-3 w-3" />
                    {t("poweredByZK")}
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      variant="outline"
                      className="h-auto py-4 flex-col gap-1.5 border-success/30 hover:border-success hover:bg-success/5 transition-all"
                      onClick={() => openVoteDialog(0)}
                    >
                      <ThumbsUp className="h-5 w-5 text-success" />
                      <span className="text-xs font-medium">{t("voteFor")}</span>
                    </Button>
                    <Button
                      variant="outline"
                      className="h-auto py-4 flex-col gap-1.5 border-destructive/30 hover:border-destructive hover:bg-destructive/5 transition-all"
                      onClick={() => openVoteDialog(1)}
                    >
                      <ThumbsDown className="h-5 w-5 text-destructive" />
                      <span className="text-xs font-medium">{t("voteAgainst")}</span>
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={(open) => { if (proofState !== "generating" && proofState !== "submitting") setDialogOpen(open); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-primary" />
              {t("confirmVote")}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="rounded-lg bg-muted/50 p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{t("detailTitle")}</span>
                <span className="font-medium">#{proposal.id.toString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{t("vote")}</span>
                <span className="font-medium">{voteChoice !== null ? voteLabel(voteChoice) : "-"}</span>
              </div>
            </div>

            {(proofState === "idle" || proofState === "ready") && (
              <Button className="w-full" onClick={handleVote}>
                <Shield className="mr-2 h-4 w-4" />
                {t("confirmVote")}
              </Button>
            )}

            {proofState === "generating" && (
              <div className="flex flex-col items-center gap-3 py-4">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground text-center">
                  {t("generatingProof")}
                </p>
              </div>
            )}

            {proofState === "submitting" && (
              <div className="flex flex-col items-center gap-3 py-4">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground text-center">
                  {t("submittingVote")}
                </p>
              </div>
            )}

            {proofState === "done" && (
              <div className="flex flex-col items-center gap-3 py-4">
                <CheckCircle2 className="h-8 w-8 text-success" />
                <p className="text-sm font-medium text-center">{t("voteSuccess")}</p>
                {txHash && (
                  <a
                    href={`https://sepolia.etherscan.io/tx/${txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-primary underline underline-offset-2 hover:text-primary/80 transition-colors"
                  >
                    {commonT("viewAll")}
                  </a>
                )}
              </div>
            )}

            {proofState === "error" && (
              <div className="flex flex-col items-center gap-3 py-4">
                <AlertCircle className="h-8 w-8 text-destructive" />
                <p className="text-sm text-destructive text-center">
                  {proofError || t("proofError")}
                </p>
                <Button variant="outline" size="sm" onClick={handleVote}>
                  {commonT("retry")}
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useAccount } from "wagmi";
import { formatEther, parseEther } from "viem";
import { CONTRACT_ADDRESSES, CROWDFUNDING_ABI } from "@/config/contracts";
import { useCurrentTimestamp } from "@/lib/useCurrentTimestamp";
import {
  useCampaign,
  useUserContribution,
  useContribute,
  useWithdraw,
  useRefund,
  useTransaction,
} from "@/hooks";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft,
  Loader2,
  AlertCircle,
  RefreshCw,
  Wallet,
  Clock,
  Target,
  Send,
  TrendingUp,
  Undo2,
  User,
} from "lucide-react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { toast } from "sonner";

function DetailSkeleton() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 space-y-6">
      <Skeleton className="h-4 w-32" />
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-32 mt-1" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-3/4" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>
    </div>
  );
}

export default function CampaignDetailPage() {
  const t = useTranslations("campaigns");
  const commonT = useTranslations("common");
  const params = useParams();
  const id = Number(params.id);

  const { address, isConnected } = useAccount();

  const {
    data: campaign,
    isLoading: campaignLoading,
    error: campaignError,
    refetch: refetchCampaign,
  } = useCampaign(id);

  const { data: userContribData, refetch: refetchContribution } =
    useUserContribution(id, address);

  const { writeContractAsync: contributeAsync, isPending: isContributing } =
    useContribute();
  const { writeContractAsync: withdrawAsync, isPending: isWithdrawing } =
    useWithdraw();
  const { writeContractAsync: refundAsync, isPending: isRefunding } =
    useRefund();

  const { handleTx: handleContributeTx } = useTransaction();
  const { handleTx: handleWithdrawTx } = useTransaction();
  const { handleTx: handleRefundTx } = useTransaction();

const [contributeAmount, setContributeAmount] = useState("");
const [actionError, setActionError] = useState<string | null>(null);
const [hydrated, setHydrated] = useState(false);

useEffect(() => {
  setHydrated(true);
}, []);

  const userContribution = userContribData as bigint | undefined;
  const hasContributed = userContribution !== undefined && userContribution > 0n;
  const now = useCurrentTimestamp();

  // Loading state
  if (campaignLoading) return <DetailSkeleton />;

  // Error state
  if (campaignError) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <div className="mb-4 flex justify-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-destructive/10">
            <AlertCircle className="h-7 w-7 text-destructive" />
          </div>
        </div>
        <p className="text-lg font-medium text-foreground">
          {commonT("error")}
        </p>
        <p className="mt-1 mb-6 text-sm text-muted-foreground">
          {campaignError.message?.slice(0, 120)}
        </p>
        <Button
          variant="outline"
          onClick={() => refetchCampaign()}
          className="gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          {commonT("retry")}
        </Button>
      </div>
    );
  }

  // Not found / no data
  if (!campaign || !id || id <= 0) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <div className="mb-4 flex justify-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
            <Target className="h-7 w-7 text-muted-foreground" />
          </div>
        </div>
        <p className="text-lg font-medium text-foreground">
          {t("detailTitle")}
        </p>
        <p className="mt-1 mb-6 text-sm text-muted-foreground">
           {t("campaignNotFound")}
         </p>
        <Link href="/campaigns">
          <Button variant="outline" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            {t("backToCampaigns")}
          </Button>
        </Link>
      </div>
    );
  }

const c = campaign as {
    id: bigint;
    creator: `0x${string}`;
    name: string;
    token: `0x${string}`;
    target: bigint;
    deadline: bigint;
    raised: bigint;
    status: number;
};

  const isActive = c.status === 0;
  const isSuccessful = c.status === 1;
  const isFailed = c.status === 2;
  const isCreator = isConnected && address?.toLowerCase() === c.creator.toLowerCase();
  const progress =
    c.target > 0n
      ? Number((c.raised * 10000n) / c.target) / 100
      : 0;
  const daysLeft = Number(
    (c.deadline - now) / 86400n,
  );
  const deadlinePassed = hydrated ? c.deadline <= now : false;

  const handleContribute = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionError(null);

    const amountNum = Number(contributeAmount);
    if (!contributeAmount || isNaN(amountNum) || amountNum <= 0) {
      setActionError(commonT("invalidNumber"));
      return;
    }

    try {
      await handleContributeTx(contributeAsync({
        address: CONTRACT_ADDRESSES.crowdfunding,
        abi: CROWDFUNDING_ABI,
        functionName: "contribute",
        args: [c.id, parseEther(contributeAmount)],
        value: parseEther(contributeAmount),
      }));
      toast.success(t("contributeSuccess"));
      setContributeAmount("");
      refetchCampaign();
      refetchContribution();
    } catch {
      setActionError(t("contributeError"));
    }
  };

  const handleWithdraw = async () => {
    setActionError(null);
    try {
      await handleWithdrawTx(withdrawAsync({
        address: CONTRACT_ADDRESSES.crowdfunding,
        abi: CROWDFUNDING_ABI,
        functionName: "withdraw",
        args: [c.id],
      }));
      toast.success(t("withdrawSuccess"));
      refetchCampaign();
    } catch {
      setActionError(t("withdrawError"));
    }
  };

  const handleRefund = async () => {
    setActionError(null);
    try {
      await handleRefundTx(refundAsync({
        address: CONTRACT_ADDRESSES.crowdfunding,
        abi: CROWDFUNDING_ABI,
        functionName: "refund",
        args: [c.id],
      }));
      toast.success(t("refundSuccess"));
      refetchCampaign();
      refetchContribution();
    } catch {
      setActionError(t("refundError"));
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      {/* Back link */}
      <Link
        href="/campaigns"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        {t("backToCampaigns")}
      </Link>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="space-y-6 lg:col-span-2">
          {/* Campaign Overview */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1.5">
<div className="flex items-center gap-2">
                     <CardTitle className="text-xl">
                       {c.name || `Campaign #${c.id.toString()}`}
                     </CardTitle>
                    <Badge
                      variant={
                        isActive
                          ? "default"
                          : isSuccessful
                            ? "secondary"
                            : "destructive"
                      }
                    >
                      {isActive
                        ? t("active")
                        : isSuccessful
                          ? t("successful")
                          : t("failed")}
                    </Badge>
                  </div>
                  <CardDescription className="flex items-center gap-1.5">
                    <User className="h-3 w-3" />
                    {t("creator")}: {c.creator.slice(0, 6)}...
                    {c.creator.slice(-4)}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-5">
              {/* Progress */}
              <div>
                <div className="mb-1.5 flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{t("raised")}</span>
                  <span className="font-semibold text-foreground">
                    {formatEther(c.raised)} ETH
                  </span>
                </div>
                <Progress value={Math.min(progress, 100)} className="h-2.5" />
                <div className="mt-1 flex justify-between text-xs text-muted-foreground">
                  <span>
                    {t("progress")}: {progress.toFixed(1)}%
                  </span>
                  <span>
                    {t("goal")}: {formatEther(c.target)} ETH
                  </span>
                </div>
              </div>

              <Separator />

              {/* Info Row */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="space-y-1">
                  <span className="text-muted-foreground">{t("status")}</span>
                  <p className="font-medium text-foreground">
                    {isActive
                      ? t("active")
                      : isSuccessful
                        ? t("successful")
                        : t("failed")}
                  </p>
                </div>
                <div className="space-y-1">
                  <span className="text-muted-foreground">
                    {t("daysLeft")}
                  </span>
                  <p className="font-medium text-foreground">
                    {isActive && daysLeft > 0
                      ? `${daysLeft} ${commonT("days")}`
                      : t("ended")}
                  </p>
                </div>
                <div className="space-y-1">
                  <span className="text-muted-foreground">
                    {t("overview")}
                  </span>
                  <p className="font-mono text-xs text-foreground">
                    Token: {c.token.slice(0, 6)}...{c.token.slice(-4)}
                  </p>
                </div>
                <div className="space-y-1">
                  <span className="text-muted-foreground">{t("deadline")}</span>
                  <p className="font-medium text-foreground">
                    {new Date(
                      Number(c.deadline) * 1000,
                    ).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contribute Section */}
          {isActive && !deadlinePassed && (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                    <Send className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-base">
                      {t("contributeTo")}
                    </CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {!isConnected ? (
                  <div className="flex flex-col items-center py-4 text-center">
                    <Wallet className="mb-2 h-8 w-8 text-muted-foreground" />
                    <p className="mb-3 text-sm text-muted-foreground">
                      {t("connectWallet")}
                    </p>
                    <ConnectButton />
                  </div>
                ) : (
                  <form onSubmit={handleContribute} className="space-y-4">
                    <div>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder={t("amountPlaceholder")}
                        value={contributeAmount}
                        onChange={(e) => setContributeAmount(e.target.value)}
                        required
                      />
                      <p className="mt-1 text-xs text-muted-foreground">
                        {t("amountInEth")}
                      </p>
                    </div>

                    {actionError && (
                      <div className="flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/10 p-2.5 text-xs text-destructive">
                        <AlertCircle className="h-3 w-3 shrink-0" />
                        {actionError}
                      </div>
                    )}

                    <Button
                      type="submit"
                      className="w-full gap-2"
                      disabled={isContributing}
                    >
                      {isContributing ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          {commonT("loading")}
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4" />
                          {t("confirmContribute")}
                        </>
                      )}
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
          )}

          {/* Ended notice if active but past deadline */}
          {isActive && deadlinePassed && (
            <Card className="border-amber-200 bg-amber-50/50 dark:border-amber-800/30 dark:bg-amber-950/20">
              <CardContent className="flex items-center gap-3 py-4 text-sm">
                <Clock className="h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />
                <span className="text-amber-800 dark:text-amber-200">
                  {t("endedAwaitingStatus")}
                </span>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* User Contribution */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">{t("yourContribution")}</CardTitle>
            </CardHeader>
            <CardContent>
              {!isConnected ? (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Wallet className="h-3 w-3" />
                  <span>{t("connectToContribute")}</span>
                </div>
              ) : hasContributed ? (
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {formatEther(userContribution!)} ETH
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {t("yourContribution")}
                  </p>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{t("noContribution")}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Creator Actions */}
          {isConnected && isCreator && isSuccessful && (
            <Card className="border-emerald-200 dark:border-emerald-800/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm">
                  <TrendingUp className="h-4 w-4 text-emerald-500" />
                  {t("withdraw")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-3 text-xs text-muted-foreground">
                  {t("withdrawPrompt")}
                </p>
                <Button
                  onClick={handleWithdraw}
                  className="w-full gap-2"
                  disabled={isWithdrawing}
                >
                  {isWithdrawing ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <TrendingUp className="h-4 w-4" />
                  )}
                  {t("withdraw")}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Refund for Contributors */}
          {isConnected && hasContributed && isFailed && (
            <Card className="border-amber-200 dark:border-amber-800/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Undo2 className="h-4 w-4 text-amber-500" />
                  {t("refund")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-3 text-xs text-muted-foreground">
                  {t("refundPrompt")}
                </p>
                <Button
                  onClick={handleRefund}
                  variant="outline"
                  className="w-full gap-2"
                  disabled={isRefunding}
                >
                  {isRefunding ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Undo2 className="h-4 w-4" />
                  )}
                  {t("refund")}
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

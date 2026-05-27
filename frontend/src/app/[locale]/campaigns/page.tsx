"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useReadContract } from "wagmi";
import { formatEther } from "viem";
import { CONTRACT_ADDRESSES, CROWDFUNDING_ABI } from "@/config/contracts";
import { useCampaignCount } from "@/hooks";
import { useCurrentTimestamp } from "@/lib/useCurrentTimestamp";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Target, AlertCircle, RefreshCw, Clock, Wallet } from "lucide-react";
import type { Address } from "viem";

type Campaign = {
  id: bigint;
  creator: Address;
  name: string;
  token: Address;
  target: bigint;
  deadline: bigint;
  raised: bigint;
  status: number;
};

function CampaignCard({ campaign }: { campaign: Campaign }) {
  const t = useTranslations("campaigns");
  const now = useCurrentTimestamp();
  const progress =
    campaign.target > 0n
      ? Number((campaign.raised * 10000n) / campaign.target) / 100
      : 0;
  const daysLeft = Number(
    (campaign.deadline - now) / 86400n,
  );
  const isActive = campaign.status === 0;
  const isSuccessful = campaign.status === 1;
  
  return (
    <Link href={`/campaigns/${campaign.id.toString()}`}>
      <Card className="group h-full transition hover:shadow-md hover:border-primary/30">
        <CardHeader>
          <div className="flex items-start justify-between gap-2">
            <div className="space-y-1">
              <CardTitle className="text-sm">
                {campaign.name || `Campaign #${campaign.id.toString()}`}
              </CardTitle>
              <CardDescription className="text-xs font-mono">
                {campaign.creator.slice(0, 6)}...{campaign.creator.slice(-4)}
              </CardDescription>
            </div>
            <Badge
              variant={isActive ? "default" : isSuccessful ? "secondary" : "destructive"}
            >
              {isActive ? t("active") : isSuccessful ? t("successful") : t("failed")}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="mb-1.5 flex justify-between text-xs">
              <span className="text-muted-foreground">{t("raised")}</span>
              <span className="font-medium text-foreground">
                {formatEther(campaign.raised)} / {formatEther(campaign.target)}{" "}
                ETH
              </span>
            </div>
            <Progress value={Math.min(progress, 100)} className="h-2" />
          </div>
          
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Wallet className="h-3 w-3" />
              <span>{campaign.raised === 0n ? "0" : formatEther(campaign.raised)} ETH</span>
            </div>
            {(isActive && daysLeft > 0) ? (
              <div className="flex items-center gap-1.5">
                <Clock className="h-3 w-3" />
                <span>{daysLeft}d</span>
              </div>
            ) : (
              <span>{t("status")}</span>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

function CampaignCardSkeleton() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-2">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-3 w-20" />
          </div>
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-2 w-full" />
        </div>
        <div className="flex justify-between">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-3 w-10" />
        </div>
      </CardContent>
    </Card>
  );
}

function CampaignCardWrapper({ id }: { id: number }) {
  const { data, isLoading } = useReadContract({
    address: CONTRACT_ADDRESSES.crowdfunding,
    abi: CROWDFUNDING_ABI,
    functionName: "getCampaign",
    args: [BigInt(id)],
    query: { enabled: id > 0 },
  });

  if (isLoading) return <CampaignCardSkeleton />;
  if (!data) return null;
  return <CampaignCard campaign={data as Campaign} />;
}

export default function CampaignsPage() {
  const t = useTranslations("campaigns");
  const commonT = useTranslations("common");
  const { data: countData, isLoading: countLoading, error: countError, refetch: refetchCount } = useCampaignCount();
  const count = Number(countData ?? 0n);

  const campaignIds = useMemo(
    () => Array.from({ length: count }, (_, i) => i + 1),
    [count],
  );

  const isAllZero = count === 0 && !countLoading;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">{t("title")}</h1>
          <p className="mt-1 text-muted-foreground">{t("subtitle")}</p>
        </div>
        <Link href="/campaigns/create">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            {t("createTitle")}
          </Button>
        </Link>
      </div>

      {/* Error State */}
      {countError && (
        <Card className="mb-6 border-destructive/50">
          <CardContent className="flex items-center justify-between py-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 shrink-0 text-destructive" />
              <div>
                <p className="text-sm font-medium text-destructive">
                  {commonT("error")}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {countError.message?.slice(0, 120)}
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetchCount()}
              className="gap-1"
            >
              <RefreshCw className="h-3 w-3" />
              {commonT("retry")}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {countLoading ? (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <CampaignCardSkeleton key={i} />
          ))}
        </div>
      ) : isAllZero ? (
        /* Empty State */
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center py-20">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
              <Target className="h-7 w-7 text-primary" />
            </div>
            <p className="text-lg font-medium text-foreground">
              {t("noCampaigns")}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {t("subtitle")}
            </p>
            <Link href="/campaigns/create" className="mt-6">
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                {t("createTitle")}
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        /* Campaigns with Tabs */
        <Tabs defaultValue="all" className="space-y-6">
          <TabsList variant="line">
            <TabsTrigger value="all">{t("filters.all")}</TabsTrigger>
            <TabsTrigger value="active">{t("filters.active")}</TabsTrigger>
            <TabsTrigger value="successful">{t("filters.successful")}</TabsTrigger>
            <TabsTrigger value="failed">{t("filters.failed")}</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-0">
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
              {campaignIds.map((id) => (
                <CampaignCardWrapper key={id} id={id} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="active" className="mt-0">
            <FilteredCampaignGrid ids={campaignIds} statusFilter={0} />
          </TabsContent>

          <TabsContent value="successful" className="mt-0">
            <FilteredCampaignGrid ids={campaignIds} statusFilter={1} />
          </TabsContent>

          <TabsContent value="failed" className="mt-0">
            <FilteredCampaignGrid ids={campaignIds} statusFilter={2} />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}

function FilteredCampaignGrid({
  ids,
  statusFilter,
}: {
  ids: number[];
  statusFilter: number;
}) {
  const t = useTranslations("campaigns");

  if (ids.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center py-12">
          <Target className="mb-3 h-10 w-10 text-muted-foreground/60" />
          <p className="text-sm font-medium text-muted-foreground">
            {t("noCampaigns")}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
      {ids.map((id) => (
        <FilteredCampaignCard key={id} id={id} statusFilter={statusFilter} />
      ))}
    </div>
  );
}

function FilteredCampaignCard({
  id,
  statusFilter,
}: {
  id: number;
  statusFilter: number;
}) {
  const { data, isLoading } = useReadContract({
    address: CONTRACT_ADDRESSES.crowdfunding,
    abi: CROWDFUNDING_ABI,
    functionName: "getCampaign",
    args: [BigInt(id)],
    query: { enabled: id > 0 },
  });

  if (isLoading) return <CampaignCardSkeleton />;
  if (!data) return null;

  const campaign = data as Campaign;
  if (campaign.status !== statusFilter) return null;

  return <CampaignCard campaign={campaign} />;
}

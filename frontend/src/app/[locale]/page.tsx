"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowRight, Coins, Shield, Vote, Target, Clock, Wallet, BarChart3 } from "lucide-react";
import { useAccount } from "wagmi";
import { useCampaignCount, useProposalCount, useAllCampaigns, useAllProposals } from "@/hooks";
import { useCurrentTimestamp } from "@/lib/useCurrentTimestamp";
import { formatEther } from "viem";

function StatSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <Skeleton className="mx-auto h-8 w-16" />
      </CardHeader>
      <CardContent className="pt-0">
        <Skeleton className="mx-auto h-4 w-24" />
      </CardContent>
    </Card>
  );
}

function CampaignCardSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-3 w-48 mt-1" />
      </CardHeader>
      <CardContent className="space-y-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-2 w-full" />
        <div className="flex justify-between">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-3 w-16" />
        </div>
      </CardContent>
    </Card>
  );
}

function ProposalCardSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-5 w-40" />
      </CardHeader>
      <CardContent className="space-y-2">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-3/4" />
        <div className="flex gap-4 pt-2">
          <Skeleton className="h-8 flex-1" />
          <Skeleton className="h-8 flex-1" />
        </div>
      </CardContent>
    </Card>
  );
}

export default function HomePage() {
  const t = useTranslations("home");
  const cT = useTranslations("campaigns");
  const pT = useTranslations("proposals");
  const commonT = useTranslations("common");
  const { isConnected } = useAccount();
  const voterCount = isConnected ? "1" : "-";
  const now = useCurrentTimestamp();

  const { data: campaignCount, isLoading: countLoading } = useCampaignCount();
  const { data: proposalCount, isLoading: proposalCountLoading } = useProposalCount();
  const { data: campaigns, isLoading: campaignsLoading } = useAllCampaigns(3);
  const { data: proposals, isLoading: proposalsLoading } = useAllProposals(4);

  const features = [
    {
      icon: Coins,
      title: "Crowdfunding",
      desc: "Create token-gated fundraising campaigns with target goals and deadlines.",
      href: "/campaigns",
      gradient: "from-purple-500/20 to-purple-600/5",
      iconBg: "bg-purple-500/10",
      iconColor: "text-purple-500",
    },
    {
      icon: Shield,
      title: "ZK Voting",
      desc: "Vote anonymously on proposals using Groth16 zero-knowledge proofs.",
      href: "/proposals",
      gradient: "from-indigo-500/20 to-indigo-600/5",
      iconBg: "bg-indigo-500/10",
      iconColor: "text-indigo-500",
    },
    {
      icon: Vote,
      title: "DAO Governance",
      desc: "Participate in decentralized decision-making with $VOTE tokens.",
      href: "/proposals",
      gradient: "from-emerald-500/20 to-emerald-600/5",
      iconBg: "bg-emerald-500/10",
      iconColor: "text-emerald-500",
    },
  ];

  const stats = [
    {
      label: t("statCampaigns"),
      value: campaignCount?.toString() ?? "0",
      icon: Target,
      loading: countLoading,
    },
    {
      label: t("statProposals"),
      value: proposalCount?.toString() ?? "0",
      icon: BarChart3,
      loading: proposalCountLoading,
    },
    {
      label: t("statVoters"),
      value: voterCount,
      icon: Wallet,
      loading: false,
    },
    {
      label: t("statParticipants"),
      value: campaigns?.length?.toString() ?? "0",
      icon: Clock,
      loading: campaignsLoading,
    },
  ];

  function getStatusBadge(status: number) {
    if (status === 0) return <Badge variant="default">{cT("active")}</Badge>;
    if (status === 1) return <Badge variant="secondary">{cT("successful")}</Badge>;
    return <Badge variant="destructive">{cT("failed")}</Badge>;
  }

  return (
    <div className="flex flex-1 flex-col">
      {/* Hero */}
      <section className="relative overflow-hidden px-4 pb-16 pt-16 sm:pb-24 sm:pt-24">
        <div className="absolute inset-0 -z-10">
          <div className="absolute -left-48 -top-48 h-[30rem] w-[30rem] rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute -right-48 top-10 h-[35rem] w-[35rem] rounded-full bg-primary/5 blur-3xl" />
          <div className="absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-chart-2/10 blur-3xl" />
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0)_0%,rgba(255,255,255,0)_40%,rgba(139,92,246,0.03)_100%)]" />
        </div>

        <div className="mx-auto max-w-5xl">
          <div className="text-center">
            <Badge
              variant="outline"
              className="mb-6 border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-medium text-primary"
            >
              {commonT("poweredBy")}
            </Badge>

            <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              {t("heroTitle")}
            </h1>

            <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              {t("heroSubtitle")}
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link href="/campaigns">
                <Button size="lg" className="gap-2">
                  {t("exploreCampaigns")}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/proposals">
                <Button variant="outline" size="lg">
                  {t("viewProposals")}
                </Button>
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return stat.loading ? (
                <StatSkeleton key={stat.label} />
              ) : (
                <Card key={stat.label} className="border-primary/5">
                  <CardHeader className="pb-2">
                    <div className="mb-1 flex justify-center">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                        <Icon className="h-4 w-4 text-primary" />
                      </div>
                    </div>
                    <CardTitle className="text-center text-2xl font-bold text-foreground">
                      {stat.value}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pb-4 pt-0 text-center text-xs text-muted-foreground">
                    {stat.label}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Campaigns */}
      <section className="border-t border-border bg-muted/30 px-4 py-16">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-foreground sm:text-2xl">
                {t("activeCampaigns")}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {t("featuredSubtitle")}
              </p>
            </div>
            <Link href="/campaigns">
              <Button variant="ghost" size="sm" className="gap-1 text-primary">
                {commonT("viewAll")}
                <ArrowRight className="h-3 w-3" />
              </Button>
            </Link>
          </div>

          {campaignsLoading ? (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <CampaignCardSkeleton key={i} />
              ))}
            </div>
          ) : !campaigns || campaigns.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center py-12">
                <Target className="mb-3 h-10 w-10 text-muted-foreground/60" />
                <p className="text-sm font-medium text-muted-foreground">
                  {t("noCampaigns")}
                </p>
                <Link href="/campaigns/create" className="mt-4">
                  <Button size="sm">{cT("createTitle")}</Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
              {campaigns.map((c) => {
                const progress =
                  c.target > 0n
                    ? Number((c.raised * 10000n) / c.target) / 100
                    : 0;
                const daysLeft = Number(
                  (c.deadline - now) / 86400n,
                );
                const isActive = c.status === 0;

                return (
                  <Link
                    key={c.id.toString()}
                    href={`/campaigns/${c.id.toString()}`}
                  >
                    <Card className="group h-full transition hover:shadow-md hover:border-primary/30">
                      <CardHeader>
                        <div className="flex items-start justify-between gap-2">
              <CardTitle className="text-sm leading-tight">
                {c.name || `Campaign #${c.id.toString()}`}
              </CardTitle>
                          {getStatusBadge(c.status)}
                        </div>
                        <CardDescription className="truncate text-xs">
                          {c.creator.slice(0, 6)}...{c.creator.slice(-4)}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div>
                          <div className="mb-1 flex justify-between text-xs">
                            <span className="text-muted-foreground">
                              {cT("raised")}
                            </span>
                            <span className="font-medium text-foreground">
                              {formatEther(c.raised)} /{" "}
                              {formatEther(c.target)} ETH
                            </span>
                          </div>
                          <Progress
                            value={Math.min(progress, 100)}
                            className="h-1.5"
                          />
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {isActive && daysLeft > 0 ? (
                            <span>{cT("daysLeft")}: {daysLeft}d</span>
                          ) : (
                            <span>{cT("status")}</span>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Active Proposals */}
      <section className="border-t border-border px-4 py-16">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-foreground sm:text-2xl">
                {t("activeProposals")}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {t("featuredSubtitle")}
              </p>
            </div>
            <Link href="/proposals">
              <Button variant="ghost" size="sm" className="gap-1 text-primary">
                {commonT("viewAll")}
                <ArrowRight className="h-3 w-3" />
              </Button>
            </Link>
          </div>

          {proposalsLoading ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              {[1, 2, 3, 4].map((i) => (
                <ProposalCardSkeleton key={i} />
              ))}
            </div>
          ) : !proposals || proposals.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center py-12">
                <Shield className="mb-3 h-10 w-10 text-muted-foreground/60" />
                <p className="text-sm font-medium text-muted-foreground">
                  {t("noProposals")}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              {proposals.map((p) => {
                const totalVotes = p.yesVotes + p.noVotes;
                const yesPct =
                  totalVotes > 0n
                    ? Number((p.yesVotes * 10000n) / totalVotes) / 100
                    : 0;
                const noPct =
                  totalVotes > 0n
                    ? Number((p.noVotes * 10000n) / totalVotes) / 100
                    : 0;
                const isOpen = p.deadline > now;

                return (
                  <Link
                    key={p.id.toString()}
                    href={`/proposals/${p.id.toString()}`}
                  >
                    <Card className="group h-full transition hover:shadow-md hover:border-primary/30">
                      <CardHeader>
                        <div className="flex items-start justify-between gap-2">
                          <CardTitle className="text-sm leading-tight">
                            {p.description.length > 60
                              ? `${p.description.slice(0, 60)}...`
                              : p.description}
                          </CardTitle>
                          <Badge
                            variant={isOpen ? "default" : "secondary"}
                            className="shrink-0"
                          >
                            {isOpen
                              ? pT("filters.active")
                              : pT("status")}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex gap-3">
                          <div className="flex-1">
                            <div className="mb-1 flex justify-between text-xs">
                              <span className="font-medium text-emerald-500">
                                {pT("voteFor")}
                              </span>
                              <span className="text-muted-foreground">
                                {yesPct.toFixed(1)}%
                              </span>
                            </div>
                            <Progress
                              value={yesPct}
                              className="h-1.5 bg-emerald-500/20"
                            />
                          </div>
                          <div className="flex-1">
                            <div className="mb-1 flex justify-between text-xs">
                              <span className="font-medium text-destructive">
                                {pT("voteAgainst")}
                              </span>
                              <span className="text-muted-foreground">
                                {noPct.toFixed(1)}%
                              </span>
                            </div>
                            <Progress
                              value={noPct}
                              className="h-1.5 bg-destructive/20"
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Feature Cards */}
      <section className="border-t border-border bg-muted/30 px-4 py-16">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8 text-center">
            <h2 className="text-xl font-bold text-foreground sm:text-2xl">
              {t("featuredTitle")}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {t("featuredSubtitle")}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            {features.map((f) => {
              const Icon = f.icon;
              return (
                <Link key={f.title} href={f.href}>
                  <Card className="group relative h-full overflow-hidden transition hover:shadow-md hover:border-primary/30">
                    <div
                      className={`absolute inset-0 bg-gradient-to-br ${f.gradient} opacity-50`}
                    />
                    <CardHeader className="relative">
                      <div
                        className={`mb-3 flex h-11 w-11 items-center justify-center rounded-xl ${f.iconBg}`}
                      >
                        <Icon className={`h-5 w-5 ${f.iconColor}`} />
                      </div>
                      <CardTitle className="text-base">{f.title}</CardTitle>
                      <CardDescription>{f.desc}</CardDescription>
                    </CardHeader>
                    <CardContent className="relative">
                      <span className="inline-flex items-center gap-1 text-sm font-medium text-primary">
                        {commonT("learnMore")}
                        <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                      </span>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}

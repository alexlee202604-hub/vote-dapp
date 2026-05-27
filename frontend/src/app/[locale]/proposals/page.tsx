"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Link } from "@/i18n/navigation";
import { useAllProposals } from "@/hooks";
import { useCurrentTimestamp } from "@/lib/useCurrentTimestamp";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Plus, Clock, AlertCircle, Vote, Wallet } from "lucide-react";

type Proposal = {
  id: bigint;
  description: string;
  deadline: bigint;
  yesVotes: bigint;
  noVotes: bigint;
};

function ProposalCard({ proposal }: { proposal: Proposal }) {
  const t = useTranslations("proposals");
  const commonT = useTranslations("common");
  const now = useCurrentTimestamp();
  const isActive = proposal.deadline > now;
  const totalVotes = proposal.yesVotes + proposal.noVotes;
  const yesPct = totalVotes > 0n ? Number((proposal.yesVotes * 10000n) / totalVotes) / 100 : 0;
  const noPct = totalVotes > 0n ? Number((proposal.noVotes * 10000n) / totalVotes) / 100 : 0;
  const passed = proposal.yesVotes >= proposal.noVotes;
  const daysLeft = Number(proposal.deadline - now) / 86400;

  return (
    <Link href={`/proposals/${proposal.id.toString()}`}>
      <Card className="group h-full transition-all hover:shadow-md hover:border-primary/30 hover:-translate-y-0.5">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <CardTitle className="text-base font-semibold leading-snug line-clamp-2">
                <span className="text-muted-foreground font-mono text-sm mr-2">
                  #{proposal.id.toString()}
                </span>
                {proposal.description}
              </CardTitle>
            </div>
            <Badge
              variant={isActive ? "default" : passed ? "secondary" : "destructive"}
              className="shrink-0"
            >
              {isActive
                ? t("filters.active")
                : passed
                  ? t("filters.passed")
                  : t("filters.rejected")}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <span className="inline-block w-2 h-2 rounded-full bg-primary" />
                {t("for")} {proposal.yesVotes.toString()}
              </span>
              <span className="flex items-center gap-1">
                {t("against")} {proposal.noVotes.toString()}
                <span className="inline-block w-2 h-2 rounded-full bg-destructive/70" />
              </span>
            </div>
            <div className="flex h-2 rounded-full bg-muted overflow-hidden">
              <div
                className="bg-primary transition-all duration-500"
                style={{ width: `${yesPct}%` }}
              />
              <div
                className="bg-destructive/60 transition-all duration-500"
                style={{ width: `${noPct}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{t("totalVotes")}: {totalVotes.toString()}</span>
              {isActive && (
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {daysLeft > 1
                    ? `${Math.ceil(daysLeft)} ${commonT("days")}`
                    : `${Math.ceil(daysLeft * 24)} ${commonT("hours")}`}
                </span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

export default function ProposalsPage() {
  const t = useTranslations("proposals");
  const { isConnected } = useAccount();
  const [filter, setFilter] = useState("all");

  const { data: proposals, isLoading, error, count } = useAllProposals();

  const now = useCurrentTimestamp();
  const sorted = (proposals ?? []).sort((a, b) => Number(b.id - a.id));
  const filtered = sorted.filter((p) => {
    const active = p.deadline > now;
    const passed = p.yesVotes >= p.noVotes;
    if (filter === "active") return active;
    if (filter === "passed") return !active && passed;
    if (filter === "rejected") return !active && !passed;
    return true;
  });

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">
            {t("title")}
          </h1>
          <p className="mt-1 text-muted-foreground">{t("subtitle")}</p>
        </div>
        <Link href="/proposals/create">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            {t("createTitle")}
          </Button>
        </Link>
      </div>

      {!isConnected && count !== undefined && count > 0 && (
        <Card className="mb-6 border-primary/20 bg-primary/5">
          <CardContent className="flex items-center justify-between py-4">
            <div className="flex items-center gap-3">
              <Wallet className="h-5 w-5 text-primary" />
              <p className="text-sm text-muted-foreground">{t("connectToVote")}</p>
            </div>
            <ConnectButton />
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="all" value={filter} onValueChange={setFilter} className="mb-6">
        <TabsList>
          <TabsTrigger value="all">{t("filters.all")}</TabsTrigger>
          <TabsTrigger value="active">{t("filters.active")}</TabsTrigger>
          <TabsTrigger value="passed">{t("filters.passed")}</TabsTrigger>
          <TabsTrigger value="rejected">{t("filters.rejected")}</TabsTrigger>
        </TabsList>
      </Tabs>

      {error && (
        <Card className="border-destructive/50 mb-6">
          <CardContent className="flex items-center gap-3 py-4">
            <AlertCircle className="h-5 w-5 text-destructive shrink-0" />
            <div>
              <p className="text-sm font-medium text-destructive">Failed to load proposals</p>
              <p className="text-xs text-muted-foreground mt-0.5">{error?.message ?? "Unknown error"}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <div className="flex justify-between">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-5 w-16 shrink-0" />
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-2 w-full" />
                <Skeleton className="h-3 w-24" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center py-16">
            {count === 0 ? (
              <>
                <FileText className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <p className="text-lg font-medium text-foreground">{t("noProposals")}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {isConnected
                    ? "Be the first to create one"
                    : "Connect your wallet to create a proposal"}
                </p>
                {isConnected && (
                  <Link href="/proposals/create" className="mt-4">
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      {t("createTitle")}
                    </Button>
                  </Link>
                )}
              </>
            ) : (
              <>
                <Vote className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <p className="text-lg font-medium text-foreground">
                  No proposals match this filter
                </p>
                <Button variant="outline" className="mt-4" onClick={() => setFilter("all")}>
                  {t("filters.all")}
                </Button>
              </>
            )}
          </CardContent>
        </Card>
  ) : (
        <div className="space-y-4">
          {filtered.map((proposal) => (
            <ProposalCard key={proposal.id.toString()} proposal={proposal} />
          ))}
        </div>
      )}
    </div>
  );
}

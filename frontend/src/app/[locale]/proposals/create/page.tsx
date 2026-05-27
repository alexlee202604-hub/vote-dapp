"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { useState } from "react";
import { useAccount, useChainId } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useCreateProposal } from "@/hooks";
import { CONTRACT_ADDRESSES, ZKVOTING_ABI } from "@/config/contracts";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, AlertCircle, Wallet, ArrowLeft, FileText } from "lucide-react";
import { Link } from "@/i18n/navigation";

const SEPOLIA_CHAIN_ID = 11155111;

export default function CreateProposalPage() {
  const t = useTranslations("proposals");
  const commonT = useTranslations("common");
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { writeContractAsync, isPending } = useCreateProposal();

  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState("7");
  const [error, setError] = useState<string | null>(null);

  const isWrongNetwork = chainId !== SEPOLIA_CHAIN_ID;
  const isValid = description.trim().length > 0 && duration && Number(duration) >= 1;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

      if (!description.trim()) {
        setError(t("descriptionRequired"));
        return;
      }
      if (!duration || Number(duration) < 1) {
        setError(t("durationRequired"));
        return;
      }
    if (!address) return;

    try {
      await writeContractAsync({
        address: CONTRACT_ADDRESSES.zkVoting,
        abi: ZKVOTING_ABI,
        functionName: "createProposal",
        args: [description.trim(), BigInt(Number(duration) * 86400)],
      });
      toast.success(t("proposeSuccess"));
      router.push("/proposals");
    } catch (err) {
      const msg = err instanceof Error ? err.message.slice(0, 120) : "Transaction failed";
      setError(msg);
      toast.error(t("proposeError"), { description: msg });
    }
  };

  if (!isConnected) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <Wallet className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <h1 className="text-2xl font-bold text-foreground">{t("createTitle")}</h1>
        <p className="mt-2 text-muted-foreground">{t("connectToCreate")}</p>
        <div className="mt-6 flex justify-center">
          <ConnectButton />
        </div>
      </div>
    );
  }

  if (isWrongNetwork) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <AlertCircle className="mx-auto h-12 w-12 text-destructive mb-4" />
        <h1 className="text-2xl font-bold text-foreground">{t("createTitle")}</h1>
        <p className="mt-2 text-muted-foreground">{t("wrongNetwork")}</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <Link href="/proposals" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
        <ArrowLeft className="h-4 w-4" />
        {commonT("back")}
      </Link>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3 mb-1">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle>{t("createTitle")}</CardTitle>
              <CardDescription>{t("createSubtitle")}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="description">{t("descriptionLabel")}</Label>
              <textarea
                id="description"
                rows={5}
                className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs transition-[color,box-shadow] outline-none selection:bg-primary selection:text-primary-foreground placeholder:text-muted-foreground disabled:pointer-events-none disabled:opacity-50 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 dark:bg-input/30"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t("descriptionPlaceholder")}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration">{t("deadline")}</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="duration"
                  type="number"
                  min="1"
                  max="365"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-24"
                  required
                />
                <span className="text-sm text-muted-foreground">{commonT("days")}</span>
              </div>
            </div>

            {error && (
              <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <Button type="submit" className="w-full" disabled={!isValid || isPending}>
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {commonT("loading")}
                </>
              ) : (
                t("propose")
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

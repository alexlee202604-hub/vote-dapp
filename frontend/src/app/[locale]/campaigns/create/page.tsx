"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { useAccount, useChainId } from "wagmi";
import { parseEther } from "viem";
import { CONTRACT_ADDRESSES, CROWDFUNDING_ABI } from "@/config/contracts";
import { useCreateCampaign } from "@/hooks";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, AlertCircle, Wallet, Plus } from "lucide-react";
import { toast } from "sonner";
import { ConnectButton } from "@rainbow-me/rainbowkit";

const SEPOLIA_CHAIN_ID = 11155111;

export default function CreateCampaignPage() {
  const t = useTranslations("campaigns");
  const commonT = useTranslations("common");
  const router = useRouter();
  const { isConnected } = useAccount();
  const chainId = useChainId();
  const { writeContractAsync, isPending } = useCreateCampaign();

  const [name, setName] = useState("");
  const [token] = useState(CONTRACT_ADDRESSES.daoTokens);
  const [target, setTarget] = useState("");
  const [duration, setDuration] = useState("");
  const [error, setError] = useState<string | null>(null);

  const isWrongNetwork = chainId !== SEPOLIA_CHAIN_ID;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError(t("form.nameRequired"));
      return;
    }

    const targetNum = Number(target);
    if (!target || isNaN(targetNum) || targetNum <= 0) {
      setError(commonT("invalidNumber"));
      return;
    }
    const durationNum = Number(duration);
    if (!duration || isNaN(durationNum) || durationNum < 1) {
      setError(commonT("minValue", { min: "1" }));
      return;
    }

    try {
      await writeContractAsync({
        address: CONTRACT_ADDRESSES.crowdfunding,
        abi: CROWDFUNDING_ABI,
        functionName: "createCampaign",
        args: [
          name.trim(),
          token as `0x${string}`,
          parseEther(target),
          BigInt(Math.floor(durationNum * 86400)),
        ],
      });
      toast.success(t("form.success"));
      router.push("/campaigns");
    } catch (err) {
      const msg =
        err instanceof Error ? err.message.slice(0, 120) : t("form.error");
      toast.error(t("form.error"), { description: msg });
    }
  };

  if (!isConnected) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <div className="mb-4 flex justify-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
            <Wallet className="h-7 w-7 text-primary" />
          </div>
        </div>
        <p className="text-lg font-medium text-foreground">
          {t("createTitle")}
        </p>
        <p className="mt-1 mb-6 text-sm text-muted-foreground">
          {t("connectToContribute")}
        </p>
        <ConnectButton />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-10">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <Plus className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle>{t("createTitle")}</CardTitle>
              <CardDescription>{t("createSubtitle")}</CardDescription>
            </div>
          </div>
        </CardHeader>
          <CardContent>
           {isWrongNetwork && (
             <div className="mb-4 flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
               <AlertCircle className="h-4 w-4 shrink-0" />
               <span>{commonT("error")}</span>
             </div>
           )}
 
           <form onSubmit={handleSubmit} className="space-y-5">
             <div className="space-y-2">
               <Label htmlFor="name">{t("form.name")}</Label>
               <Input
                 id="name"
                 type="text"
                 placeholder={t("form.namePlaceholder")}
                 value={name}
                 onChange={(e) => setName(e.target.value)}
                 required
               />
             </div>
 
             <div className="space-y-2">
               <Label htmlFor="target">{t("goal")}</Label>
               <Input
                 id="target"
                 type="number"
                 step="0.01"
                 min="0"
                 placeholder={t("form.goalPlaceholder")}
                 value={target}
                 onChange={(e) => setTarget(e.target.value)}
                 required
               />
               <p className="text-xs text-muted-foreground">
                 {t("form.targetDesc")}
               </p>
             </div>
 
             <div className="space-y-2">
               <Label htmlFor="duration">{t("form.duration")}</Label>
               <Input
                 id="duration"
                 type="number"
                 min="1"
                 max="365"
                 placeholder={t("form.durationPlaceholder")}
                 value={duration}
                 onChange={(e) => setDuration(e.target.value)}
                 required
               />
               <p className="text-xs text-muted-foreground">
                 {t("form.durationDesc")}
               </p>
             </div>
 
             {/* Warning notice */}
             <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800 dark:border-amber-800/30 dark:bg-amber-950/30 dark:text-amber-200">
               {t("form.warning")}
             </div>

            {error && (
              <div className="flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full gap-2"
              disabled={isPending || isWrongNetwork}
            >
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {t("form.submitting")}
                </>
              ) : (
                t("form.submit")
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

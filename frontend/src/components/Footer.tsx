"use client";

import { useTranslations } from "next-intl";
import { Vote } from "lucide-react";
import Link from "next/link";

export default function Footer() {
  const t = useTranslations("common");
  const navT = useTranslations("nav");

  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
          {/* Brand */}
          <div className="sm:col-span-1">
            <Link
              href="/"
              className="flex items-center gap-2.5 group w-fit"
            >
              <div className="flex size-7 items-center justify-center rounded-md bg-primary transition-transform group-hover:scale-105">
                <Vote className="size-3.5 text-primary-foreground" />
              </div>
              <span className="text-base font-bold text-foreground">
                VoteDAO
              </span>
            </Link>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-muted-foreground">
              {t("footerText")}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {navT("home")}
            </h4>
            <ul className="mt-4 space-y-3">
              <li>
                <Link
                  href="/campaigns"
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  {navT("campaigns")}
                </Link>
              </li>
              <li>
                <Link
                  href="/proposals"
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  {navT("proposals")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Copyright */}
          <div className="sm:text-right sm:self-end">
            <p className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} VoteDAO
            </p>
            <p className="mt-1 text-xs text-muted-foreground/60">
              {t("poweredBy")}
            </p>
          </div>
        </div>

        <div className="mt-10 border-t border-border/50 pt-6 text-center text-xs text-muted-foreground/50">
          Decentralized Governance Platform
        </div>
      </div>
    </footer>
  );
}

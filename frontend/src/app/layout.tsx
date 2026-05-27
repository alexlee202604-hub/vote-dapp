import type { Metadata } from "next";
import Script from "next/script";
import "@rainbow-me/rainbowkit/styles.css";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "VoteDAO - Decentralized Crowdfunding & Anonymous Voting",
  description: "A decentralized crowdfunding platform with ZK-powered anonymous voting",
};

const themeScript = `
  try {
    const t = localStorage.getItem("theme") || "system";
    const d = t === "dark" || (t === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
    document.documentElement.classList.toggle("dark", d);
  } catch(e) {}
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body className="antialiased min-h-screen flex flex-col">
        <Script id="theme-init" strategy="beforeInteractive">{themeScript}</Script>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

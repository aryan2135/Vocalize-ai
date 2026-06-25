import { Outfit, Geist_Mono } from "next/font/google";
import { StackProvider, StackTheme } from "@stackframe/stack";
import { stackClientApp } from "../stack/client";
import React from "react";
import "./globals.css";
import Provider from "./provider";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "VocalizeAI",
  description: "Deploy Custom AI Voice Agents in Seconds.",
};

const customStackTheme = {
  dark: {
    primary: "#14b8a6", // Teal 500
    background: "#09090b", // Zinc 950
    card: "#18181b", // Zinc 900
    cardForeground: "#f4f4f5", // Zinc 100
    primaryForeground: "#09090b",
    secondary: "#27272a", // Zinc 800
    secondaryForeground: "#f4f4f5",
    muted: "#27272a",
    mutedForeground: "#a1a1aa",
    accent: "#14b8a6",
    accentForeground: "#09090b",
    border: "#27272a",
    input: "#18181b",
    ring: "#14b8a6",
  },
  light: {
    primary: "#14b8a6",
    background: "#09090b",
    card: "#18181b",
    cardForeground: "#f4f4f5",
    primaryForeground: "#09090b",
    secondary: "#27272a",
    secondaryForeground: "#f4f4f5",
    muted: "#27272a",
    mutedForeground: "#a1a1aa",
    accent: "#14b8a6",
    accentForeground: "#09090b",
    border: "#27272a",
    input: "#18181b",
    ring: "#14b8a6",
  },
  radius: "16px",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${outfit.variable} ${geistMono.variable} antialiased bg-zinc-950 text-zinc-100 font-sans`}
      >
        <StackProvider app={stackClientApp}>
          <StackTheme theme={customStackTheme}>
            <Provider>{children}</Provider>
          </StackTheme>
        </StackProvider>
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Providers } from "@/components/workspace/providers";
import "./globals.css";

const inter = Inter({
  variable: "--font-notion-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Acme Workspace — The AI workspace that works for you",
  description:
    "A Notion-inspired workspace built with Next.js, Tailwind, Prisma, PostgreSQL, Better Auth and OpenRouter.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full overflow-hidden">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

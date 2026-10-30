import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { getPortfolioBySlug, incrementPortfolioViews } from "@/lib/db";
import { PortfolioView } from "@/components/portfolio/PortfolioView";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const portfolio = getPortfolioBySlug(slug);
  if (!portfolio) return { title: "Portfolio not found" };
  return {
    title: `${portfolio.profile.fullName} — Portfolio`,
    description: portfolio.profile.headline,
  };
}

export default async function PortfolioPage({ params }: Props) {
  const { slug } = await params;
  const portfolio = getPortfolioBySlug(slug);
  if (!portfolio) notFound();
  // Track view (fire-and-forget analytics).
  incrementPortfolioViews(slug);
  return <PortfolioView portfolio={portfolio} />;
}

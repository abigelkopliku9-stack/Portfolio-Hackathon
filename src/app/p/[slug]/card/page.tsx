import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getPortfolioBySlug } from "@/lib/db";
import BusinessCardPage from "@/components/card/BusinessCardPage";
export const dynamic = "force-dynamic";
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params; const portfolio = getPortfolioBySlug(slug);
  return { title: portfolio ? `${portfolio.profile.fullName} - Business card` : "Business card not found" };
}
export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params; const portfolio = getPortfolioBySlug(slug);
  if (!portfolio) notFound();
  return <BusinessCardPage portfolio={portfolio} />;
}

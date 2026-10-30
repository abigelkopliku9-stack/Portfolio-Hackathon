import PortfolioWizard from "@/components/form/PortfolioWizard";
import { THEMES, type Theme } from "@/lib/validation/portfolio.schema";
export default async function CreatePage({ searchParams }: { searchParams: Promise<{ theme?: string }> }) {
  const { theme } = await searchParams;
  const selectedTheme: Theme = THEMES.includes(theme as Theme) ? theme as Theme : "minimal";
  return <div className="container editor-page"><PortfolioWizard mode="create" defaultTheme={selectedTheme} /></div>;
}

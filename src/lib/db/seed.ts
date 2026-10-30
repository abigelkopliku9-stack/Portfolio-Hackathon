import { closeDb, createPortfolio, getPortfolioBySlug } from "./index";
import { demoPortfolio } from "../demo";

// Idempotent: launching the app never overwrites an edited demo.
if (!getPortfolioBySlug("demo-portfolio", { includeUnpublished: true })) {
  createPortfolio(demoPortfolio, { slug: "demo-portfolio", editKey: "demo-key-123" });
  console.log("Demo ready: /p/demo-portfolio (edit key: demo-key-123)");
}
closeDb();

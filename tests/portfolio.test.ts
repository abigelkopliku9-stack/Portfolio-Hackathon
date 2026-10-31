import { after, test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { closeDb, createPortfolio, deletePortfolio, getPortfolioBySlug, getEditKeyHash, updatePortfolio, countPortfolios, transaction } from "../src/lib/db/index";
import { hashEditKey, verifyEditKey } from "../src/lib/auth/editKey";
import { portfolioInputSchema, emptyPortfolio } from "../src/lib/validation/portfolio.schema";
import { renderPortfolioHtml } from "../src/lib/exportHtml";
const directory = mkdtempSync(join(tmpdir(), "portfolio-test-"));
process.env.DATABASE_PATH = join(directory, "test.db");
after(() => { closeDb(); rmSync(directory, { recursive: true, force: true }); });
const input = portfolioInputSchema.parse({ ...emptyPortfolio, profile: { ...emptyPortfolio.profile, fullName: "Test Creator", headline: "A test portfolio", bio: "Made for automated verification." }, skills: [{ name: "TypeScript", level: 4 }], projects: [{ title: "Test project", description: "A project with persistence", techTags: ["React"], featured: true }] });
test("validation rejects missing profile details and executable URLs", () => {
  assert.equal(portfolioInputSchema.safeParse(emptyPortfolio).success, false);
  assert.equal(portfolioInputSchema.safeParse({ ...input, socials: [{ label: "Bad", url: "javascript:alert(1)" }] }).success, false);
  assert.equal(portfolioInputSchema.safeParse({ ...input, profile: { ...input.profile, email: "not-an-email" } }).success, false);
});
test("create persists all portfolio sections and returns a private key only once", () => {
  const { portfolio, editKey } = createPortfolio(input, { slug: "test-creator" });
  assert.equal(editKey.length, 24);
  assert.equal(getEditKeyHash(portfolio.slug), hashEditKey(editKey));
  assert.equal(verifyEditKey(editKey, getEditKeyHash(portfolio.slug)!), true);
  assert.equal(verifyEditKey("wrong-key", getEditKeyHash(portfolio.slug)!), false);
  assert.deepEqual(getPortfolioBySlug(portfolio.slug)?.projects, input.projects);
  assert.equal("editKey" in getPortfolioBySlug(portfolio.slug)!, false);
  assert.equal("editKeyHash" in getPortfolioBySlug(portfolio.slug)!, false);
});
test("updates replace ordered children without leaving stale records", () => {
  const updated = updatePortfolio("test-creator", { ...input, projects: [], skills: [{ name: "SQL", level: 3, category: "Data" }], theme: "dark" });
  assert.equal(updated?.theme, "dark");
  assert.deepEqual(updated?.projects, []);
  assert.deepEqual(getPortfolioBySlug("test-creator")?.skills, [{ name: "SQL", level: 3, category: "Data" }]);
});
test("unpublished portfolios stay private and remain available to the editor", () => {
  updatePortfolio("test-creator", { ...input, published: false });
  assert.equal(getPortfolioBySlug("test-creator"), null);
  assert.equal(getPortfolioBySlug("test-creator", { includeUnpublished: true })?.published, false);
});
test("a failed transaction leaves the database unchanged", () => {
  const before = countPortfolios();
  assert.throws(() => transaction(db => { db.prepare("DELETE FROM portfolios WHERE slug = ?").run("test-creator"); throw new Error("rollback test"); }));
  assert.equal(countPortfolios(), before);
  assert.ok(getPortfolioBySlug("test-creator", { includeUnpublished: true }));
});
test("HTML exports escape user content and include the selected theme and sections", () => {
  const { portfolio } = createPortfolio({ ...input, theme: "dark", profile: { ...input.profile, fullName: '<script>alert("x")</script>' }, events: [{ title: "Test event", role: "Speaker", date: "2026-10", description: "Example", url: "" }], awards: [{ title: "Test award", issuer: "Test", date: "2026-10", result: "1st", description: "Example" }] }, { slug: "export-test" });
  const html = renderPortfolioHtml(portfolio);
  assert.ok(html.startsWith("<!DOCTYPE html>"));
  assert.ok(html.includes('data-theme="dark"'));
  assert.ok(html.includes("&lt;script&gt;"));
  assert.ok(!html.includes("<script>"));
  assert.ok(html.includes("Test event")); assert.ok(html.includes("Test award"));
});
test("deleting a portfolio removes it and its children", () => {
  assert.equal(deletePortfolio("test-creator"), true);
  assert.equal(getPortfolioBySlug("test-creator", { includeUnpublished: true }), null);
  assert.equal(getEditKeyHash("test-creator"), null);
  assert.equal(deletePortfolio("test-creator"), false);
});

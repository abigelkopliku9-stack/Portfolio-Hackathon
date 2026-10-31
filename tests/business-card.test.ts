import { test } from "node:test";
import assert from "node:assert/strict";
import { renderBusinessCardFaces, renderBusinessCardHtml } from "../src/lib/businessCard";
import { emptyPortfolio } from "../src/lib/validation/portfolio.schema";
const portfolio = { ...emptyPortfolio, profile: { ...emptyPortfolio.profile, fullName: 'Zoë Müller', headline: 'Designer & developer', email: 'zoe@example.com', location: 'Tirana, Albania' }, socials: [{ label: 'Website', url: 'https://example.com/work?source=card&campaign=portfolio' }] };
test("business cards contain real profile contacts and the published portfolio link", () => {
  const [front, back] = renderBusinessCardFaces(portfolio, 'https://myfolio.example/p/zoe');
  assert.ok(front.includes('Zoë Müller'));
  assert.ok(front.includes('Designer &amp; developer'));
  assert.ok(back.includes('mailto:zoe@example.com'));
  assert.ok(back.includes('Tirana, Albania'));
  assert.ok(back.includes('href="https://myfolio.example/p/zoe"'));
  assert.ok(back.includes('example.com/work'));
  assert.ok(!back.includes('>example.com/work?'));
});
test("business cards escape user-controlled text and reject executable links", () => {
  const input = { ...portfolio, profile: { ...portfolio.profile, fullName: '<script>alert(1)</script>', headline: '" onclick="bad()', avatarUrl: 'javascript:alert(1)' }, socials: [{ label: '<img onerror=bad()>', url: 'javascript:alert(1)' }] };
  const html = renderBusinessCardHtml(input, 'javascript:alert(2)');
  assert.ok(html.includes('&lt;script&gt;'));
  assert.ok(!html.includes('<script>'));
  assert.ok(!html.includes('javascript:'));
  assert.ok(!html.includes('<img onerror='));
});
test("a business card without optional contact fields invents no email or location", () => {
  const [front, back] = renderBusinessCardFaces({ ...emptyPortfolio, profile: { ...emptyPortfolio.profile, fullName: 'A New Creator', headline: 'Frontend developer' } }, 'https://example.com/p/new-creator');
  assert.ok(front.includes('A New Creator'));
  assert.ok(!back.includes('mailto:'));
  assert.ok(!back.includes('Based in'));
  assert.ok(back.includes('https://example.com/p/new-creator'));
});

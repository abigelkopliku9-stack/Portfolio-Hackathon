import { test } from "node:test";
import assert from "node:assert/strict";
import { renderCvHtml } from "../src/lib/cv";
import { emptyPortfolio } from "../src/lib/validation/portfolio.schema";
import { isPublicAddress, preparePdfImages } from "../src/lib/export/pdfImages";
const profile = { ...emptyPortfolio.profile, fullName: 'Zoë Müller <script>alert("name")</script>', headline: 'Designer & developer', bio: '<img src=x onerror="alert(1)">', avatarUrl: '/not-a-valid-upload' };
test("CV exports escape profile content, skill names, and attribute values", () => {
  const html = renderCvHtml({ ...emptyPortfolio, profile, skills: [{ name: '<script>skill()</script>', category: '" onclick="bad()', level: 4 }] });
  assert.ok(!html.includes('<script>'));
  assert.ok(!html.includes('<img src=x'));
  assert.ok(html.includes('Zoë Müller'));
  assert.ok(html.includes('&lt;script&gt;'));
  assert.ok(html.includes('&quot; onclick=&quot;'));
  assert.ok(!html.includes('src="/not-a-valid-upload"'));
});
test("CV exports refuse executable links while retaining valid public links", () => {
  const html = renderCvHtml({ ...emptyPortfolio, profile, socials: [{ label: 'Bad', url: 'javascript:alert(1)' }, { label: 'Work', url: 'https://example.com/?a=1&b=2' }] });
  assert.ok(!html.includes('javascript:'));
  assert.ok(html.includes('href="https://example.com/?a=1&amp;b=2"'));
});
test("the PDF image loader excludes local, private, mapped and multicast networks", () => {
  for (const ip of ['127.0.0.1', '10.1.2.3', '192.168.1.1', '172.16.1.1', '169.254.169.254', '100.64.0.1', '0.0.0.0', '224.0.0.1', '::1', '::ffff:127.0.0.1', 'fc00::1', 'fe80::1', 'ff02::1']) assert.equal(isPublicAddress(ip), false, ip);
  assert.equal(isPublicAddress('8.8.8.8'), true);
  assert.equal(isPublicAddress('2606:4700:4700::1111'), true);
});
test("unavailable or private images do not block an export or mutate portfolio data", async () => {
  const source = { ...emptyPortfolio, profile: { ...profile, avatarUrl: 'http://127.0.0.1/private' } };
  const prepared = await preparePdfImages(source);
  assert.equal(prepared.profile.avatarUrl, '');
  assert.equal(source.profile.avatarUrl, 'http://127.0.0.1/private');
  assert.equal(prepared.profile.fullName, source.profile.fullName);
});

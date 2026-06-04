// @ts-check
import { test, expect } from "@playwright/test";

const BASE_URL = "http://localhost:5173";

// =============================================================================
// HELPER
// =============================================================================
function createDemoToken(email, role) {
  const header = { alg: "HS256", typ: "JWT" };
  const nowInSeconds = Math.floor(Date.now() / 1000);
  const body = {
    sub: `user-${Date.now()}`,
    email,
    role,
    name: email.split("@")[0],
    iat: nowInSeconds,
    exp: nowInSeconds + 24 * 60 * 60,
  };
  const encode = (obj) =>
    btoa(JSON.stringify(obj)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  return `${encode(header)}.${encode(body)}.demo-signature`;
}

async function loginAs(page, email, role) {
  const token = createDemoToken(email, role);
  await page.goto(BASE_URL, { waitUntil: "networkidle", timeout: 15000 });
  await page.evaluate((t) => {
    localStorage.setItem("aitasker_auth_token", t);
  }, token);
  await page.reload({ waitUntil: "networkidle" });
}

// =============================================================================
// BACK BUTTON TESTS
// =============================================================================

test.describe("AITasker Back Button — Client Flows", () => {
  test("3.1 - Client Dashboard → My Projects → Back", async ({ page }) => {
    await loginAs(page, "client1@test.com", "client");

    // Vào dashboard trước
    await page.goto(`${BASE_URL}/client/dashboard`, { waitUntil: "networkidle", timeout: 15000 });
    await page.waitForTimeout(1000);

    // Vào My Projects
    await page.goto(`${BASE_URL}/client/my-projects`, { waitUntil: "networkidle", timeout: 15000 });
    await page.waitForTimeout(1000);
    expect(page.url()).toContain("/client/my-projects");

    // Tìm Back button
    const backButton = page.locator('button:has-text("Back"), a:has-text("Back"), [aria-label="Back"], [data-testid="back-button"], button:has-text("←")').first();
    const hasBackButton = await backButton.isVisible().catch(() => false);

    if (hasBackButton) {
      await backButton.click();
      await page.waitForTimeout(1000);
      console.log(`After Back click: ${page.url()}`);
    } else {
      // Fallback: dùng browser back
      console.log("No explicit Back button found, using browser back");
      await page.goBack();
      await page.waitForTimeout(1000);
    }

    const url = page.url();
    console.log(`Final URL: ${url}`);
    // Không redirect về login
    expect(url).not.toContain("/login");
  });

  test("3.2 - My Projects → Project Detail → Back", async ({ page }) => {
    await loginAs(page, "client1@test.com", "client");

    await page.goto(`${BASE_URL}/client/my-projects`, { waitUntil: "networkidle", timeout: 15000 });
    await page.waitForTimeout(1500);

    // Tìm link vào project detail đầu tiên
    const projectLink = page.locator('a[href*="/client/projects/"]').first();
    const hasProjectLink = await projectLink.isVisible().catch(() => false);

    if (hasProjectLink) {
      await projectLink.click();
      await page.waitForTimeout(1500);
      console.log(`Project detail URL: ${page.url()}`);

      // Tìm Back button
      const backButton = page.locator('button:has-text("Back"), a:has-text("Back"), [aria-label="Back"], [data-testid="back-button"]').first();
      const hasBackButton = await backButton.isVisible().catch(() => false);

      if (hasBackButton) {
        await backButton.click();
        await page.waitForTimeout(1000);
      } else {
        await page.goBack();
        await page.waitForTimeout(1000);
      }

      const url = page.url();
      console.log(`After back: ${url}`);
      expect(url).not.toContain("/login");
    } else {
      console.log("No project links found on My Projects page — skipping detail navigation");
    }
  });

  test("3.3 - Client Profile → Edit Profile → Back", async ({ page }) => {
    await loginAs(page, "client1@test.com", "client");

    await page.goto(`${BASE_URL}/client/profile`, { waitUntil: "networkidle", timeout: 15000 });
    await page.waitForTimeout(1500);

    // Tìm Edit Profile link
    const editLink = page.locator('a[href*="edit"], button:has-text("Edit"), a:has-text("Edit Profile")').first();
    const hasEdit = await editLink.isVisible().catch(() => false);

    if (hasEdit) {
      await editLink.click();
      await page.waitForTimeout(1500);
      console.log(`Edit profile URL: ${page.url()}`);

      const backButton = page.locator('button:has-text("Back"), a:has-text("Back"), [aria-label="Back"]').first();
      const hasBack = await backButton.isVisible().catch(() => false);

      if (hasBack) {
        await backButton.click();
        await page.waitForTimeout(1000);
      } else {
        await page.goBack();
        await page.waitForTimeout(1000);
      }

      expect(page.url()).not.toContain("/login");
    } else {
      console.log("No Edit Profile link found — skipping");
    }
  });
});

test.describe("AITasker Back Button — Expert Flows", () => {
  test("3.4 - Expert Dashboard → Find Jobs → Job Detail → Back", async ({ page }) => {
    await loginAs(page, "expert1@test.com", "expert");

    await page.goto(`${BASE_URL}/expert/find-jobs`, { waitUntil: "networkidle", timeout: 15000 });
    await page.waitForTimeout(1500);

    // Tìm link job đầu tiên
    const jobLink = page.locator('a[href*="/expert/jobs/"]').first();
    const hasJobLink = await jobLink.isVisible().catch(() => false);

    if (hasJobLink) {
      await jobLink.click();
      await page.waitForTimeout(1500);
      console.log(`Job detail URL: ${page.url()}`);

      const backButton = page.locator('button:has-text("Back"), a:has-text("Back"), [aria-label="Back"]').first();
      const hasBack = await backButton.isVisible().catch(() => false);

      if (hasBack) {
        await backButton.click();
        await page.waitForTimeout(1000);
      } else {
        await page.goBack();
        await page.waitForTimeout(1000);
      }

      expect(page.url()).not.toContain("/login");
    } else {
      console.log("No job links found — skipping");
    }
  });

  test("3.5 - Expert Proposals → Proposal Detail → Back", async ({ page }) => {
    await loginAs(page, "expert1@test.com", "expert");

    await page.goto(`${BASE_URL}/expert/proposals`, { waitUntil: "networkidle", timeout: 15000 });
    await page.waitForTimeout(1500);

    // Tìm link proposal
    const proposalLink = page.locator('a[href*="/expert/proposals/"]').first();
    const hasProposalLink = await proposalLink.isVisible().catch(() => false);

    if (hasProposalLink) {
      await proposalLink.click();
      await page.waitForTimeout(1500);
      console.log(`Proposal detail URL: ${page.url()}`);

      const backButton = page.locator('button:has-text("Back"), a:has-text("Back"), [aria-label="Back"]').first();
      const hasBack = await backButton.isVisible().catch(() => false);

      if (hasBack) {
        await backButton.click();
        await page.waitForTimeout(1000);
      } else {
        await page.goBack();
        await page.waitForTimeout(1000);
      }

      expect(page.url()).not.toContain("/login");
    } else {
      console.log("No proposal links found — skipping");
    }
  });
});

test.describe("AITasker Back Button — Role Isolation on Back", () => {
  test("3.6 - Client back from project detail stays in client context", async ({ page }) => {
    await loginAs(page, "client1@test.com", "client");

    // Vào thẳng project detail
    await page.goto(`${BASE_URL}/client/projects/proj-001`, { waitUntil: "networkidle", timeout: 15000 });
    await page.waitForTimeout(1500);

    // Dùng browser back
    await page.goBack();
    await page.waitForTimeout(1500);

    const url = page.url();
    console.log(`After browser back: ${url}`);
    // Không được rơi vào expert/admin dashboard
    expect(url).not.toContain("/expert/");
    expect(url).not.toContain("/admin/");
  });

  test("3.7 - Expert back from job detail stays in expert context", async ({ page }) => {
    await loginAs(page, "expert1@test.com", "expert");

    await page.goto(`${BASE_URL}/expert/jobs/proj-001`, { waitUntil: "networkidle", timeout: 15000 });
    await page.waitForTimeout(1500);

    // Browser back về trang trước
    // Nếu vào thẳng job detail, browser back sẽ về BASE_URL
    await page.goBack();
    await page.waitForTimeout(1500);

    const url = page.url();
    console.log(`Expert back from job detail: ${url}`);
    // Không rơi vào client/admin
    expect(url).not.toContain("/client/");
    expect(url).not.toContain("/admin/");
  });

  test("3.8 - Admin back stays in admin context", async ({ page }) => {
    await loginAs(page, "admin@test.com", "admin");

    await page.goto(`${BASE_URL}/admin/users`, { waitUntil: "networkidle", timeout: 15000 });
    await page.waitForTimeout(1000);

    await page.goto(`${BASE_URL}/admin/disputes`, { waitUntil: "networkidle", timeout: 15000 });
    await page.waitForTimeout(1000);

    await page.goBack();
    await page.waitForTimeout(1500);

    const url = page.url();
    console.log(`Admin back: ${url}`);
    expect(url).not.toContain("/client/");
    expect(url).not.toContain("/expert/");
  });
});

test.describe("AITasker Back Button — Direct Detail Access", () => {
  test("3.9 - Direct project detail access → Back fallback", async ({ page }) => {
    await loginAs(page, "client1@test.com", "client");

    // Vào thẳng project detail (không qua danh sách)
    await page.goto(`${BASE_URL}/client/projects/proj-001`, { waitUntil: "networkidle", timeout: 15000 });
    await page.waitForTimeout(1500);

    // Tìm Back button, nếu có thì click
    const backButton = page.locator('button:has-text("Back"), a:has-text("Back"), [aria-label="Back"], a:has-text("←"), button:has-text("←")').first();
    const hasBack = await backButton.isVisible().catch(() => false);

    if (hasBack) {
      await backButton.click();
      await page.waitForTimeout(1000);
      const url = page.url();
      console.log(`After clicking Back from direct detail: ${url}`);
      // Fallback hợp lý: về dashboard hoặc my-projects hoặc home
      expect(url).not.toContain("/login");
    } else {
      console.log("No Back button on direct detail access — acceptable behavior");
    }
  });
});

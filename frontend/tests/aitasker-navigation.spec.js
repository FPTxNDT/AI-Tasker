// @ts-check
import { test, expect } from "@playwright/test";

const BASE_URL = "http://localhost:5173";

// =============================================================================
// HELPER: Inject demo auth token vào localStorage
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
  // Reload để auth context nhận token
  await page.reload({ waitUntil: "networkidle" });
}

// =============================================================================
// NAVIGATION & BUTTON TESTS
// =============================================================================

test.describe("AITasker Navigation — Public Routes", () => {
  test("2.1 - Navigate to Login page", async ({ page }) => {
    await page.goto(`${BASE_URL}/login`, { waitUntil: "networkidle", timeout: 15000 });
    const url = page.url();
    expect(url).toContain("/login");
    // Kiểm tra có form login (input email hoặc nút submit)
    const hasForm = (await page.locator('input[type="email"], input[name="email"], input[placeholder*="email" i]').count()) > 0;
    const hasSubmit = (await page.locator('button[type="submit"]').count()) > 0;
    console.log(`Login page - form: ${hasForm}, submit: ${hasSubmit}`);
  });

  test("2.2 - Navigate to Sign Up page", async ({ page }) => {
    await page.goto(`${BASE_URL}/signup`, { waitUntil: "networkidle", timeout: 15000 });
    const url = page.url();
    expect(url).toContain("/signup");
  });

  test("2.3 - Navigate to Forgot Password page", async ({ page }) => {
    await page.goto(`${BASE_URL}/forgot-password`, { waitUntil: "networkidle", timeout: 10000 });
    // Có thể redirect hoặc hiển thị — ghi nhận
    console.log(`Forgot password URL: ${page.url()}`);
  });

  test("2.4 - Unauthorized page shows access denied", async ({ page }) => {
    await page.goto(`${BASE_URL}/unauthorized`, { waitUntil: "networkidle", timeout: 10000 });
    const bodyText = await page.locator("body").textContent();
    expect(bodyText).toMatch(/access denied|unauthorized|permission/i);
  });
});

test.describe("AITasker Navigation — Client Routes", () => {
  test("2.5 - Client Dashboard loads after login", async ({ page }) => {
    await loginAs(page, "client1@test.com", "client");
    await page.goto(`${BASE_URL}/client/dashboard`, { waitUntil: "networkidle", timeout: 15000 });
    await page.waitForTimeout(1500);

    const url = page.url();
    console.log(`Client dashboard URL: ${url}`);
    // Dashboard phải load được (không redirect về login)
    expect(url).not.toContain("/login");
  });

  test("2.6 - Client My Projects page loads", async ({ page }) => {
    await loginAs(page, "client1@test.com", "client");
    await page.goto(`${BASE_URL}/client/my-projects`, { waitUntil: "networkidle", timeout: 15000 });
    await page.waitForTimeout(1500);

    const url = page.url();
    expect(url).toContain("/client/my-projects");
  });

  test("2.7 - Client Post Project page loads", async ({ page }) => {
    await loginAs(page, "client1@test.com", "client");
    await page.goto(`${BASE_URL}/client/post-project`, { waitUntil: "networkidle", timeout: 15000 });
    await page.waitForTimeout(1500);

    const url = page.url();
    expect(url).toContain("/client/post-project");
  });

  test("2.8 - Client Profile page loads", async ({ page }) => {
    await loginAs(page, "client1@test.com", "client");
    await page.goto(`${BASE_URL}/client/profile`, { waitUntil: "networkidle", timeout: 15000 });
    await page.waitForTimeout(1500);

    const url = page.url();
    expect(url).toContain("/client/profile");
  });

  test("2.9 - Client Experts list loads", async ({ page }) => {
    await loginAs(page, "client1@test.com", "client");
    await page.goto(`${BASE_URL}/client/experts`, { waitUntil: "networkidle", timeout: 15000 });
    await page.waitForTimeout(1500);

    const url = page.url();
    expect(url).toContain("/client/experts");
  });

  test("2.10 - Client Project Detail loads (with mock id)", async ({ page }) => {
    await loginAs(page, "client1@test.com", "client");
    // Dùng project ID từ mock DB nếu biết, nếu không thì dùng ID giả để test route
    await page.goto(`${BASE_URL}/client/projects/proj-001`, { waitUntil: "networkidle", timeout: 15000 });
    await page.waitForTimeout(1500);

    const url = page.url();
    console.log(`Project detail URL: ${url}`);
    // Không redirect về login là pass
    expect(url).not.toContain("/login");
  });
});

test.describe("AITasker Navigation — Expert Routes", () => {
  test("2.11 - Expert Dashboard loads after login", async ({ page }) => {
    await loginAs(page, "expert1@test.com", "expert");
    await page.goto(`${BASE_URL}/expert/dashboard`, { waitUntil: "networkidle", timeout: 15000 });
    await page.waitForTimeout(1500);

    const url = page.url();
    expect(url).not.toContain("/login");
  });

  test("2.12 - Expert Job List (find-jobs) loads", async ({ page }) => {
    await loginAs(page, "expert1@test.com", "expert");
    await page.goto(`${BASE_URL}/expert/find-jobs`, { waitUntil: "networkidle", timeout: 15000 });
    await page.waitForTimeout(1500);

    const url = page.url();
    expect(url).toContain("/expert/find-jobs");
  });

  test("2.13 - Expert Job Detail loads", async ({ page }) => {
    await loginAs(page, "expert1@test.com", "expert");
    await page.goto(`${BASE_URL}/expert/jobs/proj-001`, { waitUntil: "networkidle", timeout: 15000 });
    await page.waitForTimeout(1500);

    const url = page.url();
    expect(url).not.toContain("/login");
  });

  test("2.14 - Expert Proposals page loads", async ({ page }) => {
    await loginAs(page, "expert1@test.com", "expert");
    await page.goto(`${BASE_URL}/expert/proposals`, { waitUntil: "networkidle", timeout: 15000 });
    await page.waitForTimeout(1500);

    const url = page.url();
    expect(url).toContain("/expert/proposals");
  });

  test("2.15 - Expert Wallet page loads", async ({ page }) => {
    await loginAs(page, "expert1@test.com", "expert");
    await page.goto(`${BASE_URL}/expert/wallet`, { waitUntil: "networkidle", timeout: 15000 });
    await page.waitForTimeout(1500);

    const url = page.url();
    expect(url).toContain("/expert/wallet");
  });
});

test.describe("AITasker Navigation — Admin Routes", () => {
  test("2.16 - Admin Dashboard loads after login", async ({ page }) => {
    await loginAs(page, "admin@test.com", "admin");
    await page.goto(`${BASE_URL}/admin/dashboard`, { waitUntil: "networkidle", timeout: 15000 });
    await page.waitForTimeout(1500);

    const url = page.url();
    expect(url).not.toContain("/login");
  });

  test("2.17 - Admin Users page loads", async ({ page }) => {
    await loginAs(page, "admin@test.com", "admin");
    await page.goto(`${BASE_URL}/admin/users`, { waitUntil: "networkidle", timeout: 15000 });
    await page.waitForTimeout(1500);

    const url = page.url();
    expect(url).toContain("/admin/users");
  });

  test("2.18 - Admin Disputes page loads", async ({ page }) => {
    await loginAs(page, "admin@test.com", "admin");
    await page.goto(`${BASE_URL}/admin/disputes`, { waitUntil: "networkidle", timeout: 15000 });
    await page.waitForTimeout(1500);

    const url = page.url();
    expect(url).toContain("/admin/disputes");
  });

  test("2.19 - Admin Revenue page loads", async ({ page }) => {
    await loginAs(page, "admin@test.com", "admin");
    await page.goto(`${BASE_URL}/admin/revenue`, { waitUntil: "networkidle", timeout: 15000 });
    await page.waitForTimeout(1500);

    const url = page.url();
    expect(url).toContain("/admin/revenue");
  });
});

test.describe("AITasker Navigation — Common Routes", () => {
  test("2.20 - Notifications page loads (authenticated)", async ({ page }) => {
    await loginAs(page, "client1@test.com", "client");
    await page.goto(`${BASE_URL}/notifications`, { waitUntil: "networkidle", timeout: 15000 });
    await page.waitForTimeout(1500);

    const url = page.url();
    expect(url).not.toContain("/login");
  });

  test("2.21 - Messenger page loads (authenticated)", async ({ page }) => {
    await loginAs(page, "client1@test.com", "client");
    await page.goto(`${BASE_URL}/messenger`, { waitUntil: "networkidle", timeout: 15000 });
    await page.waitForTimeout(1500);

    const url = page.url();
    expect(url).not.toContain("/login");
  });
});

test.describe("AITasker Navigation — Role Isolation", () => {
  test("2.22 - Client cannot access Expert dashboard", async ({ page }) => {
    await loginAs(page, "client1@test.com", "client");
    await page.goto(`${BASE_URL}/expert/dashboard`, { waitUntil: "networkidle", timeout: 15000 });
    await page.waitForTimeout(1500);

    const url = page.url();
    const bodyText = await page.locator("body").textContent();
    const isDenied = bodyText.includes("Access Denied") || bodyText.includes("Unauthorized") || url.includes("/unauthorized") || url.includes("/login");
    console.log(`Client → Expert dashboard: URL=${url}, Denied=${isDenied}`);
    // Client không được vào expert dashboard
    expect(isDenied).toBeTruthy();
  });

  test("2.23 - Expert cannot access Client dashboard", async ({ page }) => {
    await loginAs(page, "expert1@test.com", "expert");
    await page.goto(`${BASE_URL}/client/dashboard`, { waitUntil: "networkidle", timeout: 15000 });
    await page.waitForTimeout(1500);

    const url = page.url();
    const bodyText = await page.locator("body").textContent();
    const isDenied = bodyText.includes("Access Denied") || bodyText.includes("Unauthorized") || url.includes("/unauthorized") || url.includes("/login");
    console.log(`Expert → Client dashboard: URL=${url}, Denied=${isDenied}`);
    expect(isDenied).toBeTruthy();
  });

  test("2.24 - Client cannot access Admin dashboard", async ({ page }) => {
    await loginAs(page, "client1@test.com", "client");
    await page.goto(`${BASE_URL}/admin/dashboard`, { waitUntil: "networkidle", timeout: 15000 });
    await page.waitForTimeout(1500);

    const url = page.url();
    const bodyText = await page.locator("body").textContent();
    const isDenied = bodyText.includes("Access Denied") || bodyText.includes("Unauthorized") || url.includes("/unauthorized") || url.includes("/login");
    console.log(`Client → Admin dashboard: URL=${url}, Denied=${isDenied}`);
    expect(isDenied).toBeTruthy();
  });
});

test.describe("AITasker Navigation — Button Existence Checks", () => {
  test("2.25 - Client Dashboard has action buttons (verified labels)", async ({ page }) => {
    await loginAs(page, "client1@test.com", "client");
    await page.goto(`${BASE_URL}/client/dashboard`, { waitUntil: "networkidle", timeout: 15000 });
    await page.waitForTimeout(2000);

    // Dùng getByText với regex thật (không phải regex.source string)
    // Labels thực tế từ ClientDashboard.jsx:
    //   - "Post New Project" (line 100)
    //   - "All Projects" (line 96)
    //   - "Recommended Experts" (section header, line 313)

    const buttonChecks = [
      { locator: page.getByText(/Post New Project/i), name: "Post New Project" },
      { locator: page.getByText(/All Projects/i), name: "All Projects (→ /client/my-projects)" },
      { locator: page.getByText(/Recommended Experts/i), name: "Recommended Experts section" },
    ];

    for (const btn of buttonChecks) {
      const visible = await btn.locator.first().isVisible().catch(() => false);
      console.log(`Button "${btn.name}": ${visible ? "FOUND ✓" : "NOT FOUND ✗"}`);
      expect(visible).toBeTruthy();
    }
  });

  test("2.26 - Expert Dashboard has action buttons (verified labels)", async ({ page }) => {
    await loginAs(page, "expert1@test.com", "expert");
    await page.goto(`${BASE_URL}/expert/dashboard`, { waitUntil: "networkidle", timeout: 15000 });
    await page.waitForTimeout(2000);

    // Labels thực tế từ ExpertDashboard.jsx:
    //   - "Browse All Jobs" (line 106) — header button
    //   - "My Active Contracts" (line 176) — section header
    //   - "Recommended Projects" (line 311) — section header

    const buttonChecks = [
      { locator: page.getByText(/Browse All Jobs/i), name: "Browse All Jobs (→ /expert/find-jobs)" },
      { locator: page.getByText(/My Active Contracts/i), name: "My Active Contracts section" },
      { locator: page.getByText(/Recommended Projects/i), name: "Recommended Projects section" },
    ];

    for (const btn of buttonChecks) {
      const visible = await btn.locator.first().isVisible().catch(() => false);
      console.log(`Button "${btn.name}": ${visible ? "FOUND ✓" : "NOT FOUND ✗"}`);
      expect(visible).toBeTruthy();
    }
  });

  test("2.27 - Admin Dashboard has management sections (verified labels)", async ({ page }) => {
    await loginAs(page, "admin@test.com", "admin");
    await page.goto(`${BASE_URL}/admin/dashboard`, { waitUntil: "networkidle", timeout: 15000 });
    await page.waitForTimeout(2000);

    // Labels thực tế từ AdminDashboard.jsx:
    //   - "User Management" (line 97)
    //   - "Dispute Resolution" (line 98)
    //   - "Revenue Report" (line 99)
    //   - "Total Users" (stat card, line 74)
    //   - "Open Disputes" (stat card, line 76)
    //   - "Total Revenue" (stat card, line 77)

    const buttonChecks = [
      { locator: page.getByText(/User Management/i), name: "User Management (→ /admin/users)" },
      { locator: page.getByText(/Dispute Resolution/i), name: "Dispute Resolution (→ /admin/disputes)" },
      { locator: page.getByText(/Revenue Report/i), name: "Revenue Report (→ /admin/revenue)" },
    ];

    for (const btn of buttonChecks) {
      const visible = await btn.locator.first().isVisible().catch(() => false);
      console.log(`Button "${btn.name}": ${visible ? "FOUND ✓" : "NOT FOUND ✗"}`);
      expect(visible).toBeTruthy();
    }
  });
});

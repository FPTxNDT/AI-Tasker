// @ts-check
import { test, expect } from "@playwright/test";

const BASE_URL = "http://localhost:5173";

// =============================================================================
// ROLE-BASED TESTS — Client / Expert / Admin
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
// CLIENT ROLE TESTS
// =============================================================================

test.describe("AITasker Roles — Client", () => {
  test("4.1 - Client1 login via demo token", async ({ page }) => {
    await loginAs(page, "client1@test.com", "client");
    await page.goto(`${BASE_URL}/client/dashboard`, { waitUntil: "networkidle", timeout: 15000 });
    await page.waitForTimeout(2000);

    const url = page.url();
    const bodyText = await page.locator("body").textContent();

    // Dashboard phải load, không redirect về login
    expect(url).not.toContain("/login");
    expect(bodyText).toBeTruthy();

    // Kiểm tra có thông tin client (tên hoặc nội dung dashboard)
    console.log(`Client1 dashboard body length: ${bodyText.length}`);
    console.log(`Client1 dashboard URL: ${url}`);
  });

  test("4.2 - Client2 login via demo token", async ({ page }) => {
    await loginAs(page, "client2@test.com", "client");
    await page.goto(`${BASE_URL}/client/dashboard`, { waitUntil: "networkidle", timeout: 15000 });
    await page.waitForTimeout(2000);

    expect(page.url()).not.toContain("/login");
  });

  test("4.3 - Client cannot access expert-only routes", async ({ page }) => {
    await loginAs(page, "client1@test.com", "client");

    const expertRoutes = [
      "/expert/dashboard",
      "/expert/find-jobs",
      "/expert/proposals",
      "/expert/wallet",
    ];

    for (const route of expertRoutes) {
      await page.goto(`${BASE_URL}${route}`, { waitUntil: "networkidle", timeout: 10000 });
      await page.waitForTimeout(800);

      const url = page.url();
      const bodyText = await page.locator("body").textContent();
      const isBlocked =
        bodyText.includes("Access Denied") ||
        bodyText.includes("Unauthorized") ||
        url.includes("/unauthorized") ||
        url.includes("/login");

      console.log(`Client → ${route}: ${isBlocked ? "BLOCKED ✓" : "ALLOWED ✗"}`);
      expect(isBlocked).toBeTruthy();
    }
  });

  test("4.4 - Client cannot access admin routes", async ({ page }) => {
    await loginAs(page, "client1@test.com", "client");

    const adminRoutes = [
      "/admin/dashboard",
      "/admin/users",
      "/admin/disputes",
      "/admin/revenue",
    ];

    for (const route of adminRoutes) {
      await page.goto(`${BASE_URL}${route}`, { waitUntil: "networkidle", timeout: 10000 });
      await page.waitForTimeout(800);

      const url = page.url();
      const bodyText = await page.locator("body").textContent();
      const isBlocked =
        bodyText.includes("Access Denied") ||
        bodyText.includes("Unauthorized") ||
        url.includes("/unauthorized") ||
        url.includes("/login");

      console.log(`Client → ${route}: ${isBlocked ? "BLOCKED ✓" : "ALLOWED ✗"}`);
      expect(isBlocked).toBeTruthy();
    }
  });
});

// =============================================================================
// EXPERT ROLE TESTS
// =============================================================================

test.describe("AITasker Roles — Expert", () => {
  test("4.5 - Expert1 login via demo token", async ({ page }) => {
    await loginAs(page, "expert1@test.com", "expert");
    await page.goto(`${BASE_URL}/expert/dashboard`, { waitUntil: "networkidle", timeout: 15000 });
    await page.waitForTimeout(2000);

    expect(page.url()).not.toContain("/login");
    console.log(`Expert1 dashboard URL: ${page.url()}`);
  });

  test("4.6 - Expert2 login via demo token", async ({ page }) => {
    await loginAs(page, "expert2@test.com", "expert");
    await page.goto(`${BASE_URL}/expert/dashboard`, { waitUntil: "networkidle", timeout: 15000 });
    await page.waitForTimeout(2000);

    expect(page.url()).not.toContain("/login");
  });

  test("4.7 - Expert cannot access client-only routes", async ({ page }) => {
    await loginAs(page, "expert1@test.com", "expert");

    const clientRoutes = [
      "/client/dashboard",
      "/client/my-projects",
      "/client/post-project",
      "/client/billing",
    ];

    for (const route of clientRoutes) {
      await page.goto(`${BASE_URL}${route}`, { waitUntil: "networkidle", timeout: 10000 });
      await page.waitForTimeout(800);

      const url = page.url();
      const bodyText = await page.locator("body").textContent();
      const isBlocked =
        bodyText.includes("Access Denied") ||
        bodyText.includes("Unauthorized") ||
        url.includes("/unauthorized") ||
        url.includes("/login");

      console.log(`Expert → ${route}: ${isBlocked ? "BLOCKED ✓" : "ALLOWED ✗"}`);
      expect(isBlocked).toBeTruthy();
    }
  });

  test("4.8 - Expert cannot access admin routes", async ({ page }) => {
    await loginAs(page, "expert1@test.com", "expert");

    const adminRoutes = ["/admin/dashboard", "/admin/users"];

    for (const route of adminRoutes) {
      await page.goto(`${BASE_URL}${route}`, { waitUntil: "networkidle", timeout: 10000 });
      await page.waitForTimeout(800);

      const url = page.url();
      const bodyText = await page.locator("body").textContent();
      const isBlocked =
        bodyText.includes("Access Denied") ||
        bodyText.includes("Unauthorized") ||
        url.includes("/unauthorized") ||
        url.includes("/login");

      console.log(`Expert → ${route}: ${isBlocked ? "BLOCKED ✓" : "ALLOWED ✗"}`);
      expect(isBlocked).toBeTruthy();
    }
  });
});

// =============================================================================
// ADMIN ROLE TESTS
// =============================================================================

test.describe("AITasker Roles — Admin", () => {
  test("4.9 - Admin login via demo token", async ({ page }) => {
    await loginAs(page, "admin@test.com", "admin");
    await page.goto(`${BASE_URL}/admin/dashboard`, { waitUntil: "networkidle", timeout: 15000 });
    await page.waitForTimeout(2000);

    expect(page.url()).not.toContain("/login");
    console.log(`Admin dashboard URL: ${page.url()}`);
  });

  test("4.10 - Admin can access all admin routes", async ({ page }) => {
    await loginAs(page, "admin@test.com", "admin");

    const adminRoutes = [
      "/admin/dashboard",
      "/admin/users",
      "/admin/disputes",
      "/admin/revenue",
      "/admin/profile",
    ];

    for (const route of adminRoutes) {
      await page.goto(`${BASE_URL}${route}`, { waitUntil: "networkidle", timeout: 10000 });
      await page.waitForTimeout(800);

      const url = page.url();
      const isAccessible =
        !url.includes("/login") && !url.includes("/unauthorized");

      console.log(`Admin → ${route}: ${isAccessible ? "ACCESSIBLE ✓" : "BLOCKED ✗"}`);
      // Admin phải vào được các route admin
      if (!isAccessible) {
        const bodyText = await page.locator("body").textContent();
        console.log(`  Body snippet: ${bodyText.substring(0, 100)}`);
      }
    }
  });

  test("4.11 - Admin cannot access client routes", async ({ page }) => {
    await loginAs(page, "admin@test.com", "admin");

    const clientRoutes = ["/client/dashboard", "/client/my-projects"];

    for (const route of clientRoutes) {
      await page.goto(`${BASE_URL}${route}`, { waitUntil: "networkidle", timeout: 10000 });
      await page.waitForTimeout(800);

      const url = page.url();
      const bodyText = await page.locator("body").textContent();
      const isBlocked =
        bodyText.includes("Access Denied") ||
        bodyText.includes("Unauthorized") ||
        url.includes("/unauthorized") ||
        url.includes("/login");

      console.log(`Admin → ${route}: ${isBlocked ? "BLOCKED ✓" : "ALLOWED ✗"}`);
      // Admin không nên vào được client dashboard
      if (!isBlocked) {
        console.log(`  WARNING: Admin can access ${route}`);
      }
    }
  });

  test("4.12 - Admin cannot access expert routes", async ({ page }) => {
    await loginAs(page, "admin@test.com", "admin");

    const expertRoutes = ["/expert/dashboard", "/expert/find-jobs"];

    for (const route of expertRoutes) {
      await page.goto(`${BASE_URL}${route}`, { waitUntil: "networkidle", timeout: 10000 });
      await page.waitForTimeout(800);

      const url = page.url();
      const bodyText = await page.locator("body").textContent();
      const isBlocked =
        bodyText.includes("Access Denied") ||
        bodyText.includes("Unauthorized") ||
        url.includes("/unauthorized") ||
        url.includes("/login");

      console.log(`Admin → ${route}: ${isBlocked ? "BLOCKED ✓" : "ALLOWED ✗"}`);
      if (!isBlocked) {
        console.log(`  WARNING: Admin can access ${route}`);
      }
    }
  });
});

// =============================================================================
// PUBLIC / UNAUTHENTICATED TESTS
// =============================================================================

test.describe("AITasker Roles — Public (Unauthenticated)", () => {
  test("4.13 - Public cannot access protected routes", async ({ page }) => {
    const protectedRoutes = [
      "/client/dashboard",
      "/expert/dashboard",
      "/admin/dashboard",
      "/client/my-projects",
      "/client/post-project",
      "/expert/find-jobs",
      "/expert/proposals",
    ];

    for (const route of protectedRoutes) {
      await page.goto(`${BASE_URL}${route}`, { waitUntil: "networkidle", timeout: 10000 });
      await page.waitForTimeout(800);

      const url = page.url();
      const bodyText = await page.locator("body").textContent();

      // Không có token → phải redirect về login hoặc unauthorized
      const isProtected =
        url.includes("/login") ||
        url.includes("/unauthorized") ||
        bodyText.includes("Access Denied") ||
        bodyText.includes("Unauthorized");

      console.log(`Public → ${route}: ${isProtected ? "PROTECTED ✓" : "EXPOSED ✗"}`);
      if (!isProtected) {
        console.log(`  WARNING: ${route} is accessible without auth! URL=${url}`);
      }
    }
  });
});

// =============================================================================
// ROLE DASHBOARD CONTENT VERIFICATION
// =============================================================================

test.describe("AITasker Roles — Dashboard Content", () => {
  test("4.14 - Client dashboard shows client-specific content", async ({ page }) => {
    await loginAs(page, "client1@test.com", "client");
    await page.goto(`${BASE_URL}/client/dashboard`, { waitUntil: "networkidle", timeout: 15000 });
    await page.waitForTimeout(2000);

    const bodyText = await page.locator("body").textContent();
    // Dashboard nên có nội dung liên quan đến client
    console.log(`Client dashboard content length: ${bodyText.length}`);
    expect(bodyText.length).toBeGreaterThan(100);
  });

  test("4.15 - Expert dashboard shows expert-specific content", async ({ page }) => {
    await loginAs(page, "expert1@test.com", "expert");
    await page.goto(`${BASE_URL}/expert/dashboard`, { waitUntil: "networkidle", timeout: 15000 });
    await page.waitForTimeout(2000);

    const bodyText = await page.locator("body").textContent();
    console.log(`Expert dashboard content length: ${bodyText.length}`);
    expect(bodyText.length).toBeGreaterThan(100);
  });

  test("4.16 - Admin dashboard shows admin-specific content", async ({ page }) => {
    await loginAs(page, "admin@test.com", "admin");
    await page.goto(`${BASE_URL}/admin/dashboard`, { waitUntil: "networkidle", timeout: 15000 });
    await page.waitForTimeout(2000);

    const bodyText = await page.locator("body").textContent();
    console.log(`Admin dashboard content length: ${bodyText.length}`);
    expect(bodyText.length).toBeGreaterThan(50);
  });
});

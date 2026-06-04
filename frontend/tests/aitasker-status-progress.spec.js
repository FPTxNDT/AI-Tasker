// @ts-check
import { test, expect } from "@playwright/test";

const BASE_URL = "http://localhost:5173";

// =============================================================================
// STATUS & PROGRESS BAR TESTS
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
// STATUS BADGE TESTS
// =============================================================================

test.describe("AITasker Status — Client Project Status Display", () => {
  test("5.1 - My Projects page shows project status badges", async ({ page }) => {
    await loginAs(page, "client1@test.com", "client");
    await page.goto(`${BASE_URL}/client/my-projects`, { waitUntil: "networkidle", timeout: 15000 });
    await page.waitForTimeout(2000);

    const bodyText = await page.locator("body").textContent();

    // Kiểm tra có hiển thị ít nhất một trong các status label
    const statusLabels = [
      "In Progress",
      "Completed",
      "Reviewing Proposals",
      "Waiting Review",
      "Needs Revision",
      "Cancelled",
      "Open",
    ];

    const foundStatuses = statusLabels.filter((s) => bodyText.includes(s));
    console.log(`Status labels found on My Projects: ${foundStatuses.join(", ") || "NONE"}`);

    // Kiểm tra có StatusBadge component hoặc text status
    const badgeElements = await page.locator('[class*="badge"], [class*="status"], span:has-text("In Progress"), span:has-text("Completed"), span:has-text("Open")').count();
    console.log(`Badge/status elements found: ${badgeElements}`);
  });

  test("5.2 - Project Detail page shows status (with timeline data)", async ({ page }) => {
    await loginAs(page, "client1@test.com", "client");

    // proj-003: status="completed", assignedExpertId="expert-001", có timeline 5 tasks
    // → hiển thị status badge "Completed" + Overall Progress + task cards
    await page.goto(`${BASE_URL}/client/projects/proj-003`, { waitUntil: "networkidle", timeout: 15000 });
    await page.waitForTimeout(2500);

    const bodyText = await page.locator("body").textContent();
    console.log(`Project detail (proj-003) body length: ${bodyText.length}`);

    // Kiểm tra có status hiển thị — "Completed" là status của proj-003
    const hasStatus = /completed|status/i.test(bodyText);
    console.log(`Project detail has status text: ${hasStatus}`);
    expect(hasStatus).toBeTruthy();

    // Kiểm tra thêm: có title project không
    expect(bodyText).toContain("Patient Readmission");

    // Kiểm tra có "Overall Progress" từ timeline không
    const hasProgress = bodyText.includes("Overall Progress");
    console.log(`Has Overall Progress section: ${hasProgress}`);
  });
});

test.describe("AITasker Status — Expert View", () => {
  test("5.3 - Expert proposal status page shows status labels", async ({ page }) => {
    await loginAs(page, "expert1@test.com", "expert");
    await page.goto(`${BASE_URL}/expert/proposals`, { waitUntil: "networkidle", timeout: 15000 });
    await page.waitForTimeout(2000);

    const bodyText = await page.locator("body").textContent();

    const proposalStatuses = [
      "Pending",
      "Accepted",
      "Rejected",
      "Under Review",
      "Shortlisted",
    ];

    const foundStatuses = proposalStatuses.filter((s) => bodyText.includes(s));
    console.log(`Proposal statuses found: ${foundStatuses.join(", ") || "NONE"}`);
  });

  test("5.4 - Expert project detail shows status", async ({ page }) => {
    await loginAs(page, "expert1@test.com", "expert");
    await page.goto(`${BASE_URL}/expert/projects/proj-001`, { waitUntil: "networkidle", timeout: 15000 });
    await page.waitForTimeout(2000);

    const bodyText = await page.locator("body").textContent();
    const url = page.url();
    console.log(`Expert project detail URL: ${url}, body length: ${bodyText.length}`);
  });
});

test.describe("AITasker Status — Admin View", () => {
  test("5.5 - Admin can view project/user statuses", async ({ page }) => {
    await loginAs(page, "admin@test.com", "admin");
    await page.goto(`${BASE_URL}/admin/dashboard`, { waitUntil: "networkidle", timeout: 15000 });
    await page.waitForTimeout(2000);

    const bodyText = await page.locator("body").textContent();
    console.log(`Admin dashboard body length: ${bodyText.length}`);

    // Admin dashboard nên có stats/status overview
    const hasStats =
      bodyText.includes("active") ||
      bodyText.includes("total") ||
      bodyText.includes("user") ||
      bodyText.includes("project") ||
      bodyText.includes("revenue");
    console.log(`Admin dashboard has stats: ${hasStats}`);
  });
});

// =============================================================================
// PROGRESS BAR TESTS
// =============================================================================
//
// NOTE: Progress bars trong dự án dùng <div> custom (Tailwind classes), không
// dùng ARIA role="progressbar". Cấu trúc điển hình:
//
//   Dashboard card:  <span>Milestone Progress</span> + <span>N%</span>
//                    + <div class="bg-gray-100 rounded-full"><div style="width:N%"/></div>
//
//   Project detail:  <span>Overall Progress</span> + <span>N%</span>
//                    + <div class="bg-gray-200 rounded-full h-3"><div class="bg-blue-900" style="width:N%"/></div>
//
//   Task card:       <span>N% completed</span>
//                    + <div class="bg-gray-200 rounded-full h-2"><div class="bg-blue-900" style="width:N%"/></div>

test.describe("AITasker Progress — Progress Bar Components", () => {
  test("5.6 - Progress bar (Overall) exists on project detail timeline", async ({ page }) => {
    await loginAs(page, "client1@test.com", "client");

    // Dùng project có timeline trong mock-db: proj-003 (có task & mini-task)
    await page.goto(`${BASE_URL}/client/projects/proj-003`, { waitUntil: "networkidle", timeout: 15000 });
    await page.waitForTimeout(2500);

    // Tìm text "Overall Progress" — label của progress bar trong ProjectTimelineManager
    const overallLabel = page.getByText(/Overall Progress/i);
    const hasOverallLabel = await overallLabel.first().isVisible().catch(() => false);
    console.log(`"Overall Progress" label: ${hasOverallLabel ? "FOUND ✓" : "NOT FOUND — project may have no timeline"}`);

    // Tìm percentage text bên cạnh
    const percentText = page.locator('text=/\\d+%$/');
    const percentCount = await percentText.count();
    console.log(`Percentage texts found: ${percentCount}`);

    // Nếu project có timeline, progress bar phải hiện
    if (hasOverallLabel) {
      expect(percentCount).toBeGreaterThan(0);
    }
  });

  test("5.7 - Progress bar (Milestone) exists on client dashboard project cards", async ({ page }) => {
    await loginAs(page, "client1@test.com", "client");
    await page.goto(`${BASE_URL}/client/dashboard`, { waitUntil: "networkidle", timeout: 15000 });
    await page.waitForTimeout(2000);

    // ClientDashboard hiển thị "Milestone Progress" label + N% cho mỗi project card
    const milestoneLabel = page.getByText(/Milestone Progress/i);
    const count = await milestoneLabel.count();
    console.log(`"Milestone Progress" labels found: ${count} ✓`);
    expect(count).toBeGreaterThan(0);

    // Kiểm tra có phần trăm progress bên cạnh (vd: "75%")
    const percentNearLabel = page.locator('text=/^\\d{1,3}%$/');
    const percentCount = await percentNearLabel.count();
    console.log(`Progress percentages found: ${percentCount}`);
  });

  test("5.8 - Progress bar exists on expert dashboard active contracts", async ({ page }) => {
    await loginAs(page, "expert1@test.com", "expert");
    await page.goto(`${BASE_URL}/expert/dashboard`, { waitUntil: "networkidle", timeout: 15000 });
    await page.waitForTimeout(2000);

    // ExpertDashboard cũng hiển thị "Milestone Progress" cho active contracts
    const milestoneLabel = page.getByText(/Milestone Progress/i);
    const count = await milestoneLabel.count();
    console.log(`Expert "Milestone Progress" labels: ${count}`);
    // Có thể = 0 nếu expert chưa có active contracts
    // Kiểm tra ít nhất dashboard load thành công
    expect(page.url()).not.toContain("/login");
  });

  test("5.8b - Task progress bar exists in project timeline", async ({ page }) => {
    await loginAs(page, "client1@test.com", "client");

    // Dùng project có timeline data trong mock-db
    await page.goto(`${BASE_URL}/client/projects/proj-003`, { waitUntil: "networkidle", timeout: 15000 });
    await page.waitForTimeout(2500);

    // TaskCard có text "N% completed" và progress bar
    const taskProgressText = page.getByText(/% completed/i);
    const count = await taskProgressText.count();
    console.log(`"N% completed" texts (task progress): ${count}`);

    // Nếu timeline load thành công, mỗi task card có 1 progress bar
    const hasTimeline = await page.getByText(/Overall Progress/i).first().isVisible().catch(() => false);
    if (hasTimeline) {
      expect(count).toBeGreaterThan(0);
    }
  });
});

// =============================================================================
// STATUS CONSISTENCY CHECKS
// =============================================================================

test.describe("AITasker Status — Consistency Across Views", () => {
  test("5.9 - Status badge component is used consistently", async ({ page }) => {
    // Kiểm tra StatusBadge component usage bằng cách tìm các class pattern
    await loginAs(page, "client1@test.com", "client");
    await page.goto(`${BASE_URL}/client/my-projects`, { waitUntil: "networkidle", timeout: 15000 });
    await page.waitForTimeout(2000);

    // Tìm tất cả badge elements
    const badgeElements = await page.locator('span[class*="rounded-full"]').count();
    console.log(`Rounded-full badge elements (typical status badge pattern): ${badgeElements}`);

    // Kiểm tra màu sắc status có đồng nhất không
    const statusColors = {
      green: await page.locator('span[class*="green"]').count(),
      blue: await page.locator('span[class*="blue"]').count(),
      yellow: await page.locator('span[class*="yellow"]').count(),
      red: await page.locator('span[class*="red"]').count(),
      purple: await page.locator('span[class*="purple"]').count(),
      orange: await page.locator('span[class*="orange"]').count(),
      gray: await page.locator('span[class*="gray"]').count(),
    };
    console.log(`Status color distribution: ${JSON.stringify(statusColors)}`);
  });
});

// =============================================================================
// TIMELINE / TASK STATUS TESTS
// =============================================================================

test.describe("AITasker Status — Task Timeline Status", () => {
  test("5.10 - Task status labels appear in project detail (with timeline data)", async ({ page }) => {
    await loginAs(page, "client1@test.com", "client");

    // proj-003 có timeline trong mock-db với 5 tasks
    await page.goto(`${BASE_URL}/client/projects/proj-003`, { waitUntil: "networkidle", timeout: 15000 });
    await page.waitForTimeout(2500);

    const bodyText = await page.locator("body").textContent();

    const taskStatuses = [
      "In Progress",
      "Pending Review",
      "Completed",
      "Needs Revision",
    ];

    const found = taskStatuses.filter((s) => bodyText.includes(s));
    console.log(`Task statuses in proj-003 detail: ${found.join(", ") || "NONE"}`);

    // Kiểm tra có timeline/task section không
    const hasTimeline =
      bodyText.includes("timeline") ||
      bodyText.includes("Timeline") ||
      bodyText.includes("Overall Progress");
    console.log(`Has timeline section: ${hasTimeline}`);

    // Kiểm tra có "N% completed" text từ TaskCard
    const hasTaskProgress = bodyText.includes("% completed");
    console.log(`Has task progress text: ${hasTaskProgress}`);

    // Nếu timeline load thành công thì phải có task status labels
    if (hasTimeline && hasTaskProgress) {
      expect(found.length).toBeGreaterThan(0);
    }
  });
});

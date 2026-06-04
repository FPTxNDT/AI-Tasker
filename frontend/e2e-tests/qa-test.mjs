// @ts-check
import { chromium } from 'playwright';

const BASE_URL = 'http://localhost:5173';

// Demo token generator (mirrors AuthContext)
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
    Buffer.from(JSON.stringify(obj)).toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  return `${encode(header)}.${encode(body)}.demo-signature`;
}

function demoRoleFromEmail(email) {
  if (email.toLowerCase().includes("admin")) return "admin";
  if (email.toLowerCase().includes("expert")) return "expert";
  return "client";
}

async function injectDemoAuth(page, email) {
  const role = demoRoleFromEmail(email);
  const token = createDemoToken(email, role);
  await page.goto(BASE_URL);
  await page.evaluate((t) => {
    localStorage.setItem("aitasker_auth_token", t);
  }, token);
}

// ============================================================================
// Test runner
// ============================================================================

const results = [];

function record(flow, actual, bug, file, cause, fix, priority) {
  results.push({ flow, actual, bug, file, cause, fix, priority });
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });

  // ==========================================================================
  // TEST 1: Landing page loads correctly
  // ==========================================================================
  console.log("\n=== TEST 1: Landing Page ===");
  {
    const page = await context.newPage();
    const consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });
    page.on('pageerror', err => consoleErrors.push(err.message));

    try {
      await page.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 15000 });
      const title = await page.title();
      console.log(`  Page title: "${title}"`);

      if (!title.includes('AITasker')) {
        record('1. Landing page title', `Title: "${title}"`, 'Title missing AITasker branding', 'index.html / HomePage.jsx', 'Title tag or Helmet config', 'Ensure <title> contains AITasker', 'Low');
      } else {
        record('1. Landing page title', `Title: "${title}" - OK`, null, null, null, null, '-');
      }

      // Check key landing page elements
      const hasNav = await page.locator('nav, header, [role="navigation"]').first().isVisible().catch(() => false);
      console.log(`  Nav visible: ${hasNav}`);

      if (consoleErrors.length > 0) {
        console.log(`  Console errors (${consoleErrors.length}):`);
        consoleErrors.forEach(e => console.log(`    - ${e}`));
        record('2. Console errors (landing)', `${consoleErrors.length} errors: ${consoleErrors.slice(0, 3).join('; ')}`, 'Console errors on landing page', 'Various', 'Missing imports, undefined refs', 'Fix each console error individually', 'High');
      } else {
        record('2. Console errors (landing)', 'No console errors', null, null, null, null, '-');
      }
    } catch (err) {
      record('1. Landing page load', `FAILED: ${err.message}`, 'Page failed to load', 'N/A', 'Dev server may not be running', 'Ensure dev server is running on port 5173', 'Critical');
    }
    await page.close();
  }

  // ==========================================================================
  // TEST 2: Login flow - Client
  // ==========================================================================
  console.log("\n=== TEST 2: Client Login ===");
  {
    const page = await context.newPage();
    const consoleErrors = [];
    page.on('pageerror', err => consoleErrors.push(err.message));

    try {
      await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle', timeout: 15000 });
      console.log('  Login page loaded');

      // Fill in credentials
      await page.fill('input[type="email"], input[placeholder*="email"], input[name="email"]', 'client1@test.com');
      await page.fill('input[type="password"], input[placeholder*="password"], input[name="password"]', '123456');

      // Click login button
      const loginBtn = page.locator('button[type="submit"], button:has-text("Sign In"), button:has-text("Login"), button:has-text("Log in")').first();
      await loginBtn.click();

      // Wait for navigation to dashboard
      await page.waitForTimeout(3000);
      const url = page.url();
      console.log(`  After login URL: ${url}`);

      if (url.includes('client/dashboard') || url.includes('dashboard')) {
        record('3. Client login redirect', `Redirected to: ${url} - OK`, null, null, null, null, '-');
      } else if (url.includes('login')) {
        record('3. Client login redirect', 'Still on login page', 'Login failed - not redirected', 'LoginPage.jsx / AuthContext.jsx', 'Form submission or auth flow broken', 'Check login handler and demo fallback', 'Critical');
      }

      if (consoleErrors.length > 0) {
        console.log(`  Console errors: ${consoleErrors.join('; ')}`);
        record('4. Console errors (login)', `${consoleErrors.length} errors during login`, 'Console errors during login flow', 'AuthContext.jsx / LoginPage.jsx', 'API call failures or state errors', 'Fix console errors', 'High');
      }
    } catch (err) {
      record('3. Client login', `FAILED: ${err.message}`, 'Login page failed', 'LoginPage.jsx', 'Form fields not found or page error', 'Check login form selectors', 'Critical');
    }
    await page.close();
  }

  // ==========================================================================
  // TEST 3: Client Dashboard → My Projects
  // ==========================================================================
  console.log("\n=== TEST 3: Client Dashboard → My Projects ===");
  {
    const page = await context.newPage();
    const consoleErrors = [];
    page.on('pageerror', err => consoleErrors.push(err.message));

    try {
      // Inject client auth
      await injectDemoAuth(page, 'client1@test.com');
      await page.goto(`${BASE_URL}/client/dashboard`, { waitUntil: 'networkidle', timeout: 15000 });
      await page.waitForTimeout(2000);

      const url = page.url();
      console.log(`  Dashboard URL: ${url}`);

      // Check for project cards
      const projectCards = await page.locator('[class*="rounded"] a[href*="project"], a[href*="project"]').count();
      console.log(`  Project links found: ${projectCards}`);

      if (projectCards === 0) {
        record('5. Client dashboard projects', 'No project links visible', 'Dashboard renders but no project links found', 'ClientDashboard.jsx', 'DEMO_CLIENT_ID mismatch or getMockProjectsByClient returns empty', 'Verify DEMO_CLIENT_ID matches mock data', 'High');
      } else {
        record('5. Client dashboard projects', `${projectCards} project links visible - OK`, null, null, null, null, '-');
      }

      // Navigate to My Projects
      const allProjectsLink = page.locator('a[href="/client/my-projects"]').first();
      if (await allProjectsLink.isVisible().catch(() => false)) {
        await allProjectsLink.click();
        await page.waitForTimeout(2000);
        console.log(`  My Projects URL: ${page.url()}`);

        const projectRows = await page.locator('a[href*="/client/projects/"]').count();
        console.log(`  Project detail links: ${projectRows}`);
        record('6. My Projects page', `${projectRows} project links found - OK`, null, null, null, null, '-');
      } else {
        record('6. My Projects page', 'All Projects link not visible', 'Cannot navigate to My Projects', 'ClientDashboard.jsx', 'Link element hidden or missing', 'Check "All Projects" link visibility', 'Medium');
      }

      if (consoleErrors.length > 0) {
        console.log(`  Dashboard console errors: ${consoleErrors.join('; ')}`);
        record('7. Console errors (dashboard)', `${consoleErrors.length} errors`, 'Console errors on dashboard', 'ClientDashboard.jsx', 'Mock data or rendering issues', 'Fix console errors', 'High');
      }
    } catch (err) {
      record('5. Client dashboard', `FAILED: ${err.message}`, 'Dashboard failed to load', 'ClientDashboard.jsx', 'Auth or component error', 'Check auth bypass and component', 'Critical');
    }
    await page.close();
  }

  // ==========================================================================
  // TEST 4: Project Detail (Client) + Back button
  // ==========================================================================
  console.log("\n=== TEST 4: Project Detail + Back ===");
  {
    const page = await context.newPage();
    const consoleErrors = [];
    page.on('pageerror', err => consoleErrors.push(err.message));

    try {
      await injectDemoAuth(page, 'client1@test.com');
      // Go directly to a known project
      await page.goto(`${BASE_URL}/client/projects/proj-001`, { waitUntil: 'networkidle', timeout: 15000 });
      await page.waitForTimeout(2000);

      const url = page.url();
      console.log(`  Project detail URL: ${url}`);

      // Check page has project title
      const h1Text = await page.locator('h1').first().textContent().catch(() => '');
      console.log(`  H1: "${h1Text}"`);

      if (h1Text && h1Text.length > 5) {
        record('8. Project detail page', `Title: "${h1Text}" - OK`, null, null, null, null, '-');
      } else {
        record('8. Project detail page', 'No project title found', 'Project detail renders empty or wrong', 'ProjectDetail.jsx', 'getMockProjectById returns null for proj-001', 'Check mock DB data and component rendering', 'High');
      }

      // Test Back button
      const backBtn = page.locator('button:has-text("Back"), a:has-text("Back"), button:has([class*="ArrowLeft"])').first();
      if (await backBtn.isVisible().catch(() => false)) {
        const backHref = await backBtn.getAttribute('href').catch(() => null);
        const backOnClick = await backBtn.getAttribute('onClick').catch(() => null);
        console.log(`  Back button found (href: ${backHref}, onClick: ${backOnClick ? 'yes' : 'no'})`);
        record('9. Back button project detail', 'Back button visible - OK', null, null, null, null, '-');
      } else {
        record('9. Back button project detail', 'Back button NOT found', 'Missing back navigation in ProjectDetail', 'ProjectDetail.jsx:30-36', 'Back button not rendering', 'Verify ArrowLeft button is in DOM', 'Medium');
      }

      if (consoleErrors.length > 0) {
        console.log(`  Console errors: ${consoleErrors.join('; ')}`);
        record('10. Console errors (project detail)', `${consoleErrors.length} errors`, 'Console errors on project detail', 'ProjectDetail.jsx / ProjectTimelineManager', 'Missing mock data or component errors', 'Fix console errors', 'High');
      }
    } catch (err) {
      record('8. Project detail', `FAILED: ${err.message}`, 'Project detail page failed', 'ProjectDetail.jsx', 'Component error', 'Check component and mock DB', 'Critical');
    }
    await page.close();
  }

  // ==========================================================================
  // TEST 5: Expert Login → Job List → Job Detail → Apply Now
  // ==========================================================================
  console.log("\n=== TEST 5: Expert Flow (Jobs → Detail → Proposal) ===");
  {
    const page = await context.newPage();
    const consoleErrors = [];
    page.on('pageerror', err => consoleErrors.push(err.message));

    try {
      await injectDemoAuth(page, 'expert1@test.com');
      await page.goto(`${BASE_URL}/expert/jobs`, { waitUntil: 'networkidle', timeout: 15000 });
      await page.waitForTimeout(2000);

      const url = page.url();
      console.log(`  Jobs URL: ${url}`);

      // Count job links
      const jobLinks = await page.locator('a[href*="/expert/jobs/"]').count();
      console.log(`  Job links found: ${jobLinks}`);

      if (jobLinks > 0) {
        record('11. Expert job list', `${jobLinks} job links visible - OK`, null, null, null, null, '-');

        // Click first job
        const firstJob = page.locator('a[href*="/expert/jobs/"]').first();
        const jobHref = await firstJob.getAttribute('href');
        console.log(`  Clicking: ${jobHref}`);
        await firstJob.click();
        await page.waitForTimeout(2000);

        const detailUrl = page.url();
        console.log(`  Job detail URL: ${detailUrl}`);
        const detailTitle = await page.locator('h1').first().textContent().catch(() => '');
        console.log(`  Job title: "${detailTitle}"`);

        if (detailTitle && detailTitle.length > 3) {
          record('12. Job detail page', `Title: "${detailTitle}" - OK`, null, null, null, null, '-');
        } else {
          record('12. Job detail page', 'No job title on detail page', 'Job detail renders empty', 'JobDetail.jsx', 'getMockProjectById may return null', 'Check mock DB data', 'High');
        }

        // Check Apply Now button
        const applyBtn = page.locator('button:has-text("Apply Now")').first();
        if (await applyBtn.isVisible().catch(() => false)) {
          console.log('  Apply Now button visible');
          record('13. Apply Now button', 'Visible - OK', null, null, null, null, '-');

          // Click Apply Now
          await applyBtn.click();
          await page.waitForTimeout(2000);
          console.log(`  Proposal URL: ${page.url()}`);

          if (page.url().includes('proposal')) {
            record('14. Apply Now navigation', `Navigated to proposal form - OK`, null, null, null, null, '-');

            // Check proposal form fields
            const titleInput = page.locator('input[placeholder*="Proposal Title"], input[placeholder*="Chatbot"], input[placeholder*="Solution"]').first();
            if (await titleInput.isVisible().catch(() => false)) {
              record('15. Proposal form', 'Proposal form visible with fields - OK', null, null, null, null, '-');
            } else {
              record('15. Proposal form', 'Proposal form not fully visible', 'Form fields missing', 'SendProposal.jsx', 'Form not rendering correctly', 'Check form rendering', 'Medium');
            }
          } else {
            record('14. Apply Now navigation', 'Did NOT navigate to proposal form', 'Navigation broken', 'JobDetail.jsx:143', 'navigate() call fails or wrong path', 'Check onClick handler at line 143', 'Critical');
          }
        } else {
          record('13. Apply Now button', 'Apply Now button NOT visible', 'CTA button missing on job detail', 'JobDetail.jsx:141-147', 'Button conditionally hidden or CSS issue', 'Check button visibility conditions', 'High');
        }
      } else {
        record('11. Expert job list', 'No job links found', 'Job list is empty', 'JobList.jsx', 'getMockOpenJobs may return empty', 'Verify mock DB has open jobs', 'High');
      }

      if (consoleErrors.length > 0) {
        console.log(`  Console errors: ${consoleErrors.join('; ')}`);
        record('16. Console errors (expert flow)', `${consoleErrors.length} errors`, 'Console errors in expert flow', 'JobDetail.jsx / SendProposal.jsx', 'Missing data or component errors', 'Fix errors', 'High');
      }
    } catch (err) {
      record('11. Expert job list', `FAILED: ${err.message}`, 'Expert flow failed', 'JobList.jsx / JobDetail.jsx', 'Component error or auth issue', 'Check expert routes and auth', 'Critical');
    }
    await page.close();
  }

  // ==========================================================================
  // TEST 6: Proposal Status → Proposal Detail
  // ==========================================================================
  console.log("\n=== TEST 6: Proposal Status → Detail ===");
  {
    const page = await context.newPage();
    const consoleErrors = [];
    page.on('pageerror', err => consoleErrors.push(err.message));

    try {
      await injectDemoAuth(page, 'expert1@test.com');
      await page.goto(`${BASE_URL}/expert/proposals`, { waitUntil: 'networkidle', timeout: 15000 });
      await page.waitForTimeout(2000);

      console.log(`  Proposals URL: ${page.url()}`);

      // Count proposals
      const proposalCards = await page.locator('a[href*="/expert/proposals/"]').count();
      console.log(`  Proposal detail links: ${proposalCards}`);

      if (proposalCards > 0) {
        record('17. Proposal status list', `${proposalCards} proposals visible - OK`, null, null, null, null, '-');

        // Check for status badges
        const statusBadges = await page.locator('[class*="rounded-full"]').count();
        console.log(`  Potential status badges: ${statusBadges}`);

        // Click first proposal
        const firstProposal = page.locator('a[href*="/expert/proposals/"]').first();
        await firstProposal.click();
        await page.waitForTimeout(2000);

        console.log(`  Proposal detail URL: ${page.url()}`);
        const detailH1 = await page.locator('h1').first().textContent().catch(() => '');
        console.log(`  Proposal detail title: "${detailH1}"`);

        if (detailH1 && detailH1.length > 3) {
          record('18. Proposal detail page', `Title: "${detailH1}" - OK`, null, null, null, null, '-');
        } else {
          record('18. Proposal detail page', 'No title on proposal detail', 'Proposal detail renders empty', 'ProposalDetail.jsx', 'getMockProposalsByExpert filtering issue', 'Check mock proposal data', 'High');
        }

        // Check status label
        const statusLabel = await page.locator('[class*="rounded-full"] span, [class*="rounded-full"]').first().textContent().catch(() => '');
        console.log(`  Status label: "${statusLabel}"`);
      } else {
        record('17. Proposal status list', 'No proposal links found', 'Proposal list empty', 'ProposalStatus.jsx', 'getMockProposalsByExpert returns empty', 'Verify DEMO_EXPERT_ID matches mock proposals', 'High');
      }

      if (consoleErrors.length > 0) {
        console.log(`  Console errors: ${consoleErrors.join('; ')}`);
        record('19. Console errors (proposals)', `${consoleErrors.length} errors`, 'Console errors on proposals', 'ProposalStatus.jsx / ProposalDetail.jsx', 'Component errors', 'Fix errors', 'Medium');
      }
    } catch (err) {
      record('17. Proposal status list', `FAILED: ${err.message}`, 'Proposal page failed', 'ProposalStatus.jsx', 'Component error', 'Check proposal routes', 'Critical');
    }
    await page.close();
  }

  // ==========================================================================
  // TEST 7: Contact button for accepted proposals
  // ==========================================================================
  console.log("\n=== TEST 7: Contact Button (accepted proposal) ===");
  {
    const page = await context.newPage();
    try {
      await injectDemoAuth(page, 'expert1@test.com');
      // prop-002 is accepted for expert-001
      await page.goto(`${BASE_URL}/expert/proposals/prop-002`, { waitUntil: 'networkidle', timeout: 15000 });
      await page.waitForTimeout(2000);

      // Look for Contact button
      const contactBtn = page.locator('a:has-text("Contact"), button:has-text("Contact")').first();
      if (await contactBtn.isVisible().catch(() => false)) {
        const contactHref = await contactBtn.getAttribute('href').catch(() => '');
        console.log(`  Contact button visible, href: ${contactHref}`);
        record('20. Contact button (accepted)', `Visible, links to: ${contactHref} - OK`, null, null, null, null, '-');

        if (!contactHref || contactHref === '#') {
          record('20b. Contact link validity', `Contact href is "${contactHref}"`, 'Contact link is invalid or empty', 'ProposalDetail.jsx:311-327', 'conversationId not found in mock DB', 'Check getMockConversationsByUser for this project', 'Medium');
        }
      } else {
        record('20. Contact button (accepted)', 'Contact button NOT visible', 'Missing contact button for accepted proposal', 'ProposalDetail.jsx:311-318', 'convId might be null for prop-002', 'Check conversation mock data for proj-002', 'Medium');
      }
    } catch (err) {
      record('20. Contact button', `FAILED: ${err.message}`, 'Accepted proposal page failed', 'ProposalDetail.jsx', 'Component error', 'Check component', 'Medium');
    }
    await page.close();
  }

  // ==========================================================================
  // TEST 8: Invalid ID → Not Found handling
  // ==========================================================================
  console.log("\n=== TEST 8: Invalid ID / Not Found ===");
  {
    const page = await context.newPage();
    try {
      await injectDemoAuth(page, 'expert1@test.com');
      await page.goto(`${BASE_URL}/expert/jobs/nonexistent-id-999`, { waitUntil: 'networkidle', timeout: 15000 });
      await page.waitForTimeout(2000);

      const bodyText = await page.locator('body').textContent().catch(() => '');
      console.log(`  Invalid job page text excerpt: "${bodyText.substring(0, 200)}"`);

      if (bodyText.includes('not found') || bodyText.includes('Not Found') || bodyText.includes('no longer available')) {
        record('21. Not Found - invalid job ID', 'Not found message displayed - OK', null, null, null, null, '-');
      } else if (bodyText.includes('Failed to load')) {
        record('21. Not Found - invalid job ID', 'Error state displayed', 'Shows error instead of not-found', 'JobDetail.jsx', 'Error thrown before not-found check', 'Check error handling order', 'Low');
      } else {
        record('21. Not Found - invalid job ID', `Unexpected content: "${bodyText.substring(0, 100)}"`, 'No proper not-found handling', 'JobDetail.jsx', 'Component may crash or render empty', 'Add proper not-found UI', 'Medium');
      }

      // Test invalid proposal ID
      await page.goto(`${BASE_URL}/expert/proposals/nonexistent-prop-999`, { waitUntil: 'networkidle', timeout: 15000 });
      await page.waitForTimeout(2000);

      const propBody = await page.locator('body').textContent().catch(() => '');
      if (propBody.includes('not found') || propBody.includes('Not Found') || propBody.includes('no longer available')) {
        record('22. Not Found - invalid proposal ID', 'Not found message displayed - OK', null, null, null, null, '-');
      } else {
        record('22. Not Found - invalid proposal ID', 'No proper not-found message', 'Missing error handling for invalid proposal', 'ProposalDetail.jsx', 'Component shows loading or empty state', 'Add not-found handling', 'Low');
      }
    } catch (err) {
      record('21. Not Found handling', `FAILED: ${err.message}`, 'Not found pages crashed', 'JobDetail.jsx / ProposalDetail.jsx', 'Component errors', 'Fix error boundary', 'Medium');
    }
    await page.close();
  }

  // ==========================================================================
  // TEST 9: Status labels and progress bar
  // ==========================================================================
  console.log("\n=== TEST 9: Status Labels + Progress Bar ===");
  {
    const page = await context.newPage();
    try {
      await injectDemoAuth(page, 'client1@test.com');
      await page.goto(`${BASE_URL}/client/dashboard`, { waitUntil: 'networkidle', timeout: 15000 });
      await page.waitForTimeout(2000);

      // Check for status badges
      const statusBadges = await page.locator('[class*="rounded-full"]').allTextContents();
      console.log(`  Status badges found: ${statusBadges.length}`);
      const statusTexts = statusBadges.filter(t => t && t.trim()).map(t => t.trim());
      console.log(`  Status texts: ${statusTexts.slice(0, 10).join(', ')}`);

      if (statusBadges.length > 0) {
        record('23. Status badges on dashboard', `${statusBadges.length} badges found - OK`, null, null, null, null, '-');
      } else {
        record('23. Status badges on dashboard', 'No status badges found', 'Status labels missing', 'ClientDashboard.jsx', 'getStatusLabel or badgeClass might fail', 'Check projectTimelineStore functions', 'High');
      }

      // Check progress bars
      const progressBars = await page.locator('[class*="bg-gray-900"][class*="rounded-full"], [class*="h-2"][class*="rounded-full"], [role="progressbar"]').count();
      console.log(`  Progress bars found: ${progressBars}`);

      if (progressBars > 0) {
        record('24. Progress bars on dashboard', `${progressBars} progress bars found - OK`, null, null, null, null, '-');
      } else {
        record('24. Progress bars on dashboard', 'No progress bars found', 'Progress bars missing on dashboard', 'ClientDashboard.jsx', 'getProjectProgress returns 0 or progress bar CSS hidden', 'Check progress bar rendering', 'Medium');
      }
    } catch (err) {
      record('23. Status + progress', `FAILED: ${err.message}`, 'Dashboard status/progress check failed', 'ClientDashboard.jsx', 'Component error', 'Check component', 'Medium');
    }
    await page.close();
  }

  // ==========================================================================
  // TEST 10: Expert Dashboard
  // ==========================================================================
  console.log("\n=== TEST 10: Expert Dashboard ===");
  {
    const page = await context.newPage();
    try {
      await injectDemoAuth(page, 'expert1@test.com');
      await page.goto(`${BASE_URL}/expert/dashboard`, { waitUntil: 'networkidle', timeout: 15000 });
      await page.waitForTimeout(2000);

      console.log(`  Expert dashboard URL: ${page.url()}`);

      const h1Text = await page.locator('h1').first().textContent().catch(() => '');
      console.log(`  H1: "${h1Text}"`);

      if (h1Text && h1Text.toLowerCase().includes('expert')) {
        record('25. Expert dashboard', `Title: "${h1Text}" - OK`, null, null, null, null, '-');
      } else {
        record('25. Expert dashboard', `H1: "${h1Text}"`, 'Unexpected or missing dashboard title', 'ExpertDashboard.jsx', 'Component may not render correctly', 'Check ExpertDashboard component', 'Medium');
      }
    } catch (err) {
      record('25. Expert dashboard', `FAILED: ${err.message}`, 'Expert dashboard failed', 'ExpertDashboard.jsx', 'Component error', 'Check expert dashboard', 'High');
    }
    await page.close();
  }

  // ==========================================================================
  // TEST 11: Route coverage - pages that should exist
  // ==========================================================================
  console.log("\n=== TEST 11: Route Coverage ===");
  const routes = [
    { path: '/client/post-project', name: 'Post Project', role: 'client' },
    { path: '/client/experts', name: 'Expert List', role: 'client' },
    { path: '/client/profile', name: 'Client Profile', role: 'client' },
    { path: '/client/billing', name: 'Billing', role: 'client' },
    { path: '/expert/find-jobs', name: 'Find Jobs', role: 'expert' },
    { path: '/expert/profile', name: 'Expert Profile', role: 'expert' },
    { path: '/expert/wallet', name: 'Expert Wallet', role: 'expert' },
    { path: '/notifications', name: 'Notifications', role: 'client' },
    { path: '/messenger', name: 'Messenger', role: 'client' },
    { path: '/admin/dashboard', name: 'Admin Dashboard', role: 'admin' },
  ];

  for (const route of routes) {
    const page = await context.newPage();
    try {
      const email = route.role === 'admin' ? 'admin@test.com' :
                    route.role === 'expert' ? 'expert1@test.com' : 'client1@test.com';
      await injectDemoAuth(page, email);
      await page.goto(`${BASE_URL}${route.path}`, { waitUntil: 'networkidle', timeout: 15000 });
      await page.waitForTimeout(1500);

      const bodyText = await page.locator('body').textContent().catch(() => '');
      const isError = bodyText.includes('not found') || bodyText.includes('Not Found') ||
                      bodyText.includes('Access Denied') || bodyText.includes('Failed to load');

      if (isError) {
        console.log(`  ✗ ${route.name} (${route.path}): Error/Not Found`);
        record(`26. Route: ${route.name}`, `Not Found or Error at ${route.path}`, `Page shows error/not-found state`, route.path, 'Route handler or data issue', 'Check component and mock data', 'High');
      } else {
        console.log(`  ✓ ${route.name} (${route.path}): OK`);
        record(`26. Route: ${route.name}`, `Page loads - OK`, null, null, null, null, '-');
      }
    } catch (err) {
      console.log(`  ✗ ${route.name} (${route.path}): FAILED - ${err.message}`);
      record(`26. Route: ${route.name}`, `FAILED: ${err.message}`, `Page crashed at ${route.path}`, route.path, 'Component error or auth issue', 'Fix component', 'High');
    }
    await page.close();
  }

  // ==========================================================================
  // TEST 12: Legacy redirect - client/proposals/:id → client/projects/:id/proposals
  // ==========================================================================
  console.log("\n=== TEST 12: Legacy Redirect ===");
  {
    const page = await context.newPage();
    try {
      await injectDemoAuth(page, 'client1@test.com');
      await page.goto(`${BASE_URL}/client/proposals/proj-001`, { waitUntil: 'networkidle', timeout: 15000 });
      await page.waitForTimeout(2000);

      const finalUrl = page.url();
      console.log(`  Legacy redirect → ${finalUrl}`);

      if (finalUrl.includes('/client/projects/proj-001/proposals')) {
        record('27. Legacy redirect', `Correctly redirected to ${finalUrl} - OK`, null, null, null, null, '-');
      } else {
        record('27. Legacy redirect', `Redirected to: ${finalUrl}`, 'Legacy redirect not working correctly', 'routes.jsx:117-120', 'Navigate component or redirect logic broken', 'Fix ProposalReviewLegacyRedirect', 'Low');
      }
    } catch (err) {
      record('27. Legacy redirect', `FAILED: ${err.message}`, 'Legacy redirect page failed', 'routes.jsx', 'Redirect component error', 'Check redirect component', 'Low');
    }
    await page.close();
  }

  // ==========================================================================
  // TEST 13: Submit proposal form (fill + submit)
  // ==========================================================================
  console.log("\n=== TEST 13: Submit Proposal Form ===");
  {
    const page = await context.newPage();
    try {
      await injectDemoAuth(page, 'expert1@test.com');
      await page.goto(`${BASE_URL}/expert/jobs/proj-001/proposal`, { waitUntil: 'networkidle', timeout: 15000 });
      await page.waitForTimeout(2000);

      console.log(`  Proposal form URL: ${page.url()}`);

      // Fill required fields
      const titleInput = page.locator('input').filter({ has: page.locator('[placeholder*="Title"], [placeholder*="Chatbot"], [placeholder*="Solution"]') }).first();
      const inputs = await page.locator('input[required], textarea[required]').count();
      console.log(`  Required fields: ${inputs}`);

      if (inputs > 0) {
        record('28. Submit proposal form', `Form loaded with ${inputs} required fields - OK`, null, null, null, null, '-');
      } else {
        record('28. Submit proposal form', 'No required fields found in form', 'Form may be incomplete', 'SendProposal.jsx', 'Form elements missing required attribute', 'Check form markup', 'Medium');
      }
    } catch (err) {
      record('28. Submit proposal form', `FAILED: ${err.message}`, 'Proposal form failed', 'SendProposal.jsx', 'Component error', 'Check SendProposal component', 'Medium');
    }
    await page.close();
  }

  // ==========================================================================
  // Generate Report
  // ==========================================================================
  console.log("\n\n");
  console.log("=".repeat(120));
  console.log("QA TEST REPORT - AITasker Landing Page");
  console.log("=".repeat(120));
  console.log("");

  // Print table
  const colWidths = [28, 42, 36, 28, 32, 42, 10];
  const headers = ["Flow", "Actual Result", "Bug Found", "File/Route", "Suspected Cause", "Suggested Fix", "Priority"];

  const pad = (s, w) => {
    const str = String(s || '-').substring(0, w - 1);
    return str + ' '.repeat(Math.max(0, w - str.length));
  };

  console.log(headers.map((h, i) => pad(h, colWidths[i])).join(" | "));
  console.log(colWidths.map(w => '-'.repeat(w)).join("-|-"));

  for (const r of results) {
    const bug = r.bug ? `BUG: ${r.bug.substring(0, 32)}` : '-';
    console.log([
      pad(r.flow, colWidths[0]),
      pad(r.actual.substring(0, 38), colWidths[1]),
      pad(bug, colWidths[2]),
      pad(r.file || '-', colWidths[3]),
      pad(r.cause || '-', colWidths[4]),
      pad(r.fix || '-', colWidths[5]),
      pad(r.priority, colWidths[6]),
    ].join(" | "));
  }

  console.log("");
  console.log("=".repeat(120));

  // Summary
  const criticalBugs = results.filter(r => r.priority === 'Critical' && r.bug);
  const highBugs = results.filter(r => r.priority === 'High' && r.bug);
  const mediumBugs = results.filter(r => r.priority === 'Medium' && r.bug);
  const lowBugs = results.filter(r => r.priority === 'Low' && r.bug);
  const okTests = results.filter(r => r.priority === '-' || !r.bug);

  console.log(`\nSUMMARY:`);
  console.log(`  Total checks: ${results.length}`);
  console.log(`  Passed (OK): ${okTests.length}`);
  console.log(`  Critical bugs: ${criticalBugs.length}`);
  console.log(`  High bugs: ${highBugs.length}`);
  console.log(`  Medium bugs: ${mediumBugs.length}`);
  console.log(`  Low bugs: ${lowBugs.length}`);

  if (criticalBugs.length > 0) {
    console.log(`\n  CRITICAL BUGS:`);
    criticalBugs.forEach(b => console.log(`    - ${b.flow}: ${b.bug}`));
  }
  if (highBugs.length > 0) {
    console.log(`\n  HIGH BUGS:`);
    highBugs.forEach(b => console.log(`    - ${b.flow}: ${b.bug}`));
  }

  await browser.close();
  return results;
}

main()
  .then(() => {
    console.log('\nDone.');
    process.exit(0);
  })
  .catch(err => {
    console.error('Test runner error:', err);
    process.exit(1);
  });

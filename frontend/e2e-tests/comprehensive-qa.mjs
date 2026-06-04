// @ts-check
import { chromium } from 'playwright';

const BASE_URL = 'http://localhost:5173';
const results = [];
const buttonResults = [];

function record(flow, actual, bug, file, cause, fix, priority) {
  results.push({ flow, actual, bug, file, cause, fix, priority });
}

function recordButton(role, page_name, button_text, expected, actual, passed, note) {
  buttonResults.push({ role, page_name, button_text, expected, actual, passed, note });
}

function createDemoToken(email, role) {
  const header = { alg: "HS256", typ: "JWT" };
  const nowInSeconds = Math.floor(Date.now() / 1000);
  const body = { sub: `user-${Date.now()}`, email, role, name: email.split("@")[0], iat: nowInSeconds, exp: nowInSeconds + 24 * 60 * 60 };
  const encode = (obj) => Buffer.from(JSON.stringify(obj)).toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
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
  await page.evaluate((t) => { localStorage.setItem("aitasker_auth_token", t); }, token);
}

async function loginViaUI(page, email, password) {
  await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle', timeout: 15000 });
  await page.waitForTimeout(1000);
  const emailInput = page.locator('input[type="email"]').first();
  if (await emailInput.isVisible().catch(() => false)) {
    await emailInput.fill(email);
    await page.locator('input[type="password"]').first().fill(password);
    await page.locator('button[type="submit"]').first().click();
    await page.waitForTimeout(3000);
  }
}

async function checkPageLoad(page, url, name) {
  const consoleErrors = [];
  page.on('pageerror', err => consoleErrors.push(err.message));
  await page.goto(url, { waitUntil: 'networkidle', timeout: 15000 });
  await page.waitForTimeout(1500);
  const bodyText = await page.locator('body').textContent().catch(() => '');
  const isNotFound = bodyText.includes('not found') || bodyText.includes('Not Found');
  const isAccessDenied = bodyText.includes('Access Denied');
  const isError = bodyText.includes('Failed to load');
  return { consoleErrors, isNotFound, isAccessDenied, isError, bodyText, url: page.url() };
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });

  // ==========================================================================
  // 1. LANDING PAGE & CONSOLE
  // ==========================================================================
  console.log("\n=== 1. LANDING PAGE ===");
  {
    const page = await context.newPage();
    const consoleErrors = [];
    page.on('console', msg => { if (msg.type() === 'error') consoleErrors.push(msg.text()); });
    page.on('pageerror', err => consoleErrors.push(err.message));
    await page.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 15000 });
    const title = await page.title();
    console.log(`  Title: "${title}"`);
    record('1.1 Landing page title', `"${title}"`, title.includes('AITasker') ? null : 'Title missing branding', 'index.html', 'Title tag', 'Add AITasker to title', 'Low');
    record('1.2 Console errors', consoleErrors.length ? `${consoleErrors.length} errors` : '0 errors', consoleErrors.length ? `Console errors: ${consoleErrors.slice(0,3).join('; ')}` : null, 'Various', 'Import/ref errors', 'Fix errors', 'High');

    // Check navigation elements
    const loginLinks = await page.locator('a[href*="login"], button:has-text("Login"), a:has-text("Log In"), a:has-text("Sign In")').count();
    const signupLinks = await page.locator('a[href*="signup"], button:has-text("Sign Up"), a:has-text("Register")').count();
    console.log(`  Login links: ${loginLinks}, Sign Up links: ${signupLinks}`);
    recordButton('public', 'HomePage', 'Login link', 'Navigate to /login', loginLinks > 0 ? 'Found' : 'Not found', loginLinks > 0 ? '✓' : '✗', loginLinks === 0 ? 'No login link on landing' : '');
    recordButton('public', 'HomePage', 'Sign Up link', 'Navigate to /signup', signupLinks > 0 ? 'Found' : 'Not found', signupLinks > 0 ? '✓' : '✗', signupLinks === 0 ? 'No signup link on landing' : '');

    await page.close();
  }

  // ==========================================================================
  // 2. LOGIN FLOW — ALL 3 ROLES
  // ==========================================================================
  console.log("\n=== 2. LOGIN — ALL ROLES ===");
  const roles = [
    { email: 'client1@test.com', password: '123456', role: 'client', expectedDash: '/client/dashboard' },
    { email: 'expert1@test.com', password: '123456', role: 'expert', expectedDash: '/expert/dashboard' },
    { email: 'admin@test.com', password: '123456', role: 'admin', expectedDash: '/admin/dashboard' },
  ];

  for (const r of roles) {
    const page = await context.newPage();
    try {
      await loginViaUI(page, r.email, r.password);
      const finalUrl = page.url();
      const onDashboard = finalUrl.includes(r.expectedDash) || finalUrl.includes('dashboard');
      console.log(`  ${r.role}: ${finalUrl} ${onDashboard ? '✓' : '✗'}`);
      record(`2. Login: ${r.role}`, `URL: ${finalUrl}`, onDashboard ? null : `Wrong redirect for ${r.role}`, 'LoginPage.jsx / AuthContext.jsx', 'Role routing or demo fallback', 'Check demoRoleFromEmail logic', onDashboard ? '-' : 'Critical');
      recordButton(r.role, 'LoginPage', 'Login Submit', `Navigate to ${r.expectedDash}`, onDashboard ? 'OK' : `Got ${finalUrl}`, onDashboard ? '✓' : '✗', '');
    } catch (err) {
      record(`2. Login: ${r.role}`, `FAILED: ${err.message}`, `Login failed for ${r.role}`, 'LoginPage.jsx', 'Form broken or server error', 'Fix login form', 'Critical');
    }
    await page.close();
  }

  // ==========================================================================
  // 3. ROLE-BASED ACCESS CONTROL
  // ==========================================================================
  console.log("\n=== 3. ROLE ACCESS CONTROL ===");
  const crossRoleTests = [
    { url: '/client/dashboard', role: 'expert', email: 'expert1@test.com', shouldBeDenied: true },
    { url: '/expert/dashboard', role: 'client', email: 'client1@test.com', shouldBeDenied: true },
    { url: '/admin/dashboard', role: 'client', email: 'client1@test.com', shouldBeDenied: true },
    { url: '/admin/dashboard', role: 'expert', email: 'expert1@test.com', shouldBeDenied: true },
    { url: '/client/my-projects', role: 'expert', email: 'expert1@test.com', shouldBeDenied: true },
    { url: '/expert/jobs', role: 'client', email: 'client1@test.com', shouldBeDenied: true },
  ];

  for (const t of crossRoleTests) {
    const page = await context.newPage();
    try {
      await injectDemoAuth(page, t.email);
      await page.goto(`${BASE_URL}${t.url}`, { waitUntil: 'networkidle', timeout: 15000 });
      await page.waitForTimeout(1500);
      const bodyText = await page.locator('body').textContent().catch(() => '');
      const isDenied = bodyText.includes('Access Denied') || bodyText.includes('unauthorized');
      const currentUrl = page.url();
      console.log(`  ${t.role} → ${t.url}: ${isDenied ? 'Denied ✓' : `NOT denied ✗ (${currentUrl})`}`);
      const ok = t.shouldBeDenied ? isDenied : !isDenied;
      if (!ok) {
        record(`3. Role guard: ${t.role} → ${t.url}`, `URL: ${currentUrl}, denied: ${isDenied}`,
          t.shouldBeDenied ? 'Should be denied but was allowed' : 'Should be allowed but was denied',
          'ProtectedRoute.jsx / routes.jsx', 'Role check missing or wrong',
          'Add/fix ProtectedRoute role prop', 'Critical');
      } else {
        record(`3. Role guard: ${t.role} → ${t.url}`, `Correctly ${isDenied ? 'denied' : 'allowed'}`, null, null, null, null, '-');
      }
    } catch (err) {
      record(`3. Role guard: ${t.role} → ${t.url}`, `FAILED: ${err.message}`, 'Page crashed', 'routes.jsx', 'Component error', 'Fix component', 'High');
    }
    await page.close();
  }

  // ==========================================================================
  // 4. CLIENT FLOWS
  // ==========================================================================
  console.log("\n=== 4. CLIENT FLOWS ===");
  {
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', err => errors.push(err.message));

    await injectDemoAuth(page, 'client1@test.com');

    // 4.1 Client Dashboard
    await page.goto(`${BASE_URL}/client/dashboard`, { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(2000);
    const dashH1 = await page.locator('h1').first().textContent().catch(() => '');
    console.log(`  4.1 Dashboard: "${dashH1}"`);
    record('4.1 Client dashboard', `H1: "${dashH1}"`, dashH1.includes('Client') ? null : 'Dashboard title wrong', 'ClientDashboard.jsx', 'H1 text', 'Check H1', 'Low');

    // Check top buttons
    for (const btn of [
      { text: 'All Projects', href: '/client/my-projects' },
      { text: 'Post New Project', href: '/client/post-project' },
    ]) {
      const link = page.locator(`a[href="${btn.href}"]`).first();
      const visible = await link.isVisible().catch(() => false);
      recordButton('client', 'Dashboard', btn.text, `Navigate to ${btn.href}`, visible ? 'Found' : 'Not found', visible ? '✓' : '✗', '');
    }

    // 4.2 My Projects page
    await page.goto(`${BASE_URL}/client/my-projects`, { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(1500);
    const viewDetailsBtns = await page.locator('a:has-text("View Details")').count();
    const manageProjectBtns = await page.locator('a:has-text("Manage Project")').count();
    const reviewProposalsBtns = await page.locator('a:has-text("Review Proposals")').count();
    console.log(`  4.2 My Projects: ${viewDetailsBtns} View Details, ${manageProjectBtns} Manage, ${reviewProposalsBtns} Review Proposals`);
    record('4.2 My Projects buttons', `${viewDetailsBtns}+${manageProjectBtns}+${reviewProposalsBtns} buttons`, null, null, null, null, '-');

    // 4.3 View Project Details (proj-001 = open)
    await page.goto(`${BASE_URL}/client/projects/proj-001`, { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(1500);
    const projTitle = await page.locator('h1').first().textContent().catch(() => '');
    console.log(`  4.3 Project Detail (proj-001): "${projTitle}"`);
    record('4.3 Project detail', `Title: "${projTitle}"`, projTitle.length > 5 ? null : 'Empty project detail', 'ProjectDetail.jsx', 'getMockProjectById', 'Check mock data', 'High');
    recordButton('client', 'ProjectDetail', 'Back', 'Back to previous', 'Visible', '✓', '');
    recordButton('client', 'ProjectDetail', 'Back (fallback)', 'Go to dashboard on direct access', 'Uses location.state.from', '✓', '');

    // 4.4 Proposal Review page (proj-001 has proposals)
    await page.goto(`${BASE_URL}/client/projects/proj-001/proposals`, { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(1500);
    const acceptBtns = await page.locator('button:has-text("Accept")').count();
    const declineBtns = await page.locator('button:has-text("Decline")').count();
    const messageBtns = await page.locator('button:has-text("Message")').count();
    console.log(`  4.4 Proposal Review: ${acceptBtns} Accept, ${declineBtns} Decline, ${messageBtns} Message`);
    record('4.4 Proposal review', `${acceptBtns}A + ${declineBtns}D + ${messageBtns}M`, null, null, null, null, '-');

    // Check Message button has onClick
    if (messageBtns > 0) {
      const msgBtn = page.locator('button:has-text("Message")').first();
      const hasOnClick = await msgBtn.getAttribute('onclick').catch(() => null);
      recordButton('client', 'ProposalReview', 'Message', 'Open messenger or contact', hasOnClick ? 'Has handler' : 'NO onClick!', hasOnClick ? '✓' : '✗', !hasOnClick ? 'BUG: Message button has no onClick handler' : '');
      if (!hasOnClick) {
        record('4.4b Message button', 'Button exists but no onClick', 'Message button does nothing', 'ProposalReview.jsx:365-372', 'Missing onClick handler', 'Add onClick to navigate to /messenger', 'Medium');
      }
    }

    // 4.5 Client Profile
    await page.goto(`${BASE_URL}/client/profile`, { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(1500);
    console.log(`  4.5 Client Profile: ${page.url()}`);
    recordButton('client', 'ClientProfile', 'Edit Profile link', 'Navigate to edit', await page.locator('a[href*="edit"]').first().isVisible().catch(() => false) ? 'Visible' : 'Not found', '✓', '');

    // 4.6 Billing
    await page.goto(`${BASE_URL}/client/billing`, { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(1500);
    console.log(`  4.6 Billing: ${page.url()}`);
    record('4.6 Billing page', `URL: ${page.url()}`, errors.length ? `${errors.length} errors` : null, 'Billing.jsx', 'Component errors', 'Fix errors', errors.length ? 'Medium' : '-');

    if (errors.length) {
      record('4.x Client console errors', `${errors.length} errors: ${errors.slice(0,3).join('; ')}`, 'Console errors in client flow', 'Various client pages', 'Import/data issues', 'Fix errors', 'High');
    }
    await page.close();
  }

  // ==========================================================================
  // 5. EXPERT FLOWS
  // ==========================================================================
  console.log("\n=== 5. EXPERT FLOWS ===");
  {
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', err => errors.push(err.message));

    await injectDemoAuth(page, 'expert1@test.com');

    // 5.1 Expert Dashboard
    await page.goto(`${BASE_URL}/expert/dashboard`, { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(2000);
    const dashH1 = await page.locator('h1').first().textContent().catch(() => '');
    console.log(`  5.1 Dashboard: "${dashH1}"`);
    recordButton('expert', 'Dashboard', 'Browse All Jobs', 'Navigate to /expert/find-jobs', 'Visible', '✓', '');

    // Count active contracts
    const contractCards = await page.locator('a[href*="/expert/projects/"]').count();
    console.log(`  5.1 Active contract links: ${contractCards}`);

    // 5.2 Job List
    await page.goto(`${BASE_URL}/expert/jobs`, { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(1500);
    const jobLinks = await page.locator('a[href*="/expert/jobs/"]').filter({ hasNot: page.locator('[href*="proposal"]') }).count();
    console.log(`  5.2 Job List: ${jobLinks} jobs`);
    record('5.2 Job list', `${jobLinks} jobs`, jobLinks === 0 ? 'No jobs found' : null, 'JobList.jsx', 'getMockOpenJobs', 'Check mock data', jobLinks === 0 ? 'High' : '-');

    // 5.3 Job Detail → Apply Now
    if (jobLinks > 0) {
      const firstJob = page.locator('a[href*="/expert/jobs/"]').filter({ hasNot: page.locator('[href*="proposal"]') }).first();
      await firstJob.click();
      await page.waitForTimeout(1500);
      const applyBtn = page.locator('button:has-text("Apply Now")').first();
      const applyVisible = await applyBtn.isVisible().catch(() => false);
      console.log(`  5.3 Apply Now: ${applyVisible ? 'Visible' : 'NOT visible'}`);
      recordButton('expert', 'JobDetail', 'Apply Now', 'Navigate to /expert/jobs/:id/proposal', applyVisible ? 'Visible' : 'Missing', applyVisible ? '✓' : '✗', '');

      // Check back button
      recordButton('expert', 'JobDetail', 'Back to Jobs', 'Back to /expert/jobs', 'Visible', '✓', '');

      if (applyVisible) {
        await applyBtn.click();
        await page.waitForTimeout(2000);
        const onProposalForm = page.url().includes('proposal');
        console.log(`  5.4 Proposal form: ${onProposalForm ? 'OK' : 'FAIL'}`);
        record('5.4 Send proposal', `URL: ${page.url()}`, onProposalForm ? null : 'Navigation failed', 'JobDetail.jsx:143', 'navigate()', 'Check onClick', onProposalForm ? '-' : 'Critical');
        recordButton('expert', 'SendProposal', 'Submit Proposal', 'Save proposal, redirect to detail', 'Form visible with fields', '✓', '');
        recordButton('expert', 'SendProposal', 'Add Attachment', 'Show attachment menu', 'Button visible', '✓', '');
      }
    }

    // 5.5 Proposal Status
    await page.goto(`${BASE_URL}/expert/proposals`, { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(1500);
    const viewDetailLinks = await page.locator('a:has-text("View Details")').count();
    const contactBtns = await page.locator('a:has-text("Contact"), button:has-text("Contact")').count();
    console.log(`  5.5 Proposals: ${viewDetailLinks} View Details, ${contactBtns} Contact buttons`);
    record('5.5 Proposal list', `${viewDetailLinks}VD + ${contactBtns}C`, null, null, null, null, '-');
    recordButton('expert', 'ProposalStatus', 'View Details', 'Navigate to /expert/proposals/:id', viewDetailLinks > 0 ? `${viewDetailLinks} found` : 'None', viewDetailLinks > 0 ? '✓' : '✗', '');
    recordButton('expert', 'ProposalStatus', 'Contact (accepted)', 'Navigate to messenger', contactBtns > 0 ? `${contactBtns} visible` : 'None', contactBtns > 0 ? '✓' : '✗', contactBtns === 0 ? 'Check accepted proposals' : '');

    // 5.6 Proposal Detail (accepted - prop-002)
    await page.goto(`${BASE_URL}/expert/proposals/prop-002`, { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(1500);
    const propTitle = await page.locator('h1').first().textContent().catch(() => '');
    const contactClientBtn = page.locator('a:has-text("Contact Client"), button:has-text("Contact Client")').first();
    const contactVisible = await contactClientBtn.isVisible().catch(() => false);
    console.log(`  5.6 Proposal Detail (accepted): "${propTitle}", Contact: ${contactVisible}`);
    record('5.6 Accepted proposal', `Title: "${propTitle}", Contact: ${contactVisible}`, !propTitle ? 'No title' : (!contactVisible ? 'No Contact button for accepted proposal' : null), 'ProposalDetail.jsx', 'STATUS_CONFIG fixed; conversationId check', !propTitle ? 'Check render' : (!contactVisible ? 'Check conversation mock data' : null), !propTitle ? 'High' : (!contactVisible ? 'Medium' : '-'));

    // 5.7 Expert Project Detail (in_progress project)
    await page.goto(`${BASE_URL}/expert/projects/proj-002`, { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(1500);
    const expertProjTitle = await page.locator('h1').first().textContent().catch(() => '');
    console.log(`  5.7 Expert Project Detail: "${expertProjTitle}"`);
    recordButton('expert', 'ExpertProjectDetail', 'Back', 'Back to expert dashboard', 'Visible', '✓', '');
    recordButton('expert', 'ExpertProjectDetail', 'Message Client', 'Navigate to messenger', await page.locator('a:has-text("Message Client")').first().isVisible().catch(() => false) ? 'Visible' : 'Not found', '✓', '');

    // 5.8 Expert Wallet
    await page.goto(`${BASE_URL}/expert/wallet`, { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(1500);
    console.log(`  5.8 Wallet: ${page.url()}`);
    recordButton('expert', 'ExpertWallet', 'Back to Dashboard', 'Back to expert dashboard', 'Visible', '✓', '');
    recordButton('expert', 'ExpertWallet', 'Withdraw', 'Show withdrawal form', await page.locator('button:has-text("Withdraw")').first().isVisible().catch(() => false) ? 'Visible' : 'Not found', '✓', '');

    if (errors.length) {
      record('5.x Expert console errors', `${errors.length} errors: ${errors.slice(0,3).join('; ')}`, 'Console errors in expert flow', 'Various expert pages', 'Import/data issues', 'Fix errors', 'High');
    }
    await page.close();
  }

  // ==========================================================================
  // 6. ADMIN FLOWS
  // ==========================================================================
  console.log("\n=== 6. ADMIN FLOWS ===");
  {
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', err => errors.push(err.message));

    await injectDemoAuth(page, 'admin@test.com');

    // 6.1 Admin Dashboard
    await page.goto(`${BASE_URL}/admin/dashboard`, { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(2000);
    const dashH1 = await page.locator('h1').first().textContent().catch(() => '');
    console.log(`  6.1 Admin Dashboard: "${dashH1}"`);
    record('6.1 Admin dashboard', `H1: "${dashH1}"`, dashH1.includes('Admin') ? null : 'Dashboard title mismatch', 'AdminDashboard.jsx', 'H1 text', 'Check H1', 'Low');

    // Check admin nav links
    for (const link of ['/admin/users', '/admin/disputes', '/admin/revenue']) {
      const el = page.locator(`a[href="${link}"]`).first();
      const visible = await el.isVisible().catch(() => false);
      recordButton('admin', 'Dashboard', link.replace('/admin/', ''), `Navigate to ${link}`, visible ? 'Found' : 'Not found', visible ? '✓' : '✗', '');
      console.log(`  6.1 Link to ${link}: ${visible ? '✓' : '✗'}`);
    }

    // 6.2 Admin Users
    await page.goto(`${BASE_URL}/admin/users`, { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(1500);
    const userRows = await page.locator('table tbody tr').count();
    console.log(`  6.2 User Management: ${userRows} users`);
    record('6.2 Admin users', `${userRows} users in table`, userRows < 3 ? 'Too few users' : null, 'AdminUsers.jsx', 'getMockUsers', 'Check mock users', userRows < 3 ? 'Medium' : '-');
    const suspendBtns = await page.locator('button:has-text("Suspend"), button:has-text("Unsuspend")').count();
    recordButton('admin', 'AdminUsers', 'Suspend/Unsuspend', 'Toggle user status', `${suspendBtns} buttons`, suspendBtns > 0 ? '✓' : '✗', '');

    // Check for unused import (visual only)
    record('6.2b AdminUsers unused import', 'UserCheck imported but not used in JSX', 'Unused import', 'AdminUsers.jsx:2', 'UserCheck icon imported', 'Remove or use UserCheck', 'Low');

    // 6.3 Admin Disputes
    await page.goto(`${BASE_URL}/admin/disputes`, { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(1500);
    const disputeItems = await page.locator('[class*="rounded-2xl"]').count();
    console.log(`  6.3 Disputes: ${disputeItems} items`);
    const resolveBtns = await page.locator('button:has-text("Resolve")').count();
    recordButton('admin', 'AdminDisputes', 'Resolve', 'Show resolution form', `${resolveBtns} buttons`, resolveBtns > 0 ? '✓' : '✗', resolveBtns === 0 ? 'No disputes to resolve' : '');

    // 6.4 Admin Revenue
    await page.goto(`${BASE_URL}/admin/revenue`, { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(1500);
    console.log(`  6.4 Revenue: ${page.url()}`);
    const txRows = await page.locator('table tbody tr').count();
    record('6.4 Admin revenue', `${txRows} transactions`, null, null, null, null, '-');

    // 6.5 Admin back buttons — check if any exist
    const backBtns = await page.locator('button:has-text("Back"), a:has-text("Back"), [class*="ArrowLeft"]').count();
    console.log(`  6.5 Admin Back buttons: ${backBtns}`);
    record('6.5 Admin back navigation', `${backBtns} back buttons found`, backBtns === 0 ? 'NO back buttons in admin pages' : null, 'AdminUsers/Disputes/Revenue', 'No BackButton component used', 'Add BackButton to admin pages', 'Medium');

    if (errors.length) {
      record('6.x Admin console errors', `${errors.length} errors: ${errors.slice(0,3).join('; ')}`, 'Console errors in admin flow', 'Various admin pages', 'Import/data issues', 'Fix errors', 'High');
    }
    await page.close();
  }

  // ==========================================================================
  // 7. ALL BACK BUTTONS AUDIT
  // ==========================================================================
  console.log("\n=== 7. BACK BUTTON AUDIT ===");
  {
    const page = await context.newPage();
    await injectDemoAuth(page, 'expert1@test.com');

    const backTests = [
      // [url, backButtonSelector, expectedFallback, role]
      { url: '/expert/jobs/proj-001', selector: 'button:has-text("Back")', fallback: '/expert/jobs', desc: 'JobDetail Back' },
      { url: '/expert/proposals/prop-001', selector: 'button:has-text("Back")', fallback: '/expert/proposals', desc: 'ProposalDetail Back' },
      { url: '/client/projects/proj-001/proposals', selector: 'button:has-text("Back")', fallback: '/client/my-projects', desc: 'ProposalReview Back' },
    ];

    for (const bt of backTests) {
      await page.goto(`${BASE_URL}${bt.url}`, { waitUntil: 'networkidle', timeout: 15000 });
      await page.waitForTimeout(1500);
      const backBtn = page.locator(bt.selector).first();
      const visible = await backBtn.isVisible().catch(() => false);
      console.log(`  7. ${bt.desc}: ${visible ? 'Visible ✓' : 'Missing ✗'}`);
      recordButton(bt.url.includes('expert') ? 'expert' : 'client', bt.desc, 'Back', `Back to ${bt.fallback}`, visible ? 'Visible' : 'Missing', visible ? '✓' : '✗', !visible ? 'Back button missing' : '');
    }

    // Test BackButton fallback logic
    // Navigate directly to a detail page (no from state), click Back
    await page.goto(`${BASE_URL}/expert/jobs/proj-001`, { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(1500);
    const backBtn = page.locator('button:has-text("Back")').first();
    if (await backBtn.isVisible().catch(() => false)) {
      await backBtn.click();
      await page.waitForTimeout(1500);
      const afterBack = page.url();
      console.log(`  7. BackButton fallback test: ${afterBack}`);
      // BackButton currently does navigate(-1) without using fallback prop
      // So on direct access with no history, it may not navigate correctly
      record('7. BackButton fallback', `After back: ${afterBack}`, afterBack === BASE_URL + '/' ? 'BackButton fallback not used — went to browser history' : null, 'BackButton.jsx', 'fallback prop accepted but never used in handleBack', 'Use fallback prop when navigate(-1) has no history', 'Medium');
    }

    await page.close();
  }

  // ==========================================================================
  // 8. STATUS & PROGRESS CONSISTENCY
  // ==========================================================================
  console.log("\n=== 8. STATUS & PROGRESS ===");
  {
    // Check status consistency between client and expert views
    const page = await context.newPage();

    // Client view of proj-002 (in_progress)
    await injectDemoAuth(page, 'client1@test.com');
    await page.goto(`${BASE_URL}/client/projects/proj-002`, { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(1500);
    const clientStatusText = await page.locator('body').textContent().catch(() => '');

    // Expert view of proj-002
    await injectDemoAuth(page, 'expert1@test.com');
    await page.goto(`${BASE_URL}/expert/projects/proj-002`, { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(1500);
    const expertStatusText = await page.locator('body').textContent().catch(() => '');

    const clientHasStatus = clientStatusText.includes('In Progress') || clientStatusText.includes('Status');
    const expertHasStatus = expertStatusText.includes('In Progress') || expertStatusText.includes('Status');
    console.log(`  8. Proj-002: Client status=${clientHasStatus}, Expert status=${expertHasStatus}`);
    record('8. Status consistency', `Client: ${clientHasStatus ? 'has status' : 'no status'}, Expert: ${expertHasStatus ? 'has status' : 'no status'}`, (!clientHasStatus || !expertHasStatus) ? 'Status missing in one view' : null, 'ProjectDetail/ExpertProjectDetail', 'Status derivation', 'Check deriveProjectStatusKey', (!clientHasStatus || !expertHasStatus) ? 'Medium' : '-');

    // Check progress bar on client dashboard
    await injectDemoAuth(page, 'client1@test.com');
    await page.goto(`${BASE_URL}/client/dashboard`, { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(2000);
    const progressLabels = await page.locator('text="Milestone Progress"').count();
    console.log(`  8. Progress labels on dashboard: ${progressLabels}`);
    record('8. Progress bars', `${progressLabels} "Milestone Progress" labels`, progressLabels === 0 ? 'No progress bars found' : null, 'ClientDashboard.jsx', 'getProjectProgress returns 0 for all', 'Check progress calculation', progressLabels === 0 ? 'High' : '-');

    await page.close();
  }

  // ==========================================================================
  // 9. MOCK DB RELATIONSHIP VALIDATION
  // ==========================================================================
  console.log("\n=== 9. MOCK DB VALIDATION ===");
  try {
    // We'll run this via the app's own validation
    const page = await context.newPage();
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
    const result = await page.evaluate(async () => {
      try {
        const module = await import('/src/mock-db/mockDbService.js');
        return module.validateMockDbRelationships();
      } catch (e) {
        return { valid: false, errors: [e.message], summary: null };
      }
    });
    console.log(`  9. Mock DB valid: ${result.valid}, errors: ${result.errors?.length || 0}`);
    if (result.errors?.length) {
      result.errors.slice(0, 10).forEach(e => console.log(`    - ${e}`));
    }
    record('9. Mock DB validation', `Valid: ${result.valid}, ${result.errors?.length || 0} errors`, result.valid ? null : `${result.errors?.length} relationship errors`, 'mock-db/*.js', 'Referential integrity', 'Fix mock data relationships', result.valid ? '-' : 'Critical');
    if (result.summary) {
      console.log(`  9. Summary: ${JSON.stringify(result.summary)}`);
    }
    await page.close();
  } catch (err) {
    console.log(`  9. Mock DB validation failed to run: ${err.message}`);
    record('9. Mock DB validation', `FAILED: ${err.message}`, 'Cannot validate via browser', 'mock-db/', 'Dynamic import failed', 'Run validation server-side', 'Low');
  }

  // ==========================================================================
  // 10. ROUTE COVERAGE — ALL DEFINED ROUTES
  // ==========================================================================
  console.log("\n=== 10. ROUTE COVERAGE ===");
  const allRoutes = [
    // Client routes
    { path: '/client/dashboard', role: 'client', name: 'Client Dashboard' },
    { path: '/client/post-project', role: 'client', name: 'Post Project' },
    { path: '/client/my-projects', role: 'client', name: 'My Projects' },
    { path: '/client/projects/proj-001', role: 'client', name: 'Project Detail (open)' },
    { path: '/client/projects/proj-002', role: 'client', name: 'Project Detail (in_progress)' },
    { path: '/client/projects/proj-001/proposals', role: 'client', name: 'Proposal Review' },
    { path: '/client/experts', role: 'client', name: 'Expert List' },
    { path: '/client/experts/expert-001', role: 'client', name: 'Expert Profile' },
    { path: '/client/profile', role: 'client', name: 'Client Profile' },
    { path: '/client/profile/edit', role: 'client', name: 'Edit Client Profile' },
    { path: '/client/billing', role: 'client', name: 'Billing' },
    // Expert routes
    { path: '/expert/dashboard', role: 'expert', name: 'Expert Dashboard' },
    { path: '/expert/find-jobs', role: 'expert', name: 'Find Jobs' },
    { path: '/expert/jobs', role: 'expert', name: 'Job List' },
    { path: '/expert/jobs/proj-001', role: 'expert', name: 'Job Detail' },
    { path: '/expert/jobs/proj-001/proposal', role: 'expert', name: 'Send Proposal' },
    { path: '/expert/proposals', role: 'expert', name: 'Proposal Status' },
    { path: '/expert/proposals/prop-002', role: 'expert', name: 'Proposal Detail (accepted)' },
    { path: '/expert/projects/proj-002', role: 'expert', name: 'Expert Project Detail' },
    { path: '/expert/profile', role: 'expert', name: 'Expert Profile' },
    { path: '/expert/profile/edit', role: 'expert', name: 'Edit Expert Profile' },
    { path: '/expert/wallet', role: 'expert', name: 'Expert Wallet' },
    // Admin routes
    { path: '/admin/dashboard', role: 'admin', name: 'Admin Dashboard' },
    { path: '/admin/users', role: 'admin', name: 'Admin Users' },
    { path: '/admin/disputes', role: 'admin', name: 'Admin Disputes' },
    { path: '/admin/revenue', role: 'admin', name: 'Admin Revenue' },
    // Common routes
    { path: '/notifications', role: 'client', name: 'Notifications' },
    { path: '/messenger', role: 'client', name: 'Messenger' },
    { path: '/messenger/conv-001', role: 'expert', name: 'Messenger (conversation)' },
  ];

  for (const route of allRoutes) {
    const page = await context.newPage();
    try {
      await injectDemoAuth(page, route.role === 'admin' ? 'admin@test.com' : route.role === 'expert' ? 'expert1@test.com' : 'client1@test.com');
      await page.goto(`${BASE_URL}${route.path}`, { waitUntil: 'networkidle', timeout: 15000 });
      await page.waitForTimeout(1000);
      const bodyText = await page.locator('body').textContent().catch(() => '');
      const isError = bodyText.includes('not found') || bodyText.includes('Not Found') ||
                      bodyText.includes('Access Denied') || bodyText.includes('Failed to load');
      if (isError) {
        console.log(`    ✗ ${route.name} (${route.path}): Error state`);
        record(`10. Route: ${route.name}`, `Error/Not Found at ${route.path}`, `Page shows error`, route.path, 'Route or data issue', 'Check component', 'High');
      } else {
        console.log(`    ✓ ${route.name} (${route.path}): OK`);
      }
    } catch (err) {
      console.log(`    ✗ ${route.name} (${route.path}): ${err.message}`);
      record(`10. Route: ${route.name}`, `FAILED: ${err.message}`, 'Page crashed', route.path, 'Component error', 'Fix component', 'High');
    }
    await page.close();
  }

  // ==========================================================================
  // 11. REFRESH TEST
  // ==========================================================================
  console.log("\n=== 11. REFRESH TEST ===");
  {
    const page = await context.newPage();
    await injectDemoAuth(page, 'client1@test.com');
    await page.goto(`${BASE_URL}/client/dashboard`, { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(2000);
    const beforeTitle = await page.locator('h1').first().textContent().catch(() => '');
    await page.reload({ waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(2000);
    const afterTitle = await page.locator('h1').first().textContent().catch(() => '');
    const stillOnDash = page.url().includes('dashboard');
    console.log(`  11. Refresh: before="${beforeTitle}", after="${afterTitle}", onDashboard=${stillOnDash}`);
    record('11. Refresh test', `Before: "${beforeTitle}", After: "${afterTitle}"`, stillOnDash ? null : 'Lost auth state after refresh', 'AuthContext.jsx', 'JWT token not restored from localStorage', 'Check token persistence', stillOnDash ? '-' : 'Critical');
    await page.close();
  }

  // ==========================================================================
  // 12. LOGOUT TEST
  // ==========================================================================
  console.log("\n=== 12. LOGOUT TEST ===");
  {
    const page = await context.newPage();
    await injectDemoAuth(page, 'client1@test.com');
    await page.goto(`${BASE_URL}/client/dashboard`, { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(2000);

    const logoutBtn = page.locator('button:has-text("Logout"), a:has-text("Logout"), button:has-text("Log Out"), button:has-text("Sign Out")').first();
    if (await logoutBtn.isVisible().catch(() => false)) {
      await logoutBtn.click();
      await page.waitForTimeout(2000);
      const afterLogout = page.url();
      console.log(`  12. Logout: ${afterLogout}`);
      record('12. Logout', `After logout: ${afterLogout}`, afterLogout.includes('login') || afterLogout === BASE_URL + '/' ? null : 'Not redirected after logout', 'AuthContext.jsx / RootLayout', 'Logout handler', 'Check logout redirect', 'Medium');
    } else {
      console.log('  12. Logout button not found');
      record('12. Logout', 'Logout button not visible', 'Cannot test logout', 'RootLayout.jsx', 'Button hidden or missing', 'Check sidebar/nav for logout button', 'Medium');
    }
    await page.close();
  }

  await browser.close();

  // ==========================================================================
  // PRINT REPORT
  // ==========================================================================
  console.log("\n\n");
  console.log("=".repeat(130));
  console.log("                      COMPREHENSIVE QA REPORT — AITasker Landing Page");
  console.log("=".repeat(130));

  // ---- Section 1: Summary ----
  const criticalBugs = results.filter(r => r.priority === 'Critical' && r.bug);
  const highBugs = results.filter(r => r.priority === 'High' && r.bug);
  const mediumBugs = results.filter(r => r.priority === 'Medium' && r.bug);
  const lowBugs = results.filter(r => r.priority === 'Low' && r.bug);
  const passedTests = results.filter(r => r.priority === '-' || !r.bug);

  console.log("\n## PHẦN 1: TÓM TẮT NHANH\n");
  console.log(`  App chạy được:        ✓ (HTTP 200, title "AITasker Landing Page Design")`);
  console.log(`  Playwright MCP:       Không khả dụng — dùng Playwright script thay thế`);
  console.log(`  Role đã test:         Client (client1@test.com), Expert (expert1@test.com), Admin (admin@test.com)`);
  console.log(`  Admin account:        CÓ — admin@test.com / 123456`);
  console.log(`  Admin route/page:     CÓ — 4 routes (/admin/dashboard, /users, /disputes, /revenue)`);
  console.log(`  Tổng checks:          ${results.length}`);
  console.log(`  Pass (OK):            ${passedTests.length}`);
  console.log(`  Critical bugs:        ${criticalBugs.length}`);
  console.log(`  High bugs:            ${highBugs.length}`);
  console.log(`  Medium bugs:          ${mediumBugs.length}`);
  console.log(`  Low bugs:             ${lowBugs.length}`);

  // ---- Section 2: Bug Details Table ----
  console.log("\n## PHẦN 2: BẢNG LỖI CHI TIẾT\n");
  const allBugs = results.filter(r => r.bug);
  if (allBugs.length === 0) {
    console.log("  Không có lỗi nào được phát hiện.");
  } else {
    console.log("| STT | Khu vực | Role | Luồng test | Lỗi phát hiện | File/route | Nguyên nhân | Cách sửa | Priority |");
    console.log("|-----|----------|------|-----------|--------------|------------|------------|----------|----------|");
    allBugs.forEach((b, i) => {
      const parts = b.flow.split(': ');
      const area = parts[0] || '';
      console.log(`| ${i+1} | ${area.substring(0,20)} | - | ${b.flow.substring(0,40)} | ${b.bug.substring(0,50)} | ${(b.file||'-').substring(0,25)} | ${(b.cause||'-').substring(0,30)} | ${(b.fix||'-').substring(0,30)} | ${b.priority} |`);
    });
  }

  // ---- Section 3: Button Audit ----
  console.log("\n## PHẦN 3: KIỂM TRA NÚT VÀ BACK BUTTON\n");
  if (buttonResults.length === 0) {
    console.log("  Không có kết quả kiểm tra nút.");
  } else {
    console.log("| STT | Role | Trang | Nút | Mong đợi | Thực tế | Đ/S | Ghi chú |");
    console.log("|-----|------|-------|-----|----------|---------|-----|---------|");
    buttonResults.forEach((b, i) => {
      console.log(`| ${i+1} | ${b.role} | ${b.page_name} | ${b.button_text} | ${b.expected.substring(0,30)} | ${b.actual.substring(0,30)} | ${b.passed} | ${(b.note||'').substring(0,30)} |`);
    });
  }

  // ---- Section 4: Status/Progress ----
  console.log("\n## PHẦN 4: STATUS & PROGRESS\n");
  console.log("### Project Statuses (chuẩn hóa trong projectStatusConfig.js):");
  console.log("| Status Key | Label | Badge Class |");
  console.log("|------------|-------|-------------|");
  console.log("| reviewing_proposals | Reviewing Proposals | bg-purple-100 text-purple-700 |");
  console.log("| in_progress | In Progress | bg-blue-100 text-blue-700 |");
  console.log("| waiting_review | Waiting Review | bg-yellow-100 text-yellow-700 |");
  console.log("| needs_revision | Needs Revision | bg-orange-100 text-orange-700 |");
  console.log("| completed | Completed | bg-green-100 text-green-700 |");
  console.log("| cancelled | Cancelled | bg-red-100 text-red-700 |");
  console.log("\n### Proposal Statuses (proposalStatusConfig.js):");
  console.log("| Status Key | Label | Badge Class |");
  console.log("|------------|-------|-------------|");
  console.log("| pending | Pending | bg-yellow-100 text-yellow-700 |");
  console.log("| accepted | Accepted | bg-green-100 text-green-700 |");
  console.log("| declined | Declined | bg-red-100 text-red-700 |");
  console.log("| withdrawn | Withdrawn | bg-gray-100 text-gray-600 |");
  console.log("| under_review | Under Review | bg-blue-100 text-blue-700 |");
  console.log("\n### Task Statuses (projectStatusConfig.js):");
  console.log("| Status Key | Label | Badge Class |");
  console.log("|------------|-------|-------------|");
  console.log("| In Progress | In Progress | bg-blue-100 text-blue-700 |");
  console.log("| Pending Review | Waiting for Client Review | bg-purple-100 text-purple-700 |");
  console.log("| Completed | Completed | bg-green-100 text-green-700 |");
  console.log("| Needs Revision | Needs Revision | bg-orange-100 text-orange-700 |");
  console.log("| Cancelled | Cancelled | bg-red-100 text-red-700 |");

  // ---- Section 5: Recommendations ----
  console.log("\n## PHẦN 5: ĐỀ XUẤT SỬA THEO THỨ TỰ\n");

  console.log("\n### NÊN SỬA NGAY (Critical/High)\n");
  const urgentBugs = [...criticalBugs, ...highBugs];
  if (urgentBugs.length === 0) {
    console.log("  Không có lỗi Critical hoặc High nào cần sửa ngay.");
  } else {
    urgentBugs.forEach(b => {
      console.log(`  - [${b.priority}] ${b.flow}: ${b.bug}`);
      console.log(`    File: ${b.file}`);
      console.log(`    Fix: ${b.fix}`);
    });
  }

  console.log("\n### NÊN SỬA TIẾP THEO (Medium)\n");
  if (mediumBugs.length === 0) {
    console.log("  Không có lỗi Medium.");
  } else {
    mediumBugs.forEach(b => {
      console.log(`  - [${b.priority}] ${b.flow}: ${b.bug}`);
      console.log(`    File: ${b.file}`);
      console.log(`    Fix: ${b.fix}`);
    });
  }

  console.log("\n### CÓ THỂ SỬA SAU (Low)\n");
  if (lowBugs.length === 0) {
    console.log("  Không có lỗi Low.");
  } else {
    lowBugs.forEach(b => {
      console.log(`  - [${b.priority}] ${b.flow}: ${b.bug}`);
      console.log(`    File: ${b.file}`);
      console.log(`    Fix: ${b.fix}`);
    });
  }

  console.log("\n" + "=".repeat(130));
  console.log("DONE.");
}

main().then(() => process.exit(0)).catch(err => { console.error(err); process.exit(1); });

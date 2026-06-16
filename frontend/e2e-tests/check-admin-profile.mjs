import { chromium } from 'playwright';

function createToken(email, role) {
  const h = {alg:'HS256',typ:'JWT'};
  const b = {sub:'u-'+Date.now(),email,role,name:email.split('@')[0],iat:Math.floor(Date.now()/1000),exp:Math.floor(Date.now()/1000)+86400};
  const e = (o) => Buffer.from(JSON.stringify(o)).toString('base64').replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
  return e(h)+'.'+e(b)+'.demo-signature';
}

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();

await page.goto('http://localhost:5173');
await page.evaluate((t) => localStorage.setItem('aitasker_auth_token', t), createToken('admin@test.com','admin'));

// Test admin profile
await page.goto('http://localhost:5173/admin/profile', { waitUntil: 'networkidle', timeout: 15000 });
await page.waitForTimeout(1500);
const h1 = await page.locator('h1').first().textContent().catch(() => 'NOT FOUND');
const body = await page.locator('body').textContent().catch(() => '');
console.log('Admin Profile:', h1, body.includes('not found') ? '✗ ERROR' : '✓ OK');

// Test admin edit profile
await page.goto('http://localhost:5173/admin/profile/edit', { waitUntil: 'networkidle', timeout: 15000 });
await page.waitForTimeout(1500);
const editH1 = await page.locator('h1').first().textContent().catch(() => 'NOT FOUND');
const editBody = await page.locator('body').textContent().catch(() => '');
console.log('Edit Admin Profile:', editH1, editBody.includes('not found') ? '✗ ERROR' : '✓ OK');

// Check Header profile link
await page.goto('http://localhost:5173/admin/dashboard', { waitUntil: 'networkidle', timeout: 15000 });
await page.waitForTimeout(1500);
const profileLink = page.locator('a[href="/admin/profile"]').first();
console.log('Header "/admin/profile" link:', await profileLink.isVisible().catch(() => false) ? '✓ Visible' : '✗ Missing');

// Check notifications dropdown for admin
const notifBtn = page.locator('button').filter({ has: page.locator('svg') }).first();
// Click the bell icon
const bellBtn = page.locator('header button').first();
if (await bellBtn.isVisible().catch(() => false)) {
  await bellBtn.click();
  await page.waitForTimeout(800);
  const dropdownText = await page.locator('body').textContent().catch(() => '');
  console.log('Notification dropdown:', dropdownText.includes('Admin Alerts') ? '✓ Shows Admin Alerts' : '✗ Missing Admin Alerts');
}

await browser.close();
console.log('\n✓ All admin profile checks complete.');

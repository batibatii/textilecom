import { test as setup, expect } from "@playwright/test";
import path from "path";

const authFile = path.join(__dirname, "../playwright/.auth/user.json");

setup("authenticate", async ({ page }) => {
  const testEmail = process.env.TEST_USER_EMAIL;
  const testPassword = process.env.TEST_USER_PASSWORD;

  if (!testEmail || !testPassword) {
    throw new Error(
      "TEST_USER_EMAIL and TEST_USER_PASSWORD must be set in .env.local file.\n" +
        "Create a test user in Firebase and add these variables to your .env.local"
    );
  }

  console.log(`🔐 Authenticating test user: ${testEmail}`);

  await page.goto("http://localhost:3000/user/signup");

  await expect(page.getByRole("heading", { name: "TEXTILECOM" })).toBeVisible();

  await page.locator('#email').fill(testEmail);
  await page.locator('#password').fill(testPassword);

  const signInButton = page.getByRole("button", { name: /^SIGN IN$/i });
  await expect(signInButton).toBeVisible();
  await signInButton.click();

  await page.waitForURL("http://localhost:3000/", { timeout: 10000 });

  await page.waitForLoadState("networkidle");

  console.log("✅ Authentication successful, saving state...");

  // Save authenticated state (cookies, localStorage, sessionStorage)
  await page.context().storageState({ path: authFile });

  console.log("✅ Authentication state saved to playwright/.auth/user.json");
});

import { Page, expect } from "@playwright/test";

export interface TestUser {
  email: string;
  password: string;
}

export async function goToAuthPage(page: Page) {
  await page.goto("/user/signup", { waitUntil: "networkidle" });
  // Wait for the email input field instead of heading (more reliable across browsers)
  await page.waitForSelector('#email', { state: 'visible', timeout: 10000 });
}

export async function fillAuthForm(
  page: Page,
  email: string,
  password: string
) {
  await page.locator("#email").fill(email);
  await page.locator("#password").fill(password);
}

export async function submitSignIn(page: Page) {
  const signInButton = page.getByRole("button", { name: /^SIGN IN$/i });
  await expect(signInButton).toBeEnabled();
  await signInButton.click();
}

export async function submitSignUp(page: Page) {
  const signUpButton = page.getByRole("button", { name: /^SIGN UP$/i });
  await expect(signUpButton).toBeEnabled();
  await signUpButton.click();
}

export async function waitForLoginSuccess(
  page: Page,
  redirectPath: string = "/"
) {
  await page.waitForURL((url) => url.pathname === redirectPath, {
    timeout: 10000,
  });
  await page.waitForLoadState("networkidle");
}

export async function isAuthenticated(page: Page): Promise<boolean> {
  const cookies = await page.context().cookies();
  return cookies.some((cookie) => cookie.name === "session");
}

export async function login(
  page: Page,
  email: string,
  password: string,
  redirectPath: string = "/"
) {
  await goToAuthPage(page);
  await fillAuthForm(page, email, password);
  await submitSignIn(page);
  await waitForLoginSuccess(page, redirectPath);
}

export async function signup(page: Page, email: string, password: string) {
  await goToAuthPage(page);
  await fillAuthForm(page, email, password);
  await submitSignUp(page);
  await waitForLoginSuccess(page);
}

export async function logout(page: Page) {
  await page.goto("/");

  const logoutButton = page.getByRole("button", { name: /logout|sign out/i });
  await expect(logoutButton).toBeVisible();
  await logoutButton.click();

  await page.waitForURL("/", { timeout: 5000 });
}

export async function getErrorMessage(page: Page): Promise<string | null> {
  const errorAlert = page.getByRole("alert");
  if (await errorAlert.isVisible()) {
    return await errorAlert.textContent();
  }
  return null;
}

export async function expectErrorMessage(page: Page, expectedMessage?: string) {
  const errorAlert = page.locator('[role="alert"][data-slot="alert"]');
  await expect(errorAlert).toBeVisible();

  if (expectedMessage) {
    await expect(errorAlert).toContainText(expectedMessage);
  }
}

export async function attemptProtectedRoute(page: Page, route: string) {
  await page.goto(route);

  await page.waitForURL(/\/user\/signup/, { timeout: 5000 });

  // Check that redirect parameter is present
  const url = new URL(page.url());
  return url.searchParams.get("redirect");
}

// Click the Google Sign In button (for testing UI presence, not actual OAuth)
export async function clickGoogleSignIn(page: Page) {
  const googleButton = page.getByRole("button", { name: /google/i });
  await expect(googleButton).toBeVisible();
  await googleButton.click();
}

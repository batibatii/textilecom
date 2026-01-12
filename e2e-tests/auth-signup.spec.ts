import { test, expect } from "@playwright/test";
import {
  goToAuthPage,
  fillAuthForm,
  submitSignUp,
  waitForLoginSuccess,
  expectErrorMessage,
  isAuthenticated,
} from "./helpers/auth-helpers";

test.describe("Signup Flow", () => {
  test.beforeEach(async ({ page }) => {
    await page.context().clearCookies();
    await page.context().clearPermissions();
  });

  test("should display signup form correctly", async ({ page }) => {
    await goToAuthPage(page);

    await expect(
      page.getByRole("button", { name: /^SIGN UP$/i })
    ).toBeVisible();

    await expect(page.locator("#email")).toBeVisible();
    await expect(page.locator("#password")).toBeVisible();

    await expect(page.getByRole("button", { name: /google/i })).toBeVisible();
  });

  test("should show validation error for invalid email", async ({ page }) => {
    await goToAuthPage(page);

    await page.locator("#email").fill("not-an-email");
    await page.locator("#email").blur(); //trigger validation

    await expectErrorMessage(page);

    expect(page.url()).toContain("/user/signup");
  });

  test("should show validation error for short password", async ({ page }) => {
    await goToAuthPage(page);

    await page.locator("#email").fill("newuser@example.com");

    await page.locator("#password").fill("short");
    await page.locator("#password").blur(); //trigger validation

    await expectErrorMessage(page);

    expect(page.url()).toContain("/user/signup");
  });

  test("should show error when email is already in use", async ({ page }) => {
    const testEmail = process.env.TEST_USER_EMAIL;

    if (!testEmail) {
      test.skip();
    }

    await goToAuthPage(page);

    await fillAuthForm(page, testEmail!, "AnotherPassword123!");
    await submitSignUp(page);

    // Should show Firebase error about email already in use
    await expectErrorMessage(
      page,
      "An account with this email address is already registered"
    );

    expect(page.url()).toContain("/user/signup");
  });

  test("should require both email and password", async ({ page }) => {
    await goToAuthPage(page);

    const createAccountButton = page.getByRole("button", {
      name: /^SIGN UP$/i,
    });

    await expect(createAccountButton).toBeVisible();

    await createAccountButton.click();

    const emailInput = page.locator("#email");
    const passwordInput = page.locator("#password");

    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();
  });

  test("should successfully create a new account", async ({ page }) => {
    const uniqueEmail = `test-${Date.now()}@example.com`;
    const password = "TestPassword123!";

    await goToAuthPage(page);

    await fillAuthForm(page, uniqueEmail, password);
    await submitSignUp(page);

    await waitForLoginSuccess(page);

    expect(await isAuthenticated(page)).toBe(true);

    expect(page.url()).toBe("http://localhost:3000/");
  });

  test("should handle redirect after signup", async ({ page }) => {
    const uniqueEmail = `test-${Date.now()}@example.com`;
    const password = "TestPassword123!";

    await page.goto("/cart");

    await page.waitForURL(/\/user\/signup\?redirect=/, { timeout: 5000 });

    const url = new URL(page.url());
    expect(url.searchParams.get("redirect")).toBe("/cart");

    await fillAuthForm(page, uniqueEmail, password);
    await submitSignUp(page);

    await waitForLoginSuccess(page, "/cart");

    expect(page.url()).toContain("/cart");
  });

  test('should have password field with type="password"', async ({ page }) => {
    await goToAuthPage(page);

    const passwordInput = page.locator("#password");

    await expect(passwordInput).toHaveAttribute("type", "password");
  });
});

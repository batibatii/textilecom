import { test, expect } from "@playwright/test";
import {
  goToAuthPage,
  fillAuthForm,
  submitSignIn,
  waitForLoginSuccess,
  expectErrorMessage,
  isAuthenticated,
} from "./helpers/auth-helpers";

test.describe("Login Flow", () => {
  test.beforeEach(async ({ page }) => {
    // Clear any existing authentication state
    await page.context().clearCookies();
    await page.context().clearPermissions();
  });

  test("should display login form correctly", async ({ page }) => {
    await goToAuthPage(page);

    await expect(
      page.getByRole("heading", { name: "TEXTILECOM" })
    ).toBeVisible();
    await expect(page.locator("#email")).toBeVisible();
    await expect(page.locator("#password")).toBeVisible();

    await expect(
      page.getByRole("button", { name: /sign in/i }).first()
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: /sign up/i }).first()
    ).toBeVisible();

    await expect(page.getByRole("button", { name: /google/i })).toBeVisible();
  });

  test("should successfully login with valid credentials", async ({ page }) => {
    const testEmail = process.env.TEST_USER_EMAIL;
    const testPassword = process.env.TEST_USER_PASSWORD;

    if (!testEmail || !testPassword) {
      test.skip();
    }

    await goToAuthPage(page);
    await fillAuthForm(page, testEmail!, testPassword!);
    await submitSignIn(page);

    await waitForLoginSuccess(page);

    expect(await isAuthenticated(page)).toBe(true);

    expect(page.url()).toBe("http://localhost:3000/");
  });

  test("should show error for invalid email format", async ({ page }) => {
    await goToAuthPage(page);

    await page.locator("#email").fill("invalidemail");
    await page.locator("#email").blur(); // Trigger validation

    await expectErrorMessage(page);

    expect(page.url()).toContain("/user/signup");
  });

  test("should show error for short password", async ({ page }) => {
    await goToAuthPage(page);

    await page.locator("#email").fill("test@example.com");

    await page.locator("#password").fill("short");
    await page.locator("#password").blur(); // Trigger validation

    await expectErrorMessage(page);

    expect(page.url()).toContain("/user/signup");
  });

  test("should show error for non-existent user", async ({ page }) => {
    await goToAuthPage(page);

    const nonExistentEmail = `nonexistent-${Date.now()}@example.com`;
    await fillAuthForm(page, nonExistentEmail, "ValidPassword123!");
    await submitSignIn(page);

    await expectErrorMessage(page);

    expect(page.url()).toContain("/user/signup");
  });

  test("should show error for incorrect password", async ({ page }) => {
    const testEmail = process.env.TEST_USER_EMAIL;

    if (!testEmail) {
      test.skip();
    }

    await goToAuthPage(page);

    await fillAuthForm(page, testEmail!, "WrongPassword123!");
    await submitSignIn(page);

    // Should show Firebase auth error
    await expectErrorMessage(page, "Incorrect email or password");

    expect(page.url()).toContain("/user/signup");
  });

  test("should handle redirect parameter after login", async ({ page }) => {
    const testEmail = process.env.TEST_USER_EMAIL;
    const testPassword = process.env.TEST_USER_PASSWORD;

    if (!testEmail || !testPassword) {
      test.skip();
    }

    await page.goto("/profile");

    await page.waitForURL(/\/user\/signup\?redirect=/, { timeout: 5000 });

    await fillAuthForm(page, testEmail!, testPassword!);
    await submitSignIn(page);

    await waitForLoginSuccess(page, "/profile");

    expect(page.url()).toContain("/profile");
  });
});

import { test, expect } from "@playwright/test";
import {
  attemptProtectedRoute,
  login,
  waitForLoginSuccess,
} from "./helpers/auth-helpers";

test.describe("Protected Routes", () => {
  test.describe("Unauthenticated Access", () => {
    test.beforeEach(async ({ page }) => {
      // Ensure no authentication
      await page.context().clearCookies();
    });

    test("should redirect unauthenticated user from /profile to signup", async ({
      page,
    }) => {
      await page.goto("/profile");

      await page.waitForURL(/\/user\/signup/, { timeout: 5000 });

      const url = new URL(page.url());
      expect(url.searchParams.get("redirect")).toBe("/profile");
    });

    test("should redirect unauthenticated user from /cart to signup", async ({
      page,
    }) => {
      await page.goto("/cart");

      await page.waitForURL(/\/user\/signup/, { timeout: 5000 });

      const url = new URL(page.url());
      expect(url.searchParams.get("redirect")).toBe("/cart");
    });

    test("should redirect unauthenticated user from /checkout to signup", async ({
      page,
    }) => {
      await page.goto("/checkout");

      await page.waitForURL(/\/user\/signup/, { timeout: 5000 });

      const url = new URL(page.url());
      expect(url.searchParams.get("redirect")).toBe("/checkout");
    });
  });

  test.describe("Authenticated Access", () => {
    test.use({
      storageState: "playwright/.auth/user.json",
    });

    test("should allow authenticated user to access /profile", async ({
      page,
    }) => {
      await page.goto("/profile");

      await page.waitForLoadState("networkidle");
      expect(page.url()).toContain("/profile");

      expect(page.url()).not.toContain("/user/signup");
    });

    test("should allow authenticated user to access /cart", async ({
      page,
    }) => {
      await page.goto("/cart");

      await page.waitForLoadState("networkidle");
      expect(page.url()).toContain("/cart");
    });

    test("should allow authenticated user to access /checkout", async ({
      page,
    }) => {
      await page.goto("/checkout");

      await page.waitForLoadState("networkidle");
      expect(page.url()).toContain("/checkout");
    });

    test("should maintain authentication across page navigation", async ({
      page,
    }) => {
      await page.goto("/");
      await page.waitForLoadState("networkidle");

      await page.goto("/profile");
      await page.waitForLoadState("networkidle");
      expect(page.url()).toContain("/profile");

      await page.goto("/cart");
      await page.waitForLoadState("networkidle");
      expect(page.url()).toContain("/cart");

      expect(page.url()).not.toContain("/user/signup");
    });

    test("should have valid session cookie", async ({ page }) => {
      await page.goto("/");

      const cookies = await page.context().cookies();
      const sessionCookie = cookies.find((c) => c.name === "session");

      expect(sessionCookie).toBeDefined();
      expect(sessionCookie?.httpOnly).toBe(true);
      expect(sessionCookie?.sameSite).toBe("Lax");
    });
  });

  test.describe("Redirect After Login", () => {
    test.beforeEach(async ({ page }) => {
      await page.context().clearCookies();
    });

    test("should clear redirect param after successful redirect", async ({
      page,
    }) => {
      const testEmail = process.env.TEST_USER_EMAIL;
      const testPassword = process.env.TEST_USER_PASSWORD;

      if (!testEmail || !testPassword) {
        test.skip();
      }

      await page.goto("/cart");
      await page.waitForURL(/\/user\/signup\?redirect=/, { timeout: 5000 });

      // Verify redirect parameter exists (URL-encoded as %2Fcart)
      const url = new URL(page.url());
      expect(url.searchParams.get("redirect")).toBe("/cart");

      await page.locator("#email").fill(testEmail!);
      await page.locator("#password").fill(testPassword!);
      await page.getByRole("button", { name: /^SIGN IN$/i }).click();

      await waitForLoginSuccess(page, "/cart");

      expect(page.url()).toContain("/cart");
      expect(page.url()).not.toContain("redirect=");
    });
  });

  test.describe("Session Expiration", () => {
    test("should handle expired session gracefully", async ({ page }) => {
      // Set an invalid/expired session cookie
      await page.context().addCookies([
        {
          name: "session",
          value: "expired-or-invalid-token",
          domain: "localhost",
          path: "/",
          httpOnly: true,
          sameSite: "Lax",
          expires: Date.now() / 1000 + 3600, // 1 hour from now
        },
      ]);

      await page.goto("/profile");

      await page.waitForURL(/\/user\/signup/, { timeout: 5000 });

      const url = new URL(page.url());
      expect(url.pathname).toBe("/user/signup");
      expect(url.searchParams.get("redirect")).toBe("/profile");

      // Verify the invalid session cookie was cleared by the server
      const cookies = await page.context().cookies();
      const sessionCookie = cookies.find((c) => c.name === "session");
      expect(sessionCookie).toBeUndefined();
    });
  });

  test.describe("Session Persistence", () => {
    test("should persist session across browser refresh", async ({ page }) => {
      const testEmail = process.env.TEST_USER_EMAIL;
      const testPassword = process.env.TEST_USER_PASSWORD;

      if (!testEmail || !testPassword) {
        test.skip();
      }

      await login(page, testEmail!, testPassword!);

      await page.goto("/profile");
      await page.waitForLoadState("networkidle");
      expect(page.url()).toContain("/profile");

      await page.reload();
      await page.waitForLoadState("networkidle");

      expect(page.url()).toContain("/profile");
      expect(page.url()).not.toContain("/user/signup");
    });

    test("should maintain session in new tab", async ({ context }) => {
      const testEmail = process.env.TEST_USER_EMAIL;
      const testPassword = process.env.TEST_USER_PASSWORD;

      if (!testEmail || !testPassword) {
        test.skip();
      }

      const page1 = await context.newPage();
      await login(page1, testEmail!, testPassword!);

      const page2 = await context.newPage();

      await page2.goto("/profile");
      await page2.waitForLoadState("networkidle");

      expect(page2.url()).toContain("/profile");
      expect(page2.url()).not.toContain("/user/signup");

      await page1.close();
      await page2.close();
    });
  });
});

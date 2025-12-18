import { test, expect } from "@playwright/test";

test.describe("Product to Cart Flow", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
  });

  test("should add a product to cart from home page", async ({ page }) => {
    await page.waitForSelector('[data-testid="product-card"], article img', {
      timeout: 10000,
    });

    const productCards = page.locator("article").filter({
      hasNotText: "OUT OF STOCK",
    });

    await productCards.first().click();

    await expect(page.getByRole("dialog")).toBeVisible({ timeout: 5000 });

    // Wait for dialog content to load
    const productTitle = await page
      .getByRole("dialog")
      .getByRole("heading", { level: 2 })
      .textContent();
    expect(productTitle).toBeTruthy();

    const sizeButtons = page.getByRole("button", { name: /^(S|M|L|XXL)$/ });
    const hasSizes = (await sizeButtons.count()) > 0;

    if (hasSizes) {
      const sizeM = page.getByRole("button", { name: "M" });
      if (await sizeM.isVisible()) {
        await sizeM.click();
      } else {
        await sizeButtons.first().click();
      }
    }

    const dialog = page.getByRole("dialog");
    const quantityDisplay = dialog.getByText(/^\d+$/);
    await expect(quantityDisplay).toHaveText("1");

    const plusButton = dialog.getByRole("button", { name: "+" });
    await plusButton.click();
    await expect(quantityDisplay).toHaveText("2");

    const addToCartButton = page.getByRole("button", { name: /add to cart/i });
    await expect(addToCartButton).toBeEnabled();
    await addToCartButton.click();

    await expect(page.getByRole("alert")).toBeVisible({ timeout: 3000 });

    await page.keyboard.press("Escape");

    await expect(page.getByRole("dialog")).not.toBeVisible();

    const cartLink = page.getByRole("link", { name: /cart/i });
    await expect(cartLink).toBeVisible();
  });

  test("should navigate to cart and verify added product", async ({ page }) => {
    await page.waitForSelector('[data-testid="product-card"], article img', {
      timeout: 10000,
    });

    const productCards = page.locator("article").filter({
      hasNotText: "OUT OF STOCK",
    });

    await productCards.first().click();

    await expect(page.getByRole("dialog")).toBeVisible();

    const productTitle = await page
      .getByRole("dialog")
      .getByRole("heading", { level: 2 })
      .textContent();

    const sizeButtons = page.getByRole("button", { name: /^(S|M|L|XXL)$/ });
    const hasSizes = (await sizeButtons.count()) > 0;
    let selectedSize = "";

    if (hasSizes) {
      const sizeM = page.getByRole("button", { name: "M" });
      if (await sizeM.isVisible()) {
        await sizeM.click();
        selectedSize = "M";
      } else {
        await sizeButtons.first().click();
        selectedSize = (await sizeButtons.first().textContent()) || "";
      }
    }

    await page.getByRole("button", { name: /add to cart/i }).click();

    // Wait for success alert to appear
    await expect(page.getByRole("alert")).toBeVisible({ timeout: 3000 });

    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog")).not.toBeVisible();

    const cartLink = page.getByRole("link", { name: /cart/i });
    await cartLink.click();
    await page.waitForURL(/\/cart/);
    await page.waitForLoadState("networkidle");

    expect(page.url()).toContain("/cart");

    await expect(page.getByText(/your cart is empty/i)).not.toBeVisible();

    // Product title may be in different case in cart, use case-insensitive regex
    await expect(page.getByText(new RegExp(productTitle!, "i"))).toBeVisible();

    if (selectedSize) {
      await expect(page.getByText(`Size: ${selectedSize}`)).toBeVisible();
    }

    await expect(page.getByText("Order Summary")).toBeVisible();
    await expect(page.getByText("Subtotal")).toBeVisible();
    await expect(page.getByText("Tax")).toBeVisible();
    await expect(page.getByText("Total", { exact: true })).toBeVisible();

    await expect(
      page.getByRole("button", { name: /proceed to checkout/i })
    ).toBeVisible();
  });

  test("should not add out of stock products to cart", async ({ page }) => {
    await page.waitForSelector('[data-testid="product-card"], article img', {
      timeout: 10000,
    });

    const outOfStockProduct = page.locator("article").filter({
      hasText: "OUT OF STOCK",
    });

    const outOfStockCount = await outOfStockProduct.count();

    if (outOfStockCount > 0) {
      await outOfStockProduct.first().click();
      await expect(page.getByRole("dialog")).toBeVisible();

      const dialog = page.getByRole("dialog");
      await expect(dialog.getByText("OUT OF STOCK")).toBeVisible();

      const addToCartButton = dialog.getByRole("button", {
        name: /out of stock/i,
      });
      await expect(addToCartButton).toBeVisible();
      await expect(addToCartButton).toBeDisabled();

      await page.keyboard.press("Escape");
    } else {
      test.skip();
    }
  });

  test("should show low stock warning", async ({ page }) => {
    await page.waitForSelector('[data-testid="product-card"], article img', {
      timeout: 10000,
    });

    const lowStockProduct = page.locator("article").filter({
      hasText: "LOW STOCK",
    });

    const lowStockCount = await lowStockProduct.count();

    if (lowStockCount > 0) {
      await lowStockProduct.first().click();
      await expect(page.getByRole("dialog")).toBeVisible();

      const dialog = page.getByRole("dialog");
      await expect(dialog.getByText("LOW STOCK")).toBeVisible();

      const plusButton = dialog.getByRole("button", { name: "+" });
      const quantityDisplay = dialog.getByText(/^\d+$/);

      let clicks = 0;
      while ((await plusButton.isEnabled()) && clicks < 20) {
        await plusButton.click();
        clicks++;
        await page.waitForTimeout(200);
      }

      await expect(plusButton).toBeDisabled();

      await page.keyboard.press("Escape");
    } else {
      test.skip();
    }
  });

  test("should display product information in detail modal", async ({
    page,
  }) => {
    await page.waitForSelector('[data-testid="product-card"], article img', {
      timeout: 10000,
    });

    const productCards = page.locator("article").filter({
      hasNotText: "OUT OF STOCK",
    });

    await productCards.first().click();
    await expect(page.getByRole("dialog")).toBeVisible();

    const dialog = page.getByRole("dialog");

    await expect(dialog.getByRole("heading", { level: 2 })).toBeVisible();

    // Check for price (there may be multiple if discounted, so use first())
    await expect(dialog.getByText(/\$|USD|EUR|TRY/).first()).toBeVisible();

    await expect(dialog.locator("p").first()).toBeVisible();

    await expect(dialog.locator("img")).toBeVisible();

    await expect(dialog.getByRole("button", { name: "−" })).toBeVisible();
    await expect(dialog.getByRole("button", { name: "+" })).toBeVisible();

    await expect(
      page.getByRole("button", { name: /add to cart/i })
    ).toBeVisible();

    await page.keyboard.press("Escape");
  });

  test("should close modal when clicking outside or pressing escape", async ({
    page,
  }) => {
    await page.waitForSelector('[data-testid="product-card"], article img', {
      timeout: 10000,
    });

    const productCards = page.locator("article");
    await productCards.first().click();

    await expect(page.getByRole("dialog")).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog")).not.toBeVisible();

    await productCards.first().click();
    await expect(page.getByRole("dialog")).toBeVisible();

    // Click on the overlay (background) to close
    await page
      .locator('[data-slot="dialog-overlay"]')
      .click({ position: { x: 10, y: 10 } });

    await expect(page.getByRole("dialog")).not.toBeVisible();
  });
});

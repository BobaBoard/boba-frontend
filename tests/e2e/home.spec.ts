import { expect, test } from "@playwright/test";

test.describe("Home", () => {
  test("should display Realm boards", async ({ page }) => {
    await page.goto("http://twisted-minds_boba.local:3000/");

    await expect(page.getByText(/gore/i)).toBeVisible();
  });
});

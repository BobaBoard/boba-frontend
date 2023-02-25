import { authenticate, request } from "../utils";
import { expect, test } from "@playwright/test";

import { GORE_BOARD_ID } from "../../tests/data/BoardSummary";

test.describe("Board page", () => {
  test("Should unpin and repin board", async ({ page }) => {
    await page.goto("http://twisted-minds_boba.local:3000/!gore");
    await authenticate({ page });

    await page.locator("[aria-label='pinned boards']").getByLabel("gore");

    await page.getByLabel("Board options").click();

    await Promise.all([
      page.waitForRequest(
        request({
          method: "DELETE",
          url: `http://localhost:4200/boards/${GORE_BOARD_ID}/pin`,
        })
      ),
      page.getByText("Unpin", { exact: true }).click(),
    ]);

    await expect(
      page.locator("[aria-label='pinned boards']").getByLabel("gore")
    ).not.toBeVisible();

    await page.getByLabel("Board options").click();

    await Promise.all([
      page.waitForRequest(
        request({
          method: "POST",
          url: `http://localhost:4200/boards/${GORE_BOARD_ID}/pin`,
        })
      ),
      page.getByText("Pin", { exact: true }).click(),
    ]);

    await page.locator("[aria-label='pinned boards']").getByLabel("gore");
  });
});

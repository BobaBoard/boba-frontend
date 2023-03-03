import { authenticate, request } from "../utils";

import { GORE_BOARD_ID } from "../../data/BoardSummary";
import { test } from "@playwright/test";

test.describe("Board page", () => {
  test("Should dismiss board notifications", async ({ page }) => {
    await page.goto("http://twisted-minds_boba.local:3000/!gore");
    await authenticate({ page });

    page.getByLabel("Board options").click();
    await Promise.all([
      page.waitForRequest(
        request({
          method: "DELETE",
          url: `http://localhost:4200/boards/${GORE_BOARD_ID}/notifications`,
        })
      ),
      page.getByText("Dismiss notifications").click(),
    ]);
  });
});

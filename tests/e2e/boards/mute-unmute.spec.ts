import { authenticate, request } from "../utils";

import { GORE_BOARD_ID } from "../../data/BoardSummary";
import { test } from "@playwright/test";

test.describe("Board page", () => {
  test("Should mute and unmute board", async ({ page }) => {
    // Mute board
    await page.goto("http://twisted-minds_boba.local:3000/!gore");
    await authenticate({ page });

    await page.getByLabel("Board options").click();

    await Promise.all([
      page.waitForRequest(
        request({
          method: "POST",
          url: `http://localhost:4200/boards/${GORE_BOARD_ID}/mute`,
        })
      ),
      page.getByText("Mute").click(),
    ]);

    // TODO: add a label rather than getting this by class
    await page.locator(".board-details .muted-icon");

    await page.getByLabel("Board options").click();

    await Promise.all([
      page.waitForRequest(
        request({
          method: "DELETE",
          url: `http://localhost:4200/boards/${GORE_BOARD_ID}/mute`,
        })
      ),
      page.getByText("Unmute").click(),
    ]);

    // TODO: add a label rather than getting this by class
    await page.waitForSelector(".board-details .muted-icon", {
      state: "detached",
    });
  });
});

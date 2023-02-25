import { Page, Request, Response } from "@playwright/test";

import dotenv from "dotenv";

dotenv.config({
  path: ".env.test",
});

export const authenticate = async ({ page }: { page: Page }) => {
  await page.locator("header").getByLabel("login").click();
  await page.getByLabel("email").fill(process.env.TEST_EMAIL!);
  await page.getByLabel("password").fill(process.env.TEST_PASSWORD!);
  await page.getByText("login").click();
  await page.locator("header [aria-label='User menu'] img[src*='bobatan']");
};

export const request = (expected: {
  method: "DELETE" | "GET" | "POST" | "PATCH";
  url: string;
}) => {
  return (request: Request) => {
    return request.method() == expected.method && request.url() == expected.url;
  };
};

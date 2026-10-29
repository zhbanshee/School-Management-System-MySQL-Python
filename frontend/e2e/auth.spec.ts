import { test, expect } from "@playwright/test";
import { randomUUID } from "node:crypto";
const password = "Schoolhouse-browser-passphrase!";

test("registration, persistence, sign out and sign in", async ({ page }) => {
  const email = `${randomUUID()}@example.com`;
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Welcome back." }),
  ).toBeVisible();
  const anonymous = await page.request.get("/api/data");
  expect(anonymous.status()).toBe(401);
  await page
    .getByRole("button", { name: "Create account", exact: true })
    .click();
  await page.getByLabel("Your name", { exact: true }).fill("Alex Morgan");
  await page.getByLabel("Email address", { exact: true }).fill(email);
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page.getByLabel("Confirm password", { exact: true }).fill(password);
  await page
    .getByRole("button", { name: "Create account", exact: true })
    .last()
    .click();
  await expect(
    page.getByRole("heading", { name: "School overview", exact: true }),
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "School overview", exact: true }),
  ).toBeVisible();
  if (await page.getByRole("button", { name: "Open navigation" }).isVisible())
    await page.getByRole("button", { name: "Open navigation" }).click();
  await expect(page.getByText("Alex Morgan", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Sign out", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Welcome back." }),
  ).toBeVisible();
  expect((await page.request.get("/api/data")).status()).toBe(401);
  await page.getByLabel("Email address", { exact: true }).fill(email);
  await page.getByLabel("Password", { exact: true }).fill("wrong password");
  await page
    .getByRole("button", { name: "Sign in", exact: true })
    .last()
    .click();
  await expect(page.getByRole("alert")).toContainText(
    "Email or password is incorrect.",
  );
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page
    .getByRole("button", { name: "Sign in", exact: true })
    .last()
    .click();
  await expect(
    page.getByRole("heading", { name: "School overview", exact: true }),
  ).toBeVisible();
});

test("registration validates confirmation and can start empty", async ({
  page,
}) => {
  await page.goto("/");
  await page
    .getByRole("button", { name: "Create account", exact: true })
    .click();
  await page.getByLabel("Your name", { exact: true }).fill("Empty Workspace");
  await page
    .getByLabel("Email address", { exact: true })
    .fill(`${randomUUID()}@example.com`);
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page
    .getByLabel("Confirm password", { exact: true })
    .fill("A different long password!");
  await page
    .getByRole("button", { name: "Show password", exact: true })
    .click();
  await expect(page.getByLabel("Password", { exact: true })).toHaveAttribute(
    "type",
    "text",
  );
  await page
    .getByRole("button", { name: "Create account", exact: true })
    .last()
    .click();
  await expect(page.getByRole("alert")).toContainText(
    "Passwords do not match.",
  );
  await page.getByLabel("Confirm password", { exact: true }).fill(password);
  await page.getByLabel("Include sample school records").uncheck();
  await page
    .getByRole("button", { name: "Create account", exact: true })
    .last()
    .click();
  await expect(
    page.getByRole("heading", { name: "School overview", exact: true }),
  ).toBeVisible();
  const data = await (await page.request.get("/api/data")).json();
  expect(data.students).toEqual([]);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBeTruthy();
});

test("a lost session returns to sign in without exporting cached school records", async ({
  page,
}) => {
  const registered = await page.request.post("/api/auth/register", {
    data: {
      name: "Session Test",
      email: `${randomUUID()}@example.com`,
      password,
      sample_data: true,
    },
  });
  expect(registered.status()).toBe(201);
  await page.goto("/#students");
  await expect(
    page.getByRole("heading", { name: "All students", exact: true }),
  ).toBeVisible();
  await page.context().clearCookies();
  await page.getByRole("button", { name: "Export CSV", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Welcome back.", exact: true }),
  ).toBeVisible();
  await expect(page.getByRole("alert")).toContainText("Your session expired.");
});

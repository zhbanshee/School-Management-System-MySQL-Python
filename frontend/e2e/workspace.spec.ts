import { test, expect } from "@playwright/test";
import { randomUUID } from "node:crypto";

test.beforeEach(async ({ page }) => {
  const registered = await page.request.post("/api/auth/register", {
    data: {
      name: "Browser Administrator",
      email: `${randomUUID()}@schoolhouse.example`,
      password: "Browser-tests-password-2026!",
      sample_data: true,
    },
  });
  expect(registered.status()).toBe(201);
});

test("student lifecycle persists, searches and deletes", async ({
  page,
}, testInfo) => {
  const first = testInfo.project.name === "mobile" ? "Mobile" : "Browser";
  await page.goto("/#students");
  await expect(
    page.getByRole("heading", { name: "All students", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Add student", exact: true }).click();
  await page.getByLabel("First name", { exact: true }).fill(first);
  await page.getByLabel("Last name", { exact: true }).fill("Testerson");
  await page
    .getByLabel("Email address", { exact: true })
    .fill(`${first.toLowerCase()}@example.com`);
  await page.getByRole("button", { name: "Save student", exact: true }).click();
  await expect(page.getByRole("dialog")).not.toBeVisible();
  const search = page.getByRole("textbox", { name: "Search students" });
  await search.fill(first);
  const row = page.getByRole("row").filter({ hasText: `${first} Testerson` });
  await expect(row).toBeVisible();
  await row.getByRole("button", { name: /Edit student/ }).click();
  await page.getByLabel("Last name", { exact: true }).fill("Updated");
  await page.getByRole("button", { name: "Save student", exact: true }).click();
  await expect(page.getByRole("dialog")).not.toBeVisible();
  await page.reload();
  await page.getByRole("textbox", { name: "Search students" }).fill(first);
  const updated = page.getByRole("row").filter({ hasText: `${first} Updated` });
  await expect(updated).toBeVisible();
  await updated.getByRole("button", { name: /Edit student/ }).click();
  await page.getByRole("button", { name: "Delete", exact: true }).click();
  await page.getByRole("button", { name: "Yes, delete", exact: true }).click();
  await expect(page.getByRole("dialog")).not.toBeVisible();
  await expect(
    page.getByRole("heading", { name: "No matches this time." }),
  ).toBeVisible();
});

test("overview, schedule and mobile navigation are usable", async ({
  page,
}, testInfo) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "School overview" }),
  ).toBeVisible();
  await expect(page.getByRole("heading", { name: "Attendance" })).toBeVisible();
  await page.getByRole("tab", { name: "Sunday", exact: true }).click();
  await expect(page.getByRole("tabpanel")).toContainText(
    "No classes scheduled for Sunday.",
  );
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBeTruthy();
  if (testInfo.project.name === "mobile")
    await page.getByRole("button", { name: "Open navigation" }).click();
  await page.getByRole("link", { name: "Teachers", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "All teachers", exact: true }),
  ).toBeVisible();
  await page.getByRole("textbox", { name: "Search teachers" }).fill("eleanor");
  await expect(
    page.getByRole("row").filter({ hasText: "Eleanor Hayes" }),
  ).toBeVisible();
});

test("enrollment, grading and attendance work as one flow", async ({
  page,
}, testInfo) => {
  const mobile = testInfo.project.name === "mobile";
  await page.goto("/#registrations");
  await page
    .getByRole("button", { name: "Add enrollment", exact: true })
    .click();
  await page
    .getByLabel("Student", { exact: true })
    .selectOption(mobile ? "1004" : "1003");
  await page
    .getByLabel("Course", { exact: true })
    .selectOption(mobile ? "306" : "301");
  await page.getByLabel("Teacher", { exact: true }).selectOption("201");
  await page.getByLabel("Grade", { exact: true }).selectOption("A");
  await page
    .getByRole("button", { name: "Save enrollment", exact: true })
    .click();
  await expect(page.getByRole("dialog")).not.toBeVisible();
  await page
    .getByRole("textbox", { name: "Search enrollments" })
    .fill(mobile ? "Noah Williams" : "Sofia Martinez");
  const rows = page
    .getByRole("row")
    .filter({ hasText: mobile ? "Data & society" : "Applied mathematics" });
  await expect(rows.first()).toContainText("A");
  await page.goto("/#attendance");
  await page
    .getByRole("button", { name: "Mark attendance", exact: true })
    .click();
  await page
    .getByLabel("Enrollment", { exact: true })
    .selectOption({ index: 1 });
  await page
    .getByLabel("Attendance date", { exact: true })
    .fill(mobile ? "2020-01-03" : "2020-01-02");
  await page.getByLabel("Status", { exact: true }).selectOption("Late");
  await page
    .getByRole("button", { name: "Save attendance entry", exact: true })
    .click();
  await expect(page.getByRole("dialog")).not.toBeVisible();
  await page
    .getByRole("combobox", { name: "Filter attendance" })
    .selectOption("Late");
  await expect(page.getByRole("row").nth(1)).toContainText("Late");
});

test("CSV download and empty search state", async ({ page }) => {
  await page.goto("/#students");
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export CSV" }).click();
  expect((await download).suggestedFilename()).toBe("school-students.csv");
  await page
    .getByRole("textbox", { name: "Search students" })
    .fill("no such student 123xyz");
  await expect(
    page.getByRole("heading", { name: "No matches this time." }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Clear filters", exact: true })
    .click();
  await expect(page.getByRole("row")).toHaveCount(9);
});

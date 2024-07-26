import { assertEquals } from "@std/assert";
import { createSummary } from "./summary.ts";

Deno.test("summary - empty sequence", () => {
  assertEquals(
    createSummary([], { prefix: "" }),
    "All dependencies are up-to-date",
  );
});

Deno.test("summary - single commit", () => {
  assertEquals(
    createSummary(
      [{
        dep: { name: "@molt/core" },
        summary: () => "update @molt/core to 1.0.0",
      }],
      { prefix: "" },
    ),
    "update @molt/core to 1.0.0",
  );
});

Deno.test("summary - two commits", () => {
  assertEquals(
    createSummary(
      [
        {
          dep: { name: "@molt/core" },
          summary: () => "update @molt/core",
        },
        {
          dep: { name: "@molt/cli" },
          summary: () => "update @molt/cli",
        },
      ],
      { prefix: "" },
    ),
    "update @molt/core and @molt/cli",
  );
});

Deno.test("summary - three commits", () => {
  assertEquals(
    createSummary(
      [
        {
          dep: { name: "@molt/core" },
          summary: () => "update @molt/core",
        },
        {
          dep: { name: "@molt/cli" },
          summary: () => "update @molt/cli",
        },
        {
          dep: { name: "@molt/lib" },
          summary: () => "update @molt/lib",
        },
      ],
      { prefix: "" },
    ),
    "update @molt/core, @molt/cli, and @molt/lib",
  );
});

Deno.test("summary - many commits", () => {
  assertEquals(
    createSummary(
      [
        {
          dep: { name: "@molt/core" },
          summary: () => "update @molt/core",
        },
        {
          dep: { name: "@molt/cli" },
          summary: () => "update @molt/cli",
        },
        {
          dep: { name: "@molt/lib" },
          summary: () => "update @molt/lib",
        },
        {
          dep: { name: "@molt/integration" },
          summary: () => "update @molt/integration",
        },
      ],
      { prefix: "" },
    ),
    "update dependencies",
  );
});

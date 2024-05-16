import { assertEquals } from "@std/assert";
import { createSummary } from "./summary.ts";

Deno.test("summary - empty sequence", () => {
  assertEquals(
    createSummary({ commits: [], options: {} }, { prefix: "" }),
    "All dependencies are up-to-date",
  );
});

Deno.test("summary - single commit", () => {
  assertEquals(
    createSummary(
      {
        commits: [
          // deno-lint-ignore no-explicit-any
          { group: "@molt/core", message: "update @molt/core to 1.0.0" } as any,
        ],
        options: {},
      },
      { prefix: "" },
    ),
    "update @molt/core to 1.0.0",
  );
});

Deno.test("summary - two commits", () => {
  assertEquals(
    createSummary(
      {
        commits: [
          // deno-lint-ignore no-explicit-any
          { group: "@molt/core" } as any,
          // deno-lint-ignore no-explicit-any
          { group: "@molt/cli" } as any,
        ],
        options: {},
      },
      { prefix: "" },
    ),
    "update @molt/core and @molt/cli",
  );
});

Deno.test("summary - three commits", () => {
  assertEquals(
    createSummary(
      {
        commits: [
          // deno-lint-ignore no-explicit-any
          { group: "@molt/core" } as any,
          // deno-lint-ignore no-explicit-any
          { group: "@molt/cli" } as any,
          // deno-lint-ignore no-explicit-any
          { group: "@molt/lib" } as any,
        ],
        options: {},
      },
      { prefix: "" },
    ),
    "update @molt/core, @molt/cli, and @molt/lib",
  );
});

Deno.test("summary - many commits", () => {
  assertEquals(
    createSummary(
      {
        commits: [
          // deno-lint-ignore no-explicit-any
          { group: "@molt/core" } as any,
          // deno-lint-ignore no-explicit-any
          { group: "@molt/cli" } as any,
          // deno-lint-ignore no-explicit-any
          { group: "@molt/lib" } as any,
          // deno-lint-ignore no-explicit-any
          { group: "@molt/integration" } as any,
        ],
        options: {},
      },
      { prefix: "" },
    ),
    "update dependencies",
  );
});

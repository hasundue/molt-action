import { assertEquals } from "@std/assert";
import { fromCommitSequence } from "./summary.ts";

Deno.test("fromCommitSequence - empty sequence", () => {
  assertEquals(
    fromCommitSequence({ commits: [], options: {} }, { prefix: "" }),
    "All dependencies are up-to-date",
  );
});

Deno.test("fromCommitSequence - single commit", () => {
  assertEquals(
    fromCommitSequence(
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

Deno.test("fromCommitSequence - two commits", () => {
  assertEquals(
    fromCommitSequence(
      {
        commits: [
          // deno-lint-ignore no-explicit-any
          { group: "@molt/core" } as any,
          // deno-lint-ignore no-explicit-any
          { group: "@molt/cli", } as any,
        ],
        options: {},
      },
      { prefix: "" },
    ),
    "update @molt/core and @molt/cli",
  );
});

Deno.test("fromCommitSequence - three commits", () => {
  assertEquals(
    fromCommitSequence(
      {
        commits: [
          // deno-lint-ignore no-explicit-any
          { group: "@molt/core" } as any,
          // deno-lint-ignore no-explicit-any
          { group: "@molt/cli", } as any,
            // deno-lint-ignore no-explicit-any
          { group: "@molt/lib", } as any, ],
        options: {},
      },
      { prefix: "" },
    ),
    "update @molt/core, @molt/cli, and @molt/lib",
  );
});

Deno.test("fromCommitSequence - many commits", () => {
  assertEquals(
    fromCommitSequence(
      {
        commits: [
          // deno-lint-ignore no-explicit-any
          { group: "@molt/core" } as any,
          // deno-lint-ignore no-explicit-any
          { group: "@molt/cli", } as any,
            // deno-lint-ignore no-explicit-any
          { group: "@molt/lib", } as any,
            // deno-lint-ignore no-explicit-any
          { group: "@molt/integration", } as any,
        ],
        options: {},
      },
      { prefix: "" },
    ),
    "update dependencies",
  );
});

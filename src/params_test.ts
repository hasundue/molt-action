import { assertObjectMatch } from "@std/assert";
import { fromInputs } from "./params.ts";

Deno.test("fromInputs - default source (deno.json)", async () => {
  assertObjectMatch(
    await fromInputs({
      root: "test/fixtures",
    }),
    {
      config: "deno.json",
      root: "test/fixtures",
      source: ["deno.json"],
    },
  );
});

Deno.test("fromInputs - default source (modules)", async () => {
  assertObjectMatch(
    await fromInputs({
      root: "src",
    }),
    {
      config: undefined,
      root: "src",
      source: ["./**/*.ts"],
    },
  );
});

Deno.test("fromInputs - explicit sources", async () => {
  assertObjectMatch(
    await fromInputs({
      root: "test/fixtures",
      source: ["mod.ts", "deps.ts"],
    }),
    {
      config: "deno.json",
      root: "test/fixtures",
      source: ["mod.ts", "deps.ts"],
    },
  );
});

Deno.test("fromInputs - empty inputs", async () => {
  assertObjectMatch(
    await fromInputs({}),
    {
      config: "deno.json",
      root: ".",
      source: ["deno.json"],
    },
  );
});

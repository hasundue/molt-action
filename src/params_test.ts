import { assertObjectMatch } from "@std/assert";
import { defaults } from "./inputs.ts";
import { fromInputs } from "./params.ts";

Deno.test("fromInputs - defaults", async () => {
  assertObjectMatch(
    await fromInputs({
      ...defaults,
      root: "test/fixtures",
    }),
    {
      config: "deno.json",
      prefix: "chore: ",
      lock: "deno.lock",
      root: "test/fixtures",
      source: [],
    },
  );
});

Deno.test("fromInputs - no config", async () => {
  assertObjectMatch(
    await fromInputs({
      ...defaults,
      config: false,
      root: "test/fixtures",
    }),
    {
      config: undefined,
      prefix: "chore: ",
      lock: "deno.lock",
      root: "test/fixtures",
      source: ["./**/*.ts"],
    },
  );
});

Deno.test("fromInputs - explicit sources", async () => {
  assertObjectMatch(
    await fromInputs({
      ...defaults,
      config: false,
      root: "test/fixtures",
      source: ["mod.ts", "deps.ts"],
    }),
    {
      config: undefined,
      lock: "deno.lock",
      prefix: "chore: ",
      root: "test/fixtures",
      source: ["mod.ts", "deps.ts"],
    },
  );
});

Deno.test("fromInputs - no lock", async () => {
  assertObjectMatch(
    await fromInputs({
      ...defaults,
      lock: false,
      root: "test/fixtures",
    }),
    {
      config: "deno.json",
      prefix: "chore: ",
      lock: undefined,
      root: "test/fixtures",
      source: [],
    },
  );
});

Deno.test("fromInputs - modules", async () => {
  assertObjectMatch(
    await fromInputs({
      ...defaults,
      root: "src",
    }),
    {
      config: undefined,
      lock: undefined,
      prefix: "chore: ",
      root: "src",
      source: ["./**/*.ts"],
    },
  );
});

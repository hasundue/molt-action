import { assertObjectMatch } from "@std/assert";
import { fromInputs } from "./params.ts";

Deno.test("fromInputs - default source (deno.json)", async () => {
  assertObjectMatch(
    await fromInputs({
      commit: true,
      pr: true,
      root: "test/fixtures",
      resolve: false,
    }),
    {
      commit: true,
      config: "deno.json",
      pr: true,
      resolve: false,
      root: "test/fixtures",
      source: ["deno.json"],
    },
  );
});

Deno.test("fromInputs - default source (modules)", async () => {
  assertObjectMatch(
    await fromInputs({
      commit: true,
      pr: true,
      root: "src",
      resolve: false,
    }),
    {
      commit: true,
      config: undefined,
      pr: true,
      resolve: false,
      root: "src",
      source: ["./**/*.ts"],
    },
  );
});

Deno.test("fromInputs - explicit sources", async () => {
  assertObjectMatch(
    await fromInputs({
      commit: false,
      pr: false,
      root: "test/fixtures",
      resolve: true,
      source: ["mod.ts", "deps.ts"],
    }),
    {
      config: "deno.json",
      pr: false,
      resolve: true,
      root: "test/fixtures",
      source: ["mod.ts", "deps.ts"],
    },
  );
});

Deno.test("fromInputs - default inputs", async () => {
  assertObjectMatch(
    await fromInputs({
      commit: true,
      pr: true,
      resolve: false,
    }),
    {
      commit: true,
      config: "deno.json",
      pr: true,
      root: ".",
      source: ["deno.json"],
    },
  );
});

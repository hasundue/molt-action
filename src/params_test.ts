import { assertObjectMatch, assertThrows } from "@std/assert";
import { defaults } from "./inputs.ts";
import { fromInputs, parseComitter } from "./params.ts";

Deno.test("fromInputs - default source (deno.json)", async () => {
  assertObjectMatch(
    await fromInputs({
      ...defaults,
      root: "test/fixtures",
    }),
    {
      prefix: "chore: ",
      root: "test/fixtures",
      source: ["deno.json"],
    },
  );
});

Deno.test("fromInputs - default source (modules)", async () => {
  assertObjectMatch(
    await fromInputs({
      ...defaults,
      root: "src",
    }),
    {
      prefix: "chore: ",
      root: "src",
      source: ["./**/*.ts"],
    },
  );
});

Deno.test("fromInputs - explicit sources", async () => {
  assertObjectMatch(
    await fromInputs({
      ...defaults,
      root: "test/fixtures",
      source: ["mod.ts", "deps.ts"],
    }),
    {
      prefix: "chore: ",
      root: "test/fixtures",
      source: ["mod.ts", "deps.ts"],
    },
  );
});

Deno.test("fromInputs - default inputs", async () => {
  assertObjectMatch(
    await fromInputs(defaults),
    {
      prefix: "chore: ",
      resolve: false,
      root: ".",
      source: ["deno.json"],
    },
  );
});

Deno.test("parseComitter - valid committer", () => {
  assertObjectMatch(
    parseComitter(
      "github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>",
    ),
    {
      name: "github-actions[bot]",
      email: "41898282+github-actions[bot]@users.noreply.github.com",
    },
  );
});

Deno.test("parseComitter - invalid committers", () => {
  [
    "invalid",
    "invalid <>",
    "<invalid>",
  ].forEach((committer) => assertThrows(() => parseComitter(committer)));
});

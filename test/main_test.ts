import actions from "@actions/core";
import { assertSpyCalls, stub } from "@std/testing/mock";
import { assertEquals, assertObjectMatch } from "@std/assert";
import main, { getInputs } from "../main.ts";

const context = {
  repo: {
    owner: "hasundue",
    repo: "molt-action",
  },
};

Deno.test("getInputs", () => {
  const getInputStub = stub(
    actions,
    "getInput",
    (name) =>
      ({
        root: "test/fixtures",
        config: "deno.json",
      })[name] ?? "",
  );
  const getMultiLineInputStub = stub(
    actions,
    "getMultilineInput",
    (name) =>
      ({
        source: ["mod.ts", "deps.ts"],
      })[name] ?? [],
  );
  const actual = getInputs();
  assertObjectMatch(
    actual,
    {
      root: "test/fixtures",
      config: "deno.json",
    },
  );
  assertEquals(
    actual.source,
    ["mod.ts", "deps.ts"],
  );
  assertSpyCalls(getInputStub, 2);
  assertSpyCalls(getMultiLineInputStub, 1);
});

Deno.test("main", async () => {
  const inputs = {
    root: "test/fixtures",
    config: "deno.json",
    source: ["deno.json"],
  };
  await main(context, inputs);
});

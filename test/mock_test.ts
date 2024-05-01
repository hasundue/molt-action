import { assertObjectMatch } from "@std/assert";
import { ActionInputsMock } from "./mock.ts";
import { getInputs } from "../src/inputs.ts";

Deno.test("ActionInputsMock", () => {
  const expected = {
    root: "test/fixtures",
    config: "deno.json",
    source: ["mod.ts", "deps.ts"],
  };
  using _mock = new ActionInputsMock(expected);
  assertObjectMatch(getInputs(), expected);
});

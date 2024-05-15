import actions from "@actions/core";
import { assertObjectMatch } from "@std/assert";
import { stub } from "@std/testing/mock";
import { getInputs } from "./inputs.ts";

Deno.test("getInputs - default values", () => {
  const stubs = [
    stub(actions, "getInput", () => ""),
    stub(actions, "getBooleanInput", () => false),
    stub(actions, "getMultilineInput", () => []),
  ];

  assertObjectMatch(getInputs(), {
    resolve: false,
    root: undefined,
    source: undefined,
  });

  stubs.forEach((stub) => stub.restore());
});

Deno.test("getInputs - custom values", () => {
  const stubs = [
    stub(
      actions,
      "getInput",
      (name) =>
        ({
          root: "src",
        })[name] ?? "",
    ),
    stub(
      actions,
      "getBooleanInput",
      (name) =>
        ({
          "resolve-imports": true,
        })[name] ?? false,
    ),
    stub(
      actions,
      "getMultilineInput",
      (name) => ({ source: ["mod.ts", "deps.ts"] })[name] ?? [],
    ),
  ];

  assertObjectMatch(getInputs(), {
    resolve: true,
    root: "src",
    source: ["mod.ts", "deps.ts"],
  });

  stubs.forEach((stub) => stub.restore());
});

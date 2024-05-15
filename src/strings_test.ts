import { assertObjectMatch, assertThrows } from "@std/assert";
import { parseGitUser } from "./strings.ts";

Deno.test("parseGitUser - valid committer", () => {
  assertObjectMatch(
    parseGitUser(
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
  ].forEach((committer) => assertThrows(() => parseGitUser(committer)));
});

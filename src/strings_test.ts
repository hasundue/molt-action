import { assertObjectMatch, assertThrows } from "@std/assert";
import { parseGitUser } from "./strings.ts";

Deno.test("parseGitUser - valid format", () => {
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

Deno.test("parseGitUser - invalid formats", () => {
  [
    "invalid",
    "invalid <>",
    "<invalid>",
  ].forEach((committer) => assertThrows(() => parseGitUser(committer)));
});

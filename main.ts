import actions from "@actions/core";
import * as github from "@actions/github";
import { collect, createCommitSequence, execute } from "@molt/core";
import { join } from "@std/path";
import { ActionInputs, getInputs } from "./src/inputs.ts";
import { fromInputs } from "./src/params.ts";
import * as summary from "./src/summary.ts";
import { parseGitUser } from "./src/strings.ts";

export default async function main(
  inputs: ActionInputs,
) {
  console.log(github.context);

  const params = await fromInputs(inputs);
  console.log(params);

  const result = await collect(
    params.source.map((source) => join(params.root, source)),
    { resolveLocal: params.resolve },
  );

  const commits = createCommitSequence(result, {
    composeCommitMessage: ({ version, group }) =>
      params.prefix + `update ${group} to ${version!.to}`,
    groupBy: (update) => update.to.name,
  });

  actions.setOutput("dependencies", commits.commits.map((it) => it.group));
  actions.setOutput("summary", summary.fromCommitSequence(commits, params));

  if (!params.commit) return;

  const { name, email } = parseGitUser(params.committer);
  await new Deno.Command("git", {
    args: ["config", "--global", "user.name", name],
  }).output();
  await new Deno.Command("git", {
    args: ["config", "--global", "user.email", email],
  }).output();

  await execute(commits);
}

if (import.meta.main) {
  try {
    await main(getInputs());
  } catch (error) {
    actions.setFailed(error.message);
  }
}

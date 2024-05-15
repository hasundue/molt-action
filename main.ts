import actions from "@actions/core";
import * as github from "@actions/github";
import { collect, createCommitSequence, execute } from "@molt/core";
import { join } from "@std/path";
import { ActionInputs, getInputs } from "./src/inputs.ts";
import { fromInputs, parseComitter } from "./src/params.ts";

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
      params.prefix + `bump ${group} to ${version!.to}`,
    groupBy: (update) => update.to.name,
  });

  actions.setOutput("dependencies", commits.commits.map((it) => it.group));

  if (!params.commit) return;

  const { name, email } = parseComitter(params.committer);

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

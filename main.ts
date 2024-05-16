import actions from "@actions/core";
import * as github from "@actions/github";
import { collect, createCommitSequence, execute } from "@molt/core";
import { join } from "@std/path";
import { getInputs } from "./src/inputs.ts";
import { fromInputs } from "./src/params.ts";
import { parseGitUser } from "./src/strings.ts";
import { createSummary } from "./src/summary.ts";
import { createReport } from "./src/report.ts";

export default async function main() {
  actions.debug(JSON.stringify(github.context));

  const inputs = getInputs();
  actions.debug(JSON.stringify(inputs));

  const params = await fromInputs(inputs);
  actions.debug(JSON.stringify(params));

  const result = await collect(
    params.source.map((source) => join(params.root, source)),
    { resolveLocal: params.resolve },
  );

  if (result.updates.length === 0) {
    actions.info("All dependencies are up-to-date.");
    actions.setOutput("updated", "");
    return;
  }

  const commits = createCommitSequence(result, {
    composeCommitMessage: ({ version, group }) =>
      params.prefix + `bump ${group} to ${version!.to}`,
    groupBy: (update) => update.to.name,
  });

  actions.setOutput("updated", commits.commits.map((it) => it.group));
  actions.setOutput("summary", createSummary(commits, params));
  actions.setOutput("report", await createReport(result));

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
    await main();
  } catch (error) {
    actions.setFailed(error.message);
  }
}

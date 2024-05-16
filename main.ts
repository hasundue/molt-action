import actions from "@actions/core";
import * as github from "@actions/github";
import { collect, createCommitSequence, execute } from "@molt/core";
import { expandGlob } from "@std/fs";
import { getInputs } from "./src/inputs.ts";
import { fromInputs } from "./src/params.ts";
import { parseGitUser } from "./src/strings.ts";
import { createSummary } from "./src/summary.ts";
import { createReport } from "./src/report.ts";

export default async function main() {
  actions.debug(JSON.stringify(github.context));

  const inputs = getInputs();
  actions.debug("inputs: " + JSON.stringify(inputs));

  const params = await fromInputs(inputs);
  actions.debug("params: " + JSON.stringify(params));

  const paths: string[] = [];
  for (const source of params.source) {
    for await (const entry of expandGlob(source, { root: params.root })) {
      if (entry.isFile) paths.push(entry.path);
    }
  }
  actions.debug("paths: " + JSON.stringify(paths));

  const result = await collect(paths, { resolveLocal: params.resolve });

  if (result.updates.length === 0) {
    for (const output of ["updated", "summary", "report"]) {
      actions.setOutput(output, "");
    }
    actions.info("All dependencies are up-to-date.");
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

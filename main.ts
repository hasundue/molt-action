import actions from "@actions/core";
import * as github from "@actions/github";
import {
  associateByFile,
  collect,
  createCommitSequence,
  execute,
  write,
} from "@molt/core";
import { expandGlob } from "@std/fs";
import { join, relative } from "@std/path";
import { getInputs } from "./src/inputs.ts";
import { fromInputs } from "./src/params.ts";
import { createReport } from "./src/report.ts";
import { parseGitUser } from "./src/strings.ts";
import { createSummary } from "./src/summary.ts";

async function run(
  command: string,
  options: Deno.CommandOptions = {},
) {
  actions.info(`$ ${command} ${options.args?.join(" ")}`);
  await new Deno.Command(command, {
    stderr: "inherit",
    stdout: "inherit",
    ...options,
  }).output();
}

async function main() {
  actions.debug(JSON.stringify(github.context));

  const inputs = getInputs();
  actions.debug("inputs: " + JSON.stringify(inputs));

  const params = await fromInputs(inputs);
  actions.debug("params: " + JSON.stringify(params));

  const config = params.config ? join(params.root, params.config) : undefined;

  const paths: string[] = [];
  for (const source of params.source) {
    for await (const entry of expandGlob(source, { root: params.root })) {
      if (entry.isFile) paths.push(entry.path);
    }
  }
  actions.debug("paths: " + JSON.stringify(paths));

  const result = await collect(config ?? paths, {
    resolveLocal: params.resolve,
    lock: params.lock ? true : false,
    lockFile: params.lock ? join(params.root, params.lock) : undefined,
  });

  if (result.updates.length === 0) {
    for (const output of ["dependencies", "file", "summary", "report"]) {
      actions.setOutput(output, "");
    }
    actions.info("All dependencies are up-to-date.");
    return;
  }

  actions.setOutput(
    "files",
    associateByFile(result).map((it) => relative(params.root, it.path)),
  );

  if (params.commit) {
    const { name, email } = parseGitUser(params.committer);
    await run("git", {
      args: ["config", "--global", "user.name", name],
    });
    await run("git", {
      args: ["config", "--global", "user.email", email],
    });
  }

  const commits = createCommitSequence(result, {
    composeCommitMessage: ({ version, group }) =>
      params.prefix + `bump ${group} to ${version!.to}`,
    groupBy: (update) => update.to.name,
  });

  actions.setOutput("dependencies", commits.commits.map((it) => it.group));
  actions.setOutput("summary", createSummary(commits, params));
  actions.setOutput("report", await createReport(result));

  if (params.commit) {
    const { name, email } = parseGitUser(params.committer);
    await run("git", {
      args: ["config", "--global", "user.name", name],
    });
    await run("git", {
      args: ["config", "--global", "user.email", email],
    });
    return execute(commits);
  }

  if (params.write) {
    return write(result);
  }
}

if (import.meta.main) {
  try {
    await main();
  } catch (error) {
    actions.setFailed(error.message);
  }
}

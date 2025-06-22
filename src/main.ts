import actions from "@actions/core";
import * as github from "@actions/github";
import { collect } from "@molt/core";
import { distinct } from "@std/collections";
import { join, relative } from "@std/path";
import { getInputs } from "./inputs.ts";
import { fromInputs } from "./params.ts";
import { collectFromParams } from "./paths.ts";
import { createReport } from "./report.ts";
import { parseGitUser } from "./strings.ts";
import { createSummary } from "./summary.ts";

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

  const paths = await collectFromParams(params);
  actions.debug("paths: " + JSON.stringify(paths));

  const all = await collect({
    config,
    lock: params.lock ? join(params.root, params.lock) : undefined,
    source: paths,
  });

  // TODO: Implement filter
  const deps = all;

  const updates = (await Promise.all(deps.map((dep) => dep.check())))
    .filter((it) => it !== undefined)
    .sort((a, b) => a.dep.name.localeCompare(b.dep.name));

  if (updates.length === 0) {
    for (const output of ["dependencies", "file", "summary", "report"]) {
      actions.setOutput(output, "");
    }
    actions.info("All dependencies are up-to-date.");
    return;
  }

  const files = distinct(
    updates.flatMap((it) => it.dep.refs.map((it) => relative(params.root, it))),
  );
  if (params.lock) files.push(params.lock);

  actions.setOutput("dependencies", deps.map((it) => it.name).sort());
  actions.setOutput("files", files.sort());
  actions.setOutput("report", await createReport(updates));
  actions.setOutput("summary", createSummary(updates, params));

  if (params.commit) {
    const { name, email } = parseGitUser(params.committer);
    await run("git", {
      args: ["config", "--global", "user.name", name],
    });
    await run("git", {
      args: ["config", "--global", "user.email", email],
    });
  }

  for (const update of updates) {
    if (params.write) {
      await update.write();
    }
    if (params.commit) {
      const message = update.summary(params.prefix);
      await update.commit(message);
    }
  }
}

if (import.meta.main) {
  try {
    await main();
  } catch (error) {
    actions.setFailed(error.message);
  }
}

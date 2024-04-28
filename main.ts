import actions from "@actions/core";
import * as github from "@actions/github";
import { collect } from "@molt/core";
import { join } from "@std/path";

export interface ActionContext {
  repo: {
    owner: string;
    repo: string;
  };
}

export interface ActionInputs {
  /**
   * Root directory of the project to analyze.
   * @default "."
   */
  root: string;
  /**
   * Relative path to the Deno configuration file.
   * @default ""
   */
  config: string;
  /**
   * Globs to search for source files.
   * @example ["main.ts", "test.ts"]
   * @default ["deno.json{,c}"]
   */
  source: string[];
}

export function getInputs(): ActionInputs {
  return {
    root: actions.getInput("root", { required: true }),
    config: actions.getInput("config"),
    source: actions.getMultilineInput("source", { required: true }),
  };
}

export default async function main(
  context: ActionContext,
  inputs: ActionInputs,
) {
  console.log(context);
  console.log(inputs);
  const config = inputs.config.length ? inputs.config : "deno.json{,c}";
  console.log(config);
  const updates = await collect(
    join(inputs.root, "deno.json"),
  );
  console.log(updates);
}

if (import.meta.main) {
  try {
    const inputs = getInputs();
    await main(github.context, inputs);
  } catch (error) {
    actions.setFailed(error.message);
  }
}

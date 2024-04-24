import * as actions from "@actions/core";
import * as github from "@actions/github";
import { collect } from "@molt/core";
import { join } from "@std/path";

interface ActionInputs {
  /**
   * Root directory of the target project.
   * @default "."
   */
  root: string;
  /**
   * Relative path to the Deno configuration file.
   * @default "deno.json" or "deno.jsonc"
   */
  config?: string;
}

interface ActionContext {
  repo: {
    owner: string;
    repo: string;
  };
}

export default async function main(
  context: ActionContext,
  inputs: ActionInputs,
) {
  console.log(context);
  console.log(inputs);
  const config = inputs.config ?? "deno.json{,c}";
  console.log(config);
  const updates = await collect(
    join(inputs.root, "deno.json"),
  );
  console.log(updates);
}

function getInputs(): ActionInputs {
  const root = actions.getInput("root", { required: true });
  const config = actions.getInput("config");
  return {
    root,
    config: config.length ? config : undefined,
  };
}

if (import.meta.main) {
  try {
    const inputs = getInputs();
    await main(github.context, inputs);
  } catch (error) {
    actions.setFailed(error.message);
  }
}

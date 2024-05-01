import actions from "@actions/core";
import * as github from "@actions/github";
import { collect } from "@molt/core";
import { join } from "@std/path";
import { getInputs } from "./src/inputs.ts";

export interface ActionContext {
  repo: {
    owner: string;
    repo: string;
  };
}

export default async function main(
  context: ActionContext,
) {
  console.log(context);
  const inputs = getInputs();
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
    await main(github.context);
  } catch (error) {
    actions.setFailed(error.message);
  }
}

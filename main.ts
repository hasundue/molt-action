import actions from "@actions/core";
import * as github from "@actions/github";
import { collect } from "@molt/core";
import { join } from "@std/path";
import { ActionInputs, getInputs } from "./src/inputs.ts";
import { fromInputs } from "./src/params.ts";

export interface ActionContext {
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

  const params = await fromInputs(inputs);
  console.log(params);

  const updates = await collect(
    params.source.map((source) => join(params.root, source)),
  );
  console.log(updates);
}

if (import.meta.main) {
  try {
    await main(github.context, getInputs());
  } catch (error) {
    actions.setFailed(error.message);
  }
}

import actions from "@actions/core";

export interface ActionInputs {
  /** @default true */
  commit: boolean;

  /** @default "github-actions[bot]" <41898282+github-actions[bot]@users.noreply.github.com> */
  committer: string;

  /** @default "" */
  config: boolean | string;

  /** @default "" */
  lock: boolean | string;

  /** @default "chore:" */
  prefix: string;

  /** @default false */
  resolve: boolean;

  /** @default "" */
  root: string;

  /** @default [`./**\/*.ts`] */
  source: string[];

  /** @default false */
  write: boolean;
}

export const defaults: ActionInputs = {
  commit: true,
  committer:
    "github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>",
  config: "",
  lock: "",
  prefix: "chore:",
  resolve: false,
  root: "",
  source: ["./**/*.ts"],
  write: false,
};

function getMaybeBooleanInput(name: string): boolean | string {
  try {
    return actions.getBooleanInput(name);
  } catch {
    return actions.getInput(name);
  }
}

export function getInputs(): ActionInputs {
  return {
    commit: actions.getBooleanInput("commit"),
    committer: actions.getInput("committer"),
    config: getMaybeBooleanInput("config"),
    lock: getMaybeBooleanInput("lock"),
    prefix: actions.getInput("commit-prefix"),
    resolve: actions.getBooleanInput("resolve-imports"),
    root: actions.getInput("root"),
    source: actions.getMultilineInput("source"),
    write: actions.getBooleanInput("write"),
  };
}

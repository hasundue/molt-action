import actions from "@actions/core";

export interface ActionInputs {
  /** @default true */
  commit: boolean;

  /** @default "github-actions[bot]" <41898282+github-actions[bot]@users.noreply.github.com> */
  committer: string;

  /** @default "chore: " */
  prefix: string;

  /** @default false */
  resolve: boolean;

  root?: string;
  source?: string[];
}

export const defaults: ActionInputs = {
  commit: true,
  committer: "github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>",
  prefix: "chore: ",
  resolve: false,
  root: undefined,
  source: undefined,
};

export function getInputs(): ActionInputs {
  const source = actions.getMultilineInput("source");
  return {
    commit: actions.getBooleanInput("commit"),
    committer: actions.getInput("committer"),
    prefix: actions.getInput("commit-prefix"),
    resolve: actions.getBooleanInput("resolve-imports"),
    root: actions.getInput("root") || undefined,
    source: source.length ? source : undefined,
  };
}

import actions from "@actions/core";

export interface ActionInputs {
  /**
   * Whether to commit changes to the repository.
   * @default false
   */
  commit: boolean;
  /**
   * Relative path to the Deno configuration file.
   * @example "deno.json", "deno.jsonc"
   */
  config?: string;
  /**
   * Whether to create a pull request with the changes.
   * @default false
   */
  pr: boolean;
  /**
   * Prefix for commit messages.
   * @example "chore", "fix"
   */
  prefix?: string;
  /**
   * Whether to resolve local imports to find dependencies recursively.
   * @default false
   */
  resolve: boolean;
  /**
   * Root directory of the project to analyze.
   * @example "src", "."
   */
  root?: string;
  /**
   * Globs to search for source files.
   * @example ["main.ts", "test.ts"]
   */
  source?: string[];
}

export function getInputs(): ActionInputs {
  const source = actions.getMultilineInput("source");
  return {
    commit: actions.getBooleanInput("commit"),
    config: actions.getInput("config") || undefined,
    pr: actions.getBooleanInput("pr"),
    prefix: actions.getInput("commit-prefix") || undefined,
    resolve: actions.getBooleanInput("resolve-imports"),
    root: actions.getInput("root") || undefined,
    source: source.length ? source : undefined,
  };
}

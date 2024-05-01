import actions from "@actions/core";

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

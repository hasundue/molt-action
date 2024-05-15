import { match, placeholder as _ } from "@core/match";
import { walk } from "@std/fs";
import { parse } from "@std/jsonc";
import { dirname } from "@std/path";

import { ActionInputs } from "./inputs.ts";

export type ActionParams = Required<ActionInputs>;

export async function fromInputs(inputs: ActionInputs): Promise<ActionParams> {
  const { config, root } = inputs.root
    ? {
      config: await findConfig(inputs.root),
      root: inputs.root,
    }
    : await findRootAndConfig();

  const source = inputs.source?.length ? inputs.source : [
    config && await hasImports(config) ? config : "./**/*.ts",
  ];
  const prefix = inputs.prefix ?? "chore: ";
  return { ...inputs, root, source, prefix };
}

async function findConfig(root: string): Promise<string | undefined> {
  for await (const entry of walk(root, { maxDepth: 1 })) {
    if (entry.name === "deno.json" || entry.name === "deno.jsonc") {
      return entry.name;
    }
  }
  return undefined;
}

async function findRootAndConfig(): Promise<
  { config: string | undefined; root: string }
> {
  let root = ".";
  let config = undefined;
  for await (const entry of walk(".")) {
    if (entry.name === "deno.json" || entry.name === "deno.jsonc") {
      root = dirname(entry.path);
      config = entry.name;
    }
  }
  return { config, root };
}

async function hasImports(config?: string): Promise<boolean> {
  if (!config) return false;
  const jsonc = parse(await Deno.readTextFile(config));
  return jsonc !== null && typeof jsonc === "object" && "imports" in jsonc;
}

export function parseComitter(committer: string) {
  const pattern = _`${_("name")} <${_("email")}>`;
  const matched = match(pattern, committer);

  const name = matched?.name.trim();
  const email = matched?.email.trim();

  if (!matched || !name || !email) {
    throw new Error(
      `${committer} is not a valid format for a committer. Expected "Display Name <email@address.com>".`,
    );
  }
  return {
    name: matched.name.trim(),
    email: matched.email.trim(),
  };
}

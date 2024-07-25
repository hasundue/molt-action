import { exists, walk } from "@std/fs";
import { parse } from "@std/jsonc";
import { dirname, join } from "@std/path";
import type { ActionInputs } from "./inputs.ts";

export type ActionParams = Omit<ActionInputs, "config" | "lock"> & {
  config?: string;
  lock?: string;
};

export async function fromInputs(inputs: ActionInputs): Promise<ActionParams> {
  const { config, lock, root } = inputs.root.length
    ? {
      config: inputs.config === false
        ? undefined
        : inputs.config === true || inputs.config === ""
        ? await findConfig(inputs.root)
        : inputs.config,
      lock: inputs.lock === false
        ? undefined
        : inputs.lock === true || inputs.lock === ""
        ? await findLock(inputs.root)
        : inputs.lock,
      root: inputs.root,
    }
    : await findRootConfigLock();
  const source = inputs.source.length
    ? inputs.source
    : (config ? [] : ["./**/*.ts"]);
  const prefix = inputs.prefix.length ? `${inputs.prefix} ` : "";
  return { ...inputs, config, lock, root, source, prefix };
}

async function findConfig(root: string): Promise<string | undefined> {
  const json = join(root, "deno.json");
  if (await exists(json) && await hasImports(json)) {
    return "deno.json";
  }
  const jsonc = join(root, "deno.jsonc");
  if (await exists(jsonc) && await hasImports(jsonc)) {
    return "deno.jsonc";
  }
}

async function findLock(root: string): Promise<string | undefined> {
  return await exists(join(root, "deno.lock")) ? "deno.lock" : undefined;
}

async function findRootConfigLock(): Promise<
  { config?: string; lock?: string; root: string }
> {
  let root = ".";
  let config, lock;
  for await (const entry of walk(".")) {
    if (entry.name === "deno.json" || entry.name === "deno.jsonc") {
      root = dirname(entry.path);
      if (await hasImports(entry.path)) {
        config = entry.name;
      }
      if (await exists(entry.path.replace(/\.jsonc?$/, ".lock"))) {
        lock = "deno.lock";
      }
    }
  }
  return { config, lock, root };
}

async function hasImports(config: string): Promise<boolean> {
  if (!config) return false;
  const jsonc = parse(await Deno.readTextFile(config));
  return jsonc !== null && typeof jsonc === "object" && "imports" in jsonc;
}

import { exists, walk } from "@std/fs";
import { parse } from "@std/jsonc";
import { dirname } from "@std/path";
import type { ActionInputs } from "./inputs.ts";

export type ActionParams = Omit<ActionInputs, "lock"> & {
  lock?: string;
};

export async function fromInputs(inputs: ActionInputs): Promise<ActionParams> {
  const { config, lock, root } = inputs.root.length
    ? {
      lock: inputs.lock || undefined,
      ...await findConfigLock(inputs.root),
      root: inputs.root,
    }
    : await findRootConfigLock();

  const source = inputs.source.length ? inputs.source : [
    config && await hasImports(config) ? config : "./**/*.ts",
  ];
  const prefix = inputs.prefix.length ? `${inputs.prefix} ` : "";
  return { ...inputs, lock, root, source, prefix };
}

async function findConfigLock(root: string): Promise<
  { config?: string; lock?: string }
> {
  for await (const entry of walk(root, { maxDepth: 1 })) {
    if (entry.name === "deno.json" || entry.name === "deno.jsonc") {
      return await exists(entry.path.replace(/\.jsonc?$/, ".lock"))
        ? { config: entry.name, lock: "deno.lock" }
        : { config: entry.name };
    }
  }
  return {};
}

async function findRootConfigLock(): Promise<
  { config?: string; lock?: string; root: string }
> {
  let root = ".";
  let config = undefined;
  let lock = undefined;
  for await (const entry of walk(".")) {
    if (entry.name === "deno.json" || entry.name === "deno.jsonc") {
      root = dirname(entry.path);
      config = entry.name;
      if (await exists(entry.path.replace(/\.jsonc?$/, ".lock"))) {
        lock = "deno.lock";
      }
    }
  }
  return { config, lock, root };
}

async function hasImports(config?: string): Promise<boolean> {
  if (!config) return false;
  const jsonc = parse(await Deno.readTextFile(config));
  return jsonc !== null && typeof jsonc === "object" && "imports" in jsonc;
}

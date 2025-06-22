import { expandGlob } from "@std/fs";
import { SEPARATOR } from "@std/path";

import type { ActionParams } from "./params.ts";

export async function collectFromParams(
  params: ActionParams,
): Promise<string[]> {
  const files = new Set<string>();
  const excludeFiles = new Set<string>();
  const excludeDirs = new Set<string>();

  for (const excludePattern of params.exclude) {
    for await (
      const entry of expandGlob(excludePattern, { root: params.root })
    ) {
      if (entry.isFile) {
        excludeFiles.add(entry.path);
      } else if (entry.isDirectory) {
        excludeDirs.add(entry.path + SEPARATOR);
      }
    }
  }

  for (const source of params.source) {
    for await (const entry of expandGlob(source, { root: params.root })) {
      if (entry.isFile) files.add(entry.path);
    }
  }

  const excludeDirsArray = [...excludeDirs];
  const filtered = [...files.difference(excludeFiles)]
    .filter((path) => !excludeDirsArray.some((dir) => path.startsWith(dir)));

  return filtered;
}

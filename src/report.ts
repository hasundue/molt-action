import actions from "@actions/core";
import type * as Molt from "@molt/core/types";
import {
  compareCommits,
  resolveCreatedDate,
  resolvePackageRoot,
  resolveRepository,
  tryParse,
} from "@molt/integration";
import { curateChangeLog } from "@molt/lib/changelog";
import { distinct, mapNotNullish, minWith } from "@std/collections";
import * as SemVer from "@std/semver";

type Dependency = Pick<Molt.Dependency, "kind" | "name" | "specifier">;

type Update = {
  dep: Dependency;
} & Pick<Molt.Update, "lock" | "constraint">;

/**
 * Generate a detailed report of changes in Markdown format.
 */
export async function createReport(updates: Update[]): Promise<string> {
  return (await Promise.all(
    updates.map(async (update) => {
      let content = "";
      content += _header(update);
      const changelog = await _changelog(update);
      if (changelog) {
        content += "\n\n" + changelog;
      }
      return content;
    }),
  )).join("\n\n");
}

export function _header(update: Update): string {
  let header = `#### :package: ${update.dep.name} `;
  const bump = update.lock ?? update.constraint!;
  const froms = distinct(bump.from.split(", "));
  header += froms.map((it) => _version(update.dep, it)).join(", ") + " → ";
  return header += _version(update.dep, bump.to);
}

export function _version(
  dep: Dependency,
  version: string,
): string {
  const { kind, name } = dep;
  if (!version) {
    return "";
  }
  switch (kind) {
    case "jsr":
      return `[${version}](https://jsr.io/${name}/${version})`;
    case "npm":
      return `[${version}](https://www.npmjs.com/package/${name}/v/${version})`;
    case "https":
      return `[${version}](${dep.specifier}@${version})`;
    default:
      return version;
  }
}

export async function _changelog(update: Update): Promise<string> {
  const bump = update.lock ?? update.constraint!;
  // Can't provide a changelog for a non-semver update
  if (!SemVer.tryParse(bump.to)) {
    return "";
  }
  const froms = bump.from.split(", ");
  const to = bump.to;

  const pkg = tryParse(update.dep.specifier);

  // Can't provide a changelog for a non-package dependency
  if (!pkg) return "";

  const repo = await resolveRepository(pkg);
  if (!repo) return "";

  /** A map of dependency names to the created date of the oldest update */
  const dates = new Map<string, number>();
  await Promise.all(froms.map(async (it) => {
    dates.set(it, await resolveCreatedDate(pkg, it));
  }));
  /** The oldest update from which to fetch commit logs */
  const oldest = minWith(
    froms,
    (a, b) => Math.sign(dates.get(a)! - dates.get(b)!),
  );
  if (!oldest) {
    // The dependency was newly added in this update
    return "";
  }
  const messages: string[] = [];
  try {
    // The refs might not exist
    messages.push(...await compareCommits(repo, oldest, to));
  } catch {
    actions.info(`Failed to fetch commits for ${pkg.name}`);
    return "";
  }
  const root = await resolvePackageRoot(repo, pkg, to);
  if (!root) {
    // The package seems to be generated dynamically on publish
    return "";
  }
  const changelog = curateChangeLog(messages, {
    types: ["feat", "fix", "deprecation"],
    scope: root !== "." ? root : undefined,
  });

  return mapNotNullish(
    Object.entries(changelog),
    ([kind, records]) =>
      records.length
        ? `${records.map((it) => `- ${kind}: ${it.text}`).join("\n")}`
        : null,
  ).join("\n");
}

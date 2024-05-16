import actions from "@actions/core";
import type {
  CollectResult,
  Dependency,
  DependencyUpdate,
  UpdatedDependency,
} from "@molt/core";
import { stringify } from "@molt/core";
import {
  compareCommits,
  fromDependency,
  resolveCreatedDate,
  resolvePackageRoot,
  resolveRepository,
} from "@molt/integration";
import { curateChangeLog } from "@molt/lib/changelog";
import { mapNotNullish, minWith } from "@std/collections";

/**
 * Generate a detailed report of changes in Markdown format.
 */
export async function createReport(
  result: CollectResult,
): Promise<string> {
  /** A map of names of dependencies to a list of updates */
  const dependencies = new Map<string, DependencyUpdate[]>();
  for (const u of result.updates) {
    const list = dependencies.get(u.to.name) ?? [];
    list.push(u);
    dependencies.set(u.to.name, list);
  }
  /** The report to be generated */
  return (await Promise.all(
    Array.from(dependencies.values()).map(async (updates) => {
      let content = "";
      const from = mapNotNullish(updates, (it) => it.from);
      const to = updates[0].to;
      content += _header(from, to);
      try {
        const changelog = await _changelog(from, to);
        if (changelog) {
          content += "\n\n" + changelog;
        }
      } catch {
        actions.info(`Failed to generate changelog for ${to.name}`);
      }
      return content;
    }),
  )).join("\n\n");
}

export function _header(
  from: Dependency[],
  to: UpdatedDependency,
): string {
  let header = `#### :package: ${to.name} `;
  const froms = from.map((it) => _version(it));
  if (froms.length > 0) {
    header += froms.join(", ") + " → ";
  }
  return header += _version(to);
}

export function _version(dependency: Dependency): string {
  const { protocol, name, version } = dependency;
  if (!version) {
    return "";
  }
  switch (protocol) {
    case "jsr:":
      return `[${version}](https://jsr.io/${name}/${version})`;
    case "npm:":
      return `[${version}](https://www.npmjs.com/package/${name}/v/${version})`;
    case "https:":
      return `[${version}](${stringify(dependency, { path: false })})`;
    default:
      return version;
  }
}

export async function _changelog(
  from: Dependency[],
  to: UpdatedDependency,
) {
  const pkg = fromDependency(to);
  // Can't provide a changelog for a non-package dependency
  if (!pkg) {
    return "";
  }
  const repo = await resolveRepository(pkg);
  if (!repo) {
    return;
  }
  /** A map of dependency names to the created date of the oldest update */
  const dates = new Map<string, number>();
  await Promise.all(
    from.map(async (it) =>
      dates.set(name, await resolveCreatedDate(pkg, it.version!))
    ),
  );
  /** The oldest update from which to fetch commit logs */
  const oldest = minWith(
    from,
    (a, b) => Math.sign(dates.get(a.name)! - dates.get(b.name)!),
  ) as Required<Dependency> | undefined;
  if (!oldest) {
    // The dependency was newly added in this update
    return;
  }
  const messages = await compareCommits(
    repo,
    oldest.version,
    to.version,
  );
  const root = await resolvePackageRoot(repo, pkg, to.version);
  if (!root) {
    // The package seems to be generated dynamically on publish
    return;
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

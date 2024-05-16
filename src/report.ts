import actions from "@actions/core";
import {
  CollectResult,
  Dependency,
  DependencyUpdate,
  stringify,
  UpdatedDependency,
} from "@molt/core";
import {
  compareCommits,
  fromDependency,
  resolveCreatedDate,
  resolvePackageRoot,
  resolveRepository,
} from "@molt/integration";
import { ChangeLogRecord, curateChangeLog } from "@molt/lib/changelog";
import { mapKeys, mapNotNullish, minWith } from "@std/collections";
import dedent from "npm:dedent";

/**
 * Generate a detailed report of changes in Markdown format.
 */
export default async function createReport(
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
          content += changelog;
        }
      } catch (error) {
        actions.warning(`Failed to generate changelog: ` + Deno.inspect(error));
      }
      return content;
    }),
  )).join("\n\n");
}

export function _header(
  from: Dependency[],
  to: UpdatedDependency,
): string {
  let header = `### :package: ${to.name} `;
  const froms = from.map((it) => _version(it));
  if (froms.length > 0) {
    header += froms.join(", ") + " → ";
  }
  return header += _version(to) + "\n\n";
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
      return `[${version}](https://www.npm.js/package/${name}/v/${version})`;
    case "https:":
      return `[${version}](${stringify(dependency, { path: false })})`;
    default:
      return version;
  }
}

const changelogTypePropsRecord = {
  breaking: {
    emoji: ":boom:",
    title: {
      singular: "Breaking Change",
      plural: "Breaking Changes",
    },
  },
  feat: {
    emoji: ":rocket:",
    title: {
      singular: "New Feature",
      plural: "New Features",
    },
  },
  fix: {
    emoji: ":bug:",
    title: {
      singular: "Bug Fix",
      plural: "Bug Fixes",
    },
  },
  deprecation: {
    emoji: ":warning:",
    title: {
      singular: "Deprecation",
      plural: "Deprecations",
    },
  },
} as const;

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

  const changelog = mapKeys(
    curateChangeLog(messages, {
      types: ["feat", "fix", "deprecation"],
      scope: root !== "." ? root : undefined,
    }),
    (key) => key === "BREAKING CHANGE" ? "breaking" : key,
  ) as Record<keyof typeof changelogTypePropsRecord, ChangeLogRecord[]>;

  const summary = new Intl.ListFormat("en", {
    style: "long",
    type: "conjunction",
  }).format(
    mapNotNullish(
      Object.entries(changelog),
      ([kind, records]) => {
        const { title } = changelogTypePropsRecord[
          kind as keyof typeof changelogTypePropsRecord
        ];
        const len = records.length;
        if (len === 1) return `${len} ${title.singular.toLowerCase()}`;
        if (len > 1) return `${len} ${title.plural.toLowerCase()}`;
      },
    ),
  );

  const body = mapNotNullish(
    Object.entries(changelog),
    ([kind, records]) => {
      const props = changelogTypePropsRecord[
        kind as keyof typeof changelogTypePropsRecord
      ];
      if (!records.length) return;
      const title = records.length > 1
        ? props.title.plural
        : props.title.singular;
      return dedent`
        ### ${props.emoji} ${title}:

        ${records.map((record) => `- ${record.text}`).join("\n")}
      `;
    },
  ).join("\n");

  return dedent`
    <details>

    <summary>${summary}</summary>

    ${body}

    </details>
  `;
}

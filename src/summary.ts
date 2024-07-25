import type * as Molt from "@molt/core/types";

interface Update {
  dep: Pick<Molt.Dependency, "name">;
  message: Molt.Update["message"];
}

export function createSummary(
  updates: Update[],
  options: { prefix: string },
): string {
  if (updates.length === 0) {
    return "All dependencies are up-to-date";
  }
  if (updates.length === 1) {
    return updates[0].message(options.prefix);
  }
  const deps = new Intl.ListFormat("en", {
    style: "long",
    type: "conjunction",
  }).format(updates.map((it) => it.dep.name));
  const full = options.prefix + `update ${deps}`;
  return (full.length <= 50) ? full : options.prefix + "update dependencies";
}

import { CommitSequence } from "@molt/core";

export function fromCommitSequence(
  sequence: CommitSequence,
  options: { prefix: string },
): string {
  if (sequence.commits.length === 0) {
    return "All dependencies are up-to-date";
  }
  if (sequence.commits.length === 1) {
    return sequence.commits[0].message;
  }
  const groups = new Intl.ListFormat("en", {
    style: "long",
    type: "conjunction",
  }).format(sequence.commits.map((commit) => commit.group));
  const full = options.prefix + `update ${groups}`;
  return (full.length <= 50) ? full : options.prefix + "update dependencies";
}

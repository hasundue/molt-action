import { collect } from "@molt/core";
import { assertEquals } from "@std/assert";
import dedent from "dedent";
import { _changelog, _header, _version } from "./report.ts";
import { createReport } from "./report.ts";

Deno.test("_version - jsr", () => {
  assertEquals(
    _version(
      {
        specifier: "jsr:@molt/core",
        kind: "jsr",
        name: "@molt/core",
      },
      "1.0.0",
    ),
    "[1.0.0](https://jsr.io/@molt/core/1.0.0)",
  );
});

Deno.test("_version - npm", () => {
  assertEquals(
    _version(
      {
        specifier: "npm:@actions/core",
        kind: "npm",
        name: "@actions/core",
      },
      "1.0.0",
    ),
    "[1.0.0](https://www.npmjs.com/package/@actions/core/v/1.0.0)",
  );
});

Deno.test("_version - https", () => {
  assertEquals(
    _version(
      {
        specifier: "https://deno.land/std",
        kind: "https",
        name: "deno.land/std",
      },
      "1.0.0",
    ),
    "[1.0.0](https://deno.land/std@1.0.0)",
  );
});

Deno.test("_version - constraint", () => {
  assertEquals(
    _version(
      {
        specifier: "jsr:@molt/core",
        kind: "jsr",
        name: "@molt/core",
      },
      "^1.0.0",
    ),
    "^1.0.0",
  );
});

Deno.test("_header - with a single from", () => {
  assertEquals(
    _header(
      {
        dep: {
          specifier: "jsr:@molt/core",
          kind: "jsr",
          name: "@molt/core",
        },
        lock: {
          from: "0.18.0",
          to: "1.0.0",
        },
      },
    ),
    "#### :package: @molt/core [0.18.0](https://jsr.io/@molt/core/0.18.0) → [1.0.0](https://jsr.io/@molt/core/1.0.0)",
  );
});

Deno.test("_header - with multiple froms", () => {
  assertEquals(
    _header(
      {
        dep: {
          specifier: "jsr:@molt/core",
          kind: "jsr",
          name: "@molt/core",
        },
        lock: {
          from: "0.18.0, 0.19.0",
          to: "1.0.0",
        },
      },
    ),
    "#### :package: @molt/core [0.18.0](https://jsr.io/@molt/core/0.18.0), [0.19.0](https://jsr.io/@molt/core/0.19.0) → [1.0.0](https://jsr.io/@molt/core/1.0.0)",
  );
});

Deno.test("_header - constraints", () => {
  assertEquals(
    _header(
      {
        dep: {
          specifier: "jsr:@molt/core",
          kind: "jsr",
          name: "@molt/core",
        },
        constraint: {
          from: "^0.18.0",
          to: "^1.0.0",
        },
      },
    ),
    "#### :package: @molt/core ^0.18.0 → ^1.0.0",
  );
});

Deno.test("_changelog - non-package", async () => {
  assertEquals(
    await _changelog(
      {
        dep: {
          specifier: "https://deno.land/std",
          kind: "https",
          name: "deno.land/std",
        },
        constraint: {
          from: "0.222.0",
          to: "0.224.0",
        },
      },
    ),
    "",
  );
});

Deno.test("_changelog - jsr:@molt/core", async () => {
  assertEquals(
    await _changelog(
      {
        dep: {
          specifier: "jsr:@molt/core",
          kind: "jsr",
          name: "@molt/core",
        },
        lock: {
          from: "0.18.0",
          to: "0.18.4",
        },
      },
    ),
    dedent`
      - fix: use \`jsr:@deno/graph\` for \`x/deno_graph\`
      - fix: do not throw on unresolved deps (#166)
      - fix: resolve mapped jsr imports with subpath
      - fix: handle identical dependencies correctly
    `,
  );
});

Deno.test("_changelog - jsr:@core/unknownutil", async () => {
  assertEquals(
    await _changelog(
      {
        dep: {
          specifier: "jsr:@core/unknownutil",
          kind: "jsr",
          name: "@core/unknownutil",
        },
        lock: {
          from: "3.18.0",
          to: "3.18.1",
        },
      },
    ),
    "", // the repository uses gitmoji, which is not supported yet
  );
});

Deno.test("createReport - empty result", async () => {
  assertEquals(
    await createReport([]),
    "",
  );
});

Deno.test("createReport", async () => {
  const deps = await collect({
    config: new URL("../test/fixtures/deno.json", import.meta.url),
    lock: new URL("../test/fixtures/deno.lock", import.meta.url),
  });
  const updates = (await Promise.all(deps.map((dep) => dep.check())))
    .filter((it) => it !== undefined);
  const actual = await createReport(updates);
  assertEquals(
    actual,
    dedent`
      #### :package: @luca/flag [1.0.0](https://jsr.io/@luca/flag/1.0.0) → [1.0.1](https://jsr.io/@luca/flag/1.0.1)

      #### :package: deno.land/std [0.222.0](https://deno.land/std@0.222.0) → [0.224.0](https://deno.land/std@0.224.0)
    `,
  );
});

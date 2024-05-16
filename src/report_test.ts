import { collect } from "@molt/core";
import { assert, assertEquals } from "@std/assert";
import dedent from "dedent";
import { _changelog, _header, _version } from "./report.ts";
import { createReport } from "./report.ts";

Deno.test("_version - jsr", () => {
  assertEquals(
    _version({
      protocol: "jsr:",
      name: "@molt/core",
      version: "1.0.0",
      path: "/testing",
    }),
    "[1.0.0](https://jsr.io/@molt/core/1.0.0)",
  );
});

Deno.test("_version - npm", () => {
  assertEquals(
    _version({
      protocol: "npm:",
      name: "@actions/core",
      version: "1.0.0",
      path: "",
    }),
    "[1.0.0](https://www.npmjs.com/package/@actions/core/v/1.0.0)",
  );
});

Deno.test("_version - https", () => {
  assertEquals(
    _version({
      protocol: "https:",
      name: "deno.land/std",
      version: "1.0.0",
      path: "/testing",
    }),
    "[1.0.0](https://deno.land/std@1.0.0)",
  );
});

Deno.test("_header - without from", () => {
  assertEquals(
    _header(
      [],
      {
        protocol: "jsr:",
        name: "@molt/core",
        version: "1.0.0",
        path: "",
      },
    ),
    "#### :package: @molt/core [1.0.0](https://jsr.io/@molt/core/1.0.0)",
  );
});

Deno.test("_header - with a single from", () => {
  assertEquals(
    _header(
      [
        {
          protocol: "jsr:",
          name: "@molt/core",
          version: "0.18.0",
          path: "",
        },
      ],
      {
        protocol: "jsr:",
        name: "@molt/core",
        version: "1.0.0",
        path: "",
      },
    ),
    "#### :package: @molt/core [0.18.0](https://jsr.io/@molt/core/0.18.0) → [1.0.0](https://jsr.io/@molt/core/1.0.0)",
  );
});

Deno.test("_header - with multiple from", () => {
  assertEquals(
    _header(
      [
        {
          protocol: "jsr:",
          name: "@molt/core",
          version: "0.18.0",
          path: "",
        },
        {
          protocol: "jsr:",
          name: "@molt/core",
          version: "0.19.0",
          path: "",
        },
      ],
      {
        protocol: "jsr:",
        name: "@molt/core",
        version: "1.0.0",
        path: "",
      },
    ),
    "#### :package: @molt/core [0.18.0](https://jsr.io/@molt/core/0.18.0), [0.19.0](https://jsr.io/@molt/core/0.19.0) → [1.0.0](https://jsr.io/@molt/core/1.0.0)",
  );
});

Deno.test("_changelog - non-package", async () => {
  assertEquals(
    await _changelog(
      [],
      {
        protocol: "https:",
        name: "deno.land/std",
        version: "1.0.0",
        path: "/testing",
      },
    ),
    "",
  );
});

Deno.test("_changelog - jsr:@molt/core", async () => {
  assertEquals(
    await _changelog(
      [
        {
          protocol: "jsr:",
          name: "@molt/core",
          version: "0.18.0",
          path: "",
        },
      ],
      {
        protocol: "jsr:",
        name: "@molt/core",
        version: "0.18.4",
        path: "",
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

Deno.test("createReport - empty result", async () => {
  assertEquals(
    await createReport({ updates: [], locks: [] }),
    "",
  );
});

Deno.test("createReport", async () => {
  const actual = await createReport(
    await collect(
      new URL("../test/fixtures/deno.json", import.meta.url),
    ),
  );
  const lines = actual.split("\n");

  assert(lines[0].startsWith("#### :package: @actions/core"));
  assert(lines[2].startsWith("#### :package: @molt/core"));
  for (let i = 4; i < 8; i++) {
    assert(lines[i].startsWith("- fix: "));
  }
  assert(lines[9].startsWith("#### :package: deno.land/x/hono"));
});

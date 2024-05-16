import { collect } from "@molt/core";
import { assertEquals } from "@std/assert";
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
    "[1.0.0](https://www.npm.js/package/@actions/core/v/1.0.0)",
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
    "### :package: @molt/core [1.0.0](https://jsr.io/@molt/core/1.0.0)",
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
    "### :package: @molt/core [0.18.0](https://jsr.io/@molt/core/0.18.0) → [1.0.0](https://jsr.io/@molt/core/1.0.0)",
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
    "### :package: @molt/core [0.18.0](https://jsr.io/@molt/core/0.18.0), [0.19.0](https://jsr.io/@molt/core/0.19.0) → [1.0.0](https://jsr.io/@molt/core/1.0.0)",
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
    <details>

    <summary>4 bug fixes</summary>

    ### :bug: Bug Fixes:

    - use \`jsr:@deno/graph\` for \`x/deno_graph\`
    - do not throw on unresolved deps (#166)
    - resolve mapped jsr imports with subpath
    - handle identical dependencies correctly
    
    </details>
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
  assertEquals(
    actual,
    dedent`
      ### :package: @actions/core [1.10.0](https://www.npm.js/package/@actions/core/v/1.10.0) → [1.10.1](https://www.npm.js/package/@actions/core/v/1.10.1)

      ### :package: @molt/core [0.18.0](https://jsr.io/@molt/core/0.18.0) → [0.18.4](https://jsr.io/@molt/core/0.18.4)

      <details>

      <summary>4 bug fixes</summary>

      ### :bug: Bug Fixes:

      - use \`jsr:@deno/graph\` for \`x/deno_graph\`
      - do not throw on unresolved deps (#166)
      - resolve mapped jsr imports with subpath
      - handle identical dependencies correctly

      </details>

      ### :package: deno.land/x/hono [4.2.9](https://deno.land/x/hono@4.2.9) → [v4.3.7](https://deno.land/x/hono@v4.3.7)
    `,
  );
});

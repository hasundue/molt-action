import { assertEquals } from "@std/assert";
import { join } from "@std/path";
import { collectFromParams } from "./paths.ts";
import type { ActionParams } from "./params.ts";

const fixturesDir = join(Deno.cwd(), "test", "fixtures");

Deno.test("collectFromParams - source specific file", async () => {
  const params: ActionParams = {
    root: fixturesDir,
    source: ["deno.json"],
    exclude: [],
    config: undefined,
    lock: undefined,
    commit: false,
    committer: "",
    prefix: "",
    write: false,
  };

  const paths = await collectFromParams(params);
  assertEquals(paths.sort(), [
    join(fixturesDir, "deno.json"),
  ]);
});

Deno.test("collectFromParams - source with glob pattern", async () => {
  const params: ActionParams = {
    root: fixturesDir,
    source: ["**/*.ts"],
    exclude: [],
    config: undefined,
    lock: undefined,
    commit: false,
    committer: "",
    prefix: "",
    write: false,
  };

  const paths = await collectFromParams(params);
  assertEquals(paths.sort(), [
    join(fixturesDir, "mod.ts"),
    join(fixturesDir, "mod_test.ts"),
    join(fixturesDir, "subdir/mod.ts"),
  ]);
});

Deno.test("collectFromParams - multiple sources", async () => {
  const params: ActionParams = {
    root: fixturesDir,
    source: ["**/*.ts", "**/*.json"],
    exclude: [],
    config: undefined,
    lock: undefined,
    commit: false,
    committer: "",
    prefix: "",
    write: false,
  };

  const paths = await collectFromParams(params);
  assertEquals(paths.sort(), [
    join(fixturesDir, "deno.json"),
    join(fixturesDir, "mod.ts"),
    join(fixturesDir, "mod_test.ts"),
    join(fixturesDir, "subdir/mod.ts"),
  ]);
});

Deno.test("collectFromParams - source no matches", async () => {
  const params: ActionParams = {
    root: fixturesDir,
    source: ["**/*.js"], // No .js files in fixtures
    exclude: [],
    config: undefined,
    lock: undefined,
    commit: false,
    committer: "",
    prefix: "",
    write: false,
  };

  const paths = await collectFromParams(params);
  assertEquals(paths, []);
});

Deno.test("collectFromParams - exclude specific file", async () => {
  const params: ActionParams = {
    root: fixturesDir,
    source: ["**/*.ts"],
    exclude: ["mod_test.ts"],
    config: undefined,
    lock: undefined,
    commit: false,
    committer: "",
    prefix: "",
    write: false,
  };

  const paths = await collectFromParams(params);
  assertEquals(paths, [
    join(fixturesDir, "mod.ts"),
    join(fixturesDir, "subdir/mod.ts"),
  ]);
});

Deno.test("collectFromParams - exclude with glob pattern", async () => {
  const params: ActionParams = {
    root: fixturesDir,
    source: ["**/*.ts"],
    exclude: ["**/*_test.ts"],
    config: undefined,
    lock: undefined,
    commit: false,
    committer: "",
    prefix: "",
    write: false,
  };

  const paths = await collectFromParams(params);
  assertEquals(paths, [
    join(fixturesDir, "mod.ts"),
    join(fixturesDir, "subdir/mod.ts"),
  ]);
});

Deno.test("collectFromParams - exclude with directory", async () => {
  const params: ActionParams = {
    root: fixturesDir,
    source: ["**/*.ts"],
    exclude: ["subdir"],
    config: undefined,
    lock: undefined,
    commit: false,
    committer: "",
    prefix: "",
    write: false,
  };

  const paths = await collectFromParams(params);
  assertEquals(paths, [
    join(fixturesDir, "mod.ts"),
    join(fixturesDir, "mod_test.ts"),
  ]);
});

Deno.test("collectFromParams - multiple exclude patterns", async () => {
  const params: ActionParams = {
    root: fixturesDir,
    source: ["**/*.ts", "**/*.json"],
    exclude: ["*_test.ts", "deno.json"],
    config: undefined,
    lock: undefined,
    commit: false,
    committer: "",
    prefix: "",
    write: false,
  };

  const paths = await collectFromParams(params);
  assertEquals(paths, [
    join(fixturesDir, "mod.ts"),
    join(fixturesDir, "subdir/mod.ts"),
  ]);
});

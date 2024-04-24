import { deepMerge } from "@std/collections/deep-merge";

const options = { with: { type: "json" } };
const { default: base } = await import("../deno.json", options);
const { default: overlay } = await import("../fixtures/import_map.json", options);

const config = new URL("../fixtures/deno.json", import.meta.url).pathname;
await Deno.writeTextFile(
  config,
  JSON.stringify(deepMerge(base, overlay), null, 2) + "\n",
);

const lock = new URL("../deno.lock", import.meta.url).pathname;

await new Deno.Command("deno", {
  args: [
    "test",
    "--allow-net=jsr.io,registry.npmjs.org,deno.land",
    "--config",
    config,
    "--lock",
    lock,
    "test.ts",
  ],
  stderr: "inherit",
  stdout: "inherit",
}).output();

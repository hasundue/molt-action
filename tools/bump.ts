import { format, increment, parse, type ReleaseType } from "@std/semver";

const type = Deno.args.at(0) as ReleaseType;
if (!type) throw new Error("Missing release type argument");

const { default: config } = await import("../deno.json", {
  with: { type: "json" },
});

const bumped = format(increment(parse(config.version), type));

config.version = bumped;
await Deno.writeTextFile("deno.json", JSON.stringify(config, null, 2) + "\n");

const yaml = await Deno.readTextFile("./action.yml");

const updated = yaml
  .replace(/default: \d+\.\d+\.\d+/, `default: ${bumped}`)
  .replace(
    /default: jsr:@molt\/action@\d+\.\d+\.\d+/,
    `default: jsr:@molt\/action@${bumped}`,
  );

await Deno.writeTextFile("./action.yml", updated);

await new Deno.Command("git", {
  args: [
    "commit",
    "-m",
    `chore: release ${bumped}`,
    "action.yml",
    "deno.json",
  ],
  stdout: "inherit",
  stderr: "inherit",
}).output();

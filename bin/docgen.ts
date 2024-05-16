import { ensure, is } from "@core/unknownutil";
import { parse } from "@std/yaml";
import dedent from "dedent";

const action = ensure(
  parse(
    await Deno.readTextFile(
      new URL("../action.yml", import.meta.url),
    ),
  ),
  is.ObjectOf({
    inputs: is.RecordOf(
      is.ObjectOf({
        description: is.String,
        default: is.OptionalOf(is.UnionOf([is.String, is.Boolean])),
      }),
      is.String,
    ),
  }),
);

// FIXME: Avoid adding extra newlines
function toMarkdown(
  { inputs }: typeof action,
): string {
  let content = dedent`
    ## Inputs
    | Name | Description | Default |
    | ---- | ----------- | ------- |
  `;
  Object.entries(inputs).forEach(
    ([input, { description, default: value }]) =>
      content += "\n" + "| `" + input + "` | " + description + " | " +
        (value ? "`" + value + "`" : "") + " |",
  );
  return content;
}

console.log(toMarkdown(action));

await Deno.writeTextFile(
  new URL("../docs/inputs.generated.md", import.meta.url),
  toMarkdown(action),
);

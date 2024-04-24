import { assertSpyCall, spy } from "@std/testing/mock";
import main from "./main.ts";

const context = {
  repo: {
    owner: "hasundue",
    repo: "molt-action",
  },
};

Deno.test("main", async () => {
  const inputs = {
    root: "./fixtures/data",
    config: "deno.json",
  };
  await main(context, inputs);
});

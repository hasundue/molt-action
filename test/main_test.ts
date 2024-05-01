import main from "../main.ts";
import { ActionInputsMock } from "./mock.ts";

const context = {
  repo: {
    owner: "hasundue",
    repo: "molt-action",
  },
};

Deno.test("main", async () => {
  using _mock = new ActionInputsMock({
    root: "test/fixtures",
    config: "deno.json",
    source: ["deno.json"],
  });
  await main(context);
});

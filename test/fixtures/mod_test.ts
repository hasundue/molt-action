import { assertEquals } from "jsr:@std/assert@0.224.0";
import { fn } from "./mod.ts";

Deno.test("fn", () => {
  assertEquals(fn(), { a: 1 });
});

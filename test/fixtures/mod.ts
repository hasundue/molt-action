import { pick } from "jsr:@std/collections@0.224.2";

export function fn() {
  return pick({ a: 1, b: 2 }, ["a"]);
}

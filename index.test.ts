import { test, expect } from "vitest";

import { disassemble } from "./disassemble.ts";

test("should pass", () => {
  const buffer = Buffer.from("89d9", "hex");
  expect(disassemble(buffer)).toBe("mov cx, bx");
});

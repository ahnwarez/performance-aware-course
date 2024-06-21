import { test, expect } from "vitest";

import { disassemble } from "./disassemble.ts";

// mov ch, ah
// mov dx, bx
// mov si, bx
// mov bx, di
// mov al, cl
// mov ch, ch
// mov bx, ax
// mov bx, si
// mov sp, di
// mov bp, ax

test("mov cx, bx", () => {
  const buffer = Buffer.from("89d9", "hex");
  expect(disassemble(buffer)).toBe("mov cx, bx");
});

test("mov dx, bx", () => {
  const buffer = Buffer.from("89da", "hex");
  expect(disassemble(buffer)).toBe("mov dx, bx");
});

test("mov si, bx", () => {
  const buffer = Buffer.from("89f3", "hex");
  expect(disassemble(buffer)).toBe("mov si, bx");
});

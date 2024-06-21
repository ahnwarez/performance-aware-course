import { test, expect } from "vitest";

import { disassemble } from "./disassemble.ts";

test("mov cx, bx", () => {
  const buffer = Buffer.from("89d9", "hex");
  expect(disassemble(buffer)?.instruction).toBe("mov cx, bx");
});

test("mov ch, ah", () => {
  const buffer = Buffer.from("88e5", "hex");
  expect(disassemble(buffer)?.instruction).toBe("mov ch, ah");
});

test("mov dx, bx", () => {
  const buffer = Buffer.from("89da", "hex");
  expect(disassemble(buffer)?.instruction).toBe("mov dx, bx");
});

test("mov si, bx", () => {
  const buffer = Buffer.from("89de", "hex");
  expect(disassemble(buffer)?.instruction).toBe("mov si, bx");
});

test("mov bx, di", () => {
  const buffer = Buffer.from("89fb", "hex");
  expect(disassemble(buffer)?.instruction).toBe("mov bx, di");
});

test("mov al, cl", () => {
  const buffer = Buffer.from("88c8", "hex");
  expect(disassemble(buffer)?.instruction).toBe("mov al, cl");
});

test("mov ch, ch", () => {
  const buffer = Buffer.from("88ed", "hex");
  expect(disassemble(buffer)?.instruction).toBe("mov ch, ch");
});

test("mov bx, ax", () => {
  const buffer = Buffer.from("89c3", "hex");
  expect(disassemble(buffer)?.instruction).toBe("mov bx, ax");
});

test("mov bx, si", () => {
  const buffer = Buffer.from("89f3", "hex");
  expect(disassemble(buffer)?.instruction).toBe("mov bx, si");
});

test("mov sp, di", () => {
  const buffer = Buffer.from("89fc", "hex");
  expect(disassemble(buffer)?.instruction).toBe("mov sp, di");
});

test("mov bp, ax", () => {
  const buffer = Buffer.from("89c5", "hex");
  expect(disassemble(buffer)?.instruction).toBe("mov bp, ax");
});

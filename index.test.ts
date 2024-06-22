import { describe, it, expect } from "vitest";

import { disassemble } from "./disassemble.ts";

describe("register to register move", () => {
  it("mov cx, bx", () => {
    const buffer = Buffer.from("89d9", "hex");
    expect(disassemble(buffer)?.instruction).toBe("mov cx, bx");
  });

  it("mov ch, ah", () => {
    const buffer = Buffer.from("88e5", "hex");
    expect(disassemble(buffer)?.instruction).toBe("mov ch, ah");
  });

  it("mov dx, bx", () => {
    const buffer = Buffer.from("89da", "hex");
    expect(disassemble(buffer)?.instruction).toBe("mov dx, bx");
  });

  it("mov si, bx", () => {
    const buffer = Buffer.from("89de", "hex");
    expect(disassemble(buffer)?.instruction).toBe("mov si, bx");
  });

  it("mov bx, di", () => {
    const buffer = Buffer.from("89fb", "hex");
    expect(disassemble(buffer)?.instruction).toBe("mov bx, di");
  });

  it("mov al, cl", () => {
    const buffer = Buffer.from("88c8", "hex");
    expect(disassemble(buffer)?.instruction).toBe("mov al, cl");
  });

  it("mov ch, ch", () => {
    const buffer = Buffer.from("88ed", "hex");
    expect(disassemble(buffer)?.instruction).toBe("mov ch, ch");
  });

  it("mov bx, ax", () => {
    const buffer = Buffer.from("89c3", "hex");
    expect(disassemble(buffer)?.instruction).toBe("mov bx, ax");
  });

  it("mov bx, si", () => {
    const buffer = Buffer.from("89f3", "hex");
    expect(disassemble(buffer)?.instruction).toBe("mov bx, si");
  });

  it("mov sp, di", () => {
    const buffer = Buffer.from("89fc", "hex");
    expect(disassemble(buffer)?.instruction).toBe("mov sp, di");
  });

  it("mov bp, ax", () => {
    const buffer = Buffer.from("89c5", "hex");
    expect(disassemble(buffer)?.instruction).toBe("mov bp, ax");
  });

  it("mov si, bx", () => {
    const buffer = Buffer.from("89de", "hex");
    expect(disassemble(buffer)?.instruction).toBe("mov si, bx");
  });

  it("mov dh, al", () => {
    const buffer = Buffer.from("88c6", "hex");
    expect(disassemble(buffer)?.instruction).toBe("mov dh, al");
  });
});

describe("8-bit immediate to register", () => {
  it("mov cl, 12", () => {
    const buffer = Buffer.from("b10c", "hex");
    expect(disassemble(buffer)?.instruction).toBe("mov cl, 12");
  });

  it("mov ch, -12", () => {
    const buffer = Buffer.from("b5f4", "hex");
    expect(disassemble(buffer)?.instruction).toBe("mov ch, -12");
  });

  it("mov cx, 12", () => {
    const buffer = Buffer.from("b90c", "hex");
    expect(disassemble(buffer)?.instruction).toBe("mov cx, 12");
  });
});

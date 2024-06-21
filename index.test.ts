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
});

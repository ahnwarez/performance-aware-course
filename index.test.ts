import { describe, it, expect } from 'vitest'

import { printInstruction } from './index'

describe('register to register move', () => {
  it('mov cx, bx', () => {
    expect(printInstruction(0x89d9)).toBe('mov cx, bx')
  })

  it('mov ch, ah', () => {
    expect(printInstruction(0x88e5)).toBe('mov ch, ah')
  })

  it('mov dx, bx', () => {
    expect(printInstruction(0x89da)).toBe('mov dx, bx')
  })

  it('mov si, bx', () => {
    expect(printInstruction(0x89de)).toBe('mov si, bx')
  })

  it('mov bx, di', () => {
    expect(printInstruction(0x89fb)).toBe('mov bx, di')
  })

  it('mov al, cl', () => {
    expect(printInstruction(0x88c8)).toBe('mov al, cl')
  })

  it('mov ch, ch', () => {
    expect(printInstruction(0x88ed)).toBe('mov ch, ch')
  })

  it('mov bx, ax', () => {
    expect(printInstruction(0x89c3)).toBe('mov bx, ax')
  })

  it('mov bx, si', () => {
    expect(printInstruction(0x89f3)).toBe('mov bx, si')
  })

  it('mov sp, di', () => {
    expect(printInstruction(0x89fc)).toBe('mov sp, di')
  })

  it('mov bp, ax', () => {
    expect(printInstruction(0x89c5)).toBe('mov bp, ax')
  })
})

describe('8-bit immediate to register', () => {
  it('mov cl, 12', () => {
    expect(printInstruction(0xb10c)).toBe('mov cl, 12')
  })

  it('mov cx, 12', () => {
    expect(printInstruction(0xb90c)).toBe('mov cx, 12')
  })
})

describe('16-bit immediate to register', () => {
  it('mov cx, 12', () => {
    expect(printInstruction(0xb90d34)).toBe('mov cx, 12')
  })

  it('mov dx, 339488', () => {
    expect(printInstruction(0xba6c0f)).toBe('mov dx, 339488')
  })
})

describe('source address calculation plus 8-bit displacement', () => {
  it('mov ah, [bx+si+4]', () => {
    expect(printInstruction(0x8a6004)).toBe('mov ah, [bx+si+4]')
  })
})

describe('source address calculation plus 16-bit displacement', () => {
  it('mov al, [bx+si+4999]', () => {
    expect(printInstruction(0x8a60001234)).toBe('mov al, [bx+si+4999]')
  })
})

describe('dest address calculation', () => {
  it('mov [bx+di], cx', () => {
    expect(printInstruction(0x8909)).toBe('mov [bx+di], cx')
  })

  it('mov [bp+si], cl', () => {
    expect(printInstruction(0x8808)).toBe('mov [bp+si], cl')
  })

  it('mov [bp+si], cl', () => {
    expect(printInstruction(0x8808)).toBe('mov [bp+si], cl')
  })

  it('mov [bp], ch', () => {
    expect(printInstruction(0x886e00)).toBe('mov [bp], ch')
  })
})

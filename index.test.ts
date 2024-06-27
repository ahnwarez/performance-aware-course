import { describe, it, expect } from 'vitest'

import { printInstruction } from './index'

describe('register to register move', () => {
  it('mov cx, bx', () => {
    expect(printInstruction(0x89d9)).toBe('mov cx, bx')
  })

  it('mov ch, ah', () => {
    const buffer = Buffer.from('88e5', 'hex')
    expect(printInstruction(0x88e5)).toBe('mov ch, ah')
  })

  it('mov dx, bx', () => {
    const buffer = Buffer.from('89da', 'hex')
    expect(printInstruction(0x89da)).toBe('mov dx, bx')
  })

  it('mov si, bx', () => {
    const buffer = Buffer.from('89de', 'hex')
    expect(printInstruction(0x89de)).toBe('mov si, bx')
  })

  it('mov bx, di', () => {
    const buffer = Buffer.from('89fb', 'hex')
    expect(printInstruction(0x89fb)).toBe('mov bx, di')
  })

  it('mov al, cl', () => {
    const buffer = Buffer.from('88c8', 'hex')
    expect(printInstruction(0x88c8)).toBe('mov al, cl')
  })

  it('mov ch, ch', () => {
    const buffer = Buffer.from('88ed', 'hex')
    expect(printInstruction(0x88ed)).toBe('mov ch, ch')
  })

  it('mov bx, ax', () => {
    const buffer = Buffer.from('89c3', 'hex')
    expect(printInstruction(0x89c3)).toBe('mov bx, ax')
  })

  it('mov bx, si', () => {
    const buffer = Buffer.from('89f3', 'hex')
    expect(printInstruction(0x89f3)).toBe('mov bx, si')
  })

  it('mov sp, di', () => {
    const buffer = Buffer.from('89fc', 'hex')
    expect(printInstruction(0x89fc)).toBe('mov sp, di')
  })

  it('mov bp, ax', () => {
    const buffer = Buffer.from('89c5', 'hex')
    expect(printInstruction(0x89c5)).toBe('mov bp, ax')
  })

  it('mov si, bx', () => {
    const buffer = Buffer.from('89de', 'hex')
    expect(printInstruction(0x89de)).toBe('mov si, bx')
  })

  it('mov dh, al', () => {
    const buffer = Buffer.from('88c6', 'hex')
    expect(printInstruction(0x88c6)).toBe('mov dh, al')
  })
})

describe('8-bit immediate to register', () => {
  it('mov cl, 12', () => {
    const buffer = Buffer.from('b10c', 'hex')
    expect(printInstruction(0xb10c)).toBe('mov cl, 12')
  })

  it('mov cx, 12', () => {
    const buffer = Buffer.from('b90c', 'hex')
    expect(printInstruction(0xb90c)).toBe('mov cx, 12')
  })
})

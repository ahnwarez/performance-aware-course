import { describe, it, expect } from 'vitest'

import { printInstruction } from './my-decoder'

describe('mov', () => {
  describe('register to register move', () => {
    it('mov cx, bx', () => {
      expect(printInstruction(Buffer.from([0x89, 0xd9]))).toBe('mov cx, bx')
    })
    it('mov ch, ah', () => {
      expect(printInstruction(Buffer.from([0x88, 0xe5]))).toBe('mov ch, ah')
    })
    it('mov dx, bx', () => {
      expect(printInstruction(Buffer.from([0x89, 0xda]))).toBe('mov dx, bx')
    })
    it('mov si, bx', () => {
      expect(printInstruction(Buffer.from([0x89, 0xde]))).toBe('mov si, bx')
    })
    it('mov bx, di', () => {
      expect(printInstruction(Buffer.from([0x89, 0xfb]))).toBe('mov bx, di')
    })
    it('mov al, cl', () => {
      expect(printInstruction(Buffer.from([0x88, 0xc8]))).toBe('mov al, cl')
    })
    it('mov ch, ch', () => {
      expect(printInstruction(Buffer.from([0x88, 0xed]))).toBe('mov ch, ch')
    })
    it('mov bx, ax', () => {
      expect(printInstruction(Buffer.from([0x89, 0xc3]))).toBe('mov bx, ax')
    })
    it('mov bx, si', () => {
      expect(printInstruction(Buffer.from([0x89, 0xf3]))).toBe('mov bx, si')
    })
    it('mov sp, di', () => {
      expect(printInstruction(Buffer.from([0x89, 0xfc]))).toBe('mov sp, di')
    })
    it('mov bp, ax', () => {
      expect(printInstruction(Buffer.from([0x89, 0xc5]))).toBe('mov bp, ax')
    })
  })

  describe('8-bit immediate to register', () => {
    it('mov cl, 12', () => {
      expect(printInstruction(Buffer.from([0xb1, 0x0c]))).toBe('mov cl, 12')
    })
  })

  describe('16-bit immediate to register', () => {
    it('mov cx, 12', () => {
      expect(printInstruction(Buffer.from([0xb9, 0x0c]))).toBe('mov cx, 12')
    })
    it('mov dx, 3948', () => {
      expect(printInstruction(Buffer.from([0xba, 0x6c, 0x0f]))).toBe('mov dx, 3948')
    })
  })

  describe('source address calculation plus 8-bit displacement', () => {
    it('mov ah, [bx+si+4]', () => {
      expect(printInstruction(Buffer.from([0x8a, 0x60, 0x04]))).toBe('mov ah, [bx+si+4]')
    })
  })

  describe('source address calculation plus 16-bit displacement', () => {
    it('mov al, [bx+si+4999]', () => {
      expect(printInstruction(Buffer.from([0x8a, 0x80, 0x87, 0x13]))).toBe('mov al, [bx+si+4999]')
    })
  })

  describe('dest address calculation', () => {
    it('mov [bx+di], cx', () => {
      expect(printInstruction(Buffer.from([0x89, 0x09]))).toBe('mov [bx+di], cx')
    })
    it('mov [bp+si], cl', () => {
      expect(printInstruction(Buffer.from([0x88, 0x0a]))).toBe('mov [bp+si], cl')
    })
    it('mov [bp], ch', () => {
      expect(printInstruction(Buffer.from([0x88, 0x6e, 0x00]))).toBe('mov [bp], ch')
    })
  })
})

describe('add', () => {
  it('add bx, [bx+si]', () => {
    expect(printInstruction(Buffer.from([0x03, 0x18]))).toBe('add bx, [bx+si]')
  })

  it('add bx, [bp]', () => {
    expect(printInstruction(Buffer.from([0x03, 0x5e, 0x00]))).toBe('add bx, [bp]')
  })

  it('add si, 2', () => {
    expect(printInstruction(Buffer.from([0x83, 0xc6, 0x02]))).toBe('add si, 2')
  })

  it('add bp, 2', () => {
    expect(printInstruction(Buffer.from([0x83, 0xc5, 0x02]))).toBe('add bp, 2')
  })

  it('add cx, 8', () => {
    expect(printInstruction(Buffer.from([0x83, 0xc1, 0x08]))).toBe('add cx, 8')
  })

  it('add bx, [bp]', () => {
    expect(printInstruction(Buffer.from([0x03, 0x5e, 0x00]))).toBe('add bx, [bp]')
  })

  it('add cx, [bx+2]', () => {
    expect(printInstruction(Buffer.from([0x03, 0x4f, 0x02]))).toBe('add cx, [bx+2]')
  })

  it('add ax, 1000', () => {
    expect(printInstruction(Buffer.from([0x05, 0xe8, 0x03]))).toBe('add ax, 1000')
  })

  it('add al, 9', () => {
    expect(printInstruction(Buffer.from([0x04, 0x09]))).toBe('add al, 9')
  })
})

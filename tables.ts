export enum Mnemonic {
  MOV = 'mov',
  ADD = 'add',
}

export enum Register {
  al = 'al',
  cl = 'cl',
  dl = 'dl',
  bl = 'bl',
  ah = 'ah',
  ch = 'ch',
  dh = 'dh',
  bh = 'bh',
  ax = 'ax',
  cx = 'cx',
  dx = 'dx',
  bx = 'bx',
  sp = 'sp',
  bp = 'bp',
  si = 'si',
  di = 'di',
}

export type Operand =
  | {
      type: 'register'
      register: Register
    }
  | {
      type: 'immediate'
      value: number
    }
  | {
      type: 'memory'
      value: number | [Register, Register] | [Register, Register, number] | [number] | [Register]
    }
  | {
      type: 'disp'
      value: number
    }

export interface DecodedInstruction {
  mnemonic: Mnemonic
  operands: Operand[]
}

export const registerEncoding: { [d: number]: { [r: number]: Register } } = {
  1: {
    0b000: Register.ax,
    0b001: Register.cx,
    0b010: Register.dx,
    0b011: Register.bx,
    0b100: Register.sp,
    0b101: Register.bp,
    0b110: Register.si,
    0b111: Register.di,
  },
  0: {
    0b000: Register.al,
    0b001: Register.cl,
    0b010: Register.dl,
    0b011: Register.bl,
    0b100: Register.ah,
    0b101: Register.ch,
    0b110: Register.dh,
    0b111: Register.bh,
  },
}

// effective address calculation
export const baseRegister = {
  0b000: (val: number) => [Register.bx, Register.si, val],
  0b001: (val: number) => [Register.bx, Register.di, val],
  0b010: (val: number) => [Register.bp, Register.si, val],
  0b011: (val: number) => [Register.bp, Register.di, val],
  0b100: () => [Register.si],
  0b101: () => [Register.di],
  0b110: (val: number) => [val],
  0b111: () => [Register.bx],
}

export enum OperandType {
  REG,
  RM,
  imm,
}

interface InstructionFormat {
  opcode: number
  mask: number
  mnemonic: Mnemonic
  operands: OperandType[]
  // a mask to extract the fields from the first byte
  D?: (instruction: number) => number
  W: (instruction: number) => number
  REG: (instruction: number) => number
}

const D = (shift: number) => (firstByte: number) => (firstByte >> shift) & 0b1
const W = (shift: number) => (firstByte: number) => (firstByte >> shift) & 0b1
// because REG can appear in the first or second byte, we need to pass the instruction as an argument
const REG = (shift: number) => (instruction: number) => (instruction >> shift) & 0b111

export const instructionFormats: InstructionFormat[] = [
  // register to register
  {
    opcode: 0x88,
    mask: 0xfc,
    mnemonic: Mnemonic.MOV,
    operands: [OperandType.RM, OperandType.REG],
    D: D(1),
    W: W(0),
    REG: REG(3),
  },
  {
    opcode: 0x89,
    mask: 0xfc,
    mnemonic: Mnemonic.MOV,
    operands: [OperandType.RM, OperandType.REG],
    D: D(1),
    W: W(0),
    REG: REG(3),
  },
  {
    opcode: 0x8a,
    mask: 0xfc,
    mnemonic: Mnemonic.MOV,
    operands: [OperandType.REG, OperandType.RM],
    D: D(1),
    W: W(0),
    REG: REG(3),
  },
  {
    opcode: 0x8b,
    mask: 0xfc,
    mnemonic: Mnemonic.MOV,
    operands: [OperandType.REG, OperandType.RM],
    D: D(1),
    W: W(0),
    REG: REG(3),
  },
  // immediate to register
  {
    opcode: 0xb0,
    mask: 0xf0,
    mnemonic: Mnemonic.MOV,
    operands: [OperandType.REG, OperandType.imm],
    W: W(3),
    REG: REG(8),
  },
  {
    opcode: 0xb8,
    mask: 0xf8,
    mnemonic: Mnemonic.MOV,
    operands: [OperandType.REG, OperandType.imm],
    W: () => 1,
    REG: (instruction) => instruction & 0x07,
  },
  // add
  {
    opcode: 0x00,
    mask: 0xfe,
    mnemonic: Mnemonic.ADD,
    operands: [OperandType.RM, OperandType.REG],
    D: D(1),
    W: W(0),
    REG: REG(3),
  },
  {
    opcode: 0x01,
    mask: 0xfe,
    mnemonic: Mnemonic.ADD,
    operands: [OperandType.RM, OperandType.REG],
    D: D(1),
    W: W(0),
    REG: REG(3),
  },
  {
    opcode: 0x02,
    mask: 0xfe,
    mnemonic: Mnemonic.ADD,
    operands: [OperandType.RM, OperandType.REG],
    D: D(1),
    W: W(0),
    REG: REG(3),
  },
]

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
  shiftLeft: number
  mnemonic: Mnemonic
  operands: OperandType[]
  // a mask to extract the fields from the first byte
  D?: (instruction: number) => number
  W: (instruction: number) => number
  REG: (instruction: number) => number
  S?: (instruction: number) => number
  IMM?: (s: number, w: number, secondByte: number, thirdByte: number) => number
}

const D = (shift: number) => (firstByte: number) => (firstByte >> shift) & 0b1
const W = (shift: number) => (firstByte: number) => (firstByte >> shift) & 0b1
// because REG can appear in the first or second byte, we need to pass the instruction as an argument
const REG = (shift: number) => (instruction: number) => (instruction >> shift) & 0b111

export const instructionFormats: InstructionFormat[] = [
  // register to register
  {
    opcode: 0b100010,
    shiftLeft: 2,
    mnemonic: Mnemonic.MOV,
    operands: [OperandType.RM, OperandType.REG],
    D: D(1),
    W: W(0),
    REG: REG(3),
  },
  // immediate to register
  {
    opcode: 0b1011,
    shiftLeft: 4,
    mnemonic: Mnemonic.MOV,
    operands: [OperandType.REG, OperandType.imm],
    W: W(3),
    REG: REG(8),
    IMM: (s: number, w: number, secondByte: number, thirdByte: number) => (w === 1 ? secondByte | (thirdByte << 8) : secondByte),
  },
  // add
  {
    opcode: 0b000000,
    shiftLeft: 2,
    mnemonic: Mnemonic.ADD,
    operands: [OperandType.RM, OperandType.REG],
    D: D(1),
    W: W(0),
    REG: REG(3),
    DISP: (thirdByte: number, fourthByte: number) => (fourthByte << 8) | thirdByte,
  },
  {
    opcode: 0x80,
    shiftLeft: 2,
    mnemonic: Mnemonic.ADD,
    operands: [OperandType.RM, OperandType.imm],
    W: W(0),
    REG: () => 0b000,
  },
  {
    opcode: 0b100000,
    shiftLeft: 2,
    mnemonic: Mnemonic.ADD,
    operands: [OperandType.RM, OperandType.imm],
    W: W(0),
    REG: () => 0b000,
    // check if the second bit is set
    S: (firstByte: number) => (firstByte & 0b10) >> 1,
    IMM: (s: number, w: number, secondByte: number, thirdByte: number) => {
      return s === 1 ? thirdByte : 0
    },
  },
  // immediate to accumulator
  {
    opcode: 0x02,
    shiftLeft: 1,
    mnemonic: Mnemonic.ADD,
    operands: [OperandType.REG, OperandType.imm],
    W: W(0),
    REG: () => 0b000,
    IMM: (s: number, w: number, secondByte: number, thirdByte: number) => {
      return w === 1 ? secondByte | (thirdByte << 8) : secondByte
    },
  },
]

enum Mnemonic {
  MOV = 'mov',
}

enum Register {
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

type Operand =
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
      value: number
    }

interface DecodedInstruction {
  mnemonic: Mnemonic
  operands: Operand[]
}

const registerEncoding: { [d: number]: { [r: number]: Register } } = {
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

enum OperandType {
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

const instructionFormats: InstructionFormat[] = [
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
]

export function printInstruction(encodedInstruction: number): string {
  const instruction = decodInstruction(encodedInstruction)
  if (!instruction) {
    return 'Invalid instruction'
  }
  return `${instruction.mnemonic} ${instruction.operands.map((operand) => (operand.type === 'register' ? operand.register : operand.value)).join(', ')}`
}

function decodInstruction(encodedInstruction: number): DecodedInstruction | undefined {
  const firstByte = (encodedInstruction & 0xff00) >> 8
  const secondByte = encodedInstruction & 0x00ff

  // find the matching instruction format
  const format = instructionFormats.find((format) => (firstByte & format.mask) === format.opcode)
  if (!format) {
    return undefined
  }

  const d = format.D ? format.D(firstByte) : 0
  const w = format.W ? format.W(firstByte) : 0
  const firstAndSecondByte = (firstByte << 8) | secondByte
  const reg = format.REG ? format.REG(firstAndSecondByte) : 0

  const mod = (secondByte & 0xc0) >> 6
  const rm = secondByte & 0x07

  const operands: Operand[] = format.operands.map((operandType) => {
    switch (operandType) {
      case OperandType.REG:
        return { type: 'register', register: registerEncoding[w][reg] }
      case OperandType.RM:
        if (mod === 0b11) {
          return { type: 'register', register: registerEncoding[w][rm] }
        } else {
          return { type: 'memory', value: rm }
        }
      case OperandType.imm:
        if (w === 1) {
          // exclude the first byte
          return { type: 'immediate', value: encodedInstruction & 0xffff }
        } else {
          return { type: 'immediate', value: encodedInstruction & 0xff }
        }
      default:
        throw new Error('Invalid operand type')
    }
  })

  // Swap operands if d bit is set (for MOV register-to-register instructions)
  if (format.mnemonic === Mnemonic.MOV && format.D && d) {
    ;[operands[0], operands[1]] = [operands[1], operands[0]]
  }

  return {
    mnemonic: format.mnemonic,
    operands,
  }
}

const mov_cx_bx = 0x89d9
const mov_cl_12 = 0xb10c
const mov_cx_12 = 0xb90c
const mov_dx_3948 = 0xba6c0f
console.log(decodInstruction(mov_dx_3948))

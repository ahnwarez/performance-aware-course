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

export function printInstruction(instructionStream: Buffer): string {
  const instruction = decodInstruction(instructionStream)
  if (!instruction) {
    return 'Invalid instruction'
  }
  return `${instruction.mnemonic} ${instruction.operands.map((operand) => (operand.type === 'register' ? operand.register : operand.value)).join(', ')}`
}

function decodInstruction(instructionStream: Buffer): DecodedInstruction | undefined {
  let cursor = 0
  while (cursor < instructionStream.length) {
    let cursor = 0
    const firstByte = instructionStream[cursor++]
    // find the matching instruction format
    const format = instructionFormats.find((format) => (firstByte & format.mask) === format.opcode)
    if (!format) {
      return undefined
    }
    const secondByte = instructionStream[cursor++]
    const thirdByte = instructionStream[cursor++]
    // const firstByte = (instructionStream & 0xff0000) >> 16
    // const secondByte = (instructionStream & 0x00ff00) >> 8
    // const thirdByte = instructionStream & 0x0000ff

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
            // combine the second and third bytes to get the 16-bit immediate value
            const imm = secondByte | (thirdByte << 8)
            return { type: 'immediate', value: imm }
          } else {
            return { type: 'immediate', value: secondByte }
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
}

const mov_cx_bx = [0x89, 0xd9]
const mov_cl_12 = [0xb1, 0x0c]
const mov_cx_12 = [0xb9, 0x0c]
const mov_dx_3948 = [0xba, 0x6c, 0x0f]
console.log(decodInstruction(Buffer.from(mov_dx_3948)))

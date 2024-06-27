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
}

const instructionFormats: InstructionFormat[] = [
  // register to register
  {
    opcode: 0x88,
    mask: 0xfc,
    mnemonic: Mnemonic.MOV,
    operands: [OperandType.RM, OperandType.REG],
  },
  {
    opcode: 0x89,
    mask: 0xfc,
    mnemonic: Mnemonic.MOV,
    operands: [OperandType.RM, OperandType.REG],
  },
  {
    opcode: 0x8a,
    mask: 0xfc,
    mnemonic: Mnemonic.MOV,
    operands: [OperandType.REG, OperandType.RM],
  },
  {
    opcode: 0x8b,
    mask: 0xfc,
    mnemonic: Mnemonic.MOV,
    operands: [OperandType.REG, OperandType.RM],
  },
  // immediate to register
  {
    opcode: 0xb0,
    mask: 0xf0,
    mnemonic: Mnemonic.MOV,
    operands: [OperandType.REG, OperandType.imm],
  },
]

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

function printInstruction(instruction: DecodedInstruction): string {
  return `${instruction.mnemonic} ${instruction.operands.map((operand) => operand.toString()).join(', ')}`
}

function decodInstruction(encodedInstruction: number): DecodedInstruction | undefined {
  const firstByte = (encodedInstruction & 0xff00) >> 8
  const secondByte = encodedInstruction & 0x00ff

  // find the matching instruction format
  const format = instructionFormats.find((format) => (firstByte & format.mask) === format.opcode)
  if (!format) {
    return undefined
  }

  const d = (firstByte & 0x02) >> 1
  const w = firstByte & 0x01
  const mod = (secondByte & 0xc0) >> 6
  const reg = (secondByte & 0x38) >> 3
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
        return { type: 'immediate', value: secondByte }
      default:
        throw new Error('Invalid operand type')
    }
  })

  if (format.mnemonic === Mnemonic.MOV && d === 1) {
    ;[operands[0], operands[1]] = [operands[1], operands[0]]
  }

  return {
    mnemonic: format.mnemonic,
    operands,
  }
}

console.log(decodInstruction(0xb001))

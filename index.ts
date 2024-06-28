enum Mnemonic {
  MOV = 'mov',
  ADD = 'add',
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
      value: number | [Register, Register] | [Register, Register, number] | [number] | [Register]
    }
  | {
      type: 'disp'
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

// effective address calculation
const baseRegister = {
  0b000: (val: number) => [Register.bx, Register.si, val],
  0b001: (val: number) => [Register.bx, Register.di, val],
  0b010: (val: number) => [Register.bp, Register.si, val],
  0b011: (val: number) => [Register.bp, Register.di, val],
  0b100: () => [Register.si],
  0b101: () => [Register.di],
  0b110: (val: number) => [val],
  0b111: () => [Register.bx],
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

export function printInstruction(instructionStream: Buffer): string {
  const instruction = decodInstruction(instructionStream)
  if (!instruction) {
    return 'Invalid instruction'
  }

  // return `${instruction.mnemonic} ${instruction.operands.map((operand) => (operand.type === 'register' ? operand.register : operand.value)).join(', ')}`
  return `${instruction.mnemonic} ${instruction.operands
    .map((operand) => {
      switch (operand.type) {
        case 'register':
          return operand.register
        case 'immediate':
          return operand.value
        case 'memory':
          if (typeof operand.value === 'number') {
            return `[${operand.value}]`
          }
          return `[${operand.value.filter(Boolean).join('+')}]`
        default:
          return operand.value
      }
    })
    .join(', ')}`
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
            // register to register
            return { type: 'register', register: registerEncoding[w][rm] }
          } else if (mod === 0b01 && rm === 0b110) {
            const val = registerEncoding[1][0b101]
            return { type: 'memory', value: [val] }
          } else if (mod === 0b01) {
            // 8-bit displacement
            const val = baseRegister[rm](thirdByte)
            return { type: 'memory', value: val }
          } else if (mod === 0b10) {
            // 16-bit displacement
            const fourthByte = instructionStream[cursor++]
            const val = baseRegister[rm]((fourthByte << 8) | thirdByte)
            return { type: 'memory', value: val }
          } else {
            if (rm === 0b110) {
              // direct addressing
              if (w === 1) {
                // 16-bit displacement
                const val = (thirdByte << 8) | secondByte
                return { type: 'memory', value: val }
              } else {
                // 8-bit displacement
                return { type: 'memory', value: secondByte }
              }
            } else {
              // indirect addressing
              const val = baseRegister[rm]()
              return { type: 'memory', value: val }
            }
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
    if (format.D && d) {
      ;[operands[0], operands[1]] = [operands[1], operands[0]]
    }

    return {
      mnemonic: format.mnemonic,
      operands,
    }
  }
}

function execute(instructionStream: Buffer) {
  const registers = {
    cx: 0,
    bx: 15,
  }

  const instruction = decodInstruction(instructionStream)
  if (!instruction) {
    console.log('Invalid instruction')
    return
  }

  if (instruction.mnemonic === Mnemonic.MOV) {
    const [destination, source] = instruction.operands
    if (source.type === 'register' && destination.type === 'register') {
      registers[destination.register] = registers[source.register]
    }
  }

  return registers
}

const add_bx_bp = [0x03, 0x5e, 0x00]
const mov = [0x89, 0xd9]
console.log(execute(Buffer.from(mov)))

import { DecodedInstruction, Mnemonic, Operand, OperandType, baseRegister, instructionFormats, registerEncoding } from './tables'

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
console.log(printInstruction(Buffer.from(mov)))

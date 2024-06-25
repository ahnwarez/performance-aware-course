const InstructionBitPatterns = {
  '100010': 'MOV',
}

const r8 = {
  '000': 'AL',
  '001': 'CL',
  '010': 'DL',
  '011': 'BL',
  '100': 'AH',
  '101': 'CH',
  '110': 'DH',
  '111': 'BH',
}

const r16 = {
  '000': 'AX',
  '001': 'CX',
  '010': 'DX',
  '011': 'BX',
  '100': 'SP',
  '101': 'BP',
  '110': 'SI',
  '111': 'DI',
}

const readByte = ['immed8', null, 0]
const readWord = [
  ['datalo', null, 0],
  ['datahi', null, 0],
]
const regSourceByte = ['a', r8, 0, 'b', r8, 3]
const regDestByte = ['a', r8, 3, 'b', r8, 0]
const regSourceWord = ['a', r16, 0, 'b', r16, 3]
const regDestWord = ['a', r16, 3, 'b', r16, 0]
const segRegSourceWord = []
const segRegDestWord = []

const MachineInstructionDecodingGuide = {
  0x88: { template: 'MOV {a}, {b}', reg: regSourceByte },
  0x89: { template: 'MOV {a}, {b}', reg: regSourceWord },
  0x8b: { template: 'MOV {a}, {b}', reg: regDestWord },
  0x8c: { template: 'MOV {a}, {b}', reg: segRegSourceWord },
  0xa0: { template: 'MOV AL, {mem8}' },
  0xa1: { template: 'MOV AX, {mem16}' },
  0xa2: { template: 'MOV {mem8}, AL' },
  0xa3: { template: 'MOV {mem16}, AL' },
  0xa4: { template: 'MOVS DEST-STR8, SRC-STR8' },
  0xa5: { template: 'MOVS DEST-STR16, SRC-STR16' },
  0xb0: { template: 'MOV AL, {immed}' },
  0xb1: { template: 'MOV CL, {immed}' },
  0xb2: { template: 'MOV DL, {immed}' },
  0xb3: { template: 'MOV BL, {immed}' },
  0xb4: { template: 'MOV AH, {immed}' },
  0xb5: { template: 'MOV CH, {immed}' },
  0xb6: { template: 'MOV DH, {immed}' },
  0xb7: { template: 'MOV BH, {immed}' },
  0xb8: { template: 'MOV AX, {immed}' },
  0xb9: { template: 'MOV CX, {immed}' },
  0xba: { template: 'MOV DX, {immed}' },
  0xbb: { template: 'MOV BX, {immed}' },
  0xbc: { template: 'MOV SP, {immed}' },
  0xbd: { template: 'MOV BP, {immed}' },
  0xbe: { template: 'MOV SI, {immed}' },
  0xbf: { template: 'MOV DI, {immed}' },
  0xc6: { template: 'MOV {a}, {b}' },
  0xc7: { template: 'MOV {a}, {b}' },
}

// Register names for REG encoding when W is 0 or 1
const Registers = {
  '0': r8,
  '1': r16,
}

export function decodeInstruction(instructStream: Buffer) {
  let assemblyCode = [] as string[]
  let cursor = 0
  while (cursor < instructStream.length) {
    const opcode = instructStream[cursor++]
    const decodedInstruction = MachineInstructionDecodingGuide[opcode]
    let mnemonicTemplate = decodedInstruction.template
    const operandDecoding = decodedInstruction.reg

    if (Array.isArray(operandDecoding)) {
      const operandByte = instructStream[cursor++]
      for (let i = 0; i < operandDecoding.length; i += 3) {
        const target = operandDecoding[i]
        const registerMap = operandDecoding[i + 1]
        const shiftAmount = operandDecoding[i + 2]

        if (target === 'a' || (target === 'b' && shiftAmount)) {
          const registerCode = (operandByte >> shiftAmount) & 0b111
          const registerName =
            registerMap[registerCode.toString(2).padStart(3, '0')]
          mnemonicTemplate = mnemonicTemplate.replace(
            `{${target}}`,
            registerName
          )
        }
      }
    } else {
      // this is an immediate to register instruction
      // need to check if the w bit is set, 1 means 16-bit register and 0 means 8-bit register

      console.log({
        noShift: instructStream[cursor] & 0b1,
        shift: (instructStream[cursor] >> 4) & 0b1,
      })

      const immediateValue = instructStream[cursor++]
      mnemonicTemplate = mnemonicTemplate.replace(
        '{immed}',
        immediateValue.toString()
      )
    }

    assemblyCode.push(mnemonicTemplate.toLowerCase())
  }

  return assemblyCode.join('\n')
}

function main() {
  const decodedInstruction = decodeInstruction(Buffer.from('b50f', 'hex'))
  console.log(decodedInstruction)
}

main()

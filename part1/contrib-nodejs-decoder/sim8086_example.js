var addon = require('bindings')('sim8086')
//c706 e803 0100 c706 ea03 0200 c706 ec03
//0300 c706 ee03 0400 bbe8 03c7 4704 0a00
//8b1e e803 8b0e ea03 8b16 ec03 8b2e ee03
let exampleDisassembly = [
  0xc7, 0x06, 0xe8, 0x03, 0x01, 0x00, 0xc7, 0x06, 0xea, 0x03, 0x02, 0x00, 0xc7,
  0x06, 0xec, 0x03, 0x03, 0x00, 0xc7, 0x06, 0xee, 0x03, 0x04, 0x00, 0xbb, 0xe8,
  0x03, 0xc7, 0x47, 0x04, 0x0a, 0x00, 0x8b, 0x1e, 0xe8, 0x03, 0x8b, 0x0e, 0xea,
  0x03, 0x8b, 0x16, 0xec, 0x03, 0x8b, 0x2e, 0xee, 0x03,
]

const registersState = {
  ax: 0,
  bx: 0,
  cx: 0,
  dx: 0,
  sp: 0,
  bp: 0,
  si: 0,
  di: 0,
  ip: 0,
}

const Flags = {
  ZF: 0,
  SF: 0,
}

const memory = new Uint8Array(0xffff)

let offset = 0
while (offset < exampleDisassembly.length) {
  const dis = addon.decode8086Instruction(exampleDisassembly.slice(offset))
  if (dis.Type === 0) {
    console.log('Unrecognized instruction')
  }
  if (dis.Type != 0) {
    offset += dis.Size
    registersState.ip = offset
    const op = addon.getMnemonicFromOperationType(dis.Op)
    printInstruction(op, dis.Operands)
    simulate(op, dis.Operands, (ip) => {
      offset += ip
    })
    printRegistersState(registersState)
  }
}

function simulate(mnemonic, operands, cb) {
  executeInstruction(mnemonic, operands, cb)
}

function executeInstruction(mnemonic, operands, cb) {
  const destIndex = 0
  const srcIndex = 1
  const destType = operands[destIndex].Type
  const srcType = operands[srcIndex].Type
  const src =
    srcType == 3
      ? operands[srcIndex].Immediate.Value
      : srcType === 1
      ? registersState[
          addon.getRegisterNameFromOperand(operands[srcIndex].Register)
        ]
      : undefined

  if (mnemonic == 'jne') {
    const value = operands[0].Immediate.Value
    if (Flags.ZF === 0) {
      // then jump
      cb(value)
    }
  }

  if (mnemonic == 'mov') {
    if (operands[0].Type === 2) {
      const dest = operands[0].Address.Displacement
      // 16 bit value
      const src = operands[1].Immediate.Value
      // divide the value into low and high bytes
      const low = src & 0xff
      const high = (src & 0xff00) >> 8
      memory[dest] = low
      memory[dest + 1] = high
    } else if (operands[destIndex].Type == 1 && operands[srcIndex].Type == 3) {
      const dest = addon.getRegisterNameFromOperand(
        operands[destIndex].Register
      )
      registersState[dest] = operands[srcIndex].Immediate.Value
    } else if (operands[destIndex].Type == 1 && operands[srcIndex].Type == 1) {
      const src = addon.getRegisterNameFromOperand(operands[srcIndex].Register)
      const dest = addon.getRegisterNameFromOperand(
        operands[destIndex].Register
      )
      registersState[dest] = registersState[src]
    }
  } else if (mnemonic == 'add') {
    if (destType == 1) {
      registersState[dest] += src

      Flags.ZF = registersState[dest] === 0 ? 1 : 0
      Flags.SF = registersState[dest] & 0x8000 ? 1 : 0
    }
  } else if (mnemonic == 'sub') {
    if (destType == 1) {
      registersState[dest] -= src

      Flags.ZF = registersState[dest] === 0 ? 1 : 0
      Flags.SF = registersState[dest] & 0x8000 ? 1 : 0
    }
  } else if (mnemonic === 'cmp') {
    if (destType == 1) {
      const dest = addon.getRegisterNameFromOperand(
        operands[destIndex].Register
      )
      const src =
        srcType == 3
          ? operands[srcIndex].Immediate.Value
          : registersState[
              addon.getRegisterNameFromOperand(operands[srcIndex].Register)
            ]
      const result = registersState[dest] - src

      Flags.ZF = result === 0 ? 1 : 0
      Flags.SF = result < 0 ? 1 : 0
    }
  }
}

function printInstruction(mnemonic, operands) {
  console.log(
    `${mnemonic} ${operands
      .map((operand) =>
        operand.Type == 1
          ? addon.getRegisterNameFromOperand(operand.Register)
          : operand.Type == 2
          ? operand.Address
          : operand.Type == 3
          ? operand.Immediate.Value
          : undefined
      )
      .filter(Boolean)
      .join(', ')}`
  )
}

function printRegistersState(registersState) {
  console.table(registersState)
  console.log(memory[0x03e8])
  console.log(memory[0x03ea])
  console.log(memory[0x03ec])
  console.log(memory[0x03ee])
  // console.table(Flags)
}

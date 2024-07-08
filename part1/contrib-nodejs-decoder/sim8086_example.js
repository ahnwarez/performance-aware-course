var addon = require('bindings')('sim8086')
//b903 00bb e803 83c3 0a83 e901 75f8
let exampleDisassembly = [
  0xb9, 0x03, 0x00, 0xbb, 0xe8, 0x03, 0x83, 0xc3, 0x0a, 0x83, 0xe9, 0x01, 0x75,
  0xf8,
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

let offset = 0
while (offset < exampleDisassembly.length) {
  let dis = addon.decode8086Instruction(exampleDisassembly.slice(offset))
  if (dis.Type === 0) {
    console.log('Unrecognized instruction')
  }
  if (dis.Type != 0) {
    offset += dis.Size
    let op = addon.getMnemonicFromOperationType(dis.Op)
    printInstruction(op, dis.Operands)
    simulate(op, dis.Operands, dis.Size)
    printRegistersState(registersState)
  }
}

function simulate(mnemonic, operands, size) {
  registersState.ip += size
  executeInstruction(mnemonic, operands)
}

function executeInstruction(mnemonic, operands) {
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

  const dest =
    destType !== 3
      ? addon.getRegisterNameFromOperand(operands[destIndex].Register)
      : undefined
  if (mnemonic == 'jne') {
    const value = operands[0].Immediate.Value
    registersState['ip'] += value
  }

  if (mnemonic == 'mov') {
    if (operands[destIndex].Type == 1 && operands[srcIndex].Type == 3) {
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
  console.table(Flags)
}

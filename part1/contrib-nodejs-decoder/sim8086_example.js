var addon = require('bindings')('sim8086')

let exampleDisassembly = [0xb8, 0x01, 0x00, 0xbb, 0x02, 0x00, 0xb9, 0x03, 0x00, 0xba, 0x04, 0x00, 0xbc, 0x05, 0x00, 0xbd, 0x06, 0x00, 0xbe, 0x07, 0x00, 0xbf, 0x08, 0x00]

const registersState = {
  ax: 0,
  bx: 0,
  cx: 0,
  dx: 0,
  sp: 0,
  bp: 0,
  si: 0,
  di: 0,
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
    simulate(op, dis.Operands)
    printRegistersState(registersState)
  }
}

function simulate(mnemonic, operands) {
  const destIndex = 0
  const srcIndex = 1
  if (mnemonic == 'mov') {
    if (operands[destIndex].Type == 1 && operands[srcIndex].Type == 3) {
      const dest = addon.getRegisterNameFromOperand(operands[destIndex].Register)
      registersState[dest] = operands[srcIndex].Immediate.Value
    }
  }
}

function printInstruction(mnemonic, operands) {
  console.log(`${mnemonic} ${operands.map((operand) => (operand.Type == 1 ? addon.getRegisterNameFromOperand(operand.Register) : operand.Type == 2 ? operand.Address : operand.Immediate.Value)).join(', ')}`)
}

function printRegistersState(registersState) {
  console.table(registersState)
}

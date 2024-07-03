var addon = require('bindings')('sim8086')

let exampleDisassembly = [
  0xb8,
  0x0c,
  0x00, // mov ax, 0x000c
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
}

for (let index = 0; index < 30; index++) {
  const reg = addon.getRegisterNameFromOperand({ Index: index, Offset: 0, Count: 0 })
  console.log(reg)
}

let offset = 0
while (offset < exampleDisassembly.length) {
  let dis = addon.decode8086Instruction(exampleDisassembly.slice(offset))
  if (dis.Type != 0) {
    offset += dis.Size
    let op = addon.getMnemonicFromOperationType(dis.Op)
    console.log('\t', 'Mnemonic', op)
    for (let i = 0; i < dis.Operands.length; i++) {
      if (dis.Operands[i].Type == 1) {
        console.log(dis.Operands[i].Register)
        console.log('\t', 'Register', addon.getRegisterNameFromOperand(dis.Operands[i].Register))
      } else if (dis.Operands[i].Type == 2) {
        console.log('\t', 'Address', dis.Operands[i].Address)
      } else if (dis.Operands[i].Type == 3) {
        console.log('\t', 'Immediate', dis.Operands[i].Immediate.Value)
      }
    }
  } else {
    console.log('Unrecognized instruction')
  }
  console.log('--------------------------------------------------------------------------------')
}

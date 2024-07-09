const { log } = require('console')

const addon = require('bindings')('sim8086')

function createCPU() {
  return {
    registers: {
      ax: 0,
      bx: 0,
      cx: 0,
      dx: 0,
      sp: 0,
      bp: 0,
      si: 0,
      di: 0,
      ip: 0,
    },
    flags: {
      zf: 0,
      sf: 0,
    },
    memory: new Uint8Array(0xffff),
  }
}

function setRegister(cpu, name, value) {
  cpu.registers[name] = value & 0xffff
}

function getRegister(cpu, name) {
  return cpu.registers[name]
}

function setMemory(cpu, address, value) {
  cpu.memory[address] = value & 0xff
  cpu.memory[address + 1] = (value >> 8) & 0xff
}

// little endian
function getMemory(cpu, address) {
  return cpu.memory[address] | (cpu.memory[address + 1] << 8)
}

function updateFlags(cpu, value) {
  cpu.flags.zf = value === 0 ? 1 : 0
  const signMask = 0x8000
  cpu.flags.sf = value & signMask ? 1 : 0
}

function getOperandValue(cpu, operand) {
  switch (operand.Type) {
    case 1: // Register
      return getRegister(
        cpu,
        addon.getRegisterNameFromOperand(operand.Register)
      )
      break
    case 2: // Memory
      return getMemory(cpu, operand.Address.Displacement)
      break
    case 3:
      return operand.Immediate.Value
    default:
      throw new Error(`Unknown operand type: ${operand.Type}`)
  }
}

function PrintOperand(cpu, operand) {
  switch (operand.Type) {
    case 0: // None
      return ''
    case 1: // Register
      return addon.getRegisterNameFromOperand(operand.Register)
    case 2: {
      // Memory
      const displacement = operand.Address.Displacement
      const base1 = addon.getRegisterNameFromOperand(
        operand.Address.Terms[0].Register
      )
      const base2 = addon.getRegisterNameFromOperand(
        operand.Address.Terms[1].Register
      )
      return `[${[base1, base2, displacement]
        .filter((r) => r !== '')
        .join(' + ')}]`
    }
    case 3:
      return operand.Immediate.Value
    default:
      throw new Error(`Unknown operand type: ${operand.Type}`)
  }
}

function setOperandValue(cpu, operand, value) {
  switch (operand.Type) {
    case 1: // Register
      setRegister(
        cpu,
        addon.getRegisterNameFromOperand(operand.Register),
        value
      )
      break
    case 2: // Memory
      setMemory(cpu, operand.Address.Displacement, value)
      break
    default:
      throw new Error(`Unknown operand type: ${operand.Type}`)
  }
}

const instructions = {
  mov: (cpu, operands) => {
    const value = getOperandValue(cpu, operands[1])
    setOperandValue(cpu, operands[0], value)
  },
  add: (cpu, operands) => {
    const src = getOperandValue(cpu, operands[1])
    const dest = getOperandValue(cpu, operands[0])
    const result = (dest + src) & 0xffff
    setOperandValue(cpu, operands[0], result)
    updateFlags(cpu, result)
  },

  sub: (cpu, operands) => {
    const src = getOperandValue(cpu, operands[1])
    const dest = getOperandValue(cpu, operands[0])
    const result = (dest - src) & 0xffff
    setOperandValue(cpu, operands[0], result)
    updateFlags(cpu, result)
  },
  cmp: (cpu, operands) => {
    const src = getOperandValue(cpu, operands[1])
    const dest = getOperandValue(cpu, operands[0])
    const result = (dest - src) & 0xffff
    updateFlags(cpu, result)
  },
  jne: (cpu, operands) => {
    if (cpu.zf === 0) {
      cpu.registers.ip += operands[0].Immediate.Value
    }
  },
}

function executeInstruction(cpu, mnemonic, operands) {
  if (instructions[mnemonic]) {
    instructions[mnemonic](cpu, operands)
  } else {
    console.log(`Unrecognized instruction: ${mnemonic}`)
  }
}

function decodeAndExecute(cpu, instructionBytes) {
  let offset = 0
  while (offset < instructionBytes.length) {
    const decodedInstruction = addon.decode8086Instruction(
      instructionBytes.slice(offset)
    )
    if (decodedInstruction.Type === 0) {
      console.log('Unrecognized instruction')
      break
    }

    offset += decodedInstruction.Size
    cpu.registers.ip = offset

    const mnemonic = addon.getMnemonicFromOperationType(decodedInstruction.Op)

    printInstruction(mnemonic, decodedInstruction.Operands)
    executeInstruction(cpu, mnemonic, decodedInstruction.Operands)
    printCPUState(cpu)
  }
}

function printInstruction(mnemonic, operands) {
  console.log(
    `${mnemonic} ${operands
      .map((operand) => PrintOperand(cpu, operand))
      .join(', ')}`
  )
}

function printCPUState(cpu) {
  console.table(cpu.registers)
  // console.log('Memory at 0x03e8:', getMemory(cpu, 0x03e8))
  // console.log('Memory at 0x03ea:', getMemory(cpu, 0x03ea))
  // console.log('Memory at 0x03ec:', getMemory(cpu, 0x03ec))
  // console.log('Memory at 0x03ee:', getMemory(cpu, 0x03ee))
  console.table(cpu.flags)
}

// Example usage
const exampleDisassembly = [
  0xc7, 0x06, 0xe8, 0x03, 0x01, 0x00, 0xc7, 0x06, 0xea, 0x03, 0x02, 0x00, 0xc7,
  0x06, 0xec, 0x03, 0x03, 0x00, 0xc7, 0x06, 0xee, 0x03, 0x04, 0x00, 0xbb, 0xe8,
  0x03, 0xc7, 0x47, 0x04, 0x0a, 0x00, 0x8b, 0x1e, 0xe8, 0x03, 0x8b, 0x0e, 0xea,
  0x03, 0x8b, 0x16, 0xec, 0x03, 0x8b, 0x2e, 0xee, 0x03,
]

const cpu = createCPU()
decodeAndExecute(cpu, exampleDisassembly)

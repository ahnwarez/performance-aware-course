const addon = require('bindings')('sim8086')
const fs = require('fs')
const path = require('path')

const inputPath = process.argv[2]
const content = fs.readFileSync(path.join(__dirname, inputPath))
const buffer = Buffer.from(content)

// conver buffer to array of hex values (0x00)
const bufferArray = Array.from(buffer.values())

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

function calculateAddress(cpu, address) {
  const displacement = address.Displacement
  const base1Name = addon.getRegisterNameFromOperand(address.Terms[0].Register)
  const base2Name = addon.getRegisterNameFromOperand(address.Terms[1].Register)
  const base1 = base1Name === '' ? 0 : getRegister(cpu, base1Name)
  const base2 = base2Name === '' ? 0 : getRegister(cpu, base2Name)

  const result = [base1, base2, displacement].reduce((acc, val) => acc + val)
  return result
}
function setMemory(cpu, address, value) {
  const result = calculateAddress(cpu, address)
  cpu.memory[result] = value & 0xff
  cpu.memory[result + 1] = (value >> 8) & 0xff
}

// little endian
function getMemory(cpu, address) {
  const result = calculateAddress(cpu, address)
  return cpu.memory[result] | (cpu.memory[result + 1] << 8)
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
      return getMemory(cpu, operand.Address)
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
      setMemory(cpu, operand.Address, value)
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
    if (cpu.flags.zf === 0) {
      cpu.registers.ip += operands[0].Immediate.Value
    }
  },
  jnz: (cpu, operands) => {
    if (cpu.flags.zf === 0) {
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
  while (cpu.registers.ip < instructionBytes.length) {
    const decodedInstruction = addon.decode8086Instruction(
      instructionBytes.slice(cpu.registers.ip)
    )
    if (decodedInstruction.Type === 0) {
      console.log('Unrecognized instruction')
      break
    }

    cpu.registers.ip += decodedInstruction.Size

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
  console.table({ ...cpu.registers, ...cpu.flags })
  console.table(
    Array.from(cpu.memory)
      .filter(Boolean)
      .map((v, i) => ({ [i]: v }))
  )
}

const cpu = createCPU()
decodeAndExecute(cpu, bufferArray)

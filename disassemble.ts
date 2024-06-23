const r8 = {
  "000": "al",
  "001": "cl",
  "010": "dl",
  "011": "bl",
  "100": "ah",
  "101": "ch",
  "110": "dh",
  "111": "bh",
};

const r16 = {
  "000": "ax",
  "001": "cx",
  "010": "dx",
  "011": "bx",
  "100": "sp",
  "101": "bp",
  "110": "si",
  "111": "di",
};

// Register names for REG encoding when W is 0 or 1
const Registers = {
  0: r8,
  1: r16,
};

const instructionsTable = {
  "1011": (w: string, reg: string, data: string, dataIfW: string) => {
    // data and dataIfW are signed 8-bit values
    const isNegative = data[0] === "1";
    const regName = Registers[w][reg];
    if (w === "0") {
      const toDecimal = parseInt(data, 2);
      const twoComplement = isNegative ? toDecimal - 256 : toDecimal;
      return `mov ${regName}, ${Math.abs(twoComplement)}`;
    }
    // convert to decimal
    const toDecimal = parseInt(data + dataIfW, 2);
    return `mov ${regName}, ${toDecimal}`;
  },
};

export function disassemble(input: Buffer) {
  const binary = bufferToBinaryString(input);
  const opcode = binary.slice(0, 4);
  const w = binary[4];
  const reg = binary.slice(5, 8);
  const bitPostion = w === "0" ? 8 : 16;
  const data = binary.slice(bitPostion, bitPostion + 8);
  const dataIfW = binary.slice(8, bitPostion + 8);

  const instruction = instructionsTable[opcode];
  if (!instruction) {
    return {
      instruction: "Invalid opcode",
    };
  }

  return {
    instruction: instruction(w, reg, data, dataIfW),
  };
}

export function bufferToBinaryString(data: Buffer) {
  let binary = "";
  const hex = data.toString("hex");

  for (let i = 0; i < hex.length; i++) {
    binary += parseInt(hex[i], 16).toString(2).padStart(4, "0");
  }

  return binary;
}

export function disassemble(data: Buffer) {
  // mov dx, bx
  // 1000 1000 1110 0101
  const binary = bufferToBinaryString(data);
  // 1000 1000
  const firstByte = binary.slice(0, 8);
  // 1110 0101
  const secondByte = binary.slice(8, 16);

  const op = firstByte.slice(0, 6);
  // d means direction, 0 means source, 1 means destination
  // in this case, 0 means source
  const d = firstByte.slice(6, 7);
  // w means word, 1 means 16 bit, 0 means 8 bit
  const w = firstByte.slice(7, 8);

  const mod = secondByte.slice(0, 2);
  const reg = secondByte.slice(2, 5);
  const rm = secondByte.slice(5, 8);

  if (mod === "11") {
    // this is a register to register move
    if (d === "0") {
      const source = REG[reg][w];
      const destionation = REG[rm][w];
      return {
        instruction: `${opcodes[op]} ${destionation}, ${source}`,
        hex: data.toString("hex"),
        binary: binary,
      };
    } else {
      const source = REG[rm][w];
      const destionation = REG[reg][w];
      return {
        instruction: `${opcodes[op]} ${destionation}, ${source}`,
        hex: data.toString("hex"),
        binary: binary,
      };
    }
  }
}

const opcodes = {
  "100010": "mov",
};

const REG = {
  "000": {
    "0": "al",
    "1": "ax",
  },
  "001": {
    "0": "cl",
    "1": "cx",
  },
  "010": {
    "0": "dl",
    "1": "dx",
  },
  "011": {
    "0": "bl",
    "1": "bx",
  },
  "100": {
    "0": "ah",
    "1": "sp",
  },
  "101": {
    "0": "ch",
    "1": "bp",
  },
  "110": {
    "0": "dh",
    "1": "si",
  },
  "111": {
    "0": "bh",
    "1": "di",
  },
};

export function bufferToBinaryString(data: Buffer) {
  let binary = "";
  const hex = data.toString("hex");

  for (let i = 0; i < hex.length; i++) {
    binary += parseInt(hex[i], 16).toString(2).padStart(4, "0");
  }

  return binary;
}

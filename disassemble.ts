/** This function takes a buffer of data and disassembles it into assembly code
/* @param {Buffer} data - The buffer of data to disassemble, this the entire file
 */
export function disassemble(data: Buffer) {
  // │   hex   │  'b10c'  │
  // │   op    │ '101100' │
  // │    d    │   '0'    │
  // │    w    │   '1'    │
  // │   mod   │   '00'   │
  // │   reg   │  '001'   │
  // │   rm    │  '100'

  const binary = bufferToBinaryString(data);
  const firstByte = binary.slice(0, 8);
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

  console.log("op", op);
  if (op === "100010" && mod === "11") {
    const output = registerToRegister(op, d, w, mod, reg, rm);
    return output;
  } else if (op.startsWith("1011")) {
    const binary = bufferToBinaryString(data.slice(0, 27));
    const w = binary.slice(4, 5);
    const reg = binary.slice(5, 8);
    const dataM = binary.slice(8, 12);
    const dataL = binary.slice(12, 16);
    const output = immediateToRegister(w, reg, dataM, dataL);
    return output;
  }
}

function immediateToRegister(
  w: string,
  reg: string,
  dataM: string,
  dataL: string,
) {
  const destination = REG[reg][w];
  const immediateValue = parseInt(dataM + dataL, 2);
  return {
    instruction: `mov ${destination}, ${immediateValue}`,
  };
}

function registerToRegister(
  op: string,
  d: string,
  w: string,
  mod: string,
  reg: string,
  rm: string,
) {
  let outupt = {
    op,
    d,
    w,
    mod,
    reg,
    rm,
  };

  // this is a register to register move
  if (d === "0") {
    const source = REG[reg][w];
    const destionation = REG[rm][w];
    return {
      ...outupt,
      instruction: `mov ${destionation}, ${source}`,
    };
  } else {
    const source = REG[rm][w];
    const destionation = REG[reg][w];
    return {
      ...outupt,
      instruction: `mov ${destionation}, ${source}`,
    };
  }
}

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

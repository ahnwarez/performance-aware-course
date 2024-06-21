import fs from "node:fs/promises";

import { disassemble, bufferToBinaryString } from "./disassemble";

async function main(file: string) {
  const data = await fs.readFile(file);

  const instruction = disassemble(data);
  const binary = bufferToBinaryString(data);
  const output = `${instruction}\n ${data.toString("hex")} \n ${binary}`;

  console.log(output);
}

const file = process.argv[2];
main(file);

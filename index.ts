import fs from "node:fs/promises";

import { disassemble } from "./disassemble";

async function main(file: string) {
  const data = await fs.readFile(file);

  // chunk the data into 2 byte chunks
  // for each chunk, disassemble it
  for (let i = 0; i < data.length; i += 2) {
    const chunk = data.slice(i, i + 2);
    const instruction = disassemble(chunk);
    console.table(instruction);
  }
}

const file = process.argv[2];
main(file);

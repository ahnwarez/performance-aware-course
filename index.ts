import fs from "node:fs/promises";

import { disassemble } from "./disassemble";

async function main(file: string) {
  const data = await fs.readFile(file);

  const instruction = disassemble(data);

  console.log(instruction);
}

const file = process.argv[2];
main(file);

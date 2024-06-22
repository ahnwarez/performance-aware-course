import { disassemble } from "./disassemble";

function main() {
  // read from stdin and pass the buffer to disassemble

  process.stdin.on("data", (data) => {
    const output = disassemble(data);
    console.log(output?.instruction);
  });
}

main();

var addon = require("bindings")("sim8086");

for (let i = 0; i < 93; i++) {
  console.log(i, addon.getMnemonicFromOperationType(i));
}

console.log(addon.getVersion());
// console.log(addon.get8086InstructionTable());

//let table = addon.get8086InstructionTable();
//for(let i = 0; i < table.EncodingCount; i++){
//    console.log(addon.getMnemonicFromOperationType(table.Encodings[i].Op));
//    for(let j = 0; j < 16; j++){
//        console.log(table.Encodings[i].Bits[j]);
//    }
//}

let regAccess = { Index: 0, Offset: 0, Count: 0 };
console.log(addon.getRegisterNameFromOperand(regAccess));

let exampleDisassembly = [
  0x03, 0x18, 0x03, 0x5e, 0x00, 0x83, 0xc6, 0x02, 0x83, 0xc5, 0x02, 0x83, 0xc1,
  0x08, 0x03, 0x5e, 0x00, 0x03, 0x4f, 0x02, 0x02, 0x7a, 0x04, 0x03, 0x7b, 0x06,
  0x01, 0x18, 0x01, 0x5e, 0x00, 0x01, 0x5e, 0x00, 0x01, 0x4f, 0x02, 0x00, 0x7a,
  0x04, 0x01, 0x7b, 0x06, 0x80, 0x07, 0x22, 0x83, 0x82, 0xe8, 0x03, 0x1d, 0x03,
  0x46, 0x00, 0x02, 0x00, 0x01, 0xd8, 0x00, 0xe0, 0x05, 0xe8, 0x03, 0x04, 0xe2,
  0x04, 0x09, 0x2b, 0x18, 0x2b, 0x5e, 0x00, 0x83, 0xee, 0x02, 0x83, 0xed, 0x02,
  0x83, 0xe9, 0x08, 0x2b, 0x5e, 0x00, 0x2b, 0x4f, 0x02, 0x2a, 0x7a, 0x04, 0x2b,
  0x7b, 0x06, 0x29, 0x18, 0x29, 0x5e, 0x00, 0x29, 0x5e, 0x00, 0x29, 0x4f, 0x02,
  0x28, 0x7a, 0x04, 0x29, 0x7b, 0x06, 0x80, 0x2f, 0x22, 0x83, 0x29, 0x1d, 0x2b,
  0x46, 0x00, 0x2a, 0x00, 0x29, 0xd8, 0x28, 0xe0, 0x2d, 0xe8, 0x03, 0x2c, 0xe2,
  0x2c, 0x09, 0x3b, 0x18, 0x3b, 0x5e, 0x00, 0x83, 0xfe, 0x02, 0x83, 0xfd, 0x02,
  0x83, 0xf9, 0x08, 0x3b, 0x5e, 0x00, 0x3b, 0x4f, 0x02, 0x3a, 0x7a, 0x04, 0x3b,
  0x7b, 0x06, 0x39, 0x18, 0x39, 0x5e, 0x00, 0x39, 0x5e, 0x00, 0x39, 0x4f, 0x02,
  0x38, 0x7a, 0x04, 0x39, 0x7b, 0x06, 0x80, 0x3f, 0x22, 0x83, 0x3e, 0xe2, 0x12,
  0x1d, 0x3b, 0x46, 0x00, 0x3a, 0x00, 0x39, 0xd8, 0x38, 0xe0, 0x3d, 0xe8, 0x03,
  0x3c, 0xe2, 0x3c, 0x09, 0x75, 0x02, 0x75, 0xfc, 0x75, 0xfa, 0x75, 0xfc, 0x74,
  0xfe, 0x7c, 0xfc, 0x7e, 0xfa, 0x72, 0xf8, 0x76, 0xf6, 0x7a, 0xf4, 0x70, 0xf2,
  0x78, 0xf0, 0x75, 0xee, 0x7d, 0xec, 0x7f, 0xea, 0x73, 0xe8, 0x77, 0xe6, 0x7b,
  0xe4, 0x71, 0xe2, 0x79, 0xe0, 0xe2, 0xde, 0xe1, 0xdc, 0xe0, 0xda, 0xe3, 0xd8,
];

let offset = 0;
while (offset < exampleDisassembly.length) {
  let dis = addon.decode8086Instruction(exampleDisassembly.slice(offset));
  if (dis.Type != 0) {
    offset += dis.Size;
    let op = addon.getMnemonicFromOperationType(dis.Op);
    console.log("Size:", dis.Size, " Op:", op, " Flags:", dis.Flags);
    console.log(dis);
    for (let i = 0; i < dis.Operands.length; i++) {
      if (dis.Operands[i].Type == 1) {
        console.log(
          "\t",
          "Register",
          addon.getRegisterNameFromOperand(dis.Operands[i].Register),
        );
      } else if (dis.Operands[i].Type == 2) {
        console.log("\t", "Address", dis.Operands[i].Address);
      } else if (dis.Operands[i].Type == 3) {
        console.log("\t", "Immediate", dis.Operands[i].Immediate);
      }
    }
  } else {
    console.log("Unrecognized instruction");
  }
  console.log(
    "--------------------------------------------------------------------------------",
  );
}

console.log("end");

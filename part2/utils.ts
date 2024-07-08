// Function to convert float array to binary buffer
export function floatArrayToBinary(floatArray: number[]) {
  const buffer = Buffer.alloc(floatArray.length * 8) // 8 bytes per float (64-bit)
  floatArray.forEach((float, index) => {
    buffer.writeFloatLE(float, index * 8)
  })
  return buffer
}

// Function to convert binary buffer to float array
export function binaryToFloatArray(buffer: Buffer) {
  const floatArray: number[] = []
  for (let i = 0; i + 8 <= buffer.length; i += 8) {
    floatArray.push(buffer.readFloatLE(i))
  }
  return floatArray
}

export function toPairs(flattenedArray: number[]) {
  const arr = [] as number[][]

  for (let index = 0; index < flattenedArray.length; index += 4) {
    const pair = [
      flattenedArray[index],
      flattenedArray[index + 1],
      flattenedArray[index + 2],
      flattenedArray[index + 3],
    ]
    arr.push(pair)
  }

  return arr
}

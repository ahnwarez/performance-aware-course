function hot() {
  let sum = 0
  for (let i = 0; i < 1000000; i++) {
    sum += sum ^ 0xdeadbeef
  }
  return sum
}

console.log(hot())

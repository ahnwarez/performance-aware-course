import { makeProfiler } from './profiler'
import { estimateCPUTimerFreq, readCPUTimer } from './perf/os-metrics'

const cpuFreq = estimateCPUTimerFreq()

function testReduce(array: number[]) {
  return array.reduce((acc, i) => (acc as number) + (i as number), 0)
}

function testForLoop(array: number[]) {
  let sum = 0
  for (let i = 0; i < array.length; i++) {
    sum += array[i]
  }
  return sum
}

function biSum(array: number[]) {
  let sumA = 0
  let sumB = 0
  for (let i = 0; i < array.length; i += 2) {
    sumA += array[i]
    sumB += array[i + 1]
  }
  return sumA + sumB
}

function quadSum(array: number[]) {
  let sumA = 0
  let sumB = 0
  let sumC = 0
  let sumD = 0
  for (let i = 0; i < array.length; i += 4) {
    sumA += array[i]
    sumB += array[i + 1]
    sumC += array[i + 2]
    sumD += array[i + 3]
  }
  return sumA + sumB + sumC + sumD
}

function testWhileLoop(array: number[]) {
  let sum = 0
  let i = 0
  while (i < array.length) {
    sum += array[i]
    i++
  }
  return sum
}

function sumTypedArray(array: Int32Array) {
  let sum = 0
  for (let i = 0; i < array.length; i++) {
    sum += array[i]
  }
  return sum
}

function sumForOf(array: number[]) {
  let sum = 0
  for (let i of array) {
    sum += i
  }
  return sum
}

const functionsToTest = [
  { name: 'reduce', fn: testReduce },
  { name: 'for-loop', fn: testForLoop },
  { name: 'for-of', fn: sumForOf },
  { name: 'biSum', fn: biSum },
  { name: 'quadSum', fn: quadSum },
  { name: 'while-loop', fn: testWhileLoop },
  {
    name: 'typedArray',
    fn: () => {
      const initArray = new Int32Array(1_000)
      return sumTypedArray(initArray)
    },
  },
]

function runBenchmark(
  fn: { name: string; fn: (...args: any) => void },
  array: number[],
) {
  const startTime = readCPUTimer()
  let best = BigInt(Number.MAX_SAFE_INTEGER)
  let worst = BigInt(0)
  let avg = BigInt(0)
  let lastImprovement = startTime
  const tenSeconds = BigInt(10) * cpuFreq
  const profiler = makeProfiler(cpuFreq)
  let iterations = 0
  while (readCPUTimer() - lastImprovement < tenSeconds) {
    // Run for at least 10 seconds since last improvement
    profiler.beginTime(fn.name, array.length * 4)
    fn.fn(array)
    const elapsed = profiler.endTime(fn.name)

    if (elapsed < best) {
      best = elapsed
      lastImprovement = readCPUTimer()
      const { throughput } = profiler.getMetrics()
      process.stdout.write('\r\x1b[K')
      process.stdout.write(
        `   min: ${Number(best)} | max: ${Number(worst)} | throughput: ${throughput} gb/s`,
      )
    } else if (elapsed > worst) {
      worst = elapsed
    }
    iterations++
  }
}

for (let fn of functionsToTest) {
  let array = Array.from({ length: 1_000 }, (_, i) => i)
  console.log(`\n\n`)
  console.log(`============================`)
  console.log(`       ${fn.name}`)
  console.log(`============================`)
  runBenchmark(fn, array)
}

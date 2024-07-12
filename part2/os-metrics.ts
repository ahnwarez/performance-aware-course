import { performance } from 'perf_hooks'

function GetOSTimerFreq() {
  return 1_000_000_000
}

function ReadOSTimer() {
  const htTime = process.hrtime.bigint()
  return htTime
}

function readCPUTimer() {
  return performance.now()
}

function measure1() {
  const osFreq = GetOSTimerFreq()
  const osStart = ReadOSTimer()
  let osEnd = BigInt(0)
  let osElapsed = BigInt(0)
  const cpuStart = readCPUTimer()
  while (osElapsed < osFreq) {
    osEnd = ReadOSTimer()
    osElapsed = osEnd - osStart
  }

  const cpuEnd = readCPUTimer()
  const cpuElapsed = cpuEnd - cpuStart

  console.log(`os timer: ${osStart} -> ${osEnd} = ${osElapsed}`)
  console.log(`os seconds: ${osElapsed / BigInt(osFreq)}`)
  console.log(`cpu timer : ${cpuStart} -> ${cpuEnd} = ${cpuElapsed}`)
}

function estimateTimerFrequency(durationMs = 1000) {
  const startTime = process.hrtime.bigint()
  const startPerf = performance.now()

  // Busy-wait loop
  while (performance.now() - startPerf < durationMs) {
    // Do nothing, just burning CPU cycles
  }

  const endTime = process.hrtime.bigint()
  const actualDurationMs = performance.now() - startPerf

  const elapsedTicks = endTime - startTime
  const estimatedFrequency = BigInt(
    Math.round(Number(elapsedTicks) / (actualDurationMs / 1000))
  )

  return estimatedFrequency
}

// Run the estimation multiple times and take the average
function getAverageEstimatedFrequency(runs = 5, durationMs = 1000) {
  let total = BigInt(0)
  for (let i = 0; i < runs; i++) {
    total += estimateTimerFrequency(durationMs)
  }
  return total / BigInt(runs)
}

function measure2() {
  // Example usage
  const estimatedFreq = getAverageEstimatedFrequency()
  console.log(`Estimated timer frequency: ${estimatedFreq / BigInt(1e9)} GHz`)
}

measure1()
measure2()

import bindings from 'bindings'
const performanceCouter = bindings('performance_counter')

function GetOSTimerFreq() {
  return 1_000_000_000
}

function ReadOSTimer() {
  const htTime = process.hrtime.bigint()
  return htTime
}

function readCPUTimer() {
  return performanceCouter.getCounter()
}

function estimateCPUTimerFreq(millisecondsToWait = 100) {
  const osFreq = GetOSTimerFreq()
  const osStart = ReadOSTimer()
  let osEnd = BigInt(0)
  let osElapsed = BigInt(0)
  const cpuStart = readCPUTimer()
  const osWait = (osFreq * millisecondsToWait) / 1000
  while (osElapsed < BigInt(osWait)) {
    osEnd = ReadOSTimer()
    osElapsed = osEnd - osStart
  }

  if (osElapsed === BigInt(0)) {
    return 0
  }

  const cpuEnd = readCPUTimer()
  const cpuElapsed = cpuEnd - cpuStart
  const cpuFreq = (BigInt(osFreq) * BigInt(cpuElapsed)) / osElapsed

  return cpuFreq
}

const freq = estimateCPUTimerFreq()
console.log(`Estimated frequency: ${freq} ticks per second`)

import bindings from 'bindings'
const performanceCouter = bindings('performance_counter')

export function GetOSTimerFreq() {
  return 1_000_000_000
}

export function ReadOSTimer(): bigint {
  const htTime = process.hrtime.bigint()
  return htTime
}

export function readCPUTimer(): bigint {
  return performanceCouter.getCounter()
}

export function estimateCPUTimerFreq(millisecondsToWait = 100) {
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
    return BigInt(0)
  }

  const cpuEnd = readCPUTimer()
  const cpuElapsed = cpuEnd - cpuStart
  const cpuFreq = (BigInt(osFreq) * BigInt(cpuElapsed)) / osElapsed

  return cpuFreq
}

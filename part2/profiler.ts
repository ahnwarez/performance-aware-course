import { exec } from 'child_process'
import { promisify } from 'util'
import os from 'os'
import { rdtsc } from 'rdtsc'

const execAsync = promisify(exec)

async function getCPUClockSpeed(): Promise<number> {
  const platform = os.platform()

  try {
    if (platform === 'linux') {
      const { stdout } = await execAsync("lscpu | grep 'CPU MHz'")
      const match = stdout.match(/CPU MHz:\s+(\d+\.\d+)/)
      if (match && match[1]) {
        return parseFloat(match[1])
      }
    } else if (platform === 'darwin') {
      const { stdout } = await execAsync('sysctl -n hw.cpufrequency_max')
      return parseInt(stdout.trim(), 10) / 1000000 // Convert Hz to MHz
    } else if (platform === 'win32') {
      const { stdout } = await execAsync('wmic cpu get MaxClockSpeed')
      const lines = stdout.trim().split('\n')
      if (lines.length > 1) {
        return parseInt(lines[1], 10)
      }
    }
  } catch (error) {
    console.error('Error getting CPU clock speed:', error)
  }

  // Fallback to a default value or estimation
  console.warn('Could not determine CPU clock speed. Using default value.')
  return 2300 // Default to 2.3 GHz
}

interface PerformanceMetrics {
  timeElapsed: bigint
  throughput: number
  operationsPerSecond: number
}

const cpuFrequency = await getCPUClockSpeed()
console.log({
  cpuFrequency,
})

function makeObservable() {
  let start: bigint
  let _size: number
  let timeElapsed: bigint

  return Object.freeze({
    beginTime,
    endTime,
    getMetrics,
    printMetrics,
  })

  function beginTime(size: number = 0): void {
    start = rdtsc()
    _size = size
  }

  function endTime(): void {
    timeElapsed = rdtsc() - start
  }

  function getMetrics(): PerformanceMetrics {
    const elapsedSeconds = Number(timeElapsed) / (2.3 * 1e9) // Assuming 2.3 GHz CPU, adjust as needed
    return {
      timeElapsed,
      throughput: _size / elapsedSeconds,
      operationsPerSecond: _size / elapsedSeconds,
    }
  }

  function printMetrics(): void {
    const metrics = getMetrics()
    console.table({
      timeElapsed: metrics.timeElapsed.toString(),
      throughput: metrics.throughput.toFixed(2),
      operationsPerSecond: metrics.operationsPerSecond.toFixed(2),
    })
  }
}

// Example usage
const obs = makeObservable()
obs.beginTime(5000)

// Simulate some work
const result = 5 + 1
for (let index = 0; index < 5000; index++) {
  // Some operation
}

obs.endTime()
obs.printMetrics()

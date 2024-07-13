import { readCPUTimer } from './perf/os-metrics'

interface PerformanceMetrics {
  timeElapsed: bigint
  throughput: number
  operationsPerSecond: number
}

export function makeProfiler() {
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
    start = readCPUTimer()
    _size = size
  }

  function endTime(): void {
    timeElapsed = readCPUTimer() - start
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

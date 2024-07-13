import { readCPUTimer } from './perf/os-metrics'

export function makeProfiler(freq: bigint) {
  const anchors = new Map<
    string,
    { processedByteCount: number; start: bigint; elapsed?: bigint }
  >()

  return Object.freeze({
    beginTime,
    endTime,
    printMetrics,
  })

  function beginTime(label: string, byteCount: number = 0): void {
    if (anchors.has(label)) {
      throw new Error(`Label ${label} already exists`)
    }
    const start = readCPUTimer()
    anchors.set(label, { start, processedByteCount: byteCount })
  }

  function endTime(label: string): void {
    const anchor = anchors.get(label)
    if (!anchor) {
      throw new Error(`Label ${label} does not exist`)
    }
    anchor.elapsed = readCPUTimer() - anchor.start
  }

  function printMetrics() {
    let totalTimeElapsed = BigInt(0)
    const megabyte = 1024 * 1024

    const table = Array.from(anchors.entries()).map(
      ([label, { elapsed, processedByteCount }]) => {
        totalTimeElapsed += elapsed || BigInt(0)
        processedByteCount += processedByteCount
        const timeInSeconds = Number(elapsed) / Number(freq)
        const throughput =
          timeInSeconds > 0
            ? toGigabytes(processedByteCount) / timeInSeconds
            : 0
        const percent = (Number(elapsed) / Number(totalTimeElapsed)) * 100

        return {
          label,
          elapsed,
          percent: Number(percent.toFixed(2)),
          megabytes: processedByteCount / megabyte,
          throughput: throughput,
        }
      }
    )

    const totalTimeInSeconds = Number(totalTimeElapsed) / Number(freq)
    const overallThroughput = table.reduce(
      (acc, r) => acc + (r && r.throughput) || 0,
      0
    )

    console.log(
      'Total time elapsed:',
      (totalTimeInSeconds * 1000).toFixed(2),
      'ms'
    )
    console.log('Overall Throughput:', overallThroughput.toFixed(2), 'gb/s')
    console.table(table)
  }
}

function toGigabytes(bytes: number): number {
  return bytes / 1024 / 1024 / 1024
}

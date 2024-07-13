import { readCPUTimer } from './perf/os-metrics'

export function makeProfiler(freq: bigint) {
  let start: bigint

  const anchors = new Map<
    string,
    { size: number; start: bigint; elapsed?: bigint }
  >()

  return Object.freeze({
    beginTime,
    endTime,
    printMetrics,
  })

  function beginTime(label: string, sizeInBytes: number = 0): void {
    if (anchors.has(label)) {
      throw new Error(`Label ${label} already exists`)
    }
    start = readCPUTimer()
    anchors.set(label, { start, size: sizeInBytes })
  }

  function endTime(label: string): void {
    const anchor = anchors.get(label)
    if (!anchor) {
      throw new Error(`Label ${label} does not exist`)
    }
    anchor.elapsed = readCPUTimer() - BigInt(anchor.start)
  }

  function printMetrics() {
    let totalTimeElapsed = BigInt(0)
    let totalSize = 0

    const table = Array.from(anchors.entries()).map(
      ([label, { elapsed, size }]) => {
        if (elapsed) {
          totalTimeElapsed += elapsed
          totalSize += size
          const timeInSeconds = Number(elapsed) / Number(freq)
          const throughput =
            timeInSeconds > 0 ? toGigabytes(size) / timeInSeconds : 0
          const percent = (Number(elapsed) / Number(totalTimeElapsed)) * 100

          return {
            label,
            elapsed,
            percent: Number(percent.toFixed(2)),
            throughput: Number(throughput.toFixed(2)),
          }
        }
      },
    )

    const totalTimeInSeconds = Number(totalTimeElapsed) / Number(freq)
    const overallThroughput =
      totalTimeInSeconds > 0 ? toGigabytes(totalSize) / totalTimeInSeconds : 0

    console.log(
      'Total time elapsed:',
      (totalTimeInSeconds * 1000).toFixed(2),
      'ms',
    )
    console.log('Overall Throughput:', overallThroughput.toFixed(2), 'gb/s')
    console.table(table)
  }
}

function toGigabytes(bytes: number): number {
  return bytes / 1024 / 1024 / 1024
}

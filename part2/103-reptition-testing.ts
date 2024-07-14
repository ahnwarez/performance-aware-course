import fs from 'node:fs'
import path from 'node:path'

import { parse } from './parser/json-parser'
import { estimateCPUTimerFreq } from './perf/os-metrics'
import { makeProfiler } from './profiler'

const __dirname = path.dirname(new URL(import.meta.url).pathname)
const freq = estimateCPUTimerFreq()
const profiler = makeProfiler(freq)

function main() {
  const filePath = path.join(__dirname, 'data/pairs.json')
  const stat = fs.statSync(filePath)
  const inputString = fs.readFileSync(filePath, 'utf-8')

  // time to wait
  const secondsToWait = 10
  const startTimer = Date.now()
  let minElapsed = Number.MAX_VALUE
  let maxElapsed = 0
  let sumElapsed = 0
  let testsCounter = 0
  for (;;) {
    testsCounter++

    profiler.beginTime('Parse', stat.size)
    const jsonData = parse(inputString)
    const elapsed = profiler.endTime('Parse')

    minElapsed = Math.min(minElapsed, Number(elapsed))
    maxElapsed = Math.max(maxElapsed, Number(elapsed))
    sumElapsed += Number(elapsed)

    const endTimer = Date.now()
    const testElapsed = endTimer - startTimer

    if (passedWaitTime(secondsToWait, testElapsed)) break
  }

  const metrics = profiler.getMetrics()
  console.table(metrics.table)
  console.table({
    min: minElapsed / Number(freq),
    avg: sumElapsed / testsCounter / Number(freq),
    max: maxElapsed / Number(freq),
  })
}

function passedWaitTime(secondsToWait: number, timeElapsed: number) {
  return timeElapsed / 1000 > secondsToWait
}

main()

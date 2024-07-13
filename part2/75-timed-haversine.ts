import fs from 'node:fs'
import path from 'node:path'

import { parse } from './parser/json-parser'
import { ReferenceHaversine } from './haversine/haversine'
import { estimateCPUTimerFreq } from './perf/os-metrics'
import { makeProfiler } from './profiler'

const __dirname = path.dirname(new URL(import.meta.url).pathname)

function main() {
  const freq = estimateCPUTimerFreq()
  const filePath = path.join(__dirname, 'data/pairs.json')
  const stat = fs.statSync(filePath)
  console.log(`File size: ${stat.size} bytes`)
  const profiler = makeProfiler(freq)

  profiler.beginTime('Read', stat.size)
  const jsonString = fs.readFileSync(filePath, 'utf-8')
  profiler.endTime('Read')

  profiler.beginTime('Parse')
  const data = parse(jsonString)
  profiler.endTime('Parse')

  const pair = data.pairs[0]

  profiler.beginTime('Haversine')
  const haversine = ReferenceHaversine(pair.x0, pair.y0, pair.x1, pair.y1)
  profiler.endTime('Haversine')

  profiler.printMetrics()
}
main()

import fs from 'node:fs'
import path from 'node:path'

import { parse } from './parser/json-parser'
import { ReferenceHaversine } from './haversine/haversine'
import { estimateCPUTimerFreq, readCPUTimer } from './perf/os-metrics'

const __dirname = path.dirname(new URL(import.meta.url).pathname)

function printTimeElapsed(
  label: string,
  start: bigint,
  end: bigint,
  totalElapsed: bigint,
) {
  const elapsed = end - start
  const percent = (Number(elapsed) / Number(totalElapsed)) * 100
  console.log(`   ${label}: ${elapsed}ns (${percent.toFixed(2)}%)`)
}

function main() {
  const freq = estimateCPUTimerFreq()
  const appStart = readCPUTimer()
  const readStart = readCPUTimer()
  const jsonString = fs.readFileSync(
    path.join(__dirname, 'data/pairs.json'),
    'utf-8',
  )
  const readEnd = readCPUTimer()

  const parseStart = readCPUTimer()
  const data = parse(jsonString)
  const parseEnd = readCPUTimer()

  const pair = data.pairs[0]

  const haversineStart = readCPUTimer()
  const haversine = ReferenceHaversine(pair.x0, pair.y0, pair.x1, pair.y1)
  const haversineEnd = readCPUTimer()
  const appElapsed = haversineEnd - appStart

  printTimeElapsed('Read', readStart, readEnd, appElapsed)
  printTimeElapsed('Parse', parseStart, parseEnd, appElapsed)
  printTimeElapsed('Haversine', haversineStart, haversineEnd, appElapsed)
  printTimeElapsed('App', appStart, parseEnd, appElapsed)
}
main()

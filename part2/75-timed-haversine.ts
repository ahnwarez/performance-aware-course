import fs from 'node:fs'
import path from 'node:path'

import { parse } from './parser/json-parser'
import { ReferenceHaversine } from './haversine/haversine'
import { estimateCPUTimerFreq } from './perf/os-metrics'
import { makeProfiler } from './profiler'

const __dirname = path.dirname(new URL(import.meta.url).pathname)

const freq = estimateCPUTimerFreq()
const profiler = makeProfiler(freq)

function main() {
  const filePath = path.join(__dirname, 'data/pairs.json')
  const stat = fs.statSync(filePath)
  console.log(`File size: ${stat.size} bytes`)

  profiler.beginTime('Read')
  const inputString = fs.readFileSync(filePath, 'utf-8')
  profiler.endTime('Read')

  profiler.beginTime('Parse', stat.size)
  const jsonData = parse(inputString)
  // const jsonData = JSON.parse(inputString)
  const expectedSum = jsonData.expectedSum
  profiler.endTime('Parse')

  const actualSum = sumHaversineDistances(jsonData.pairs)
  console.log(`Actual sum: ${actualSum}`)
  console.log(`Expected sum: ${expectedSum}`)
  console.log(`Sum difference: ${expectedSum - actualSum}`)

  profiler.printMetrics()
}

function sumHaversineDistances(
  pairs: Array<{ x0: number; y0: number; x1: number; y1: number }>,
) {
  // 8 because each number is 8 bytes
  const sizeOfNumberType = 8
  // 4 because each pair has 4 numbers (x0, y0, x1, y1)
  const sizeOfPair = sizeOfNumberType * 4
  // bytes is the total size of the data (you can also use the size of the file)
  const bytes = pairs.length * sizeOfPair
  profiler.beginTime('Haversine', bytes)
  let sum = 0
  let sumCoef = 1 / pairs.length
  for (const pair of pairs) {
    sum += ReferenceHaversine(pair.x0, pair.y0, pair.x1, pair.y1) * sumCoef
  }
  profiler.endTime('Haversine')
  return sum
}

main()

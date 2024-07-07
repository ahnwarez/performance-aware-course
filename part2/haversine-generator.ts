import { WriteStream } from 'fs'
import fs from 'fs/promises'
import path from 'path'
import url from 'url'
import { faker } from '@faker-js/faker'

import { ReferenceHaversine } from './haversine'
import { floatArrayToBinary } from './utils'

const __dirname = path.dirname(url.fileURLToPath(import.meta.url))

function processJSON(
  pointsToGenerate: number,
  writer: WriteStream,
  seed: number,
  callback = ({ expectedSum: number }) => {}
) {
  const clusters = 6
  const clusterSize = pointsToGenerate / clusters
  let i = 0
  let expectedSum = 0
  let sumCoef = 1 / pointsToGenerate

  writer.write('{ "pairs": [') // Start the array
  write()

  function write() {
    let ok = true
    while (i < pointsToGenerate && ok) {
      i++

      const clusterIndex = Math.min(Math.floor(i / clusterSize), clusters - 1)
      const data = getRandomPair(seed, clusterIndex, clusters)

      expectedSum +=
        sumCoef * ReferenceHaversine(data.x0, data.y0, data.x1, data.y1)

      if (i === pointsToGenerate) {
        // Last time!
        writer.write(JSON.stringify(data) + '\n', 'utf8', () => {
          callback({ expectedSum })
        })
        writer.end('] }') // End the array
      } else {
        // See if we should continue, or wait.
        // Don't pass the callback, because we're not done yet.
        ok = writer.write(JSON.stringify(data, null, 2) + ',\n', 'utf8')
      }
    }
    if (i < pointsToGenerate) {
      // Had to stop early!
      // Write some more once it drains.
      writer.once('drain', write)
    }
  }
}

function processBinary(
  pointsToGenerate: number,
  writer: WriteStream,
  seed: number,
  callback = ({ expectedSum: number }) => {}
) {
  const clusters = 6
  const clusterSize = pointsToGenerate / clusters
  let i = 0
  let expectedSum = 0
  let sumCoef = 1 / pointsToGenerate

  write()

  function write() {
    let ok = true
    while (i < pointsToGenerate && ok) {
      i++

      const clusterIndex = Math.min(Math.floor(i / clusterSize), clusters - 1)
      const data = getRandomPair(seed, clusterIndex, clusters)

      expectedSum +=
        sumCoef * ReferenceHaversine(data.x0, data.y0, data.x1, data.y1)

      const buffer = floatArrayToBinary([data.x0, data.y0, data.x1, data.y1])
      if (i === pointsToGenerate) {
        // Last time!
        writer.write(buffer, () => {
          callback({ expectedSum })
        })
        writer.end('] }') // End the array
      } else {
        // See if we should continue, or wait.
        // Don't pass the callback, because we're not done yet.
        ok = writer.write(buffer)
      }
    }
    if (i < pointsToGenerate) {
      // Had to stop early!
      // Write some more once it drains.
      writer.once('drain', write)
    }
  }
}

async function main() {
  if (process.argv.length === 2) {
    console.log('Usage: tsx haversine-generator.ts seed count format')
    console.log('   tsx haversine-generator.ts 123 10000 json')
    console.log('   tsx haversine-generator.ts 123 10000 bin')
    return
  }

  const countString = process.argv[3]
  const seed = process.argv[2] ? parseInt(process.argv[2], 10) : 123
  const count = parseInt(countString, 10) || 1000
  const format = process.argv[4]

  const filePath = path.join(__dirname, 'data', `pairs.${format}`)
  const fd = await fs.open(filePath, 'w')
  const writer = fd.createWriteStream()

  if (format === 'json') {
    processJSON(count, writer, seed, (data) => {
      console.table({
        seed,
        count,
        expectedSum: data.expectedSum,
      })
      writer.close()
      fd.close()
    })
  } else {
    processBinary(count, writer, seed, (data) => {
      console.table({
        seed,
        count,
        expectedSum: data.expectedSum,
      })
      writer.close()
      fd.close()
    })
  }
}

main()

function generateLatLongBounds(seed: number, clusterCount = 6) {
  faker.seed(seed)
  return Array.from({ length: clusterCount }, () => {
    const latLowerBound = faker.number.int({ min: -90, max: 90 })
    const longLowerBound = faker.number.int({ min: -180, max: 180 })
    // Ensure the difference is always positive
    const latDifference = Math.abs(faker.number.int({ min: 0, max: 10 }))
    const longDifference = Math.abs(faker.number.int({ min: 0, max: 20 }))
    // Ensure upper bounds don't exceed the maximum values
    const latUpperBound = Math.min(latLowerBound + latDifference, 90)
    const longUpperBound = Math.min(longLowerBound + longDifference, 180)
    return {
      latLowerBound,
      latUpperBound,
      longLowerBound,
      longUpperBound,
    }
  })
}

function getRandomPair(seed: number, clusterIndex: number, clusters: number) {
  const bounds = generateLatLongBounds(seed, clusters)
  const currentBounds = bounds[clusterIndex]
  return {
    x0: faker.number.float({
      min: currentBounds.latLowerBound,
      max: currentBounds.latUpperBound,
    }),
    y0: faker.number.float({
      min: currentBounds.longLowerBound,
      max: currentBounds.longUpperBound,
    }),
    x1: faker.number.float({
      min: currentBounds.latLowerBound,
      max: currentBounds.latUpperBound,
    }),
    y1: faker.number.float({
      min: currentBounds.longLowerBound,
      max: currentBounds.longUpperBound,
    }),
  }
}

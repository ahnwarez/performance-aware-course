import { WriteStream } from 'fs'
import fs from 'fs/promises'
import path from 'path'
import url from 'url'
import { faker } from '@faker-js/faker'

import { ReferenceHaversine } from './haversine'

const __dirname = path.dirname(url.fileURLToPath(import.meta.url))
const filePath = path.join(__dirname, '/data/small.json')

function writeOneMillionTimes(count: number, writer: WriteStream, method: 'uniform' | 'cluster', seed: number, callback = ({ expectedSum: number }) => {}) {
  const clusters = 6
  const clusterSize = count / clusters
  let i = 0
  let expectedSum = 0
  let sumCoef = 1 / count
  const bounds = generateLatLongBounds(seed, clusters)

  writer.write('{ "pairs": [') // Start the array
  write()

  function write() {
    let ok = true
    while (i < count && ok) {
      i++

      let data = {
        x0: 0,
        y0: 0,
        x1: 0,
        y1: 0,
      }

      if (method === 'cluster') {
        const clusterIndex = Math.min(Math.floor(i / clusterSize), clusters - 1)
        const currentBounds = bounds[clusterIndex]
        data = {
          x0: faker.number.float({ min: currentBounds.latLowerBound, max: currentBounds.latUpperBound }),
          y0: faker.number.float({ min: currentBounds.longLowerBound, max: currentBounds.longUpperBound }),
          x1: faker.number.float({ min: currentBounds.latLowerBound, max: currentBounds.latUpperBound }),
          y1: faker.number.float({ min: currentBounds.longLowerBound, max: currentBounds.longUpperBound }),
        }
      } else {
        data = {
          x0: faker.location.latitude(),
          y0: faker.location.longitude(),
          x1: faker.location.latitude(),
          y1: faker.location.longitude(),
        }
      }

      expectedSum += sumCoef * ReferenceHaversine(data.x0, data.y0, data.x1, data.y1)
      if (i === count) {
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
    if (i < count) {
      // Had to stop early!
      // Write some more once it drains.
      writer.once('drain', write)
    }
  }
}

async function main() {
  const countString = process.argv[2]
  const method = (process.argv[3] as 'uniform' | 'cluster') || 'uniform'
  const seed = process.argv[4] ? parseInt(process.argv[4], 10) : 123
  const count = parseInt(countString, 10) || 1000
  const fd = await fs.open(filePath, 'w')
  const writer = fd.createWriteStream()

  writeOneMillionTimes(count, writer, method, seed, (data) => {
    console.table({
      method,
      seed,
      count,
      expectedSum: data.expectedSum,
    })
    writer.close()
  })
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

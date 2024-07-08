import fs from 'fs/promises'
import { binaryToFloatArray, toPairs } from './utils'
import path from 'path'
import url from 'url'
import { faker } from '@faker-js/faker'

const __dirname = path.dirname(url.fileURLToPath(import.meta.url))
// Read from file and convert back to float array
const readBuffer = await fs.readFile(path.join(__dirname, 'data', 'pairs.bin'))

const reconstructedArray = binaryToFloatArray(readBuffer)
console.log('Reconstructed array:', toPairs(reconstructedArray))

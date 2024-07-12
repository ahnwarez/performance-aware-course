import fs from 'node:fs'
import path from 'node:path'

import { parse } from './parser/json-parser'

const __dirname = path.dirname(new URL(import.meta.url).pathname)

function main() {
  const jsonString = fs.readFileSync(
    path.join(__dirname, 'data/pairs.json'),
    'utf-8',
  )

  const data = parse(jsonString)
  console.log(data)
}
main()

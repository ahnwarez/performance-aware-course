import fs from 'fs/promises'
import path from 'path'
import url from 'url'

const __dirname = path.dirname(url.fileURLToPath(import.meta.url))

async function main() {
  const countString = process.argv[2]
  const count = parseInt(countString, 10) || 1000

  const filePath = path.join(__dirname, '/data/small.json')

  const data = Array.from({ length: count }, () => ({
    x0: 0,
    y0: 0,
    x1: 100,
    y1: 100,
  }))

  await fs.writeFile(filePath, JSON.stringify(data, null, 2))
}

main()

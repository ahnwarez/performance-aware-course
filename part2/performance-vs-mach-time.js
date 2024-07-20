import { log } from 'console'
import { performance } from 'perf_hooks'
import bindings from 'bindings'
const performanceCouter = bindings('performance_counter')

let start = performance.now()
for (let i = 0; i < 1000000; i++) {
  // Do nothing
}
let end = performance.now()
log(`Time taken: ${end - start}ms`)

start = performanceCouter.getMachTimebase()
for (let i = 0; i < 1000000; i++) {
  // Do nothing
}
end = performanceCouter.getMachTimebase()
log(`Time taken: ${Number(end - start) / 1000000}ms`)

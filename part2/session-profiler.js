import inspector from 'inspector'
import fs from 'fs'
const session = new inspector.Session()
session.connect()

// Your existing code here
// ...

// Start profiling
session.post('Profiler.enable', () => {
  session.post('Profiler.start', () => {
    // Your for loop and the code you wan to profile here
    let arr = []
    for (let index = 0; index < 1000000; index++) {
      arr[index] = index
      arr[index + 1] = index + 1
      arr[index + 2] = index + 2
      arr[index + 3] = index + 3
    }

    // Stop profiling
    session.post('Profiler.stop', (err, { profile }) => {
      // Write profile to disk
      fs.writeFileSync('./profile.cpuprofile', JSON.stringify(profile))
      console.log('Profile saved to profile.cpuprofile')
      session.disconnect()
    })
  })
})

import 'regenerator-runtime/runtime.js'
import { Telemetry } from 'ibt-telemetry'
import fs from 'node:fs'

const pathToIbt = 'ibt-examples/amg.ibt'
const telemetry = await Telemetry.fromFile(pathToIbt)

const content = JSON.stringify(telemetry)

const generator = telemetry.samples();

let result = generator.next()
let sum = 0;
let samples = []

while (!result.done) {
  const sample = result.value.toJSON()
  const str = JSON.stringify(sample)

  sum += str.length
  samples.push(sample)

  result = generator.next()
}

const selectedIndexes = [0, 9, 1500, samples.length - 1]
const selectedSamples = selectedIndexes.map(index => samples[index])

fs.writeFile('./output/amg_samples.json', JSON.stringify(selectedSamples), err => {
  if (err) {
    console.error(err);
  }
})

// const telemetryId = telemetry.uniqueId()
// // telemetryId = "188953-12312494-123910230"
// console.log(telemetryId)
//
// const sessionInfo = telemetry.sessionInfo
//
// // console.log(sessionInfo)
//
// const sessions = sessionInfo.SessionInfo.Sessions[0].ResultsFastestLap
//
// console.log(sessions)
//
//
// const splitTime = sessionInfo.SplitTimeInfo.Sectors
//
// console.log(splitTime)

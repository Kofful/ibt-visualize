import 'regenerator-runtime/runtime.js'
import { Telemetry } from 'ibt-telemetry'
import fs from 'node:fs'

const pathToIbt = 'ibt-examples/practice.ibt'
const telemetry = await Telemetry.fromFile(pathToIbt)

const generator = telemetry.samples();

let result = generator.next()
let samples = {0: []}
let fastestLap = -1
let currentLap = 0
let numberOfTicksInCurrentLap = 0
let minNumberOfTicks = Infinity

while (!result.done) {
  const sample = result.value.toJSON()
  const {SessionTick, LapDist, Lat, Lon, LapBestLap, Lap, Speed, ...rest} = sample
  const compressedSample = {
    SessionTick: SessionTick.value,
    LapDist: LapDist.value,
    Lat: Lat.value,
    Lon: Lon.value,
    LapBestLap: LapBestLap.value,
    Lap: Lap.value,
    Speed: Speed.value,
  }

  // in order to calculate the lap time more accurately, add:
  //  - previous tick to the current lap
  //  - fist tick of the current lap to the previous one
  if (!samples[Lap.value] && Lap.value > 0) {
    samples[Lap.value - 1].push(compressedSample)
    samples[Lap.value] = [samples[Lap.value - 1].at(-1)]
  }

  if (Lap.value !== currentLap) {
    if (numberOfTicksInCurrentLap < minNumberOfTicks) {
      fastestLap = currentLap
      minNumberOfTicks = numberOfTicksInCurrentLap
    }

    currentLap = Lap.value
    numberOfTicksInCurrentLap = 0
  }

  numberOfTicksInCurrentLap++

  samples[Lap.value].push(compressedSample)

  result = generator.next()
}

const fastestLapSamples = samples[fastestLap]

fs.writeFile('./output/practice_fastest.json', JSON.stringify(fastestLapSamples), err => {
  if (err) {
    console.error(err);
  }
})

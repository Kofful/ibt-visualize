import fs from 'node:fs'

const data = JSON.parse(fs.readFileSync('./track-examples/red_bull_ring.json', 'utf8'))

const result = {
  outer: [],
  inner: [],
}

for (const key in data) {
  const points = data[key].trim().split(' ').filter(item => item);

  const parsedPoints = points.map(point => {
    const [lon, lat] = point.trim().split(',');

    return {
      Lat: parseFloat(lat),
      Lon: parseFloat(lon)
    };
  })

  result[key] = parsedPoints
}

fs.writeFile('./output/red_bull_ring.json', JSON.stringify(result), err => {
  if (err) {
    console.error(err);
  }
})

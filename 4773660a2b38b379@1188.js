function _1(md){return(
md`# Lap Comparison

---

### (ENG)

## Idea

This visualization is meant to display a detailed comparison of two laps from iRacing. As I managed to retrieve only the binary \`*.ibt\` files with the detailed telemetry of the whole session, I compare the best laps of two different sessions (\`*.ibt\` files). The example visualization includes the two sessions on the Red Bull Ring track (Spielberg, Austria).

## Telemetry data

I've found two proper binary files with the telemetry on the same track. The files include the track metadata (weather, race rules, driver list) that I won't use, as it's not meaningful in the context of lap comparison, and the telemetry by ticks (60 ticks per second) with 1068 different parameters each. So I selected the fastest lap (the one with the least amount of ticks) and the needed parameters, then saved them into JSON:
- \`SessionTick\` - the number of the tick counting from the session start;
- \`LapDist\` - the travel distance of the car, the progress in some way (meters);
- \`Lat\` - the latitude of the car;
- \`Lon\` - the longitude of the car;
- \`Lap\` - current lap number (used for selecting the fastest one);
- \`Speed\` - the speed of the car (meters per second);
- \`Throttle\` - the percentage of the throttle input (0..1);
- \`Brake\` - the percentage of the brake input (0..1);
- \`SteeringWheelAngle\` - the angle of the current steering wheel turn in radians;
- \`SteeringWheelAngleMax\` - the angle of the maximum steering wheel turn in radians (used for calculating the percentage of the wheel turn in order to compare relatively for potentially different cars);

## Track data

Having the track in the two files is Red Bull Ring, I manually collected the coordinates of the track limits (inner and outer ones) and the finish line. And also I manually selected some checkpoints for the segments to compare.

## Visualization

The visualization shows the comparison of the source lap and the target lap.

The track is divided into segments, and each segment of the source lap is compared to the same segment of the target lap. If the segment is completed faster in the source lap than in the target lap, the source segment is highlighted with green. Otherwise, with red. The target lap is of monotonic color because we use it only as a comparison for our source lap.

Each useful telemetry parameter is displayed in its specific chart relative to the LapDist (distance) parameter. This allows us to compare how late or how early the driver has made some actions relative to the target lap.

Ось переклад тексту українською мовою (від імені чоловіка):

---

### (UKR)

## Ідея

Ця візуалізація призначена для детального порівняння двох кіл в iRacing. Оскільки мені вдалося знайти лише бінарні файли \`*.ibt\` з детальною телеметрією всієї сесії, я порівнюю найкращі кола двох різних сесій (файлів \`*.ibt\`). Як приклад візуалізації використано дві сесії на трасі Red Bull Ring (Шпільберг, Австрія).

## Дані телеметрії

Я знайшов два підхожих бінарні файли з телеметрією на одній трасі. Файли містять метадані траси (погода, правила гонки, список пілотів), які я не використовував, оскільки вони не мають значення в контексті порівняння кіл. Також у файлах є телеметрія по тіках (60 тіків на секунду), де кожен тік містить 1068 параметрів. Тож я обрав найшвидше коло (те, що має найменшу кількість тіків) і необхідні параметри, після чого зберіг їх у форматі JSON:
* \`SessionTick\` — номер тіка, рахуючи від початку сесії;
* \`LapDist\` — пройдена машиною дистанція в метрах, свого роду прогрес (в метрах);
* \`Lat\` — широта місцезнаходження машини;
* \`Lon\` — довгота місцезнаходження машини;
* \`Lap\` — поточний номер кола (використовувався для вибору найшвидшого);
* \`Speed\` — швидкість автомобіля (в метрах на секунду);
* \`Throttle\` — відсоток натискання педалі газу (0..1);
* \`Brake\` — відсоток натискання педалі гальма (0..1);
* \`SteeringWheelAngle\` — кут повороту керма в радіанах;
* \`SteeringWheelAngleMax\` — максимальний кут повороту керма в радіанах (використовувався для розрахунку відсотка повороту керма, щоб мати можливість відносно порівняти для потенційно різних авто);

## Дані траси

Оскільки в обох файлах представлена траса Red Bull Ring, я вручну зібрав координати меж траси (внутрішніх і зовнішніх) та лінії фінішу. Також я вручну обрав контрольні точки для сегментів, які будуть порівнюватися.

## Візуалізація

Візуалізація відображає порівняння вихідного кола (source lap) та цільового кола (target lap).

Траса розділена на сегменти, і кожен сегмент вихідного кола порівнюється з відповідним сегментом цільового кола. Якщо сегмент пройдено швидше у вихідному колі, ніж у цільовому, він виділяється зеленим кольором. В іншому випадку — червоним. Цільове коло - монотонне, оскільки ми використовуємо його лише як орієнтир для порівняння нашого вихідного кола.

Кожен корисний параметр телеметрії відображається на окремому графіку відносно параметра \`LapDist\` (дистанції). Це дозволяє нам порівняти, наскільки пізніше або раніше пілот виконав певні дії порівняно з цільовим колом.`
)}

function _telemetryVisualization(d3,style,viewBox,redBullRingMap,speedGraph,throttleGraph,brakeGraph,wheelInputGraph,labelLayer)
{
  const svg = d3.create("svg")
    .attr("viewBox", `0 0 1160 1160`)
    .style("width", 1160)
    .style("height", 1160)
  
  svg.append("rect")
    .attr("width", "100%")
    .attr("height", "100%")
    .attr("fill", style.backgroundColor)
    .attr("stroke-width", 0)

  const ratio = viewBox.height / viewBox.width

  // Додаємо контейнер для треку
  const defs = svg.append("defs");

  defs.append("clipPath")
    .attr("id", "track-container")
    .append("rect")
    .attr("width",  1160)
    .attr("height", 1160 * ratio)
    .attr("rx", 50)
    .attr("ry", 50)

  // Додаємо трек
  svg.append(
    () => d3.select(redBullRingMap)
      .attr("clip-path", "url(#track-container)")
      .attr("width", 600)
      .attr("height", 600 * ratio)
      .attr("x", 10)
      .attr("y", 100)
      .node(),
  )

  // Додаємо рамку для треку
  svg.append("rect")
    .attr("fill", "none")
    .attr("stroke-width", 3)
    .attr("x", 10)
    .attr("y", 100)
    .attr("width", 600)
    .attr("height", 600 * ratio)
    .attr("stroke", style.trackBordersColor)
    .attr("rx", 25)
    .attr("ry", 25)

  // Додаємо графіки з телеметрією
  const graphs = [
    speedGraph,
    throttleGraph,
    brakeGraph,
    wheelInputGraph,
  ]

  graphs.forEach((graph, index) => {
    svg.append(
      () => d3.select(graph)
        .attr("width", 540)
        .attr("height", 135)
        .attr("x", 615)
        .attr("y", 100 + index * 140)
        .node(),
    )
  })

  // Додаємо шар з написами
  svg.append(
    () => d3.select(labelLayer)
      .node(),
  )

  return svg.node()
}


function _redBullRingMap(viewBox,d3,style,red_bull_ring,divideTelemetryIntoSectors,target,source,sectorMarks,formatDate,getTrackMarker,telemetryDistanceScale)
{
  const viewBoxWidth = viewBox.width
  const viewBoxHeight = viewBox.height
  
  const svgWidth = viewBoxWidth
  const svgHeight = viewBoxHeight

  const topLeftCoord = viewBox.topLeftCoord
  const bottomRightCoord = viewBox.bottomRightCoord
  
  // пораховані вручну
  // const topLeftCoord = {Lat: 47.22769522863094, Lon: 14.752248520713051}
  // const bottomRightCoord = {Lat: 47.217925014995197, Lon: 14.772498356701122}
  // const viewBoxWidth = 680.31
  // const viewBoxHeight = 510.24

  const svg = d3.create("svg")
    .attr("viewBox", `0 0 ${viewBoxWidth} ${viewBoxHeight}`)
    .attr("stroke-miterlimit", 10)
    .attr("width", svgWidth)
    .attr("height", svgHeight)

  const trackGroup = svg.append("g")
    .attr("stroke", "black")
    .attr("width", "100%")
    .attr("height", "100%")
    .attr("font-family", style.fontFamily)
  
  trackGroup.append("rect")
    .attr("width", viewBoxWidth)
    .attr("height", viewBoxHeight)
    .attr("fill", style.backgroundColor)
    .attr("stroke-width", 0)
  
  const xScale = d3.scaleLinear()
    .domain([topLeftCoord.Lon, bottomRightCoord.Lon])
    .range([0, viewBoxWidth])

  const yScale = d3.scaleLinear()
    .domain([topLeftCoord.Lat, bottomRightCoord.Lat])
    .range([0, viewBoxHeight])
  
  const line = d3.line()
    .x(item => xScale(item.Lon))
    .y(item => yScale(item.Lat))
  
  const pixelLine = d3.line()
    .x(item => item.x)
    .y(item => item.y)

  // Малюємо ліміти треку
  const trackOuterLimit = d3.path()

  red_bull_ring.outer.forEach((item, index) => {
    if (index === 0) {
      trackOuterLimit.moveTo(xScale(item.Lon), yScale(item.Lat))
    } else {
      trackOuterLimit.lineTo(xScale(item.Lon), yScale(item.Lat))
    }
  })
  
  trackOuterLimit.closePath()
  
  trackGroup.append("path")
    .attr("class", "track-outer")
    .attr("fill", style.trackColor)
    .attr("stroke", style.trackBordersColor)
    .attr("stroke-width", 0.5)
    .attr("d", trackOuterLimit)
  
  const trackInnerLimit = d3.path()

  red_bull_ring.inner.forEach((item, index) => {
    if (index === 0) {
      trackInnerLimit.moveTo(xScale(item.Lon), yScale(item.Lat))
    } else {
      trackInnerLimit.lineTo(xScale(item.Lon), yScale(item.Lat))
    }
  })
  
  trackInnerLimit.closePath()
  
  trackGroup.append("path")
    .attr("class", "track-inner")
    .attr("fill", style.backgroundColor)
    .attr("stroke", style.trackBordersColor)
    .attr("stroke-width", 0.5)
    .attr("d", trackInnerLimit)

  // Ділимо телеметрію на сектори
  const targetSectors = divideTelemetryIntoSectors(target)
  const sourceSectors = divideTelemetryIntoSectors(source)
  
  const sectors = sectorMarks.map((_, index) => ({
    target: targetSectors[index],
    source: sourceSectors[index],
  }));

  // Виводемо сектори відповідного кольору і написи з різницею часу
  sectors.forEach((sector, index) => {
    const sectorDiff = sector.source.length - sector.target.length
    let sectorLabel, sectorColor

    if (sectorDiff > 0) {
      sectorLabel = `+${formatDate(sectorDiff)}`
      sectorColor = style.negativeColor
    } else {
      sectorLabel = `-${formatDate(-sectorDiff)}`
      sectorColor = style.positiveColor
    }
    
    const sectorPath = trackGroup.append("path")
      .attr("class", "sector")
      .attr("id", `target-sector-${index + 1}`)
      .attr("stroke-width", 1)
      .attr("stroke", style.targetColor)
      .attr("fill", "none")
      .attr("d", line(sector.target))
    
    trackGroup.append("path")
      .attr("class", "sector")
      .attr("id", `source-sector-${index + 1}`)
      .attr("stroke-width", 1)
      .attr("stroke", sectorColor)
      .attr("fill", "none")
      .attr("d", line(sector.source))
    
    const prevPointCoord = sector.source[sector.source.length - 2]
    const lastPointCoord = sector.source[sector.source.length - 1]

    const prevPoint = {
      x: xScale(prevPointCoord.Lon),
      y: yScale(prevPointCoord.Lat),
    }
    const lastPoint = {
      x: xScale(lastPointCoord.Lon),
      y: yScale(lastPointCoord.Lat),
    }

    const sectorDelimeter = getTrackMarker(prevPoint, lastPoint)
    
    trackGroup.append("path")
      .attr("class", "sector-end")
      .attr("stroke-width", style.trackMarkerWidth)
      .attr("stroke", style.sectorDelimeterColor)
      .attr("fill", "none")
      .attr("d", pixelLine(sectorDelimeter))

    const pathNode = sectorPath.node()
    const middle = pathNode.getTotalLength() / 2
    const pathMiddleCoords = pathNode.getPointAtLength(middle)

    const p1 = pathNode.getPointAtLength(middle - 1)
    const p2 = pathNode.getPointAtLength(middle + 1)
    
    let angleRad = Math.atan2(p2.y - p1.y, p2.x - p1.x)
    let labelMargin = -15

    if (Math.abs(angleRad) > Math.PI / 2) {
      angleRad += Math.PI
      labelMargin *= -2;
    }

    const angleDeg = angleRad * 180 / Math.PI
    
    trackGroup.append("text")
      .attr("dy", labelMargin)
      .attr("x", pathMiddleCoords.x)
      .attr("y", pathMiddleCoords.y)
      .attr("class", "sector-label")
      .attr("fill", sectorColor)
      .attr("stroke", "none")
      .attr("text-anchor", "middle")
      .attr("font-size", 16)
      .attr("transform", `rotate(${angleDeg}, ${pathMiddleCoords.x}, ${pathMiddleCoords.y})`)
      .text(sectorLabel)
  })
  
  // Малюємо фінішну пряму
  const finishLine = red_bull_ring.finish.map(coords => ({
    x: xScale(coords.Lon),
    y: yScale(coords.Lat),
  }))

  const finishAngle = Math.atan2(finishLine[1].y - finishLine[0].y, finishLine[1].x - finishLine[0].x) + Math.PI / 2
  
  finishLine[0].x = finishLine[0].x - Math.sin(finishAngle) * 5
  finishLine[0].y = finishLine[0].y + Math.cos(finishAngle) * 5
  
  finishLine[1].x = finishLine[1].x + Math.sin(finishAngle) * 5
  finishLine[1].y = finishLine[1].y - Math.cos(finishAngle) * 5
  
  trackGroup.append("path")
    .attr("class", "finish")
    .attr("stroke-width", 3.5)
    .attr("stroke", "white")
    .attr("fill", "none")
    .attr("d", pixelLine(finishLine))
  
  trackGroup.append("path")
    .attr("class", "finish")
    .attr("stroke-width", 3)
    .attr("stroke", "black")
    .attr("stroke-dasharray", 3)
    .attr("fill", "none")
    .attr("d", pixelLine(finishLine))

  // Додаємо інтерактивний елемент для збільшення при наведенні курсору
  svg.append("defs")
    .append("clipPath")
    .attr("id", "magnifier")
    .append("circle")
    .attr("class", "magnifier")
    .attr("r", 0)

  const magnifiedTrackGroup = trackGroup.clone(true)
      .attr("clip-path", "url(#magnifier)")
  
  svg.append(
    () => magnifiedTrackGroup.node()
  )
  
  svg
    .append("rect")
    .attr("fill", "none")
    .attr("pointer-events", "all")
    .attr("width", "100%")
    .attr("height", "100%")
    .on("mousemove", onMouseMove)
    .on("mouseleave", onMouseLeave)
  
  svg
    .append("circle")
    .attr("class", "magnifier-radius")
    .attr("stroke-width", "3")
    .attr("stroke", style.magnifierColor)
    .attr("fill", "none")
    .attr("r", 0)
  
  function onMouseLeave(event) {
    svg.selectAll("circle.magnifier")
      .attr("r", 0)
    svg.selectAll("circle.magnifier-radius")
      .attr("r", 0)
    
    d3.selectAll("g.telemetry-container")
      .selectAll("line.telemetry-selection")
      .attr("opacity", 0)
  }

  function onMouseMove(event) {
    const scale = 2;
    const magnifierRadius = 100

    const [xm, ym] = d3.pointer(event)
    const x = xm - xm * scale
    const y = ym - ym * scale
    
    magnifiedTrackGroup.attr("transform", `translate(${x}, ${y}) scale(${scale})`)

    svg.selectAll("circle.magnifier")
      .attr("cx", xm)
      .attr("cy", ym)
      .attr("r", magnifierRadius / scale)

    svg.selectAll("circle.magnifier-radius")
      .attr("cx", xm)
      .attr("cy", ym)
      .attr("r", magnifierRadius)

    let minDist = Infinity
    let closestRoutePoint = {}
    
    source.forEach((tick, index) => {
      const x = xScale(tick.Lon)
      const y = yScale(tick.Lat)
      const xDiff = xm - x;
      const yDiff = ym - y;

      const dist = Math.sqrt(xDiff * xDiff + yDiff * yDiff)

      if (dist < minDist) {
        minDist = dist
        closestRoutePoint = {
          ...tick,
          x,
          y,
          index,
        }
      }
    })

    const prevPointIndex = closestRoutePoint.index === 0 ? source.length - 1 : closestRoutePoint.index - 1;

    const prevClosestRoutePoint = {
      x: xScale(source[prevPointIndex].Lon),
      y: yScale(source[prevPointIndex].Lat),
    }

    const trackMarker = getTrackMarker(prevClosestRoutePoint, closestRoutePoint)
    
    trackGroup.selectAll("path.track-selection")
      .data([trackMarker])
      .join("path")
      .attr("class", "track-selection")
      .attr("stroke-width", style.trackMarkerWidth)
      .attr("stroke", "white")
      .attr("fill", "none")
      .attr("d", marker => pixelLine(marker))

    magnifiedTrackGroup.selectAll("path.track-selection")
      .data([trackMarker])
      .join("path")
      .attr("class", "track-selection")
      .attr("stroke-width", style.trackMarkerWidth)
      .attr("stroke", "white")
      .attr("fill", "none")
      .attr("d", marker => pixelLine(marker))

    d3.selectAll("g.telemetry-container")
      .selectAll("line.telemetry-selection")
      .data([closestRoutePoint])
      .join("line")
      .attr("class", "telemetry-selection")
      .attr("stroke", "white")
      .attr("stroke-width", 2)
      .attr("stroke-dasharray", "10, 5")
      .attr("opacity", 1)
      .attr("y1", 0)
      .attr("y2", style.telemetryChartHeight)
      .attr("x1", item => telemetryDistanceScale(item.LapDist))
      .attr("x2", item => telemetryDistanceScale(item.LapDist))
  }

  return svg.node()
}


function _speedGraph(d3,style,target,source,telemetryDistanceScale,trackLength)
{
  const svg = d3.create("svg")
    .attr("viewBox", `0 0 ${style.telemetryContainerWidth} ${style.telemetryContainerHeight}`)
    .attr("width", style.telemetryContainerWidth)
    .attr("height", style.telemetryContainerHeight)

  const getSpeed = tick => ({
    Speed: tick.Speed * 3600 / 1000,
    LapDist: tick.LapDist,
  })
  
  const targetSpeed = {data: target.map(getSpeed), color: style.targetColor}
  const sourceSpeed = {data: source.map(getSpeed), color: style.regularColor}
  
  const [minSpeed, maxSpeed] = d3.extent(targetSpeed.data.concat(sourceSpeed.data).map(tick => tick.Speed))
  
  const yScale = d3.scaleLinear()
    .domain([maxSpeed * 1.05, minSpeed / 1.05])
    .range([0, style.telemetryChartHeight])
  
  const line = d3.line()
    .x(item => telemetryDistanceScale(item.LapDist))
    .y(item => yScale(item.Speed))
  
  const xAxis = d3.axisBottom(telemetryDistanceScale)
    .tickSize(-style.telemetryChartHeight)
    .tickPadding(7)
    .ticks(10);
  const yAxis = d3.axisLeft(yScale)
    .tickSize(-style.telemetryChartWidth)
    .tickPadding(5)
    .ticks(5);
  
  svg.append("g")
    .attr('class', "x-axis")
    .attr('transform', `translate(${style.telemetryPadding.x}, ${style.telemetryContainerHeight - style.telemetryPadding.y})`)
    .call(xAxis)  

  svg.append("g")
    .attr('class', "y-axis")
    .attr('transform', `translate(${style.telemetryPadding.x}, 0)`)
    .call(yAxis)
  
  svg.append("g")
    .attr("class", "telemetry-container")
    .attr("stroke", style.speedColor)
    .attr('transform', `translate(${style.telemetryPadding.x}, 0)`)
    .selectAll("path") 
    .data([targetSpeed, sourceSpeed]) 
    .join("path")
    .attr("d", item => line(item.data.slice(1, -1)))
    .attr("fill", "none")
    .attr("stroke", item => item.color)
    .attr("stroke-width", style.telemetryLineStroke)

  svg.selectAll(".domain")
    .style("stroke", style.speedColor)
    .style("stroke-width", 2)

  svg.selectAll(".tick line")
    .style("stroke", style.speedColor)

  svg.selectAll(".tick text")
    .style("fill", style.speedColor)
    .style("font-size", 18)
    .style("margin-top", 5)

  svg.selectAll(".axis line")
    .style("stroke", style.speedColor)

  svg.append("text")
    .attr("fill", style.speedColor)
    .text("Speed, km/h")
    .attr('text-anchor', "middle")
    .attr("font-size", 20)
    .attr("transform", `translate(15, ${yScale((maxSpeed + minSpeed) / 2)}) rotate(-90)`)

  svg.append("text")
    .attr("fill", style.speedColor)
    .text("Distance, m")
    .attr('text-anchor', "middle")
    .attr("font-size", 20)
    .attr("transform", `translate(${telemetryDistanceScale(trackLength / 2) + style.telemetryPadding.x}, ${style.telemetryContainerHeight - 10})`)

  return svg.node()
}


function _throttleGraph(d3,style,target,source,telemetryDistanceScale,trackLength)
{
  const svg = d3.create("svg")
    .attr("viewBox", `0 0 ${style.telemetryContainerWidth} ${style.telemetryContainerHeight}`)
    .attr("width", style.telemetryContainerWidth)
    .attr("height", style.telemetryContainerHeight)

  const getThrottle = tick => ({
    Throttle: tick.Throttle,
    LapDist: tick.LapDist,
  })
  
  const targetThrottle = {data: target.map(getThrottle), color: style.targetColor}
  const sourceThrottle = {data: source.map(getThrottle), color: style.regularColor}
    
  const yScale = d3.scaleLinear()
    .domain([1.05, 0])
    .range([0, style.telemetryChartHeight])
  
  const line = d3.line()
    .x(item => telemetryDistanceScale(item.LapDist))
    .y(item => yScale(item.Throttle))
  
  const xAxis = d3.axisBottom(telemetryDistanceScale)
    .tickSize(-style.telemetryChartHeight)
    .tickPadding(7)
    .ticks(10);
  const yAxis = d3.axisLeft(yScale)
    .tickSize(-style.telemetryChartWidth)
    .tickPadding(5)
    .ticks(5);
  
  svg.append("g")
    .attr('class', "x-axis")
    .attr('transform', `translate(${style.telemetryPadding.x}, ${style.telemetryContainerHeight - style.telemetryPadding.y})`)
    .call(xAxis)  

  svg.append("g")
    .attr('class', "y-axis")
    .attr('transform', `translate(${style.telemetryPadding.x}, 0)`)
    .call(yAxis)
  
  svg.append("g")
    .attr("class", "telemetry-container")
    .attr("stroke", style.throttleColor)
    .attr('transform', `translate(${style.telemetryPadding.x}, 0)`)
    .selectAll("path") 
    .data([targetThrottle, sourceThrottle]) 
    .join("path")
    .attr("d", item => line(item.data.slice(1, -1)))
    .attr("fill", "none")
    .attr("stroke", item => item.color)
    .attr("stroke-width", style.telemetryLineStroke)

  svg.selectAll(".domain")
    .style("stroke", style.throttleColor)
    .style("stroke-width", 2)

  svg.selectAll(".tick line")
    .style("stroke", style.throttleColor)

  svg.selectAll(".tick text")
    .style("fill", style.throttleColor)
    .style("font-size", 18)
    .style("margin-top", 5)

  svg.selectAll(".axis line")
    .style("stroke", style.throttleColor)

  svg.append("text")
    .attr("fill", style.throttleColor)
    .text("Throttle, %")
    .attr('text-anchor', "middle")
    .attr("font-size", 20)
    .attr("transform", `translate(15, ${yScale(0.5)}) rotate(-90)`)

  svg.append("text")
    .attr("fill", style.throttleColor)
    .text("Distance, m")
    .attr('text-anchor', "middle")
    .attr("font-size", 20)
    .attr("transform", `translate(${telemetryDistanceScale(trackLength / 2) + style.telemetryPadding.x}, ${style.telemetryContainerHeight - 10})`)

  return svg.node()
}


function _brakeGraph(d3,style,target,source,telemetryDistanceScale,trackLength)
{
  const svg = d3.create("svg")
    .attr("viewBox", `0 0 ${style.telemetryContainerWidth} ${style.telemetryContainerHeight}`)
    .attr("width", style.telemetryContainerWidth)
    .attr("height", style.telemetryContainerHeight)

  const getBrake = tick => ({
    Brake: tick.Brake,
    LapDist: tick.LapDist,
  })
  
  const targetBrake = {data: target.map(getBrake), color: style.targetColor}
  const sourceBrake = {data: source.map(getBrake), color: style.regularColor}
    
  const yScale = d3.scaleLinear()
    .domain([1.05, 0])
    .range([0, style.telemetryChartHeight])
  
  const line = d3.line()
    .x(item => telemetryDistanceScale(item.LapDist))
    .y(item => yScale(item.Brake))
  
  const xAxis = d3.axisBottom(telemetryDistanceScale)
    .tickSize(-style.telemetryChartHeight)
    .tickPadding(7)
    .ticks(10);
  const yAxis = d3.axisLeft(yScale)
    .tickSize(-style.telemetryChartWidth)
    .tickPadding(5)
    .ticks(5);
  
  svg.append("g")
    .attr('class', "x-axis")
    .attr('transform', `translate(${style.telemetryPadding.x}, ${style.telemetryContainerHeight - style.telemetryPadding.y})`)
    .call(xAxis)  

  svg.append("g")
    .attr('class', "y-axis")
    .attr('transform', `translate(${style.telemetryPadding.x}, 0)`)
    .call(yAxis)
  
  svg.append("g")
    .attr("class", "telemetry-container")
    .attr('transform', `translate(${style.telemetryPadding.x}, 0)`)
    .selectAll("path") 
    .data([targetBrake, sourceBrake]) 
    .join("path")
    .attr("d", item => line(item.data.slice(1, -1)))
    .attr("fill", "none")
    .attr("stroke", item => item.color)
    .attr("stroke-width", style.telemetryLineStroke)

  svg.selectAll(".domain")
    .style("stroke", style.brakeColor)
    .style("stroke-width", 2)

  svg.selectAll(".tick line")
    .style("stroke", style.brakeColor)

  svg.selectAll(".tick text")
    .style("fill", style.brakeColor)
    .style("font-size", 18)
    .style("margin-top", 5)

  svg.selectAll(".axis line")
    .style("stroke", style.brakeColor)

  svg.append("text")
    .attr("fill", style.brakeColor)
    .text("Brake, %")
    .attr('text-anchor', "middle")
    .attr("font-size", 20)
    .attr("transform", `translate(15, ${yScale(0.5)}) rotate(-90)`)

  svg.append("text")
    .attr("fill", style.brakeColor)
    .text("Distance, m")
    .attr('text-anchor', "middle")
    .attr("font-size", 20)
    .attr("transform", `translate(${telemetryDistanceScale(trackLength / 2) + style.telemetryPadding.x}, ${style.telemetryContainerHeight - 10})`)

  return svg.node()
}


function _wheelInputGraph(d3,style,target,source,telemetryDistanceScale,trackLength)
{
  const svg = d3.create("svg")
    .attr("viewBox", `0 0 ${style.telemetryContainerWidth} ${style.telemetryContainerHeight}`)
    .attr("width", style.telemetryContainerWidth)
    .attr("height", style.telemetryContainerHeight)

  const getWheelInput = tick => ({
    WheelInput: tick.SteeringWheelAngle / tick.SteeringWheelAngleMax,
    LapDist: tick.LapDist,
  })
  
  const targetWheelInput = {data: target.map(getWheelInput), color: style.targetColor}
  const sourceWheelInput = {data: source.map(getWheelInput), color: style.regularColor}
  
  const maxAbsoluteWheelInput = d3.max(targetWheelInput.data.concat(sourceWheelInput.data).map(tick => Math.abs(tick.WheelInput)))
    
  const yScale = d3.scaleLinear()
    .domain([maxAbsoluteWheelInput * 1.05, -maxAbsoluteWheelInput * 1.05])
    .range([0, style.telemetryChartHeight])
  
  const line = d3.line()
    .x(item => telemetryDistanceScale(item.LapDist))
    .y(item => yScale(item.WheelInput))
  
  const xAxis = d3.axisBottom(telemetryDistanceScale)
    .tickSize(-style.telemetryChartHeight)
    .tickPadding(7)
    .ticks(10);
  const yAxis = d3.axisLeft(yScale)
    .tickSize(-style.telemetryChartWidth)
    .tickPadding(5)
    .ticks(5);
  
  svg.append("g")
    .attr('class', "x-axis")
    .attr('transform', `translate(${style.telemetryPadding.x}, ${style.telemetryContainerHeight - style.telemetryPadding.y})`)
    .call(xAxis)  

  svg.append("g")
    .attr('class', "y-axis")
    .attr('transform', `translate(${style.telemetryPadding.x}, 0)`)
    .call(yAxis)
  
  svg.append("g")
    .attr("class", "telemetry-container")
    .attr('transform', `translate(${style.telemetryPadding.x}, 0)`)
    .selectAll("path") 
    .data([targetWheelInput, sourceWheelInput]) 
    .join("path")
    .attr("d", item => line(item.data.slice(1, -1)))
    .attr("fill", "none")
    .attr("stroke", item => item.color)
    .attr("stroke-width", style.telemetryLineStroke)

  svg.selectAll(".domain")
    .style("stroke", style.steeringWheelColor)
    .style("stroke-width", 2)

  svg.selectAll(".tick line")
    .style("stroke", style.steeringWheelColor)

  svg.selectAll(".tick text")
    .style("fill", style.steeringWheelColor)
    .style("font-size", 18)
    .style("margin-top", 5)

  svg.selectAll(".axis line")
    .style("stroke", style.steeringWheelColor)

  svg.append("text")
    .attr("fill", style.steeringWheelColor)
    .text("Steering Input, %")
    .attr('text-anchor', "middle")
    .attr("font-size", 20)
    .attr("transform", `translate(15, ${yScale(0)}) rotate(-90)`)

  svg.append("text")
    .attr("fill", style.steeringWheelColor)
    .text("Distance, m")
    .attr('text-anchor', "middle")
    .attr("font-size", 20)
    .attr("transform", `translate(${telemetryDistanceScale(trackLength / 2) + style.telemetryPadding.x}, ${style.telemetryContainerHeight - 10})`)

  return svg.node()
}


function _labelLayer(d3,source,target,formatDate,style,viewBox)
{
  const svg = d3.create("svg")
    .attr("viewBox", `0 0 1160 1160`)
    .attr("stroke-miterlimit", 10)
    .attr("width", 1160)
    .attr("height", 1160)
  
  // Додаємо всі написи вгорі
  const lapDiff = source.length - target.length
  let lapDiffLabel, lapDiffColor

  if (lapDiff > 0) {
    lapDiffLabel = `+${formatDate(lapDiff, "%-M:%S.%L")}`
    lapDiffColor = style.negativeColor
  } else {
    lapDiffLabel = `-${formatDate(-lapDiff, "%-M:%S.%L")}`
    lapDiffColor = style.positiveColor
  }

  const labelGroup = svg.append("g")
    .attr("stroke", "none")
    .attr("fill", style.regularColor)
    .attr("font-family", style.fontFamily)
  
  labelGroup.append("text")
    .attr("font-size", "40")
    .text("Red Bull Ring")
    .attr("x", "100%")
    .attr("dx", "-20")
    .attr("text-anchor", "end")
    .attr("y", "45")
  
  labelGroup.append("text")
    .attr("fill", style.targetColor)
    .attr("font-size", "32")
    .text("Target:")
    .attr("x", "30")
    .attr("y", "30")
    .append("tspan")
    .text(formatDate(target.length, "%M:%S.%L"))
  
  labelGroup.append("text")
    .attr("stroke", "none")
    .attr("font-size", "32")
    .text("Source:")
    .attr("x", "30")
    .attr("y", "60")
    .append("tspan")
    .text(formatDate(source.length, "%M:%S.%L"))
    .append("tspan")
    .attr("fill", lapDiffColor) 
    .attr("font-size", "22")
    .text(`(${lapDiffLabel})`)

  // Додаємо легенду
  const pixelLine = d3.line()
    .x(item => item.x)
    .y(item => item.y)

  const legendColors = [
    {
      color: style.sectorDelimeterColor,
      label: "Sector start/end",
    },
    {
      color: style.targetColor,
      label: "Target telemetry",
    },
    {
      color: style.regularColor,
      label: "Source telemetry",
    },
    {
      color: style.positiveColor,
      label: "Fast segment",
    },
    {
      color: style.negativeColor,
      label: "Slow segment",
    },
  ]

  const ratio = viewBox.height / viewBox.width
  const yStart = 600 * ratio + 130

  labelGroup.selectAll()
    .data(legendColors)
    .join("path")
    .attr("stroke-width", style.legendMarkerWidth)
    .attr("stroke", item => item.color)
    .attr("fill", "none")
    .attr("d", (item, index) => pixelLine([
      {
        x: 30,
        y: yStart + index * 20,
      },
      {
        x: 50,
        y: yStart + index * 20,
      }
    ]))

  labelGroup.selectAll()
    .data(legendColors)
    .join("text")
    .attr("x", 60)
    .attr("y", (item, index) => yStart + index * 20 + 5)
    .text(item => item.label)
  
  labelGroup.append("path")
    .attr("stroke-width", style.legendMarkerWidth + 1)
    .attr("stroke", "white")
    .attr("fill", "none")
    .attr("d", pixelLine([
      {
        x: 30,
        y: yStart + 100,
      },
      {
        x: 50,
        y: yStart + 100,
      },
    ]))
  
  labelGroup.append("path")
    .attr("stroke-width", style.legendMarkerWidth)
    .attr("stroke", "black")
    .attr("stroke-dasharray", 3)
    .attr("fill", "none")
    .attr("d", pixelLine([
      {
        x: 32,
        y: yStart + 100,
      },
      {
        x: 48,
        y: yStart + 100,
      },
    ]))

  labelGroup.append("text")
    .attr("x", 60)
    .attr("y", yStart + 105)
    .text("Finish line")

  return svg.node()
}


function _viewBox(red_bull_ring,d3)
{
  const trackLatitudes = red_bull_ring.outer.map(item => item.Lat)
  const trackLongitudes = red_bull_ring.outer.map(item => item.Lon)
  
  const topLeftCoordLat = d3.max(trackLatitudes)
  const topLeftCoordLon = d3.min(trackLongitudes)
  const bottomRightCoordLat = d3.min(trackLatitudes)
  const bottomRightCoordLon = d3.max(trackLongitudes)

  const latDiff = topLeftCoordLat - bottomRightCoordLat
  const lonDiff = bottomRightCoordLon - topLeftCoordLon
  
  const topLeftCoord = {Lat: topLeftCoordLat + latDiff * 0.05, Lon: topLeftCoordLon - lonDiff * 0.05}
  const bottomRightCoord = {Lat: bottomRightCoordLat - latDiff * 0.05, Lon: bottomRightCoordLon + lonDiff * 0.05}

  const toRad = degree => (degree * Math.PI / 180)
    
  const lat1 = toRad(topLeftCoord.Lat)
  const lon1 = toRad(topLeftCoord.Lon)
  const lat2 = toRad(bottomRightCoord.Lat)
  const lon2 = toRad(bottomRightCoord.Lon)
    
  const { sin, cos, sqrt, atan2 } = Math
    
  const R = 6371
  
  const dLat = lat2 - lat1
  const dLon = lon2 - lon1
  
  const latA = sin(dLat / 2) * sin(dLat / 2)
  const latC = 2 * atan2(sqrt(latA), sqrt(1 - latA))
  const latDist = R * latC;
  
  const lonA = cos(lat1) * cos(lat1) * sin(dLon / 2) * sin(dLon / 2)
  const lonC = 2 * atan2(sqrt(lonA), sqrt(1 - lonA))
  const lonDist = R * lonC
  
  const viewBoxWidth = latDist > lonDist ? 1160 / latDist * lonDist : 1160
  const viewBoxHeight = latDist > lonDist ? 1160 : 1160 / lonDist * latDist

  return {
    width: viewBoxWidth,
    height: viewBoxHeight,
    topLeftCoord,
    bottomRightCoord,
  }
}


function _style(){return(
{
  fontFamily: "monospace",
  regularColor: "#00eaff",
  backgroundColor: "#0a0e1a",
  targetColor: "lightsalmon",
  negativeColor: "#ff2d6b",
  positiveColor: "#00ff9f",
  trackBordersColor: "#5a6280",
  trackColor: "#1a1f35",
  sectorDelimeterColor: "#6a7fd0",
  magnifierColor: "#e0ff00",
  speedColor: "yellow",
  throttleColor: "lime",
  brakeColor: "#bf5fff",
  steeringWheelColor: "lightblue",
  trackMarkerWidth: 2,
  legendMarkerWidth: 3,
  telemetryLineStroke: 3,
  telemetryContainerWidth: 1200,
  telemetryContainerHeight: 300,
  telemetryPadding: {
    x: 60,
    y: 60,
  },
  telemetryChartWidth: 1200 - 60 * 2,
  telemetryChartHeight: 300 - 60,
}
)}

function _telemetryDistanceScale(d3,trackLength,style){return(
d3.scaleLinear()
    .domain([0, trackLength])
    .range([0, style.telemetryChartWidth])
)}

function _divideTelemetryIntoSectors(sectorMarks){return(
function (telemetry) {
  const sectors = []
  let sectorIndex = 0

  telemetry.forEach((tick, index) => {
    if (tick.LapDist >= sectorMarks[sectorIndex] && index !== 0) {
      sectorIndex++
    }

    if (!sectors[sectorIndex]) {
      sectors[sectorIndex] = []
    }

    sectors[sectorIndex].push(tick)
  })

  return sectors
}
)}

function _getTrackMarker(){return(
function (prevPoint, currentPoint) {
    const angle = Math.atan2(currentPoint.y - prevPoint.y, currentPoint.x - prevPoint.x) + Math.PI

    return [
      {
        x: currentPoint.x + Math.sin(angle) * 5,
        y: currentPoint.y - Math.cos(angle) * 5,
      },
      {
        x: currentPoint.x - Math.sin(angle) * 5,
        y: currentPoint.y + Math.cos(angle) * 5,
      },
    ]
}
)}

function _formatDate(d3){return(
function (ticks, format = "%-S.%L") {
  return d3.utcFormat(format)(new Date(Math.round(ticks / 60 * 1000)))
}
)}

function _trackLength(d3,target,source){return(
d3.max(target.concat(source).map(item => item.LapDist))
)}

function _target(practice_fastest){return(
practice_fastest
)}

function _source(race_fastest){return(
race_fastest
)}

function _sectorMarks(red_bull_ring){return(
red_bull_ring.sectorMarks.concat([Infinity])
)}

function _practice_fastest(FileAttachment){return(
FileAttachment("practice_fastest.json").json()
)}

function _race_fastest(FileAttachment){return(
FileAttachment("race_fastest.json").json()
)}

function _red_bull_ring(FileAttachment){return(
FileAttachment("red_bull_ring.json").json()
)}

function _junk()
{
  // --- PATHS INSIDE (Tracks) ---
  const trackPaths = [
    { sw: "7.34", d: "m 567.8,358.72 c -53.51,13.54 -107.02,27.08 -160.52,40.62 -35.64,8.84 -71.28,17.68 -106.91,26.52 -4.14,0.89 -8.94,2.64 -12.83,0.72 0,0 -5.38,-9.78 -8.59,-15.72 0,0 -8.42,-14.01 -28.68,-39.41 L 227.41,339.32 150.03,185.06 66.76,89.44 c 0,0 -12.1,-11.72 5.12,-15.45 l 71.9,-1.78 50.21,9.54 74.62,13.62 68.35,6.9 71,5.47 c 0,0 17.91,3.77 10.13,21.5 0,0 -20.97,41.77 -67.85,47.33 0,0 -11.52,4.11 -62.17,-5.78 0,0 -35.54,-11.84 -52.46,-3.75 0,0 -23.63,9.48 -22.24,35.47 0,0 0.55,6.14 4.24,13.73 l 34.09,63.28 c 0,0 20.22,23.16 47.47,5.5 l 33.29,-34.78 c 0,0 16.16,-11.77 37.62,-13.2 l 166.05,0.37 39.91,0.02 c 0,0 15.67,0.35 21.71,14.72 l 18.32,69.16 c 0,0 4.4,12.13 -8.65,18.49 z" },
    { sw: "4.04", d: "m 607.54,286.48 -2.58,31.69 c 0,0 0.35,5.92 -6.54,11.56 0,0 -16.75,11.46 -27.2,16.04 l -106.36,25.93 -72.82,19.23 -85,21.35 -5.52,1.68 c 0,0 -10.41,0.51 -17.01,-12.01 0,0 -6.32,-9.86 -15.95,-16.59 L 253.48,374.7" },
  ];
  
  // trackGroup.selectAll("path.track")
  //   .data(trackPaths)
  //   .join("path")
  //   .attr("class", "track")
  //   .attr("fill", "none")
  //   .attr("stroke", "black")
  //   .attr("stroke-width", item => item.sw * 1.3)
  //   .attr("d", d => d.d);
  
  // trackGroup.selectAll("path.track-limit")
  //   .data(trackPaths)
  //   .join("path")
  //   .attr("class", "track-limit")
  //   .attr("fill", "none")
  //   .attr("stroke", "lightgrey")
  //   .attr("stroke-width", item => item.sw)
  //   .attr("d", item => item.d);

  // top left corner of the track (outside of the track limits)

  // trackGroup.append("path")
  //   .attr("fill", "none")
  //   .attr("stroke", "red")
  //   .attr("stroke-width", 2)
  //   .attr("d", "m 567.8,358.72 c -53.51,13.54 -107.02,27.08 -160.52,40.62 -35.64,8.84 -71.28,17.68 -106.91,26.52 -4.14,0.89 -8.94,2.64 -12.83,0.72 0,0 -5.38,-9.78 -8.59,-15.72 0,0 -8.42,-14.01 -28.68,-39.41 L 227.41,339.32 150.03,185.06 66.76,89.44 l 0,0 -12.1,-11.72 5,0.92")
  // 
  // trackGroup.append("circle")
  //   .attr("fill", "yellow")
  //   .attr("stroke", "none")
  //   .attr("r", 3)
  //   .attr("cx", 54.66)
  //   .attr("cy", 77.72)


  //bottom right corner of the track (outside of the track limits)
  
  // trackGroup.append("path")
  //   .attr("fill", "none")
  //   .attr("stroke", "red")
  //   .attr("stroke-width", 2)
  //   .attr("d", "m 567.8,358.72 c -53.51,13.54 -107.02,27.08 -160.52,40.62 -35.64,8.84 -71.28,17.68 -106.91,26.52 -4.14,0.89 -8.94,2.64 -12.83,0.72 0,0 -5.38,-9.78 -8.59,-15.72 0,0 -8.42,-14.01 -28.68,-39.41 L 227.41,339.32 150.03,185.06 66.76,89.44 c 0,0 -12.1,-11.72 5.12,-15.45 l 71.9,-1.78 50.21,9.54 74.62,13.62 68.35,6.9 71,5.47 c 0,0 17.91,3.77 10.13,21.5 0,0 -20.97,41.77 -67.85,47.33 0,0 -11.52,4.11 -62.17,-5.78 0,0 -35.54,-11.84 -52.46,-3.75 0,0 -23.63,9.48 -22.24,35.47 0,0 0.55,6.14 4.24,13.73 l 34.09,63.28 c 0,0 20.22,23.16 47.47,5.5 l 33.29,-34.78 c 0,0 16.16,-11.77 37.62,-13.2 l 166.05,0.37 39.91,0.02 c 0,0 15.67,0.35 21.71,14.72 l 18.32,69.16 l 4.4,12.13")

  // trackGroup.append("circle")
  //   .attr("fill", "yellow")
  //   .attr("stroke", "none")
  //   .attr("r", 3)
  //   .attr("cx", 620.47)
  //   .attr("cy", 333.44)
  
  //5,0.92 - relative distance from the outer coordinate on the curve to the inner border of the track
  //21.7666666667 - distance in meters
  //47.226207025033084, 14.753875508461443 - coordinates of the outer top left location (ouside of the actual track)

  // 47.2213104292528, 14.770717183139766 - coordinates of the outer bottom right location (very close to the actual track)

  
  // trackGroup.selectAll("circle.track-outer")
  //   .data(red_bull_ring.outer)
  //   .join("circle")
  //   .attr("class", "track-outer")
  //   .attr("cx", item => yScale(item.Lon))
  //   .attr("cy", item => yScale(item.Lat))
  //   .attr("r", 0.5)
  //   .attr("stroke-width", 0)
  //   .attr("fill", "red")
}


export default function define(runtime, observer) {
  const main = runtime.module();
  function toString() { return this.url; }
  const fileAttachments = new Map([
    ["red_bull_ring.json", {url: new URL("./files/13c5d3c8b3d329c9677d3206cfba9ae59253defa8bcb79deae6ce8d1ce85a745e246196d109ce97fe9438727a1cccc7d3a9bd91a3ca473e0f6e011850da8930e.json", import.meta.url), mimeType: "application/json", toString}],
    ["race_fastest.json", {url: new URL("./files/10dfa2de41f00374b7a653e05357927a49cfc2af66916271a10fdc90230b227a6ce118939af77ea9309f22a7995eaea8b7e103cace635f7d9a7aee57da210ed5.json", import.meta.url), mimeType: "application/json", toString}],
    ["practice_fastest.json", {url: new URL("./files/9b1a3837c0c3bc490114525ddb60ae1b1919eca9557d5506fe0d6c9faf96c591edf30b72fffeeeeb675d14199d6af575b1291cd3bb171fe9941f25cb8176927d.json", import.meta.url), mimeType: "application/json", toString}]
  ]);
  main.builtin("FileAttachment", runtime.fileAttachments(name => fileAttachments.get(name)));
  main.variable(observer()).define(["md"], _1);
  main.variable(observer("telemetryVisualization")).define("telemetryVisualization", ["d3","style","viewBox","redBullRingMap","speedGraph","throttleGraph","brakeGraph","wheelInputGraph","labelLayer"], _telemetryVisualization);
  main.variable(observer("redBullRingMap")).define("redBullRingMap", ["viewBox","d3","style","red_bull_ring","divideTelemetryIntoSectors","target","source","sectorMarks","formatDate","getTrackMarker","telemetryDistanceScale"], _redBullRingMap);
  main.variable(observer("speedGraph")).define("speedGraph", ["d3","style","target","source","telemetryDistanceScale","trackLength"], _speedGraph);
  main.variable(observer("throttleGraph")).define("throttleGraph", ["d3","style","target","source","telemetryDistanceScale","trackLength"], _throttleGraph);
  main.variable(observer("brakeGraph")).define("brakeGraph", ["d3","style","target","source","telemetryDistanceScale","trackLength"], _brakeGraph);
  main.variable(observer("wheelInputGraph")).define("wheelInputGraph", ["d3","style","target","source","telemetryDistanceScale","trackLength"], _wheelInputGraph);
  main.variable(observer("labelLayer")).define("labelLayer", ["d3","source","target","formatDate","style","viewBox"], _labelLayer);
  main.variable(observer("viewBox")).define("viewBox", ["red_bull_ring","d3"], _viewBox);
  main.variable(observer("style")).define("style", _style);
  main.variable(observer("telemetryDistanceScale")).define("telemetryDistanceScale", ["d3","trackLength","style"], _telemetryDistanceScale);
  main.variable(observer("divideTelemetryIntoSectors")).define("divideTelemetryIntoSectors", ["sectorMarks"], _divideTelemetryIntoSectors);
  main.variable(observer("getTrackMarker")).define("getTrackMarker", _getTrackMarker);
  main.variable(observer("formatDate")).define("formatDate", ["d3"], _formatDate);
  main.variable(observer("trackLength")).define("trackLength", ["d3","target","source"], _trackLength);
  main.variable(observer("target")).define("target", ["practice_fastest"], _target);
  main.variable(observer("source")).define("source", ["race_fastest"], _source);
  main.variable(observer("sectorMarks")).define("sectorMarks", ["red_bull_ring"], _sectorMarks);
  main.variable(observer("practice_fastest")).define("practice_fastest", ["FileAttachment"], _practice_fastest);
  main.variable(observer("race_fastest")).define("race_fastest", ["FileAttachment"], _race_fastest);
  main.variable(observer("red_bull_ring")).define("red_bull_ring", ["FileAttachment"], _red_bull_ring);
  main.variable(observer("junk")).define("junk", _junk);
  return main;
}

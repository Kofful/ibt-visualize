function _telemetryVisualization(d3,style,viewBox,redBullRingMap,speedGraph,throttleGraph,brakeGraph,wheelInputGraph,labelLayer)
{
  const svg = d3.create("svg")
    .attr("viewBox", `0 0 1160 700`)
    .attr("class", "visualization-svg")

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



export default function define(runtime, observer) {
  const main = runtime.module();
  function toString() { return this.url; }
  const fileAttachments = new Map([
    ["red_bull_ring.json", {url: new URL("./files/13c5d3c8b3d329c9677d3206cfba9ae59253defa8bcb79deae6ce8d1ce85a745e246196d109ce97fe9438727a1cccc7d3a9bd91a3ca473e0f6e011850da8930e.json", import.meta.url), mimeType: "application/json", toString}],
    ["race_fastest.json", {url: new URL("./files/10dfa2de41f00374b7a653e05357927a49cfc2af66916271a10fdc90230b227a6ce118939af77ea9309f22a7995eaea8b7e103cace635f7d9a7aee57da210ed5.json", import.meta.url), mimeType: "application/json", toString}],
    ["practice_fastest.json", {url: new URL("./files/9b1a3837c0c3bc490114525ddb60ae1b1919eca9557d5506fe0d6c9faf96c591edf30b72fffeeeeb675d14199d6af575b1291cd3bb171fe9941f25cb8176927d.json", import.meta.url), mimeType: "application/json", toString}]
  ]);
  main.builtin("FileAttachment", runtime.fileAttachments(name => fileAttachments.get(name)));
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
  return main;
}

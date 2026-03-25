const sliderMax = windowWidth-45;
const sliderLength = 100
const sliderMin = sliderMax-sliderLength;
// let slidePos = sliderMax - 10*2

const settingsButtonProps = {width: 32, height: 30, r: 5, 
    x: windowWidth-36, y: windowHeight-yShift-69, yinc: 35}

function drawSnapIcon(x, y) {
    const snapPath = `
    M ${0+x} ${-5+y}
    A 5 5 ${0+x} 1 1 ${0+x} ${5+y}
    A 5 5 ${0+x} 1 1 ${0+x} ${-5+y}

    M ${0+x} ${-10+y}
    L  ${0+x} ${-10+y}
    L  ${0+x} ${10+y}
    Z

    M ${-10+x} ${0+y}
    L  ${10+x} ${0+y}
    Z
    `
    return snapPath
}

const settingsMenuData = [
    {id: "snap", text: "", fontColor: "black", lab: "Snap Distance", slideVal: 20, slideScale: 1,
        x: sliderMax-20, y: settingsButtonProps.y-settingsButtonProps.yinc}, 
    {id: "axes", text: "", fontColor: "black", lab: "Coord Axes Length", slideVal: 10, slideScale: 1,
        x: sliderMax-10, y: settingsButtonProps.y-settingsButtonProps.yinc*2}, 
    {id: "loads", text: "", fontColor: "darkred", lab: "Loads Scale", slideVal: 10, slideScale: 1,
        x: sliderMax-10, y: settingsButtonProps.y-settingsButtonProps.yinc*3}, 
    {id: "stresses", text: "", fontColor: "indigo", lab: "Stresses Scale", slideVal: 30, slideScale: 1,
        x: sliderMax-30, y: settingsButtonProps.y-settingsButtonProps.yinc*4}
]

const settingsMenu = overlayGroup
    .append("rect")
    .attr("x", windowWidth-155)
    .attr("y", settingsButtonProps.y-settingsButtonProps.yinc*4-2.5)
    .attr("width", 160)
    .attr("height", 30+35*3+2+3)
    .attr("rx", 5)
    .attr("ry", 5)
    .attr("fill", "lightgray")
    .attr("fill-opacity", 0.75)
    .attr("stroke", "black")
    .attr("stroke-width", 0.5)
    .attr("stroke-opacity", 1)
    // .style("pointer-events", "none")
    .style("display", "none")
    .on("mousedown", function(event) {
        event.stopPropagation();
    })

const settingsButton = overlayGroup
    .append("rect")
    .attr("x", settingsButtonProps.x)
    .attr("y", settingsButtonProps.y)
    .attr("width", settingsButtonProps.width)
    .attr("height", settingsButtonProps.height)
    .attr("rx", settingsButtonProps.r)
    .attr("ry", settingsButtonProps.r)
    .attr("fill", "black")
    .attr("fill-opacity", 0)
    .attr("stroke", "black")
    .attr("stroke-width", 0.5)
    .attr("stroke-opacity", 0.25)
    .on("click", function() {showHideSettings()})
const settingsIcon = overlayGroup
    .append("text")
    .attr("font-size", "16pt")
    .attr("text-anchor", "middle")
    // .attr("alignment-baseline", "text-before-edge")
    .style("pointer-events", "none")
    .attr("x", windowWidth-20-1)
    .attr("y", settingsButtonProps.y+settingsButtonProps.height/2-1.5)
    .attr("dy", "0.35em")
    .attr("opacity", 0.75)
    .text("🛠")

const slideLabBoxGroup = overlayGroup.append("g")
const slideLabBox = slideLabBoxGroup.selectAll("rect")
    .data(settingsMenuData)
    .enter()
    .append("rect")
    .attr("x", settingsButtonProps.x)
    .attr("y", d => d.y)
    .attr("width", 32)
    .attr("height", 30)
    .attr("rx", 5)
    .attr("ry", 5)
    .attr("fill", "white")
    .attr("fill-opacity", 1)
    .attr("stroke", "black")
    .attr("stroke-width", 0.5)
    .attr("stroke-opacity", 0.5)
    .style("display", "none")

const slideIconsGroup = overlayGroup.append("g")
const slideIcon = slideIconsGroup.selectAll("text")
    .data(settingsMenuData)
    .enter()
    .append("text")
    .attr("font-size", "20px")
    .attr("text-anchor", "middle")
    // .attr("alignment-baseline", "middle")
    .style("pointer-events", "none")
    .attr("x", settingsButtonProps.x+settingsButtonProps.width/2)
    .attr("y", d => d.y+settingsButtonProps.height/2-1)
    .attr("dy", "0.35em")
    .attr("opacity", 0.75)
    .text(d => d.text)
    .attr("fill", d => d.fontColor)
    .style("display", "none")

const sliderBarGroup = overlayGroup.append("g")
const slideBar = sliderBarGroup.selectAll("line")
    .data(settingsMenuData)
    .enter()
    .append("line")
    .attr("x1", sliderMax)
    .attr("x2", sliderMin)
    .attr("y1", d => d.y+settingsButtonProps.height/2)
    .attr("y2", d => d.y+settingsButtonProps.height/2)
    .attr("stroke", "black")
    .attr("stroke-width", 5)
    .attr("fill", "none")
    .style("stroke-linecap", "round")
    .style("display", "none")

const slidePosBarGroup = overlayGroup.append("g")
const slidePosBar = slidePosBarGroup.selectAll("line")
    .data(settingsMenuData)
    .enter()
    .append("line")
    .attr("x1", sliderMin)
    .attr("x2", d => sliderMax - d.slideVal / d.slideScale)
    .attr("y1", d => d.y+settingsButtonProps.height/2)
    .attr("y2", d => d.y+settingsButtonProps.height/2)
    .attr("stroke", "white")
    .attr("stroke-width", 5)
    .attr("stroke-opacity", 0.5)
    .attr("fill", "none")
    .style("stroke-linecap", "round")
    .style("display", "none")

const sliderDotGroup = overlayGroup.append("g")
const sliderDot = sliderDotGroup.selectAll("circle")
    .data(settingsMenuData)
    .enter()
    .append("circle")
    .attr("r", 8)
    .attr("cy", d => d.y+settingsButtonProps.height/2)
    .attr("cx", d => d.x)
    .attr("fill", "white")
    .attr("stroke", "black")
    .call(d3.drag()
        .on("drag", function(event, d) {
            // if (event.x < sliderMin-50 || event.x > sliderMax+50) return;
            d.x = Math.floor(event.x);
            if(d.x < sliderMin) d.x = sliderMin;
            if(d.x > sliderMax) d.x = sliderMax;
            d.slideVal = (sliderMax - d.x) * d.slideScale
            sliderDot
                .attr("cx", d => d.x)
            sliderVal
                .attr("x", d => d.x)
                .text(d => d.slideVal.toFixed(0))
            slidePosBar
                .attr("x2", d => d.x)
            updateSliderVals(d.id, d.slideVal);
        }) 
    )
    .style("display", "none")

const sliderValGroup = overlayGroup.append("g")
const sliderVal = sliderValGroup.selectAll("text")
    .data(settingsMenuData)
    .enter()
    .append("text")
    .attr("fill", "black")
    .attr("font-size", "7pt")
    .attr("text-anchor", "middle")
    .attr("alignment-baseline", "middle")
    .style("pointer-events", "none")
    .attr("y", d => d.y+settingsButtonProps.height/2)
    .attr("x", d => sliderMax - d.slideVal / d.slideScale)
    .attr("dy", "0.1em")
    .attr("dx", "-0.025em")
    .text(d => d.slideVal)
    .style("display", "none")

const snapIcon = overlayGroup
    .append("path")
    .attr("stroke", "black")
    .attr("stroke-width", 1)
    .attr("fill", "none")
    .attr("d", drawSnapIcon(settingsButtonProps.x + settingsButtonProps.width/2, 
        settingsButtonProps.y-settingsButtonProps.yinc + settingsButtonProps.height/2
    ))
    .style("pointer-events", "none")
    .style("display", "none")

const loadScaleIcon = overlayGroup
    .append("line")
    .attr("x1", settingsButtonProps.x + settingsButtonProps.width/2-7)
    .attr("x2", settingsButtonProps.x + settingsButtonProps.width/2+5)
    .attr("y1", settingsButtonProps.y-settingsButtonProps.yinc*3+settingsButtonProps.height/2+6)
    .attr("y2", settingsButtonProps.y-settingsButtonProps.yinc*3+settingsButtonProps.height/2-5)
    .attr("stroke", "darkred")
    .attr("stroke-width", 2)
    .attr("opacity", 0.75)
    .attr("marker-end", "url(#R_arrowhead")
    .attr("marker-start", "url(#dots")
    .style("pointer-events", "none")
    .style("display", "none")

const stressScaleIcon = overlayGroup
    .append("line")
    .attr("x2", settingsButtonProps.x + settingsButtonProps.width/2-5)
    .attr("x1", settingsButtonProps.x + settingsButtonProps.width/2+8)
    .attr("y1", settingsButtonProps.y-settingsButtonProps.yinc*4+settingsButtonProps.height/2+7)
    .attr("y2", settingsButtonProps.y-settingsButtonProps.yinc*4+settingsButtonProps.height/2-4)
    .attr("stroke", "indigo")
    .attr("stroke-width", 2)
    .attr("opacity", 0.75)
    .attr("marker-end", "url(#P_arrowhead")
    .style("pointer-events", "none")
    .style("display", "none")

const axIconPoints = {
    x1: settingsButtonProps.x + settingsButtonProps.width/2-5, 
    y1: settingsButtonProps.y-settingsButtonProps.yinc*2+settingsButtonProps.height/2+5, 
    l: 10
}
const axesIcon = overlayGroup
    .append("polyline")
    .attr("points", `${axIconPoints.x1},${axIconPoints.y1-axIconPoints.l} ${axIconPoints.x1},${axIconPoints.y1} ${axIconPoints.x1+axIconPoints.l},${axIconPoints.y1}`)
    .attr("fill", "none")
    .attr("stroke", "black")
    .attr("stroke-width", 1.5)
    .attr("marker-end", "url(#arrowhead")
    .attr("marker-start", "url(#arrowhead")
    // .attr("stroke-dasharray", "2,2")
    .style("pointer-events", "none")
    .style("display", "none")

const inspectIcon = overlayGroup.append("g")
    .append("text")
    .attr("font-size", "20px")
    .attr("text-anchor", "middle")
    .attr("alignment-baseline", "text-before-edge")
    .style("pointer-events", "none")
    .attr("x", 36-settingsButtonProps.width/2-1)
    .attr("y", settingsButtonProps.y - settingsButtonProps.yinc*3 - yShift -2)
    .attr("opacity", 0.75)
    .text("🔎")
const inspectButton = overlayGroup.append("g")
    .append("rect")
    .attr("x", 36-settingsButtonProps.width)
    .attr("y", settingsButtonProps.y - settingsButtonProps.yinc*4)
    .attr("width", 29)
    .attr("height", 30)
    .attr("rx", 5)
    .attr("ry", 5)
    .attr("fill", "black")
    .attr("fill-opacity", 0)
    .attr("stroke-opacity", 0.25)
    .attr("stroke", "black")
    .attr("stroke-width", 0.5)
    .on("click", function() {inspect()})
inspectButton
        .attr("fill-opacity", showInspect ? 0.125 : 0)
        .attr("stroke-opacity", showInspect ? 0.5 : 0.5)
        .append("title")
        .text("Inspect Weld Stress")

// setupScaleSliders();
updateView();
updateWeldProps();
updateLoadProps();

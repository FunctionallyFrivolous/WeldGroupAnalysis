const settingsButtonProps = {width: 32, height: 30, r: 5, 
    x: windowWidth-36, y: windowHeight-yShift-69, yinc: 35}

const settingsMenuData = [
    {id: "snap", text: "⌖", fontColor: "black", lab: "Snap Distance", slideVal: 20, slideScale: 1,
        x: settingsButtonProps.x, y: settingsButtonProps.y-settingsButtonProps.yinc}, 
    {id: "axes", text: "x,y", fontColor: "black", lab: "Coord Axes Length", slideVal: 10, slideScale: 1,
        x: settingsButtonProps.x, y: settingsButtonProps.y-settingsButtonProps.yinc*2}, 
    {id: "loads", text: "↗", fontColor: "darkred", lab: "Loads Scale", slideVal: 10, slideScale: 1,
        x: settingsButtonProps.x, y: settingsButtonProps.y-settingsButtonProps.yinc*3}, 
    {id: "stresses", text: "↖", fontColor: "indigo", lab: "Stresses Scale", slideVal: 30, slideScale: 1,
        x: settingsButtonProps.x, y: settingsButtonProps.y-settingsButtonProps.yinc*4}
]

const settingsMenu = overlayGroup
    .append("rect")
    .attr("x", windowWidth-36-2-110-5)
    .attr("y", windowHeight-37-yShift-35-35*4)
    .attr("width", 155)
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
    .attr("y", windowHeight-26-yShift-30)
    .attr("dy", "0.35em")
    .attr("opacity", 0.75)
    .text("🛠")

const slideLabBoxGroup = overlayGroup.append("g")
const slideLabBox = slideLabBoxGroup
    .selectAll("rect")
    .data(settingsMenuData)
    .enter()
    .append("rect")
    .attr("x", d => d.x)
    .attr("y", d => d.y)
    .attr("width", 32)
    .attr("height", 30)
    .attr("rx", 5)
    .attr("ry", 5)
    .attr("fill", "white")
    .attr("fill-opacity", 1)
    .attr("stroke", "black")
    .attr("stroke-width", 0.5)
    .attr("stroke-opacity", 0.25)
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
    .attr("x", d => d.x+settingsButtonProps.width/2)
    .attr("y", d => d.y+settingsButtonProps.height/2-3)
    .attr("dy", "0.35em")
    .attr("opacity", 0.75)
    .text(d => d.text)
    .attr("fill", d => d.fontColor)
    .style("display", "none")

const sliderMax = windowWidth-45;
const sliderLength = 100
const sliderMin = sliderMax-sliderLength;
let slidePos = sliderMax - 10*2

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
    .attr("cx", d => sliderMax - d.slideVal / d.slideScale)
    .attr("fill", "white")
    .attr("stroke", "black")
    .call(d3.drag()
        .on("drag", function(event, d) {
            const [ex, ey] = d3.pointer(event, svg.node())
            if (ex < sliderMin || ex > sliderMax) return;
            d.slideVal = ((sliderMax - ex) * d.slideScale).toFixed(0)
            sliderDot
                .attr("cx", d => sliderMax - d.slideVal / d.slideScale)
            slideVal
                .attr("x", d => sliderMax - d.slideVal / d.slideScale)
                .text(d => d.slideVal)
            slidePosBar
                .attr("x2", d => sliderMax - d.slideVal / d.slideScale)
            updateSliderVals(d.id, d.slideVal);
        }) 
    )
    .style("display", "none")

const slideValGroup = overlayGroup.append("g")
const slideVal = slideValGroup.selectAll("text")
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
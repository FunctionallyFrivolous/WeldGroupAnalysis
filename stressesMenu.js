const stressButtonProps = {
    x: 5, xinc: buttonPitch,
    y: firstButtonY - buttonPitch}

const stressMenuData = [
    {id: "inspect", text: "🔎", fontColor: "black", fontSize: "20px", lab: "Inspect Weld Stress", sub: "", 
        x: stressButtonProps.x + buttonPitch*5, y: stressButtonProps.y, dy: "0.2em"},
    {id: "direct", text: "τ'", fontColor: "darkred", fontSize: "20px", lab: "Direct Shear Stress", sub: "", 
        x: stressButtonProps.x + buttonPitch*2, y: stressButtonProps.y, dy: "0.1em"}, 
    {id: "torsional", text: "τ''", fontColor: "darkblue", fontSize: "20px", lab: "Torsional Shear Stress", sub: "", 
        x: stressButtonProps.x + buttonPitch*3, y: stressButtonProps.y, dy: "0.1em"}, 
    {id: "max", text: "τ", fontColor: "indigo", fontSize: "18px", lab: "Max Shear Stress", sub: "max", 
        x: stressButtonProps.x + buttonPitch*4, y: stressButtonProps.y, dy: "0.1em"}, 
    {id: "total", text: "τ", fontColor: "indigo", fontSize: "20px", lab: "Total Shear Stress", sub: "tot", 
        x: stressButtonProps.x + buttonPitch, y: stressButtonProps.y, dy: "0em"},
    {id: "fringe", text: "", fontColor: "indigo", fontSize: "20px", lab: "Fringe Plot", sub: "", 
        x: stressButtonProps.x + buttonPitch*6, y: stressButtonProps.y, dy: "0em"}
]

const stressMenuBox = overlayGroup
    .append("rect")
    .attr("x", -5)
    .attr("y", stressButtonProps.y-2.5)
    .attr("width", buttonPitch*(stressMenuData.length+1) + 9)
    .attr("height", buttonPitch)
    .attr("rx", 5)
    .attr("ry", 5)
    .attr("fill", "lightgray")
    .attr("fill-opacity", 0.75)
    .attr("stroke", "black")
    .attr("stroke-width", 0.5)
    .attr("stroke-opacity", 1)
    .style("display", "none")

const stressButtonsGroup = overlayGroup.append("g")
const stressButtons = stressButtonsGroup.selectAll("rect")
    .data(stressMenuData)
    .enter()
    .append("rect")
    .attr("x", d => d.x)
    .attr("y", d => d.y)
    .attr("width", buttonWidth)
    .attr("height", buttonWidth)
    .attr("rx", buttonCorner)
    .attr("ry", buttonCorner)
    .attr("fill", "white")
    .attr("fill-opacity", 1)
    .attr("stroke", "black")
    .attr("stroke-width", 0.5)
    .attr("stroke-opacity", 0.5)
    .style("display", "none")
    .on("click", function(event, d) {showHideStress(d.id)})

const stressIconsGroup = overlayGroup.append("g")
const stressIcons = stressIconsGroup.selectAll("text")
    .data(stressMenuData)
    .enter()
    .append("text")
    .attr("font-size", d => d.fontSize)
    .attr("font-family", "ariel")
    .attr("fill", d => d.fontColor)
    .attr("text-anchor", "middle")
    .attr("alignment-baseline", "text-before-edge")
    .style("pointer-events", "none")
    .attr("x", d => d.x + 15)
    .attr("y", d => d.y)
    .attr("opacity", 0.75)
    .text(d => d.text)
    .attr("dy", d => d.dy)
    .style("display", "none")
const stressIconSub = stressIcons
    .append("tspan")
    .text(d => d.sub)
    .style("font-size", "0.5em")
    .attr("dx", "0.1em")
    .attr("dy", "2em")

const stressMenuIcon = overlayGroup
    .append("text")
    .attr("font-size", "22px")
    .attr("font-family", "ariel")
    .attr("fill", "indigo")
    .attr("text-anchor", "middle")
    .attr("alignment-baseline", "text-before-edge")
    .style("pointer-events", "none")
    .attr("x", 19)
    .attr("y", stressButtonProps.y)
    .attr("opacity", 0.75)
    .text("τ")
const stressMenuButton = overlayGroup
    .append("rect")
    .attr("x", 5)
    .attr("y", stressButtonProps.y)
    .attr("width", buttonWidth)
    .attr("height", buttonHeight)
    .attr("rx", buttonCorner)
    .attr("ry", buttonCorner)
    .attr("fill", "black")
    .attr("fill-opacity", 0)
    .attr("stroke", "black")
    .attr("stroke-width", 0.5)
    .attr("stroke-opacity", 0.25)
    .on("click", function() {
        showStressMenu = !showStressMenu
        stressIcons.style("display",showStressMenu ? "block" : "none")
        stressButtons.style("display",showStressMenu ? "block" : "none")
        stressMenuBox.style("display",showStressMenu ? "block" : "none")
        stressFringeIcon.style("display",showStressMenu ? "block" : "none")
        // stressMenuButton.attr("stroke-opacity", showStressMenu ? 0.75 : 0.25)
        stressMenuButton.attr("stroke-opacity", showStressMenu ? 0.25 : (showTMax || showStress || showTDir || showTTor || showInspect || showTFringe ? 0.75 : 0.25))
        
    })

const iconGrad = defs.append("linearGradient")
    .attr("id", "fringeIconGrad")
    .attr("x1", "100%")
    .attr("x2", "0%")
    .attr("y1", "0%")
    .attr("y2", "100%")
iconGrad.append("stop")
    .attr("offset", "0%")
    .attr("stop-color", "red")
iconGrad.append("stop")
    .attr("offset", "25%")
    .attr("stop-color", "yellow")
iconGrad.append("stop")
    .attr("offset", "50%")
    .attr("stop-color", d3.color("green").brighter(2))
iconGrad.append("stop")
    .attr("offset", "75%")
    .attr("stop-color", "cyan")
iconGrad.append("stop")
    .attr("offset", "100%")
    .attr("stop-color", "darkblue")

const fringeIconMargin = 8
const stressFringeIcon = overlayGroup
    .append("line")
    .attr("x1", stressMenuData[5].x + fringeIconMargin)
    .attr("y1", stressButtonProps.y + buttonWidth - fringeIconMargin)
    .attr("x2", stressMenuData[5].x + buttonWidth - fringeIconMargin)
    .attr("y2", stressButtonProps.y + fringeIconMargin)
    .attr("fill", "none")
    .attr("stroke", "url(#fringeIconGrad)")
    .attr("stroke-width", 6)
    .attr("stroke-opacity", 0.75)
    .style("stroke-linecap", "round")
    .style("display", "none")
    .style("pointer-events", "none")

const fringeKeyX = 15
const fringeKeyY = 160
const fringeKeyHeight = 150
const fringeKeyWidth = 20
const fringeKeyGrad = defs.append("linearGradient")
    .attr("id", "fringeKeyGrad")
    // .attr("gradientUnits", "userSpaceOnUse")
    .attr("x1", "0%")
    .attr("x2", "0%")
    .attr("y1", "0%")
    .attr("y2", "100%")
fringeKeyGrad.append("stop")
    .attr("offset", "0%")
    .attr("stop-color", "red")
fringeKeyGrad.append("stop")
    .attr("offset", "25%")
    .attr("stop-color", "yellow")
fringeKeyGrad.append("stop")
    .attr("offset", "50%")
    .attr("stop-color", d3.color("green").brighter(2))
fringeKeyGrad.append("stop")
    .attr("offset", "75%")
    .attr("stop-color", "cyan")
fringeKeyGrad.append("stop")
    .attr("offset", "100%")
    .attr("stop-color", "darkblue")

const fringeKeyLine = overlayGroup
    .append("line")
    .attr("x1", fringeKeyX+0.0001)
    .attr("y1", fringeKeyY)
    .attr("x2", fringeKeyX)
    .attr("y2", fringeKeyY + fringeKeyHeight)
    .attr("fill", "none")
    .attr("stroke", "url(#fringeKeyGrad)")
    .attr("stroke-width", `${fringeKeyWidth}px`)
    .attr("stroke-opacity", 0.90)
    .style("pointer-events", "none")
    .style("display", "none")

const fringeKeyMin = overlayGroup
    .append("text")
    .attr("x", fringeKeyX-10)
    .attr("y", fringeKeyY-2.5)
    .attr("font-size", "8pt")
    .attr("text-anchor", "start")
    .attr("alignment-baseline", "text-after-edge")
    .style("pointer-events", "none")
    .text(`${min_t.toFixed(1)} ${stressSymbol}`)
    .style("display", "none")
const fringeKeyMax = overlayGroup
    .append("text")
    .attr("x", fringeKeyX-10)
    .attr("y", fringeKeyY+fringeKeyHeight+2.5)
    .attr("font-size", "8pt")
    .attr("text-anchor", "start")
    .attr("alignment-baseline", "text-before-edge")
    .style("pointer-events", "none")
    .text(`${max_t.toFixed(1)} ${stressSymbol}`)
    .style("display", "none")

const fringeInspectLine = overlayGroup
    .append("line")
    .attr("x1", fringeKeyX-fringeKeyWidth/2)
    .attr("x2", fringeKeyX + fringeKeyWidth/2)
    .attr("y1", fringeKeyHeight*0.5 + fringeKeyY)
    .attr("y2", fringeKeyHeight*0.5 + fringeKeyY)
    .attr("stroke", "black")
    .attr("stroke-width", 1)
    .style("pointer-events", "none")
    .style("display", "none")
const fringeInspectLab = overlayGroup
    .append("text")
    .attr("x", fringeKeyX+fringeKeyWidth/2+2.5)
    .attr("y", fringeKeyHeight*0.5 + fringeKeyY)
    .attr("font-size", "8pt")
    .attr("text-anchor", "start")
    .attr("alignment-baseline", "middle")
    .style("pointer-events", "none")
    .text(`${inspectStress.toFixed(1)} ${stressSymbol}`)
    .style("display", "none")

updateView();
updateWeldProps();
updateLoadProps();

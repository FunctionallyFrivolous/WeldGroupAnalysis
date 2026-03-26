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
        x: stressButtonProps.x + buttonPitch, y: stressButtonProps.y, dy: "0em"}
]

const stressMenuBox = overlayGroup
    .append("rect")
    .attr("x", -5)
    .attr("y", stressButtonProps.y-2.5)
    .attr("width", buttonPitch*6+9)
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
    .attr("width", 30)
    .attr("height", 30)
    .attr("rx", 5)
    .attr("ry", 5)
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
    .attr("width", 29)
    .attr("height", 30)
    .attr("rx", 5)
    .attr("ry", 5)
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
        // stressMenuButton.attr("stroke-opacity", showStressMenu ? 0.75 : 0.25)
        stressMenuButton.attr("stroke-opacity", showStressMenu ? 0.25 : (showTMax || showStress || showTDir || showTTor || showInspect ? 0.75 : 0.25))
    })

updateView();
updateWeldProps();
updateLoadProps();

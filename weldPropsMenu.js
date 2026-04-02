// Weld Properties Menu - 3 parameters...
    // Weld strength value - Number input
        // Needs to update
    // Safety Factor - number input
    // Universal weld size - toggle button & number input
        // Or just number input. When left empty, allows individual weld sizing
    // When weld material and FOS are given and universal weld size is active, report min viable weld size
        // Option to apply this min weld size via click?

const wPropsButtonProps = {width: buttonWidth, height: buttonHeight, r: 5, 
    x: 5, y: firstButtonY - buttonPitch*2}

const wPropsMenuData = [
    {id: "fos", text: "FoS", lab: "Safety Factor", sub: "", val: 2.0, units: "", precision: 1, width: 25,
        y: wPropsButtonProps.y - buttonPitch, dy: "0.2em"},
    {id: "strength", text: "", lab: "Weld Strength", sub: "", val: 60000, units: stressSymbol, precision: 0, width: 45, 
        y: wPropsButtonProps.y - buttonPitch*2, dy: "0.1em"}, 
    {id: "wSize", text: "", lab: "Weld Size", sub: "", val: 0.25, units: unitSymbol, precision: 2, width: 45,  
        y: wPropsButtonProps.y - buttonPitch*3, dy: "0.1em"}, 
]

const weldPropsMenuBox = overlayGroup
    .append("rect")
    .attr("x", -5)
    .attr("y", wPropsButtonProps.y - buttonPitch*wPropsMenuData.length-2.5)
    .attr("width", 120)
    .attr("height", buttonPitch*wPropsMenuData.length)
    .attr("rx", 5)
    .attr("ry", 5)
    .attr("fill", "lightgray")
    .attr("fill-opacity", 0.75)
    .attr("stroke", "black")
    .attr("stroke-width", 0.5)
    .attr("stroke-opacity", 1)
    .style("pointer-events", "none")
    .style("display", "none")
    .on("mousedown", function(event) {
        event.stopPropagation();
    })

function updateDesignProps(id) {
    if (id === "wSize") {
        // wSizeInput = val
        for (i = 0; i < weldCoords.length; i++) {
            weldCoords[i].thk = wSizeInput
        }
    }
    updateWelds()
    updateView()
}

const wPropsButtonsGroup = overlayGroup.append("g")
    .attr("fill", "white")
    .attr("fill-opacity", 1)
    .attr("stroke", "black")
    .attr("stroke-width", 0.5)
    .attr("stroke-opacity", 0.5)
    .style("display", "none")
const wPropsButtons = wPropsButtonsGroup.selectAll("rect")
    .data(wPropsMenuData)
    .enter()
    .append("rect")
    .attr("y", d => d.y)
    .attr("x", 5)
    .attr("rx", 5)
    .attr("ry", 5)
    .attr("width", buttonWidth)
    .attr("height", buttonHeight)
    .on("click", function(event, d) {
        updateDesignProps(d.id, wSizeInput)
    })
    
// const wPropsIconsGroup = overlayGroup.append("g")
// const wPropsIcons = wPropsIconsGroup.selectAll("")

function drawTensileIcon(x, y) {
    const dbWidth = 8
    const dbNeck = 4
    const dbLength = 24;
    const strPath = `

    M ${-dbWidth/2+x} ${dbLength/2+y}
    L  ${-dbWidth/2+x} ${7.5+y}
    L  ${-dbNeck/2+x} ${5+y}
    L  ${-dbNeck/2+x} ${2.5+y}
    L  ${dbNeck/2+x} ${0+y}
    L  ${dbNeck/2+x} ${5+y}
    L  ${dbWidth/2+x} ${7.5+y}
    L  ${dbWidth/2+x} ${dbLength/2+y}
    Z

    M ${-dbWidth/2+x} ${-dbLength/2+y}
    L  ${-dbWidth/2+x} ${-7.5+y}
    L  ${-dbNeck/2+x} ${-5+y}
    L  ${-dbNeck/2+x} ${-0+y}
    L  ${dbNeck/2+x} ${-2.5+y}
    L  ${dbNeck/2+x} ${-5+y}
    L  ${dbWidth/2+x} ${-7.5+y}
    L  ${dbWidth/2+x} ${-dbLength/2+y}
    Z
    `
    return strPath
}

function drawWeldIcon(x, y) {
    const side = 15

    const strPath = `

    M ${side/2+x} ${side/2+y}
    L  ${-side/2+x} ${side/2+y}
    L  ${-side/2+x} ${-side/2+y}

    Z

    `
    return strPath
}

const wPropsIconsGroup = overlayGroup.append("g")
    .style("pointer-events", "none")
    .style("display", "none")
const wStrengthIcon = wPropsIconsGroup
    .append("path")
    .attr("stroke", "black")
    .attr("stroke-width", 0.5)
    .attr("fill", "gray")
    .attr("d", drawTensileIcon(wPropsButtonProps.x + wPropsButtonProps.width/2, 
        wPropsButtonProps.y-buttonPitch*2 + wPropsButtonProps.height/2
    ))

const wSizeIcon = wPropsIconsGroup
    .append("path")
    .attr("stroke", "black")
    .attr("stroke-width", 0.5)
    .attr("fill", "gray")
    .attr("d", drawWeldIcon(wPropsButtonProps.x + wPropsButtonProps.width/2, 
        wPropsButtonProps.y-buttonPitch*3 + wPropsButtonProps.height/2
    ))

const wPropsLabsGroup = overlayGroup.append("g")
    .style("pointer-events", "none")
    .style("display", "none")
const wPropsLabs = wPropsLabsGroup.selectAll("text")
    .data(wPropsMenuData)
    .enter()
    .append("text")
    .attr("x", wPropsButtonProps.x+buttonWidth/2)
    .attr("y", d => d.y + buttonHeight/2)
    .attr("dy", "0.1em")
    .attr("fill", "black")
    .attr("opacity", 0.70)
    .attr("font-size", "12px")
    .attr("font-weight", "bold")
    .attr("text-anchor", "middle")
    .attr("alignment-baseline", "middle")
    .text(d => d.text)

const wPropsUnitsGroup = overlayGroup.append("g")
    .style("pointer-events", "none")
    .style("display", "none")
const wPropsUnits = wPropsUnitsGroup.selectAll("text")
    .data(wPropsMenuData)
    .enter()
    .append("text")
    .attr("x", d => 95 - 55 + d.width)
    .attr("y", d => d.y + 7.5)
    .attr("fill", "black")
    .attr("font-size", "11px")
    .attr("text-anchor", "start")
    .attr("alignment-baseline", "text-before-edge")
    .text(d => d.units)

let editingWProp = false;

// let editTempW = 0;
let inputWContent = 0;
// let editVal = 0.25;

const wPropsInputsGroup = overlayGroup.append("g")
    .attr("font-size", `${editFontSize}px`)
    .attr("text-anchor", "start")
    .attr("alignment-baseline", "middle")
    .style("text-align", "start")
    .style("pointer-events", "none")
    .style("display", "none")
const wPropsInputs = wPropsInputsGroup.selectAll("foreignObject")
    .data(wPropsMenuData)
    .enter()
    .append("foreignObject")
    .attr("x", 40)
    .attr("y", d => d.y+7.5)
    .attr("width", d => d.width)//`${editFieldWidth}px`)
    .attr("height", "20px")
    .append(`xhtml:div`)
    .append(`div`)
    .attr("contentEditable", true)
    .text(d => `${d.val.toFixed(d.precision)}`)
    .on("mousedown", function(event, d) {
        event.stopPropagation();
        editingWProp = true;
        editTempW = d.val;
    })
    .on("keyup", function(event, d) {
        inputWContent = d3.select(this).text();
        wSizeInput = inputWContent / unitConvert;
        if (!isFinite(inputWContent)) return;
        const editField = wPropsMenuData.find(j => j.id === d.id) 
        editField.val = inputWContent *1
        document.getElementById("debugOutputs").innerHTML = `${editField.val.toFixed(1)}`
    //     updateView();
    //     updateWeldProps();
    //     updateLoadProps();
    })
    .on("keydown", function(event, d) {
        if (event.key === "Enter") {
            event.preventDefault();
            event.target.blur();
            editingWProp = false;
            updateDesignProps(d.id, wSizeInput)
    //         editingWY = false;
    //         editingWL = false;
    //         editingWT = false;
    //         selectWEditProp(); 
        }
    })
    // .style("display", editShowHide)

function showHideProps() {
    showWPropMenu = !showWPropMenu;
        weldPropsMenuBox
            .style("pointer-events", showWPropMenu ? "auto" : "none")
            .style("display", showWPropMenu ? "block" : "none")
        wPropsLabsGroup
            .style("pointer-events", showWPropMenu ? "auto" : "none")
            .style("display", showWPropMenu ? "block" : "none")
        wPropsInputsGroup
            .style("pointer-events", showWPropMenu ? "auto" : "none")
            .style("display", showWPropMenu ? "block" : "none")
        wPropsUnitsGroup
            .style("pointer-events", showWPropMenu ? "auto" : "none")
            .style("display", showWPropMenu ? "block" : "none")
        wPropsButtonsGroup
            .style("pointer-events", showWPropMenu ? "auto" : "none")
            .style("display", showWPropMenu ? "block" : "none")
        wPropsIconsGroup
            .style("display", showWPropMenu ? "block" : "none")
        weldPropsButton
            .attr("fill-opacity", showWPropMenu ? 0.125 : 0)
            .attr("stroke-opacity", showWPropMenu ? 0.75 : 0.25)

}

const weldPropsButton = overlayGroup
    .append("rect")
    .attr("x", 5)
    .attr("y", firstButtonY-buttonPitch*2)
    .attr("width", buttonWidth)
    .attr("height", buttonHeight)
    .attr("rx", buttonCorner)
    .attr("ry", buttonCorner)
    .attr("fill", "black")
    .attr("fill-opacity", 0)
    .attr("stroke", "black")
    .attr("stroke-width", 0.5)
    .attr("stroke-opacity", 0.25)
    .on("click", function() {showHideProps()})
    // .style("display", "none")
const weldPropsIcon = overlayGroup
    .append("text")
    .attr("font-size", "16pt")
    .attr("text-anchor", "middle")
    // .attr("alignment-baseline", "text-before-edge")
    .style("pointer-events", "none")
    .attr("x", 5+(buttonWidth-2)/2)
    .attr("y", wPropsButtonProps.y+wPropsButtonProps.height/2-1.5)
    .attr("dy", "0.35em")
    .attr("opacity", 0.75)
    .text("🛠")
    // .style("display", "none")
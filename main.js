// Do Next:
    // Fringe plot
        // Add scale legend
        // Add user adjustable scale limits?
            // Input field as min/max labels on legend
            // Revert to min/max values by typing "min" or "max" into field
    // Add weld properties settings/menu
        // Select weld material or input strength allowable?
        // Select universal weld size or toggle ability to set welds individually
        // Select a min safety factor
        // Provide a min weld size based on above
    // Save & Share?
        // Generate url with current state parameters
        // Upon opening page, always attempt to load from url parameters
    // Undo/Redo?
        // Update save/share url with every action
        // Remember one (or X) previous url
        // Button with action to apply/navigate to previous url
    // Add applied moments?
        // Doesnt seem super essential (can achieve via forces)
        // Probably not too hard to implement though?
            // Moment applied directly to centroid (unlikely) adds to torsional
            // Moment applied elsewhere resolves to simple force at centroid (?) so direct shear only?
    // Add bending?!?
        // There's lots here...


// Initialize high level SVG stuff

const svg = d3.select("#topView"); // Defining the svg window (references element from index.html)
const zoomGroup = svg.append("g"); // Defines group that will contain all SVG elements that are effected by zoom/pan
const overlayGroup = svg.append("g"); // Defines group that will contain SVG elements that ignore zoom/pan and remain overlaid on window

// Define arrow marker for use at ends of vectors
const arrowPath = "M 0, -5 L 10, 0 L 0, 5";
const arrowGroup = zoomGroup.append("g")
    .append("defs")
    .append("marker")
    .attr("id", "arrowhead")
    .attr("viewBox", "0 -5 10 10")
    .attr("markerWidth", 4)
    .attr("markerHeight", 4)
    .attr("orient", "auto-start-reverse") // ensures direction of arrowhead follows the polyline
    .append("path")
    .attr("d", arrowPath)
    
const arrowBlu = zoomGroup.append("g")
    .append("defs")
    .append("marker")
    .attr("id", "B_arrowhead")
    .attr("viewBox", "0 -5 10 10")
    .attr("markerWidth", 4)
    .attr("markerHeight", 4)
    .attr("orient", "auto-start-reverse")
    .append("path")
    .attr("d", arrowPath)
    .attr("fill", "darkblue")
const arrowRd = zoomGroup.append("g")
    .append("defs")
    .append("marker")
    .attr("id", "R_arrowhead")
    .attr("viewBox", "0 -5 10 10")
    .attr("markerWidth", 4)
    .attr("markerHeight", 4)
    .attr("orient", "auto-start-reverse")
    .append("path")
    .attr("d", arrowPath)
    .attr("fill", "darkred")
const arrowPrp = zoomGroup.append("g")
    .append("defs")
    .append("marker")
    .attr("id", "P_arrowhead")
    .attr("viewBox", "0 -5 10 10")
    .attr("markerWidth", 4)
    .attr("markerHeight", 4)
    .attr("orient", "auto-start-reverse")
    .append("path")
    .attr("d", arrowPath)
    .attr("fill", "indigo")

const coordAxes = zoomGroup.append("g")
    .append("polyline")
    .attr("points", `${origin[0]},${origin[1]-axisLength} ${origin} ${origin[0]+axisLength},${origin[1]}`)
    .attr("fill", "none")
    .attr("stroke", "black")
    .attr("stroke-width", 1.75)
    // .attr("opacity", 0.75)
    .attr("marker-end", "url(#arrowhead")
    .attr("marker-start", "url(#arrowhead")
    .attr("stroke-dasharray", "2,3")
    .style("stroke-linecap", "round")
    .style("pointer-events", "none")
    // .style("display", "none")
const xAxisLab = zoomGroup.append("g")
    .append("text")
    .attr("font-size", "14px")
    .attr("font-weight", "bold")
    // .attr("opacity", 0.75)
    .attr("text-anchor", "start")
    .attr("alignment-baseline", "middle")
    .attr("x", origin[0]+axisLength)
    .attr("y", origin[1])
    .text("x")
    .attr("dx", 8)
    // .style("display", "none")
const yAxisLab = zoomGroup.append("g")
    .append("text")
    .attr("font-size", "14px")
    .attr("font-weight", "bold")
    // .attr("opacity", 0.75)
    .attr("text-anchor", "middle")
    .attr("alignment-baseline", "text-after-edge")
    .attr("x", origin[0])
    .attr("y", origin[1]-axisLength)
    .text("y")
    .attr("dy", -8)
    // .style("display", "none")
const originDot = zoomGroup.append("g")
    .append("circle")
    // .attr("opacity", 0.75)
    .attr("cx", origin[0])
    .attr("cy", origin[1])
    .attr("r", 3)
    // .style("display", "none")

// Define dot marker for use at origin of force vectors
const dotGroup = zoomGroup.append("g")
    .append("defs")
    .append("marker")
    .attr("id", "dots")
    .attr("viewBox", "-10 -10 20 20")
    .attr("markerWidth", 4)
    .attr("markerHeight", 4)
    .attr("orient", "auto-start-reverse")
    .append("path")
    .attr("d", d3.symbol().size(200)) //dont need to define "type" here as default is circle
    .attr("fill", "darkred")

// Max Stress Marker Gradient
const defs = svg.append("defs")
const radialGradient = defs.append("radialGradient")
    .attr("id", "circleGradient")
    .attr("cx", "50%")
    .attr("cy", "50%")
    .attr("r", "50%")
    .attr("spreadMethod", "pad")
radialGradient.append("stop")
    .attr("offset", "0%")
    .attr("stop-color", "indigo")
    .attr("stop-opacity", 0.75);
radialGradient.append("stop")
    .attr("offset", "100%")
    .attr("stop-color", "indigo")
    .attr("stop-opacity", 0);

const defsCirc = svg.append("defs")
const circGradient = defsCirc.append("radialGradient")
    .attr("id", "circGradient")
    .attr("cx", "50%")
    .attr("cy", "50%")
    .attr("r", "50%")
    .attr("spreadMethod", "pad")
circGradient.append("stop")
    .attr("offset", "0%")
    .attr("stop-color", "indigo")
    .attr("stop-opacity", 0);
circGradient.append("stop")
    .attr("offset", "50%")
    .attr("stop-color", "indigo")
    .attr("stop-opacity", 0.75);
circGradient.append("stop")
    .attr("offset", "100%")
    .attr("stop-color", "indigo")
    .attr("stop-opacity", 0);

// SVG Groups for the elements that require add/removal of data
    // I.e. elements associated with welds and loads, as these can be added/removed by user
    // Specific element definitions can be found in the "updateDrags()" & "updateData()" functions
const lineGroup = zoomGroup.append("g") // Weld lines
const fringeGroup = zoomGroup.append("g")
const wDragGroup = zoomGroup.append("g")
const tmaxGroup = zoomGroup.append("g") // Circles highlighting location(s) of max stress
const dShearGroup = zoomGroup.append("g") // Direct shear arrows
const tShearGroup = zoomGroup.append("g") // Torsional shear arrows
const fShearGroup = zoomGroup.append("g") // Total shear arrows
const nodeDragGroup = zoomGroup.append("g") // Drag-able circles for modification of weld geometry
const loadsGroup = zoomGroup.append("g") // Applied load Arrows
const lDragGroup = zoomGroup.append("g") // Drag-able circles for modification of applied load locations
const mDragGroup = zoomGroup.append("g") // Drag-able circles for modification of applied load magnitudes
const aDragGroup = zoomGroup.append("g") // Drag-able circles for modification of applied load orientations
const midGroup = zoomGroup.append("g") // Circle markers for visual indication of there the drag-able nodes are for modifying load orientation



// SVG Groups for on-diagram labels
    // Specific element definitions can be found in the "updateLabels()" function
const weldCoordLabsGoup = zoomGroup.append("g") // Labels for the (x,y) coords of each weld node. Visible on drag of specific node, or show/hide all via button
const loadCoordLabsGoup = zoomGroup.append("g") // Labels for the (x,y) coords of each applied load origin. Visible on drag of specific load, or show/hide all via button
const loadAngleLabsGroup = zoomGroup.append("g") // Labels for the value of each applied load angle. Visible on drag of specific load, or show/hide all via button
const loadMagLabsGroup = zoomGroup.append("g") // Labels for the value of each applied load magnitude. Visible on drag of specific load, or show/hide all via button
const WeldPropLabsGroup = zoomGroup.append("g") // Labels for the length and thickness of each weld. Visible on drag of specific load, or show/hide all via button

// Initialize elements for the above groups ("updateLabels()" is called within "updateData()"")
updateData()
updateDrags();

// Centroid of weld group
const centroidGroup = zoomGroup.append("g")
const cMark = centroidGroup.selectAll("circle")
    .data(centroidTot)
    .enter()
    .append("circle")
    .attr("r", 4)
    .attr("fill", "white")
    .attr("stroke", "black")
    .attr("stroke-width", 2)
    .attr("stroke-opacity", 0.68)
    .style("pointer-events", "none")
    .attr("cx", d => d.x)
    .attr("cy", d => d.y)

// Reaction force vector (at centroid)
const rxVGroup = zoomGroup.append("g")
const rxVector = rxVGroup.selectAll("polyline")
    .data(rxV)
    .enter()
    .append("polyline")
    .attr("stroke", "darkred")
    .attr("fill", "darkred")
    .attr("stroke-width", 3)
    .attr("stroke-dasharray", "2,5")
    .attr("opacity", 0.5)
    .attr("marker-end", "url(#R_arrowhead")
    .style("stroke-linecap", "round")
    .style("pointer-events", "none")

const rxMGroup = zoomGroup//.append("g")
// const rxMoment = rxMGroup.selectAll("path")
    .append("path")
    .attr("d", dM)
    .attr("stroke", "darkblue")
    .attr("stroke-width", 3)
    .attr("stroke-dasharray", "2,5")
    .attr("fill", "none")
    .attr("opacity", 0.5)
    .attr("marker-end", "url(#B_arrowhead")
    .style("stroke-linecap", "round")
    .style("pointer-events", "none")
    // .attr("display", "block")

const centroidCoordsGroup = zoomGroup.append("g")
const centroidCoords = centroidCoordsGroup.selectAll("text")
    .data(centroidTot)
    .enter()
    .append("text")
    .attr("font-size", "9px")
    .attr("text-anchor", "middle")
    .style("pointer-events", "none")
    .attr("x", d => d.x)
    .attr("y", d => d.y)
    .style("display", "block");

function inspectDrag(x, y) {
    const wSelect = weldCoords.find(j => j.id === selectedWeld)
    const xStart = wSelect.points[0].x;
    const yStart = wSelect.points[0].y;
    const xEnd = wSelect.points[1].x;
    const yEnd = wSelect.points[1].y;

    const xDelta = xEnd - xStart
    const yDelta = yEnd - yStart

    const fullDist = distToCoord(wSelect.len, "L")

    const startDist = Math.sqrt((x-xStart)*(x-xStart)+(y-yStart)*(y-yStart));
    const endDist = Math.sqrt((x-xEnd)*(x-xEnd)+(y-yEnd)*(y-yEnd));
    
    let inspDist = Math.max(startDist, endDist)
    inspDist = Math.min(fullDist, inspDist)

    inspectDist = Math.min(startDist, fullDist) //inspDist

    let xNew = 0;
    let yNew = 0;

    if (startDist > endDist) {
        xNew = xDelta/fullDist * inspDist + xStart
        yNew = yDelta/fullDist * inspDist + yStart
    } else {
        xNew = -xDelta/fullDist * inspDist + xEnd
        yNew = -yDelta/fullDist * inspDist + yEnd
    }

    inspectStress = calcShear(xNew, yNew)

    inspectDot
        .attr("cx", xNew)
        .attr("cy", yNew)
        // .attr("r", inspectStress/max_t*8+12)
        // .attr("stroke-opacity", Math.max(inspectStress/max_t, 0.5))
    
    inspectX = xNew
    inspectY = yNew

    // return [xNew, yNew]
}

function inspectFollow(dist=inspectDist) {
    const wSelect = weldCoords.find(j => j.id === selectedWeld)
    const xStart = wSelect.points[0].x;
    const yStart = wSelect.points[0].y;
    const xEnd = wSelect.points[1].x;
    const yEnd = wSelect.points[1].y;

    const xDelta = xEnd - xStart
    const yDelta = yEnd - yStart

    const fullDist = Math.sqrt((xEnd-xStart)*(xEnd-xStart)+(yEnd-yStart)*(yEnd-yStart))

    const inspDist = Math.min(fullDist, dist)
    inspectDist = inspDist

    const xNew = xDelta/fullDist * inspDist + xStart
    const yNew = yDelta/fullDist * inspDist + yStart

    inspectStress = calcShear(xNew, yNew)

    inspectDot
        .attr("cx", xNew)
        .attr("cy", yNew)

    inspectX = xNew
    inspectY = yNew
}

const inspectDot = zoomGroup
    .append("circle")
    .attr("r", 18)
    .attr("cy", 250)
    .attr("cx", 150)
    .attr("fill-opacity", 0)
    // .attr("stroke", "black")
    .attr("stroke-width", 20)
    .style("stroke", "url(#circGradient)")
    .call(d3.drag()
        .on("drag", function(event, d) {
            inspectDrag(event.x, event.y)
            updateWeldProps();
            // updateView()
        }) 
    )
    .style("display", showInspect ? "display" : "none")


// Zoom & Pan stuff
const zoom = d3.zoom()
    .scaleExtent([0.25, 10])
    .on("zoom", (event) => {
        // zoomGroup.attr("transform", event.transform);
        currentZoomTransform = event.transform;
        viewTransform();
        fitViewButton
            // .attr("fill-opacity", 0.5)
            // .attr("stroke-opacity", 0.25)
    });
svg.call(zoom)
    .on("dblclick.zoom", null);


//Overlay Stuff

const editBoxOffset = -10
const editBoxHeight = 40; 
const editFontSize = 12;
const editLabelX = 45;
const editFieldWidth = 55;
const editShowHide = "none"

// Edit Fields - Welds
let editWLabelX = `X (${units === "metric" ? "mm" : "in"})`
let editWLabelY = `Y (${units === "metric" ? "mm" : "in"})`
let editWLabelL = `L (${units === "metric" ? "mm" : "in"})`
let editWLabelT = `W (${units === "metric" ? "mm" : "in"})`

let editWObject = weldCoords.find(j => j.id === selectedWeld);

let editWValueX = coordToDist(editWObject.points[0].x, "x");
let editWValueY = coordToDist(editWObject.points[0].y, "y");
let editWValueL = editWObject.len;
let editWValueT = editWObject.thk * unitConvert;

let editingWX = false;
let editingWY = false;
let editingWL = false;
let editingWT = false;

let editTempX = 0;
let editDeltaX = 0;
let editTempY = 0;
let editDeltaY = 0;

function showHideWEdits(event) {
    if (showWeldEdit) {
            inputWBox.style("display", "none")
            inputWBox2.style("display", "none")
            inputWLabelX.style("display", "none")
            inputWFieldX
                .style("pointer-events", "none")
                .style("display", "none")
            inputWLabelY.style("display", "none")
            inputWFieldY.style("display", "none")
            inputWLabelL.style("display", "none")
            inputWFieldL.style("display", "none")
            inputWLabelT.style("display", "none")
            inputWFieldT.style("display", "none")
            editingWX = false;
            editingWY = false;
            editingWL = false;
            editingWT = false;
        } else {
            event.stopPropagation();
            selectWEditProp();     
            // inputWBox.style("display", "block")
            inputWBox.style("display", "block")
            inputWBox2.style("display", "block")
            inputWLabelX.style("display", "block")
            inputWFieldX
                .style("display", "block")
                .style("pointer-events", "auto")
            inputWLabelY.style("display", "block")
            inputWFieldY
                .style("display", "block")
                .style("pointer-events", "auto")
            inputWLabelL.style("display", "block")
            inputWFieldL
                .style("display", "block")
                .style("pointer-events", "auto")
            inputWLabelT.style("display", "block")
            inputWFieldT
                .style("display", "block")
                .style("pointer-events", "auto")
        }
        showWeldEdit = !showWeldEdit;
}

const dragWCoords = overlayGroup
    .append("text")
    .attr("font-size", "8pt")
    .attr("text-anchor", "start")
    .attr("alignment-baseline", "text-before-edge")
    .style("pointer-events", "none")
    .attr("x", 5)
    .attr("y", 40-19) //40 , 20
    // .on("mousedown", function(event) {
    //     showHideWEdits(event);
    // })

const dragWProps = overlayGroup
    .append("text")
    .attr("font-size", "8pt")
    .attr("text-anchor", "start")
    .attr("alignment-baseline", "text-before-edge")
    .style("pointer-events", "none")
    .attr("x", 5)
    .attr("y", 25-19) //25 , 5
    // .on("mousedown", function(event) {
    //     showHideWEdits(event);
    // })

const showHideWProps = overlayGroup
    .append("rect")
    .attr("x", -10)
    .attr("y", -10)
    .attr("rx", 5)
    .attr("ry", 5)
    .attr("width", 160)
    .attr("height", 50)
    .attr("opacity", 0.1)
    .on("mousedown", function(event) {
        showHideWProps.attr("opacity", 0.1)
        showHideWEdits(event)
    })

const inputWBox2 = overlayGroup
    .append("rect")
    .attr("x", editBoxOffset) // -10, -150
    .attr("y", editBoxHeight)
    .attr("width", editBoxOffset+125) // 65
    .attr("height", 86)
    .attr("rx", 5)
    .attr("ry", 5)
    .attr("fill-opacity", 0.1)
    .attr("fill", "black")
    .attr("stroke", "black")
    .attr("stroke-width", 0.5)
    // .on("mousedown", function(event) {
    //     event.stopPropagation();
    // })
    .style("display", editShowHide)

// Group attributes common to input labels
const inputWLabsGroup = overlayGroup.append("g")
    .attr("text-anchor", "end")
    .attr("alignment-baseline", "middle")
    .style("text-align", "right")
    .attr("font-size", `${editFontSize}px`)
    .style("pointer-events", "none")

const inputWLabelX = inputWLabsGroup
    .append("text")
    .attr("x", editLabelX) //50
    .attr("y", editBoxHeight+57)
    .text(`${editWLabelX}`)
    .style("display", editShowHide)
const inputWLabelY = inputWLabsGroup
    .append("text")
    .attr("x", editLabelX) //50
    .attr("y", editBoxHeight+77)
    .text(`${editWLabelY}`)
    .style("display", editShowHide)
const inputWLabelL = inputWLabsGroup
    .append("text")
    .attr("x", editLabelX) //50
    .attr("y", editBoxHeight+17)
    .text(`${editWLabelL}`)
    .style("display", editShowHide)
const inputWLabelT = inputWLabsGroup
    .append("text")
    .attr("x", editLabelX) //50
    .attr("y", editBoxHeight+37)
    .text(`${editWLabelT}`)
    .style("display", editShowHide)

const inputWBox = overlayGroup
    .append("rect")
    .attr("x", editBoxOffset) // -10
    .attr("y", editBoxHeight)
    .attr("width", editLabelX-editBoxOffset+5) // 65
    .attr("height", 86)
    .attr("fill-opacity", 0.25)
    .attr("stroke", "black")
    .attr("stroke-width", 0.5)
    .on("mousedown", function(event) {
        showHideWEdits(event);
    })
    .style("display", editShowHide)

const inputWFieldsGroup = overlayGroup.append("g")
    .attr("font-size", `${editFontSize}px`)
    .attr("text-anchor", "start")
    .attr("alignment-baseline", "middle")
    .style("text-align", "center")
    .style("pointer-events", "none")

let inputWContentX = "0"
let inputWContentY = "0"
let inputWContentL = "0"
let inputWContentT = "0"

const inputWFieldX = inputWFieldsGroup
    .append("foreignObject")
    .attr("x", editLabelX-editBoxOffset-5) //60, -60
    .attr("y", editBoxHeight+47)
    .attr("width", `${editFieldWidth}px`)
    .attr("height", "20px")
    .append(`xhtml:div`)
    .append(`div`)
    .attr("contentEditable", true)
    .text(editWValueX.toFixed(2))
    .on("mousedown", function(event) {
        event.stopPropagation();
        editingWX = true; // true
        editingWY = false;
        editingWL = false;
        editingWT = false;
        selectWEditProp(); 
        editTempX = editWValueX;
    })
    .on("keyup", function(event) {
        inputWContentX = d3.select(this).text();
        if (!isFinite(inputWContentX)) return;
        if (selectedWProp.includes("start")) {
            editWObject.points[0].x = distToCoord(inputWContentX, "x")
        } else if (selectedWProp.includes("end")) {
            editWObject.points[1].x = distToCoord(inputWContentX, "x")
        } else {
            if (inputWContentX === editTempX) return;
            editDeltaX = inputWContentX-editTempX
            editWObject.points[0].x = editWObject.points[0].x + distToCoord(editDeltaX, "d")
            editWObject.points[1].x = editWObject.points[1].x + distToCoord(editDeltaX, "d")
            editTempX = inputWContentX;
        }
        updateView();
        updateWeldProps();
        updateLoadProps();
    })
    .on("keydown", function(event) {
        if (event.key === "Enter") {
            event.preventDefault();
            event.target.blur();
            editingWX = false;
            editingWY = false;
            editingWL = false;
            editingWT = false;
            selectWEditProp(); 
        }
    })
    .style("display", editShowHide)

const inputWFieldY = inputWFieldsGroup
    .append("foreignObject")
    .attr("x", editLabelX-editBoxOffset-5) //60, -60
    .attr("y", editBoxHeight+67)
    .attr("width", `${editFieldWidth}px`)
    .attr("height", "20px")
    .append(`xhtml:div`)
    .append(`div`)
    .attr("contentEditable", true)
    .text(editWValueY.toFixed(2))
    .on("mousedown", function(event) {
        event.stopPropagation();
        editingWX = false;
        editingWY = true; // true
        editingWL = false;
        editingWT = false;
        selectWEditProp(); 
        editTempY = editWValueY;
    })
    .on("keyup", function(event) {
        inputWContentY = d3.select(this).text();
        if (!isFinite(inputWContentY)) return;
        if (selectedWProp.includes("start")) {
            editWObject.points[0].y = distToCoord(inputWContentY, "y")
        } else if (selectedWProp.includes("end")) {
            editWObject.points[1].y = distToCoord(inputWContentY, "y")
        } else {
            if (inputWContentY === editTempY) return;
            editDeltaY = inputWContentY-editTempY
            editWObject.points[0].y = editWObject.points[0].y - distToCoord(editDeltaY, "d")
            editWObject.points[1].y = editWObject.points[1].y - distToCoord(editDeltaY, "d")
            editTempY = inputWContentY;
        }
        updateView();
        updateWeldProps();
        updateLoadProps();
    })
    .on("keydown", function(event) {
        if (event.key === "Enter") {
            event.preventDefault();
            event.target.blur();
            editingWX = false;
            editingWY = false;
            editingWL = false;
            editingWT = false;
            selectWEditProp(); 
        }
    })
    .style("display", editShowHide)

const inputWFieldL = inputWFieldsGroup
    .append("foreignObject")
    .attr("x", editLabelX-editBoxOffset-5) //60, -60
    .attr("y", editBoxHeight+7)
    .attr("width", `${editFieldWidth}px`)
    .attr("height", "20px")
    .append(`xhtml:div`)
    .append(`div`)
    .attr("contentEditable", true)
    .text(editWValueL.toFixed(2))
    .on("mousedown", function(event) {
        event.stopPropagation();
        editingWX = false;
        editingWY = false;
        editingWL = true; // true
        editingWT = false;
        selectWEditProp(); 
    })
    .on("keyup", function(event) {
        inputWContentL = d3.select(this).text();
        if (!isFinite(inputWContentL)) return;
        updateWeldLength(inputWContentL);
        updateView();
        updateWeldProps();
        updateLoadProps();
    })
    .on("keydown", function(event) {
        if (event.key === "Enter") {
            event.preventDefault();
            event.target.blur();
            editingWX = false;
            editingWY = false;
            editingWL = false;
            editingWT = false;
            selectWEditProp(); 
        }
    })
    .style("display", editShowHide)

const inputWFieldT = inputWFieldsGroup
    .append("foreignObject")
    .attr("x", editLabelX-editBoxOffset-5) //60, -60
    .attr("y", editBoxHeight+27)
    .attr("width", `${editFieldWidth}px`)
    .attr("height", "20px")
    .append(`xhtml:div`)
    .append(`div`)
    .attr("contentEditable", true)
    .text(editWValueT.toFixed(2))
    .on("mousedown", function(event) {
        event.stopPropagation();
        editingWX = false;
        editingWY = false;
        editingWL = false;
        editingWT = true; // true
        selectWEditProp(); 
    })
    .on("keyup", function(event) {
        inputWContentT = d3.select(this).text();
        if (!isFinite(inputWContentT)) return;
        editWObject.thk = inputWContentT / unitConvert
        updateView();
        updateLoadProps();
        updateWeldProps();
        
    })
    .on("keydown", function(event) {
        if (event.key === "Enter") {
            event.preventDefault();
            event.target.blur();
            editingWX = false;
            editingWY = false;
            editingWL = false;
            editingWT = false;
            selectWEditProp(); 
        }
    })
    .style("display", editShowHide)

// Edit Field - Loads
let editLLabelX = `X (${units === "metric" ? "mm" : "in"})`
let editLLabelY = `Y (${units === "metric" ? "mm" : "in"})`
let editLLabelF = `F (${units === "metric" ? "N" : "lbf"})`
let editLLabelA = `θ (°)`

let editLObject = loadProps.find(j => j.id === selectedLoad);

let editLValueX = coordToDist(editLObject.x, "x");
let editLValueY = coordToDist(editLObject.y, "y");
let editLValueF = editLObject.mag;
let editLValueA = editLObject.th;

let editingLX = false;
let editingLY = false;
let editingLF = false;
let editingLA = false;

function showHideLEdits(event) {
    if (showLoadEdit) {
            inputLBox.style("display", "none")
            inputLBox2.style("display", "none")
            inputLLabelX.style("display", "none")
            inputLFieldX
                .style("pointer-events", "none")
                .style("display", "none")
            inputLLabelY.style("display", "none")
            inputLFieldY.style("display", "none")
            inputLLabelF.style("display", "none")
            inputLFieldF.style("display", "none")
            inputLLabelA.style("display", "none")
            inputLFieldA.style("display", "none")
            editingLX = false;
            editingLY = false;
            editingLF = false;
            editingLA = false;
        } else {
            event.stopPropagation();
            selectLEditProp();     
            // inputWBox.style("display", "block")
            inputLBox.style("display", "block")
            inputLBox2.style("display", "block")
            inputLLabelX.style("display", "block")
            inputLFieldX
                .style("display", "block")
                .style("pointer-events", "auto")
            inputLLabelY.style("display", "block")
            inputLFieldY
                .style("display", "block")
                .style("pointer-events", "auto")
            inputLLabelF.style("display", "block")
            inputLFieldF
                .style("display", "block")
                .style("pointer-events", "auto")
            inputLLabelA.style("display", "block")
            inputLFieldA
                .style("display", "block")
                .style("pointer-events", "auto")
        }
        showLoadEdit = !showLoadEdit;
}

const dragLCoords = overlayGroup
    .append("text")
    .attr("font-size", "8pt")
    .attr("text-anchor", "end")
    .attr("alignment-baseline", "text-before-edge")
    .style("pointer-events", "none")
    .attr("x", windowWidth-5)
    .attr("y", 40-19) //40, 20
    // .on("mousedown", function(event) {
    //     showHideLEdits(event);
    // })
    // .style("display", "none");

const dragLProps = overlayGroup
    .append("text")
    .attr("font-size", "8pt")
    .attr("text-anchor", "end")
    .attr("alignment-baseline", "text-before-edge")
    .style("pointer-events", "none")
    .attr("x", windowWidth-5)
    .attr("y", 25-19) //25, 5
    // .on("mousedown", function(event) {
    //     showHideLEdits(event);
    // })
    // .style("display", "none")

const showHideLProps = overlayGroup
    .append("rect")
    .attr("x", windowWidth-150+10)
    .attr("y", -10)
    .attr("rx", 5)
    .attr("ry", 5)
    .attr("width", 180)
    .attr("height", 50)
    .attr("opacity", 0.1)
    .on("mousedown", function(event) {
        showHideLEdits(event);
    })

const inputLBox2 = overlayGroup
    .append("rect")
    .attr("x", 500+editBoxOffset-editLabelX-50) // -10, -150
    .attr("y", editBoxHeight)
    .attr("width", 125) // 65
    .attr("height", 86)
    .attr("rx", 5)
    .attr("ry", 5)
    .attr("fill-opacity", 0.1)
    .attr("fill", "black")
    .attr("stroke", "black")
    .attr("stroke-width", 0.5)
    .style("display", editShowHide)

const inputLLabsGroup = overlayGroup.append("g")
    .attr("text-anchor", "start")
    .attr("alignment-baseline", "middle")
    .style("text-align", "right")
    .attr("font-size", `${editFontSize}px`)
    .style("pointer-events", "none")

const inputLLabelX = inputLLabsGroup
    .append("text")
    .attr("x", 500-editLabelX) //50
    .attr("y", editBoxHeight+57)
    .text(`${editLLabelX}`)
    .style("display", editShowHide)
const inputLLabelY = inputLLabsGroup
    .append("text")
    .attr("x", 500-editLabelX) //50
    .attr("y", editBoxHeight+77)
    .text(`${editLLabelY} `)
    .style("display", editShowHide)
const inputLLabelF = inputLLabsGroup
    .append("text")
    .attr("x", 500-editLabelX) //50
    .attr("y", editBoxHeight+17)
    .text(`${editLLabelF}`)
    .style("display", editShowHide)
const inputLLabelA = inputLLabsGroup
    .append("text")
    .attr("x", 500-editLabelX) //50
    .attr("y", editBoxHeight+37)
    .text(`${editLLabelA}`)
    .style("display", editShowHide)

const inputLBox = overlayGroup
    .append("rect")
    .attr("x", 500-editLabelX-5) // -10
    .attr("y", editBoxHeight)
    .attr("width", 65) // 65
    .attr("height", 86)
    .attr("fill-opacity", 0.25)
    .attr("stroke", "black")
    .attr("stroke-width", 0.5)
    .on("mousedown", function(event) {
        showHideLEdits(event);
    })
    .style("display", editShowHide)


const inputLFieldsGroup = overlayGroup.append("g")
    .attr("font-size", `${editFontSize}px`)
    .attr("text-anchor", "end")
    .attr("alignment-baseline", "middle")
    .style("text-align", "center")
    .style("pointer-events", "none")

let inputLContentX = "0"
let inputLContentY = "0"
let inputLContentF = "0"
let inputLContentA = "0"

const inputLFieldX = inputLFieldsGroup
    .append("foreignObject")
    .attr("x", 500-editLabelX-60) //60, -60
    .attr("y", editBoxHeight+47)
    .attr("width", `${editFieldWidth}px`)
    .attr("height", "20px")
    .append(`xhtml:div`)
    .append(`div`)
    .attr("contentEditable", true)
    .text(editLValueX.toFixed(2))
    .on("mousedown", function(event) {
        event.stopPropagation();
        editingLX = true; // true
        editingLY = false;
        editingLF = false;
        editingLA = false;
        selectLEditProp(); 
    })
    .on("keyup", function(event) {
        inputLContentX = d3.select(this).text();
        if (!isFinite(inputLContentX)) return;
        editLObject.x = distToCoord(inputLContentX, "x")
        updateView();
        updateWeldProps();
        updateLoadProps();
        
    })
    .on("keydown", function(event) {
        if (event.key === "Enter") {
            event.preventDefault();
            event.target.blur();
            editingWX = false;
            editingWY = false;
            editingWL = false;
            editingWT = false;
            selectLEditProp(); 
        }
    })
    .style("display", editShowHide)

const inputLFieldY = inputLFieldsGroup
    .append("foreignObject")
    .attr("x", 500-editLabelX-60) //60, -60
    .attr("y", editBoxHeight+67)
    .attr("width", `${editFieldWidth}px`)
    .attr("height", "20px")
    .append(`xhtml:div`)
    .append(`div`)
    .attr("contentEditable", true)
    .text(editLValueY.toFixed(2))
    .on("mousedown", function(event) {
        event.stopPropagation();
        editingLX = false;
        editingLY = true; // true
        editingLF = false;
        editingLA = false;
        selectLEditProp(); 
    })
    .on("keyup", function(event) {
        inputLContentY = d3.select(this).text();
        if (!isFinite(inputLContentY)) return;
        editLObject.y = distToCoord(inputLContentY, "y")
        updateView();
        updateWeldProps();
        updateLoadProps();
    })
    .on("keydown", function(event) {
        if (event.key === "Enter") {
            event.preventDefault();
            event.target.blur();
            editingLX = false;
            editingLY = false;
            editingLF = false;
            editingLA = false;
            selectLEditProp(); 
        }
    })
    .style("display", editShowHide)

const inputLFieldF = inputLFieldsGroup
    .append("foreignObject")
    .attr("x", 500-editLabelX-60) //60, -60
    .attr("y", editBoxHeight+7)
    .attr("width", `${editFieldWidth}px`)
    .attr("height", "20px")
    .append(`xhtml:div`)
    .append(`div`)
    .attr("contentEditable", true)
    .text(editLValueF.toFixed(2))
    .on("mousedown", function(event) {
        event.stopPropagation();
        editingLX = false;
        editingLY = false;
        editingLF = true; // true
        editingLA = false;
        selectLEditProp(); 
    })
    .on("keyup", function(event) {
        inputLContentF = d3.select(this).text();
        if (!isFinite(inputLContentF)) return;
        editLObject.mag = inputLContentF /forceConvert;
        updateView();
        updateWeldProps();
        updateLoadProps();
    })
    .on("keydown", function(event) {
        if (event.key === "Enter") {
            event.preventDefault();
            event.target.blur();
            editingLX = false;
            editingLY = false;
            editingLF = false;
            editingLA = false;
            selectLEditProp(); 
        }
    })
    .style("display", editShowHide)

const inputLFieldA = inputLFieldsGroup
    .append("foreignObject")
    .attr("x", 500-editLabelX-60) //60, -60
    .attr("y", editBoxHeight+27)
    .attr("width", `${editFieldWidth}px`)
    .attr("height", "20px")
    .append(`xhtml:div`)
    .append(`div`)
    .attr("contentEditable", true)
    .text(editLValueA.toFixed(2))
    .on("mousedown", function(event) {
        event.stopPropagation();
        editingLX = false;
        editingLY = false;
        editingLF = false;
        editingLA = true; // true
        selectLEditProp(); 
    })
    .on("keyup", function(event) {
        inputLContentA = d3.select(this).text();
        if (!isFinite(inputWContentT)) return;
        editLObject.th = inputLContentA * 1;
        updateView();
        updateWeldProps();
        updateLoadProps();
    })
    .on("keydown", function(event) {
        if (event.key === "Enter") {
            event.preventDefault();
            event.target.blur();
            editingLX = false;
            editingLY = false;
            editingLF = false;
            editingLA = false;
            selectLEditProp(); 
        }
    })
    .style("display", editShowHide)

const centroidProps = overlayGroup
    .append("text")
    .attr("font-size", "8pt")
    // .attr("font-weight", "bold")
    .attr("text-anchor", "middle")
    .attr("alignment-baseline", "text-before-edge")
    .style("pointer-events", "none")
    .attr("x", windowWidth/2)
    .attr("y", 5)
    // .style("display", "none")
    // .text("Centroid: ")
const RxVProps = overlayGroup
    .append("text")
    .attr("font-size", "8pt")
    // .attr("font-weight", "bold")
    .attr("text-anchor", "middle")
    .attr("alignment-baseline", "text-before-edge")
    .style("pointer-events", "none")
    .attr("x", windowWidth/2)
    .attr("y", 20)
    .attr("fill", "darkred")
    // .style("display", "none")
    // .text("RxV: F= , th= ")
const RxMProps = overlayGroup
    .append("text")
    .attr("font-size", "8pt")
    // .attr("font-weight", "bold")
    .attr("text-anchor", "middle")
    .attr("alignment-baseline", "text-before-edge")
    .style("pointer-events", "none")
    .attr("x", windowWidth/2)
    .attr("y", 35)
    .attr("fill", "darkblue")
    // .style("display", "none")
    // .text(`RxM: ${rxM.toFixed(1)}`)
    
const tMaxProps = overlayGroup
    .append("text")
    .attr("font-size", "10pt")
    // .attr("font-weight", "bold")
    .attr("text-anchor", "middle")
    .attr("alignment-baseline", "text-before-edge")
    .style("pointer-events", "none")
    .attr("x", windowWidth/2)
    .attr("y", 46)
    .attr("fill", "indigo")
    // .style("display", "none")
    // .text(`tmax: ${max_t.toFixed(1)}`)


const RxShowHide = overlayGroup
    .append("rect")
    .attr("x", 250-55)
    .attr("y", -10)
    .attr("rx", 5)
    .attr("ry", 5)
    .attr("width", 110)
    .attr("height", 80) // 65
    .attr("opacity", 0.1)
    .on("click", function() {
        showRx = !showRx
        rxVector
            .style("display", showRx ? "block" : "none")
        rxMGroup
            .style("display", showRx && Math.abs(rxM) > 0.1 ? "block" : "none")
    })

// On-Display Buttons
const yShift = 30;

const firstButtonY = windowHeight-64;
const buttonHeight = 30;
const buttonWidth = 30;
const buttonPitch = buttonHeight + 5
const buttonCorner = 5;

const lockIcon = overlayGroup
    .append("text")
    .attr("font-size", "20px")
    .attr("text-anchor", "middle")
    .attr("alignment-baseline", "text-before-edge")
    .style("pointer-events", "none")
    .attr("x", 19)
    .attr("y", firstButtonY+3)
    .attr("opacity", 0.75)
    .text("🔓")
const lockButton = overlayGroup
    .append("rect")
    .attr("x", 5)
    .attr("y", firstButtonY)
    .attr("width", buttonWidth-1)
    .attr("height", buttonHeight)
    .attr("rx", buttonCorner)
    .attr("ry", buttonCorner)
    .attr("fill", "black")
    .attr("fill-opacity", 0)
    .attr("stroke", "black")
    .attr("stroke-width", 0.5)
    .attr("stroke-opacity", 0.25)
    .on("click", function() {lockUnlock()})
    // .append("title")
    // .text("Lock/Unlock Geometry");

const unitsIcon = overlayGroup
    .append("text")
    .attr("font-size", "9pt")
    .attr("text-anchor", "middle")
    .attr("alignment-baseline", "text-before-edge")
    .style("pointer-events", "none")
    .attr("x", windowWidth-20)
    .attr("y", firstButtonY+8-buttonPitch)
    .attr("opacity", 0.75)
    .text("IN")
const unitsButton = overlayGroup
    .append("rect")
    .attr("x", windowWidth-5-buttonWidth)
    .attr("y", firstButtonY-buttonPitch)
    .attr("width", buttonWidth)
    .attr("height", buttonHeight)
    .attr("rx", buttonCorner)
    .attr("ry", buttonCorner)
    .attr("fill", "black")
    .attr("fill-opacity", 0)
    .attr("stroke", "black")
    .attr("stroke-width", 0.5)
    .attr("stroke-opacity", 0.25)
    .on("click", function() {unitSwap()})
    // .append("title")
    // .text(`Toggle Units`)

const weldZone = overlayGroup.append("g")
    .append("text")
    .attr("font-size", "9pt")
    .attr("font-weight", "bold")
    .attr("text-anchor", "start")
    .attr("alignment-baseline", "text-after-edge")
    .style("pointer-events", "none")
    .attr("x", 27)
    .attr("y", windowHeight-5)
    // .on("click", function(event, d) {
    //     showWeldProps = !showWeldProps
    //     updateView();
    //     })
    .text("Welds")
    // .style("display", "none");

const addWButton = overlayGroup.append("g")
    .append("rect")
    .attr("x", 4)
    .attr("y", windowHeight-3-18)
    .attr("width", 18)
    .attr("height", 18)
    .attr("rx", buttonCorner)
    .attr("ry", buttonCorner)
    .attr("fill", "black")
    .attr("opacity", 0.1)
    .on("click", function() {addWeld()})
    .append("title")
    .text(`Add Weld`)
const addWIcon = overlayGroup.append("g")
    .append("text")
    .attr("font-size", "20px")
    .attr("text-anchor", "middle")
    // .attr("alignment-baseline", "middle")
    .attr("text-anchor", "middle")
    .attr("font-family", "Arial, Helvetica, sans-serif")
    .style("pointer-events", "none")
    .attr("x", 13)
    .attr("y", windowHeight-12)
    .attr("dy", "0.35em")
    .attr("opacity", 1)
    .attr("fill", "green")
    .text("+")

const removeWButton = overlayGroup.append("g")
    .append("rect")
    .attr("x", 66)
    .attr("y", windowHeight-3-18)
    .attr("width", 18)
    .attr("height", 18)
    .attr("rx", buttonCorner)
    .attr("ry", buttonCorner)
    .attr("fill", "black")
    .attr("opacity", 0.1)
    .on("click", function() {removeWeld(selectedWeld)})
    .append("title")
    .text(`Delete Weld`)
    // .style("display", "none")
const removeWIcon = overlayGroup.append("g")
    .append("text")
    .attr("font-size", "20px")
    // .attr("font-weight", "bold")
    .attr("text-anchor", "middle")
    .attr("alignment-baseline", "middle")
    // .attr("transform", "rotate(45, 73, 14)")
    .style("pointer-events", "none")
    .attr("x", 75)
    .attr("y", windowHeight-12)
    .attr("opacity", 1)
    .attr("fill", "red")
    .text("-")
    // .style("display", "none")
    
const loadZone = overlayGroup.append("g")
    .append("text")
    .attr("font-size", "9pt")
    .attr("font-weight", "bold")
    .attr("text-anchor", "end")
    .attr("alignment-baseline", "text-after-edge")
    .style("pointer-events", "none")
    .attr("x", windowWidth-27)
    .attr("y", windowHeight-5)
    // .on("click", function(event, d) {
    //     showLoadProps = !showLoadProps
    //     updateView();
    // })
    .text("Loads")
    // .style("display", "none");

const addLButton = overlayGroup.append("g")
    .append("rect")
    .attr("x", windowWidth-4-18)
    .attr("y", windowHeight-3-18)
    .attr("width", 18)
    .attr("height", 18)
    .attr("rx", buttonCorner)
    .attr("ry", buttonCorner)
    .attr("fill", "black")
    .attr("opacity", 0.1)
    .on("click", function() {addLoad()})
    .append("title")
    .text(`Add Load`)
const addLIcon = overlayGroup.append("g")
    .append("text")
    .attr("font-size", "20px")
    .attr("text-anchor", "middle")
    // .attr("alignment-baseline", "middle")
    .attr("font-family", "Arial, Helvetica, sans-serif")
    .style("pointer-events", "none")
    .attr("x", windowWidth-13)
    .attr("y", windowHeight-12)
    .attr("dy", "0.35em")
    .attr("opacity", 1)
    .attr("fill", "green")
    .text("+")

const removeLButton = overlayGroup.append("g")
    .append("rect")
    .attr("x", windowWidth-66-18)
    .attr("y", windowHeight-3-18)
    .attr("width", 18)
    .attr("height", 18)
    .attr("rx", buttonCorner)
    .attr("ry", buttonCorner)
    .attr("fill", "black")
    .attr("opacity", 0.1)
    .on("click", function() {removeLoad(selectedLoad)})
    .append("title")
    .text(`Delete Weld`)
    // .style("display", "none")
const removeLIcon = overlayGroup.append("g")
    .append("text")
    .attr("font-size", "20px")
    // .attr("font-weight", "bold")
    .attr("text-anchor", "middle")
    .attr("alignment-baseline", "middle")
    // .attr("transform", "rotate(45, 73, 14)")
    .style("pointer-events", "none")
    .attr("x", windowWidth-75)
    .attr("y", windowHeight-12)
    .attr("opacity", 1)
    // .attr("fill", "white")
    .attr("fill", loadCount === 1 ? "white" : "red")
    .text("-")
    // .style("display", "none")

const inspBoxWidth = 100;
const inspBoxHeight = 40
const inspPropsBox = overlayGroup
    .append("rect")
    .attr("x", windowWidth/2-inspBoxWidth/2)
    .attr("y", windowHeight-inspBoxHeight)
    .attr("width", inspBoxWidth)
    .attr("height", inspBoxHeight+10)
    .attr("rx", buttonCorner)
    .attr("ry", buttonCorner)
    .attr("fill", "black")
    .attr("opacity", 0.125)
    .style("display", "none")
    // .attr("stroke", "url(#circGradient)")
    // .attr("stroke-width", 20)

const inspPropsText = overlayGroup
    .append("text")
    .attr("font-family", "ariel")
    .attr("font-size", "10pt")
    .attr("fill", "indigo")
    .attr("text-anchor", "middle")
    .attr("alignment-baseline", "text-before-edge")
    .style("pointer-events", "none")
    .attr("x", windowWidth/2)
    .attr("y", windowHeight-inspBoxHeight+2.5)
   
//     M ${0+x} ${-5+y}
//     A 5 5 ${0+x} 1 1 ${0+x} ${5+y}
//     A 5 5 ${0+x} 1 1 ${0+x} ${-5+y}

function drawFitIcon(x, y) {
    const boxSize = 14;
    const snapPath = `

    M ${x-boxSize/2} ${y-boxSize/4}
    L  ${x-boxSize/2} ${y-boxSize/2}
    L  ${x-boxSize/4} ${y-boxSize/2}

    M ${x+boxSize/2} ${y-boxSize/4}
    L  ${x+boxSize/2} ${y-boxSize/2}
    L  ${x+boxSize/4} ${y-boxSize/2}

    M ${x-boxSize/2} ${y+boxSize/4}
    L  ${x-boxSize/2} ${y+boxSize/2}
    L  ${x-boxSize/4} ${y+boxSize/2}
    
    M ${x+boxSize/2} ${y+boxSize/4}
    L  ${x+boxSize/2} ${y+boxSize/2}
    L  ${x+boxSize/4} ${y+boxSize/2}

    `
    return snapPath
}

const fitViewIcon = overlayGroup
    .append("path")
    .attr("stroke", "black")
    .attr("stroke-width", 1)
    .attr("fill", "none")
    .attr("d", drawFitIcon(windowWidth-16-4, 
        windowHeight-buttonPitch-14
    ))
    .style("pointer-events", "none")
    // .style("display", "none")

const fitViewButton = overlayGroup
    .append("rect")
    .attr("x", windowWidth-5-buttonWidth)
    .attr("y", firstButtonY)
    .attr("width", buttonWidth)
    .attr("height", buttonHeight)
    .attr("rx", buttonCorner)
    .attr("ry", buttonCorner)
    .attr("fill", "black")
    .attr("fill-opacity", 0)
    .attr("stroke", "black")
    .attr("stroke-width", 0.5)
    .attr("stroke-opacity", 0.5)
    .on("click", function() {fitView()})
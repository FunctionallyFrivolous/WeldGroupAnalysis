// Do Next:
    // User Inputs
        // Implement length edit
            // Logic: Use length input to calc new "end" node position, based on "start" node coords and original slope
        // Add loads version
            // Should be much simpler as there are only 3 props so no need for logic to switch between each
            // Then remove html buttons!!!
        // Show edit fields by clicking any part of the overlay props (currenly only coords)
            // Either add clickability to id/length/size line, or put a clickable box around all
        // Alt method to close edit fields?
            // Currently only "Enter" (maybe remove this)
            // Click or dblclick on the field labels?
            // Click on overlay props (same as opwn/show)
                // Logical option to have both actions via same input
    // Snap Upgrades
        // Snap when dragging weld (mid node)?
        // Snap to 45deg?
        // Snap/lock weld angle
        // Snap to weld line (slide along weld)
    // Move to SVG
        // Rx?
            // Rx Button?
            // Double click on centroid?
            // Both?
        // Show/Hide stresses?
            // Multiple buttons?
            // Expanding menu?
        // Axes
            // Button
            // Single click turns on/off
            // Double click expands slider to adjust length 
        // Settings
            // Snap Threshold
            // Load Scale
            // Stress Scale
            // These ^ should be buttons in SVG window that, when clicked, expand into a slider to change values
                // Static line/polyline
                // Dragable circle (lock in x axis)
                // Update variables in the background based on drag y value
                // Maybe also a dynamic line who's length increases with drag y value
        // Fit View Button
            // Implement html button first
    // Scale axes to fill/remain in window. But it must pan in order to remain at the true origin
        // This is end goal for sure...
        // Overlay it and then update x,y vals to match pan
    // Drag-able weld inspection node
        // Gives stress value(s) at current location
        // Colored relative to min/max stress scale
        // Only when geometry is locked
    // Add legend?
        // Click Button to show/hide
        // Design Elements
            // Welds
            // Centroid
            // Applied Loads
            // Reaction V & M
            // Stresses (direct, torsion, total)
            // Max Stress locations
        // Buttons
            // Geom Lock
            // Units
            // Add/Remove Weld/Load
    // Add bending?!?
        // There's lots here, so this should be held until all pre-bending functionality is squared away
    // Add applied moments?
        // Doesnt seem super essential (can achieve via forces)
        // Probably not too hard to implement though?
            // Moment applied directly to centroid (unlikely) adds to torsional
            // Moment applied elsewhere resolves to simple force at centroid (?) so direct shear only?
    //Stress color gradient (fringe plot)?
        // In theory should only need 3 points/values for this?
            // Max val will always be one of the ends of the weld
            // Min val will always be the point closest to the centroid
    // Undo/Redo?

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
    // .attr("fill", "context-stroke")
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

// SVG Groups for the elements that require add/removal of data
    // I.e. elements associated with welds and loads, as these can be added/removed by user
    // Specific element definitions can be found in the "updateDrags()" & "updateData()" functions
const lineGroup = zoomGroup.append("g") // Weld lines
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
    // .attr("opacity", 0.5)
    .attr("stroke", "black")
    .attr("stroke-width", 2)
    .attr("stroke-opacity", 0.68)
    .style("pointer-events", "none")
    .attr("cx", d => d.x)
    .attr("cy", d => d.y);

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
    // .attr("fill", "none")
    .attr("marker-end", "url(#R_arrowhead")
    // .attr("marker-start", "url(#dots")
    .style("stroke-linecap", "round")
    .style("pointer-events", "none")
    // .attr("display", "block")

const rxMGroup = zoomGroup.append("g")
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


// Zoom & Pan stuff
const zoom = d3.zoom()
    .scaleExtent([0.25, 10])
    .on("zoom", (event) => {
        // zoomGroup.attr("transform", event.transform);
        currentZoomTransform = event.transform;
        viewTransform();
    });
svg.call(zoom)
    .on("dblclick.zoom", null);


//Overlay Stuff
let editWLabel1 = "Start X"
let editWLabel2 = "Start Y"
let editWLabelL = "Length"
let editWLabelT = "Size"

let editWObject = weldCoords.find(j => j.id === selectedWeld);

let editWValue1 = coordToDist(editWObject.points[0].x, "x");
let editWValue2 = coordToDist(editWObject.points[0].y, "y");
let editWValueL = editWObject.len;
let editWValueT = editWObject.thk * unitConvert;

let editingW1 = false;
let editingW2 = false;
let editingWL = false;
let editingWT = false;

let editTempX = 0;
let editDeltaX = 0;
let editTempY = 0;
let editDeltaY = 0;

const dragWCoords = overlayGroup
    .append("text")
    .attr("font-size", "8pt")
    .attr("text-anchor", "start")
    .attr("alignment-baseline", "text-before-edge")
    // .style("pointer-events", "none")
    .attr("x", 5)
    .attr("y", 40) //40 , 20
    .on("mousedown", function(event) {
        if (showWeldEdit) {
            inputWBox.style("display", "none")
            inputWBox2.style("display", "none")
            inputWLabel1.style("display", "none")
            inputWField1
                .style("pointer-events", "none")
                .style("display", "none")
            inputWLabel2.style("display", "none")
            inputWField2.style("display", "none")
            inputWLabelL.style("display", "none")
            inputWFieldL.style("display", "none")
            inputWLabelT.style("display", "none")
            inputWFieldT.style("display", "none")
            editingW1 = false;
            editingW2 = false;
            editingWL = false;
            editingWT = false;
        } else {
            event.stopPropagation();
            selectEditProp();     
            // inputWBox.style("display", "block")
            inputWBox.style("display", "block")
            inputWBox2.style("display", "block")
            inputWLabel1.style("display", "block")
            inputWField1
                .style("display", "block")
                .style("pointer-events", "auto")
            inputWLabel2.style("display", "block")
            inputWField2
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
        // editing = true;
    })
    // .style("display", "none");

const dragWProps = overlayGroup
    .append("text")
    .attr("font-size", "8pt")
    .attr("text-anchor", "start")
    .attr("alignment-baseline", "text-before-edge")
    .style("pointer-events", "none")
    .attr("x", 5)
    .attr("y", 25) //25 , 5
    // .style("display", "none")


const dragLCoords = overlayGroup
    .append("text")
    .attr("font-size", "8pt")
    .attr("text-anchor", "end")
    .attr("alignment-baseline", "text-before-edge")
    .style("pointer-events", "none")
    .attr("x", windowWidth-5)
    .attr("y", 40) //40, 20
    // .style("display", "none");

const inputWBox = overlayGroup
    .append("rect")
    .attr("x", -10) // -10
    .attr("y", 60)
    .attr("width", 65) // 65
    .attr("height", 86)
    .attr("rx", 5)
    .attr("ry", 5)
    .attr("fill-opacity", 0.25)
    .attr("stroke", "black")
    .on("mousedown", function(event) {
        event.stopPropagation();
    })
    .style("display", "none")
const inputWBox2 = overlayGroup
    .append("rect")
    .attr("x", -10) // -10, -150
    .attr("y", 60)
    .attr("width", 130) // 65
    .attr("height", 86)
    .attr("rx", 5)
    .attr("ry", 5)
    .attr("fill-opacity", 0.1)
    .attr("fill", "black")
    .attr("stroke", "black")
    .on("mousedown", function(event) {
        event.stopPropagation();
    })
    .style("display", "none")

const inputWLabel1 = overlayGroup
    .append("text")
    .attr("x", 50) //50
    .attr("y", 115)
    .attr("text-anchor", "end")
    .attr("alignment-baseline", "middle")
    .style("text-align", "right")
    .attr("font-size", "14px")
    .text(`${editWLabel1}: `)
    .style("display", "none")
const inputWLabel2 = overlayGroup
    .append("text")
    .attr("x", 50) //50
    .attr("y", 135)
    .attr("text-anchor", "end")
    .attr("alignment-baseline", "middle")
    .style("text-align", "right")
    .attr("font-size", "14px")
    .text(`${editWLabel2}: `)
    .style("display", "none")
const inputWLabelL = overlayGroup
    .append("text")
    .attr("x", 50) //50
    .attr("y", 75)
    .attr("text-anchor", "end")
    .attr("alignment-baseline", "middle")
    .style("text-align", "right")
    .attr("font-size", "14px")
    .text(`${editWLabelL}: `)
    .style("display", "none")
const inputWLabelT = overlayGroup
    .append("text")
    .attr("x", 50) //50
    .attr("y", 95)
    .attr("text-anchor", "end")
    .attr("alignment-baseline", "middle")
    .style("text-align", "right")
    .attr("font-size", "14px")
    .text(`${editWLabelT}: `)
    .style("display", "none")


let inputWContent1 = "0"
const inputWField1 = overlayGroup
    .append("foreignObject")
    .attr("x", 57.5) //60, -60
    .attr("y", 105)
    .attr("font-size", "14px")
    .attr("text-anchor", "start")
    .attr("alignment-baseline", "middle")
    .style("text-align", "center")
    .attr("width", "60px")
    .attr("height", "20px")
    .style("pointer-events", "none")
    .append(`xhtml:div`)
    .append(`div`)
    .attr("contentEditable", true)
    .text(editWValue1.toFixed(2))
    .on("mousedown", function(event) {
        event.stopPropagation();
        editingW1 = true; // true
        editingW2 = false;
        editingWL = false;
        editingWT = false;
        selectEditProp(); 
        editTempX = editWValue1;
    })
    .on("keyup", function(event) {
        inputWContent1 = d3.select(this).text();
        if (!isFinite(inputWContent1)) return;
        if (selectedProp.includes("start")) {
            editWObject.points[0].x = distToCoord(inputWContent1, "x")
        } else if (selectedProp.includes("end")) {
            editWObject.points[1].x = distToCoord(inputWContent1, "x")
        } else {
            if (inputWContent1 === editTempX) {
                document.getElementById("debugOutputs").innerHTML = `Out: ${editTempX}, ${inputWContent1}`
                return;
            }
            editDeltaX = inputWContent1-editTempX
            editWObject.points[0].x = editWObject.points[0].x + distToCoord(editDeltaX, "d")
            editWObject.points[1].x = editWObject.points[1].x + distToCoord(editDeltaX, "d")
            editTempX = inputWContent1;
        }
        updateWeldProps();
        updateLoadProps();
        updateView();
        editWValue1 = coordToDist((editWObject.points[0].x+editWObject.points[1].x)/2, "x")
    })
    .on("keydown", function(event) {
        if (event.key === "Enter") {
            event.preventDefault();
            event.target.blur();
            editingW1 = false;
            editingW2 = false;
            editingWL = false;
            editingWT = false;
            selectEditProp(); 
        }
    })
    .style("display", "none")

let inputWContent2 = "0"
const inputWField2 = overlayGroup
    .append("foreignObject")
    .attr("x", 57.5) //60, -60
    .attr("y", 125)
    .attr("font-size", "14px")
    .attr("text-anchor", "start")
    .attr("alignment-baseline", "middle")
    .style("text-align", "center")
    .attr("width", "60px")
    .attr("height", "20px")
    .style("pointer-events", "none")
    .append(`xhtml:div`)
    .append(`div`)
    .attr("contentEditable", true)
    .text(editWValue2.toFixed(2))
    .on("mousedown", function(event) {
        event.stopPropagation();
        editingW1 = false;
        editingW2 = true; // true
        editingWL = false;
        editingWT = false;
        selectEditProp(); 
        editTempY = editWValue2;
    })
    .on("keyup", function(event) {
        inputWContent2 = d3.select(this).text();
        if (!isFinite(inputWContent2)) return;
        if (selectedProp.includes("start")) {
            editWObject.points[0].y = distToCoord(inputWContent2, "y")
        } else if (selectedProp.includes("end")) {
            editWObject.points[1].y = distToCoord(inputWContent2, "y")
        } else {
            if (inputWContent2 === editTempY) return;
            editDeltaY = inputWContent2-editTempY
            editWObject.points[0].y = editWObject.points[0].y - distToCoord(editDeltaY, "d")
            editWObject.points[1].y = editWObject.points[1].y - distToCoord(editDeltaY, "d")
            editTempY = inputWContent2;
        }
        updateWeldProps();
        updateLoadProps();
        updateView();
        editWValue2 = coordToDist((editWObject.points[0].y+editWObject.points[1].y)/2, "y")
    })
    .on("keydown", function(event) {
        if (event.key === "Enter") {
            event.preventDefault();
            event.target.blur();
            editingW1 = false;
            editingW2 = false;
            editingWL = false;
            editingWT = false;
            selectEditProp(); 
        }
    })
    .style("display", "none")

let inputWContentL = "0"
const inputWFieldL = overlayGroup
    .append("foreignObject")
    .attr("x", 57.5) //60, -60
    .attr("y", 65)
    .attr("font-size", "14px")
    .attr("text-anchor", "start")
    .attr("alignment-baseline", "middle")
    .style("text-align", "center")
    .attr("width", "60px")
    .attr("height", "20px")
    .style("pointer-events", "none")
    .append(`xhtml:div`)
    .append(`div`)
    .attr("contentEditable", true)
    .text(editWValueL.toFixed(2))
    .on("mousedown", function(event) {
        event.stopPropagation();
        editingW1 = false;
        editingW2 = false;
        editingWL = true; // true
        editingWT = false;
        selectEditProp(); 
    })
    .on("keyup", function(event) {
        inputWContentL = d3.select(this).text();
        if (!isFinite(inputWContentL)) return;
        // editWObject.len = inputWContentL
        updateWeldProps();
        updateLoadProps();
        updateView();
    })
    .on("keydown", function(event) {
        if (event.key === "Enter") {
            event.preventDefault();
            event.target.blur();
            editingW1 = false;
            editingW2 = false;
            editingWL = false;
            editingWT = false;
            selectEditProp(); 
        }
    })
    .style("display", "none")

let inputWContentT = "0"
const inputWFieldT = overlayGroup
    .append("foreignObject")
    .attr("x", 57.5) //60, -60
    .attr("y", 85)
    .attr("font-size", "14px")
    .attr("text-anchor", "start")
    .attr("alignment-baseline", "middle")
    .style("text-align", "center")
    .attr("width", "60px")
    .attr("height", "20px")
    .style("pointer-events", "none")
    .append(`xhtml:div`)
    .append(`div`)
    .attr("contentEditable", true)
    .text(editWValueT.toFixed(2))
    .on("mousedown", function(event) {
        event.stopPropagation();
        editingW1 = false;
        editingW2 = false;
        editingWL = false;
        editingWT = true; // true
        selectEditProp(); 
    })
    .on("keyup", function(event) {
        inputWContentT = d3.select(this).text();
        if (!isFinite(inputWContentT)) return;
        editWObject.thk = inputWContentT / unitConvert
        updateWeldProps();
        updateLoadProps();
        updateView();
    })
    .on("keydown", function(event) {
        if (event.key === "Enter") {
            event.preventDefault();
            event.target.blur();
            editingW1 = false;
            editingW2 = false;
            editingWL = false;
            editingWT = false;
            selectEditProp(); 
        }
    })
    .style("display", "none")

const dragLProps = overlayGroup
    .append("text")
    .attr("font-size", "8pt")
    .attr("text-anchor", "end")
    .attr("alignment-baseline", "text-before-edge")
    .style("pointer-events", "none")
    .attr("x", windowWidth-5)
    .attr("y", 25) //25, 5
    // .style("display", "none")

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
    .attr("font-size", "8pt")
    // .attr("font-weight", "bold")
    .attr("text-anchor", "middle")
    .attr("alignment-baseline", "text-before-edge")
    .style("pointer-events", "none")
    .attr("x", windowWidth/2)
    .attr("y", 50)
    .attr("fill", "indigo")
    // .style("display", "none")
    // .text(`tmax: ${max_t.toFixed(1)}`)

// On-Display Buttons
const lockIcon = overlayGroup
    .append("text")
    .attr("font-size", "20px")
    .attr("text-anchor", "middle")
    .attr("alignment-baseline", "text-before-edge")
    .style("pointer-events", "none")
    .attr("x", 19)
    .attr("y", windowHeight-31)
    .attr("opacity", 0.75)
    .text("🔓")
const lockButton = overlayGroup
    .append("rect")
    .attr("x", 5)
    .attr("y", windowHeight-34)
    .attr("width", 29)
    .attr("height", 30)
    .attr("rx", 5)
    .attr("ry", 5)
    .attr("fill", "black")
    .attr("opacity", 0)
    .on("click", function() {lockUnlock()})
    .append("title")
    .text("Lock/Unlock Geometry");

const unitsIcon = overlayGroup
    .append("text")
    .attr("font-size", "9pt")
    .attr("text-anchor", "middle")
    .attr("alignment-baseline", "text-before-edge")
    .style("pointer-events", "none")
    .attr("x", windowWidth-20)
    .attr("y", windowHeight-26)
    .attr("opacity", 0.75)
    .text("IN")
const unitsButton = overlayGroup
    .append("rect")
    .attr("x", windowWidth-36)
    .attr("y", windowHeight-34)
    .attr("width", 32)
    .attr("height", 30)
    .attr("rx", 5)
    .attr("ry", 5)
    .attr("fill", "black")
    .attr("opacity", 0.125)
    .on("click", function() {unitSwap()})
    .append("title")
    .text(`Toggle Units`)

// const inspectIcon = overlayGroup.append("g")
//     .append("text")
//     .attr("font-size", "20px")
//     .attr("text-anchor", "middle")
//     .attr("alignment-baseline", "text-before-edge")
//     .style("pointer-events", "none")
//     .attr("x", 55)
//     .attr("y", windowHeight-31)
//     .attr("opacity", 0.75)
//     .text("🔎")
// const inspectButton = overlayGroup.append("g")
//     .append("rect")
//     .attr("x", 40)
//     .attr("y", windowHeight-34)
//     .attr("width", 29)
//     .attr("height", 30)
//     .attr("rx", 5)
//     .attr("ry", 5)
//     .attr("fill", "black")
//     .attr("opacity", 0)
//     .on("click", function() {inspect()});

const weldZone = overlayGroup.append("g")
    .append("text")
    .attr("font-size", "9pt")
    .attr("font-weight", "bold")
    .attr("text-anchor", "start")
    .attr("alignment-baseline", "text-before-edge")
    // .style("pointer-events", "none")
    .attr("x", 27)
    .attr("y", 5)
    .on("click", function(event, d) {
        showWeldProps = !showWeldProps
        updateView();
        })
    .text("Welds")
    // .style("display", "none");

const addWButton = overlayGroup.append("g")
    .append("rect")
    .attr("x", 4)
    .attr("y", 3)
    .attr("width", 18)
    .attr("height", 18)
    .attr("rx", 5)
    .attr("ry", 5)
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
    .attr("y", 12)
    .attr("dy", "0.35em")
    .attr("opacity", 1)
    .attr("fill", "green")
    .text("+")

const removeWButton = overlayGroup.append("g")
    .append("rect")
    .attr("x", 66)
    .attr("y", 3)
    .attr("width", 18)
    .attr("height", 18)
    .attr("rx", 5)
    .attr("ry", 5)
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
    .attr("y", 12)
    .attr("opacity", 1)
    .attr("fill", "red")
    .text("-")
    // .style("display", "none")
    
const loadZone = overlayGroup.append("g")
    .append("text")
    .attr("font-size", "9pt")
    .attr("font-weight", "bold")
    .attr("text-anchor", "end")
    .attr("alignment-baseline", "text-before-edge")
    // .style("pointer-events", "none")
    .attr("x", windowWidth-27)
    .attr("y", 5)
    .on("click", function(event, d) {
        showLoadProps = !showLoadProps
        updateView();
    })
    .text("Loads")
    // .style("display", "none");

const addLButton = overlayGroup.append("g")
    .append("rect")
    .attr("x", windowWidth-4-18)
    .attr("y", 3)
    .attr("width", 18)
    .attr("height", 18)
    .attr("rx", 5)
    .attr("ry", 5)
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
    .attr("y", 12)
    .attr("dy", "0.35em")
    .attr("opacity", 1)
    .attr("fill", "green")
    .text("+")

const removeLButton = overlayGroup.append("g")
    .append("rect")
    .attr("x", windowWidth-66-18)
    .attr("y", 3)
    .attr("width", 18)
    .attr("height", 18)
    .attr("rx", 5)
    .attr("ry", 5)
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
    .attr("y", 12)
    .attr("opacity", 1)
    // .attr("fill", "white")
    .attr("fill", "red")
    .text("-")
    // .style("display", "none")
    

setupScaleSliders();
updateView();
updateWeldProps();
updateLoadProps();

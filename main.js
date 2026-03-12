// Do Next:
    // Text Overlay Updates
        // Include stress values? (max on weld, val on current node, etc?)
    // Drag-able weld inspection node
        // Gives stress value(s) at current location
        // Colored relative to min/max stress scale
    // Add buttons for weld/load remove?
    // Add Stress Calcs - real units
    // Lock weld angle?
        // Hold shift when draging weld node to adjust length while keeping initial angle
    // Add user inputs?
        // First relevant one will be weld thk, since all others can be dragged
        // Units
        // Then load angle
        // Then load coords?
        // Then weld coords
        // How?
            // Static table with all that can be edited anytime?
            // Click on a weld/load to select, display current stats and allow edit?
    // Add legend?
        // What each line type/color represents
    // Fit View?
        // Need to get min and max X and Y vals
        // Center on centroid OR by min/max?
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

// Initialize high level SVG stuff
const svg = d3.select("#topView"); // Defining the svg window (references element from index.html)
const zoomGroup = svg.append("g"); // Defines group that will contain all SVG elements that are effected by zoom/pan
const overlayGroup = svg.append("g"); // Defines group that will contain SVG elements that ignore zoom/pan and remain overlaid on window

// Define arrow marker for use at ends of force vectors
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
    .attr("fill", "darkred")
const arrowBGroup = zoomGroup.append("g")
    .append("defs")
    .append("marker")
    .attr("id", "B_arrowhead")
    .attr("viewBox", "0 -5 10 10")
    .attr("markerWidth", 4)
    .attr("markerHeight", 4)
    .attr("orient", "auto-start-reverse") // ensures direction of arrowhead follows the polyline
    .append("path")
    .attr("d", arrowPath)
    .attr("fill", "darkblue")
const arrowPGroup = zoomGroup.append("g")
    .append("defs")
    .append("marker")
    .attr("id", "P_arrowhead")
    .attr("viewBox", "0 -5 10 10")
    .attr("markerWidth", 4)
    .attr("markerHeight", 4)
    .attr("orient", "auto-start-reverse") // ensures direction of arrowhead follows the polyline
    .append("path")
    .attr("d", arrowPath)
    .attr("fill", "indigo")

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

// SVG Groups for the elements that require add/removal of data
    // I.e. elements associated with welds and loads, as these can be added/removed by user
    // Specific element definitions can be found in the "updateDrags()" & "updateData()" functions
const lineGroup = zoomGroup.append("g") // Weld lines
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
const wDragGroup = zoomGroup.append("g")


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
    .attr("stroke-width", 3)
    .attr("stroke-dasharray", "2,5")
    .attr("opacity", 0.5)
    .attr("fill", "none")
    .attr("marker-end", "url(#arrowhead")
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
    .attr("font-size", "10px")
    .attr("text-anchor", "middle")
    .style("pointer-events", "none")
    .attr("x", d => d.x)
    .attr("y", d => d.y)
    .text("hi tho")
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

// const dragWCoordsGroup = overlayGroup.append("g")
const dragWCoords = overlayGroup.append("g")
// const dragWCoords = dragWCoordsGroup.selectAll("text")
    // .data(nodes)
    // .enter()
    .append("text")
    .attr("font-size", "12px")
    .attr("text-anchor", "start")
    .attr("alignment-baseline", "text-before-edge")
    .style("pointer-events", "none")
    .attr("x", 5)
    .attr("y", 20)
    .style("display", "none");

// const dragWPropsGroup = overlayGroup.append("g")
const dragWProps = overlayGroup.append("g")
// const dragWProps = dragWPropsGroup.selectAll("text")
//     .data(nodes)
//     .enter()
    .append("text")
    .attr("font-size", "12px")
    .attr("text-anchor", "start")
    .attr("alignment-baseline", "text-before-edge")
    .style("pointer-events", "none")
    .attr("x", 5)
    .attr("y", 5)
    .style("display", "none")


// const dragLCoordsGroup = overlayGroup.append("g")
const dragLCoords = overlayGroup.append("g")
// const dragLCoords = dragLCoordsGroup.selectAll("text")
//     .data(loadProps)
//     .enter()
    .append("text")
    .attr("font-size", "12px")
    .attr("text-anchor", "end")
    .attr("alignment-baseline", "text-before-edge")
    .style("pointer-events", "none")
    .attr("x", 500-5)
    .attr("y", 20)
    .style("display", "none");
// const dragLPropsGroup = overlayGroup.append("g")
const dragLProps = overlayGroup.append("g")
// const dragLProps = dragLPropsGroup.selectAll("text")
//     .data(loadProps)
    // .enter()
    .append("text")
    .attr("font-size", "12px")
    .attr("text-anchor", "end")
    .attr("alignment-baseline", "text-before-edge")
    .style("pointer-events", "none")
    .attr("x", 500-5)
    .attr("y", 5)
    .style("display", "none")

const TestGroup = overlayGroup.append("g")
// const Test = TestGroup.selectAll("text")
    // .data(nodes)
    // .enter()
    .append("text")
    .attr("font-size", "12px")
    .attr("text-anchor", "end")
    .attr("alignment-baseline", "text-before-edge")
    .style("pointer-events", "none")
    .attr("x", 500-5)
    .attr("y", 5)
    // .style("display", "none")
    // .text("Hi tho")

setupScaleSliders();
updateView();

// Do Next:
    // Add/Remove Loads
        // Same approach as add/remove Welds
    // Drag to move weld?
        // Drag body of weld to translate (no rotation) entire line
        // on start: get initial event.x & event.y
        // on drag: get diff of current - initial event.x&.y, add this to node x & y's
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

// Initialize svg stuff
const svg = d3.select("#topView");
const zoomGroup = svg.append("g")
// const overlayGroup = svg.append("g")

// Define arrow marker for use at ends of force vectors
const arrowPath = "M 0, -5 L 10, 0 L 0, 5";
const arrowGroup = zoomGroup.append("g")
    .append("defs")
    .append("marker")
    .attr("id", "arrowhead")
    .attr("viewBox", "0 -5 10 10")
    // .attr("refx", 10)
    // .attr("refy", 10)
    .attr("markerWidth", 4)
    .attr("markerHeight", 4)
    .attr("orient", "auto-start-reverse") // ensures direction of arrowhead follows the polyline
    .append("path")
    .attr("d", arrowPath) // defines the arrowhead shape
    .attr("fill", "darkred")
const arrowBGroup = zoomGroup.append("g")
    .append("defs")
    .append("marker")
    .attr("id", "B_arrowhead")
    .attr("viewBox", "0 -5 10 10")
    // .attr("refx", 10)
    // .attr("refy", 10)
    .attr("markerWidth", 4)
    .attr("markerHeight", 4)
    .attr("orient", "auto-start-reverse") // ensures direction of arrowhead follows the polyline
    .append("path")
    .attr("d", arrowPath) // defines the arrowhead shape
    .attr("fill", "darkblue")
const arrowPGroup = zoomGroup.append("g")
    .append("defs")
    .append("marker")
    .attr("id", "P_arrowhead")
    .attr("viewBox", "0 -5 10 10")
    // .attr("refx", 10)
    // .attr("refy", 10)
    .attr("markerWidth", 4)
    .attr("markerHeight", 4)
    .attr("orient", "auto-start-reverse") // ensures direction of arrowhead follows the polyline
    .append("path")
    .attr("d", arrowPath) // defines the arrowhead shape
    .attr("fill", "indigo")

// Define dot marker for use at ends of force vectors
const dotGroup = zoomGroup.append("g")
    .append("defs")
    .append("marker")
    .attr("id", "dots")
    .attr("viewBox", "-10 -10 20 20")
    // .attr("refx", 10)
    // .attr("refy", 10)
    .attr("markerWidth", 4)
    .attr("markerHeight", 4)
    .attr("orient", "auto-start-reverse")
    .append("path")
    .attr("d", d3.symbol().size(200)) //dont need to define "type" here as default is circle
    .attr("fill", "darkred")

// Weld lines
const lineGroup = zoomGroup.append("g")
const tmaxGroup = zoomGroup.append("g")
const dShearGroup = zoomGroup.append("g")
const tShearGroup = zoomGroup.append("g")
const fShearGroup = zoomGroup.append("g")
const wDragGroup = zoomGroup.append("g")
updateData()
updateDrags();
// const weldLines = lineGroup.selectAll("polyline")
//     .data(weldCoords)
//     .enter()
//     .append("polyline")
//     .attr("class", "weld")
//     .attr("stroke", "black")
//     .attr("stroke-width", d => d.thk*weldThkScale)
//     .style("stroke-linecap", "round")
//     .attr("opacity", 0.4)
//     .attr("fill", "none")

// Applied force vectors
const loadsGroup = zoomGroup.append("g")
const lVectors = loadsGroup.selectAll("polyline")
    .data(loadPoints)
    .enter()
    .append("polyline")
    .attr("stroke", "darkred")
    .attr("stroke-width", 3)
    .attr("opacity", 0.7)
    .attr("fill", "none")
    .attr("points", "350,200 450,200")
    .attr("marker-end", "url(#arrowhead")
    .attr("marker-start", "url(#dots")

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
    // .attr("display", "block")

// const tmaxGroup = zoomGroup.append("g")
// const tmax_circle = tmaxGroup.selectAll("circle")
//     .data(nodes)
//     .enter()
//     .append("circle")
//     .attr("r", 10)
//     .attr("fill", "orange")
//     .attr("fill-opacity", 0.25)
//     .attr("stroke", "orange")
//     .attr("stroke-width", 2)
//     .attr("stroke-opacity", 0.75)
//     .attr("cx", d => d.x)
//     .attr("cy", d => d.y)
//     .style("display", d => d.display)

// const dShear = dShearGroup.selectAll("polyline")
//     .data(directShear)
//     .enter()
//     .append("polyline")
//     .attr("fill", "none")
//     .attr("stroke", "darkred")
//     .attr("stroke-width", 2)
//     .style("stroke-linecap", "round")
//     .attr("opacity", 0.5)
//     .attr("marker-end", "url(#arrowhead")
//     // .attr("marker-start", "url(#dots")
//     // .style("display", "block")

// const tShearGroup = zoomGroup.append("g")
// const tShear = tShearGroup.selectAll("polyline")
//     .data(torsionShear)
//     .enter()
//     .append("polyline")
//     .attr("fill", "none")
//     .attr("stroke", "darkblue")
//     .attr("stroke-width", 2)
//     .style("stroke-linecap", "round")
//     .attr("opacity", 0.5)
//     .attr("marker-end", "url(#B_arrowhead")
//     // .attr("marker-start", "url(#dots")
//     // .style("display", "block")

// const fShearGroup = zoomGroup.append("g")
// const fShear = fShearGroup.selectAll("polyline")
//     .data(totalShear)
//     .enter()
//     .append("polyline")
//     .attr("fill", "none")
//     .attr("stroke", "indigo")
//     .attr("stroke-width", 2)
//     .style("stroke-linecap", "round")
//     .attr("opacity", 0.75)
//     .attr("marker-end", "url(#P_arrowhead")
//     // .attr("marker-start", "url(#dots")
//     // .style("display", "none")
    
// Draggable weld nodes
// const wDragGroup = zoomGroup.append("g")
// const weldDrag = wDragGroup.selectAll("circle")
//     .data(nodes)
//     .enter()
//     .append("circle")
//     .attr("r", 15)
//     .attr("fill", "black")
//     .attr("opacity", 0)
//     .attr("cx", d => d.x)
//     .attr("cy", d => d.y)
//     .call(d3.drag()
//         .on("start", (event) => {
//             weldDrag.attr("opacity",0.1);
//         })
//         .on("drag", function(event, d) {
//             d.x = event.x;
//             d.y = event.y;
//             updateView();
//         })
//         .on("end", (event) => {
//             weldDrag.attr("opacity", 0)
//         })
//     )

// Draggable points to change force vector position
const lDragGroup = zoomGroup.append("g")
const loadDrag = lDragGroup.selectAll("circle")
    .data(loadProps)
    .enter()
    .append("circle")
    .attr("r", 10)
    .attr("fill", "darkred")
    .attr("opacity", 0)
    .attr("cx", d => d.x)
    .attr("cy", d => d.y)
    .call(d3.drag()
        .on("start", (event) => {
            loadDrag.attr("opacity",0.1);
        })
        .on("drag", function(event, d) {
            d.x = event.x;
            d.y = event.y;
            updateArrows();
            updateView();
            updateAngles();
        })
        .on("end", (event) => {
            loadDrag.attr("opacity", 0)
        })
    );

// Draggable mid-nodes to change force vector angle
const mDragGroup = zoomGroup.append("g")
const magDrag = mDragGroup.selectAll("circle")
    .data(loadArrows)
    .enter()
    .append("circle")
    .attr("r", 10)
    .attr("fill", "darkred")
    .attr("opacity", 0)
    .attr("cx", d => d.x)
    .attr("cy", d => d.y)
    .call(d3.drag()
        .on("start", (event) => {
            magDrag.attr("opacity",0.1);
        })
        .on("drag", function(event, d) {
            const drag_x = loadProps.find(j => j.id === d.id).x;
            const drag_y = loadProps.find(j => j.id === d.id).y;
            const drag_L = Math.sqrt((drag_x-event.x)*(drag_x-event.x)+(drag_y-event.y)*(drag_y-event.y));
            if (drag_L < minLength) return
            loadProps.find(j => j.id === d.id).mag = drag_L / loadScale;
            updateArrows();
            updateAngles();
            updateView();
        })
        .on("end", (event) => {
            magDrag.attr("opacity", 0)
        })
    );

// Visual marker for draggable mid-nodes
const midGroup = zoomGroup.append("g")
const midMarks = midGroup.selectAll("circle")
    .data(loadMids)
    .enter()
    .append("circle")
    .attr("r", 3)
    .attr("fill", "none")
    .attr("stroke-width", 1)
    .attr("stroke", "darkred")
    .attr("stroke-opacity", 1)
    .attr("opacity", 0.5)
    .attr("cx", d => d.x)
    .attr("cy", d => d.y)

// Draggable arrowheads to change force vector magnitude
const aDragGroup = zoomGroup.append("g")
const angleDrag = aDragGroup.selectAll("circle")
    .data(loadMids)
    .enter()
    .append("circle")
    .attr("r", 10)
    .attr("fill", "darkred")
    .attr("opacity", 0)
    .attr("cx", d => d.x)
    .attr("cy", d => d.y)
    .call(d3.drag()
        .on("start", (event) => {
            angleDrag.attr("opacity",0.1);
        })
        .on("drag", function(event, d) {
            d.x = event.x;
            d.y = event.y;
            updateAngles();
            updateView();
        })
        .on("end", (event) => {
            angleDrag.attr("opacity", 0)
        })
    );

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

// svg.selectAll(".weld")
//     .on("dblclick", function(event, d) {
//         removeWeld(d.id);
//     });

setupScaleSliders();
updateView();

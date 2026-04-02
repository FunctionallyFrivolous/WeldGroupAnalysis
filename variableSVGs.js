function updateDrags(){
    svg.selectAll(".weld")
        // .on("click", function(event, d) {
        //     selectedWeld = d.id;
        //     updateWeldProps();
        // })
        .on("dblclick", function(event, d) {
            removeWeld(d.id);
        })

    svg.selectAll(".load")
        .on("dblclick", function(event, d) {
            removeLoad(d.id);
        });

    // Weld Drag Nodes
    const NodeDrag = nodeDragGroup.selectAll("circle")
        .data(nodes, d => d.id);
    let enter = NodeDrag.enter()
        .append("circle")
        .attr("r", 15)
        .attr("fill", "black")
        .attr("opacity", 0);
    enter.merge(NodeDrag)
        .attr("cx", d => d.x)
        .attr("cy", d => d.y)
        .call(d3.drag()
            .on("start", (event, d) => {
                xtemp = d.x;
                ytemp = d.y;
                selectedWeld = d.id.slice(0,5)
                NodeDrag.attr("opacity",0.1);
                const strIndex = d.id.indexOf("_");
                const wID = d.id.substring(0,strIndex);
                const dragWeld = weldCoords.find(j => j.id === wID);
                // d.show = true;
                showCentCoords = true;
                updateWeldProps();
                dragWCoords.style("display", "block")
                dragWProps.style("display", "block")
                selectedWProp = d.id
                selectWEditProp()
                updateData();
                updateSVGs();
            })
            .on("drag", function(event, d) {
                if (geomLock) return
                d.x = event.x;
                d.y = event.y;
                const strIndex = d.id.indexOf("_");
                const wID = d.id.substring(0,strIndex);
                const dragWeld = weldCoords.find(j => j.id === wID);
                updateWeldProps();
                updateStuff();
                updateSVGs();
                updateData();
                let x_opp = 0;
                let y_opp = 0;
                if (d.id.includes("start")) {
                    x_opp = dragWeld.points[1].x;
                    y_opp = dragWeld.points[1].y;
                } else {
                    x_opp = dragWeld.points[0].x;
                    y_opp = dragWeld.points[0].y;
                }
                // Snap
                [d.x, d.y] = snapDrag(d.id, d.x, d.y, x_opp, y_opp)
                selectWEditProp()
                updateStuff();
                updateSVGs();
                updateData();
            })
            .on("end", (event, d) => {
                NodeDrag.attr("opacity", n => n.id === d.id ? 0.1 : 0);
                weldDrag.attr("opacity", 0)
                // d.show = false;
                showCentCoords = false;
                selectWEditProp()
                updateWeldProps();
                updateStuff();
                updateData();
                updateSVGs();
                xtemp = d.x;
                ytemp = d.y;
            })
        )
    NodeDrag.exit().remove();

    const weldDrag = wDragGroup.selectAll("circle")
        .data(weldCoords);
    enter = weldDrag.enter()
        .append("circle")
        .attr("r", 10)
        .attr("fill", "black")
        .attr("opacity", 0)
        .style("pointer-events", "none")
    enter.merge(weldDrag)
        .attr("cx", d => (d.points[1].x + d.points[0].x)/2)
        .attr("cy", d => (d.points[1].y + d.points[0].y)/2)
        .call(d3.drag()
            .on("start", (event, d) => {
                selectedWProp = d.id
                selectWEditProp()
                selectedWeld = d.id;
                xtemp = (d.points[1].x + d.points[0].x)/2 //event.x;
                ytemp = (d.points[1].y + d.points[0].y)/2 //event.y;
                weldDrag.attr("opacity", 0.1);
                showCentCoords = true;
                updateWeldProps();
                dragWCoords.style("display", "block")
                dragWProps.style("display", "block")
                updateData();
                updateSVGs();
            })
            .on("drag", function(event, d) {
                if (geomLock) return
                selectWEditProp()
                updateWeldProps();
                updateStuff();
                updateSVGs();
                updateData();
                const [newMidX, newMidY] = snapDrag(d.id, event.x, event.y)
                let x_delta = newMidX - xtemp;
                let y_delta = newMidY - ytemp;
                for (i = 0; i < 2; i++) {
                    d.points[i].x = d.points[i].x + x_delta;
                    d.points[i].y = d.points[i].y + y_delta;
                }
                xtemp = newMidX;
                ytemp = newMidY;
                selectWEditProp()
                updateWeldProps();
                updateStuff();
                updateSVGs();
                updateData();
            })
            .on("end", (event, d) => {
                weldDrag.attr("opacity", n => n.id.includes(d.id) ? 0.1 : 0);
                NodeDrag.attr("opacity", 0);
                showCentCoords = false;
                selectWEditProp()
                updateWeldProps();
                updateData();
                updateSVGs();
            })
        )
    weldDrag.exit()
        .attr("opacity",0)
        .remove();

    const loadDrag = lDragGroup.selectAll("circle")
        .data(loadProps)
    enter = loadDrag.enter()
        .append("circle")
        .attr("class", "load")
        .attr("r", 10)
        .attr("fill", "darkred")
        .attr("opacity", 0)
    enter.merge(loadDrag)
        .attr("cx", d => d.x)
        .attr("cy", d => d.y)
        .call(d3.drag()
            .on("start", (event, d) => {
                selectedLoad = d.id;
                loadDrag.attr("opacity",0.1);
                loadProps.find(j => j.id === d.id).show = true;
                updateLoadProps();
                dragLCoords.style("display", "block")
                dragLProps.style("display", "block")
                selectedLProp = d.id
                selectLEditProp()
                updateData();
                updateSVGs();
            })
            .on("drag", function(event, d) {
                if (geomLock) return
                d.x = event.x;
                d.y = event.y;
                updateLoadProps();
                // Snap 
                [d.x, d.y] = snapDrag(d.id, d.x, d.y)
                selectLEditProp()
                updateArrows();
                updateStuff();
                updateSVGs();
                updateData();
                updateAngles();
            })
            .on("end", (event, d) => {
                loadDrag.attr("opacity", n => n.id.includes(d.id) ? 0.1 : 0);
                loadProps.find(j => j.id === d.id).show = false;
                selectLEditProp()
                updateLoadProps();
                updateStuff();
                updateData();
                updateSVGs();
            })
        );
    loadDrag.exit().remove();

    const magDrag = mDragGroup.selectAll("circle")
        .data(loadArrows)
    enter = magDrag.enter()
        .append("circle")
        .attr("r", 10)
        .attr("fill", "darkred")
        .attr("opacity", 0)
    enter.merge(magDrag)
        .attr("cx", d => d.x)
        .attr("cy", d => d.y)
        .call(d3.drag()
            .on("start", (event, d) => {
                selectedLoad = d.id;
                loadDrag.attr("opacity", 0);
                magDrag.attr("opacity",0.1);
                loadProps.find(j => j.id === d.id).show = true;
                const dragLoad = loadProps.find(j => j.id === d.id);
                selectedLProp = d.id
                selectLEditProp()
                updateLoadProps();
                dragLCoords.style("display", "block")
                dragLProps.style("display", "block")
                updateData();
            })
            .on("drag", function(event, d) {
                if (geomLock) return
                const drag_x = loadProps.find(j => j.id === d.id).x;
                const drag_y = loadProps.find(j => j.id === d.id).y;
                const drag_L = Math.sqrt((drag_x-event.x)*(drag_x-event.x)+(drag_y-event.y)*(drag_y-event.y));
                if (drag_L < minLength) return
                loadProps.find(j => j.id === d.id).mag = drag_L / loadScale;
                const dragLoad = loadProps.find(j => j.id === d.id);
                selectLEditProp()
                updateLoadProps();
                updateAngles();
                updateStuff();
                updateSVGs();
                updateData();
            })
            .on("end", (event, d) => {
                magDrag.attr("opacity", 0);
                loadDrag.attr("opacity", n => n.id.includes(d.id) ? 0.1 : 0);
                loadProps.find(j => j.id === d.id).show = false;
                const dragLoad = loadProps.find(j => j.id === d.id);
                selectLEditProp()
                updateLoadProps();
                updateData();
            })
        );
    magDrag.exit().remove();

    const angleDrag = aDragGroup.selectAll("circle")
        .data(loadMids)
    enter = angleDrag.enter()
        .append("circle")
        .attr("r", 10)
        .attr("fill", "darkred")
        .attr("opacity", 0)
    enter.merge(angleDrag)
        .attr("cx", d => d.x)
        .attr("cy", d => d.y)
        .call(d3.drag()
            .on("start", (event, d) => {
                selectedLoad = d.id;
                loadDrag.attr("opacity", 0);
                angleDrag.attr("opacity",0.1);
                loadProps.find(j => j.id === d.id).show = true;
                const dragLoad = loadProps.find(j => j.id === d.id);
                selectedLProp = d.id
                selectLEditProp()
                updateLoadProps();
                dragLCoords.style("display", "block")
                dragLProps.style("display", "block")
                updateData();
            })
            .on("drag", function(event, d) {
                if (geomLock) return
                d.x = event.x;
                d.y = event.y;
                const dragLoad = loadProps.find(j => j.id === d.id);
                const x_opp = dragLoad.x;
                const y_opp = dragLoad.y;
                // Snap
                [d.x, d.y] = snapDrag(d.id, d.x, d.y, x_opp, y_opp)
                selectLEditProp()
                updateLoadProps();
                updateAngles();
                updateStuff();
                updateSVGs();
                updateData();
            })
            .on("end", (event, d) => {
                angleDrag.attr("opacity", 0);
                loadDrag.attr("opacity", n => n.id.includes(d.id) ? 0.1 : 0);
                loadProps.find(j => j.id === d.id).show = false;
                const dragLoad = loadProps.find(j => j.id === d.id);
                selectLEditProp()
                updateLoadProps();
                updateData();
            })
        );
    angleDrag.exit().remove();

}

function updateData() {
    weldCount = weldCoords.length;
    loadCount = loadProps.length;
    // Welds //
    svg.selectAll(".weld")
        .on("dblclick", function(event, d) {
            removeWeld(d.id);
        });

    svg.selectAll(".load")
        .on("dblclick", function(event, d) {
            removeLoad(d.id);
        });

    const weldLines = lineGroup.selectAll("polyline")
        .data(weldCoords, d => d.id);
    let enter = weldLines.enter()
        .append("polyline")
        .attr("class", "weld")
        .attr("stroke", "gray")
        .style("stroke-linecap", "round")
        // .attr("opacity", 0.4)
        .attr("fill", "none")
    enter.merge(weldLines)
        .attr("stroke-width", d => d.thk*weldThkScale)
        .attr("points", d => d.points.map(j => `${j.x},${j.y}`).join(" "))
        .on("click", function(event,d) {
            weldDrag.attr("opacity", n => n.id === d.id ? 0.1 : 0);
            NodeDrag.attr("opacity", 0)
            selectedWeld = d.id.slice(0,5)
            // inspectFollow()
            inspectDrag(event.x, event.y)
            selectedWProp = d.id
            selectWEditProp()
            updateWeldProps();
            updateStuff();
            updateSVGs();
            updateData();
        })
    weldLines.exit().remove();

    // Max Stress Indicators
    const tmax_circle = tmaxGroup.selectAll("circle")
        .data(nodes);
    enter = tmax_circle.enter()
        .append("circle")
        .attr("r", 15)
        // .attr("fill", "orange")
        // .attr("fill-opacity", 0.5)
        // .attr("stroke", "orange")
        .attr("stroke-width", 10)
        .attr("stroke-opacity", 0.75)
        .style("fill", "url(#circleGradient)")
    enter.merge(tmax_circle)
        .attr("cx", d => d.x)
        .attr("cy", d => d.y)
        .style("display", d => d.display)
    tmax_circle.exit().remove();

    // Direc Shear Arrows
    const dShear = dShearGroup.selectAll("polyline")
        .data(directShear);
    enter = dShear.enter()
        .append("polyline")
        .attr("fill", "none")
        .attr("stroke", "darkred")
        .attr("stroke-width", 2)
        .style("stroke-linecap", "round")
        .attr("opacity", 0.5)
        .attr("marker-end", "url(#R_arrowhead");
    enter.merge(dShear)
        .attr("points", d => d.points.map(t => `${t.x},${t.y}`).join(" "))
        .style("display", showTDir ? "block" : "none");
    dShear.exit().remove();

    // Torsional Shear Arrows
    const tShear = tShearGroup.selectAll("polyline")
        .data(torsionShear)
    enter = tShear.enter()
        .append("polyline")
        .attr("fill", "none")
        .attr("stroke", "darkblue")
        .attr("stroke-width", 2)
        .style("stroke-linecap", "round")
        .attr("opacity", 0.5)
        .attr("marker-end", "url(#B_arrowhead");
    enter.merge(tShear)
        .attr("points", d => d.points.map(t => `${t.x},${t.y}`).join(" "))
        .style("display", showTTor ? "block" : "none");
    tShear.exit().remove();
    
    // Total Shear Arrows
    const fShear = fShearGroup.selectAll("polyline")
        .data(totalShear);
    enter = fShear.enter()
        .append("polyline")
        .attr("fill", "none")
        .attr("stroke", "indigo")
        .attr("stroke-width", 2)
        .style("stroke-linecap", "round")
        .attr("opacity", 0.75)
        .attr("marker-end", "url(#P_arrowhead");
    enter.merge(fShear)
        .attr("points", d => d.points.map(t => `${t.x},${t.y}`).join(" "))
        .style("display", showStress ? "block" : "none");
    fShear.exit().remove();

    const lVectors = loadsGroup.selectAll("polyline")
        .data(loadPoints)
    enter = lVectors.enter()
        .append("polyline")
        .attr("class", "load")
        .attr("stroke", "darkred")
        .attr("stroke-width", 3)
        // .attr("opacity", 0.7)
        .attr("fill", "none")
        .attr("points", "350,200 450,200")
        .attr("marker-end", "url(#R_arrowhead")
        .attr("marker-start", "url(#dots")
    enter.merge(lVectors)
        .attr("points", d => d.points.map(l => `${l.x},${l.y}`).join(" "))
    lVectors.exit().remove();


    const NodeDrag = nodeDragGroup.selectAll("circle")
        .data(nodes);
    enter = NodeDrag.enter()
        .append("circle")
        .attr("r", 15)
        .attr("fill", "black")
        .attr("opacity", 0);
    enter.merge(NodeDrag)
        .attr("cx", d => d.x)
        .attr("cy", d => d.y)
    NodeDrag.exit().remove();

    const weldDrag = wDragGroup.selectAll("circle")
        .data(weldCoords);
    enter = weldDrag.enter()
        .append("circle")
        .attr("r", 15)
        .attr("fill", "black")
        .attr("opacity", 0);
    enter.merge(weldDrag)
        .attr("cx", d => (d.points[1].x + d.points[0].x)/2)
        .attr("cy", d => (d.points[1].y + d.points[0].y)/2)
    weldDrag.exit().remove();

    const loadDrag = lDragGroup.selectAll("circle")
        .data(loadProps)
    enter = loadDrag.enter()
        .append("circle")
        .attr("class", "load")
        .attr("r", 10)
        .attr("fill", "darkred")
        .attr("opacity", 0)
    enter.merge(loadDrag)
        .attr("cx", d => d.x)
        .attr("cy", d => d.y)
    loadDrag.exit().remove();

    const magDrag = mDragGroup.selectAll("circle")
        .data(loadArrows)
    enter = magDrag.enter()
        .append("circle")
        .attr("r", 10)
        .attr("fill", "darkred")
        .attr("opacity", 0)
    enter.merge(magDrag)
        .attr("cx", d => d.x)
        .attr("cy", d => d.y)
    magDrag.exit().remove();

    const midMarks = midGroup.selectAll("circle")
        .data(loadMids);
    enter = midMarks.enter()
        .append("circle")
        .attr("r", 3)
        .attr("fill", "none")
        .attr("stroke-width", 1)
        .attr("stroke", "darkred")
        .attr("stroke-opacity", 1)
        .attr("opacity", 0.5)
        .attr("pointer-events", "none");
    enter.merge(midMarks)
        .attr("cx", d => d.x)
        .attr("cy", d => d.y)
    midMarks.exit().remove();

    const angleDrag = aDragGroup.selectAll("circle")
        .data(loadMids);
    enter = angleDrag.enter()
        .append("circle")
        .attr("r", 10)
        .attr("fill", "darkred")
        .attr("opacity", 0);
    enter.merge(angleDrag)
        .attr("cx", d => d.x)
        .attr("cy", d => d.y);
    angleDrag.exit().remove();

    const fringeColors = ["darkblue", "cyan", d3.color("green").brighter(2), "yellow", "red"]

    const newScaleMax = Math.min(fringeScaleMax, max_t)
    const newScaleMin = Math.max(fringeScaleMin, min_t)
    const fringeStops = [newScaleMin];
    for (i=1; i<fringeColors.length-1; i++) {
        fringeStops.push((newScaleMax-newScaleMin)/fringeColors.length*i+newScaleMin)
    }
    fringeStops.push(newScaleMax)

    const fringeScale = d3.scaleLinear()
        .domain(fringeStops)
        .range(fringeColors)

    // const fringeScaleC = d3.scaleSequential()
    //     .domain([min_t, max_t])
    //     .interpolator(d3.inerpolateBlues)

    const fringeDots = fringeGroup.selectAll("circle")
        .data(fringeData)
    enter = fringeDots.enter()
        .append("circle")
        .attr("r", 5)
        .attr("opacity", 1)
        .style("pointer-events", "none")
    enter.merge(fringeDots)
        .attr("cx", d => d.x)
        .attr("cy", d => d.y)
        .attr("r", d => d.dot)
        .attr("fill", d => d.stress > fringeScaleMax? "darkred" : d.stress < fringeScaleMin? "none" : fringeScale(d.stress)) //d.stress > fringeScaleMax? "fuchsia" : d.stress < fringeScaleMin? "gray" : 
        .style("display", showTFringe ? "block" : "none")
    fringeDots.exit().remove()

    updateLabels();

    background
        .on("click", function(event) {
            weldDrag.attr("opacity", 0);
            NodeDrag.attr("opacity", 0);
            loadDrag.attr("opacity", 0);
            if (showSettings) showHideSettings();
            if (showStressMenu) showHideStressMenu();
            if (showWPropMenu) showHideProps();
        })
}


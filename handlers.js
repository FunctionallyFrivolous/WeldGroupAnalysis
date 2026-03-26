
function showHideStress(id) {
    // showStress = !showStress
    // stressButton
    //     .attr("fill-opacity", showStress ? 0.125 : 0)
    //     .attr("stroke-opacity", showStress ? 0 : 0.25)
    if (id === "max") {
        showHideTMax()
        stressButtons
            .filter(d => d.id === id)
            .attr("fill-opacity", d => showTMax ? 0.125 : 1)
            .attr("stroke-opacity", d => showTMax ? 0.75 : 0.5)
    }
    else if(id === "inspect") {
        inspect()
        stressButtons
            .filter(d => d.id === id)
            .attr("fill-opacity", d => showInspect ? 0.125 : 1)
            .attr("stroke-opacity", d => showInspect ? 0.75 : 0.5)
    }
    else if(id === "direct") {
        showTDir = !showTDir
        stressButtons
            .filter(d => d.id === id)
            .attr("fill-opacity", d => showTDir ? 0.125 : 1)
            .attr("stroke-opacity", d => showTDir ? 0.75 : 0.5)
    }
    else if(id === "torsional") {
        showTTor = !showTTor
        stressButtons
            .filter(d => d.id === id)
            .attr("fill-opacity", d => showTTor ? 0.125 : 1)
            .attr("stroke-opacity", d => showTTor ? 0.75 : 0.5)
    }
    else if(id === "total") {
        showStress = !showStress
        stressButtons
            .filter(d => d.id === id)
            .attr("fill-opacity", d => showStress ? 0.125 : 1)
            .attr("stroke-opacity", d => showStress ? 0.75 : 0.5)
    }

    updateView();
}

// function showHideTDir() {
//     showTDir = !showTDir
//     tDirButton
//         .attr("fill-opacity", showTDir ? 0.125 : 0)
//         .attr("stroke-opacity", showTDir ? 0 : 0.25)
//     updateView();
// }

// function showHideTTor() {
//     showTTor = !showTTor
//     tTorButton
//         .attr("fill-opacity", showTTor ? 0.125 : 0)
//         .attr("stroke-opacity", showTTor ? 0 : 0.25)
//     updateView();
// }

function showHideTMax() {
    showTMax = !showTMax

    if (!showTMax) {
        for (i = 0; i < nodes.length; i++) {
            nodes[i].display = "none"
        }
    }

    updateWeldProps();

    tMaxProps
        .text(`τ`)
        // .style("display", showTMax ? "block" : "none")
        .append("tspan")
        .text(showInspect ? "insp" : "max")
        .attr("font-family", "sans-serif") 
        .attr("font-size", "5pt")
        .attr("dy", "1.5em")
        .attr("text-anchor", "middle")
        .attr("alignment-baseline", "text-before-edge")
        .append("tspan")
        .text(`: ${max_t.toFixed(units === "metric" ? 2 : 1)} ${stressSymbol}`)
        .attr("font-size", "8pt")
        .attr("dy", "-0.6em")
        .attr("text-anchor", "middle")
        .attr("alignment-baseline", "text-before-edge")
    RxShowHide
        // .attr("height", showTMax ? 80 : 65)
        .attr("height", 80)
    // stressButtons
    //     .filter(d => d.id === "max")
    //     .attr("fill-opacity", showTMax ? 0.125 : 0)
    //     .attr("stroke-opacity", showTMax ? 0 : 0.25)

    updateView();
}

function unitSwap() {
    if (units === "metric") {
        units = "inches";
        unitSymbol = `"`;
        forceSymbol = "lbf";
        momentSymbol = "ft-lb"
        stressSymbol = "psi"
        unitConvert = 1;
        forceConvert = 1;
        unitPrecision = 1;
        weldThkScale = 40;
        stressScale = 3;
    }
    else {
        units = "metric";
        unitSymbol = "mm";
        forceSymbol = "N";
        momentSymbol = "N-m"
        stressSymbol = "MPa"
        unitConvert = 25.4;
        forceConvert = 4.448;
        unitPrecision = 0;
        weldThkScale = 40;
        stressScale = stressScale*145;
    }

    selectWEditProp()
    selectLEditProp()

    updateView();
    updateWeldProps();
    updateLoadProps();

    selectWEditProp()
    selectLEditProp()

    unitsIcon
        .text(units === "metric" ? "MM" : "IN")
    // unitsButton
    //     .attr("opacity", units === "metric" ? 0.25 : 0)
    showHideWProps.attr("width", units === "metric" ? 180 : 160)

    // ftiView();
}

function lockUnlock() {
    geomLock = !geomLock;
    // document.getElementById("loadScaleSlider").disabled = geomLock ? true : false;
    // document.getElementById("stressScaleSlider").disabled = geomLock ? true : false;
    // document.getElementById("snapDistSlider").disabled = geomLock ? true : false;
    addWIcon.attr("fill", geomLock || weldCount >= maxWelds ? "white" : "green")
    removeWIcon.attr("fill", geomLock || weldCount <= 1 ? "white" : "red")
    addLIcon.attr("fill", geomLock || loadCount >= maxLoads ? "white" : "green")
    removeLIcon.attr("fill", geomLock || loadCount <= 1 ? "white" : "red")
    lockIcon
        .text(geomLock ? "🔒" : "🔓")
        .attr("opacity", geomLock ? 1 : 0.75)
    lockButton
        .attr("fill-opacity", geomLock ? 0.125 : 0)
        .attr("stroke-opacity", geomLock ? 0 : 0.25)

}

function inspect() {
    showInspect = !showInspect
    stressIcons
        .filter(d => d.id === "inspect")
        .text(showInspect ? "🔍" : "🔎")
        .attr("opacity", showInspect ? 1 : 0.75)
    stressButtons
        .filter(d => d.id === "inspect")
        .attr("fill-opacity", showInspect ? 0.125 : 0)
        .attr("stroke-opacity", showInspect ? 0.5 : 0.5)
        .append("title")
        .text("Inspect Weld Stress")
    
    inspPropsBox.style("display", showInspect ? "block" : "none")
    inspPropsText
        .text(`τ`)
        .style("display", showInspect ? "block" : "none")
        .append("tspan")
        .text("insp")
        .attr("font-family", "sans-serif") 
        .attr("font-size", "5pt")
        .attr("dy", "1.5em")
        .attr("text-anchor", "middle")
        .attr("alignment-baseline", "text-before-edge")
        .append("tspan")
        .text(`: ${inspectStress.toFixed(units === "metric" ? 2 : 1)} ${stressSymbol}`)
        .attr("font-size", "8pt")
        .attr("dy", "-0.6em")
        .attr("text-anchor", "middle")
        .attr("alignment-baseline", "text-before-edge")
        .append("tspan")
        .text(`(${coordToDist(inspectX,"x").toFixed(1)}, ${coordToDist(inspectY,"y").toFixed(1)})`)
        .attr("x", 250)
        .attr("dy", "2.5em")
    inspectDot.style("display", showInspect ? "block" : "none")
    // showTMax = !showTMax;
}

// function setupScaleSliders() {
    // const LoadScaleSlider = document.getElementById("loadScaleSlider");
    // LoadScaleSlider.addEventListener("input", () => {
    //     loadScale = parseFloat(LoadScaleSlider.value);
    //     updateView();
    // })

    // const StressScaleSlider = document.getElementById("stressScaleSlider");
    // StressScaleSlider.addEventListener("input", () => {
    //     stressScale = parseFloat(StressScaleSlider.value);
    //     updateView();
    // })

    // const snapSlider = document.getElementById("snapDistSlider");
    // snapSlider.addEventListener("input", () => {
    //     snapDist = parseFloat(snapSlider.value);
    //     updateView();
    // })

    // const axisSlider = document.getElementById("axisScaleSlider");
    // axisSlider.addEventListener("input", () => {
    //     axisLength = parseFloat(axisSlider.value);
    //     coordAxes.style("display", axisLength <= 1 ? "none" : "block")
    //     xAxisLab.style("display", axisLength <= 1 ? "none" : "block")
    //     yAxisLab.style("display", axisLength <= 1 ? "none" : "block")
    //     originDot.style("display", axisLength <= 1 ? "none" : "block")
    //     updateView();
    // })
// }
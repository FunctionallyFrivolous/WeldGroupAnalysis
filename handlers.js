
function showHideStress() {
    showStress = !showStress
    stressButton
        .attr("fill-opacity", showStress ? 0.125 : 0)
        .attr("stroke-opacity", showStress ? 0 : 0.25)
    updateView();
}

function showHideTDir() {
    showTDir = !showTDir
    tDirButton
        .attr("fill-opacity", showTDir ? 0.125 : 0)
        .attr("stroke-opacity", showTDir ? 0 : 0.25)
    updateView();
}

function showHideTTor() {
    showTTor = !showTTor
    tTorButton
        .attr("fill-opacity", showTTor ? 0.125 : 0)
        .attr("stroke-opacity", showTTor ? 0 : 0.25)
    updateView();
}

function showHideTMax() {
    showTMax = !showTMax
    if (!showTMax) {
        for (i = 0; i < nodes.length; i++) {
            nodes[i].display = "none"
        }
    }
    tMaxProps
        .text(`τ`)
        .style("display", showTMax ? "block" : "none")
        .append("tspan")
        .text("max")
        .attr("font-family", "sans-serif") 
        .attr("font-size", "5pt")
        .attr("dy", "1.5em")
        .attr("text-anchor", "middle")
        .attr("alignment-baseline", "text-before-edge")
        .append("tspan")
        .text(`: ${(max_t).toFixed(units === "metric" ? 2 : 1)} ${stressSymbol}`)
        .attr("font-size", "8pt")
        .attr("dy", "-0.6em")
        .attr("text-anchor", "middle")
        .attr("alignment-baseline", "text-before-edge")
    RxShowHide
        .attr("height", showTMax ? 80 : 65)
    tMaxButton
        .attr("fill-opacity", showTMax ? 0.125 : 0)
        .attr("stroke-opacity", showTMax ? 0 : 0.25)
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

// function inspect() {
//     inspection = !inspection;
//     inspectIcon
//         .text(inspection ? "🔍" : "🔎")
//         .attr("opacity", inspection ? 1 : 0.75)
//     inspectButton
//         .attr("opacity", inspection ? 0.125 : 0)
//     // showTMax = !showTMax;
// }

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
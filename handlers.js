// document.getElementById("toggleRx").addEventListener("click", () => {
//     showRx = !showRx
//     rxVector
//         .style("display", showRx ? "block" : "none")
//     rxMGroup
//         .style("display", showRx ? "block" : "none")
//     // centroidProps
//     //     .style("display", showRx ? "block" : "none")
//     // RxVProps
//     //     .style("display", showRx ? "block" : "none")
//     // RxMProps
//     //     .style("display", showRx ? "block" : "none")
//     const button = document.getElementById("toggleRx");
//     button.style.opacity = showRx ? 1 : 0.50 
// })

function showHideStress() {
    showStress = !showStress
    // const button = document.getElementById("toggleStress");
    // button.style.opacity = showStress ? 1 : 0.50
    stressButton
        .attr("fill-opacity", showStress ? 0.125 : 0)
        .attr("stroke-opacity", showStress ? 0 : 0.25)
    updateView();
}
// document.getElementById("toggleStress").addEventListener("click", () => {
//     showHideStress();
// })

function showHideTDir() {
    showTDir = !showTDir
    // const button = document.getElementById("toggleTDir");
    // button.style.opacity = showTDir ? 1 : 0.50
    tDirButton
        .attr("fill-opacity", showTDir ? 0.125 : 0)
        .attr("stroke-opacity", showTDir ? 0 : 0.25)
    updateView();
}

// document.getElementById("toggleTDir").addEventListener("click", () => {
//     showHideTDir();
// })

function showHideTTor() {
    showTTor = !showTTor
    // const button = document.getElementById("toggleTTor");
    // button.style.opacity = showTTor ? 1 : 0.50
    tTorButton
        .attr("fill-opacity", showTTor ? 0.125 : 0)
        .attr("stroke-opacity", showTTor ? 0 : 0.25)
    updateView();
}

// document.getElementById("toggleTTor").addEventListener("click", () => {
//     showHideTTor();
// })

function showHideTMax() {
    showTMax = !showTMax
    if (!showTMax) {
        for (i = 0; i < nodes.length; i++) {
            nodes[i].display = "none"
        }
    }
    // const button = document.getElementById("toggleTMax");
    // button.style.opacity = showTMax ? 1 : 0.50
    tMaxProps
        .text(`τₘₐₓ: ${(max_t).toFixed(units === "metric" ? 3 : 1)} ${stressSymbol}`)
        .style("display", showTMax ? "block" : "none")
    RxShowHide
        .attr("height", showTMax ? 80 : 65)
    tMaxButton
        .attr("fill-opacity", showTMax ? 0.125 : 0)
        .attr("stroke-opacity", showTMax ? 0 : 0.25)
    updateView();
}

// document.getElementById("toggleTMax").addEventListener("click", () => {
//     showHideTMax();
// })

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
    document.getElementById("loadScaleSlider").disabled = geomLock ? true : false;
    document.getElementById("stressScaleSlider").disabled = geomLock ? true : false;
    document.getElementById("snapDistSlider").disabled = geomLock ? true : false;
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

function setupScaleSliders() {
    const LoadScaleSlider = document.getElementById("loadScaleSlider");
    LoadScaleSlider.addEventListener("input", () => {
        loadScale = parseFloat(LoadScaleSlider.value);
        updateView();
    })

    const StressScaleSlider = document.getElementById("stressScaleSlider");
    StressScaleSlider.addEventListener("input", () => {
        stressScale = parseFloat(StressScaleSlider.value);
        updateView();
    })

    const snapSlider = document.getElementById("snapDistSlider");
    snapSlider.addEventListener("input", () => {
        snapDist = parseFloat(snapSlider.value);
        updateView();
    })

    const axisSlider = document.getElementById("axisScaleSlider");
    axisSlider.addEventListener("input", () => {
        axisLength = parseFloat(axisSlider.value);
        coordAxes.style("display", axisLength <= 1 ? "none" : "block")
        xAxisLab.style("display", axisLength <= 1 ? "none" : "block")
        yAxisLab.style("display", axisLength <= 1 ? "none" : "block")
        originDot.style("display", axisLength <= 1 ? "none" : "block")
        updateView();
    })
}

// document.getElementById("weldSize").addEventListener("input", function(event) {
//     const wSelect = weldCoords.find(j => j.id === selectedWeld)
//     wSelect.thk = event.target.valueAsNumber;
//     updateView();
// })
// document.getElementById("weldLen").addEventListener("input", function(event) {
//     const wSelect = weldCoords.find(j => j.id === selectedWeld)
//     wSelect.len = event.target.valueAsNumber;
//     updateView();
// })

// document.getElementById("weldStartX").addEventListener("input", function(event) {
//     const wSelect = weldCoords.find(j => j.id === selectedWeld)
//     wSelect.points[0].x = distToCoord(event.target.valueAsNumber, "x");
//     updateView();
// })
// document.getElementById("weldStartY").addEventListener("input", function(event) {
//     const wSelect = weldCoords.find(j => j.id === selectedWeld)
//     wSelect.points[0].y = distToCoord(event.target.valueAsNumber, "y");
//     updateView();
// })

// document.getElementById("weldEndX").addEventListener("input", function(event) {
//     const wSelect = weldCoords.find(j => j.id === selectedWeld)
//     wSelect.points[1].x = distToCoord(event.target.valueAsNumber, "x");
//     updateView();
// })
// document.getElementById("weldEndY").addEventListener("input", function(event) {
//     const wSelect = weldCoords.find(j => j.id === selectedWeld)
//     wSelect.points[1].y = distToCoord(event.target.valueAsNumber, "y");
//     updateView();
// })
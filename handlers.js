document.getElementById("toggleRx").addEventListener("click", () => {
    showRx = !showRx
    rxVector
        .style("display", showRx ? "block" : "none")
    rxMGroup
        .style("display", showRx ? "block" : "none")
    // centroidProps
    //     .style("display", showRx ? "block" : "none")
    // RxVProps
    //     .style("display", showRx ? "block" : "none")
    // RxMProps
    //     .style("display", showRx ? "block" : "none")
    const button = document.getElementById("toggleRx");
    button.style.opacity = showRx ? 1 : 0.50 
})

document.getElementById("toggleStress").addEventListener("click", () => {
    showStress = !showStress
    const button = document.getElementById("toggleStress");
    button.style.opacity = showStress ? 1 : 0.50
    updateView();
})

document.getElementById("toggleTDir").addEventListener("click", () => {
    showTDir = !showTDir
    const button = document.getElementById("toggleTDir");
    button.style.opacity = showTDir ? 1 : 0.50
    updateView();
})

document.getElementById("toggleTTor").addEventListener("click", () => {
    showTTor = !showTTor
    const button = document.getElementById("toggleTTor");
    button.style.opacity = showTTor ? 1 : 0.50
    updateView();
})

document.getElementById("toggleTMax").addEventListener("click", () => {
    showTMax = !showTMax
    if (!showTMax) {
        for (i = 0; i < nodes.length; i++) {
            nodes[i].display = "none"
        }
    }
    const button = document.getElementById("toggleTMax");
    button.style.opacity = showTMax ? 1 : 0.50
    tMaxProps
        .text(`τₘₐₓ: ${(max_t).toFixed(units === "metric" ? 3 : 1)} ${stressSymbol}`)
        .style("display", showTMax ? "block" : "none")
    updateView();
})

// document.getElementById("toggleCoords").addEventListener("click", () => {
//     showCoords = !showCoords
//     updateView();
// })

// document.getElementById("toggleLoadProps").addEventListener("click", () => {
//     showLoadProps = !showLoadProps
//     const button = document.getElementById("toggleLoadProps");
//     button.style.opacity = showLoadProps ? 1 : 0.50
//     // dragLCoords.style("display", showLoadProps ? "block" : "none")
//     // dragLProps.style("display", showLoadProps ? "block" : "none")
//     updateView();
// })

// document.getElementById("toggleWeldProps").addEventListener("click", () => {
//     showWeldProps = !showWeldProps
//     const button = document.getElementById("toggleWeldProps");
//     button.style.opacity = showWeldProps ? 1 : 0.50
//     // dragWCoords.style("display", showWeldProps ? "block" : "none")
//     // dragWProps.style("display", showWeldProps ? "block" : "none")
//     updateView();
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
        document.getElementById("lUnits").textContent = `"`;
        document.getElementById("thkUnits").textContent = `"`;
        document.getElementById("fUnits").textContent = `lbf`;
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
        document.getElementById("lUnits").textContent = "mm";
        document.getElementById("thkUnits").textContent = `mm`;
        document.getElementById("fUnits").textContent = `N`;
    }

    // const button = document.getElementById("toggleUnits");
    // button.textContent = units === "metric" ? "Metric" : "Inches";


    updateView();
    updateWeldProps();
    updateLoadProps();

    unitsIcon
        .text(units === "metric" ? "MM" : "IN")
    // unitsButton
    //     .attr("opacity", units === "metric" ? 0.25 : 0)
}
// document.getElementById("toggleUnits").addEventListener("click", () => {
//     unitSwap();
// })

function lockUnlock() {
    geomLock = !geomLock;
    // const button = document.getElementById("lockGeom");
    // button.textContent = geomLock ? "Unlock Geometry" : "Lock Geometry";
    // document.getElementById("addWeld").disabled = geomLock ? true : false;
    // document.getElementById("addLoad").disabled = geomLock ? true : false;
    // document.getElementById("removeWeld").disabled = geomLock ? true : false;
    // document.getElementById("removeLoad").disabled = geomLock ? true : false;
    document.getElementById("loadScaleSlider").disabled = geomLock ? true : false;
    document.getElementById("stressScaleSlider").disabled = geomLock ? true : false;
    document.getElementById("snapDistSlider").disabled = geomLock ? true : false;
    addWIcon.style("display", geomLock ? "none" : "block")
    removeWIcon.style("display", geomLock ? "none" : "block")
    addLIcon.style("display", geomLock ? "none" : "block")
    removeLIcon.style("display", geomLock ? "none" : "block")
    lockIcon
        .text(geomLock ? "🔒" : "🔓")
        .attr("opacity", geomLock ? 1 : 0.75)
    lockButton
        .attr("opacity", geomLock ? 0.125 : 0)
}

// document.getElementById("lockGeom").addEventListener("click", () => {
//     lockUnlock();
// })

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

// document.getElementById("addWeld").addEventListener("click", () => {
//     addWeld();
//     // if (weldCount >= 9) document.getElementById("addWeld").disabled = true;
//     // else document.getElementById("addWeld").disabled = false;
//     updateView();
// })

// document.getElementById("addLoad").addEventListener("click", () => {
//     addLoad();
//     // if (loadCount >= 9) document.getElementById("addLoad").disabled = true;
//     // else document.getElementById("addLoad").disabled = false;
//     updateView();
// })

// document.getElementById("removeWeld").addEventListener("click", () => {
//     removeWeld(selectedWeld);
//     updateView();
// })

// document.getElementById("removeLoad").addEventListener("click", () => {
//     removeLoad(selectedLoad);
//     updateView();
// })

document.getElementById("weldSize").addEventListener("input", function(event) {
    const wSelect = weldCoords.find(j => j.id === selectedWeld)
    wSelect.thk = event.target.valueAsNumber;
    updateView();
})
document.getElementById("weldLen").addEventListener("input", function(event) {
    const wSelect = weldCoords.find(j => j.id === selectedWeld)
    wSelect.len = event.target.valueAsNumber;
    updateView();
})

document.getElementById("weldStartX").addEventListener("input", function(event) {
    const wSelect = weldCoords.find(j => j.id === selectedWeld)
    wSelect.points[0].x = distToCoord(event.target.valueAsNumber, "x");
    updateView();
})
document.getElementById("weldStartY").addEventListener("input", function(event) {
    const wSelect = weldCoords.find(j => j.id === selectedWeld)
    wSelect.points[0].y = distToCoord(event.target.valueAsNumber, "y");
    updateView();
})

document.getElementById("weldEndX").addEventListener("input", function(event) {
    const wSelect = weldCoords.find(j => j.id === selectedWeld)
    wSelect.points[1].x = distToCoord(event.target.valueAsNumber, "x");
    updateView();
})
document.getElementById("weldEndY").addEventListener("input", function(event) {
    const wSelect = weldCoords.find(j => j.id === selectedWeld)
    wSelect.points[1].y = distToCoord(event.target.valueAsNumber, "y");
    updateView();
})
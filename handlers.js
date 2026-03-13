document.getElementById("toggleRx").addEventListener("click", () => {
    showRx = !showRx
    rxVector
        .style("display", showRx ? "block" : "none")
    rxMGroup
        .style("display", showRx ? "block" : "none")
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
    updateView();
})

// document.getElementById("toggleCoords").addEventListener("click", () => {
//     showCoords = !showCoords
//     updateView();
// })

document.getElementById("toggleLoadProps").addEventListener("click", () => {
    showLoadProps = !showLoadProps
    const button = document.getElementById("toggleLoadProps");
    button.style.opacity = showLoadProps ? 1 : 0.50
    dragLCoords.style("display", showLoadProps ? "block" : "none")
    dragLProps.style("display", showLoadProps ? "block" : "none")
    updateView();
})

document.getElementById("toggleWeldProps").addEventListener("click", () => {
    showWeldProps = !showWeldProps
    const button = document.getElementById("toggleWeldProps");
    button.style.opacity = showWeldProps ? 1 : 0.50
    dragWCoords.style("display", showWeldProps ? "block" : "none")
    dragWProps.style("display", showWeldProps ? "block" : "none")
    updateView();
})

function unitSwap() {
    if (units === "metric") {
        units = "inches";
        unitSymbol = `"`;
        forceSymbol = "lbf";
        unitConvert = 1;
    }
    else {
        units = "metric";
        unitSymbol = "mm";
        forceSymbol = "N";
        unitConvert = 25.4;
    }

    // const button = document.getElementById("toggleUnits");
    // button.textContent = units === "metric" ? "Metric" : "Inches";

    updateView();
    dragWCoords.style("display", "none");
    dragWProps.style("display", "none");
    
    dragLCoords.style("display", "none");
    dragLProps.style("display", "none");

    unitsIcon
        .text(units === "metric" ? "MM" : "IN")
    // unitsButton
    //     .attr("opacity", units === "metric" ? 0.25 : 0)
}
document.getElementById("toggleUnits").addEventListener("click", () => {
    unitSwap();
})

function lockUnlock() {
    geomLock = !geomLock;
    // const button = document.getElementById("lockGeom");
    // button.textContent = geomLock ? "Unlock Geometry" : "Lock Geometry";
    document.getElementById("addWeld").disabled = geomLock ? true : false;
    document.getElementById("addLoad").disabled = geomLock ? true : false;
    document.getElementById("loadScaleSlider").disabled = geomLock ? true : false;
    document.getElementById("stressScaleSlider").disabled = geomLock ? true : false;
    lockIcon
        .text(geomLock ? "🔒" : "🔓")
        .attr("opacity", geomLock ? 1 : 0.75)
    lockButton
        .attr("opacity", geomLock ? 0.25 : 0)
}

document.getElementById("lockGeom").addEventListener("click", () => {
    lockUnlock();
})


document.getElementById("addWeld").addEventListener("click", () => {
    addWeld();
    if (weldCount >= 9) document.getElementById("addWeld").disabled = true;
    else document.getElementById("addWeld").disabled = false;
    updateView();
})

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
}

document.getElementById("addLoad").addEventListener("click", () => {
    addLoad();
    if (loadCount >= 9) document.getElementById("addLoad").disabled = true;
    else document.getElementById("addLoad").disabled = false;
    updateView();
})
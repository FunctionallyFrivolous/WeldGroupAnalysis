document.getElementById("toggleRx").addEventListener("click", () => {
    showRx = !showRx
    rxVector
        .style("display", showRx ? "block" : "none")
    rxMGroup
        .style("display", showRx ? "block" : "none")
})

document.getElementById("toggleStress").addEventListener("click", () => {
    showStress = !showStress
    updateView();
})

document.getElementById("toggleTComps").addEventListener("click", () => {
    showTComps = !showTComps
    updateView();
})

document.getElementById("toggleUnits").addEventListener("click", () => {
    if (units === "metric") {
        units = "inches";
        unitConvert = 1;
    }
    else {
        units = "metric";
        unitConvert = 25.4;
    }

    const button = document.getElementById("toggleUnits");
    button.textContent = units === "metric" ? "Metric" : "Inches";

    updateView();
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

document.getElementById("removeLoad").addEventListener("click", () => {
    removeLoad();
    // if (loadCount === 1) document.getElementById("removeLoad").disabled = true;
    // else document.getElementById("removeLoad").disabled = false;
    updateView();
})
document.getElementById("toggleRx").addEventListener("click", () => {
    showRx = !showRx
    rxVector
        .style("display", showRx ? "block" : "none")
    rxMGroup
        .style("display", showRx ? "block" : "none")
})

document.getElementById("toggleStress").addEventListener("click", () => {
    showStress = !showStress
    fShear
        .style("display", showStress ? "block" : "none")
    tmax_circle
        .style("display", showStress ? d => d.display : "none")
})

document.getElementById("toggleTComps").addEventListener("click", () => {
    showTComps = !showTComps
    dShear
        .style("display", showTComps ? "block" : "none")
    tShear
        .style("display", showTComps ? "block" : "none")
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


document.getElementById("removeWeld").addEventListener("click", () => {
    test_delWeld();
    updateView();
})
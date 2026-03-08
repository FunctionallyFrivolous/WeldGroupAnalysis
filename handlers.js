document.getElementById("toggleRx").addEventListener("click", () => {
    if (showRx) showRx = false
    else showRx = true
    rxVector
        .style("display", showRx ? "block" : "none")
    rxMGroup
        .style("display", showRx ? "block" : "none")
})

document.getElementById("toggleStress").addEventListener("click", () => {
    if (showStress) showStress = false
    else showStress = true
    fShear
        .style("display", showStress ? "block" : "none")
    tmax_circle
        .style("display", showStress ? d => d.display : "none")
})

document.getElementById("toggleTComps").addEventListener("click", () => {
    if (showTComps) showTComps = false
    else showTComps = true
    dShear
        .style("display", showTComps ? "block" : "none")
    tShear
        .style("display", showTComps ? "block" : "none")
})

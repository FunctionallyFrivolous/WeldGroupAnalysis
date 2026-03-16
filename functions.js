
function updateStuff(){
    updateCentroid();
    updateWelds();
    // updateArea();
    // updateAngles();
    updateArrows();
    updateLoads();
    updateMids();
    updateRx();
    updateMomentArc();
    updateDirectShear();
    updateTorsionShear();
    updateTotalShear();
}

function updateSVGs(){
    cMark
        .attr("cx", d => d.x)
        .attr("cy", d => d.y);
    rxVector
        .attr("points", d => d.points.map(v => `${v.x},${v.y}`).join(" "))
        .style("display", showRx ? "block" : "none")
        if (Math.abs(rxV.mag) <= 0.1) {
            rxVector
                .style("display", "none")
        }
    rxMGroup
        .attr("d", dM)
        .style("display", showRx ? "block" : "none")
        
    if (Math.abs(rxM) <= 0.1) {
        rxMGroup
            .style("display", "none")
    }
    centroidCoords
        .attr("x", d => d.x)
        .attr("y", d => d.y+16)
        .text(d => {
            const dx = coordToDist(d.x, "x");
            const dy = coordToDist(d.y, "y");
            return `(${dx.toFixed(unitPrecision)}, ${dy.toFixed(unitPrecision)})`;
        })
        .style("display", showWeldProps || showCentCoords ? "block" : "none");

    coordAxes
        .attr("points", `${origin[0]},${origin[1]-axisLength} ${origin} ${origin[0]+axisLength},${origin[1]}`)
    xAxisLab
        .attr("x", origin[0]+axisLength)
        .attr("y", origin[1])
    yAxisLab
        .attr("x", origin[0])
        .attr("y", origin[1]-axisLength)
    
    editObject = weldCoords.find(j => j.id === selectedWeld);
    editValue = coordToDist(editObject.points[0].x, "x");
    if (!editing) testField.text(editValue.toFixed(2));
    
    // unitsButton
    //     .append("title")
    //     .text(`units (${units})`)

        // document.getElementById("debugOutputs").innerHTML = "rxM: " + `${rxM.toFixed(1)}` + "\n<br>"

}

function updateView() {
    updateStuff();
    updateData();
    updateDrags();
    updateSVGs();

    let dbugTxt = ""
        // + "fShear: " + `${totalShear[weldCount*2-1].points[1].x.toFixed(2)}` + ", " + `${totalShear[weldCount*2-1].points[1].y.toFixed(2)}` + "\n<br>"
        // + "tShear: " + `${torsionShear[weldCount*2-1].points[1].x.toFixed(2)}` + ", " + `${torsionShear[weldCount*2-1].points[1].y.toFixed(2)}` + "\n<br>"
    // //     + "Wx0: " + `${weldCoords[0].points[0].x*distConvert*unitConvert}` + "\n<br>"
    // //     + "rxV: " + `${rxV.mag.toFixed(1)}` + "\n<br>"
        // + "rxM: " + `${rxM.toFixed(1)}` + "\n<br>"
    //     // + "welds: " + `${weldCount}` + "\n<br>"

    // document.getElementById("debugOutputs").innerHTML = dbugTxt;
}

// This function updates the weldCoords array with latest nodes data
function updateWelds() {
    const nodeQty = nodes.length;
    if (nodeQty % 2 !== 0) return;
    J_tot = 0;
    for (i = 0; i < nodeQty; i+=2) {
        const w = Math.floor(i/2);
        const x0 = nodes[i].x;
        const y0 = nodes[i].y;
        const x1 = nodes[i+1].x;
        const y1 = nodes[i+1].y;

        nodes[i].id = "weld"+(w+1)+"_start";
        nodes[i+1].id = "weld"+(w+1)+"_end";
        // const thk = 0.125;
        const length = Math.sqrt((x1-x0)*(x1-x0)+(y1-y0)*(y1-y0));
        const cx = (x1+x0)/2;
        const cy = (y1+y0)/2;

        weldCoords[w].id = "weld"+(w+1);
        weldCoords[w].points[0] = nodes[i];
        weldCoords[w].points[1] = nodes[i+1];
        weldCoords[w].thk = weldCoords[w].thk;
        const thk = weldCoords[w].thk * unitConvert;
        weldCoords[w].len = length * distConvert * unitConvert;
        weldCoords[w].A = weldCoords[w].len * thk * 0.707;
        weldCoords[w].C = [cx,cy];

        // Calc 2nd Moments of Area
        const Ix = thk*0.707 * weldCoords[w].len*weldCoords[w].len*weldCoords[w].len/12; // J = t*d^3/12
        const Iy = thk*0.707*thk*0.707*thk* 0.707 * weldCoords[w].len/12; // J = t^3*d/12
        const Ji = Ix + Iy;

        weldCoords[w].Ix = Ix;
        weldCoords[w].Iy = Iy;
        weldCoords[w].J = Ji;

        let ri = Math.sqrt((cx-centroidTot[0].x)*(cx-centroidTot[0].x)+(cy-centroidTot[0].y)*(cy-centroidTot[0].y))
        ri = coordToDist(ri, "L")

        J_tot = J_tot + (Ji+ weldCoords[w].A * ri*ri);
    }
}

function updateArea() {
    updateWelds();
    areaTot = 0;
    const weldQty = weldCoords.length;
    for (let i = 0; i < weldQty; i++) {
        const weldArea = weldCoords[i].A;
        areaTot = areaTot + weldArea;
    }
}

function updateCentroid() {
    updateArea();
    centroidTot[0].x = 0;
    centroidTot[0].y = 0;
    const weldQty = weldCoords.length;
    for (let i = 0; i < weldQty; i++) {
        const weldA = weldCoords[i].A;
        const weldC = weldCoords[i].C;
        const cx = centroidTot[0].x;
        const cy = centroidTot[0].y;
        centroidTot[0].x = centroidTot[0].x + weldC[0]*weldA/areaTot;
        centroidTot[0].y = centroidTot[0].y + weldC[1]*weldA/areaTot;
    }
}

function updateAngles(){
    for (let i = 0; i < loadProps.length; i++) {
        const xa = loadProps[i].x;
        const ya = loadProps[i].y;
        const xt = loadMids[i].x;
        const yt = loadMids[i].y;
        let th = radToDeg(Math.atan((ya-yt)/(xt-xa)))
        const sgn = (xt-xa)/Math.abs(xt-xa)
        // loadProps[i].th = th;
        if(sgn < 0) {
            th = 180+th;
        }
        if (th < 0) th = 360 + th
        loadProps[i].th = th;
    }
}

function updateArrows() {
    // updateAngles();
    const loadQty = loadProps.length;
    for (let i = 0; i < loadQty; i++) {
        const xa = loadProps[i].x;
        const ya = loadProps[i].y;
        const th_rad = degToRad(loadProps[i].th);
        const xt = xa + loadScale*(loadProps[i].mag) * Math.cos(th_rad);
        const yt = ya - loadScale*(loadProps[i].mag) * Math.sin(th_rad);
        loadArrows[i].x = xt;
        loadArrows[i].y = yt;
        loadArrows[i].mag = loadProps[i].mag;
        loadArrows[i].id = `load${i+1}`
    }   
}

function updateMids() {
    const loadQty = loadProps.length;
    for (let i = 0; i < loadQty; i++) {
        const arrowLen = loadProps[i].mag * loadScale;
        const mid_x = (loadProps[i].x+loadArrows[i].x)/2;
        const mid_y = (loadProps[i].y+loadArrows[i].y)/2;
        loadMids[i].x = mid_x;
        loadMids[i].y = mid_y;
        loadMids[i].th = loadProps[i].th;
        loadMids[i].id = `load${i+1}`
    }
}

function updateLoads() {
    updateArrows();
    const loadQty = loadProps.length;
    for (let i = 0; i < loadQty; i++) {
        loadProps[i].id = loadPoints[i].id;
        loadPoints[i].points = [{x: loadProps[i].x, y: loadProps[i].y}, {x: loadArrows[i].x, y: loadArrows[i].y}];
        loadPoints[i].id = `load${i+1}`;
        loadProps[i].id = loadPoints[i].id;
    }
}

function updateRx() {
    // Reaction Force
    rxV.x = centroidTot[0].x;
    rxV.y = centroidTot[0].y;

    rxV_x = 0;
    for (let i = 0; i < loadPoints.length; i++) {
        let load_th = loadProps[i].th;
        if (load_th < 0) {
            load_th = 360 + load_th;
        }
        load_th = degToRad(load_th)
        // rxV_x = rxV_x + Math.cos(degToRad(loadProps[i].th)) * loadProps[i].mag;
        rxV_x = rxV_x + Math.cos(load_th) * loadProps[i].mag * forceConvert;
    }
    rxV_y = 0;
    for (let i = 0; i < loadProps.length; i++) {
        let load_th = loadProps[i].th;
        if (load_th < 0) {
            load_th = 360 + load_th;
        }
        load_th = degToRad(load_th)
        // rxV_x = rxV_x + Math.cos(degToRad(loadProps[i].th)) * loadProps[i].mag;
        rxV_y = rxV_y + Math.sin(load_th) * loadProps[i].mag * forceConvert;
    }
    rxV.mag = Math.sqrt((rxV_x)*(rxV_x)+(rxV_y)*(rxV_y));
    rxV.th = radToDeg(Math.atan((rxV_y)/(rxV_x)));
    rxV.th = rxV.th -180;
    if(rxV_x < 0) {
        rxV.th = rxV.th + 180
    }
    if (rxV.th < 0) rxV.th = rxV.th + 360;
    // if (rxV.th === 360) rxV.th = 0;

    const xt = rxV.x + loadScale*(rxV.mag/forceConvert) * Math.cos(degToRad(rxV.th));
    const yt = rxV.y - loadScale*(rxV.mag/forceConvert) * Math.sin(degToRad(rxV.th));
    rxV[0].points = [{x: rxV.x, y: rxV.y}, {x: xt, y: yt}];

    // Reaction Moment
    rxM = 0;
    for (let i = 0; i < loadProps.length; i++) {
        const lmag = loadProps[i].mag * forceConvert;
        const th_L = loadProps[i].th;

        const x0 = centroidTot[0].x;
        const y0 = centroidTot[0].y;
        const x1 = loadProps[i].x;
        const y1 = loadProps[i].y;
        const x2 = loadArrows[i].x;
        const y2 = loadArrows[i].y;
        

        let lquad = 0;
        if (x1 >= x0) {
            if (y1 <= y0) lquad = 0 //quad 1
            else lquad = 360 //quad 4
        }
        else lquad = 180 // quad 2 or 3

        const th_mArm = radToDeg(Math.atan((y0-y1)/(x1-x0))) + lquad;

        let th_mod = 0;
        if (th_mArm > th_L) th_mod = 360
        const th_rxM = th_L - th_mArm + th_mod;

        let mArm = Math.abs((y2-y1)*x0 - (x2-x1)*y0 + x2*y1 - y2*x1)/Math.sqrt((y2-y1)*(y2-y1)+(x2-x1)*(x2-x1));
        mArm = coordToDist(mArm, "L");
        let rxMi = mArm * lmag;
        // if (units === "metric") rxMi = rxMi / 1000;
        // else rxMi = rxMi / 12;
        if (th_rxM > 180) rxMi = rxMi * -1

        rxM = rxM - rxMi;
        rxM = rxM;
        if (Math.abs(rxM) < 0.0001) rxM = 0;
    }
    updateMomentArc();
}

function updateMomentArc() {
    const arcRad = 25
    const startPoint_x = centroidTot[0].x-arcRad;
    const startPoint_y = centroidTot[0].y;
    const endPoint_x = startPoint_x + arcRad*2;
    const endPoint_y = startPoint_y;
    let dir = 0;
    if (rxM < 0) dir = 1

    const M = `${startPoint_x}`+","+`${startPoint_y}`; // start point coords
    const E = `${endPoint_x}`+","+`${endPoint_y}`; // end point coords
    const A = `${arcRad}`+","+`${arcRad}`
    const flags = "0,"+`${dir}`

    dM = "M "+`${M}`+" A "+`${A}`+" 0 "+`${flags}`+" "+`${E}`
}

function updateDirectShear() {
    for (i = 0; i < nodes.length; i++) {
        directShear[i].id = nodes[i].id;
        const xa = nodes[i].x;
        const ya = nodes[i].y;
        const w = Math.floor(i/2);
        const Ai = weldCoords[w].A;
        directShear[i].mag = Math.abs(rxV.mag) / areaTot;
        let th = rxV.th;
        if (th < 0) th = th + 360;
        directShear[i].th = th;

        const xt = xa + stressScale*(directShear[i].mag) * Math.cos(degToRad(directShear[i].th));
        const yt = ya - stressScale*(directShear[i].mag) * Math.sin(degToRad(directShear[i].th));

        directShear[i].points = [{x: xa, y: ya}, {x: xt, y: yt}];
    }
}

function updateTorsionShear() {
    for (i = 0; i < nodes.length; i++) {
        torsionShear[i].id = nodes[i].id;

        const xa = nodes[i].x;
        const ya = nodes[i].y;
        const xC = centroidTot[0].x;
        const yC = centroidTot[0].y;
        let mArm = Math.sqrt((xa-xC)*(xa-xC)+(ya-yC)*(ya-yC))
        mArm = coordToDist(mArm, "L")

        let mag = rxM * mArm / J_tot; 
        // mag = mag / 100;
        // mag = rxM / mArm;

        torsionShear[i].mag = Math.abs(mag);

        let nQuad = 0;
        if (xa < xC) {
            if (ya <= yC) nQuad = 0
            else nQuad = 0
        }
        else nQuad = 180

        let th = radToDeg(Math.atan((yC-ya)/(xa-xC))) + 90 + nQuad
        if (rxM > 0) th = th + 180
        if (th < 0) th = th + 360
        torsionShear[i].th = th;

        const xt = xa + stressScale*torsionShear[i].mag * Math.cos(degToRad(torsionShear[i].th));
        const yt = ya - stressScale*torsionShear[i].mag * Math.sin(degToRad(torsionShear[i].th));

        torsionShear[i].points = [{x: xa, y: ya}, {x: xt, y: yt}];
    }
}

function updateTotalShear() {
    max_t = 0;
    for (i = 0; i < nodes.length; i++) {
        // const cent_x = centroidTot.x;
        // const cent_y = centroidTot.y;
    
        totalShear[i].id = nodes[i].id;

        const dS_mag = directShear[i].mag; // 150
        const dS_th = directShear[i].th; //26.6
        const dS_x = dS_mag * Math.cos(degToRad(dS_th));
        const dS_y = dS_mag * Math.sin(degToRad(dS_th));

        const tS_mag = torsionShear[i].mag; // 179.9
        const tS_th = torsionShear[i].th;  // 26.6
        const tS_x = tS_mag * Math.cos(degToRad(tS_th));
        const tS_y = tS_mag * Math.sin(degToRad(tS_th));

        const fS_x = dS_x+tS_x;
        const fS_y = dS_y+tS_y;
        const fS_mag = Math.sqrt(fS_y*fS_y+fS_x*fS_x);

        let fS_th = radToDeg(Math.atan(fS_y/fS_x));
        // if (rxM > 0) fS_th = fS_th + 180
        if (fS_x < 0) fS_th = fS_th + 180
        if (fS_th < 0) fS_th = fS_th + 360

        totalShear[i].mag = fS_mag;
        totalShear[i].th = fS_th;

        const xa = nodes[i].x;
        const ya = nodes[i].y;

        const xt = xa + stressScale*fS_mag * Math.cos(degToRad(fS_th));
        const yt = ya - stressScale*fS_mag * Math.sin(degToRad(fS_th));

        totalShear[i].points = [{x: xa, y: ya}, {x: xt, y: yt}];

        if (fS_mag > max_t) max_t = fS_mag
        nodes[i].t = fS_mag
        
    }
    for (i = 0; i < nodes.length; i++) {
        if (nodes[i].t >= max_t*0.99 && showTMax) nodes[i].display = "block"
        else nodes[i].display = "none";
    }
    
}

function viewTransform() {
    const zoom = `
        translate(${currentZoomTransform.x}, ${currentZoomTransform.y})
        scale(${currentZoomTransform.k})
    `;
    zoomGroup.attr("transform", `${zoom}`);
}

function InitGeom() {
    nodes.length = weldCount*2;
    weldCoords.length = weldCount;
    directShear.length = weldCount*2;
    torsionShear.length = weldCount*2;
    totalShear.length = weldCount*2;

    loadProps.length = loadCount;
    loadArrows.length = loadCount;
    loadMids.length = loadCount;
    loadPoints.length = loadCount;
}

function addWeld() {
    if (weldCount >= maxWelds) return;

    if (weldCount >= maxWelds-1 || geomLock) {
        // document.getElementById("addWeld").disabled = true;
        addWIcon.attr("fill", "white")
    }
    if (weldCount < maxWelds-1 && !geomLock) {
        // document.getElementById("addWeld").disabled = false;
        // document.getElementById("removeWeld").disabled = false;
        removeWIcon.attr("fill", "red")
    }

    let newX0 = 0;
    let newY0 = 0;
    let newX1 = 0;
    let newY1 = 0;

    if (backUpWelds.length > 0) {
        newX0 = backUpWelds[0].points[0].x;
        newY0 = backUpWelds[0].points[0].y;
        newX1 = backUpWelds[0].points[1].x;
        newY1 = backUpWelds[0].points[1].y;
    } else {
        newX0 = Math.floor(Math.random()*(450-50)+50);
        newY0 = Math.floor(Math.random()*(450-50)+50);
        newX1 = Math.floor(Math.random()*(450-50)+50);
        newY1 = Math.floor(Math.random()*(450-50)+50);
    }

    const newWeld = {startNode: [newX0,newY0], endNode: [newX1,newY1]};
    const addNodes = [
        {id: "weld"+`${weldCoords.length+1}`+"_start", x: newWeld.startNode[0], y: newWeld.startNode[1], t: 0, display: "block"},
        {id: "weld"+`${weldCoords.length+1}`+  "_end", x: newWeld.endNode[0],   y: newWeld.endNode[1], t: 0, display: "block"},
    ]
    nodes.push(addNodes[0]);
    nodes.push(addNodes[1]);

    const addWeld = {id: "weld"+`${weldCoords.length+1}`, points: [nodes[weldCoords.length*2], nodes[(weldCoords.length*2)+1]], thk: defaultThk, len: 0, A: 0, C: [0,0], Ix: 0, Iy: 0, J: 0, show: false}
    weldCoords.push(addWeld);

    const addStress = [
        {id: "weld"+`${weldCoords.length+1}`+"_start", points: [{x: 0, y: 0},{x: 0, y: 0}], mag: 0, th: 0},
        {id: "weld"+`${weldCoords.length+1}`+"_end", points: [{x: 0, y: 0}, {x: 0, y: 0}], mag: 0, th: 0},
    ]

    directShear.push(
        structuredClone(addStress[0]),
        structuredClone(addStress[1])
    );
    torsionShear.push(
        structuredClone(addStress[0]),
        structuredClone(addStress[1])
    );    
    totalShear.push(
        structuredClone(addStress[0]),
        structuredClone(addStress[1])
    );

    weldCount = weldCoords.length;

    selectedWeld = `weld${weldCount}`
    
    backUpWelds.splice(0,1);

    updateView();
    updateWeldProps();
    updateLoadProps();
}

function addLoad() {
    if (loadCount >= maxLoads) return;

    if (loadCount >= maxLoads-1 || geomLock) {
        addLIcon.attr("fill", "white")
    }
    if (loadCount < maxLoads-1 && !geomLock) {
        removeLIcon.attr("fill", "red")
    }

    let newX = 0;
    let newY = 0;
    let newTh = 0;
    let newMag = 0;

    if (backUpLoads.length > 0) {
        newX = backUpLoads[0].x;
        newY = backUpLoads[0].y;
        newTh = backUpLoads[0].th;
        newMag = backUpLoads[0].mag;
    } else {
        newX = Math.floor(Math.random()*(450-50)+50);
        newY = Math.floor(Math.random()*(450-50)+50);
        newTh = Math.floor(Math.random()*(359-0)+0);
        newMag = Math.floor(Math.random()*(250-50)+50);
    }

    loadProps.push(
        {id: "load"+`${loadCount+1}`, x: newX, y: newY, th: newTh, mag: newMag, show: false},
    );

    loadArrows.push(
        {id: "load"+`${loadCount+1}`, x: 0, y: 0, mag: 0, show: false}
    )

    loadMids.push(
        {id: "load"+`${loadCount+1}`, x: 0, y: 0, th: 0, show: false}
    )

    loadPoints.push(
        {id: "load"+`${loadCount+1}`,points: [{x: newX, y: newY},{x: 0, y: 0}]}
    )
    loadCount = loadProps.length;

    selectedLoad = `load${loadCount}`

    backUpLoads.splice(0,1);

    updateView();
    updateWeldProps();
    updateLoadProps();
}

function removeWeld(id) {
    if (weldCount === 1) return;

    if (weldCount <= maxWelds && !geomLock) {
        // document.getElementById("addWeld").disabled = false;
        addWIcon.attr("fill", "green");
    }

    if (weldCount <= 2 || geomLock) {
        // document.getElementById("removeWeld").disabled = true;
        removeWIcon.attr("fill", "white");
    }

    let index = weldCoords.findIndex(obj => obj.id === id);

    const weldBackup = {points: [{x: weldCoords[index].points[0].x, y: weldCoords[index].points[0].y},{x: weldCoords[index].points[1].x, y: weldCoords[index].points[1].y}], thk: weldCoords[index].thk}
    backUpWelds.unshift(weldBackup);
    
    if (index > -1) {
        weldCoords.splice(index, 1);
    }
    for (i = 0; i < 2; i++) {
        index = nodes.findIndex(obj => obj.id.includes(id));
        if (index > -1) {
            nodes.splice(index, 1);
        }    
    }
    for (i = 0; i < 2; i++) {
        index = directShear.findIndex(obj => obj.id.includes(id));
        if (index > -1) {
            directShear.splice(index, 1);
        }    
    }
    for (i = 0; i < 2; i++) {
        index = torsionShear.findIndex(obj => obj.id.includes(id));
        if (index > -1) {
            torsionShear.splice(index, 1);
        }    
    }
    for (i = 0; i < 2; i++) {
        index = totalShear.findIndex(obj => obj.id.includes(id));
        if (index > -1) {
            totalShear.splice(index, 1);
        }    
    }

    weldCount = weldCoords.length;
    // weldDrag.attr("opacity", 0)

    selectedWeld = `weld${weldCount}`

    updateView();
    updateWeldProps();
    updateLoadProps();
    
    // dragWCoords
    //     .style("display", "none");
    // dragWProps
    //     .style("display", "none");
}

function removeLoad(id) { // test function to remove one weld
    if (loadCount === 1) return;

    if (loadCount <= maxLoads && !geomLock) {
        addLIcon.attr("fill", "green");
    }
    if (loadCount <= 2 || geomLock) {
        removeLIcon.attr("fill", "white");
    }
    
    let index = loadProps.findIndex(obj => obj.id === id);

    const loadBackup = {x: loadProps[index].x, y: loadProps[index].y, th: loadProps[index].th, mag: loadProps[index].mag}
    backUpLoads.unshift(loadBackup);
    
    if (index > -1) {
        loadProps.splice(index, 1);
    }

    index = loadArrows.findIndex(obj => obj.id.includes(id));
    if (index > -1) {
        loadArrows.splice(index, 1);
    }    

    index = loadMids.findIndex(obj => obj.id.includes(id));
    if (index > -1) {
        loadMids.splice(index, 1);
    }    
    
    index = loadPoints.findIndex(obj => obj.id.includes(id));
    if (index > -1) {
        loadPoints.splice(index, 1);
    }

    loadCount = loadProps.length;

    selectedLoad = `load${loadCount}`

    updateView();
    updateWeldProps();
    updateLoadProps();
    // dragLCoords
    //     .style("display", "none");
    // dragLProps
    //     .style("display", "none");
}

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
                // xtemp = event.x;
                // ytemp = event.y;
                selectedWeld = d.id.slice(0,5)
                NodeDrag.attr("opacity",0.1);
                const strIndex = d.id.indexOf("_");
                const wID = d.id.substring(0,strIndex);
                const dragWeld = weldCoords.find(j => j.id === wID);
                d.show = true;
                showCentCoords = true;
                updateWeldProps();
                dragWCoords.style("display", "block")
                dragWProps.style("display", "block")
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
                updateStuff();
                updateSVGs();
                updateData();
            })
            .on("end", (event, d) => {
                NodeDrag.attr("opacity", n => n.id === d.id ? 0.1 : 0);
                weldDrag.attr("opacity", 0)
                d.show = false;
                showCentCoords = false;
                updateWeldProps();
                updateStuff();
                updateData();
                updateSVGs();
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
                selectedWeld = d.id;
                xtemp = event.x;
                ytemp = event.y;
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
                const x_delta = event.x - xtemp;
                const y_delta = event.y - ytemp;
                for (i = 0; i < 2; i++) {
                    d.points[i].x = d.points[i].x + x_delta;
                    d.points[i].y = d.points[i].y + y_delta;
                }
                updateWeldProps();
                updateStuff();
                updateSVGs();
                updateData();
                xtemp = event.x;
                ytemp = event.y;
            })
            .on("end", (event, d) => {
                weldDrag.attr("opacity", n => n.id.includes(d.id) ? 0.1 : 0);
                NodeDrag.attr("opacity", 0);
                showCentCoords = false;
                updateWeldProps();
                updateData();
                updateSVGs();
            })
        )
        // .on("mouseover", function(event, d) {
        //     weldDrag.attr("opacity", n => n.id = d.id ? 0.1 : 0)
        // })
        // .on("mouseout", function(event, d) {
        //     weldDrag.attr("opacity", 0)
        // })
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
                updateArrows();
                updateStuff();
                updateSVGs();
                updateData();
                updateAngles();
            })
            .on("end", (event, d) => {
                // loadDrag.attr("opacity", 0);
                loadDrag.attr("opacity", n => n.id.includes(d.id) ? 0.1 : 0);
                loadProps.find(j => j.id === d.id).show = false;
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
                // Snaps
                const x_opp = dragLoad.x;
                const y_opp = dragLoad.y;
                // Snap
                [d.x, d.y] = snapDrag(d.id, d.x, d.y, x_opp, y_opp)
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
        .attr("stroke", "black")
        .style("stroke-linecap", "round")
        .attr("opacity", 0.4)
        .attr("fill", "none")
    enter.merge(weldLines)
        .attr("stroke-width", d => d.thk*weldThkScale)
        .attr("points", d => d.points.map(j => `${j.x},${j.y}`).join(" "));
    weldLines.exit().remove();

    // Max Stress Indicators
    const tmax_circle = tmaxGroup.selectAll("circle")
        .data(nodes);
    enter = tmax_circle.enter()
        .append("circle")
        .attr("r", 15)
        .attr("fill", "orange")
        // .attr("fill-opacity", 0.5)
        // .attr("stroke", "orange")
        .attr("stroke-width", 2)
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
        .attr("opacity", 0.7)
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

    updateLabels();
}

function updateLabels() {
    const weldCoordLabs = weldCoordLabsGoup.selectAll("text")
        .data(nodes);
    enter = weldCoordLabs.enter()
        .append("text")
        .attr("font-size", "8px")
        .attr("text-anchor", "middle")
        .style("pointer-events", "none")
        .style("display", "none");
    enter.merge(weldCoordLabs)
        .attr("x", (d, i) => d.x+25)
        .attr("y", (d, i) => d.y-10)
        .text( d => {
            const dx = coordToDist(d.x,"x");
            const dy = coordToDist(d.y, "y");
            return `(${dx.toFixed(unitPrecision)}, ${dy.toFixed(unitPrecision)})`;
        })
        .style("display", d => showWeldProps || d.show ? "block" : "none");
    weldCoordLabs.exit().remove();

    const loadCoordLabs = loadCoordLabsGoup.selectAll("text")
        .data(loadProps)
    enter = loadCoordLabs.enter()
        .append("text")
        .attr("font-size", "8px")
        .attr("text-anchor", "left")
        .style("pointer-events", "none")
    enter.merge(loadCoordLabs)
        .attr("x", d => d.x+5)
        .attr("y", d => d.y-5)
        .text( d => {
            const dx = coordToDist(d.x, "x");
            const dy = coordToDist(d.y, "y");
            return `(${dx.toFixed(unitPrecision)}, ${dy.toFixed(unitPrecision)})`;
        })
        .style("display", d => showLoadProps || loadProps.find(j => j.id === d.id).show ? "block" : "none");
    loadCoordLabs.exit().remove();

    const loadAngleLabs = loadAngleLabsGroup.selectAll("text")
        .data(loadMids)
    enter = loadAngleLabs.enter()
        .append("text")
        .attr("font-size", "8px")
        .attr("text-anchor", "left")
        .style("pointer-events", "none")
        // .style("display", "none");
    enter.merge(loadAngleLabs)
        .attr("x", d => d.x+5)
        .attr("y", d => d.y+10)
        .text( d => `${d.th.toFixed(0)}°`)
        .style("display", d => showLoadProps || loadProps.find(j => j.id === d.id).show ? "block" : "none");
    loadAngleLabs.exit().remove();

    const loadMagLabs = loadMagLabsGroup.selectAll("text")
        .data(loadArrows)
    enter = loadMagLabs.enter()
        .append("text")
        .attr("font-size", "8px")
        .attr("text-anchor", "left")
        .style("pointer-events", "none")
        // .style("display", "none");
    enter.merge(loadMagLabs)
        .attr("x", d => d.x-25)
        .attr("y", d => d.y-10)
        .text( d => `${(d.mag*forceConvert).toFixed(0)} ${forceSymbol}`)
        .style("display", d => showLoadProps || loadProps.find(j => j.id === d.id).show ? "block" : "none");
    loadMagLabs.exit().remove();

    // const weldPropLabs = WeldPropLabsGroup.selectAll("text")
    //     .data(weldCoords)
    // enter = weldPropLabs.enter()
    //     .append("text")
    //     .attr("font-size", "8px")
    //     .attr("text-anchor", "left")
    //     .style("pointer-events", "none")
    //     // .style("display", "none");
    // enter.merge(weldPropLabs)
    //     .attr("x", d => {
    //         const dx = (d.points[1].x + d.points[0].x)/2
    //         return dx+10;
    //     })
    //     .attr("y", d => {
    //         const dy = (d.points[1].y + d.points[0].y)/2
    //         return dy-10;
    //     })
    //     .text( d => {
    //         const wLen = d.len;
    //         const wThk = d.thk;
    //         let figs = 0;
    //         if (units === "inches") figs = 3;
    //         else figs = 1;
    //         return `L: ${wLen.toFixed(unitPrecision)}${unitSymbol}, thk: ${wThk.toFixed(figs)}${unitSymbol}`;
    //     })
    //     .style("display", d => showWeldProps || d.show ? "block" : "none");
    // weldPropLabs.exit().remove();
        
}

function updateWeldProps() {
    const wSelect = weldCoords.find(j => j.id === selectedWeld)

    dragWCoords
        .text(
            `(${coordToDist(wSelect.points[0].x,"x").toFixed(unitPrecision)}, 
            ${coordToDist(wSelect.points[0].y,"y").toFixed(unitPrecision)})  
            (${coordToDist(wSelect.points[1].x,"x").toFixed(unitPrecision)},
            ${coordToDist(wSelect.points[1].y,"y").toFixed(unitPrecision)})`
        )
    dragWProps
        .text(`${wSelect.id}: ${wSelect.len.toFixed(unitPrecision)}${unitSymbol} L x 
            ${(wSelect.thk*unitConvert).toFixed(3)}${unitSymbol} thk`)

    centroidProps
        .text(`Centroid: (${coordToDist(centroidTot[0].x, "x").toFixed(unitPrecision)}, 
        ${coordToDist(centroidTot[0].y, "y").toFixed(unitPrecision)})`)
    RxVProps
        .text(`Vᵣ: ${(rxV.mag).toFixed(1)}${forceSymbol} @ ${rxV.th.toFixed(0)}°`)
    RxMProps
        .text(`Mᵣ: ${(units === "metric" ? rxM/1000 : rxM/12).toFixed(1)} ${momentSymbol}`)
    tMaxProps
        .text(`τₘₐₓ: ${(max_t).toFixed(units === "metric" ? 2 : 1)} ${stressSymbol}`)
        .style("display", showTMax ? "block" : "none")

    const weldLenInput = document.getElementById("weldLen");
    weldLenInput.value = (wSelect.len).toFixed(1);
    const weldSizeInput = document.getElementById("weldSize");
    weldSizeInput.value = (wSelect.thk*unitConvert).toFixed(3)

    const weldSXInput = document.getElementById("weldStartX");
    weldSXInput.value = coordToDist(wSelect.points[0].x,"x").toFixed(1);
    const weldSYInput = document.getElementById("weldStartY");
    weldSYInput.value = coordToDist(wSelect.points[0].y,"y").toFixed(1);

    const weldEXInput = document.getElementById("weldEndX");
    weldEXInput.value = coordToDist(wSelect.points[1].x,"x").toFixed(1);
    const weldEYInput = document.getElementById("weldEndY");
    weldEYInput.value = coordToDist(wSelect.points[1].y,"y").toFixed(1);

    const weldIDLab = document.getElementById("weldLab");
    const weldNo = wSelect.id.slice(4,5);
    weldIDLab.textContent = `Weld ${weldNo}`;
}

function updateLoadProps() {
    const lSelect = loadProps.find(j => j.id === selectedLoad)

    dragLCoords
        .text(`(${coordToDist(lSelect.x,"x").toFixed(unitPrecision)}, 
            ${coordToDist(lSelect.y,"y").toFixed(unitPrecision)})`)
    dragLProps
        .text(`${lSelect.id}: ${(lSelect.mag*forceConvert).toFixed(1)}${forceSymbol}, 
            @${lSelect.th.toFixed(1)}°`)

    centroidProps
        .text(`Centroid: (${coordToDist(centroidTot[0].x, "x").toFixed(unitPrecision)}, 
        ${coordToDist(centroidTot[0].y, "y").toFixed(unitPrecision)})`)
        .style("display", showRx ? "block" : "none")
    RxVProps
        .text(`Vᵣ: ${(rxV.mag).toFixed(1)}${forceSymbol} @ ${rxV.th.toFixed(0)}°`)
        .style("display", showRx ? "block" : "none")
    RxMProps
        .text(`Mᵣ: ${(units === "metric" ? rxM/1000 : rxM/12).toFixed(1)} ${momentSymbol}`)
        .style("display", showRx ? "block" : "none")
    tMaxProps
        .text(`τₘₐₓ: ${(max_t).toFixed(units === "metric" ? 2 : 1)} ${stressSymbol}`)
        .style("display", showTMax ? "block" : "none")

    const loadMagInput = document.getElementById("loadMag");
    loadMagInput.value = lSelect.mag.toFixed(1);
    const loadAngInput = document.getElementById("loadAng");
    loadAngInput.value = lSelect.th.toFixed(1)

    const loadSXInput = document.getElementById("loadStartX");
    loadSXInput.value = coordToDist(lSelect.x,"x").toFixed(1);
    const loadSYInput = document.getElementById("loadStartY");
    loadSYInput.value = coordToDist(lSelect.y,"y").toFixed(1);

    const loadIDLab = document.getElementById("loadLab");
    const weldNo = lSelect.id.slice(4,5);
    loadIDLab.textContent = `Load ${weldNo}`;

}

function snapDrag(id, drx, dry, opx=0, opy=0) { //, orx=0, ory=0) {
    let dxf = drx;
    let dyf = dry;

    // Snap to Weld mid-points
    for (i = 0; i < weldCoords.length; i++) {
        const midx = (weldCoords[i].points[1].x + weldCoords[i].points[0].x)/2;
        const midy = (weldCoords[i].points[1].y + weldCoords[i].points[0].y)/2;
        if (id !== weldCoords[i].id && Math.abs(drx - midx) < snapDist && Math.abs(dry - midy) < snapDist) {
            dxf = midx;
            dyf = midy;
        }
    }
    
    // Snap to Vertical
    if (Math.abs(drx - opx) < snapDist) {
        dxf = opx;
    } 
    // Snap to Horizontal
    else if (Math.abs(dry - opy) < snapDist) {
        dyf = opy;
    } 
    // Hold original angle (?)
    // else if (sdist < snapDist) {
    //     const edist = Math.sqrt((dry-opy)*(dry-opy)+(drx-opx)*(drx-opx))
    //     const odist = Math.sqrt((ory-opy)*(ory-opy)+(orx-opx)*(orx-opx))
    //     const angx = edist/odist*(orx-opx)+opx
    //     const angy = edist/odist*(ory-opy)+opy
    //     const sdist = Math.sqrt((dry-angy)*(dry-angy)+(drx-angx)*(drx-angx))
    //     dxf = angx;
    //     dfy = angy;
    // }

    if (id.includes("weld")) { // When dragging welds...
        // Snap to other weld nodes
        for (i = 0; i < nodes.length; i++) {
            if (id.slice(0,5) !== nodes[i].id.slice(0,5) && Math.abs(drx - nodes[i].x) < snapDist && Math.abs(dry - nodes[i].y) < snapDist) {
                dxf = nodes[i].x;
                dyf = nodes[i].y;
            }
        }
        // Snap to loads
        for (i = 0; i < loadProps.length; i++) {
            if (Math.abs(drx - loadProps[i].x) < snapDist && Math.abs(dry - loadProps[i].y) < snapDist) {
                dxf = loadProps[i].x;
                dyf = loadProps[i].y;
            }
        }
    } else { // When dragging loads
        // Snap to weld nodes
        for (i = 0; i < nodes.length; i++) {
            if (Math.abs(drx - nodes[i].x) < snapDist && Math.abs(dry - nodes[i].y) < snapDist) {
                dxf = nodes[i].x;
                dyf = nodes[i].y;
            }
        }
        // Snap to other loads
        for (i = 0; i < loadProps.length; i++) {
            if (id.slice(0,5) !== loadProps[i].id && Math.abs(drx - loadProps[i].x) < snapDist && Math.abs(dry - loadProps[i].y) < snapDist) {
                dxf = loadProps[i].x;
                dyf = loadProps[i].y;
            }
        }
        // Snap to centroid
        if (Math.abs(drx - centroidTot[0].x) < snapDist && Math.abs(dry - centroidTot[0].y) < snapDist) {
            dxf = centroidTot[0].x;
            dyf = centroidTot[0].y;
        }
    }
    
    return [dxf, dyf]
}

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
    // updateMinMaxView();
    updateFringe();
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

    inspectFollow(inspectDist)
    inspectDrag(inspectX, inspectY)

}

function updateView() {
    updateStuff();
    updateData();
    updateDrags();
    updateSVGs();

    // document.getElementById("debugOutputs").innerHTML = `${getMinMaxView()}`
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

function updateWeldLength(newLen) {

    const lenNew = Math.max(0.1,newLen)
    const wSelect = weldCoords.find(j => j.id === selectedWeld)

    // const wNodes = nodes.find(n => n.id.includes(selectedWeld));
    const oNode = nodes.find(n => n.id === selectedWProp);
    const mNode = nodes.find(n => n.id.includes(selectedWeld) && n.id !== selectedWProp);

    if (selectedWProp.length !== 5) {
        const x0 = oNode.x;
        const y0 = oNode.y;
        const x1 = mNode.x;
        const y1 = mNode.y;

        const oldDx = x1-x0;
        const oldDy = y1-y0;

        const oldLen = Math.sqrt((oldDy)*(oldDy)+(oldDx)*(oldDx));

        const newDx = oldDx/oldLen * distToCoord(lenNew, "L");
        const newDy = oldDy/oldLen * distToCoord(lenNew, "L");

        const newX1 = x0 + newDx;
        const newY1 = y0 + newDy;

        mNode.x = newX1;
        mNode.y = newY1;
    } 
    else {
        const x0 = (wSelect.points[0].x + wSelect.points[1].x)/2;
        const y0 = (wSelect.points[0].y + wSelect.points[1].y)/2;
        const x1 = wSelect.points[0].x;
        const y1 = wSelect.points[0].y;
        const x2 = wSelect.points[1].x;
        const y2 = wSelect.points[1].y;

        const oldPoints = [{x: x1, y: y1},{x: x2, y: y2}]

        const mSNode = nodes.find(n => n.id.includes(`${selectedWeld}_start`));
        const mENode = nodes.find(n => n.id.includes(`${selectedWeld}_end`));

        const movePoints = [mSNode,mENode];

        for (i = 0; i < oldPoints.length; i++) {

            const oldDx = oldPoints[i].x-x0;
            const oldDy = oldPoints[i].y-y0;

            const oldLen = Math.sqrt((oldDy)*(oldDy)+(oldDx)*(oldDx));

            const newDx = oldDx/oldLen * distToCoord(lenNew/2, "L");
            const newDy = oldDy/oldLen * distToCoord(lenNew/2, "L");

            const newX1 = x0 + newDx;
            const newY1 = y0 + newDy;

            movePoints[i].x = newX1;
            movePoints[i].y = newY1;
        }
    }

    updateWelds();
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
        // const Ai = weldCoords[w].A;
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

function calcShear(x,y){
    const dirMag = Math.abs(rxV.mag) / areaTot;
    let dirTh = rxV.th;
    if (dirTh < 0) dirTh = dirTh + 360;

    let mArm = Math.sqrt((x-centroidTot[0].x)*(x-centroidTot[0].x)+(y-centroidTot[0].y)*(y-centroidTot[0].y))
    mArm = coordToDist(mArm, "L");

    const torMag = Math.abs(rxM * mArm / J_tot);

    let nQuad = 0;
        if (x < centroidTot[0].x) {
            if (y <= centroidTot[0].y) nQuad = 0
            else nQuad = 0
        }
        else nQuad = 180

    let torTh = radToDeg(Math.atan((centroidTot[0].y-y)/(x-centroidTot[0].x))) + 90 + nQuad
    if (rxM > 0) torTh = torTh + 180
    if (torTh < 0) torTh = torTh + 360

    const dirX = dirMag * Math.cos(degToRad(dirTh));
    const dirY = dirMag * Math.sin(degToRad(dirTh));
    const torX = torMag * Math.cos(degToRad(torTh));
    const torY = torMag * Math.sin(degToRad(torTh));

    const TotX = dirX+torX;
    const TotY = dirY+torY;
    const TotMag = Math.sqrt(TotY*TotY+TotX*TotX);

    return TotMag
}

function updateTotalShear() {
    max_t = 0;
    for (i = 0; i < nodes.length; i++) {
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
    // fitViewButton
    //     .attr("fill-opacity", 0)
    //     .attr("stroke-opacity", 0.25)
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
    if (weldCount >= maxWelds || geomLock) return;

    if (weldCount >= maxWelds-1 || geomLock) {
        addWIcon.attr("fill", "white")
    }
    if (weldCount < maxWelds-1 && !geomLock) {
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

    selectWEditProp();
    updateView();
    updateWeldProps();
    updateLoadProps();
}

function addLoad() {
    if (loadCount >= maxLoads || geomLock) return;

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

    // if (backUpLoads.length > 0) {
    //     newX = backUpLoads[0].x;
    //     newY = backUpLoads[0].y;
    //     newTh = backUpLoads[0].th;
    //     newMag = backUpLoads[0].mag;
    // } else {
        newX = Math.floor(Math.random()*(450-50)+50);
        newY = Math.floor(Math.random()*(450-50)+50);
        newTh = Math.floor(Math.random()*(359-0)+0);
        newMag = Math.floor(Math.random()*(250-50)+50);
    // }

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

    selectLEditProp();
    updateView();
    updateWeldProps();
    updateLoadProps();
}

function removeWeld(id) {
    if (weldCount === 1 || geomLock) return;

    if (weldCount <= maxWelds && !geomLock) {
        addWIcon.attr("fill", "green");
    }

    if (weldCount <= 2 || geomLock) {
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

    selectedWeld = `weld${weldCount}`

    updateView();
    updateWeldProps();
    updateLoadProps();

    selectWEditProp();
}

function removeLoad(id) { // test function to remove one weld
    if (loadCount === 1 || geomLock) return;

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

    selectLEditProp();
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
        .text(`Weld ${wSelect.id.slice(4,5)}: ${wSelect.len.toFixed(unitPrecision)}${unitSymbol} L x 
            ${(wSelect.thk*unitConvert).toFixed(3)}${unitSymbol}`)

    centroidProps
        .text(`Centroid: (${coordToDist(centroidTot[0].x, "x").toFixed(unitPrecision)}, 
        ${coordToDist(centroidTot[0].y, "y").toFixed(unitPrecision)})`)
    RxVProps
        .text(`Vᵣ: ${(rxV.mag).toFixed(1)}${forceSymbol} @ ${rxV.th.toFixed(0)}°`)
    RxMProps
        .text(`Mᵣ: ${(units === "metric" ? rxM/1000 : rxM/12).toFixed(1)} ${momentSymbol}`)
    tMaxProps
        .text(`τ`)
        .attr("font-family", "ariel")
        // .style("display", showTMax ? "block" : "none")
        .append("tspan")
        .text("max")
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
    inspPropsText
        // .text(`τ`)
        .text(`(${coordToDist(inspectX,"x").toFixed(1)}, ${coordToDist(inspectY,"y").toFixed(1)})`)
        .style("display", showInspect ? "block" : "none")
    //     .append("tspan")
    //     .text("insp")
    //     .attr("font-family", "sans-serif") 
    //     .attr("font-size", "5pt")
    //     .attr("dy", "1.5em")
    //     .attr("text-anchor", "middle")
    //     .attr("alignment-baseline", "text-before-edge")
    //     .append("tspan")
    //     .text(`: ${inspectStress.toFixed(units === "metric" ? 2 : 1)} ${stressSymbol}`)
    //     .attr("font-size", "8pt")
    //     .attr("dy", "-0.6em")
    //     .attr("text-anchor", "middle")
    //     .attr("alignment-baseline", "text-before-edge")
    //     .append("tspan")
    //     .text(`(${coordToDist(inspectX,"x").toFixed(1)}, ${coordToDist(inspectY,"y").toFixed(1)})`)
    //     .attr("x", 250)
    //     .attr("dy", "2.5em")
    stressButtons
        .append("title")
        .text(d => d.lab)
    lockButton
        .append("title")
        .text("Lock Geometry")
    settingsButton
        .append("title")
        .text("User Preferences")
    unitsButton
        .append("title")
        .text("Units")
    fitViewButton
        .append("title")
        .text("Fit View")

    
}

function updateLoadProps() {
    const lSelect = loadProps.find(j => j.id === selectedLoad)

    dragLCoords
        .text(`(${coordToDist(lSelect.x,"x").toFixed(unitPrecision)}, 
            ${coordToDist(lSelect.y,"y").toFixed(unitPrecision)})`)
    dragLProps
        .text(`Load ${lSelect.id.slice(4,5) }: ${(lSelect.mag*forceConvert).toFixed(1)}${forceSymbol}, 
            @${lSelect.th.toFixed(1)}°`)

    centroidProps
        .text(`Centroid: (${coordToDist(centroidTot[0].x, "x").toFixed(unitPrecision)}, 
        ${coordToDist(centroidTot[0].y, "y").toFixed(unitPrecision)})`)
        // .style("display", showRx ? "block" : "none")
    RxVProps
        .text(`Vᵣ: ${(rxV.mag).toFixed(1)}${forceSymbol} @ ${rxV.th.toFixed(0)}°`)
        // .style("display", showRx ? "block" : "none")
    RxMProps
        .text(`Mᵣ: ${(units === "metric" ? rxM/1000 : rxM/12).toFixed(1)} ${momentSymbol}`)
        // .style("display", showRx ? "block" : "none")
    tMaxProps
        .text(`τ`)
        // .style("display", showTMax ? "block" : "none")
        .append("tspan")
        .text("max")
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
    inspPropsText
        // .text(`τ`)
        .text(`(${coordToDist(inspectX,"x").toFixed(1)}, ${coordToDist(inspectY,"y").toFixed(1)})`)
        .style("display", showInspect ? "block" : "none")
    //     .append("tspan")
    //     .text("insp")
    //     .attr("font-family", "sans-serif") 
    //     .attr("font-size", "5pt")
    //     .attr("dy", "1.5em")
    //     .attr("text-anchor", "middle")
    //     .attr("alignment-baseline", "text-before-edge")
    //     .append("tspan")
    //     .text(`: ${inspectStress.toFixed(units === "metric" ? 2 : 1)} ${stressSymbol}`)
    //     .attr("font-size", "8pt")
    //     .attr("dy", "-0.6em")
    //     .attr("text-anchor", "middle")
    //     .attr("alignment-baseline", "text-before-edge")
    //     .append("tspan")
    //     .text(`(${coordToDist(inspectX,"x").toFixed(1)}, ${coordToDist(inspectY,"y").toFixed(1)})`)
    //     .attr("x", 250)
    //     .attr("dy", "2.5em")
    stressButtons
        .append("title")
        .text(d => d.lab)
    stressMenuButton
        .append("title")
        .text("Shear Stresses")

}

function snapDrag(id, drx, dry, opx=0, opy=0) {
    let dxf = drx;
    let dyf = dry;

    const xDelta = xtemp - opx
    const yDelta = ytemp - opy
    const fullDist = Math.sqrt((xDelta)*(xDelta)+(yDelta)*(yDelta))

    const newDist = Math.sqrt((drx-opx)*(drx-opx)+(dry-opy)*(dry-opy))

    const xNew = xDelta/fullDist * newDist + opx
    const yNew = yDelta/fullDist * newDist + opy


    // // Snap to axes / origin
    // if (Math.abs(drx - origin[0]) < snapDist) {
    //     dxf = origin[0];
    // } 
    // if (Math.abs(dry - origin[1]) < snapDist) {
    //     dyf = origin[1];
    // } 

    // Snap to Vertical
    if (Math.abs(drx - opx) < snapDist) {
        dxf = opx;
    } 
    // Snap to Horizontal
    else if (Math.abs(dry - opy) < snapDist) {
        dyf = opy;
    } 

    // Snap to Weld mid-points
    for (i = 0; i < weldCoords.length; i++) {
        const midx = (weldCoords[i].points[1].x + weldCoords[i].points[0].x)/2;
        const midy = (weldCoords[i].points[1].y + weldCoords[i].points[0].y)/2;
        if (id !== weldCoords[i].id && Math.abs(drx - midx) < snapDist && Math.abs(dry - midy) < snapDist) {
            dxf = midx;
            dyf = midy;
        }
    }

    if (id.includes("weld")) { // When dragging welds...
        // Snap to other weld nodes
        // let nid = ""
        const nid = id.slice(0,5);
        if (id.length !== 5) {
            // Hold original angle
            if (Math.abs(xNew - drx) < snapDist && Math.abs(yNew - dry) < snapDist) {
                dxf = xNew
                dyf = yNew
            }
        }
        for (i = 0; i < nodes.length; i++) {
            if (nid !== nodes[i].id.slice(0,5) && Math.abs(drx - nodes[i].x) < snapDist && Math.abs(dry - nodes[i].y) < snapDist) {
                dxf = nodes[i].x;
                dyf = nodes[i].y;
            }
        }
        // Snap to Weld mid-points
        for (i = 0; i < weldCoords.length; i++) {
            const midx = (weldCoords[i].points[1].x + weldCoords[i].points[0].x)/2;
            const midy = (weldCoords[i].points[1].y + weldCoords[i].points[0].y)/2;
            if (id !== weldCoords[i].id && Math.abs(drx - midx) < snapDist && Math.abs(dry - midy) < snapDist) {
                dxf = midx;
                dyf = midy;
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

function selectWEditProp() {
    editingWX = false;
    editingWY = false;
    editingWL = false;
    editingWT = false;

    if (selectedWProp.includes("weld")) {
        editWObject = weldCoords.find(j => j.id === selectedWeld);
        if (selectedWProp.includes("start")) {
            editWLabelX = `X₁ (${units === "metric" ? "mm" : "in"})`;
            editWLabelY = `Y₁ (${units === "metric" ? "mm" : "in"})`;
            editWValueX = coordToDist(editWObject.points[0].x, "x")
            editWValueY = coordToDist(editWObject.points[0].y, "y")
        } else if (selectedWProp.includes("end")) {
            editWLabelX = `X₂ (${units === "metric" ? "mm" : "in"})`;
            editWLabelY = `Y₂ (${units === "metric" ? "mm" : "in"})`;
            editWValueX = coordToDist(editWObject.points[1].x, "x")
            editWValueY = coordToDist(editWObject.points[1].y, "y")
        } 
        else {
            editWLabelX = `Xₘ (${units === "metric" ? "mm" : "in"})`;
            editWLabelY = `Yₘ (${units === "metric" ? "mm" : "in"})`;
            editWValueX = coordToDist((editWObject.points[0].x + editWObject.points[1].x)/2, "x")
            editWValueY = coordToDist((editWObject.points[0].y + editWObject.points[1].y)/2, "y")
        }
        
        editWLabelT = `W (${units === "metric" ? "mm" : "in"})`;
        editWLabelL = `L (${units === "metric" ? "mm" : "in"})`;

        editWValueL = editWObject.len;
        editWValueT = editWObject.thk * unitConvert;

        inputWLabelX.text(`${editWLabelX}`)
        inputWLabelY.text(`${editWLabelY}`)
        inputWLabelL.text(`${editWLabelL}`)
        inputWLabelT.text(`${editWLabelT}`)

        inputWFieldX.text(editWValueX.toFixed(2));
        inputWFieldY.text(editWValueY.toFixed(2));
        inputWFieldL.text(editWValueL.toFixed(2));
        inputWFieldT.text(editWValueT);
    }
}

function selectLEditProp() {
    editingLX = false;
    editingLY = false;
    editingLF = false;
    editingLA = false;

    if (selectedLProp.includes("load")) {
        editLObject = loadProps.find(j => j.id === selectedLoad);
        editLLabelX = `X (${units === "metric" ? "mm" : "in"})`;
        editLLabelY = `Y (${units === "metric" ? "mm" : "in"})`;
        editLLabelF = `F (${units === "metric" ? "N" : "lbf"})`;

        editLValueX = coordToDist(editLObject.x, "x")
        editLValueY = coordToDist(editLObject.y, "y")
        editLValueF = editLObject.mag * forceConvert;
        editLValueA = editLObject.th;

        inputLLabelX.text(`${editLLabelX}`)
        inputLLabelY.text(`${editLLabelY}`)
        inputLLabelF.text(`${editLLabelF}`)
        inputLLabelA.text(`${editLLabelA}`)

        inputLFieldX.text(editLValueX.toFixed(2));
        inputLFieldY.text(editLValueY.toFixed(2));
        inputLFieldF.text(editLValueF.toFixed(2));
        inputLFieldA.text(editLValueA.toFixed(2));
    }
}

function showHideSettings() {
    showSettings = !showSettings;
    settingsButton
        .attr("fill-opacity", showSettings ? 0.125 : 0)
        .attr("stroke-opacity", showSettings ? 0.75 : 0.25)
    settingsMenu.style("display", showSettings ? "block" : "none")

    slideLabBox
        .style("display", showSettings ? "block" : "none")
        .append("title")
        .text(d => d.lab)
    slideIcon.style("display", showSettings ? "block" : "none")
    slideBar.style("display", showSettings ? "block" : "none")
    slidePosBar.style("display", showSettings ? "block" : "none")
    sliderDot.style("display", showSettings ? "block" : "none")
    // sliderVal.style("display", showSettings ? "block" : "none")
    snapIcon.style("display", showSettings ? "block" : "none")
    loadScaleIcon.style("display", showSettings ? "block" : "none")
    stressScaleIcon.style("display", showSettings ? "block" : "none")
    axesIcon.style("display", showSettings ? "block" : "none")

}

function updateSliderVals(id, val) {
    if (id === "axes") {
        axisLength = val * 5;
        coordAxes.style("display", axisLength <= 1 ? "none" : "block")
        xAxisLab.style("display", axisLength <= 1 ? "none" : "block")
        yAxisLab.style("display", axisLength <= 1 ? "none" : "block")
        originDot.style("display", axisLength <= 1 ? "none" : "block")
    }
    else if (id === "snap") {
        snapDist = val/2;
    }
    else if (id === "loads") {
        if (val < 0.1) val = 0.1
        loadScale = val/20

    }
    else if (id === "stresses") {
        if (val < 0.1) val = 0.1
        stressScale = val/10
    }
    updateView();
}

function updateMinMaxView() {
    xMin = nodes[0].x;
    xMax = nodes[0].x;
    yMin = nodes[0].y;
    yMax = nodes[0].y;

    for (i = 0; i < nodes.length; i++) {
        xMin = Math.min(xMin, nodes[i].x);
        xMax = Math.max(xMax, nodes[i].x);
        yMin = Math.min(yMin, nodes[i].y);
        yMax = Math.max(yMax, nodes[i].y);
    }

    for (i = 0; i < loadPoints.length; i++) {
        xMin = Math.min(xMin, loadPoints[i].points[0].x, loadPoints[i].points[1].x);
        xMax = Math.max(xMax, loadPoints[i].points[0].x, loadPoints[i].points[1].x);
        yMin = Math.min(yMin, loadPoints[i].points[0].y, loadPoints[i].points[1].y);
        yMax = Math.max(yMax, loadPoints[i].points[0].y, loadPoints[i].points[1].y);
    }
}

function fitView() {

    updateMinMaxView();

    const centerX = (xMax + xMin)/2;
    const centerY = (yMax + yMin)/2;

    // document.getElementById("debugOutputs").innerHTML = ""
    //     + `${xMin.toFixed(1)}, ${xMax.toFixed(1)}, ${centerX.toFixed(1)}` + `\n<br>`
    //     + `${(centerX-windowWidth/2).toFixed(1)}`

    const centerScale = Math.min(windowWidth/(xMax-xMin)*0.75,windowHeight/(yMax-yMin)*0.56)

    svg.transition().duration(500).call(zoom.transform, d3.zoomIdentity
        .translate(windowWidth/2, windowHeight/2)
        .scale(centerScale)
        .translate(-centerX, -centerY+10)//*0.96) 
    );

    updateView()

    // fitViewButton
    //     .attr("fill-opacity", 0.125)
    //     .attr("stroke-opacity", 0.75)
}


function updateFringe() {

    updateTotalShear();

    const dotPitch = 1

    fringeData.length = 0;

    min_t = calcShear(weldCoords[0].points[0].x, weldCoords[0].points[0].y)

    for (w = 0; w < weldCoords.length; w++) {
        const dotCount = Math.ceil(distToCoord(weldCoords[w].len, "L")/dotPitch);
        let dotStress = calcShear(weldCoords[w].points[0].x, weldCoords[w].points[0].y)

        if (dotStress < min_t) min_t = dotStress;

        fringeData.push({x: weldCoords[w].points[0].x, y: weldCoords[w].points[0].y, stress: dotStress, dot: 5/0.25*weldCoords[w].thk})

        for (i = 0; i < dotCount; i++) {
            const dotX = (weldCoords[w].points[1].x-weldCoords[w].points[0].x)/(dotCount+1)*(i+1) + weldCoords[w].points[0].x
            const dotY = (weldCoords[w].points[1].y-weldCoords[w].points[0].y)/(dotCount+1)*(i+1) + weldCoords[w].points[0].y

            dotStress = calcShear(dotX, dotY)

            const addDot = {x: dotX, y: dotY, stress: dotStress, dot: 5/0.25*weldCoords[w].thk}
            fringeData.push(addDot)

            if (dotStress < min_t) min_t = dotStress;
        }
        dotStress = calcShear(weldCoords[w].points[1].x, weldCoords[w].points[1].y)
        fringeData.push({x: weldCoords[w].points[1].x, y: weldCoords[w].points[1].y, stress: dotStress, dot: 5/0.25*weldCoords[w].thk})
        
        if (dotStress < min_t) min_t = dotStress;
    }


    fringeKeyMin
        .text(`${min_t.toFixed(units === "metric" ? 2 : 1)}`) // ${stressSymbol}

    fringeKeyMax
        .text(`${max_t.toFixed(units === "metric" ? 2 : 1)}`) // ${stressSymbol}

    if (!fringeMaxFixed) {
        const newFKeyY = 310-(fringeScaleMax - min_t)/(max_t-min_t)*150
        if (fringeScaleMax >= max_t) {
            // fringeScaleMax = max_t
            fringeKeyY = 160
        } 
        else if (fringeScaleMax <= min_t) {
            fringeScaleMax = min_t
            fringeKeyY = 310
        } 
        else fringeKeyY = newFKeyY
        flagValMax
            .attr("y", fringeKeyY)
            // .text(fringeScaleMax >= max_t ? "" : fringeScaleMax <= min_t ? "" : `${fringeScaleMax.toFixed(units === "metric" ? 2 : 1)}`)
            .attr("fill", fringeScaleMax >= max_t ? "lightgray" : fringeScaleMax <= min_t ? "lightgray" : "black")
        fringeKeyLine
            .attr("y1", fringeKeyY)
        fringeHigh
            .attr("y2", fringeKeyY)
        flagMax
            .attr("d", drawMinMaxFlag(fringeKeyY))
        // if (fringeScaleMax >= max_t) {
        //         flagMax
        //             .attr("stroke", "darkred")
        //             .attr("fill", "white")
        //     }
        //     else {
        //         flagMax
        //             .attr("stroke", "none")
        //             .attr("fill", "darkred")
        //     }
    } else fringeScaleMax = max_t

    if (!fringeMinFixed) {
        const newFKeyY = 310-(fringeScaleMin - min_t)/(max_t-min_t)*150
        if (fringeScaleMin <= min_t) {
            // fringeScaleMin = min_t
            fringeKeyY2 = 310
        } 
        else if (fringeScaleMin >= max_t) {
            fringeScaleMin = max_t
            fringeKeyY2 = 160
        } 
        else fringeKeyY2 = newFKeyY
        flagValMin
            .attr("y", fringeKeyY2)
            // .text(fringeScaleMin <= min_t ? "" : fringeScaleMin >= max_t ? "" : `${fringeScaleMin.toFixed(units === "metric" ? 2 : 1)}`)
            .attr("fill", fringeScaleMin <= min_t ? "lightgray" : fringeScaleMin >= max_t ? "lightgray" : "black")
        fringeKeyLine
            .attr("y2", fringeKeyY2)
        fringeLow
            .attr("y1", fringeKeyY2)
        flagMin
            .attr("d", drawMinMaxFlag(fringeKeyY2))
    } else fringeScaleMin = min_t

    fringeKeyUnits
        .text(`${stressSymbol}`)

    // updateData()
}
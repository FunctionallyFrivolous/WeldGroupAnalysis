
function updateView() {
    updateCentroid();
    updateWelds();
    // updateArea();
    // updateAngles();
    // updateArrows();
    updateLoads();
    updateMids();
    updateRx();
    updateMomentArc();
    updateDirectShear();
    updateTorsionShear();
    updateTotalShear();

    weldLines
        .attr("points", d => d.points.map(j => `${j.x},${j.y}`).join(" "))
        .attr("stroke-width", d => d.thk*weldThkScale)

    weldDrag
        .attr("cx", d => d.x)
        .attr("cy", d => d.y);

    cMark
        .attr("cx", d => d.x)
        .attr("cy", d => d.y);

    tmax_circle
        .attr("cx", d => d.x)
        .attr("cy", d => d.y)
        .style("display", showStress ? d => d.display : "none");

    lVectors
        .attr("points", d => d.points.map(l => `${l.x},${l.y}`).join(" "))

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

    loadDrag
        .attr("cx", d => d.x)
        .attr("cy", d => d.y);
    angleDrag
        .attr("cx", d => d.x)
        .attr("cy", d => d.y);
    midMarks
        .attr("cx", d => d.x)
        .attr("cy", d => d.y);
    magDrag
        .attr("cx", d => d.x)
        .attr("cy", d => d.y);

    dShear
        .attr("points", d => d.points.map(t => `${t.x},${t.y}`).join(" "))
        .style("display", showTComps ? "block" : "none");
    tShear
        .attr("points", d => d.points.map(t => `${t.x},${t.y}`).join(" "))
        .style("display", showTComps ? "block" : "none");
    fShear
        .attr("points", d => d.points.map(t => `${t.x},${t.y}`).join(" "))
        .style("display", showStress ? "block" : "none")

    // let dbugTxt = ""
    //     // + "t_max: " + `${max_t.toFixed(1)}` + "\n<br>"
    //     // + "t0: " + `${nodes[0].t.toFixed(1)}` + ", " + `${nodes[0].display}` + "\n<br>"
    //     // + "t1: " + `${nodes[1].t.toFixed(1)}`+ ", " + `${nodes[1].display}` + "\n<br>"
    //     // + "t2: " + `${nodes[2].t.toFixed(1)}`+ ", " + `${nodes[2].display}` + "\n<br>"
    //     // + "t3: " + `${nodes[3].t.toFixed(1)}`+ ", " + `${nodes[3].display}` + "\n<br>"
    //     + "Lx0: " + `${(loadPoints[0].points[0].x*distConvert*unitConvert).toFixed(2)}` + "\n<br>"
    //     + "Wx0: " + `${weldCoords[0].points[0].x*distConvert*unitConvert}` + "\n<br>"
    //     + "rxV: " + `${rxV.mag.toFixed(1)}` + "\n<br>"
    //     + "rxM: " + `${rxM.toFixed(1)}` + "\n<br>"
    //     + "welds: " + `${weldCount}` + "\n<br>"
    //     + "units: " + `${units}` + "\n<br>"


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
        // weldCoords[w].thk = thk;
        weldCoords[w].len = length;
        weldCoords[w].A = weldCoords[w].len * weldCoords[w].thk * 0.707;
        weldCoords[w].C = [cx,cy];

        // Calc 2nd Moments of Area
        const Ix = weldCoords[w].thk*0.707 * weldCoords[w].len*weldCoords[w].len*weldCoords[w].len/12; // J = t*d^3/12
        const Iy = weldCoords[w].thk*0.707*weldCoords[w].thk*0.707*weldCoords[w].thk* 0.707 * weldCoords[w].len/12; // J = t^3*d/12
        const Ji = Ix + Iy;

        weldCoords[w].Ix = Ix;
        weldCoords[w].Iy = Iy;
        weldCoords[w].J = Ji;

        const ri = Math.sqrt((cx-centroidTot[0].x)*(cx-centroidTot[0].x)+(cy-centroidTot[0].y)*(cy-centroidTot[0].y))

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
        loadArrows[i].y = yt
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
    }
}

function updateLoads() {
    updateArrows();
    const loadQty = loadProps.length;
    for (let i = 0; i < loadQty; i++) {
        loadPoints[i].points = [{x: loadProps[i].x, y: loadProps[i].y}, {x: loadArrows[i].x, y: loadArrows[i].y}];
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
        rxV_x = rxV_x + Math.cos(load_th) * loadProps[i].mag;
    }
    rxV_y = 0;
    for (let i = 0; i < loadProps.length; i++) {
        let load_th = loadProps[i].th;
        if (load_th < 0) {
            load_th = 360 + load_th;
        }
        load_th = degToRad(load_th)
        // rxV_x = rxV_x + Math.cos(degToRad(loadProps[i].th)) * loadProps[i].mag;
        rxV_y = rxV_y + Math.sin(load_th) * loadProps[i].mag;
    }
    rxV.mag = Math.sqrt((rxV_x)*(rxV_x)+(rxV_y)*(rxV_y));
    rxV.th = radToDeg(Math.atan((rxV_y)/(rxV_x)));
    if(rxV_x < 0) {
        rxV.th = rxV.th + 180
    }
    // rxV[0].points[0].x = rxV.x;
    // rxV[0].points[0].y = rxV.y;

    const xt = rxV.x - loadScale*(rxV.mag) * Math.cos(degToRad(rxV.th));
    const yt = rxV.y + loadScale*(rxV.mag) * Math.sin(degToRad(rxV.th));
    rxV[0].points = [{x: rxV.x, y: rxV.y}, {x: xt, y: yt}];

    // Reaction Moment
    rxM = 0;
    for (let i = 0; i < loadProps.length; i++) {
        const lmag = loadProps[i].mag;
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

        const mArm = Math.abs((y2-y1)*x0 - (x2-x1)*y0 + x2*y1 - y2*x1)/Math.sqrt((y2-y1)*(y2-y1)+(x2-x1)*(x2-x1));
        let rxMi = mArm * lmag;
        if (th_rxM > 180) rxMi = rxMi * -1

        rxM = rxM + rxMi;
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
    if (rxM > 0) dir = 1

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
        const mArm = Math.sqrt((xa-xC)*(xa-xC)+(ya-yC)*(ya-yC))

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
        if (nodes[i].t >= max_t*0.99) nodes[i].display = "block"
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

function test_delWeld() { // test function to remove one weld
    if (weldCount === 1) return;
    weldCoords.length = weldCoords.length-1;
    nodes.length = nodes.length-2;
    directShear.length = directShear.length-2;
    torsionShear.length = torsionShear.length-2;
    totalShear.length = totalShear.length-2;

    weldCount = weldCount-1;

    weldDrag// = lineGroup.selectAll("polyline")
        .data(nodes, d => d.id)
        .exit()
            .attr("cx", d => d.x)
            .attr("cy", d => d.y)
            .remove();
    weldLines// = lineGroup.selectAll("polyline")
        .data(weldCoords, d => d.id)
        .exit()
            .attr("points", d => d.points.map(j => `${j.x},${j.y}`).join(" "))
            .remove();
    tmax_circle
        .data(nodes, d => d.id)
        .exit()
            .attr("cx", d => d.x)
            .attr("cy", d => d.y)
            .remove();
    dShear
        .data(directShear, d => d.id)
        .exit()
            .attr("points", d => d.points.map(j => `${j.x},${j.y}`).join(" "))
            .remove();
    tShear
        .data(torsionShear, d => d.id)
        .exit()
            .attr("points", d => d.points.map(j => `${j.x},${j.y}`).join(" "))
            .remove();
    fShear
        .data(totalShear, d => d.id)
        .exit()
            .attr("points", d => d.points.map(j => `${j.x},${j.y}`).join(" "))
            .remove();
    
    // updateWelds();
    updateView();
}

function removeWeld(id) { // test function to remove one weld
    if (weldCount === 1) return;
    
    let index = weldCoords.findIndex(obj => obj.id === id);
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

    weldDrag// = lineGroup.selectAll("polyline")
        .data(nodes)
        .join (
            exit => exit
                .attr("cx", d => d.x)
                .attr("cy", d => d.y)
                .remove());
    weldLines// = lineGroup.selectAll("polyline")
        .data(weldCoords)
        .exit()
                .attr("points", d => d.points.map(j => `${j.x},${j.y}`).join(" "))
                .remove();
    tmax_circle
        .data(nodes)
        .exit()
                .attr("cx", d => d.x)
                .attr("cy", d => d.y)
                .remove();
    dShear
        .data(directShear)
        .exit()
                .attr("points", d => d.points.map(j => `${j.x},${j.y}`).join(" "))
                .remove();
    tShear
        .data(torsionShear)
        .exit()
                .attr("points", d => d.points.map(j => `${j.x},${j.y}`).join(" "))
                .remove();
    fShear
        .data(totalShear)
        .exit()
                .attr("points", d => d.points.map(j => `${j.x},${j.y}`).join(" "))
                .remove();
    
    // updateWelds();
    updateView();
}
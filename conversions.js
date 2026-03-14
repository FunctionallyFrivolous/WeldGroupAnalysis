function radToDeg (rads) {
    return rads / (Math.PI / 180);
}

function degToRad (degs) {
    return degs * (Math.PI / 180);
}

function inToMM (length) {
    return length * 25.4;
}

function mmToIn (length) {
    return length / 25.4;
}

function coordToDist(coord, axis) {
    let dist = 0;
    if (axis === "x") {
        dist = (coord-origin[0]) * distConvert * unitConvert;
    }
    else if (axis === "y") {
        dist = (origin[0]-coord) * distConvert * unitConvert;
    }
    else {
        dist = coord * distConvert * unitConvert;
    }

    if (Math.abs(dist) < 0.0001) dist = 0;
    return dist;
}
let currentZoomTransform = d3.zoomIdentity;
let showRx = true;
let showStress = true;
let showTComps = false;

let units = "inches";
let distConvert = 0.1; // svg window units to inches (10:1)
let unitConvert = 1; // conversion from current units to inches (1 if current units are inches; 25.4 if current metric)

let xMin = 0;
let xMax = 0;
let yMin = 0;
let yMax = 0;

const defaultThk = 0.25; // Default weld thickness value
const weldThkScale = 40;

let testVar = "hi"
let areaTot = 0;
let centroidTot = [{x: 200, y: 100}];
let J_tot = 0;
let rxV_x = 0;
let rxV_y = 0;
let rxV = [{x: 0, y: 0, mag: 0, th: 0, points: [{x: 0, y: 0},{x: 0, y: 0}]}];
let rxM = 0;

let max_t = 0;

let dM = "M 0,50 A 50,50 0 0,0 100,50"

let loadScale = 0.5;
let stressScale = 10;
const minLength = 25;

let weldCount = 4;
const loadCount = 1;

// A default set of nodes for two initial welds...
const defaultCoords = [
    {id: "weld1_start", x: 150, y: 400, t: 0, display: "none"},
    {id: "weld1_end", x: 150, y: 150, t: 0, display: "none"},
    {id: "weld2_start", x: 350, y: 400, t: 0, display: "none"},
    {id: "weld2_end", x: 350, y: 150, t: 0, display: "none"},
    {id: "weld3_start", x: 170, y: 420, t: 0, display: "none"},
    {id: "weld3_end", x: 330, y: 420, t: 0, display: "none"},
    {id: "weld4_start", x: 170, y: 130, t: 0, display: "none"},
    {id: "weld4_end", x: 330, y: 130, t: 0, display: "none"},
]

// map the default node data onto new array that will be used/changed throughout
const nodes = defaultCoords.map(j => ({ ...j })); 
// nodes = nodes.slice(0,3);

const loadProps = [
    {id: "load1", x: 225, y: 75, th: 180, mag: 150},
    {id: "load2", x: 100, y: 350, th: -125, mag: 50,},
]
const loadArrows = [
    {id: "load1", x: 0, y: 0},
    {id: "load2", x: 0, y: 0},
]
const loadMids = [
    {id: "load1", x: 100, y: 100},
    {id: "load2", x: 100, y: 100},
]

// Initialize the array for storing weld properties
const weldCoords = [
    {id: "weld1", points: [[0,0], [0,0]], thk: defaultThk, len: 0, A: 0, C: [0,0], Ix: 0, Iy: 0, J: 0},
    {id: "weld2", points: [[0,0], [0,0]], thk: defaultThk, len: 0, A: 0, C: [0,0], Ix: 0, Iy: 0, J: 0},
    {id: "weld3", points: [[0,0], [0,0]], thk: defaultThk, len: 0, A: 0, C: [0,0], Ix: 0, Iy: 0, J: 0},
    {id: "weld4", points: [[0,0], [0,0]], thk: defaultThk, len: 0, A: 0, C: [0,0], Ix: 0, Iy: 0, J: 0},
]
// weldCoords = weldCoords.slice(0,1);
updateWelds(); // populate weld points, length, area from initial nodes data

const loadPoints = [
    {id: "load1", points: [{x: 0, y: 0},{x: 0, y: 0}]},
    {id: "load1", points: [{x: 0, y: 0},{x: 0, y: 0}]}
]
updateLoads();


// Stress Vectors
const directShear = [
    {id: "weld1_start", points: [{x: 0, y: 0}, {x: 0, y: 0}], mag: 0, th: 0},
    {id: "weld1_end", points: [{x: 0, y: 0}, {x: 0, y: 0}], mag: 0, th: 0},
    {id: "weld2_start", points: [{x: 0, y: 0}, {x: 0, y: 0}], mag: 0, th: 0},
    {id: "weld2_end", points: [{x: 0, y: 0}, {x: 0, y: 0}], mag: 0, th: 0},
    {id: "weld3_start", points: [{x: 0, y: 0}, {x: 0, y: 0}], mag: 0, th: 0},
    {id: "weld3_end", points: [{x: 0, y: 0}, {x: 0, y: 0}], mag: 0, th: 0},
    {id: "weld4_start", points: [{x: 0, y: 0}, {x: 0, y: 0}], mag: 0, th: 0},
    {id: "weld4_end", points: [{x: 0, y: 0}, {x: 0, y: 0}], mag: 0, th: 0},
]
const torsionShear = [
    {id: "weld1_start", points: [{x: 0, y: 0}, {x: 0, y: 0}], mag: 0, th: 0},
    {id: "weld1_end", points: [{x: 0, y: 0}, {x: 0, y: 0}], mag: 0, th: 0},
    {id: "weld2_start", points: [{x: 0, y: 0}, {x: 0, y: 0}], mag: 0, th: 0},
    {id: "weld2_end", points: [{x: 0, y: 0}, {x: 0, y: 0}], mag: 0, th: 0},
    {id: "weld3_start", points: [{x: 0, y: 0}, {x: 0, y: 0}], mag: 0, th: 0},
    {id: "weld3_end", points: [{x: 0, y: 0}, {x: 0, y: 0}], mag: 0, th: 0},
    {id: "weld4_start", points: [{x: 0, y: 0}, {x: 0, y: 0}], mag: 0, th: 0},
    {id: "weld4_end", points: [{x: 0, y: 0}, {x: 0, y: 0}], mag: 0, th: 0},
]
const totalShear = [
    {id: "weld1_start", points: [{x: 0, y: 0}, {x: 0, y: 0}], mag: 0, th: 0},
    {id: "weld1_end", points: [{x: 0, y: 0}, {x: 0, y: 0}], mag: 0, th: 0},
    {id: "weld2_start", points: [{x: 0, y: 0}, {x: 0, y: 0}], mag: 0, th: 0},
    {id: "weld2_end", points: [{x: 0, y: 0}, {x: 0, y: 0}], mag: 0, th: 0},
    {id: "weld3_start", points: [{x: 0, y: 0}, {x: 0, y: 0}], mag: 0, th: 0},
    {id: "weld3_end", points: [{x: 0, y: 0}, {x: 0, y: 0}], mag: 0, th: 0},
    {id: "weld4_start", points: [{x: 0, y: 0}, {x: 0, y: 0}], mag: 0, th: 0},
    {id: "weld4_end", points: [{x: 0, y: 0}, {x: 0, y: 0}], mag: 0, th: 0},
]

InitGeom();
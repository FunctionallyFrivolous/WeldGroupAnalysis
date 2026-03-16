let currentZoomTransform = d3.zoomIdentity;
let showRx = true;
let showStress = false;
let showTComps = false;
let showTDir = false;
let showTTor = false;
let showTMax = false;
// let showWeldCoords = false;
// let showCoords = false;
let showLoadProps = false;
let showWeldProps = false;
let dragWeldProps = false;
let showCentCoords = false;
// let showAxes = false;

let units = "inches";
let unitSymbol = `"`;
let forceSymbol = "lbf"
let momentSymbol = "ft-lb"
let stressSymbol = "psi"
let unitPrecision = 1;

let distConvert = 0.1; // svg window units to inches (10:1)
let unitConvert = 1; // conversion from current units to inches (1 if current units are inches; 25.4 if current metric)
let forceConvert = 1;
let geomLock = false;
let inspection = false;

let windowWidth = 500;
let windowHeight = 500
let origin = [windowWidth/2,windowHeight/2];
let axisLength = 50;
let xtemp = 0;
let ytemp = 0;

let xMin = 0;
let xMax = 0;
let yMin = 0;
let yMax = 0;

const defaultThk = 0.25; // Default weld thickness value
let weldThkScale = 40;

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
let stressScale = 3;
const minLength = 25;
let snapDist = 10;

let weldCount = 3;
let loadCount = 1;
const maxWelds = 10;
const maxLoads = 10; 

let selectedLoad = "load1";
let selectedWeld = "weld1";


// A default set of nodes for 4 initial welds...
const defaultCoords = [
    {id: "weld1_start", x: 150, y: 380, t: 0, show: false},
    {id: "weld1_end", x: 150, y: 120, t: 0, show: false},
    {id: "weld2_start", x: 350, y: 380, t: 0, show: false},
    {id: "weld2_end", x: 350, y: 120, t: 0, show: false},
    {id: "weld3_start", x: 170, y: 400, t: 0, show: false},
    {id: "weld3_end", x: 330, y: 400, t: 0, show: false},
    {id: "weld4_start", x: 170, y: 100, t: 0, show: false},
    {id: "weld4_end", x: 330, y: 100, t: 0, show: false},
]

// map the default node data onto new array that will be used/changed throughout
const nodes = defaultCoords.map(j => ({ ...j })); 

const loadProps = [
    {id: "load1", x: 225, y: 125, th: 340, mag: 150, show: false},
    {id: "load2", x: 100, y: 350, th: 235, mag: 100, show: false},
]
const loadArrows = [
    {id: "load1", x: 0, y: 0, mag: 0, show: false},
    {id: "load2", x: 0, y: 0, mag: 0, show: false},
]
const loadMids = [
    {id: "load1", x: 100, y: 100, th: 0, show: false},
    {id: "load2", x: 100, y: 100, th: 0, show: false},
]

// Initialize the array for storing weld properties
const weldCoords = [
    {id: "weld1", points: [[0,0], [0,0]], thk: defaultThk, len: 0, A: 0, C: [0,0], Ix: 0, Iy: 0, J: 0, show: false},
    {id: "weld2", points: [[0,0], [0,0]], thk: defaultThk, len: 0, A: 0, C: [0,0], Ix: 0, Iy: 0, J: 0, show: false},
    {id: "weld3", points: [[0,0], [0,0]], thk: defaultThk, len: 0, A: 0, C: [0,0], Ix: 0, Iy: 0, J: 0, show: false},
    {id: "weld4", points: [[0,0], [0,0]], thk: defaultThk, len: 0, A: 0, C: [0,0], Ix: 0, Iy: 0, J: 0, show: false},
]
// const weldMids = [
//     {id: "weld1", x: 0, y: 0, show: false},
//     {id: "weld2", x: 0, y: 0, show: false},
//     {id: "weld3", x: 0, y: 0, show: false},
//     {id: "weld4", x: 0, y: 0, show: false},
// ]
// weldCoords = weldCoords.slice(0,1);
updateWelds(); // populate weld points, length, area from initial nodes data

const loadPoints = [
    {id: "load1", points: [{x: 0, y: 0},{x: 0, y: 0}]},
    {id: "load2", points: [{x: 0, y: 0},{x: 0, y: 0}]}
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

const backUpWelds = [
    {points: [{x: 170, y: 100},{x: 330, y: 100}], thk: defaultThk}
]
const backUpLoads = [
    {x: 100, y: 350, th: 235, mag: 100}
]

InitGeom();
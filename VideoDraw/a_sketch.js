// https://editor.p5js.org/jht9629-nyu/sketches/vFHFG2gSC
// bezier draw rainbow noise v5

// let paths = [];
let currentPath = [];
let isDrawing = false;
let strokeWeightSlider, smoothnessSlider;
let strokeWeightSpan, smoothnessSpan;
let strokeWeightValue = 12;
let smoothnessValue = 1;
let clearButton, toggleButton;
let controlsDiv;
// let isColorful = true;
let hueOffset = 0;
// let isAutoMode = false;
let currentColor;
let lastPoint;
let pathsMax = 1000;
let my = {};

function setup() {
  //
  my.title = '?v=18 Drag mouse to draw on video';
  my.canvas = createCanvas(windowWidth, windowHeight - 100);
  my.downSize = 32;
  my.penAlpha = 255;
  my.deltaTimeLimit = 0.1;
  // my.deltaTimeLimit = 0;

  init_vars();

  create_ui();

  my.canvas.mousePressed(canvas_mousePressed);
  my.canvas.mouseReleased(canvas_mouseReleased);
  // !!@ p5 docs not correct, must deal with touch events explictly
  my.canvas.touchStarted(canvas_touchStarted);
  my.canvas.touchEnded(canvas_touchEnded);

  create_layer();

  create_draw_layer();

  create_capture();

  // !!@ my.canvas.noFill does not exist
  noFill();
}

function init_vars() {
  my.deltaTimeSeconds = 0;
  my.pixelMargin = 0.1;
  my.frameCount = 0;
  lastPoint = { x: width / 2, y: height / 2 };
  my.colorStyle = 'video';
  my.penStyle = 'line';
  my.scanStyle = 'line';
  // my.scanStyle = 'spiral';
  // my.scanStyle = 'none';
  my.sizeStyle = 'thick';
  my.scanX = 0;
  my.scanY = 0;
}

function draw() {
  //
  check_scanStyle();

  // captured video is behind drawing
  render_capture();

  // Draw comitted paths
  image(my.layer, 0, 0);

  image(my.drawLayer, 0, 0);

  // Draw current path being drawn
  drawBezierPath(currentPath, my.canvas);
}

function canvas_touchStarted() {
  // console.log('in canvas_touchStarted');
  start_draw();
}

function canvas_mousePressed() {
  // console.log('in canvas_mousePressed');
  start_draw();
}

function mouseDragged() {
  let onCanvas = mouse_onCanvas();
  // console.log('in mouseDragged');

  // !!@ isDrawing test could be eliminated
  // it use here requires canvas_touchStarted,
  //  whereas DrawPoints does not need it

  if (isDrawing && onCanvas) {
    draw_to(mouseX, mouseY);
  }
  // return false; // required to prevent touch drag moving canvas on mobile
  return onCanvas ? false : true;
}

function canvas_touchEnded() {
  // console.log('in canvas_touchEnded');
  stop_draw();
}

function canvas_mouseReleased() {
  // console.log('in canvas_mouseReleased');
  stop_draw();
}

// Return true if mouse is within canvas bounds
function mouse_onCanvas() {
  let inX = mouseX >= 0 && mouseX < width;
  let inY = mouseY >= 0 && mouseY < height;
  return inX && inY;
}

function check_scanStyle() {
  if (my.scanStyle == 'spiral') {
    step_scan_walk();
  } else if (my.scanStyle == 'line') {
    step_scan_line();
  }
}

// return true to step animation to limit update to my.deltaTimeSeconds
function frame_ready() {
  my.deltaTimeSeconds += deltaTime / 1000;
  if (my.deltaTimeSeconds >= my.deltaTimeLimit) {
    my.deltaTimeSeconds = 0;
    return true;
  }
  return false;
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  clearCanvas();
}

function clearCanvas() {
  // paths = [];
  currentPath = [];
  background(0);
  create_layer();
  create_draw_layer();
  init_scan_walk();
}

function create_layer() {
  // !!@ Must remove layer to avoid memory leaks
  if (my.layer) my.layer.remove();
  my.layer = createGraphics(width, height);
  my.layer.clear();
  my.layer.noFill();
}

function create_draw_layer() {
  if (my.drawLayer) my.drawLayer.remove();
  my.drawLayer = createGraphics(width, height);
  my.drawLayer.clear();
  my.drawLayer.noFill();
}

// function toggleAutoMode() {
//   isAutoMode = !isAutoMode;
//   autoButton.html('Auto ' + (isAutoMode ? 'On' : 'Off'));
// }

function fullScreen_action() {
  // my.fullScreenButton.remove();
  // controlsDiv.hide();
  controlsDiv.remove();
  try {
    fullscreen(1);
  } catch (err) {
    console.error('fullscreen err', err);
  }
  let delay = 3000;
  setTimeout(ui_present_window, delay);
}

function ui_present_window() {
  resizeCanvas(windowWidth, windowHeight);
  clearCanvas();
  // init_vars();
}
// https://editor.p5js.org/jht9629-nyu/sketches/nywPqiEH8
// claude bezier draw quadraticVertex

// https://editor.p5js.org/jht9629-nyu/sketches/fys4OYczY
// claude bezier draw v2

// https://editor.p5js.org/jht9629-nyu/sketches/HLRNocFdW
// claude bezier draw dom v3
/*
p5js sketch using bezier curves to draw lines with mouse
no change in color when in colorful mode
Uncaught Error: Uncaught TypeError: colorMode is not a function
convert code to use p5 bezier function
convert to use p5 dom functions
*/

// https://editor.p5js.org/jht9629-nyu/sketches/gkCRgN3Ke
// claude bezier draw rainbow v4

// !!@ Error: Fullscreen not enabled in this browser.

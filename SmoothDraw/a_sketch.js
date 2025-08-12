// https://editor.p5js.org/jht9629-nyu/sketches/vFHFG2gSC
// bezier draw rainbow noise v5

// let paths = [];
let currentPath = [];
let isDrawing = false;
let strokeWeightSlider, smoothnessSlider;
let strokeWeightSpan, smoothnessSpan;
let strokeWeightValue = 10;
let smoothnessValue = 1;
let clearButton, toggleButton;
let controlsDiv;
let isColorful = true;
let hueOffset = 0;
let isAutoMode = false;
let currentColor;
let lastPoint;
let pathsMax = 1000;
let my = {};

function setup() {
  //
  my.title = '?v=10 Drag mouse to draw smooth Bézier curves';
  my.canvas = createCanvas(windowWidth, windowHeight - 100);
  my.downSize = 32;
  my.penAlpha = 0.4;
  my.frameCountDelay = 1;
  my.perFrameMax = 200;

  create_ui();

  my.canvas.mousePressed(canvas_mousePressed);
  my.canvas.mouseReleased(canvas_mouseReleased);
  // !!@ p5 docs not correct, must deal with touch events explictly
  my.canvas.touchStarted(canvas_touchStarted);
  my.canvas.touchEnded(canvas_touchEnded);
  my.frameCount = 0;
  lastPoint = { x: width / 2, y: height / 2 };

  create_layer();
  create_capture();
  // !!@ my.canvas.noFill does not exist
  noFill();
}

function draw() {
  //
  autoMode_check();

  // captured video is behind drawing
  render_capture();

  // Draw comitted paths
  image(my.layer, 0, 0);

  // Draw current path being drawn
  drawBezierPath(currentPath, my.canvas);
}

function create_capture() {
  my.capture = createCapture(VIDEO);
  my.capture.hide();
}

function render_capture() {
  let capv = my.capture;
  let img = capv.get();
  // extreme downsampling for distortion
  // keep width, adjust height for aspect ratio
  img.resize(my.downSize, 0);
  image(img, 0, 0, width, (width * capv.height) / capv.width);
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

function mouse_onCanvas() {
  let inX = mouseX >= 0 && mouseX < width;
  let inY = mouseY >= 0 && mouseY < height;
  return inX && inY;
}

function autoMode_check() {
  if (isAutoMode && frameCount % my.frameCountDelay == 0) {
    if (!isDrawing) {
      // start_draw(random(width), random(height));
      start_draw(lastPoint.x, lastPoint.y);
    } else {
      if (frameCount % 100 == 0) {
        stop_draw();
      } else {
        // draw_to(random(width), random(height));
        draw_walk();
      }
    }
  }
}

function draw_walk() {
  for (let i = 0; i < my.perFrameMax; i++) {
    draw_walk_add();
  }
}

function draw_walk_add() {
  let x = width * noise(0.005 * my.frameCount);
  let y = height * noise(0.005 * my.frameCount + 10000);
  add_point(x, y);
}

function start_draw() {
  isDrawing = true;
  currentPath = [];
  // add_point(x, y);
}

function add_point(x, y) {
  my.frameCount += 1;
  hueOffset += 1;
  if (isColorful) {
    // currentColor = rainbow_color();
    currentColor = video_color(x, y);
  } else {
    colorMode(RGB, 255);
    currentColor = color(255, 255, 255, my.penAlpha);
  }
  let strokeColor = currentColor;
  let weight = strokeWeightValue;
  weight = weight / 4 + weight * noise(0.1 * my.frameCount + 20000);
  lastPoint = { x, y, strokeColor, weight };
  currentPath.push(lastPoint);
}

function video_color(x, y) {
  // console.log('select_color(x, y)', x, y);
  // let capv = my.capture;
  // image(img, 0, 0, width, (width * capv.height) / capv.width);
  let img = my.capture.get();
  x = map(x, 0, width, 0, img.width, true);
  y = map(y, 0, height, 0, img.height, true);
  x = int(x);
  y = int(y);
  let c = img.get(x, y);
  // !!@ alpha is in 0-255 vs. color alpha param 0-1.0
  c[3] = int(255 * my.penAlpha);
  // console.log(' mapped x y', x, y, 'c', c);
  return c;
}

// map(value, start1, stop1, start2, stop2, [withinBounds])

function rainbow_color() {
  colorMode(HSB, 360, 100, 100);
  return color(hueOffset % 360, 80, 90, my.penAlpha);
}

function draw_to(x, y) {
  let distance = dist(x, y, lastPoint.x, lastPoint.y);
  if (distance > 5) {
    add_point(x, y);
  }
}

function stop_draw() {
  // console.log('stop_draw currentPath.length', currentPath.length);
  if (isDrawing && currentPath.length > 1) {
    // commit current path to the grahics layer
    drawBezierPath(currentPath, my.layer);
  }
  isDrawing = false;
  currentPath = [];

  // backup count to avoid small gaps in paths
  my.frameCount -= 1;
}

function drawBezierPath(points, layer) {
  if (points.length < 2) return;
  // layer.noFill(); // !!@ not available on canvas
  let smoothness = smoothnessValue; // Convert to 0.1-1.0 range
  // For paths with only 2 points, draw a simple line
  if (points.length == 2) {
    p0 = points[0];
    p1 = points[0];
    layer.stroke(p1.strokeColor);
    layer.strokeWeight(p1.weight);
    layer.line(p0.x, p0.y, p1.x, p1.y);
    return;
  }
  // Draw bezier curves between consecutive points
  for (let i = 0; i < points.length - 1; i++) {
    let p0, p1, p2, p3;
    // Get the four points needed for cubic bezier
    if (i == 0) {
      p0 = points[0];
      p1 = points[0];
      p2 = points[1];
      p3 = points.length > 2 ? points[2] : points[1];
    } else if (i == points.length - 2) {
      p0 = points[i - 1];
      p1 = points[i];
      p2 = points[i + 1];
      p3 = points[i + 1];
    } else {
      p0 = points[i - 1];
      p1 = points[i];
      p2 = points[i + 1];
      p3 = points[i + 2];
    }
    layer.stroke(p3.strokeColor);
    layer.strokeWeight(p3.weight);
    // Calculate control points for smooth cubic bezier
    let cp1x = p1.x + (p2.x - p0.x) * smoothness * 0.16;
    let cp1y = p1.y + (p2.y - p0.y) * smoothness * 0.16;
    let cp2x = p2.x - (p3.x - p1.x) * smoothness * 0.16;
    let cp2y = p2.y - (p3.y - p1.y) * smoothness * 0.16;
    // Draw the cubic bezier curve using p5.js bezier function
    layer.bezier(p1.x, p1.y, cp1x, cp1y, cp2x, cp2y, p2.x, p2.y);
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  clearCanvas();
}

function clearCanvas() {
  // paths = [];
  currentPath = [];
  background(0);
  // !!@ Must remove layer to avoid memory leaks
  create_layer();
}

function create_layer() {
  if (my.layer) my.layer.remove();
  my.layer = createGraphics(width, height);
  my.layer.clear();
  my.layer.noFill();
}

function toggleAutoMode() {
  isAutoMode = !isAutoMode;
  autoButton.html('Auto ' + (isAutoMode ? 'On' : 'Off'));
}

function toggleColorMode() {
  isColorful = !isColorful;
  toggleButton.html(isColorful ? 'Colorful' : 'White');
}
// --
// function setup_fullScreenButton() {
//   my.fullScreenButton = createButton("?=v26 Full");
//   my.fullScreenButton.mousePressed(fullScreen_action);
//   my.fullScreenButton.style("font-size:42px");
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

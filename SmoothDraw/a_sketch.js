// https://editor.p5js.org/jht9629-nyu/sketches/vFHFG2gSC
// bezier draw rainbow noise v5

let paths = [];
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
  my.title = '?v=6 Drag mouse to draw smooth Bézier curves';
  my.canvas = createCanvas(windowWidth, windowHeight - 100);

  colorMode(RGB, 255);
  background(20);
  // Create all UI elements using p5.js DOM functions
  create_ui();

  my.canvas.mousePressed(canvas_mousePressed);
  my.canvas.mouseReleased(canvas_mouseReleased);
  // !!@ p5 docs not correct, must deal with touch events explictly
  my.canvas.touchStarted(canvas_touchStarted);
  my.canvas.touchEnded(canvas_touchEnded);
  my.frameCount = 0;
  lastPoint = { x: width / 2, y: height / 2 };
}

function draw() {
  // Slight fade effect for trails
  background(20, 20, 20, 10);

  autoMode_check();
  //
  // Draw all completed paths
  for (let path of paths) {
    drawBezierPath(path.points);
  }
  // Draw current path being drawn
  if (currentPath.length > 1) {
    drawBezierPath(currentPath);
    // drawBezierPath(currentPath, currentColor, strokeWeightSlider.value());
  }
}

function canvas_touchStarted() {
  console.log('in canvas_touchStarted');
  // !!@ p5 mouse globals not reliable here.
  // !!@ drop need of starting point
  start_draw(mouseX, mouseY);
}

function canvas_mousePressed() {
  console.log('in canvas_mousePressed');
  start_draw(mouseX, mouseY);
}

function mouseDragged() {
  let onCanvas = mouse_onCanvas();
  console.log('in mouseDragged');

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
  console.log('in canvas_touchEnded');
  stop_draw();
}

function canvas_mouseReleased() {
  console.log('in canvas_mouseReleased');
  stop_draw();
}

function mouse_onCanvas() {
  let inX = mouseX >= 0 && mouseX < width;
  let inY = mouseY >= 0 && mouseY < height;
  return inX && inY;
}

function autoMode_check() {
  if (isAutoMode && frameCount % 2 == 0) {
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
  let x = width * noise(0.005 * my.frameCount);
  let y = height * noise(0.005 * my.frameCount + 10000);
  add_point(x, y);
}

function start_draw(x, y) {
  isDrawing = true;
  currentPath = [];
  // add_point(x, y);
}

function add_point(x, y) {
  my.frameCount += 1;
  hueOffset += 1;
  if (isColorful) {
    colorMode(HSB, 360, 100, 100);
    currentColor = color(hueOffset % 360, 80, 90);
  } else {
    colorMode(RGB, 255);
    currentColor = color(255);
  }
  // currentColor = color(hueOffset % 360, 80, 90);
  let strokeColor = currentColor;
  let weight = strokeWeightValue;
  weight = weight / 4 + weight * noise(0.1 * my.frameCount + 20000);
  lastPoint = { x, y, strokeColor, weight };
  currentPath.push(lastPoint);
  // hueOffset = random(0, 360);
}

function draw_to(x, y) {
  let distance = dist(x, y, lastPoint.x, lastPoint.y);
  if (distance > 5) {
    add_point(x, y);
  }
}

function stop_draw() {
  if (isDrawing && currentPath.length > 1) {
    if (paths.length > pathsMax) {
      // console.log("paths.splice");
      paths.splice(0, 1);
    }
    paths.push({ points: currentPath });
  }
  isDrawing = false;
  currentPath = [];
  my.frameCount -= 1;
}

function drawBezierPath(points) {
  if (points.length < 2) return;
  noFill();
  let smoothness = smoothnessValue; // Convert to 0.1-1.0 range
  // For paths with only 2 points, draw a simple line
  if (points.length == 2) {
    line(points[0].x, points[0].y, points[1].x, points[1].y);
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
    stroke(p3.strokeColor);
    strokeWeight(p3.weight);
    // Calculate control points for smooth cubic bezier
    let cp1x = p1.x + (p2.x - p0.x) * smoothness * 0.16;
    let cp1y = p1.y + (p2.y - p0.y) * smoothness * 0.16;
    let cp2x = p2.x - (p3.x - p1.x) * smoothness * 0.16;
    let cp2y = p2.y - (p3.y - p1.y) * smoothness * 0.16;
    // Draw the cubic bezier curve using p5.js bezier function
    bezier(p1.x, p1.y, cp1x, cp1y, cp2x, cp2y, p2.x, p2.y);
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  background(20);
}

function clearCanvas() {
  paths = [];
  currentPath = [];
  background(20);
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
    console.log('fullscreen err', err);
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

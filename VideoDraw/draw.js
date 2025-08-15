//

function step_scan_pixel() {
  // console.log('step_scan_pixel x y', my.scanX, my.scanY);
  my.video_img = null;
  add_point(my.scanX, my.scanY, 'video', 'pixel', my.layer);
  my.scanX += strokeWeightValue;
  if (my.scanX > width) {
    my.scanX = 0;
    my.scanY += strokeWeightValue;
    if (my.scanY > height) {
      my.scanY = 0;
    }
  }
}

function step_scan_walk() {
  my.video_img = null;
  if (!frame_ready()) return;
  if (!my.scanWalkInited) {
    init_scan_walk();
  }
  let nw = width / strokeWeightValue;
  let n = min(nw, my.scanLoop);
  // my.scanIndex
  // my.scan_locs.length
  for (let i = 0; i < n; i++) {
    let [x, y] = my.scan_locs[my.scanIndex % my.scan_locs.length];
    add_point(x, y, 'video', 'pixel', my.layer);
    // my.scanIndex = (my.scanIndex + 1) % my.scan_locs.length;
    my.scanIndex += 1;
  }
  my.scanLoop += 1;
  if (my.scanIndex >= my.scan_locs.length) {
    // init_scan_walk();
    my.scanIndex = 0;
  }
}

function init_scan_walk() {
  my.layer.clear();
  my.scanWalkInited = 1;
  my.scanIndex = 0;
  my.scanLoop = 1;
  // { width: 600, height: 400, d: 10 }
  let spiral = new SpiralWalker({ width, height, d: strokeWeightValue });
  console.log('spiral', spiral);
  my.scan_locs = spiral.points();
}

function step_scan_line() {
  my.video_img = null;
  if (!frame_ready()) return;
  let x = 0;
  let y = my.scanY;
  while (x < width) {
    add_point(x, y, 'video', 'pixel', my.layer);
    x += strokeWeightValue;
  }
  my.scanY += strokeWeightValue;
  if (my.scanY > height) {
    my.scanY = 0;
  }
}

// function step_scan_walk() {
//   if (!frame_ready()) return;
//   if (!isDrawing) {
//     start_draw(lastPoint.x, lastPoint.y);
//   } else {
//     if (frameCount % 100 == 0) {
//       stop_draw();
//     } else {
//       draw_walk();
//     }
//   }
// }

// function draw_walk() {
//   // !!@ noise does not cover the full range
//   let x = width * 1.2 * noise(0.005 * my.frameCount);
//   let y = height * 1.2 * noise(0.005 * my.frameCount + 10000);
//   add_point(x, y, my.colorStyle, my.penStyle);
// }

function start_draw() {
  isDrawing = true;
  currentPath = [];
}

function draw_to(x, y) {
  let distance = dist(x, y, lastPoint.x, lastPoint.y);
  if (distance > 5) {
    add_point(x, y, my.colorStyle, my.penStyle, my.drawLayer);
  }
}

function stop_draw() {
  // console.log('stop_draw currentPath.length', currentPath.length);
  if (isDrawing && currentPath.length > 1) {
    // commit current path to the grahics layer
    drawBezierPath(currentPath, my.drawLayer);
  }
  isDrawing = false;
  currentPath = [];
  // backup count to avoid small gaps in paths
  my.frameCount -= 1;
}

function add_point(x, y, colorStyle, penStyle, layer) {
  // console.log('add_point x y my.penStyle', x, y, my.penStyle);
  my.frameCount += 1;
  hueOffset += 1;
  // my.colorStyle
  if (colorStyle == 'rainbow') {
    currentColor = rainbow_color();
  } else if (colorStyle == 'video') {
    currentColor = video_color(x, y);
  } else if (colorStyle == 'white') {
    colorMode(RGB, 255);
    currentColor = color(255, 255, 255, my.penAlpha);
  } else if (colorStyle == 'red') {
    colorMode(RGB, 255);
    currentColor = color(255, 0, 0, my.penAlpha);
  } else if (colorStyle == 'green') {
    colorMode(RGB, 255);
    currentColor = color(0, 255, 0, my.penAlpha);
  } else if (colorStyle == 'gold') {
    colorMode(RGB, 255);
    currentColor = color(255, 255, 0, my.penAlpha);
  }
  let strokeColor = currentColor;
  let weight = strokeWeightValue;
  weight = weight / 4 + weight * noise(0.1 * my.frameCount + 20000);
  lastPoint = { x, y, strokeColor, weight };
  if (penStyle == 'line') {
    currentPath.push(lastPoint);
  } else if (penStyle == 'pixel') {
    draw_pixel(x, y, layer);
  }
}

function draw_pixel(x, y, layer) {
  // console.log('draw_pixel x y', x, y, currentColor);
  x = int(x / strokeWeightValue) * strokeWeightValue;
  y = int(y / strokeWeightValue) * strokeWeightValue;
  let m = round(strokeWeightValue * my.pixelMargin);
  layer.strokeWeight(0);
  layer.fill(currentColor);
  layer.rect(x + m, y + m, strokeWeightValue - 2 * m, strokeWeightValue - 2 * m);
}

function rainbow_color() {
  colorMode(HSB, 360, 100, 100);
  // !!@ alpha is in 0-255 vs. color alpha param 0-1.0
  return color(hueOffset % 360, 80, 90, my.penAlpha / 255);
}

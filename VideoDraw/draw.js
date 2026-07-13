//

function draw_to(x, y) {
  let distance = dist(x, y, lastPoint.x, lastPoint.y);
  if (distance > 5) {
    add_point(x, y, my.colorStyle, my.penStyle, my.drawLayer);
  }
}

function auto_draw_check() {
  if (!my.autoDrawOn || frameCount % 2 != 0) return;
  if (!isDrawing) {
    start_draw();
    // Seed each new auto path from the last point for continuity.
    // add_point(lastPoint.x, lastPoint.y, my.colorStyle, my.penStyle, my.drawLayer);
    add_point(lastPoint.x, lastPoint.y, 'video', 'line', my.drawLayer);
    return;
  }
  if (frameCount % 100 == 0) {
    stop_draw();
    return;
  }
  auto_draw_walk();
}

function auto_draw_walk() {
  let x = width * noise(0.005 * my.frameCount);
  let y = height * noise(0.005 * my.frameCount + 10000);
  // !!@ noise gives wild values
  //
  if (lastPoint) {
    console.log('auto_draw_walk diff x y', lastPoint.x - x, lastPoint.y - y, lastPoint.frameCount - my.frameCount);
  }
  // console.log('auto_draw_walk x y', x, y, my.frameCount)
  // add_point(x, y, my.colorStyle, my.penStyle, my.drawLayer);
  // line --> my.drawLayer not used.
  add_point(x, y, 'video', 'line', my.drawLayer);
}

function start_draw() {
  console.log('start_draw currentPath.length', currentPath.length);
  isDrawing = true;
  currentPath = [];
}

// currentPath is flused to my.drawLayer
//
function stop_draw() {
  console.log('stop_draw currentPath.length', currentPath.length);
  if (isDrawing && currentPath.length > 1) {
    // commit current path to the grahics layer
    drawBezierPath(currentPath, my.drawLayer);
  }
  isDrawing = false;
  currentPath = [];
  // backup count to avoid small gaps in paths
  my.frameCount -= 1;
}

// penStyle == line --> lastPoint added to currentPath
// penStyle == pixel --> draw pixel to layer
//
function add_point(x, y, colorStyle, penStyle, layer) {
  // console.log('add_point x y colorStyle', x, y, colorStyle, penStyle );
  my.frameCount += 1;
  set_currentColor(x, y, colorStyle);
  let strokeColor = currentColor;
  let weight = strokeWeightValue;
  weight = weight / 4 + weight * noise(0.1 * my.frameCount + 20000);
  lastPoint = { x, y, strokeColor, weight, frameCount: my.frameCount };
  if (penStyle == 'line') {
    currentPath.push(lastPoint);
  } else if (penStyle == 'pixel') {
    draw_pixel(x, y, layer);
  }
}

function set_currentColor(x, y, colorStyle) {
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
  hueOffset += 1;
  // !!@ alpha is in 0-255 vs. color alpha param 0-1.0
  return color(hueOffset % 360, 80, 90, my.penAlpha / 255);
}

//

function draw_walk() {
  // !!@ noise does not cover the full range
  let x = width * 1.2 * noise(0.005 * my.frameCount);
  let y = height * 1.2 * noise(0.005 * my.frameCount + 10000);
  add_point(x, y);
}

function start_draw() {
  isDrawing = true;
  currentPath = [];
  // add_point(x, y);
}

function add_point(x, y) {
  // console.log('add_point x y my.penStyle', x, y, my.penStyle);
  my.frameCount += 1;
  hueOffset += 1;

  // my.colorStyle
  if (my.colorStyle == 'rainbow') {
    currentColor = rainbow_color();
  } else if (my.colorStyle == 'video') {
    currentColor = video_color(x, y);
  } else if (my.colorStyle == 'white') {
    colorMode(RGB, 255);
    currentColor = color(255, 255, 255, my.penAlpha);
  } else if (my.colorStyle == 'red') {
    colorMode(RGB, 255);
    currentColor = color(255, 0, 0, my.penAlpha);
  } else if (my.colorStyle == 'green') {
    colorMode(RGB, 255);
    currentColor = color(0, 255, 0, my.penAlpha);
  } else if (my.colorStyle == 'gold') {
    colorMode(RGB, 255);
    currentColor = color(255, 0, 255, my.penAlpha);
  }
  let strokeColor = currentColor;
  let weight = strokeWeightValue;
  weight = weight / 4 + weight * noise(0.1 * my.frameCount + 20000);
  lastPoint = { x, y, strokeColor, weight };

  if (my.penStyle == 'line') {
    currentPath.push(lastPoint);
  } else if (my.penStyle == 'pixel') {
    draw_pixel(x, y, my.layer);
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

function video_color(x, y) {
  // console.log('select_color(x, y)', x, y);

  // let capv = my.capture;
  // image(img, 0, 0, width, (width * capv.height) / capv.width);

  let img = my.capture.get();
  if (0) {
    // keep width, adjust height for aspect ratio
    let ratio = img.height / img.width;
    x = map(x, 0, width, 0, img.width, true);
    y = map(y, 0, width * ratio, 0, img.height, true);
  }
  {
    // keep height, adjust width for aspect ratio
    let ratio = img.width / img.height;
    x = map(x, 0, height * ratio, 0, img.width, true);
    y = map(y, 0, height, 0, img.height, true);
  }
  x = int(x);
  y = int(y);
  let c = img.get(x, y);
  c[3] = my.penAlpha;
  // console.log(' mapped x y', x, y, 'c', c);
  return c;
}

// map(value, start1, stop1, start2, stop2, [withinBounds])

function rainbow_color() {
  colorMode(HSB, 360, 100, 100);
  // !!@ alpha is in 0-255 vs. color alpha param 0-1.0
  return color(hueOffset % 360, 80, 90, my.penAlpha / 255);
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

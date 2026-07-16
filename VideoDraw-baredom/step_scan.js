//

function step_scan_line() {
  my.video_img = null;
  if (!frame_ready()) return;
  let x = 0;
  let y = my.scanY;
  let xStep = my.pixelSize;
  let yStep = my.pixelSize;
  let isTriangle = my.shapeLabel == 'triangle';
  my.xOffset = 0;
  if (isTriangle) {
    // triangles tile in half-width columns and rows equal to their own height
    xStep = my.pixelSize / 2;
    yStep = (my.pixelSize * sqrt(3)) / 2;
    if (my.scanYCount % 2 == 1) {
      my.xOffset = -xStep;
    }
  }
  while (x < width) {
    // add_point(x, y, 'video', 'pixel', my.layer);
    step_scan_draw(x, y);
    x += xStep;
  }
  my.scanY += yStep;
  my.scanYCount += 1;
  if (my.scanY > height) {
    my.scanY = 0;
    my.scanYCount = 0;
  }
}

function step_scan_draw(x, y) {
  let layer = my.layer;
  let vidColor = video_color(x, y);
  // console.log('draw_pixel x y', x, y, currentColor);
  let m = round(my.pixelSize * my.pixelMargin);
  layer.strokeWeight(0);
  layer.fill(vidColor);
  if (my.shapeLabel == 'triangle') {
    // tessellating triangle mosaic: half-width columns alternate up/down triangles
    let s = my.pixelSize;
    let half = s / 2;
    let h = (s * sqrt(3)) / 2;
    let col = round(x / half);
    let cellX = col * half + my.xOffset;
    let cellY = round(y / h) * h;
    // stroke so up/down triangles stay visible even when neighboring video colors are similar
    if (col % 2 == 0) {
      layer.triangle(cellX + half, cellY + m, cellX + m, cellY + h - m, cellX + s - m, cellY + h - m);
    } else {
      layer.triangle(cellX + half, cellY + h - m, cellX + m, cellY + m, cellX + s - m, cellY + m);
    }
    return;
  }
  x = int(x / my.pixelSize) * my.pixelSize;
  y = int(y / my.pixelSize) * my.pixelSize;
  if (my.shapeLabel == 'square') {
    layer.rect(x + m, y + m, my.pixelSize - 2 * m, my.pixelSize - 2 * m);
  } else if (my.shapeLabel == 'circle') {
    layer.ellipse(x + my.pixelSize / 2, y + my.pixelSize / 2, my.pixelSize - 2 * m, my.pixelSize - 2 * m);
  } else if (my.shapeLabel == 'hex') {
    let r = (my.pixelSize - 2 * m) / 2;
    let h = r * sqrt(3);
    layer.beginShape();
    for (let i = 0; i < 6; i++) {
      let angle = (TWO_PI / 6) * i;
      let vx = x + my.pixelSize / 2 + r * cos(angle);
      let vy = y + my.pixelSize / 2 + r * sin(angle);
      layer.vertex(vx, vy);
    }
    layer.endShape(CLOSE);
  }
}

function step_scan_pixel() {
  // console.log('step_scan_pixel x y', my.scanX, my.scanY);
  my.video_img = null;
  // add_point(my.scanX, my.scanY, 'video', 'pixel', my.layer);
  step_scan_draw(x, y);
  my.scanX += my.pixelSize;
  if (my.scanX > width) {
    my.scanX = 0;
    my.scanY += my.pixelSize;
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
  let nw = width / my.pixelSize;
  let n = min(nw, my.scanLoop);
  // my.scanIndex
  // my.scan_locs.length
  for (let i = 0; i < n; i++) {
    let [x, y] = my.scan_locs[my.scanIndex % my.scan_locs.length];
    // add_point(x, y, 'video', 'pixel', my.layer);
    step_scan_draw(x, y);
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
  let spiral = new SpiralWalker({ width, height, d: my.pixelSize });
  // console.log('spiral', spiral);
  my.scan_locs = spiral.points();
}

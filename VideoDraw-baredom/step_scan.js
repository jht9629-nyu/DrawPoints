//

function step_scan_line() {
  my.video_img = null;
  if (!frame_ready()) return;
  let x = 0;
  let y = my.scanY;
  while (x < width) {
    // add_point(x, y, 'video', 'pixel', my.layer);
    step_scan_add(x, y);
    x += my.pixelSize;
  }
  my.scanY += my.pixelSize;
  if (my.scanY > height) {
    my.scanY = 0;
  }
}

function step_scan_add(x, y) {
  let layer = my.layer;
  let vidColor = video_color(x, y);
  // console.log('draw_pixel x y', x, y, currentColor);
  x = int(x / my.pixelSize) * my.pixelSize;
  y = int(y / my.pixelSize) * my.pixelSize;
  let m = round(my.pixelSize * my.pixelMargin);
  layer.strokeWeight(0);
  layer.fill(vidColor);
  layer.rect(x + m, y + m, my.pixelSize - 2 * m, my.pixelSize - 2 * m);
}

function step_scan_pixel() {
  // console.log('step_scan_pixel x y', my.scanX, my.scanY);
  my.video_img = null;
  // add_point(my.scanX, my.scanY, 'video', 'pixel', my.layer);
  step_scan_add(x, y);
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
    step_scan_add(x, y);
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

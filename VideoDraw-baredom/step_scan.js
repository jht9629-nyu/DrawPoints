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

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
    add_point(lastPoint.x, lastPoint.y);
    return;
  }
  if (frameCount % 100 == 0) {
    if (my.eraseFlag) {
      my.drawLayer.erase();
    } else {
      my.drawLayer.noErase();
    }
    stop_draw();
    return;
  }
  auto_draw_walk();
}

function auto_draw_walk() {
  let x;
  let y;
  if (my.jumpWalk) {
    x = random(width);
    y = random(height);
  } else {
    x = width * noise(0.005 * my.frameCount);
    y = height * noise(0.005 * my.frameCount + 10000);
    if (!my.noiseWalk) {
      // restrict walking brush to grid
      x -= x % my.pixelSize;
      y -= y % my.pixelSize;
    }
  }
  //
  if (lastPoint) {
    // console.log('auto_draw_walk diff x y', lastPoint.x - x, lastPoint.y - y, lastPoint.frameCount - my.frameCount);
  }
  // console.log('auto_draw_walk x y', x, y, my.frameCount)
  // line --> my.drawLayer not used.
  add_point(x, y);
}

function start_draw() {
  // console.log('start_draw currentPath.length', currentPath.length);
  isDrawing = true;
  currentPath = [];
}

// currentPath is flushed to my.drawLayer
//
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

//
function add_point(x, y, layer = my.drawLayer) {
  // console.log('add_point x y', x, y );
  set_currentColor(x, y);
  let strokeColor = video_color(x, y);
  let weight = my.brushSize;
  weight = weight / 4 + weight * noise(0.1 * my.frameCount + 20000);
  lastPoint = { x, y, strokeColor, weight, frameCount: my.frameCount };
  my.frameCount += 1;
  currentPath.push(lastPoint);
}

function set_currentColor(x, y) {
  if (!my.noiseWalk) {
    // x = int(random(width));
    // y = int(random(height));
    // x = width - x;
    // y = height - y;
  }
  currentColor = video_color(x, y);
}

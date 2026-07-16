//

function create_capture() {
  if (my.capture) {
    my.capture.remove();
  }
  let facingMode = my.cameraFacing || 'user';
  my.capture = createCapture(
    {
      video: { facingMode: { ideal: facingMode } },
      audio: false,
      // mirror the front camera, but not the back camera
      flipped: facingMode === 'user',
    },
  );
  my.capture.hide();
}

function render_capture() {
  let capv = my.capture;
  let img = capv.get();
  // extreme downsampling for distortion
  if (my.aspectWide) {
    // keep width, adjust height for aspect ratio
    img.resize(my.downSize, 0);
    let ratio = capv.height / capv.width;
    image(img, 0, 0, width, width * ratio);
  } else {
    // keep height, adjust width for aspect ratio
    img.resize(0, my.downSize);
    let ratio = capv.width / capv.height;
    image(img, 0, 0, height * ratio, height);
  }
}

function video_color(x, y) {
  // console.log('select_color(x, y)', x, y);
  // save my.video_img once per frame to speed up
  if (!my.video_img) {
    my.video_img = my.capture.get();
  }
  let img = my.video_img;
  if (my.aspectWide) {
    // keep width, adjust height for aspect ratio
    let ratio = img.height / img.width;
    x = map(x, 0, width, 0, img.width, true);
    y = map(y, 0, width * ratio, 0, img.height, true);
  } else {
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

// Draw points store in array drawings
class DrawPoints {
  constructor(props) {
    console.log('DrawPoints props', props);
    Object.assign(this, props);
    this.version = 1;
    this.drawings = [];
    this.drawing_index = 0;
    this.points = null;
    this.npoints = 0;
    this.output = createGraphics(this.width, this.height);
    this.output.noFill();
  }

  prepareOutput() {
    if (!this.run) {
      return;
    }
    if (this.staticDrawing) {
      this.draw_points();
    }
    if (this.timedDrawing) {
      this.draw_timed();
    }
  }

  draw_points() {
    let args = {
      color: this.draw_color,
      strokeWeight: this.strokeWeight,
      stopIndex: this.npoints,
      xoffset: 0,
    };
    this.draw_to(args);
  }

  draw_timed() {
    let ncolors = this.draw_specs.length;
    let npoints = this.npoints;
    let now = secsTime() - this.startTime;
    // take lapse seconds n drawings
    let progress = now / (this.lapse / ncolors);
    //- take lapse seconds per single drawing
    //- let progress = now / this.lapse;
    let stopIndex = int(npoints * progress) % (npoints * ncolors);
    let spec = this.draw_specs[0];
    let stepper = (ipoint) => {
      if (ipoint % npoints == 0) {
        let icycle = args.icycle;
        let spec = this.draw_specs[icycle];
        // let str = formatNumber(progress);
        // str = str + ' ipoint ' + ipoint + ' stopIndex ' + stopIndex + ' strokeWeight ' + istrokeWeight;
        // str += ' icycle ' + icycle + ' icolor ' + icolor;
        // console.log(str);
        this.output.stroke(spec.color);
        this.output.strokeWeight(spec.strokeWeight);
        args.icycle = (args.icycle + 1) % ncolors;
      }
    };
    let args = {
      color: spec.color,
      strokeWeight: spec.strokeWeight,
      stopIndex: stopIndex,
      xoffset: this.xoffset,
      stepper: stepper,
      icycle: 0,
    };
    this.draw_to(args);
  }

  draw_to(args) {
    this.output.stroke(args.color);
    this.output.strokeWeight(args.strokeWeight);
    let stepper = args.stepper;
    let stopIndex = args.stopIndex;
    let xoffset = args.xoffset;
    let ipoint = 0;
    while (ipoint < stopIndex) {
      // Draw all points up until stopIndex
      for (let points of this.drawings) {
        for (let i = 1; i < points.length; i++) {
          if (ipoint > stopIndex) return;
          if (stepper) stepper(ipoint);
          let prev = points[i - 1];
          let point = points[i];
          this.lineFrom(point, prev, xoffset);
          ipoint++;
        }
      }
      // detect no change
      if (!ipoint) {
        console.log('stopIndex_draw No change ipoint', ipoint);
        break;
      }
    }
  }

  lineFrom(point, prev, xoffset) {
    this.output.line(prev.x + xoffset, prev.y, point.x + xoffset, point.y);
  }

  startTimedDraw() {
    // console.log('startTimedDraw');
    this.timedDrawing = 1;
    this.startTime = secsTime();
    this.calc_npoints();
    console.log('startTimedDraw this.npoints', this.npoints);
  }

  calc_npoints() {
    this.npoints = 0;
    for (let points of this.drawings) {
      this.npoints += points.length;
    }
  }

  stopTimedDraw() {
    console.log('stopTimedDraw');
    this.timedDrawing = 0;
  }

  clearDrawing() {
    console.log('clearDrawing');
    this.drawings = [];
    this.points = null;
    this.npoints = 0;
    this.timedDrawing = 0;
    this.output.clear();
    // this.save_drawing();
  }

  restore_drawing(urlParams) {
    // console.log('restore_drawing nstore |' + nstore + '|');
    let store;
    if (urlParams && urlParams.drawings) {
      store = this.restore_urlParams(urlParams);
    } else {
      store = this.restore_localStorage();
      if (!store) {
        store = { drawings: [] };
      }
    }
    this.expand_drawings(store);
    this.drawings = store.drawings;
    this.calc_npoints();
    this.output.clear();
    console.log('restore_drawing this.npoints', this.npoints);
    if (urlParams) {
      this.xoffset = 0;
      this.staticDrawing = 0;
      this.startTimedDraw();
    }
  }

  restore_urlParams(urlParams) {
    let store = { drawings: [] };
    if (urlParams.drawings) {
      let str = expand_decode(urlParams.drawings);
      try {
        store.drawings = JSON.parse(str);
      } catch (err) {
        console.log('restore_drawing drawings parse err', err);
        return;
      }
    }
    if (urlParams.save_label) {
      this.save_label = urlParams.save_label;
    }
    return store;
  }

  restore_localStorage() {
    let store;
    let str = localStorage.getItem(this.save_label);
    if (!str) return null;
    console.log('restore_drawing str.length', str.length);
    // this.drawings = JSON.parse(str);
    try {
      store = JSON.parse(str);
    } catch (err) {
      console.log('restore_drawing parse err', err);
      return;
    }
    return store;
  }

  save_drawing() {
    let store = this.prepareStore();
    let str = JSON.stringify(store);
    localStorage.setItem(this.save_label, str);
    console.log('save_drawing str.length', str.length);
    // Report full string size. Typically %50 more
    // let full = JSON.stringify(this.drawings);
    // console.log('save_drawing full.length', full.length);
  }

  prepareStore() {
    let store = {
      version: this.version,
      width: this.width,
      height: this.height,
      drawings: this.drawings,
    };
    this.shrink_drawings(store);
    return store;
  }

  save_to_url() {
    let store = this.prepareStore();
    let url = new URL(window.location.href);
    // url.search = '?store=' + encodeURIComponent(str);
    let str = '?label=' + encodeURIComponent(this.save_label);
    str += '&version=' + encodeURIComponent(this.version + '');
    str += '&width=' + encodeURIComponent(this.width + '');
    str += '&height=' + encodeURIComponent(this.height + '');
    let dstr = JSON.stringify(store.drawings);
    str += '&drawings=' + shrink_encode(dstr);
    url.search = str;
    console.log(url.href);
    window.location = url.href;
  }

  clear_url() {
    let index = window.location.href.indexOf('?');
    if (index < 0) return;
    let nhref = window.location.href.substring(0, index);
    location.replace(nhref);
  }

  // Transform drawings to delta array to save on stringify length
  // [{x: x0, y: y0}, {x: x1, y: y1}, {x: x2, y: y2} ...]
  //  --> [x0, y0, x1-x0, y1-y0, x2-x0, y2-y0 ...]
  shrink_drawings(store) {
    let x0;
    let y0;
    let d = store.drawings.map((arr) => {
      return arr.flatMap((item, index) => {
        if (index == 0) {
          x0 = item.x;
          y0 = item.y;
          return [x0, y0];
        }
        return [item.x - x0, item.y - y0];
      });
    });
    store.drawings = d;
  }

  expand_drawings(store) {
    // if (!store.version) return;
    let x0;
    let y0;
    let d = store.drawings.map((arr) => {
      let narr = [];
      for (let index = 0; index < arr.length; index += 2) {
        if (index == 0) {
          x0 = arr[0];
          y0 = arr[1];
          narr.push({ x: x0, y: y0 });
        } else {
          narr.push({ x: arr[index] + x0, y: arr[index + 1] + y0 });
        }
      }
      return narr;
    });
    store.drawings = d;
  }

  mouseDragged() {
    this.staticDrawing = 1;

    if (mouseX < 0 || mouseX > width || mouseY < 0 || mouseY > height) {
      return;
    }
    if (this.npoint_limit && this.npoints >= this.npoint_limit) {
      console.log('mouseDragged this.npoint_limit', this.npoint_limit, 'this.npoints', this.npoints);
      return;
    }
    if (!this.points) {
      this.points = [];
      this.drawings.push(this.points);
    }
    let x = int(mouseX);
    let y = int(mouseY);
    this.points.push({ x, y });
    this.npoints++;
  }

  // Save current drawing and prepare for next group of points
  mouseReleased() {
    console.log('DrawPoints mouseReleased');
    // null points will start fresh point array
    this.points = null;
    this.startTimedDraw();
    this.save_drawing();
  }
} // DrawPoints

// encode a few characters to reduce size of url &drawings= param
// {}[]:,"+
// --> mapped to upper case letters
// ABCDEFGHILKMNOPQRTSTUVWXYZ

let char0_index = 'A'.charCodeAt(0);
// let encode_chars = '{}[]:,"+';
let encode_chars = '[],:"+{}';
let encode_dict = {};
let decode_dict = {};
for (let index = 0; index < encode_chars.length; index++) {
  let ch1 = encode_chars[index];
  let ch2 = String.fromCharCode(index + char0_index);
  encode_dict[ch1] = ch2;
  decode_dict[ch2] = ch1;
}

function shrink_encode(str) {
  let nstr = '';
  let nch;
  for (let ch of str) {
    nch = encode_dict[ch];
    if (!nch) nch = ch;
    nstr += nch;
  }
  // console.log('shrink_encode nstr', nstr);
  return nstr;
}

function expand_decode(str) {
  let nstr = '';
  let nch;
  for (let ch of str) {
    nch = decode_dict[ch];
    if (!nch) nch = ch;
    nstr += nch;
  }
  // console.log('expand_decode nstr', nstr);
  return nstr;
}

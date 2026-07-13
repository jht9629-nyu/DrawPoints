//

function create_ui() {
  // Main controls container
  controlsDiv = createDiv('');
  // Position below the canvas
  controlsDiv.position(10, height - 100);
  controlsDiv.style('background', 'rgba(0,0,0,0.8)');
  controlsDiv.style('color', 'white');
  controlsDiv.style('padding', '15px');
  controlsDiv.style('border-radius', '8px');
  controlsDiv.style('font-family', 'Arial, sans-serif');

  // Title
  let title = createDiv(my.title);
  title.parent(controlsDiv);
  title.style('margin-bottom', '10px');

  // Button container
  let buttonDiv = createDiv('');
  buttonDiv.parent(controlsDiv);
  // buttonDiv.style('margin-top', '10px');

  create_selections(buttonDiv);

  create_buttons(buttonDiv);

  // create_sliders();
}

function create_selections(buttonDiv) {
  function addSelect(sel) {
    sel.parent(buttonDiv);
    add_buttonStyle(sel);
  }
  {
    let sel = createSelect();
    addSelect(sel);
    sel.option('rainbow');
    sel.option('video');
    sel.option('white');
    sel.option('red');
    sel.option('green');
    sel.option('gold');
    sel.input(function () {
      my.colorStyle = sel.selected();
      console.log('my.colorStyle', my.colorStyle);
    });
    sel.selected(my.colorStyle);
  }
  {
    let sel = createSelect();
    addSelect(sel);
    sel.option('none', 'none');
    sel.option('line', 'line');
    sel.option('spiral', 'spiral');
    sel.option('pixel', 'pixel');
    sel.input(function () {
      my.scanStyle = sel.selected();
      console.log('my.scanStyle', my.scanStyle);
    });
    sel.selected(my.scanStyle);
  }
  {
    let sel = createSelect();
    g_sel = sel;
    addSelect(sel);
    sel.option('pixel-1', 1);
    sel.option('pixel-2', 2);
    sel.option('pixel-4', 4);
    sel.option('pixel-8', 8);
    sel.option('pixel-12', 12);
    sel.option('pixel-16', 16);
    sel.option('pixel-24', 24);
    sel.option('pixel-32', 32);
    sel.option('pixel-40', 40);
    sel.option('pixel-48', 48);
    sel.input(function (event) {
      // console.log('event', event);
      g_event = event;
      // !!@ Not getting option name
      // my.sizeStyle = sel.selected();
      // use native elt to get option name
      my.sizeStyle = sel.elt.selectedOptions[0].innerText;
      strokeWeightValue = int(sel.value());
      console.log('my.sizeStyle', my.sizeStyle, 'strokeWeightValue', strokeWeightValue);
    });
    sel.selected(strokeWeightValue + '');
    // sel.selected(my.sizeStyle);
  }
}

// for debugging
let g_event;
let g_sel;

function add_buttonStyle(elt) {
  elt.style('background', '#4CAF50');
  elt.style('color', 'white');
  elt.style('border', 'none');
  elt.style('padding', '8px 16px');
  elt.style('margin', '5px');
  elt.style('border-radius', '4px');
  elt.style('cursor', 'pointer');
}

function create_buttons(buttonDiv) {
  function addButton(btn, mouseFunc) {
    btn.parent(buttonDiv);
    btn.mousePressed(mouseFunc);
    add_buttonStyle(btn);
  }

  // Full Screen button
  my.fullScreenButton = createButton('Full');
  addButton(my.fullScreenButton, fullScreen_action);

  // Clear button
  my.clearButton = createButton('Clear');
  addButton(my.clearButton, clearCanvas);

  // Auto draw toggle button
  my.autoButton = createButton('Auto Off');
  addButton(my.autoButton, toggleAutoDraw);

  my.eraseButton = createButton('Erase Off');
  addButton(my.eraseButton, toggleAutoErase);
}

//

function create_ui() {
  // Main controls container
  controlsDiv = DOM.let('div', {
    // Position below the canvas
    position: 'absolute',
    left: '10px',
    top: height - 80 + 'px',
    background: 'rgba(0,0,0,0.8)',
    color: 'white',
    padding: '15px',
    borderRadius: '8px',
    fontFamily: 'Arial, sans-serif',
  });
  document.body.append(controlsDiv);

  // Title
  controlsDiv.append(DOM.let('span', { text: my.title }));

  create_selections(controlsDiv);

  create_buttons(controlsDiv);

  // create_sliders();
}

function create_selections(parentDiv) {
  function addSelect(sel) {
    add_buttonStyle(sel);
    parentDiv.append(sel);
  }
  {
    let sel = DOM.let('select', {
      option: ['rainbow', 'video', 'white', 'red', 'green', 'gold'],
      onchange: (event) => {
        my.colorStyle = event.target.value;
        console.log('my.colorStyle', my.colorStyle);
      },
    });
    sel.value = my.colorStyle;
    addSelect(sel);
  }
  {
    let sel = DOM.let('select', {
      option: ['none', 'line', 'spiral', 'pixel'],
      onchange: (event) => {
        my.scanStyle = event.target.value;
        console.log('my.scanStyle', my.scanStyle);
      },
    });
    sel.value = my.scanStyle;
    addSelect(sel);
  }
  {
    let sizes = [1, 2, 4, 8, 12, 16, 24, 32, 40, 48];
    let sel = DOM.let('select', {
      option: sizes.map((n) => ({ text: 'pixel-' + n, value: n })),
      onchange: (event) => {
        // console.log('event', event);
        g_event = event;
        my.sizeStyle = event.target.selectedOptions[0].innerText;
        strokeWeightValue = int(event.target.value);
        console.log('my.sizeStyle', my.sizeStyle, 'strokeWeightValue', strokeWeightValue);
      },
    });
    sel.value = strokeWeightValue;
    g_sel = sel;
    addSelect(sel);
  }
}

// for debugging
let g_event;
let g_sel;

function add_buttonStyle(elt) {
  elt.set({
    background: '#4CAF50',
    color: 'white',
    border: 'none',
    padding: '8px 16px',
    margin: '5px',
    borderRadius: '4px',
    cursor: 'pointer',
  });
}

function create_buttons(parentDiv) {
  function addButton(text, onclick) {
    let btn = DOM.let('button', { text, onclick });
    add_buttonStyle(btn);
    parentDiv.append(btn);
    return btn;
  }

  // Full Screen button
  my.fullScreenButton = addButton('Full', fullScreen_action);

  // Clear button
  my.clearButton = addButton('Clear', clearCanvas);

  // Auto draw toggle button
  my.autoButton = addButton('Auto Off', toggleAutoDraw);

  my.eraseButton = addButton('Erase Off', toggleAutoErase);
}

//

function create_ui() {
  // !!@ Failes
  // const CSS = {
  //   'button,select': {
  //     background: '#4CAF50',
  //     color: 'white',
  //     border: 'none',
  //     padding: '8px 16px',
  //     margin: '5px',
  //     borderRadius: '4px',

  //     cursor: 'pointer',
  //   },
  // };
  // DOM.set({
  //   css: CSS,
  // });

  // !!@ try external css:
  // /Users/jht2/Documents/projects/repos/W-C-Art-Scroller/style.css

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

  // let innerControl = DOM.let('div', {
  //   background: '#4CAF50',
  //   color: 'white',
  //   border: 'none',
  //   padding: '8px 16px',
  //   margin: '5px',
  //   borderRadius: '4px',
  //   cursor: 'pointer',
  // });
  // controlsDiv.append(innerControl);

  create_selections(controlsDiv);

  create_buttons(controlsDiv);

  // create_sliders();
}

function create_selections(parentDiv) {
  function addSelect(sel) {
    // add_buttonStyle(sel);
    parentDiv.append(sel);
  }
  {
    let sel = DOM.let('select', {
      option: ['square', 'circle', 'triangle', 'hex'],
      onchange: (event) => {
        my.shapeLabel = event.target.value;
        console.log('my.shapeLabel', my.shapeLabel);
      },
      value: my.shapeLabel,
    });
    addSelect(sel);
  }
  if (0) {
    let sel = DOM.let('select', {
      option: ['rainbow', 'video', 'white', 'red', 'green', 'gold'],
      onchange: (event) => {
        my.colorStyle = event.target.value;
        console.log('my.colorStyle', my.colorStyle);
      },
      value: my.colorStyle,
    });
    // sel.value = my.colorStyle;
    addSelect(sel);
  }
  if (0) {
    let sel = DOM.let('select', {
      option: ['none', 'line', 'spiral', 'pixel'],
      onchange: (event) => {
        my.scanStyle = event.target.value;
        console.log('my.scanStyle', my.scanStyle);
      },
      value: my.scanStyle,
    });
    // sel.value = my.scanStyle;
    addSelect(sel);
  }
  {
    let sel = DOM.let('select', {
      option: [
        { text: 'Front', value: 'user' },
        { text: 'Back', value: 'environment' },
      ],
      onchange: (event) => {
        my.cameraFacing = event.target.value;
        console.log('my.cameraFacing', my.cameraFacing);
        create_capture();
      },
      value: my.cameraFacing,
    });
    addSelect(sel);
  }
  {
    let sizes = [1, 2, 4, 8, 12, 16, 24, 32, 40, 48, 64];
    let sel = DOM.let('select', {
      option: sizes.map((n) => ({ text: 'pixel-' + n, value: n })),
      onchange: (event) => {
        // console.log('event', event);
        // g_event = event;
        my.pixelSizeLabel = event.target.selectedOptions[0].innerText;
        my.pixelSize = int(event.target.value);
        console.log('my.pixelSizeLabel', my.pixelSizeLabel, 'my.pixelSize', my.pixelSize);
      },
      value: my.pixelSize,
    });
    // g_sel = sel;
    addSelect(sel);
  }
  {
    let sizes = [1, 2, 4, 8, 12, 16, 24, 32, 40, 48];
    let sel = DOM.let('select', {
      option: sizes.map((n) => ({ text: 'brush-' + n, value: n })),
      onchange: (event) => {
        my.brushSizeLabel = event.target.selectedOptions[0].innerText;
        my.brushSize = int(event.target.value);
        console.log('my.brushSizeLabel', my.brushSizeLabel, 'my.brushSize', my.brushSize);
      },
      value: my.brushSize,
    });
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
    // add_buttonStyle(btn);
    parentDiv.append(btn);
    return btn;
  }

  // Full Screen button
  my.fullScreenButton = addButton('Full', fullScreen_action);

  // Clear button
  my.clear1Button = addButton('Clear-1', clearLayer1);

  my.clear2Button = addButton('Clear-2', clearLayer2);

  // Auto draw toggle button
  // my.autoButton = addButton('Auto Off', toggleAutoDraw);

  // my._autoDrawOn is the Binder object
  Binder.set(my, { autoDrawOn: my.autoDrawOn });
  my.autoButton = addButton(
    // text, onclick
    my._autoDrawOn.as((value) => 'Auto ' + (value ? 'On' : 'Off')),
    () => (my.autoDrawOn = !my.autoDrawOn),
  );

  Binder.set(my, { scanFlag: my.scanFlag });
  my.scanButton = addButton(
    // text, onclick
    my._scanFlag.as((value) => 'Scan ' + (value ? 'On' : 'Off')),
    () => (my.scanFlag = !my.scanFlag),
  );

  my.saveButton = addButton('Save', saveButtonAction);
}

let saveCounter = 0;

function saveButtonAction() {
  // from chat-g
  const today = new Date();
  const dateString =
    `${today.getFullYear()}-` +
    `${String(today.getMonth() + 1).padStart(2, '0')}-` +
    `${String(today.getDate()).padStart(2, '0')}`;
  // console.log(dateString); // e.g. "2026-07-15"

  saveCounter++;
  let numStr = String(saveCounter).padStart(3, '0');

  saveCanvas('VideoDraw-baredom-' + dateString + '-' + numStr, 'jpg');
}

/*
    Binder.set(my, { eraseFlag: my.eraseFlag });
    my.eraseButton = addButton(
      // text, onclick
      my._eraseFlag.as((value) => 'Erase ' + (value ? 'On' : 'Off')),
      () => (my.eraseFlag = !my.eraseFlag),
    );
*/

// function toggleAutoDraw() {
//   my.autoDrawOn = !my.autoDrawOn;
//   my.autoButton.set({ text: 'Auto ' + (my.autoDrawOn ? 'On' : 'Off') });
// }

// function toggleAutoErase() {
//   my.eraseFlag = !my.eraseFlag;
//   my.eraseButton.set({ text: 'Erase ' + (my.eraseFlag ? 'On' : 'Off') });
// }

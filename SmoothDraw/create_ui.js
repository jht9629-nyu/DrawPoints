//

function create_ui() {
  // Main controls container
  controlsDiv = createDiv('');
  controlsDiv.position(10, height);
  controlsDiv.style('background', 'rgba(0,0,0,0.8)');
  controlsDiv.style('color', 'white');
  controlsDiv.style('padding', '15px');
  controlsDiv.style('border-radius', '8px');
  controlsDiv.style('font-family', 'Arial, sans-serif');

  // Title
  let title = createDiv(my.title);
  title.parent(controlsDiv);
  title.style('margin-bottom', '10px');

  create_selections();

  create_buttons();

  create_sliders();
}

function create_selections() {
  let selectionDiv = createDiv('');
  selectionDiv.parent(controlsDiv);

  function addSelect(sel) {
    sel.parent(selectionDiv);
    add_buttonStyle(sel);
  }
  {
    let sel = createSelect();
    addSelect(sel);
    sel.option('rainbow');
    sel.option('white');
    sel.option('video');
    sel.input(function () {
      my.colorStyle = sel.selected();
      console.log('my.colorStyle', my.colorStyle);
    });
    sel.selected(my.colorStyle);
  }
  {
    let sel = createSelect();
    addSelect(sel);
    sel.option('pixel');
    sel.option('line');
    sel.input(function () {
      my.penStyle = sel.selected();
      console.log('my.penStyle', my.penStyle);
    });
    sel.selected(my.penStyle);
  }
  {
    let sel = createSelect();
    addSelect(sel);
    sel.option('none');
    sel.option('walk');
    sel.option('line');
    sel.input(function () {
      my.scanStyle = sel.selected();
      console.log('my.scanStyle', my.scanStyle);
    });
    sel.selected(my.scanStyle);
  }
}

function add_buttonStyle(elt) {
  elt.style('background', '#4CAF50');
  elt.style('color', 'white');
  elt.style('border', 'none');
  elt.style('padding', '8px 16px');
  elt.style('margin', '5px');
  elt.style('border-radius', '4px');
  elt.style('cursor', 'pointer');
}

function create_buttons() {
  // Button container
  let buttonDiv = createDiv('');
  buttonDiv.parent(controlsDiv);
  // buttonDiv.style('margin-top', '10px');

  function addButton(btn, mouseFunc) {
    btn.parent(buttonDiv);
    btn.mousePressed(mouseFunc);
    add_buttonStyle(btn);
  }

  // Auto toggle button
  // autoButton = createButton('Auto Off');
  // addButton(autoButton, toggleAutoMode);

  // Full Screen button
  my.fullScreenButton = createButton('Full');
  addButton(my.fullScreenButton, fullScreen_action);

  // Clear button
  clearButton = createButton('Clear');
  addButton(clearButton, clearCanvas);

  // Thin button
  my.thinButton = createButton('Thin');
  addButton(my.thinButton, function () {
    strokeWeightValue = 1;
    strokeWeightSpan.html(strokeWeightValue);
  });

  // Thick button
  my.thickButton = createButton('Thick');
  addButton(my.thickButton, function () {
    strokeWeightValue = 10;
    strokeWeightSpan.html(strokeWeightValue);
  });

  // Smooth button
  my.smoothButton = createButton('Smooth');
  addButton(my.smoothButton, function () {
    smoothnessValue = 1.0;
    smoothnessSpan.html(smoothnessValue.toFixed(1));
  });

  // Rough button
  my.roughButton = createButton('Rough');
  addButton(my.roughButton, function () {
    smoothnessValue = 0.1;
    smoothnessSpan.html(smoothnessValue.toFixed(1));
  });
}

function create_sliders() {
  // Stroke weight controls
  let strokeDiv = createDiv('');
  strokeDiv.parent(controlsDiv);
  strokeDiv.style('margin', '8px 0');

  let strokeLabel = createSpan('Stroke Weight: ');
  strokeLabel.parent(strokeDiv);

  // createSlider(min, max, [value], [step])
  strokeWeightSlider = createSlider(1, 128, strokeWeightValue);
  strokeWeightSlider.parent(strokeDiv);
  strokeWeightSlider.style('margin', '0 10px');

  strokeWeightSpan = createSpan(strokeWeightValue + '');
  strokeWeightSpan.parent(strokeDiv);

  // Update stroke weight display when slider changes
  strokeWeightSlider.input(() => {
    strokeWeightValue = strokeWeightSlider.value();
    strokeWeightSpan.html(strokeWeightValue);
  });

  // Smoothness controls
  let smoothDiv = createDiv('');
  smoothDiv.parent(controlsDiv);
  smoothDiv.style('margin', '8px 0');

  let smoothLabel = createSpan('Smoothness: ');
  smoothLabel.parent(smoothDiv);

  // createSlider(min, max, [value], [step])
  smoothnessSlider = createSlider(1, 10, 10);
  smoothnessSlider.parent(smoothDiv);
  smoothnessSlider.style('margin', '0 10px');

  smoothnessSpan = createSpan(smoothnessValue.toFixed(1));
  smoothnessSpan.parent(smoothDiv);

  // Update smoothness display when slider changes
  smoothnessSlider.input(() => {
    smoothnessValue = smoothnessSlider.value() / 10; // Convert to 0.1-1.0 range
    smoothnessSpan.html(smoothnessValue.toFixed(1));
  });
}

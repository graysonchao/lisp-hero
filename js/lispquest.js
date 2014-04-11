var stage = new Kinetic.Stage({
  container: 'kinetic-container', // refers to a DOM node's id
  width: Lq.constants.STAGE_WIDTH,
  height: Lq.constants.STAGE_HEIGHT
});

// background layer
var bgLayer = new Kinetic.Layer();
var bg = new Kinetic.Rect({
  width: Lq.constants.STAGE_WIDTH,
  height: Lq.constants.STAGE_HEIGHT,
  x: 0,
  y: 0,
  fill: theme.base02
})
bgLayer.add(bg);

// rows for tokens
var rowLayer = new Kinetic.Layer();
rowLayer.disableHitGraph();

for (var i = 0; i < Lq.constants.NUM_ROWS; i++) {
  var row = new Kinetic.Group({
    width: Lq.constants.STAGE_WIDTH,
    height: Lq.constants.ROW_HEIGHT,
    x: 0,
    y: Math.floor(Lq.constants.ROW_HEIGHT * i),
  })
  var rowInner = new Kinetic.Rect({
    width: Lq.constants.STAGE_WIDTH,
    height: Lq.constants.ROW_HEIGHT - Lq.constants.ROW_PADDING,
    fill: theme.base03
  })

  var rowParenSelector = new Kinetic.Group({
    width: Lq.constants.SELECTOR_WIDTH,
    height: Lq.constants.ROW_HEIGHT - Lq.constants.ROW_PADDING,
    x: Lq.constants.SELECTOR_X
  });

  var rowParenBg = new Kinetic.Rect({
    width: Lq.constants.SELECTOR_WIDTH,
    height: Lq.constants.ROW_HEIGHT - Lq.constants.ROW_PADDING,
    fill: theme.base0
  });

  var rowParenParen = new Kinetic.Text({
    width: Lq.constants.SELECTOR_WIDTH,
    height: Lq.constants.ROW_HEIGHT - Lq.constants.ROW_PADDING,
    text: '(',
    align: "center",
    fill: "white",
    fontSize: Lq.constants.TOKEN_FONT_SIZE,
    fontFamily:'Courier New,Consolas,Liberation Mono,Bitstream Vera Sans Mono, DejaVu Sans Mono, monospace',
    x: -5 
  });

  rowParenSelector.add(rowParenBg);
  rowParenSelector.add(rowParenParen);
  row.add(rowInner);
  row.add(rowParenSelector);
  rowLayer.add(row);
}

var evalLayer   = new Kinetic.Layer();

var evalDisplay = new Kinetic.Group({
});

var evalRow = new Kinetic.Group({
  width: Lq.constants.STAGE_WIDTH,
  height: Lq.constants.ROW_HEIGHT,
  x: 0,
  y: Lq.constants.ROW_HEIGHT * Lq.constants.NUM_ROWS
});

var evalRect = new Kinetic.Rect({
  width: Lq.constants.STAGE_WIDTH,
  height: Lq.constants.ROW_HEIGHT - Lq.constants.ROW_PADDING,
  fill: 'blue',
  x: 0,
  y: 0
});

var evalText = new Kinetic.Text({
  width: Lq.constants.STAGE_WIDTH,
  height: Lq.constants.ROW_HEIGHT - Lq.constants.ROW_PADDING,
  fill: 'white',
  fontSize: Lq.constants.TOKEN_FONT_SIZE,
  fontFamily:'Courier New,Consolas,Liberation Mono,Bitstream Vera Sans Mono, DejaVu Sans Mono, monospace',
  text: ''
});

evalDisplay.add(evalRect);
evalDisplay.add(evalText);

Lq.evalText = evalText;

var tokensLayer = new Kinetic.Layer();

stage.add(bgLayer);
stage.add(rowLayer);
stage.add(tokensLayer);
stage.add(evalLayer);

Lq.evaluator = new Evaluator();
Lq.selector = new Selector(stage, rowLayer, tokensLayer, evalLayer, Lq.evaluator, evalText);

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

window.setInterval(Lq.spawnToken(tokensLayer), 1000);

bgLayer.draw();
rowLayer.draw();
evalLayer.draw();

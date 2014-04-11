// TODO Fix memory leak where you allocate hellza anonymous objects...

var Lq = (function() {
  var lq = {
    DEBUG: true,
    constants: {
      CONTAINER_ID: 'kinetic-container',
      STAGE_WIDTH: 720,
      STAGE_HEIGHT: 360,
      NUM_ROWS: 6, 
      ROW_PADDING: 10,
      SELECTOR_X: 20,
      SELECTOR_WIDTH: 60,
      SELECTOR_TOLERANCE: 20,
      TOKEN_FONT_SIZE: 48,
      TOKEN_SPEED: 240,
      TOKEN_POOL_SIZE: 36,
      COLORS: {
        solarizedDark: {
          base03:    '#002b36',
          base02:    '#073642',
          base01:    '#586e75',
          base00:    '#657b83',
          base0:     '#839496',
          base1:     '#93a1a1',
          base2:     '#eee8d5',
          base3:     '#fdf6e3',
          yellow:    '#b58900',
          orange:    '#cb4b16',
          red:       '#dc322f',
          magenta:   '#d33682',
          violet:    '#6c71c4',
          blue:      '#268bd2',
          cyan:      '#2aa198',
          green:     '#859900'
        }
      }
    },
    tokens: {
      values: [ '0', '1', '2', '3', '4', '5', '6', '7', '8', '9' ],
      ops:    [ '+', '-', '*', '/', '^', ],
    },
    tokenGrave: [],
    tokenPool: [],


    getEvaluator: function() {
      if (!(this.evaluator)) {
        this.evaluator = new Evaluator();
      }
      return this.evaluator();
    },

    getRandomInt: function getRandomInt(min, max) {
      return Math.floor(Math.random() * (max - min + 1)) + min;
    },

    spawnToken: function(layer) {

      if (Lq.tokenPool.length === 0) {
        Lq.tokenPool = [];
        var x = Lq.constants.STAGE_WIDTH;
        var y = Lq.constants.ROW_HEIGHT *
          Lq.getRandomInt(0, Lq.constants.NUM_ROWS - 1);

        var random = Lq.getRandomInt(0, 1);
        var tokenChar;
        if (random === 1) {
          var randomOp = Lq.getRandomInt(0, Lq.tokens.ops.length - 1);
          tokenChar = Lq.tokens.ops[randomOp];
        } else {
          var randomValue = Lq.getRandomInt(0, Lq.tokens.ops.length - 1);
          tokenChar = Lq.tokens.values[randomValue];
        }


        for (var i = 0; i < Lq.constants.TOKEN_POOL_SIZE; i++) {
          var token = new Token(tokenChar, x, y);
          Lq.tokenPool.push(token);
        }

      } else {
        var token = Lq.tokenPool.pop();
        layer.add(token);
        token.lqTween.play();
      }

      // Clean up Kinetic stage
      if (Lq.tokenGrave.length > Lq.constants.TOKEN_GRAVE_SIZE) {
        for (var i = 0; i < Lq.tokenGrave.length; i++) {
          Lq.tokenGrave[i].destroy();
        }
        Lq.tokenGrave = [];
      }
    }


  };

  lq.constants.ROW_HEIGHT = Math.floor((lq.constants.STAGE_HEIGHT) / lq.constants.NUM_ROWS);
  return lq;
})();

var theme = Lq.constants.COLORS.solarizedDark;

// Tokens stuff
var Token = function(token, x, y) {
  this.group = new Kinetic.Group({
    height: Lq.constants.ROW_HEIGHT,
    width: Lq.constants.SELECTOR_WIDTH,
    x: x,
    y: y,
    name: 'token'
  });

  this.rect = new Kinetic.Rect({
    height: Lq.constants.ROW_HEIGHT,
    width: Lq.constants.SELECTOR_WIDTH,
    x: 0,
    y: 0,
    fill: theme.base2
  });

  this.text = new Kinetic.Text({
    width: Lq.constants.SELECTOR_WIDTH,
    height: Lq.constants.ROW_HEIGHT - Lq.constants.ROW_PADDING,
    text: token,
    align: "center",
    fill: "red",
    fontSize: Lq.constants.TOKEN_FONT_SIZE,
    fontFamily:'Courier New,Consolas,Liberation Mono,Bitstream Vera Sans Mono, DejaVu Sans Mono, monospace',
  })

  this.lqTween = new Kinetic.Tween({
    node: this,
    duration: Math.floor(Lq.constants.STAGE_WIDTH / Lq.constants.TOKEN_SPEED),
    x: -1 * (Lq.constants.SELECTOR_WIDTH),
    onFinish: function() {
      Lq.tokensGrave.push(token); // to be destroy()'d
    }
  });

  this.group.add(this.rect);
  this.group.add(this.text);
  this.group.token = token;
  return this.group;
};

// Selector stuff

var Selector = function(stage, drawLayer, targetLayer, evalLayer, evaluator, evalText) {
  this.pos         = 0;
  this.stage       = stage; // the stage we're all on (not so to speak)
  this.drawLayer   = drawLayer; // the layer i'm on
  this.targetLayer = targetLayer; // the layer the tokens are on
  this.evalLayer   = evalLayer; // the layer to print evaluator text onto
  this.evaluator   = evaluator;
  this.evalText    = evalText;

  this.rect = new Kinetic.Rect({
    x: Lq.constants.SELECTOR_X,
    y: 0,
    width: Lq.constants.SELECTOR_WIDTH,
    height: Lq.constants.ROW_HEIGHT,
    fill: theme.base2
  });

  this.drawLayer.add(this.rect);

  this.moveDown = function() {
    if (this.pos < Lq.constants.NUM_ROWS - 1) {
      this.rect.position({
        x: this.rect.getAttr("x"),
        y: this.rect.getAttr("y") + Lq.constants.ROW_HEIGHT,
      })
      this.pos++;
      this.drawLayer.draw();
    }
  };

  this.moveUp = function() {
    if (this.pos > 0) {
      this.rect.position({
        x: this.rect.getAttr("x"),
        y: this.rect.getAttr("y") - Lq.constants.ROW_HEIGHT,
      })
      this.pos--;
      this.drawLayer.draw();
    }
  };

  this.grab = function() {
    var leftEdge = this.rect.getAttr("x");
    var bottomEdge = this.rect.getAttr("y");
    var done = false;
    this.targetLayer.find('.token').each(function(token, i) {
      if (!done) { // soo annoying. TODO: replace this with a native for.
        if (token.getAttr("x") < (Lq.constants.SELECTOR_X +
                                  Lq.constants.SELECTOR_TOLERANCE) && token.getAttr("y") === bottomEdge) {
          Lq.evaluator.push(token.token);
        Lq.controller.score();
        token.destroy();
        if (Lq.DEBUG) {
          Lq.evaluator.print();
        }
        done = true;
        } 
      }
    });
  };
};

// Evaluator stuff

var Evaluator = function() {

  // A node of the tree built by tokens so far
  var EvalNode = function(token, left, right) {
    this.token = token;
    this.left = left;
    this.right = right;

    this.isValue = function() {
      return (Lq.tokens.values.indexOf(this.token.toString()) !== -1);
    }

    this.isOp = function() {
      return (Lq.tokens.ops.indexOf(this.token) !== -1);
    }

    // Add an EvalNode to the evaluation tree starting at me
    this.add = function(node) {
      // Numbers can't have kids (sad)
      if (this.isValue())
        return false;

      // if this is a sentinel node, it has the "real" root of the tree on its left.
      if (this.token === 'S') {
        // Pass it to my child
        if (this.left) {
          return this.left.add(node);
        } else {
          // Can't start with a number
          if (node.isValue()) {
            return false;
          }
          this.left = node;
          return true; // Make it my child
        }
      }

      // try to add to left first then try to add to right.
      if (!(this.left)) {
        this.left = node;
        return true;
      } else if (!(this.right)) {
        this.right = node;
        return true;
      } else {
        // try to add to the left or fall back to the right
        if (!(this.left.add(node))) {
          return this.right.add(node);
        } else {
          return true
        }
      }
      return false;
    }

    this.eval = function() {

      // Call me... the Jank Sentinel
      if (this.token === 'S') {
        if (this.left) {
          return this.left.eval();
        } else {
          return 0;
        }
      }

      if (this.isValue()) {
        return parseInt(this.token, 10);
      } else if (this.isOp() && this.left && this.right) {

        if (this.token === "+") {
          return this.left.eval() + this.right.eval();

        } else if (this.token === "-") {
          return this.left.eval() - this.right.eval();

        } else if (this.token === "*") {
          return this.left.eval() * this.right.eval();

        } else if (this.token === "/") {
          return this.left.eval() / this.right.eval();

        } else if (this.token === "^") {
          return Math.pow(this.left.eval(), this.right.eval());
        }
      } else {
        return 0;
      }
    }

    this.print = function() {
      var left = ' ';
      var right = ' ';

      if (this.left) {
        left = this.left.print();
      }

      if (this.right) {
        right = this.right.print();
      }

      if (this.token === 'S')  {
        if (this.left) {
          return left;
        }
        return '(';
      }

      if (this.isOp()) {
        return '( ' + this.token + ' ' + left + ' ' + right + ' ' + ')';
      }

      if (this.isValue()) {
        return '' + this.token;
      }

    }
  }

  this.sentinel = new EvalNode('S');

  // Add a token to the evaluation tree
  this.push = function(token) {
    return this.sentinel.add(new EvalNode(token));
  };

  // Print me like this:
  // ( + 2 ( + ( * 1 2 ) ( + 3 4 ) ) )
  this.print = function() {
    return this.sentinel.print();
  };

  this.eval = function() {
    return this.sentinel.eval();
  };
};

// for my edimificianatnation
var testEvaluator = function() {
  var e = new Evaluator();
  e.push('+');
  e.push('2');
  e.push('*');
  e.push('3');
  e.push('*');
  e.push('4');
  e.push('*');
  e.push('5');
  e.push('*');
  e.push('6');
  e.push('*');
  e.push('7');
  e.push('8');
  console.log(e.eval());
  console.log(e.print());
}

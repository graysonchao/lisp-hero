var LispquestController = function() {

  this.maxScore = 0;

  // score Lq.evaluator
  this.score = function() {

    var e = Lq.evaluator;
    var score = e.eval();

    // tree is fucked up
    if (!(isNaN(score))) {
      if (score > this.maxScore && score != Infinity) {
        this.maxScore = score;
      }
      document.getElementById("max-score").innerHTML = this.maxScore.toString();
      Lq.evaluator = new Evaluator();
      e = Lq.evaluator;
    }
    document.getElementById("evaluator").innerHTML = e.print();
    document.getElementById("score").innerHTML = '0';
  }
}

function doKeyDown(evt){
  switch (evt.keyCode) {
    case 65: // a
      Lq.selector.moveUp();
    break;
    case 90: // z
      Lq.selector.moveDown();
    break;
    case 186: // ;
      Lq.selector.rect.setAttr("fill", "red");
    Lq.selector.drawLayer.draw();
    Lq.selector.grab();
    break;
    break;
  }
}

function doKeyUp(evt){
  switch (evt.keyCode) {
    case 65: // a
      break;
    case 90: // z
      break;
    case 186: // ;
      Lq.selector.rect.setAttr("fill", "yellow");
    Lq.selector.drawLayer.draw();
    break;
    break;
  }
}
window.addEventListener('keydown', doKeyDown, true);
window.addEventListener('keyup', doKeyUp, true);

Lq.controller = new LispquestController();

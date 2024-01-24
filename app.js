class InfiniteCanvas {
  constructor(cellSize = 40) {
    this.app = new PIXI.Application({
      width: window.innerWidth,
      height: window.innerHeight,
      backgroundColor: 0xeeeeee,
    });
    
    document.body.appendChild(this.app.view);

    this.cellSize = cellSize;
    this.scale = 1;
    this.offsetX = 0;
    this.offsetY = 0;
    this.touchMode = "single";
    this.prevTouch = [null, null];

    this.setupEvents();

    this.draw();
  }

  toVirtualX(xReal) {
    return (xReal + this.offsetX) * this.scale;
  }

  toVirtualY(yReal) {
    return (yReal + this.offsetY) * this.scale;
  }

  toRealX(xVirtual) {
    return xVirtual / this.scale - this.offsetX;
  }

  toRealY(yVirtual) {
    return yVirtual / this.scale - this.offsetY;
  }

  virtualHeight() {
    return (this.app.renderer.screen.height || 0) / this.scale;
  }

  virtualWidth() {
    return (this.app.renderer.screen.width || 0) / this.scale;
  }

  zoom(amount) {
    this.scale *= amount;
    this.draw();
  }

  offsetLeft(amount) {
    this.offsetX -= amount;
    this.draw();
  }

  offsetRight(amount) {
    this.offsetX += amount;
    this.draw();
  }

  offsetUp(amount) {
    this.offsetY -= amount;
    this.draw();
  }

  offsetDown(amount) {
    this.offsetY += amount;
    this.draw();
  }

  draw() {
    this.drawGrid();
  }

  setupEvents() {
    this.app.view.addEventListener("touchstart", (event) =>
      this.onTouchStart(event.touches)
    );
    this.app.view.addEventListener("touchmove", (event) =>
      this.onTouchMove(event.touches)
    );
    window.addEventListener("resize", () => this.draw());
    const buttons = {
      right: document.getElementById('right'),
      left: document.getElementById('left'),
      up: document.getElementById('up'),
      down: document.getElementById('down'),
      in: document.getElementById('in'),
      out: document.getElementById('out'),
    };

    Object.values(buttons).forEach(button => {
      button.addEventListener('click', (event) => this.handleButtonClick(event));
    });
  }

  handleButtonClick(event) {
    const { id } = event.target;
    const speed = 10; // Adjust the speed as needed

    switch (id) {
      case 'right':
        this.offsetRight(speed);
        break;
      case 'left':
        this.offsetLeft(speed);
        break;
      case 'up':
        this.offsetUp(speed);
        break;
      case 'down':
        this.offsetDown(speed);
        break;
      case 'in':
        this.zoom(1.1);
        break;
      case 'out':
        this.zoom(0.9);
        break;
      default:
        break;
    }
  }




  

  drawGrid() {
    const graphics = new PIXI.Graphics();
    graphics.lineStyle(1, 0xA9A9A9);

    const width = this.app.renderer.screen.width;
    const height = this.app.renderer.screen.height;

    for (
      let x = (this.offsetX % this.cellSize) * this.scale;
      x <= width;
      x += this.cellSize * this.scale
    ) {
      graphics.moveTo(x, 0);
      graphics.lineTo(x, height);
    }

    for (
      let y = (this.offsetY % this.cellSize) * this.scale;
      y <= height;
      y += this.cellSize * this.scale
    ) {
      graphics.moveTo(0, y);
      graphics.lineTo(width, y);
    }

    this.app.stage.removeChildren();
    this.app.stage.addChild(graphics);
  }
}

// Usage example:
const infiniteCanvas = new InfiniteCanvas();
infiniteCanvas.draw();  
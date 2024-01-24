class InfiniteCanvas {
  constructor(cellSize = 40) {
    this.app = new PIXI.Application({
      width: window.innerWidth,
      height: window.innerHeight,
      backgroundColor: 0xeeeeee,
    });
    this.gameOfLifeMatrix = null;
    document.body.appendChild(this.app.view);

    this.cellSize = cellSize;
    this.scale = 1;
    this.offsetX = 0;
    this.offsetY = 0;
    this.cellGraphics = [];


    this.socket = new WebSocket('ws://localhost:3000');

  
    this.socket.addEventListener('message', (event) => {
      const data = JSON.parse(event.data);
      this.setGameOfLifeMatrix(data.matrix);
    });

  
    this.socket.addEventListener('open', () => {
      this.setupEvents();
    });

    this.draw();
  }
  setGameOfLifeMatrix(matrix) {
    this.gameOfLifeMatrix = matrix;
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
    this.drawGameOfLifeCells();
    this.socket.send(JSON.stringify({ message: 'DrawingFinished' }));
  }
  drawGameOfLifeCells() {
    const baseCellSize = 64; 

   
    const cellSize = baseCellSize * this.scale;

   
    this.cellGraphics.forEach(graphics => this.app.stage.removeChild(graphics));
    this.cellGraphics = [];

    if (this.gameOfLifeMatrix) {
        for (let row = 0; row < this.gameOfLifeMatrix.length; row++) {
            for (let col = 0; col < this.gameOfLifeMatrix[row].length; col++) {
                if (this.gameOfLifeMatrix[row][col] === 1) {
                    const sprite = new PIXI.Sprite.from("cell.jpeg"); 
                    sprite.width = cellSize;
                    sprite.height = cellSize;
                    sprite.x = this.toVirtualX(col * cellSize);
                    sprite.y = this.toVirtualY(row * cellSize);
                    this.app.stage.addChild(sprite);
                    this.cellGraphics.push(sprite);
                }
            }
        }
    }
}
  
  



  setupEvents() {
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
    
    this.app.view.addEventListener("wheel", (event) => this.handleZoom(event));
    this.socket.addEventListener('message', (event) => {
      const data = JSON.parse(event.data);

     
      if (data.message === 'DrawingFinished') {
       
        this.socket.send(JSON.stringify({ requestNextMatrix: true }));
      } else {
       
        this.setGameOfLifeMatrix(data.matrix);
      }
    });
  }
  handleZoom(event) {
    const zoomSpeed = 0.1; 
    const delta = event.deltaY > 0 ? 1 : -1; 

   
    const preZoomCursorX = event.clientX;
    const preZoomCursorY = event.clientY;

    
    const preZoomVirtualX = this.toVirtualX(preZoomCursorX);
    const preZoomVirtualY = this.toVirtualY(preZoomCursorY);

    
    const zoomFactor = delta === 1 ? 1 - zoomSpeed : 1 + zoomSpeed;

    
    this.zoom(zoomFactor);

    
    const postZoomCursorX = event.clientX;
    const postZoomCursorY = event.clientY;

   
    const postZoomVirtualX = this.toVirtualX(postZoomCursorX);
    const postZoomVirtualY = this.toVirtualY(postZoomCursorY);

   
    this.offsetX += postZoomVirtualX - preZoomVirtualX;
    this.offsetY += postZoomVirtualY - preZoomVirtualY;

    event.preventDefault(); 
}

  

  handleButtonClick(event) {
    const { id } = event.target;
    const speed = 10;

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
  
    this.app.stage.removeChildren();
  
 
    const texture = PIXI.Texture.from("texture.jpeg"); 
    const tilingSprite = new PIXI.TilingSprite(texture, this.app.renderer.screen.width, this.app.renderer.screen.height);
  
  
    tilingSprite.tilePosition.x = -this.offsetX * this.scale;
    tilingSprite.tilePosition.y = -this.offsetY * this.scale;
  
 
    tilingSprite.tileScale.x = this.scale;
    tilingSprite.tileScale.y = this.scale;
  
  
    this.app.stage.addChild(tilingSprite);
  }
}


const infiniteCanvas = new InfiniteCanvas();
 

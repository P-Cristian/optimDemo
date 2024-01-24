const WebSocket = require('ws');
const http = require('http');
const fs = require('fs');

const matrixSize = 64;
const density = 0.1;

let mainMatrix = initializeMatrix(matrixSize, matrixSize);

randomizeMatrix(mainMatrix, density);

const server = http.createServer((req, res) => {
  if (req.url === '/') {
    fs.readFile('./index.html', 'utf8', (err, data) => {
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(data);
    });
  }
});

const wss = new WebSocket.Server({ server });
wss.on('connection', (socket) => {

  socket.send(JSON.stringify({ matrix: mainMatrix }));

  let drawingFinished = false;

  socket.addEventListener('message', (event) => {
    const data = JSON.parse(event.data);

    if (data.message === 'DrawingFinished') {
     
      drawingFinished = true;

      
      if (drawingFinished && mainMatrix) {
        
        const resultMatrix = simulateLife(mainMatrix);
        mainMatrix = resultMatrix;

       
        socket.send(JSON.stringify({ matrix: mainMatrix }));

        
        drawingFinished = false;
      }
    }
  });
});

server.listen(3000, () => {
  console.log('Server is running on port 3000');
});

function initializeMatrix(rows, cols) {
  const matrix = [];
  for (let i = 0; i < rows; i++) {
    matrix.push(Array(cols).fill(0));
  }
  return matrix;
}

function randomizeMatrix(matrix, density) {
  const rows = matrix.length;
  const cols = matrix[0].length;

  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      matrix[i][j] = Math.random() < density ? 1 : 0;
    }
  }
}

function countNeighbors(matrix, row, col) {
  const rows = matrix.length;
  const cols = matrix[0].length;

  let count = 0;

  for (let i = -1; i <= 1; i++) {
    for (let j = -1; j <= 1; j++) {
      const newRow = row + i;
      const newCol = col + j;

      if (newRow >= 0 && newRow < rows && newCol >= 0 && newCol < cols) {
        count += matrix[newRow][newCol];
      }
    }
  }

  count -= matrix[row][col];
  return count;
}

function updateCell(matrix, newRow, newCol) {
  const neighbors = countNeighbors(matrix, newRow, newCol);
  const currentValue = matrix[newRow][newCol];

  if (currentValue === 1 && (neighbors < 2 || neighbors > 3)) {
   
    return 0;
  } else if (currentValue === 0 && neighbors === 3) {
    
    return 1;
  } else {
   
    return currentValue;
  }
}

function simulateLife(matrix) {
  const newMatrix = initializeMatrix(matrixSize, matrixSize);

  for (let row = 0; row < matrixSize; row++) {
    for (let col = 0; col < matrixSize; col++) {
      newMatrix[row][col] = updateCell(matrix, row, col);
    }
  }

  return newMatrix;
}

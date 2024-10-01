const board = document.getElementById('tetris');
const scoreDisplay = document.getElementById('score');
const startGameButton = document.getElementById('startGame');
const pauseGameButton = document.getElementById('pauseGame');
let isPaused = false;

const ROWS = 20;
const COLS = 10;
const boardState = Array.from({ length: ROWS }, () => Array(COLS).fill(null)); 
let score = 0;
let currentPiece;
let currentPosition = { x: 0, y: 0 };
let dropInterval;
let dropSpeed = 1000; 

const pieces = [
    { shape: [[1, 1, 1, 1]], color: 'rgba(255, 87, 51, 0.8)' }, 
    { shape: [[1, 1, 1], [0, 1, 0]], color: 'rgba(255, 189, 51, 0.8)' },
    { shape: [[1, 1, 0], [0, 1, 1]], color: 'rgba(51, 255, 87, 0.8)' }, 
    { shape: [[0, 1, 1], [1, 1, 0]], color: 'rgba(51, 87, 255, 0.8)' }, 
    { shape: [[1, 1], [1, 1]], color: 'rgba(168, 51, 255, 0.8)' }, 
    { shape: [[1, 1, 1], [1, 0, 0]], color: 'rgba(255, 51, 168, 0.8)' }, 
    { shape: [[1, 1, 1], [0, 0, 1]], color: 'rgba(51, 255, 168, 0.8)' } 
];

function startGame() {
    board.innerHTML = '';
    boardState.forEach(row => row.fill(null)); 
    score = 0;
    updateScore();
    createBoard();
    createPiece();
    dropSpeed = 1000; 
    dropInterval = setInterval(dropPiece, dropSpeed);
}

pauseGameButton.addEventListener('click', () => {
    if (isPaused) {
        resumeGame();
    } else {
        pauseGame();
    }
});

function pauseGame() {
    clearInterval(dropInterval); 
    isPaused = true; 
    pauseGameButton.textContent = 'Reanudar'; 
}

function resumeGame() {
    dropInterval = setInterval(dropPiece, dropSpeed); 
    isPaused = false; 
    pauseGameButton.textContent = 'Pausar'; 
}

function createBoard() {
    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            board.appendChild(cell);
        }
    }
}

function createPiece() {
    const randomIndex = Math.floor(Math.random() * pieces.length);
    currentPiece = pieces[randomIndex];
    currentPosition = { x: Math.floor(COLS / 2) - Math.floor(currentPiece.shape[0].length / 2), y: 0 };

    if (collides()) {
        clearInterval(dropInterval);
        alert('Juego Terminado. Tu puntuación fue: ' + score);
    }
}

function collides(offsetX = 0, offsetY = 0) {
    for (let r = 0; r < currentPiece.shape.length; r++) {
        for (let c = 0; c < currentPiece.shape[0].length; c++) {
            if (currentPiece.shape[r][c] > 0) {
                const newX = currentPosition.x + c + offsetX;
                const newY = currentPosition.y + r + offsetY;

                if (newX < 0 || newX >= COLS || newY >= ROWS || (newY >= 0 && boardState[newY][newX] !== null)) { 
                    return true;
                }
            }
        }
    }
    return false;
}

function mergePiece() {
    for (let r = 0; r < currentPiece.shape.length; r++) {
        for (let c = 0; c < currentPiece.shape[0].length; c++) {
            if (currentPiece.shape[r][c] > 0) {
                boardState[currentPosition.y + r][currentPosition.x + c] = currentPiece.color;
            }
        }
    }
    removeFullRows();
}

function removeFullRows() {
    let rowsToRemove = [];

    for (let r = 0; r < ROWS; r++) {
        if (boardState[r].every(cell => cell !== null)) { 
            rowsToRemove.push(r);
        }
    }

    if (rowsToRemove.length > 0) {
        rowsToRemove.forEach((rowIndex) => {
            boardState.splice(rowIndex, 1); 
            boardState.unshift(Array(COLS).fill(null)); 
        });

        score += rowsToRemove.length * 100; 
        updateScore();
        adjustSpeed(); 
    }
}

function dropPiece() {
    if (!collides(0, 1)) {
        currentPosition.y++;
    } else {
        mergePiece();
        createPiece(); 
    }
    draw();
}

function draw() {
    const cells = document.querySelectorAll('.cell');

    
    cells.forEach((cell, index) => {
        const row = Math.floor(index / COLS);
        const col = index % COLS;
        cell.classList.remove('filled');
        cell.style.backgroundColor = ''; 

        if (boardState[row][col] !== null) {
            cell.classList.add('filled');
            cell.style.backgroundColor = boardState[row][col];
        } else {
            cell.style.backgroundColor = 'rgba(0, 0, 0, 0.5)'; 
        }
    });

    for (let r = 0; r < currentPiece.shape.length; r++) {
        for (let c = 0; c < currentPiece.shape[0].length; c++) {
            if (currentPiece.shape[r][c] > 0) {
                const drawX = currentPosition.x + c;
                const drawY = currentPosition.y + r;

                if (drawY >= 0) { 
                    const cell = cells[drawY * COLS + drawX];
                    cell.classList.add('filled');
                    cell.style.backgroundColor = currentPiece.color; 
                }
            }
        }
    }
}

function removeCompleteRows() {
    for (let r = ROWS - 1; r >= 0; r--) {
        if (boardState[r].every(cell => cell !== null)) {
            boardState.splice(r, 1); 
            boardState.unshift(Array(COLS).fill(null)); 
            score += 100; 
        }
    }
}



function updateScore() {
    scoreDisplay.textContent = 'Puntuación: ' + score;
}

function adjustSpeed() {
    if (score >= 1000) {
        dropSpeed = 300; 
    } else if (score >= 800) {
        dropSpeed = 400; 
    } else if (score >= 600) {
        dropSpeed = 500; 
    } else if (score >= 400) {
        dropSpeed = 600; 
    } else if (score >= 200) {
        dropSpeed = 700; 
    }

    clearInterval(dropInterval);
    dropInterval = setInterval(dropPiece, dropSpeed);
}

function rotatePiece() {
    const originalShape = currentPiece.shape;
    const rotatedShape = originalShape[0].map((_, index) => originalShape.map(row => row[index])).reverse();
    
    const originalPiece = currentPiece;
    currentPiece.shape = rotatedShape;

    if (collides()) {
        currentPiece = originalPiece; 
    }
}

function handleTouchStart(event) {
    const touch = event.touches[0];
    lastTouchX = touch.clientX;
    lastTouchY = touch.clientY;
}

function handleTouchMove(event) {
    const touch = event.touches[0];
    const deltaX = touch.clientX - lastTouchX;
    const deltaY = touch.clientY - lastTouchY;

    if (Math.abs(deltaX) > Math.abs(deltaY)) {
        if (deltaX > 0) {
            if (!collides(1, 0)) {
                currentPosition.x++;
            }
        } else {
            if (!collides(-1, 0)) {
                currentPosition.x--;
            }
        }
    } else {
        if (deltaY > 0) {
            dropPiece();
        }
    }

    lastTouchX = touch.clientX;
    lastTouchY = touch.clientY;
    draw();
}

let lastTouchX, lastTouchY;
document.addEventListener('touchstart', handleTouchStart);
document.addEventListener('touchmove', handleTouchMove);

document.addEventListener('keydown', (event) => {
    switch (event.key) {
        case 'ArrowLeft':
            if (!collides(-1, 0)) {
                currentPosition.x--;
            }
            break;
        case 'ArrowRight':
            if (!collides(1, 0)) {
                currentPosition.x++;
            }
            break;
        case 'ArrowDown':
            dropPiece();
            break;
        case 'ArrowUp':
            rotatePiece();
            break;
    }
    draw();
});

startGameButton.addEventListener('click', startGame);
startGame();

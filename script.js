const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');
const gameOverScreen = document.getElementById('gameOver');
const finalScoreEl = document.getElementById('finalScore');
const restartBtn = document.getElementById('restartBtn');

// Grid and Cell Settings
const COLS = 100; // 100 columns
const ROWS = 50;  // 50 rows
const CELL_SIZE = 10; // each cell is 10x10 pixels
// canvas is 1000x500

// Direction mappings (dx, dy)
const DIRS = {
    ArrowUp: { x: 0, y: -1 },
    ArrowDown: { x: 0, y: 1 },
    ArrowLeft: { x: -1, y: 0 },
    ArrowRight: { x: 1, y: 0 }
};

let snake = [];
let dir = { x: 1, y: 0 };
let nextDir = { x: 1, y: 0 };
let fruit = { x: 0, y: 0 };
let score = 0;
let gameLoop;
let isGameOver = false;

// Game speed in ms per frame
const GAME_SPEED = 100;

function init() {
    // Initial size 1*3 (which means length 3). Let's put it in the middle.
    const startX = Math.floor(COLS / 2);
    const startY = Math.floor(ROWS / 2);

    snake = [
        { x: startX, y: startY },
        { x: startX - 1, y: startY },
        { x: startX - 2, y: startY }
    ];

    dir = { x: 1, y: 0 };
    nextDir = { x: 1, y: 0 };
    score = 0;
    scoreEl.innerText = score;
    isGameOver = false;
    gameOverScreen.style.display = 'none';

    spawnFruit();

    if (gameLoop) clearInterval(gameLoop);
    gameLoop = setInterval(update, GAME_SPEED);
}

function spawnFruit() {
    let valid = false;
    while (!valid) {
        fruit.x = Math.floor(Math.random() * COLS);
        fruit.y = Math.floor(Math.random() * ROWS);

        valid = true;
        for (let i = 0; i < snake.length; i++) {
            if (snake[i].x === fruit.x && snake[i].y === fruit.y) {
                valid = false;
                break;
            }
        }
    }
}

function update() {
    if (isGameOver) return;

    dir = nextDir;

    // Calculate new head
    let head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };

    // Wrap around logic
    if (head.x < 0) head.x = COLS - 1;
    else if (head.x >= COLS) head.x = 0;

    if (head.y < 0) head.y = ROWS - 1;
    else if (head.y >= ROWS) head.y = 0;

    // Self collision
    for (let i = 0; i < snake.length - 1; i++) {
        if (snake[i].x === head.x && snake[i].y === head.y) {
            handleGameOver();
            return;
        }
    }

    snake.unshift(head); // Add new head

    // Check fruit eating
    if (head.x === fruit.x && head.y === fruit.y) {
        score++;
        scoreEl.innerText = score;
        spawnFruit();
    } else {
        snake.pop(); // Remove tail if no fruit eaten
    }

    draw();
}

function draw() {
    // Clear background
    ctx.fillStyle = '#0f3460';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw Fruit
    ctx.fillStyle = '#e94560'; // Vibrant red/pink
    ctx.beginPath();
    ctx.arc(
        fruit.x * CELL_SIZE + CELL_SIZE / 2,
        fruit.y * CELL_SIZE + CELL_SIZE / 2,
        CELL_SIZE / 2 - 1,
        0,
        Math.PI * 2
    );
    ctx.fill();

    // Draw Snake
    for (let i = 0; i < snake.length; i++) {
        const segment = snake[i];

        // Head is a different color
        if (i === 0) {
            ctx.fillStyle = '#4ade80'; // Bright green for head
        } else {
            ctx.fillStyle = '#22c55e'; // Green for body
        }

        // Add slightly smaller rect for gap between segments
        ctx.fillRect(
            segment.x * CELL_SIZE + 1,
            segment.y * CELL_SIZE + 1,
            CELL_SIZE - 2,
            CELL_SIZE - 2
        );

        // Connect segments for a smoother look
        if (i > 0) {
            const prev = snake[i - 1];
            // Only connect if they are adjacent (ignoring wrap around connection for simplicity)
            if (Math.abs(segment.x - prev.x) <= 1 && Math.abs(segment.y - prev.y) <= 1) {
                const minX = Math.min(segment.x, prev.x);
                const minY = Math.min(segment.y, prev.y);
                const isHorizontal = segment.y === prev.y;

                if (isHorizontal) {
                    ctx.fillRect(minX * CELL_SIZE + CELL_SIZE - 1, segment.y * CELL_SIZE + 1, 2, CELL_SIZE - 2);
                } else {
                    ctx.fillRect(segment.x * CELL_SIZE + 1, minY * CELL_SIZE + CELL_SIZE - 1, CELL_SIZE - 2, 2);
                }
            }
        }
    }
}

function handleGameOver() {
    isGameOver = true;
    clearInterval(gameLoop);
    finalScoreEl.innerText = score;
    gameOverScreen.style.display = 'block';
}

window.addEventListener('keydown', e => {
    // Prevent default scrolling for arrow keys
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
    }

    if (DIRS[e.key]) {
        const newDir = DIRS[e.key];
        // Prevent 180 degree turns
        if (dir.x !== 0 && newDir.x !== 0) return;
        if (dir.y !== 0 && newDir.y !== 0) return;

        nextDir = newDir;
    }
});

restartBtn.addEventListener('click', init);

// Start game
init();

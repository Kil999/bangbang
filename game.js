const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const healthBar1 = document.getElementById('healthBar1');
const healthBar2 = document.getElementById('healthBar2');
const healthBarContainer = document.querySelector('.health-bar-container');
const player1HealthBar = document.getElementById('player1HealthBar');
const player2HealthBar = document.getElementById('player2HealthBar');
const joystickContainer = document.getElementById('joystick-container');
const joystick = document.getElementById('joystick');

const player1 = { x: 50, y: 300, width: 20, height: 20, color: 'blue', speed: 5, bullets: [], health: 5, dx: 0, dy: 0 };
const player2 = { x: 730, y: 300, width: 20, height: 20, color: 'red', speed: 5, bullets: [], health: 5, isBot: true };

let gameStarted = false;
let joystickData = { active: false, initialX: 0, initialY: 0, currentX: 0, currentY: 0 };

function resetGame() {
    player1.x = 50;
    player1.y = 300;
    player1.health = 5;
    player1.bullets = [];
    player1.dx = 0;
    player1.dy = 0;

    player2.x = 730;
    player2.y = 300;
    player2.health = 5;
    player2.bullets = [];

    updateHealthBars();

    clearInterval(botShootInterval);
    botShootInterval = setInterval(() => {
        if (player2.isBot && player2.health > 0) {
            shootBullet(player2);
        }
    }, 1000);
}

function updateHealthBars() {
    healthBar1.textContent = `Player 1 Health: ${player1.health}`;
    healthBar2.textContent = `Player 2 Health: ${player2.health}`;

    player1HealthBar.style.width = (player1.health / 5) * 100 + '%';
    player2HealthBar.style.width = (player2.health / 5) * 100 + '%';
}

function drawPlayer(player) {
    if (player.health > 0) {
        ctx.fillStyle = player.color;
        ctx.fillRect(player.x, player.y, player.width, player.height);
    }
}

function movePlayer(player) {
    player.x += player.dx;
    player.y += player.dy;
    player.x = Math.max(0, Math.min(canvas.width - player.width, player.x));
    player.y = Math.max(0, Math.min(canvas.height - player.height, player.y));
}

function shootBullet(player) {
    if (player.health > 0) {
        player.bullets.push({ x: player.x + player.width / 2, y: player.y + player.height / 2, size: 5, speed: 7 });
    }
}

function updateBullets(player) {
    for (let i = 0; i < player.bullets.length; i++) {
        const bullet = player.bullets[i];
        bullet.x += bullet.speed * (player.color === 'blue' ? 1 : -1);
        if (bullet.x < 0 || bullet.x > canvas.width) {
            player.bullets.splice(i, 1);
            i--;
        }
    }
}

function drawBullets(player) {
    ctx.fillStyle = player.color;
    for (const bullet of player.bullets) {
        ctx.beginPath();
        ctx.arc(bullet.x, bullet.y, bullet.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

function detectCollisions() {
    for (const bullet of player1.bullets) {
        if (bullet.x > player2.x && bullet.x < player2.x + player2.width &&
            bullet.y > player2.y && bullet.y < player2.y + player2.height) {
            console.log('Player 1 hits Player 2!');
            player2.health--;
            player1.bullets.splice(player1.bullets.indexOf(bullet), 1);
            updateHealthBars();
            if (player2.health <= 0) {
                alert('Player 1 wins! Restarting game...');
                resetGame();
            }
        }
    }
    for (const bullet of player2.bullets) {
        if (bullet.x > player1.x && bullet.x < player1.x + player1.width &&
            bullet.y > player1.y && bullet.y < player1.y + player1.height) {
            console.log('Player 2 hits Player 1!');
            player1.health--;
            player2.bullets.splice(player2.bullets.indexOf(bullet), 1);
            updateHealthBars();
            if (player1.health <= 0) {
                alert('Player 2 wins! Restarting game...');
                resetGame();
            }
        }
    }
}

// Bot AI
function moveBot(player) {
    const target = player1;
    const directionY = target.y > player.y ? 1 : -1;

    setTimeout(() => {
        player.y += directionY * player.speed;
        player.y = Math.max(0, Math.min(canvas.height - player.height, player.y));
    }, 500);
}

function botActions() {
    if (player2.isBot && player2.health > 0) {
        moveBot(player2);
    }
}

let botShootInterval = setInterval(() => {
    if (player2.isBot && player2.health > 0) {
        if (Math.abs(player2.y - player1.y) < player2.speed) {
            shootBullet(player2);
        }
    }
}, 1000);

function gameLoop() {
    if (gameStarted) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        movePlayer(player1);
        drawPlayer(player1);
        drawPlayer(player2);
        updateBullets(player1);
        updateBullets(player2);
        drawBullets(player1);
        drawBullets(player2);
        detectCollisions();
        botActions();
    }
    requestAnimationFrame(gameLoop);
}

function startGame() {
    document.getElementById('startButton').style.display = 'none';
    canvas.style.display = 'block';
    healthBarContainer.classList.remove('hidden');
    gameStarted = true;
    resetGame();
}

// Keyboard controls
document.addEventListener('keydown', (e) => {
    if (gameStarted) {
        switch (e.key) {
            case 'w': player1.dy = -player1.speed; break;
            case 's': player1.dy = player1.speed; break;
            case 'a': player1.dx = -player1.speed; break;
            case 'd': player1.dx = player1.speed; break;
            case ' ': shootBullet(player1); break;
        }
    }
});

document.addEventListener('keyup', (e) => {
    if (gameStarted) {
        switch (e.key) {
            case 'w':
            case 's':
                player1.dy = 0; break;
            case 'a':
            case 'd':
                player1.dx = 0; break;
        }
    }
});

gameLoop();
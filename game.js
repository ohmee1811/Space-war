const playerImage = new Image();
playerImage.src = "assets/player.svg";

const enemyImage = new Image();
enemyImage.src = "assets/enemy.svg";

const backgroundImage = new Image();
backgroundImage.src = "assets/Stars.svg";

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const scoreElement = document.getElementById("score");
const hpElement = document.getElementById("hp");
const finalScoreElement = document.getElementById("finalScore");
const gameOverScreen = document.getElementById("gameOverScreen");
const restartButton = document.getElementById("restartButton");

const keys = {};

let player;
let bullets;
let enemies;
let stars;

let score;
let hp;
let gameOver;
let enemySpawnTimer;
let lastShotTime;

// -------------------------
// 게임 시작
// -------------------------

function startGame() {
  player = {
    x: canvas.width / 2 - 25,
    y: canvas.height - 80,
    width: 37,
    height: 45,
    speed: 6
  };

  bullets = [];
  enemies = [];
  stars = createStars(100);

  score = 0;
  hp = 10;
  gameOver = false;

  enemySpawnTimer = 0;
  lastShotTime = 0;

  scoreElement.textContent = score;
  hpElement.textContent = hp;

  gameOverScreen.classList.add("hidden");

  requestAnimationFrame(gameLoop);
}

// -------------------------
// 별 배경 만들기
// -------------------------

function createStars(amount) {
  const newStars = [];

  for (let i = 0; i < amount; i++) {
    newStars.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 2 + 1,
      speed: Math.random() * 2 + 0.5
    });
  }

  return newStars;
}

// -------------------------
// 키 입력
// -------------------------

window.addEventListener("keydown", (event) => {
  keys[event.code] = true;

  if (event.code === "Space") {
    event.preventDefault();
  }
});

window.addEventListener("keyup", (event) => {
  keys[event.code] = false;
});

// -------------------------
// 플레이어 이동
// -------------------------

function updatePlayer() {
  const moveLeft =
    keys.ArrowLeft ||
    keys.KeyA;

  const moveRight =
    keys.ArrowRight ||
    keys.KeyD;

  if (moveLeft) {
    player.x -= player.speed;
  }

  if (moveRight) {
    player.x += player.speed;
  }

  if (player.x < 0) {
    player.x = 0;
  }

  if (player.x + player.width > canvas.width) {
    player.x = canvas.width - player.width;
  }

  if (keys.Space) {
    shoot();
  }
}

// -------------------------
// 총알 발사
// -------------------------

function shoot() {
  const currentTime = Date.now();
  const shotDelay = 100;

  if (currentTime - lastShotTime < shotDelay) {
    return;
  }

  bullets.push({
    x: player.x + player.width / 2 - 3,
    y: player.y,
    width: 6,
    height: 18,
    speed: 9
  });

  lastShotTime = currentTime;
}

function updateBullets() {
  for (const bullet of bullets) {
    bullet.y -= bullet.speed;
  }

  bullets = bullets.filter((bullet) => {
    return bullet.y + bullet.height > 0;
  });
}

// -------------------------
// 적 생성
// -------------------------

function createEnemy() {
  const size = Math.random() * 25 + 35;

  enemies.push({
    x: Math.random() * (canvas.width - size),
    y: -size,
    width: size,
    height: size,
    speed: Math.random() * 2 + 2
  });
}

function updateEnemies() {
  enemySpawnTimer++;

  if (enemySpawnTimer >= 50) {
    createEnemy();
    enemySpawnTimer = 0;
  }

  for (const enemy of enemies) {
    enemy.y += enemy.speed;
  }
}

// -------------------------
// 충돌 판정
// -------------------------

function isColliding(objectA, objectB) {
  return (
    objectA.x < objectB.x + objectB.width &&
    objectA.x + objectA.width > objectB.x &&
    objectA.y < objectB.y + objectB.height &&
    objectA.y + objectA.height > objectB.y
  );
}

function checkCollisions() {
    // 총알과 적 충돌
    for (
        let enemyIndex = enemies.length - 1;
        enemyIndex >= 0;
        enemyIndex--
    ) {
        const enemy = enemies[enemyIndex];

        for (
            let bulletIndex = bullets.length - 1;
            bulletIndex >= 0;
            bulletIndex--
        ) {
            const bullet = bullets[bulletIndex];

            if (isColliding(bullet, enemy)) {
                bullets.splice(bulletIndex, 1);
                enemies.splice(enemyIndex, 1);

                score += 10;
                scoreElement.textContent = score;

                break;
            }
        }
    }

    // 적과 플레이어 충돌
    for (
        let enemyIndex = enemies.length - 1;
        enemyIndex >= 0;
        enemyIndex--
    ) {
        const enemy = enemies[enemyIndex];

        if (isColliding(player, enemy)) {
            enemies.splice(enemyIndex, 1);
            loseHp();
            continue;
        }

        // 화면 밖으로 나간 적은 그냥 삭제
        if (enemy.y > canvas.height) {
            enemies.splice(enemyIndex, 1);
        }
    }
}

function loseHp() {
  hp--;
  hpElement.textContent = hp;

  if (hp <= 0) {
    endGame();
  }
}

// -------------------------
// 화면 그리기
// -------------------------

function drawBackground() {
  ctx.drawImage(
    backgroundImage,
    0,
    0,
    canvas.width,
    canvas.height
  );
}

function drawPlayer() {
    ctx.drawImage(
        playerImage,
        player.x,
        player.y,
        37,
        45
    );
}

function drawBullets() {
  ctx.fillStyle = "#fff700";

  for (const bullet of bullets) {
    ctx.fillRect(
      bullet.x,
      bullet.y,
      bullet.width,
      bullet.height
    );
  }
}

function drawEnemies() {
  for (const enemy of enemies) {
    ctx.drawImage(
        enemyImage,
        enemy.x,
        enemy.y,
        37,
        45
    );
  }
}

// -------------------------
// 게임 종료
// -------------------------

function endGame() {
  gameOver = true;

  finalScoreElement.textContent = score;
  gameOverScreen.classList.remove("hidden");
}

restartButton.addEventListener("click", startGame);

// -------------------------
// 게임 반복
// -------------------------

function gameLoop() {
  if (gameOver) {
    return;
  }

  updatePlayer();
  updateBullets();
  updateEnemies();
  checkCollisions();

  drawBackground();
  drawPlayer();
  drawBullets();
  drawEnemies();

  requestAnimationFrame(gameLoop);
}

startGame();
const stage = document.querySelector("[data-game-stage]");
const player = document.querySelector("[data-player]");
const scoreEl = document.querySelector("[data-score]");
const levelEl = document.querySelector("[data-level]");
const livesEl = document.querySelector("[data-lives]");
const bestScoreEl = document.querySelector("[data-best-score]");
const message = document.querySelector("[data-message]");
const startButton = document.querySelector("[data-start-button]");
const pauseButton = document.querySelector("[data-pause-button]");
const controlButtons = [...document.querySelectorAll("[data-control]")];

const keys = new Set();
const touchControls = { left: false, right: false, shoot: false };
const bullets = [];
const enemies = [];

let stageRect = stage.getBoundingClientRect();
let playerX = 0;
let playerY = 0;
let score = 0;
let level = 1;
let lives = 3;
let bestScore = Number(localStorage.getItem("star-shooter-best-score") || 0);
let lastTime = 0;
let lastShotAt = 0;
let enemyTimer = 0;
let invulnerableUntil = 0;
let isPlaying = false;
let isPaused = false;
let animationId = 0;

const playerSize = { width: 48, height: 54 };
const bulletSpeed = 560;
const baseEnemySpeed = 120;
const playerSpeed = 360;
const shotCooldown = 220;

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const setTransform = (element, x, y) => {
  element.style.transform = `translate(${x}px, ${y}px)`;
};

const updateScore = () => {
  level = Math.floor(score / 5) + 1;
  scoreEl.textContent = String(score);
  levelEl.textContent = String(level);
  livesEl.textContent = String(lives);
  bestScoreEl.textContent = String(bestScore);
};

const getEnemySpeed = () => baseEnemySpeed + Math.min(180, (level - 1) * 18);

const getEnemyInterval = () => Math.max(0.4, 0.85 - (level - 1) * 0.05);

const saveBestScore = () => {
  if (score <= bestScore) return;
  bestScore = score;
  localStorage.setItem("star-shooter-best-score", String(bestScore));
};

const resetStageRect = () => {
  stageRect = stage.getBoundingClientRect();
  playerY = stageRect.height - playerSize.height - 26;
  playerX = clamp(playerX, 0, stageRect.width - playerSize.width);
  setTransform(player, playerX, playerY);
};

const clearObjects = () => {
  bullets.splice(0).forEach((item) => item.element.remove());
  enemies.splice(0).forEach((item) => item.element.remove());
};

const createBullet = (now) => {
  if (!isPlaying || now - lastShotAt < shotCooldown) return;
  lastShotAt = now;

  const element = document.createElement("div");
  element.className = "bullet";
  stage.appendChild(element);

  const bullet = {
    element,
    x: playerX + playerSize.width / 2 - 3,
    y: playerY - 22,
    width: 6,
    height: 22
  };

  bullets.push(bullet);
  setTransform(element, bullet.x, bullet.y);
};

const createEnemy = () => {
  const element = document.createElement("div");
  element.className = "enemy";
  stage.appendChild(element);

  const enemy = {
    element,
    x: Math.random() * Math.max(1, stageRect.width - 54) + 6,
    y: -52,
    width: 42,
    height: 42
  };

  enemies.push(enemy);
  setTransform(element, enemy.x, enemy.y);
};

const overlaps = (a, b) => (
  a.x < b.x + b.width &&
  a.x + a.width > b.x &&
  a.y < b.y + b.height &&
  a.y + a.height > b.y
);

const removeItem = (items, index) => {
  const [item] = items.splice(index, 1);
  item.element.remove();
};

const createBurst = (x, y) => {
  const element = document.createElement("div");
  element.className = "burst";
  element.style.setProperty("--x", `${x}px`);
  element.style.setProperty("--y", `${y}px`);
  stage.appendChild(element);
  element.addEventListener("animationend", () => element.remove(), { once: true });
};

const endGame = () => {
  isPlaying = false;
  isPaused = false;
  cancelAnimationFrame(animationId);
  saveBestScore();
  updateScore();
  pauseButton.disabled = true;
  pauseButton.textContent = "暫停";
  stage.classList.remove("is-paused");
  message.classList.remove("is-hidden");
  message.querySelector("h1").textContent = "遊戲結束";
  message.querySelector("p").textContent = `你得到 ${score} 分。按下重新開始再挑戰一次。`;
  startButton.textContent = "重新開始";
};

const loseLife = () => {
  lives -= 1;
  updateScore();
  if (lives <= 0) {
    endGame();
  }
};

const hitPlayer = (now) => {
  if (now < invulnerableUntil) return;
  invulnerableUntil = now + 1200;
  player.classList.remove("is-hit");
  void player.offsetWidth;
  player.classList.add("is-hit");
  loseLife();
};

const update = (time) => {
  if (!isPlaying) return;
  if (isPaused) return;
  const delta = Math.min(0.032, (time - lastTime) / 1000 || 0);
  lastTime = time;

  if (keys.has("ArrowLeft") || keys.has("a") || touchControls.left) {
    playerX -= playerSpeed * delta;
  }
  if (keys.has("ArrowRight") || keys.has("d") || touchControls.right) {
    playerX += playerSpeed * delta;
  }
  if (keys.has(" ") || touchControls.shoot) {
    createBullet(time);
  }

  playerX = clamp(playerX, 0, stageRect.width - playerSize.width);
  setTransform(player, playerX, playerY);

  enemyTimer += delta;
  if (enemyTimer >= getEnemyInterval()) {
    enemyTimer = 0;
    createEnemy();
  }

  for (let i = bullets.length - 1; i >= 0; i -= 1) {
    const bullet = bullets[i];
    bullet.y -= bulletSpeed * delta;
    if (bullet.y < -bullet.height) {
      removeItem(bullets, i);
    } else {
      setTransform(bullet.element, bullet.x, bullet.y);
    }
  }

  const playerBox = { x: playerX, y: playerY, width: playerSize.width, height: playerSize.height };
  for (let i = enemies.length - 1; i >= 0; i -= 1) {
    const enemy = enemies[i];
    enemy.y += getEnemySpeed() * delta;

    if (overlaps(enemy, playerBox)) {
      removeItem(enemies, i);
      hitPlayer(time);
      if (!isPlaying) return;
      continue;
    }

    if (enemy.y > stageRect.height) {
      removeItem(enemies, i);
      loseLife();
      if (!isPlaying) return;
      continue;
    }

    let wasHit = false;
    for (let j = bullets.length - 1; j >= 0; j -= 1) {
      if (overlaps(enemy, bullets[j])) {
        createBurst(enemy.x, enemy.y);
        removeItem(bullets, j);
        removeItem(enemies, i);
        score += 1;
        updateScore();
        wasHit = true;
        break;
      }
    }

    if (!wasHit) {
      setTransform(enemy.element, enemy.x, enemy.y);
    }
  }

  animationId = requestAnimationFrame(update);
};

const startGame = () => {
  clearObjects();
  score = 0;
  level = 1;
  lives = 3;
  enemyTimer = 0;
  lastShotAt = 0;
  invulnerableUntil = 0;
  isPaused = false;
  playerX = stageRect.width / 2 - playerSize.width / 2;
  resetStageRect();
  updateScore();
  pauseButton.disabled = false;
  pauseButton.textContent = "暫停";
  stage.classList.remove("is-paused");
  player.classList.remove("is-hit");
  message.classList.add("is-hidden");
  isPlaying = true;
  lastTime = performance.now();
  stage.focus();
  animationId = requestAnimationFrame(update);
};

const setPaused = (nextPaused) => {
  if (!isPlaying) return;
  isPaused = nextPaused;
  stage.classList.toggle("is-paused", isPaused);
  pauseButton.textContent = isPaused ? "繼續" : "暫停";
  keys.clear();
  touchControls.left = false;
  touchControls.right = false;
  touchControls.shoot = false;
  controlButtons.forEach((button) => button.classList.remove("is-pressed"));

  if (isPaused) {
    cancelAnimationFrame(animationId);
    message.classList.remove("is-hidden");
    message.querySelector("h1").textContent = "暫停中";
    message.querySelector("p").textContent = "按 P 或繼續按鈕回到遊戲。";
    startButton.textContent = "繼續";
    return;
  }

  message.classList.add("is-hidden");
  lastTime = performance.now();
  stage.focus();
  animationId = requestAnimationFrame(update);
};

window.addEventListener("keydown", (event) => {
  if (event.key === "p" || event.key === "P") {
    event.preventDefault();
    setPaused(!isPaused);
    return;
  }

  if (["ArrowLeft", "ArrowRight", " ", "a", "d", "A", "D"].includes(event.key)) {
    event.preventDefault();
  }
  keys.add(event.key.length === 1 ? event.key.toLowerCase() : event.key);
});

window.addEventListener("keyup", (event) => {
  keys.delete(event.key.length === 1 ? event.key.toLowerCase() : event.key);
});

const setControlState = (button, isPressed) => {
  const control = button.dataset.control;
  if (!control) return;
  touchControls[control] = isPressed;
  button.classList.toggle("is-pressed", isPressed);
  if (isPressed) stage.focus();
};

controlButtons.forEach((button) => {
  button.addEventListener("pointerdown", (event) => {
    event.preventDefault();
    button.setPointerCapture?.(event.pointerId);
    setControlState(button, true);
  });

  ["pointerup", "pointercancel", "pointerleave"].forEach((eventName) => {
    button.addEventListener(eventName, () => setControlState(button, false));
  });
});

window.addEventListener("resize", resetStageRect);
startButton.addEventListener("click", () => {
  if (isPlaying && isPaused) {
    setPaused(false);
    return;
  }
  startGame();
});
pauseButton.addEventListener("click", () => setPaused(!isPaused));

resetStageRect();
updateScore();

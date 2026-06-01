const level = [
  "############",
  "#P..*..#...#",
  "#.##.#.#.#*#",
  "#....#...#.#",
  "###.###.#..#",
  "#...*...##.#",
  "#.####..#..#",
  "#..#..*...##",
  "##.#.###...#",
  "#..*...#.#E#",
  "#...##...*.#",
  "############"
];

const directions = {
  up: { row: -1, col: 0 },
  down: { row: 1, col: 0 },
  left: { row: 0, col: -1 },
  right: { row: 0, col: 1 }
};

const initialEnemies = [
  { row: 3, col: 8, dir: "left", axis: "horizontal" },
  { row: 8, col: 9, dir: "right", axis: "horizontal" }
];

const mazeEl = document.querySelector("[data-maze]");
const scoreEl = document.querySelector("[data-score]");
const stepsEl = document.querySelector("[data-steps]");
const statusEl = document.querySelector("[data-status]");
const messageEl = document.querySelector("[data-message]");
const messageTitleEl = document.querySelector("[data-message-title]");
const messageCopyEl = document.querySelector("[data-message-copy]");
const restartButtons = document.querySelectorAll("[data-restart], [data-message-restart]");
const pauseButton = document.querySelector("[data-pause]");
const resumeButton = document.querySelector("[data-resume]");
const hintButton = document.querySelector("[data-hint]");
const undoButton = document.querySelector("[data-undo]");
const objectiveEl = document.querySelector("[data-objective]");
const exitStateEl = document.querySelector("[data-exit-state]");
const bestScoreEl = document.querySelector("[data-best-score]");
const hintTextEl = document.querySelector("[data-hint-text]");
const undoStateEl = document.querySelector("[data-undo-state]");

const bestScoreKey = "happyebook.pixieMaze.bestSteps";

let map;
let player;
let enemies;
let starsTotal;
let starsCollected;
let steps;
let gameState;
let bestSteps = loadBestSteps();
let hintCell = null;
let history = [];

const cloneEnemies = () => initialEnemies.map((enemy) => ({ ...enemy }));

const resetGame = () => {
  map = level.map((row, rowIndex) => row.split("").map((cell, colIndex) => {
    if (cell === "P") {
      player = { row: rowIndex, col: colIndex };
      return ".";
    }
    return cell;
  }));
  enemies = cloneEnemies();
  starsTotal = map.flat().filter((cell) => cell === "*").length;
  starsCollected = 0;
  steps = 0;
  gameState = "playing";
  hintCell = null;
  history = [];
  hideMessage();
  render();
};

const isWall = (row, col) => map[row]?.[col] === "#";

const hasEnemyAt = (row, col) => enemies.some((enemy) => enemy.row === row && enemy.col === col);

const render = () => {
  mazeEl.innerHTML = "";
  map.forEach((row, rowIndex) => {
    row.forEach((cell, colIndex) => {
      const tile = document.createElement("div");
      tile.className = "cell";
      tile.setAttribute("role", "gridcell");

      if (cell === "#") tile.classList.add("wall");
      if (cell === "E") tile.classList.add("exit", isExitOpen() ? "open" : "locked");
      if (hintCell?.row === rowIndex && hintCell?.col === colIndex) tile.classList.add("hint");
      if (isDangerZone(rowIndex, colIndex)) tile.classList.add("danger-zone");
      if (isEnemyNextCell(rowIndex, colIndex)) tile.classList.add("enemy-next");

      if (cell === "*") {
        const star = document.createElement("span");
        star.className = "star";
        star.setAttribute("aria-label", "星星");
        tile.appendChild(star);
      }

      if (player.row === rowIndex && player.col === colIndex) {
        const pixie = document.createElement("span");
        pixie.className = "pixie";
        pixie.setAttribute("aria-label", "小精靈");
        tile.appendChild(pixie);
      }

      if (hasEnemyAt(rowIndex, colIndex)) {
        const enemy = document.createElement("span");
        enemy.className = "enemy";
        enemy.setAttribute("aria-label", "巡邏角色");
        tile.appendChild(enemy);
      }

      mazeEl.appendChild(tile);
    });
  });

  scoreEl.textContent = `${starsCollected} / ${starsTotal}`;
  stepsEl.textContent = String(steps);
  statusEl.textContent = getStatusText();
  objectiveEl.textContent = getObjectiveText();
  exitStateEl.textContent = isExitOpen() ? "出口已解鎖" : `還差 ${starsTotal - starsCollected} 顆星星`;
  bestScoreEl.textContent = bestSteps ? `最佳步數：${bestSteps}` : "最佳步數：尚未過關";
  hintTextEl.textContent = getHintText();
  hintTextEl.classList.toggle("is-warning", isPlayerNearEnemy());
  undoStateEl.textContent = history.length ? `撤回：可回到第 ${Math.max(steps - 1, 0)} 步` : "撤回：尚無步驟";
  undoStateEl.classList.toggle("is-ready", history.length > 0);
  undoButton.disabled = history.length === 0 || gameState === "paused";
  pauseButton.textContent = gameState === "paused" ? "繼續" : "暫停";
};

const getStatusText = () => {
  if (gameState === "won") return "過關";
  if (gameState === "lost") return "失敗";
  if (gameState === "paused") return "暫停";
  return "遊戲中";
};

const getObjectiveText = () => {
  if (gameState === "won") return "完成，漂亮收尾。";
  if (gameState === "lost") return "重新開始後，先觀察巡邏路線再移動。";
  if (gameState === "paused") return "遊戲已暫停，按繼續回到迷宮。";
  if (isPlayerNearEnemy()) return "巡邏角色很近，下一步先避開危險格。";
  if (isExitOpen()) return "星星已收齊，前往綠色出口。";
  return `先收集剩下 ${starsTotal - starsCollected} 顆星星，再前往出口。`;
};

const isExitOpen = () => starsCollected === starsTotal;

const showMessage = (title, copy) => {
  messageTitleEl.textContent = title;
  messageCopyEl.textContent = copy;
  messageEl.hidden = false;
};

const hideMessage = () => {
  messageEl.hidden = true;
  resumeButton.hidden = true;
};

const endGame = (state) => {
  gameState = state;
  if (state === "won") saveBestSteps();
  render();
  if (state === "won") {
    showMessage("過關", getWinMessage());
  } else {
    showMessage("撞到了巡邏角色", "按重新開始，再試一次路線。");
  }
};

const tryMove = (directionName) => {
  if (gameState !== "playing") return;
  const direction = directions[directionName];
  if (!direction) return;
  hintCell = null;

  const nextRow = player.row + direction.row;
  const nextCol = player.col + direction.col;
  if (isWall(nextRow, nextCol)) return;

  saveSnapshot();
  player = { row: nextRow, col: nextCol };
  steps += 1;

  if (map[nextRow][nextCol] === "*") {
    map[nextRow][nextCol] = ".";
    starsCollected += 1;
  }

  if (hasEnemyAt(nextRow, nextCol)) {
    endGame("lost");
    return;
  }

  moveEnemies();

  if (hasEnemyAt(player.row, player.col)) {
    endGame("lost");
    return;
  }

  if (map[player.row][player.col] === "E" && !isExitOpen()) {
    objectiveEl.textContent = `出口還沒開，還差 ${starsTotal - starsCollected} 顆星星。`;
  }

  if (isExitOpen() && map[player.row][player.col] === "E") {
    endGame("won");
    return;
  }

  render();
};

const moveEnemies = () => {
  enemies = enemies.map((enemy) => {
    const direction = directions[enemy.dir];
    const next = {
      ...enemy,
      row: enemy.row + direction.row,
      col: enemy.col + direction.col
    };

    if (!isWall(next.row, next.col) && map[next.row][next.col] !== "E") return next;

    const reverse = enemy.dir === "left" ? "right" : enemy.dir === "right" ? "left" : enemy.dir === "up" ? "down" : "up";
    const reverseDirection = directions[reverse];
    return {
      ...enemy,
      dir: reverse,
      row: enemy.row + reverseDirection.row,
      col: enemy.col + reverseDirection.col
    };
  });
};

const saveSnapshot = () => {
  history.push({
    map: map.map((row) => [...row]),
    player: { ...player },
    enemies: enemies.map((enemy) => ({ ...enemy })),
    starsCollected,
    steps
  });
  if (history.length > 30) history.shift();
};

const undoMove = () => {
  if (!history.length || gameState === "paused") return;
  const snapshot = history.pop();
  map = snapshot.map.map((row) => [...row]);
  player = { ...snapshot.player };
  enemies = snapshot.enemies.map((enemy) => ({ ...enemy }));
  starsCollected = snapshot.starsCollected;
  steps = snapshot.steps;
  gameState = "playing";
  hintCell = null;
  hideMessage();
  render();
};

const getHintText = () => {
  if (gameState === "paused") return "提示：繼續後再移動";
  if (gameState === "won") return "提示：可以挑戰更少步數";
  if (gameState === "lost") return "提示：重新開始再試";
  if (isPlayerNearEnemy()) return "危險：巡邏角色在附近";
  if (hintCell) return `提示：往${hintCell.label}走`;
  return isExitOpen() ? "提示：找出口" : "提示：找最近的星星";
};

const isDangerZone = (row, col) => enemies.some((enemy) => (
  Math.abs(enemy.row - row) + Math.abs(enemy.col - col) === 1
));

const isPlayerNearEnemy = () => isDangerZone(player.row, player.col);

const isEnemyNextCell = (row, col) => enemies.some((enemy) => {
  const next = getEnemyNextPosition(enemy);
  return next.row === row && next.col === col;
});

const getEnemyNextPosition = (enemy) => {
  const direction = directions[enemy.dir];
  const next = {
    row: enemy.row + direction.row,
    col: enemy.col + direction.col
  };
  if (!isWall(next.row, next.col) && map[next.row][next.col] !== "E") return next;

  const reverse = enemy.dir === "left" ? "right" : enemy.dir === "right" ? "left" : enemy.dir === "up" ? "down" : "up";
  const reverseDirection = directions[reverse];
  return {
    row: enemy.row + reverseDirection.row,
    col: enemy.col + reverseDirection.col
  };
};

const showHint = () => {
  if (gameState !== "playing") return;
  const nextStep = findNextStep();
  hintCell = nextStep;
  render();
};

const findNextStep = () => {
  const targets = [];
  map.forEach((row, rowIndex) => {
    row.forEach((cell, colIndex) => {
      if (!isExitOpen() && cell === "*") targets.push(`${rowIndex},${colIndex}`);
      if (isExitOpen() && cell === "E") targets.push(`${rowIndex},${colIndex}`);
    });
  });
  if (!targets.length) return null;

  const queue = [{ row: player.row, col: player.col, first: null }];
  const seen = new Set([`${player.row},${player.col}`]);

  for (let index = 0; index < queue.length; index += 1) {
    const current = queue[index];
    if (targets.includes(`${current.row},${current.col}`)) return current.first;

    for (const [name, direction] of Object.entries(directions)) {
      const row = current.row + direction.row;
      const col = current.col + direction.col;
      const key = `${row},${col}`;
      if (seen.has(key) || isWall(row, col)) continue;
      if (hasEnemyAt(row, col)) continue;
      seen.add(key);
      queue.push({
        row,
        col,
        first: current.first || { row, col, label: getDirectionLabel(name) }
      });
    }
  }

  return null;
};

const getDirectionLabel = (direction) => ({
  up: "上",
  down: "下",
  left: "左",
  right: "右"
})[direction] || "";

const togglePause = () => {
  if (gameState === "won" || gameState === "lost") return;
  if (gameState === "paused") {
    gameState = "playing";
    hideMessage();
    render();
    return;
  }
  gameState = "paused";
  render();
  resumeButton.hidden = false;
  showMessage("暫停", "可以先看一下路線，按繼續回到迷宮。");
};

function loadBestSteps() {
  try {
    const saved = Number(localStorage.getItem(bestScoreKey));
    return Number.isFinite(saved) && saved > 0 ? saved : null;
  } catch {
    return null;
  }
}

function saveBestSteps() {
  if (bestSteps && steps >= bestSteps) return;
  bestSteps = steps;
  try {
    localStorage.setItem(bestScoreKey, String(steps));
  } catch {
    return;
  }
}

function getWinMessage() {
  if (bestSteps === steps) return `你用 ${steps} 步過關，這是目前最佳步數。`;
  return `你用 ${steps} 步收集了所有星星。最佳步數是 ${bestSteps}。`;
}

document.addEventListener("keydown", (event) => {
  if (event.key === "p" || event.key === "P") {
    event.preventDefault();
    togglePause();
    return;
  }

  if (event.key === "r" || event.key === "R") {
    event.preventDefault();
    resetGame();
    return;
  }

  if (event.key === "h" || event.key === "H") {
    event.preventDefault();
    showHint();
    return;
  }

  if (event.key === "z" || event.key === "Z") {
    event.preventDefault();
    undoMove();
    return;
  }

  const keyMap = {
    ArrowUp: "up",
    w: "up",
    W: "up",
    ArrowDown: "down",
    s: "down",
    S: "down",
    ArrowLeft: "left",
    a: "left",
    A: "left",
    ArrowRight: "right",
    d: "right",
    D: "right"
  };

  const direction = keyMap[event.key];
  if (!direction) return;
  event.preventDefault();
  tryMove(direction);
});

document.querySelectorAll("[data-move]").forEach((button) => {
  button.addEventListener("click", () => tryMove(button.dataset.move));
});

restartButtons.forEach((button) => {
  button.addEventListener("click", resetGame);
});

pauseButton.addEventListener("click", togglePause);
resumeButton.addEventListener("click", togglePause);
hintButton.addEventListener("click", showHint);
undoButton.addEventListener("click", undoMove);

resetGame();

// --- Game & Progression State ---
let gameMode = "solo"; // "solo" | "bot" | "2p"
let botDifficulty = "medium"; // "easy" | "medium" | "hard"
let currentPlayer = 1; // 1 | 2
let roundCount = 1; // 1 to 13
let dice = [1, 1, 1, 1, 1];
let locked = [false, false, false, false, false];
let rollsLeft = 3;
let hasRolledAtLeastOnce = false;
let isBotThinking = false;
let lastMoveState = null;

let scores = {
  p1: { ones: null, twos: null, threes: null, fours: null, fives: null, sixes: null, threeKind: null, fourKind: null, fullHouse: null, smallStraight: null, largeStraight: null, yatzy: null, chance: null },
  p2: { ones: null, twos: null, threes: null, fours: null, fives: null, sixes: null, threeKind: null, fourKind: null, fullHouse: null, smallStraight: null, largeStraight: null, yatzy: null, chance: null }
};

let soundEnabled = true;
let volumeLevel = 0.7;
let audioCtx = null;

let xp = 0;
let level = 1;
let coins = 1250;
let stats = { gamesPlayed: 0, wins: 0, highScore: 0, totalScore: 0 };
let matchHistory = [];
let achievements = {
  firstRoll: false,
  yahtzeeMaster: false,
  straightShooter: false,
  bonusHunter: false,
  botSlayer: false,
  centurion: false,
  grandmaster: false,
  highScorer: false
};

const achievementDefinitions = {
  firstRoll: { title: "First Roll", desc: "Rolled the dice for the first time", icon: "🎲" },
  yahtzeeMaster: { title: "Yahtzee Master", desc: "Scored 50 points on Yatzy!", icon: "💎" },
  straightShooter: { title: "Straight Shooter", desc: "Scored a Large Straight!", icon: "🌟" },
  bonusHunter: { title: "Bonus Hunter", desc: "Earned the +35 Upper Section Bonus", icon: "🎁" },
  botSlayer: { title: "Bot Slayer", desc: "Defeated YatzyBot on Master difficulty", icon: "🤖" },
  centurion: { title: "Centurion", desc: "Scored 200+ points in a single game", icon: "💯" },
  highScorer: { title: "High Scorer", desc: "Scored 250+ points in a single game", icon: "👑" },
  grandmaster: { title: "Grandmaster", desc: "Reached Player Level 5", icon: "🏆" }
};

// --- DOM Elements ---
const appContainer = document.getElementById("appContainer");
const diceElements = document.querySelectorAll(".die");
const diceFeltTable = document.getElementById("diceFeltTable");
const rollBtn = document.getElementById("rollBtn");
const rollsLeftSpan = document.getElementById("rollsLeft");
const roundCountSpan = document.getElementById("roundCount");
const roundCountText = document.getElementById("roundCountText");
const restartBtn = document.getElementById("restartBtn");
const hintBtn = document.getElementById("hintBtn");
const undoBtn = document.getElementById("undoBtn");

const themeSelect = document.getElementById("themeSelect");
const skinSelect = document.getElementById("skinSelect");
const botDiffSelect = document.getElementById("botDiffSelect");
const soundToggleBtn = document.getElementById("soundToggleBtn");
const soundIcon = document.getElementById("soundIcon");
const volumeSlider = document.getElementById("volumeSlider");

const instructionText = document.getElementById("instructionText");
const scoreRows = document.querySelectorAll(".score-row");

const xpBarFill = document.getElementById("xpBarFill");
const xpText = document.getElementById("xpText");
const playerLevelBadge = document.getElementById("playerLevelBadge");
const coinsCount = document.getElementById("coinsCount");
const achievementsGrid = document.getElementById("achievementsGrid");
const achievementsUnlockedCount = document.getElementById("achievementsUnlockedCount");
const toastContainer = document.getElementById("toastContainer");
const floatingHitsContainer = document.getElementById("floatingHitsContainer");

const modeBtns = document.querySelectorAll(".mode-btn");
const turnBanner = document.getElementById("turnBanner");
const turnText = document.getElementById("turnText");
const p2Legend = document.getElementById("p2Legend");
const p1Legend = document.querySelector(".p1-legend");
const p2Cols = document.querySelectorAll(".p2-col");
const gameProgressFill = document.getElementById("gameProgressFill");
const progressPercent = document.getElementById("progressPercent");

const statsModal = document.getElementById("statsModal");
const openStatsBtn = document.getElementById("openStatsBtn");
const closeStatsBtn = document.getElementById("closeStatsBtn");
const statGamesPlayed = document.getElementById("statGamesPlayed");
const statWinRate = document.getElementById("statWinRate");
const statHighScore = document.getElementById("statHighScore");
const statAvgScore = document.getElementById("statAvgScore");
const matchHistoryList = document.getElementById("matchHistoryList");

const gameOverModal = document.getElementById("gameOverModal");
const modalTitle = document.getElementById("modalTitle");
const winnerSubtitle = document.getElementById("winnerSubtitle");
const finalScoreP1 = document.getElementById("finalScoreP1");
const finalScoreP2 = document.getElementById("finalScoreP2");
const modalP1Name = document.getElementById("modalP1Name");
const modalP2Name = document.getElementById("modalP2Name");
const modalP2Box = document.getElementById("modalP2Box");
const finalUpperComp = document.getElementById("finalUpperComp");
const finalBonusComp = document.getElementById("finalBonusComp");
const finalLowerComp = document.getElementById("finalLowerComp");
const earnedXPText = document.getElementById("earnedXPText");
const earnedCoinsText = document.getElementById("earnedCoinsText");
const newHighScoreBadge = document.getElementById("newHighScoreBadge");
const modalPlayAgainBtn = document.getElementById("modalPlayAgainBtn");
const bigHitBanner = document.getElementById("bigHitBanner");
const confettiCanvas = document.getElementById("confettiCanvas");

// --- Initialization ---
function init() {
  loadData();
  setupEventListeners();
  setupMouseParallax();
  initBgCanvas();
  renderAchievementsShowcase();
  resetGame();
}

function loadData() {
  soundEnabled = localStorage.getItem("yatzy_sound") !== "false";
  volumeLevel = parseFloat(localStorage.getItem("yatzy_volume") || "0.7");
  volumeSlider.value = volumeLevel;
  updateSoundIcon();

  const savedTheme = localStorage.getItem("yatzy_theme") || "dark-space";
  document.documentElement.setAttribute("data-theme", savedTheme);
  themeSelect.value = savedTheme;

  const savedSkin = localStorage.getItem("yatzy_skin") || "classic";
  document.documentElement.setAttribute("data-skin", savedSkin);
  skinSelect.value = savedSkin;

  xp = parseInt(localStorage.getItem("yatzy_xp") || "0");
  coins = parseInt(localStorage.getItem("yatzy_coins") || "1250");
  coinsCount.textContent = `🪙 ${coins.toLocaleString()}`;

  updateXPUI();

  try {
    stats = JSON.parse(localStorage.getItem("yatzy_stats")) || { gamesPlayed: 0, wins: 0, highScore: 0, totalScore: 0 };
    matchHistory = JSON.parse(localStorage.getItem("yatzy_history")) || [];
    achievements = JSON.parse(localStorage.getItem("yatzy_achievements")) || achievements;
  } catch (e) {}

  updateQuickStatsUI();
}

function updateSoundIcon() {
  soundIcon.textContent = soundEnabled ? "🔊" : "🔇";
}

// --- 3D Mouse Parallax Engine ---
function setupMouseParallax() {
  if (!diceFeltTable) return;
  diceFeltTable.addEventListener("mousemove", (e) => {
    const rect = diceFeltTable.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;

    const tiltX = (y / rect.height) * -14;
    const tiltY = (x / rect.width) * 14;

    diceElements.forEach(die => {
      if (!die.classList.contains("rolling")) {
        die.style.transform = `rotateX(${tiltX}deg) rotateY(${tiltY}deg) ${die.classList.contains("locked") ? "translateY(-6px)" : ""}`;
      }
    });
  });

  diceFeltTable.addEventListener("mouseleave", () => {
    diceElements.forEach(die => {
      die.style.transform = "";
    });
  });
}

// --- Floating Score Popups ---
function spawnFloatingHitPopup(x, y, text) {
  const popup = document.createElement("div");
  popup.className = "floating-hit-popup";
  popup.textContent = text;
  popup.style.left = `${x}px`;
  popup.style.top = `${y}px`;
  floatingHitsContainer.appendChild(popup);

  setTimeout(() => popup.remove(), 1800);
}

function triggerCameraShake() {
  appContainer.classList.add("camera-shake");
  setTimeout(() => appContainer.classList.remove("camera-shake"), 350);
}

// --- Background Particle Canvas ---
function initBgCanvas() {
  const canvas = document.getElementById("bgCanvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  let bgParticles = [];

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  window.addEventListener("resize", resize);
  resize();

  for (let i = 0; i < 45; i++) {
    bgParticles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 3 + 1,
      vy: (Math.random() - 0.5) * 0.4,
      vx: (Math.random() - 0.5) * 0.4,
      alpha: Math.random() * 0.5 + 0.1
    });
  }

  function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    bgParticles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0) p.x = canvas.width;
      if (p.x > canvas.width) p.x = 0;
      if (p.y < 0) p.y = canvas.height;
      if (p.y > canvas.height) p.y = 0;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(167, 139, 250, ${p.alpha})`;
      ctx.fill();
    });
    requestAnimationFrame(render);
  }
  render();
}

// --- Sound Synthesizer ---
function initAudio() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
}

function playSound(type) {
  if (!soundEnabled || volumeLevel === 0) return;
  initAudio();
  if (!audioCtx) return;

  const now = audioCtx.currentTime;
  const masterGain = audioCtx.createGain();
  masterGain.gain.setValueAtTime(volumeLevel, now);
  masterGain.connect(audioCtx.destination);

  if (type === "roll") {
    const bufferSize = audioCtx.sampleRate * 0.12;
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
    const noise = audioCtx.createBufferSource();
    noise.buffer = buffer;
    const filter = audioCtx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.setValueAtTime(800, now);

    const gain = audioCtx.createGain();
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(masterGain);
    noise.start(now);
  } else if (type === "lock") {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(600, now);
    osc.frequency.exponentialRampToValueAtTime(300, now + 0.05);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);

    osc.connect(gain);
    gain.connect(masterGain);
    osc.start(now);
    osc.stop(now + 0.05);
  } else if (type === "score") {
    [523.25, 659.25, 783.99].forEach((freq, i) => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(freq, now + i * 0.06);

      gain.gain.setValueAtTime(0.15, now + i * 0.06);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.06 + 0.2);

      osc.connect(gain);
      gain.connect(masterGain);
      osc.start(now + i * 0.06);
      osc.stop(now + i * 0.06 + 0.2);
    });
  } else if (type === "bighit" || type === "achievement") {
    const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51];
    notes.forEach((freq, i) => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, now + i * 0.08);

      gain.gain.setValueAtTime(0.25, now + i * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.3);

      osc.connect(gain);
      gain.connect(masterGain);
      osc.start(now + i * 0.08);
      osc.stop(now + i * 0.08 + 0.3);
    });
  } else if (type === "victory") {
    const notes = [440, 554.37, 659.25, 880, 1108.73];
    notes.forEach((freq, i) => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(freq, now + i * 0.1);

      gain.gain.setValueAtTime(0.25, now + i * 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.1 + 0.4);

      osc.connect(gain);
      gain.connect(masterGain);
      osc.start(now + i * 0.1);
      osc.stop(now + i * 0.1 + 0.4);
    });
  }
}

// --- Confetti & Fireworks FX ---
let particles = [];
let animId = null;

function fireConfetti(count = 90) {
  confettiCanvas.width = window.innerWidth;
  confettiCanvas.height = window.innerHeight;
  const colors = ["#8b5cf6", "#ec4899", "#f59e0b", "#10b981", "#06b6d4", "#ffffff"];
  for (let i = 0; i < count; i++) {
    particles.push({
      x: confettiCanvas.width / 2 + (Math.random() - 0.5) * 250,
      y: confettiCanvas.height / 3 + (Math.random() - 0.5) * 100,
      vx: (Math.random() - 0.5) * 14,
      vy: Math.random() * -12 - 4,
      size: Math.random() * 9 + 5,
      color: colors[Math.floor(Math.random() * colors.length)],
      rotation: Math.random() * 360,
      rotSpeed: (Math.random() - 0.5) * 12,
      opacity: 1,
      gravity: 0.28
    });
  }
  if (!animId) animateParticles();
}

function animateParticles() {
  const ctx = confettiCanvas.getContext("2d");
  ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);

  particles.forEach(p => {
    p.x += p.vx;
    p.y += p.vy;
    p.vy += p.gravity;
    p.rotation += p.rotSpeed;
    p.opacity -= 0.007;

    ctx.save();
    ctx.globalAlpha = Math.max(p.opacity, 0);
    ctx.translate(p.x, p.y);
    ctx.rotate((p.rotation * Math.PI) / 180);
    ctx.fillStyle = p.color;
    ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
    ctx.restore();
  });

  particles = particles.filter(p => p.opacity > 0);
  if (particles.length > 0) {
    animId = requestAnimationFrame(animateParticles);
  } else {
    animId = null;
    ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
  }
}

function triggerBigHitCelebration(title, subtext) {
  playSound("bighit");
  fireConfetti(120);

  bigHitBanner.innerHTML = `<div>${title}</div><div style="font-size:1.4rem; opacity:0.9;">${subtext}</div>`;
  bigHitBanner.classList.remove("hidden");
  bigHitBanner.classList.add("pop");

  setTimeout(() => {
    bigHitBanner.classList.remove("pop");
    bigHitBanner.classList.add("hidden");
  }, 2400);
}

// --- XP & Coins Economy ---
function addXP(amount) {
  xp += amount;
  localStorage.setItem("yatzy_xp", xp.toString());

  const newLevel = Math.floor(xp / 500) + 1;
  if (newLevel > level) {
    level = newLevel;
    triggerToast("🎉 LEVEL UP!", `Reached Player Level ${level}!`);
    playSound("achievement");
    if (level >= 5) unlockAchievement("grandmaster");
  }
  updateXPUI();
}

function addCoins(amount) {
  coins += amount;
  localStorage.setItem("yatzy_coins", coins.toString());
  coinsCount.textContent = `🪙 ${coins.toLocaleString()}`;
}

function updateXPUI() {
  level = Math.floor(xp / 500) + 1;
  const currentLevelXP = xp % 500;
  const percent = Math.min((currentLevelXP / 500) * 100, 100);

  xpBarFill.style.width = `${percent}%`;
  xpText.textContent = currentLevelXP;
  playerLevelBadge.textContent = `Lvl ${level}`;
}

// --- Achievements System ---
function unlockAchievement(id) {
  if (achievements[id]) return;
  achievements[id] = true;
  try {
    localStorage.setItem("yatzy_achievements", JSON.stringify(achievements));
  } catch (e) {}

  const def = achievementDefinitions[id];
  if (def) {
    triggerToast(`🏆 ${def.title}`, def.desc);
    playSound("achievement");
    addCoins(100);
  }
  renderAchievementsShowcase();
}

function renderAchievementsShowcase() {
  achievementsGrid.innerHTML = "";
  let unlockedCount = 0;

  Object.keys(achievementDefinitions).forEach(id => {
    const def = achievementDefinitions[id];
    const isUnlocked = achievements[id];
    if (isUnlocked) unlockedCount++;

    const div = document.createElement("div");
    div.className = `achievement-badge ${isUnlocked ? "unlocked" : ""}`;
    div.title = `${def.title}: ${def.desc}`;
    div.textContent = def.icon;
    achievementsGrid.appendChild(div);
  });

  achievementsUnlockedCount.textContent = unlockedCount;
}

function triggerToast(title, desc) {
  const toast = document.createElement("div");
  toast.className = "toast-notification";
  toast.innerHTML = `
    <div class="toast-icon">✨</div>
    <div>
      <div class="toast-title">${title}</div>
      <div class="toast-desc">${desc}</div>
    </div>
  `;
  toastContainer.appendChild(toast);
  setTimeout(() => toast.remove(), 3500);
}

// --- Dice Pip Rendering ---
function renderDie(dieElement, value, isLocked) {
  dieElement.innerHTML = "";
  if (isLocked) {
    dieElement.classList.add("locked");
  } else {
    dieElement.classList.remove("locked");
  }

  if (value === 0) return;

  const pipPositions = {
    1: [5],
    2: [3, 7],
    3: [3, 5, 7],
    4: [1, 3, 7, 9],
    5: [1, 3, 5, 7, 9],
    6: [1, 3, 4, 6, 7, 9]
  };

  const activePips = pipPositions[value] || [];

  for (let cell = 1; cell <= 9; cell++) {
    if (activePips.includes(cell)) {
      const pip = document.createElement("div");
      pip.className = "pip";
      pip.style.gridArea = `${Math.ceil(cell / 3)} / ${((cell - 1) % 3) + 1}`;
      dieElement.appendChild(pip);
    }
  }
}

function updateDiceUI() {
  diceElements.forEach((dieEl, i) => {
    renderDie(dieEl, dice[i], locked[i]);
  });
}

// --- Roll Engine ---
function rollDice() {
  if (rollsLeft === 0 || isBotThinking) return;

  triggerCameraShake();
  playSound("roll");
  hasRolledAtLeastOnce = true;
  unlockAchievement("firstRoll");

  diceElements.forEach((dieEl, i) => {
    if (!locked[i]) {
      dieEl.classList.add("rolling");
    }
  });

  rollBtn.disabled = true;

  setTimeout(() => {
    for (let i = 0; i < dice.length; i++) {
      if (!locked[i]) {
        dice[i] = Math.floor(Math.random() * 6) + 1;
      }
    }

    rollsLeft--;
    rollsLeftSpan.textContent = rollsLeft;

    diceElements.forEach((dieEl) => dieEl.classList.remove("rolling"));

    if (rollsLeft > 0) {
      if (!isBotThinking) rollBtn.disabled = false;
      instructionText.textContent = "Click dice to hold/unlock, or roll again";
    } else {
      rollBtn.disabled = true;
      instructionText.textContent = "No rolls left! Select a category on the scorecard";
    }

    updateDiceUI();
    updateScorePreviews();
    clearRecommendedHighlights();
    updateTurnBanner();
  }, 350);
}

function toggleLock(index) {
  if (!hasRolledAtLeastOnce || rollsLeft === 0 || isBotThinking) return;
  if (gameMode === "bot" && currentPlayer === 2) return;

  locked[index] = !locked[index];
  playSound("lock");
  updateDiceUI();
}

// --- Score Calculation Rules ---
function getFrequencyMap(diceArr) {
  const freq = {};
  for (const val of diceArr) {
    freq[val] = (freq[val] || 0) + 1;
  }
  return freq;
}

function calculateCategoryScore(key, diceArr) {
  const sumAll = () => diceArr.reduce((a, b) => a + b, 0);
  const freq = getFrequencyMap(diceArr);
  const counts = Object.values(freq);

  switch (key) {
    case "ones": return diceArr.filter(d => d === 1).length * 1;
    case "twos": return diceArr.filter(d => d === 2).length * 2;
    case "threes": return diceArr.filter(d => d === 3).length * 3;
    case "fours": return diceArr.filter(d => d === 4).length * 4;
    case "fives": return diceArr.filter(d => d === 5).length * 5;
    case "sixes": return diceArr.filter(d => d === 6).length * 6;

    case "threeKind": return Math.max(...counts, 0) >= 3 ? sumAll() : 0;
    case "fourKind": return Math.max(...counts, 0) >= 4 ? sumAll() : 0;
    case "fullHouse": return ((counts.includes(3) && counts.includes(2)) || counts.includes(5)) ? 25 : 0;

    case "smallStraight": {
      const sorted = [...new Set(diceArr)].sort((a, b) => a - b);
      const straights = [[1,2,3,4], [2,3,4,5], [3,4,5,6]];
      return straights.some(st => st.every(num => sorted.includes(num))) ? 30 : 0;
    }

    case "largeStraight": {
      const sorted = [...new Set(diceArr)].sort((a, b) => a - b);
      const straights = [[1,2,3,4,5], [2,3,4,5,6]];
      return straights.some(st => st.every(num => sorted.includes(num))) ? 40 : 0;
    }

    case "yatzy": return counts.includes(5) ? 50 : 0;
    case "chance": return sumAll();
    default: return 0;
  }
}

// --- Score Preview & Selection ---
function updateScorePreviews() {
  scoreRows.forEach(row => {
    const key = row.dataset.key;
    const p1Span = row.querySelector(".p1-val");
    const p2Span = row.querySelector(".p2-val");

    if (scores.p1[key] !== null) {
      p1Span.textContent = scores.p1[key];
      p1Span.className = "score-value p1-val used";
    } else if (currentPlayer === 1 && hasRolledAtLeastOnce && !isBotThinking) {
      p1Span.textContent = calculateCategoryScore(key, dice);
      p1Span.className = "score-value p1-val preview active-turn";
    } else {
      p1Span.textContent = "-";
      p1Span.className = "score-value p1-val";
    }

    if (scores.p2[key] !== null) {
      p2Span.textContent = scores.p2[key];
      p2Span.className = "score-value p2-val p2-col used" + (gameMode === "solo" ? " hidden" : "");
    } else if (currentPlayer === 2 && hasRolledAtLeastOnce && gameMode === "2p") {
      p2Span.textContent = calculateCategoryScore(key, dice);
      p2Span.className = "score-value p2-val p2-col preview active-turn";
    } else {
      p2Span.textContent = "-";
      p2Span.className = "score-value p2-val p2-col" + (gameMode === "solo" ? " hidden" : "");
    }

    const currentScoreObj = currentPlayer === 1 ? scores.p1 : scores.p2;
    if (currentScoreObj[key] !== null || !hasRolledAtLeastOnce || (gameMode === "bot" && currentPlayer === 2)) {
      row.classList.add("disabled");
    } else {
      row.classList.remove("disabled");
    }
  });
}

function selectScoreCategory(key, targetPlayer, event) {
  if (targetPlayer !== currentPlayer) return;
  if (!hasRolledAtLeastOnce || isBotThinking) return;

  const playerObj = currentPlayer === 1 ? scores.p1 : scores.p2;
  if (playerObj[key] !== null) return;

  // Save for undo
  lastMoveState = {
    key: key,
    player: currentPlayer,
    score: playerObj[key],
    roundCount: roundCount,
    scoresP1: { ...scores.p1 },
    scoresP2: { ...scores.p2 }
  };
  undoBtn.disabled = false;

  const scoreEarned = calculateCategoryScore(key, dice);
  playerObj[key] = scoreEarned;

  addXP(15 + scoreEarned);

  // Spawn floating popup at click location
  const rect = event ? event.currentTarget.getBoundingClientRect() : { left: window.innerWidth / 2, top: window.innerHeight / 2 };
  spawnFloatingHitPopup(rect.left + 50, rect.top - 10, `+${scoreEarned} ${key.toUpperCase()}`);

  // Celebrations & Achievements
  if (key === "yatzy" && scoreEarned === 50) {
    unlockAchievement("yahtzeeMaster");
    addCoins(50);
    triggerBigHitCelebration("✨ YATZY! ✨", "+50 PTS!");
  } else if (key === "largeStraight" && scoreEarned === 40) {
    unlockAchievement("straightShooter");
    triggerBigHitCelebration("🌟 LARGE STRAIGHT! 🌟", "+40 PTS!");
  } else if (key === "smallStraight" && scoreEarned === 30) {
    triggerBigHitCelebration("🎲 SMALL STRAIGHT! 🎲", "+30 PTS!");
  } else if (key === "fullHouse" && scoreEarned === 25) {
    triggerBigHitCelebration("🏠 FULL HOUSE! 🏠", "+25 PTS!");
  } else {
    playSound("score");
  }

  updateTotals();
  clearRecommendedHighlights();
  advanceTurn();
}

function undoLastMove() {
  if (!lastMoveState) return;

  scores.p1 = { ...lastMoveState.scoresP1 };
  scores.p2 = { ...lastMoveState.scoresP2 };
  roundCount = lastMoveState.roundCount;
  currentPlayer = lastMoveState.player;

  roundCountSpan.textContent = roundCount;
  roundCountText.textContent = roundCount;
  lastMoveState = null;
  undoBtn.disabled = true;

  updateTotals();
  updateTurnBanner();
  newTurn();
  triggerToast("↩️ Move Undone", "Reverted to previous turn state");
}

function showBestMoveHint() {
  if (!hasRolledAtLeastOnce || isBotThinking) return;

  clearRecommendedHighlights();
  const playerObj = currentPlayer === 1 ? scores.p1 : scores.p2;
  const unfilledKeys = Object.keys(playerObj).filter(k => playerObj[k] === null);

  let bestKey = null;
  let maxVal = -1;

  unfilledKeys.forEach(k => {
    const val = calculateCategoryScore(k, dice);
    let weight = val;

    if (k === "yatzy" && val === 50) weight += 100;
    if (k === "largeStraight" && val === 40) weight += 50;

    if (weight > maxVal) {
      maxVal = weight;
      bestKey = k;
    }
  });

  if (bestKey) {
    const targetRow = document.querySelector(`.score-row[data-key="${bestKey}"]`);
    if (targetRow) {
      targetRow.classList.add("recommended");
      triggerToast("💡 Best Move Hint", `Recommended: ${bestKey.toUpperCase()} for +${calculateCategoryScore(bestKey, dice)} pts!`);
    }
  }
}

function clearRecommendedHighlights() {
  scoreRows.forEach(r => r.classList.remove("recommended"));
}

// --- Totals Calculation ---
function calculateTotalsForPlayer(playerScores) {
  let upperSubtotal = 0;
  ["ones", "twos", "threes", "fours", "fives", "sixes"].forEach(k => {
    if (playerScores[k] !== null) upperSubtotal += playerScores[k];
  });

  const bonus = upperSubtotal >= 63 ? 35 : 0;
  if (bonus > 0 && currentPlayer === 1) unlockAchievement("bonusHunter");

  let lowerSubtotal = 0;
  ["threeKind", "fourKind", "fullHouse", "smallStraight", "largeStraight", "yatzy", "chance"].forEach(k => {
    if (playerScores[k] !== null) lowerSubtotal += playerScores[k];
  });

  const grandTotal = upperSubtotal + bonus + lowerSubtotal;
  return { upperSubtotal, bonus, lowerSubtotal, grandTotal };
}

function updateTotals() {
  const t1 = calculateTotalsForPlayer(scores.p1);
  document.getElementById("upperSubtotalP1").textContent = t1.upperSubtotal;
  document.getElementById("bonusP1").textContent = t1.bonus;
  document.getElementById("lowerSubtotalP1").textContent = t1.lowerSubtotal;
  document.getElementById("grandTotalP1").textContent = t1.grandTotal;

  document.getElementById("bonusProgressText").textContent = `${Math.min(t1.upperSubtotal, 63)}/63`;

  if (gameMode !== "solo") {
    const t2 = calculateTotalsForPlayer(scores.p2);
    document.getElementById("upperSubtotalP2").textContent = t2.upperSubtotal;
    document.getElementById("bonusP2").textContent = t2.bonus;
    document.getElementById("lowerSubtotalP2").textContent = t2.lowerSubtotal;
    document.getElementById("grandTotalP2").textContent = t2.grandTotal;
  }
}

// --- Turn & Game Progress ---
function advanceTurn() {
  if (gameMode === "solo") {
    if (roundCount >= 13) {
      endGame();
    } else {
      roundCount++;
      roundCountSpan.textContent = roundCount;
      roundCountText.textContent = roundCount;
      newTurn();
    }
  } else {
    if (currentPlayer === 1) {
      currentPlayer = 2;
      newTurn();
      if (gameMode === "bot") {
        playBotTurn();
      }
    } else {
      if (roundCount >= 13) {
        endGame();
      } else {
        roundCount++;
        roundCountSpan.textContent = roundCount;
        roundCountText.textContent = roundCount;
        currentPlayer = 1;
        newTurn();
      }
    }
  }

  updateProgressPercent();
  updateTurnBanner();
}

function updateProgressPercent() {
  const percent = Math.min(Math.round(((roundCount - 1) / 13) * 100), 100);
  gameProgressFill.style.width = `${percent}%`;
  progressPercent.textContent = `${percent}%`;
}

function updateTurnBanner() {
  turnBanner.className = "turn-banner";
  p1Legend.classList.remove("active");
  p2Legend.classList.remove("active");

  if (currentPlayer === 1) {
    turnBanner.classList.add("p1-turn");
    turnBanner.innerHTML = `<span class="turn-icon">👤</span><span>PLAYER 1 | 🎲 ${rollsLeft} Rolls Left</span>`;
    p1Legend.classList.add("active");
  } else {
    if (gameMode === "bot") {
      turnBanner.classList.add("bot-turn");
      turnBanner.innerHTML = `<span class="turn-icon">🤖</span><span>YATZYBOT (${botDifficulty.toUpperCase()}) | 🎲 ${rollsLeft} Rolls Left</span>`;
      p2Legend.classList.add("active");
    } else {
      turnBanner.classList.add("p2-turn");
      turnBanner.innerHTML = `<span class="turn-icon">👤</span><span>PLAYER 2 | 🎲 ${rollsLeft} Rolls Left</span>`;
      p2Legend.classList.add("active");
    }
  }
}

function newTurn() {
  rollsLeft = 3;
  hasRolledAtLeastOnce = false;
  locked = [false, false, false, false, false];
  dice = [1, 1, 1, 1, 1];

  rollsLeftSpan.textContent = rollsLeft;
  if (!isBotThinking) rollBtn.disabled = false;

  if (gameMode === "bot" && currentPlayer === 2) {
    instructionText.textContent = "YatzyBot is strategizing...";
  } else {
    const pName = gameMode === "2p" ? `Player ${currentPlayer}` : "Player 1";
    instructionText.textContent = `${pName}: Click "Roll Dice" to start turn`;
  }

  updateDiceUI();
  updateScorePreviews();
}

// --- AI Bot Engine ---
function playBotTurn() {
  isBotThinking = true;
  rollBtn.disabled = true;
  updateTurnBanner();

  setTimeout(() => {
    botPerformRoll(() => {
      setTimeout(() => {
        evaluateBotHolds();
        updateDiceUI();

        setTimeout(() => {
          botPerformRoll(() => {
            setTimeout(() => {
              evaluateBotHolds();
              updateDiceUI();

              setTimeout(() => {
                botPerformRoll(() => {
                  setTimeout(() => {
                    chooseBestBotCategory();
                    isBotThinking = false;
                    rollBtn.disabled = false;
                  }, 800);
                });
              }, 800);
            });
          }, 800);
        });
      }, 800);
    });
  }, 600);
}

function botPerformRoll(callback) {
  if (rollsLeft === 0) {
    if (callback) callback();
    return;
  }

  playSound("roll");
  hasRolledAtLeastOnce = true;

  diceElements.forEach((dieEl, i) => {
    if (!locked[i]) dieEl.classList.add("rolling");
  });

  setTimeout(() => {
    for (let i = 0; i < dice.length; i++) {
      if (!locked[i]) {
        dice[i] = Math.floor(Math.random() * 6) + 1;
      }
    }
    rollsLeft--;
    rollsLeftSpan.textContent = rollsLeft;
    diceElements.forEach((dieEl) => dieEl.classList.remove("rolling"));

    updateDiceUI();
    updateScorePreviews();
    updateTurnBanner();
    if (callback) callback();
  }, 350);
}

function evaluateBotHolds() {
  if (botDifficulty === "easy") {
    if (Math.random() > 0.4) {
      locked = dice.map(() => Math.random() > 0.5);
    }
    return;
  }

  const freq = getFrequencyMap(dice);
  const counts = Object.values(freq);

  if (counts.includes(5)) {
    locked = [true, true, true, true, true];
    return;
  }

  if (counts.includes(4)) {
    const val = Number(Object.keys(freq).find(k => freq[k] === 4));
    locked = dice.map(d => d === val);
    return;
  }

  if (counts.includes(3)) {
    const val3 = Number(Object.keys(freq).find(k => freq[k] === 3));
    if (counts.includes(2) && scores.p2.fullHouse === null) {
      locked = [true, true, true, true, true];
    } else {
      locked = dice.map(d => d === val3);
    }
    return;
  }

  const sorted = [...new Set(dice)].sort((a, b) => a - b);
  if (scores.p2.largeStraight === null || scores.p2.smallStraight === null) {
    const straights = [[1,2,3,4,5], [2,3,4,5,6], [1,2,3,4], [2,3,4,5], [3,4,5,6]];
    for (const st of straights) {
      if (st.every(num => sorted.includes(num))) {
        locked = dice.map(d => st.includes(d));
        return;
      }
    }
  }

  if (counts.includes(2)) {
    const pairs = Object.keys(freq).filter(k => freq[k] === 2).map(Number).sort((a, b) => b - a);
    locked = dice.map(d => d === pairs[0]);
    return;
  }

  const maxVal = Math.max(...dice);
  if (maxVal >= 4) {
    locked = dice.map(d => d === maxVal);
  } else {
    locked = [false, false, false, false, false];
  }
}

function chooseBestBotCategory() {
  const unfilledKeys = Object.keys(scores.p2).filter(k => scores.p2[k] === null);
  if (unfilledKeys.length === 0) return;

  let bestKey = unfilledKeys[0];
  let maxWeight = -1;

  for (const key of unfilledKeys) {
    const potentialScore = calculateCategoryScore(key, dice);
    let weight = potentialScore;

    if (key === "yatzy" && potentialScore === 50) weight += 100;
    if (key === "largeStraight" && potentialScore === 40) weight += 50;
    if (key === "smallStraight" && potentialScore === 30) weight += 35;
    if (key === "fullHouse" && potentialScore === 25) weight += 30;

    if (weight > maxWeight) {
      maxWeight = weight;
      bestKey = key;
    }
  }

  const scoreEarned = calculateCategoryScore(bestKey, dice);
  scores.p2[bestKey] = scoreEarned;

  if (bestKey === "yatzy" && scoreEarned === 50) {
    triggerBigHitCelebration("🤖 YATZY! 🤖", "+50 PTS!");
  } else if (bestKey === "largeStraight" && scoreEarned === 40) {
    triggerBigHitCelebration("🤖 LARGE STRAIGHT! 🤖", "+40 PTS!");
  } else {
    playSound("score");
  }

  updateTotals();
  advanceTurn();
}

// --- Game Reset & Game Over ---
function setGameMode(newMode) {
  gameMode = newMode;
  modeBtns.forEach(btn => {
    btn.classList.toggle("active", btn.dataset.mode === newMode);
  });

  if (newMode === "solo") {
    p2Legend.classList.add("hidden");
    p2Cols.forEach(col => col.classList.add("hidden"));
    modalP2Box.classList.add("hidden");
    botDiffSelect.classList.add("hidden");
  } else if (newMode === "bot") {
    p2Legend.classList.remove("hidden");
    p2Cols.forEach(col => col.classList.remove("hidden"));
    modalP2Box.classList.remove("hidden");
    botDiffSelect.classList.remove("hidden");
    modalP2Name.textContent = "YatzyBot";
  } else {
    p2Legend.classList.remove("hidden");
    p2Cols.forEach(col => col.classList.remove("hidden"));
    modalP2Box.classList.remove("hidden");
    botDiffSelect.classList.add("hidden");
    modalP2Name.textContent = "Player 2";
  }

  resetGame();
}

function resetGame() {
  roundCount = 1;
  currentPlayer = 1;
  isBotThinking = false;
  lastMoveState = null;
  undoBtn.disabled = true;
  roundCountSpan.textContent = roundCount;
  roundCountText.textContent = roundCount;

  scores.p1 = { ones: null, twos: null, threes: null, fours: null, fives: null, sixes: null, threeKind: null, fourKind: null, fullHouse: null, smallStraight: null, largeStraight: null, yatzy: null, chance: null };
  scores.p2 = { ones: null, twos: null, threes: null, fours: null, fives: null, sixes: null, threeKind: null, fourKind: null, fullHouse: null, smallStraight: null, largeStraight: null, yatzy: null, chance: null };

  document.getElementById("upperSubtotalP1").textContent = "0";
  document.getElementById("bonusP1").textContent = "0";
  document.getElementById("lowerSubtotalP1").textContent = "0";
  document.getElementById("grandTotalP1").textContent = "0";

  document.getElementById("upperSubtotalP2").textContent = "0";
  document.getElementById("bonusP2").textContent = "0";
  document.getElementById("lowerSubtotalP2").textContent = "0";
  document.getElementById("grandTotalP2").textContent = "0";

  gameOverModal.classList.add("hidden");
  updateProgressPercent();
  updateTurnBanner();
  newTurn();
}

function endGame() {
  playSound("victory");
  fireConfetti(160);

  const t1 = calculateTotalsForPlayer(scores.p1);
  const t2 = calculateTotalsForPlayer(scores.p2);

  finalScoreP1.textContent = t1.grandTotal;
  finalScoreP2.textContent = t2.grandTotal;

  finalUpperComp.textContent = gameMode === "solo" ? `${t1.upperSubtotal}` : `${t1.upperSubtotal} vs ${t2.upperSubtotal}`;
  finalBonusComp.textContent = gameMode === "solo" ? `${t1.bonus}` : `${t1.bonus} vs ${t2.bonus}`;
  finalLowerComp.textContent = gameMode === "solo" ? `${t1.lowerSubtotal}` : `${t1.lowerSubtotal} vs ${t2.lowerSubtotal}`;

  // XP & Economy
  stats.gamesPlayed++;
  stats.totalScore += t1.grandTotal;
  if (t1.grandTotal > stats.highScore) stats.highScore = t1.grandTotal;

  let earnedXP = 100 + Math.floor(t1.grandTotal / 2);
  let earnedCoins = 100;
  let isWon = false;

  if (gameMode === "solo") {
    modalTitle.textContent = "🎉 Game Completed!";
    winnerSubtitle.textContent = `Final Score: ${t1.grandTotal} pts`;
    if (t1.grandTotal >= 200) unlockAchievement("centurion");
    if (t1.grandTotal >= 250) unlockAchievement("highScorer");
  } else {
    const p2NameStr = gameMode === "bot" ? "YatzyBot" : "Player 2";
    if (t1.grandTotal > t2.grandTotal) {
      modalTitle.textContent = "🏆 Victory!";
      winnerSubtitle.textContent = "Player 1 Wins!";
      stats.wins++;
      isWon = true;
      earnedXP += 100;
      earnedCoins += 100;

      if (gameMode === "bot" && botDifficulty === "hard") {
        unlockAchievement("botSlayer");
      }
    } else if (t2.grandTotal > t1.grandTotal) {
      modalTitle.textContent = gameMode === "bot" ? "🤖 Bot Victory!" : "🏆 Victory!";
      winnerSubtitle.textContent = `${p2NameStr} Wins!`;
    } else {
      modalTitle.textContent = "🤝 It's a Tie!";
      winnerSubtitle.textContent = `Both scored ${t1.grandTotal} pts!`;
    }
  }

  addXP(earnedXP);
  addCoins(earnedCoins);
  earnedXPText.textContent = `+${earnedXP} XP`;
  earnedCoinsText.textContent = `+${earnedCoins} Coins`;

  matchHistory.unshift({
    mode: gameMode.toUpperCase(),
    score: t1.grandTotal,
    result: isWon ? "WIN" : "COMPLETED",
    date: new Date().toLocaleDateString()
  });
  matchHistory = matchHistory.slice(0, 10);

  saveStatsData();
  updateQuickStatsUI();

  gameOverModal.classList.remove("hidden");
}

function saveStatsData() {
  try {
    localStorage.setItem("yatzy_stats", JSON.stringify(stats));
    localStorage.setItem("yatzy_history", JSON.stringify(matchHistory));
  } catch (e) {}
}

function updateQuickStatsUI() {
  document.getElementById("quickBestScore").textContent = stats.highScore;
  const winRate = stats.gamesPlayed > 0 ? Math.round((stats.wins / stats.gamesPlayed) * 100) : 0;
  document.getElementById("quickWinRate").textContent = `${winRate}%`;
}

function openStatsDashboard() {
  statGamesPlayed.textContent = stats.gamesPlayed;
  const winRate = stats.gamesPlayed > 0 ? Math.round((stats.wins / stats.gamesPlayed) * 100) : 0;
  statWinRate.textContent = `${winRate}%`;
  statHighScore.textContent = stats.highScore;
  const avg = stats.gamesPlayed > 0 ? Math.round(stats.totalScore / stats.gamesPlayed) : 0;
  statAvgScore.textContent = avg;

  matchHistoryList.innerHTML = "";
  if (matchHistory.length === 0) {
    matchHistoryList.innerHTML = `<li class="empty-state">No matches recorded yet</li>`;
  } else {
    matchHistory.forEach(item => {
      const li = document.createElement("li");
      li.innerHTML = `<span>${item.date} (${item.mode})</span><strong>${item.score} pts [${item.result}]</strong>`;
      matchHistoryList.appendChild(li);
    });
  }

  statsModal.classList.remove("hidden");
}

// --- Event Listeners Setup ---
function setupEventListeners() {
  rollBtn.addEventListener("click", rollDice);
  restartBtn.addEventListener("click", resetGame);
  modalPlayAgainBtn.addEventListener("click", resetGame);
  hintBtn.addEventListener("click", showBestMoveHint);
  undoBtn.addEventListener("click", undoLastMove);

  openStatsBtn.addEventListener("click", openStatsDashboard);
  closeStatsBtn.addEventListener("click", () => statsModal.classList.add("hidden"));

  modeBtns.forEach(btn => {
    btn.addEventListener("click", () => setGameMode(btn.dataset.mode));
  });

  themeSelect.addEventListener("change", (e) => {
    const val = e.target.value;
    document.documentElement.setAttribute("data-theme", val);
    localStorage.setItem("yatzy_theme", val);
  });

  skinSelect.addEventListener("change", (e) => {
    const val = e.target.value;
    document.documentElement.setAttribute("data-skin", val);
    localStorage.setItem("yatzy_skin", val);
  });

  botDiffSelect.addEventListener("change", (e) => {
    botDifficulty = e.target.value;
  });

  soundToggleBtn.addEventListener("click", () => {
    soundEnabled = !soundEnabled;
    localStorage.setItem("yatzy_sound", soundEnabled ? "true" : "false");
    updateSoundIcon();
  });

  volumeSlider.addEventListener("input", (e) => {
    volumeLevel = parseFloat(e.target.value);
    localStorage.setItem("yatzy_volume", volumeLevel.toString());
  });

  diceElements.forEach((die, index) => {
    die.addEventListener("click", () => toggleLock(index));
    die.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        toggleLock(index);
      }
    });
  });

  scoreRows.forEach(row => {
    row.addEventListener("click", (e) => {
      const key = row.dataset.key;
      selectScoreCategory(key, currentPlayer, e);
    });
  });
}

// Start Game on DOM Load
document.addEventListener("DOMContentLoaded", init);
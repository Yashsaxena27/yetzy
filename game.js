let dice = [0, 0, 0, 0, 0];
let locked = [false, false, false, false, false];
let rollsLeft = 3;

let scores = {
  1: null,
  2: null,
  3: null,
  4: null,
  5: null,
  6: null
};

const diceElements = document.querySelectorAll(".die");
const rollBtn = document.getElementById("rollBtn");
const rollsLeftSpan = document.getElementById("rollsLeft");
const resetBtn = document.getElementById("resetBtn");

function rollSingleDie() {
  return Math.floor(Math.random() * 6) + 1;
}

function rollDice() {
  if (rollsLeft === 0) return;

  for (let i = 0; i < dice.length; i++) {
    if (!locked[i]) {
      dice[i] = rollSingleDie();
    }
  }

  rollsLeft--;
  if (rollsLeft === 0) {
  rollBtn.disabled = true;
}
  updateUI();
  console.log("Dice:", dice);
console.log("Locked:", locked);
console.log("Rolls Left:", rollsLeft);
}

function updateUI() {
  for (let i = 0; i < dice.length; i++) {
    diceElements[i].textContent = dice[i];

    if (locked[i]) {
      diceElements[i].classList.add("locked");
    } else {
      diceElements[i].classList.remove("locked");
    }
  }

  rollsLeftSpan.textContent = rollsLeft;
}

function toggleLock(index) {
  if (rollsLeft === 3 || rollsLeft === 0) return;

  locked[index] = !locked[index];
  updateUI();
}

// Event listeners
rollBtn.addEventListener("click", rollDice);
resetBtn.addEventListener("click", newTurn);

diceElements.forEach((die, index) => {
  die.addEventListener("click", () => {
    toggleLock(index);
  });
});

updateUI();

function newTurn() {
  rollsLeft = 3;

  for (let i = 0; i < locked.length; i++) {
    locked[i] = false;
  }

  for (let i = 0; i < dice.length; i++) {
    dice[i] = 0;
  }

  rollBtn.disabled = false;
  updateUI();
}

function calculateNumberScore(number) {
  let total = 0;

  for (let i = 0; i < dice.length; i++) {
    if (dice[i] === number) {
      total += number;
    }
  }

  return total;
}

const scoreRows = document.querySelectorAll(".score-row");

scoreRows.forEach(row => {
  row.addEventListener("click", () => {

    if (rollsLeft === 3) return; // must roll first

    const value = parseInt(row.dataset.value);

    if (scores[value] !== null) return;

    const result = calculateNumberScore(value);

    scores[value] = result;

    row.querySelector(".score").textContent = result;
    row.classList.add("used");
  updateTotals();
    newTurn(); // reset for next turn
  });
});


function getFrequencyMap() {
  let freq = {};

  for (let i = 0; i < dice.length; i++) {
    let value = dice[i];

    if (freq[value]) {
      freq[value]++;
    } else {
      freq[value] = 1;
    }
  }

  return freq;
}

function calculateThreeOfAKind() {
  const freq = getFrequencyMap();

  for (let value in freq) {
    if (freq[value] >= 3) {
      return dice.reduce((sum, d) => sum + d, 0);
    }
  }

  return 0;
}


function calculateFourOfAKind() {
  const freq = getFrequencyMap();

  for (let value in freq) {
    if (freq[value] >= 4) {
      return dice.reduce((sum, d) => sum + d, 0);
    }
  }

  return 0;
}

function calculateFullHouse() {
  const freq = getFrequencyMap();
  let hasThree = false;
  let hasTwo = false;

  for (let value in freq) {
    if (freq[value] === 3) hasThree = true;
    if (freq[value] === 2) hasTwo = true;
  }

  if (hasThree && hasTwo) {
    return 25; // standard Yatzy full house score
  }

  return 0;
}

scoreRows.forEach(row => {
  row.addEventListener("click", () => {

    if (rollsLeft === 3) return;

    const numberValue = row.dataset.value;
    const type = row.dataset.type;

    let result = 0;

    if (numberValue) {
      const num = parseInt(numberValue);
      if (scores[num] !== null) return;
      result = calculateNumberScore(num);
      scores[num] = result;
    }

    if (type === "threeKind") result = calculateThreeOfAKind();
    if (type === "fourKind") result = calculateFourOfAKind();
    if (type === "fullHouse") result = calculateFullHouse();
    if (type === "smallStraight") result = calculateSmallStraight();
if (type === "largeStraight") result = calculateLargeStraight();
if (type === "yatzy") result = calculateYatzy();
if (type === "chance") result = calculateChance();
    row.querySelector(".score").textContent = result;
    row.classList.add("used");

    newTurn();
  });
});

function calculateSmallStraight() {
  const sorted = [...new Set(dice)].sort((a, b) => a - b);

  const small = [1, 2, 3, 4, 5];

  if (small.every(num => sorted.includes(num))) {
    return 30;
  }

  return 0;
}

function calculateLargeStraight() {
  const sorted = [...new Set(dice)].sort((a, b) => a - b);

  const large = [2, 3, 4, 5, 6];

  if (large.every(num => sorted.includes(num))) {
    return 40;
  }

  return 0;
}

function calculateYatzy() {
  const freq = getFrequencyMap();

  for (let value in freq) {
    if (freq[value] === 5) {
      return 50;
    }
  }

  return 0;
}

function calculateChance() {
  return dice.reduce((sum, d) => sum + d, 0);
}

function updateTotals() {
  let upperSubtotal = 0;
  let lowerTotal = 0;

  // Upper section (1–6)
  for (let i = 1; i <= 6; i++) {
    if (scores[i] !== null) {
      upperSubtotal += scores[i];
    }
  }

  // Lower section rows
  const lowerRows = document.querySelectorAll(
    '[data-type="threeKind"], \
     [data-type="fourKind"], \
     [data-type="fullHouse"], \
     [data-type="smallStraight"], \
     [data-type="largeStraight"], \
     [data-type="yatzy"], \
     [data-type="chance"]'
  );

  lowerRows.forEach(row => {
    const value = parseInt(row.querySelector(".score").textContent);
    if (!isNaN(value)) {
      lowerTotal += value;
    }
  });

  // Bonus
  let bonus = upperSubtotal >= 63 ? 35 : 0;

  let grandTotal = upperSubtotal + bonus + lowerTotal;

  document.getElementById("upperSubtotal").textContent = upperSubtotal;
  document.getElementById("bonus").textContent = bonus;
  document.getElementById("grandTotal").textContent = grandTotal;
}
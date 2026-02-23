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

    newTurn(); // reset for next turn
  });
});
# Yetzy (Yatzy Dice Game)

A web-based Yatzy (Yahtzee) dice game built using pure HTML, CSS, and JavaScript.

## Project Idea

Yetzy is a classic 5-dice game played directly in the browser. Players roll five dice up to 3 times per turn to form scoring combinations across 13 rounds. The goal is to maximize your total score by strategically choosing which dice to keep and which score category to fill.

## Game Flow

1. **Start Game**: Select your preferred game mode (Single Player, vs AI Bot, or 2-Player Local).
2. **Roll Dice**: Press the Roll button to roll any unheld dice (up to 3 rolls per turn).
3. **Hold Dice**: Tap/Click individual dice to lock or unlock them between rolls.
4. **Choose Category**: Select an available slot on the scorecard to register your turn's score.
5. **Next Turn**: Repeat the process for 13 rounds until all categories are filled.
6. **Game Over**: View your total score, earn XP, unlock achievements, and view match stats.

## Key Features

- **Game Modes**: Solo play, vs AI (Easy, Medium, Hard), and 2-Player Local Pass & Play.
- **Customization**: Customizable board themes and dice skins.
- **Audio & Animations**: Sound effects and particle celebrations.
- **Stats & Progression**: Tracks high scores, win rate, XP leveling system, and achievements.
- **No Dependencies**: Runs entirely in the browser with zero external libraries or build tools.

## How to Run

1. Clone or download the repository:
   ```bash
   git clone https://github.com/Yashsaxena27/yetzy.git
   cd yetzy
   ```

2. Open `index.html` directly in your browser, or launch a local server:
   ```bash
   python -m http.server 8080
   ```
   Then open `http://localhost:8080` in your browser.

## Project Structure

- `index.html`: Main HTML layout, modals, and scorecard UI.
- `style.css`: Visual styling, themes, layout, and animations.
- `game.js`: Game engine, dice physics, AI logic, and local storage state.

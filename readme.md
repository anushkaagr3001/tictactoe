# Tic Tac Toe | AI Challenge

A browser-based Tic-Tac-Toe game with multiple board sizes, local two-player
matches, and an AI opponent. It is built with plain HTML, CSS, and JavaScript;
no build step or package installation is required.

## Features

- **Play against the AI** or share the keyboard for a local two-player game.
- **Choose a board size:** 3x3, 4x4, or 5x5.
- **Choose your mark:** play as X (first) or O (second) against the AI.
- **Select an AI difficulty:** Easy, Medium, or Hard.
- **Use hints, undo moves, and start a new round** at any time.
- **Keep track of wins, losses, draws, and winning streaks.**
- **Toggle sound effects** and use keyboard shortcuts.
- Responsive layout, screen-reader labels for board cells, and reduced-motion
  support.

## Rules

X always takes the first turn. On your turn, choose an empty square; players
alternate until someone completes the required line or the board is full.

| Board | Line needed to win |
| --- | --- |
| 3x3 | 3 marks in a row |
| 4x4 | 4 marks in a row |
| 5x5 | 4 marks in a row |

Lines may be horizontal, vertical, or diagonal. A winning line is highlighted
on the board.

## AI difficulty

- **Easy:** chooses an available square at random.
- **Medium:** chooses a move using a shallow search 70% of the time and a
  random move the rest of the time.
- **Hard:** searches the full game tree on 3x3, where the AI plays optimally.
  On 4x4 and 5x5, it searches to a limited depth and evaluates promising lines,
  so it can be challenging but is not guaranteed to find the best move.

The **Hint** button recommends a move using the deeper search for the selected
board size. In an AI game, hints are available on your turn.

## Getting started

1. Download or clone this repository.
2. Open `index.html` in a modern web browser.
   - Alternatively, serve the folder with a local development server such as
     VS Code Live Server.
3. Choose a mode and board size, then play.

There are no dependencies, build commands, or server-side components.

## Controls

- **Mouse or touch:** select a square on the board.
- **1–9:** play the corresponding square on a 3x3 board, in reading order
  (1 is top-left and 9 is bottom-right).
- **U:** undo.
- **H:** show a hint.
- **R:** start a new round.

Keyboard shortcuts do not trigger when Ctrl, Command, or Alt is held. Number
keys are only supported on the 3x3 board.

## Scores and saved settings

Scores and the current game settings are saved in the browser's `localStorage`.
AI scores are kept separately for each board size and difficulty; local
two-player scores are kept separately for each board size. **Reset Scores**
clears the scores for the currently selected mode and configuration. If
browser storage is unavailable, the game still works, but settings and scores
may not persist after the page is closed.

## Technology

- HTML for the game interface
- CSS for layout, responsiveness, and animation
- Vanilla JavaScript for game state, persistence, sound, and AI search
- Minimax with alpha-beta pruning for AI move selection

## Author

**Anushka Aagrawal** · [GitHub: anushkaagr3001](https://github.com/anushkaagr3001)

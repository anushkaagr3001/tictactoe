# Tic Tac Toe | AI Challenge

Advanced browser Tic-Tac-Toe in **HTML, CSS and JavaScript**, powered by **Minimax with Alpha-Beta pruning**.

## Features

* **Modes:** vs AI or 2 Players (local)
* **Boards:** 3×3 (3 in a row), 4×4 and 5×5 (4 in a row)
* **Difficulty:** Easy (random), Medium (shallow search + mistakes), Hard (3×3 = unbeatable, larger boards = depth-limited search with a line-scoring heuristic)
* **Play as X or O**, undo, smart hint, win-line highlight, win streaks
* **Scores and settings saved** in localStorage (per mode / size / difficulty)
* Sound effects (mutable), keyboard shortcuts (1-9, U, H, R), screen-reader labels, mobile friendly

## Bugs fixed from v1

* AI move scheduled with `setTimeout` could still fire after Restart / difficulty change and play on the fresh board. Every round now has a token, so stale moves are cancelled.
* Winning-cell highlight stayed after restart. Board is now fully re-rendered each time.
* Hard AI always opened with the same move. It now picks randomly among equally-best moves.
* Clicks are locked while the AI thinks, and no input is possible after the game ends.

## Run

Open `index.html` in a browser (or use Live Server).

## Author

**Anushka Aagrawal** · GitHub: [anushkaagr3001](https://github.com/anushkaagr3001)

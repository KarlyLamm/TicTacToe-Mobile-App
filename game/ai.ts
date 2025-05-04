export type Player = 'X' | 'O' | null;
export type Board = Player[];

// Returns the index of the best move for the AI
export function getBestMove(board: Board, aiLetter: 'X' | 'O', userLetter: 'X' | 'O'): number {
  // Minimax wrapper
  let bestScore = -Infinity;
  let move = -1;
  for (let i = 0; i < 9; i++) {
    if (!board[i]) {
      board[i] = aiLetter;
      const score = minimax(board, 0, false, aiLetter, userLetter);
      board[i] = null;
      if (score > bestScore) {
        bestScore = score;
        move = i;
      }
    }
  }
  return move;
}

function minimax(board: Board, depth: number, isMaximizing: boolean, aiLetter: 'X' | 'O', userLetter: 'X' | 'O'): number {
  const winner = checkWinner(board);
  if (winner === aiLetter) return 10 - depth;
  if (winner === userLetter) return depth - 10;
  if (board.every(cell => cell)) return 0; // Draw

  if (isMaximizing) {
    let bestScore = -Infinity;
    for (let i = 0; i < 9; i++) {
      if (!board[i]) {
        board[i] = aiLetter;
        bestScore = Math.max(bestScore, minimax(board, depth + 1, false, aiLetter, userLetter));
        board[i] = null;
      }
    }
    return bestScore;
  } else {
    let bestScore = Infinity;
    for (let i = 0; i < 9; i++) {
      if (!board[i]) {
        board[i] = userLetter;
        bestScore = Math.min(bestScore, minimax(board, depth + 1, true, aiLetter, userLetter));
        board[i] = null;
      }
    }
    return bestScore;
  }
}

// Returns 'X', 'O', 'draw', or null
export function checkWinner(board: Board): Player | 'draw' {
  const WINNING_COMBINATIONS = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6]
  ];
  for (const combo of WINNING_COMBINATIONS) {
    const [a, b, c] = combo;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a];
    }
  }
  if (board.every(cell => cell)) return 'draw';
  return null;
} 
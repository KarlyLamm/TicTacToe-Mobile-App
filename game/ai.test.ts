import { Board, checkWinner, getBestMove } from './ai';

describe('Tic-Tac-Toe AI (Minimax)', () => {
  it('blocks immediate win', () => {
    // X | X | null
    // O | O | null
    // null | null | null
    const board: Board = ['X', 'X', null, 'O', 'O', null, null, null, null];
    const move = getBestMove([...board], 'O', 'X');
    expect(move).toBe(2); // AI must block at index 2
  });

  it('takes immediate win', () => {
    // O | O | null
    // X | X | null
    // null | null | null
    const board: Board = ['O', 'O', null, 'X', 'X', null, null, null, null];
    const move = getBestMove([...board], 'O', 'X');
    expect(move).toBe(2); // AI should win at index 2
  });

  it('blocks fork', () => {
    // X | null | null
    // null | O | null
    // null | null | X
    const board: Board = ['X', null, null, null, 'O', null, null, null, 'X'];
    const move = getBestMove([...board], 'O', 'X');
    // AI must block one of the fork positions (1, 3, 5, 7)
    expect([1, 3, 5, 7]).toContain(move);
  });

  it('takes center if available', () => {
    // X | null | null
    // null | null | null
    // null | null | O
    const board: Board = ['X', null, null, null, null, null, null, null, 'O'];
    const move = getBestMove([...board], 'O', 'X');
    expect(move).toBe(4); // Center is index 4
  });

  it('never loses (simulate full game)', () => {
    // Simulate a game where the user plays optimally and AI always responds
    // We'll play as X, AI as O, and user always takes the first available spot
    let board: Board = Array(9).fill(null);
    let userLetter: 'X' | 'O' = 'X';
    let aiLetter: 'X' | 'O' = 'O';
    let isXNext = true;
    let winner: any = null;
    for (let turn = 0; turn < 9 && !winner; turn++) {
      if ((isXNext && userLetter === 'X') || (!isXNext && userLetter === 'O')) {
        // User move: pick first available
        const idx = board.findIndex(cell => cell === null);
        board[idx] = userLetter;
      } else {
        // AI move
        const move = getBestMove([...board], aiLetter, userLetter);
        board[move] = aiLetter;
      }
      winner = checkWinner(board);
      isXNext = !isXNext;
    }
    // AI should never lose
    expect([aiLetter, 'draw', null].includes(winner as any)).toBe(true);
  });

  it('forces draw if cannot win', () => {
    // X | O | X
    // X | O | O
    // O | X | null
    const board: Board = ['X', 'O', 'X', 'X', 'O', 'O', 'O', 'X', null];
    const move = getBestMove([...board], 'O', 'X');
    expect(move).toBe(8); // Only move left
    const newBoard = [...board];
    newBoard[move] = 'O';
    expect(checkWinner(newBoard)).toBe('draw');
  });
}); 
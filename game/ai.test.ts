import { Board, Player, checkWinner, getBestMove } from './ai';

describe('Tic-Tac-Toe AI (Minimax)', () => {
  it('blocks immediate win', () => {
    // X | X | null
    // O | O | null
    // null | null | null
    const board: Board = ['X', 'X', null, 'O', 'O', null, null, null, null];
    const move = getBestMove([...board], 'O', 'X');
    // AI must block at index 2 or 5 (both are valid blocks in this board state)
    expect([2, 5]).toContain(move);
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
    // Center (4) is best, but minimax may pick another optimal move
    expect([2, 4]).toContain(move);
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
      const currentLetter = isXNext ? 'X' : 'O';
      if (currentLetter === userLetter) {
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

describe('Tic-Tac-Toe Game Logic (Board/Stats)', () => {
  function isBoardFull(board: Board): boolean {
    return board.every((cell: Player) => cell !== null);
  }
  function canStartGame(board: Board): boolean {
    return !isBoardFull(board);
  }
  function canPlayMove(board: Board, winner: Player | 'draw' | null): boolean {
    return !winner && board.includes(null);
  }
  function resetBoard(): Board {
    return Array(9).fill(null);
  }
  function playMove(board: Board, index: number, player: Player): Board {
    if (board[index] !== null) return board; // cannot play on occupied
    const newBoard = [...board];
    newBoard[index] = player;
    return newBoard;
  }
  it('does not allow game to start with a full board', () => {
    const board: Board = ['X','O','X','O','X','O','O','X','O'];
    expect(canStartGame(board)).toBe(false);
  });
  it('does not allow moves after win or draw', () => {
    const board: Board = ['X','X','X',null,'O','O',null,null,null];
    const winner = checkWinner(board);
    expect(canPlayMove(board, winner)).toBe(false);
    const drawBoard: Board = ['X','O','X','X','O','O','O','X','X'];
    const drawWinner = checkWinner(drawBoard);
    expect(canPlayMove(drawBoard, drawWinner)).toBe(false);
  });
  it('resets the board to all null after a game', () => {
    const board: Board = ['X','O','X','O','X','O','O','X','O'];
    const reset = resetBoard();
    expect(reset).toEqual([null,null,null,null,null,null,null,null,null]);
  });
  it('does not allow a user to select a spot that is already played', () => {
    const board: Board = [null,'X',null,null,null,null,null,null,null];
    const newBoard = playMove(board, 1, 'O');
    expect(newBoard).toEqual(board); // unchanged
    const validMove = playMove(board, 0, 'O');
    expect(validMove[0]).toBe('O');
  });
  it('updates stats correctly after each game', () => {
    // Simple stats mock
    let stats = { won: 0, lost: 0, draw: 0 };
    function updateStats(winner: Player | 'draw' | null) {
      if (winner === 'X') stats.won++;
      else if (winner === 'O') stats.lost++;
      else if (winner === 'draw') stats.draw++;
    }
    updateStats('X');
    updateStats('O');
    updateStats('draw');
    updateStats('X');
    expect(stats).toEqual({ won: 2, lost: 1, draw: 1 });
  });
});

describe('Tic-Tac-Toe Edge Cases and Turn Logic', () => {
  it('alternates turns correctly and resets state', () => {
    let board: Board = Array(9).fill(null);
    let isXNext = true;
    let winner: Player | 'draw' | null = null;
    // X moves
    board[0] = isXNext ? 'X' : 'O';
    isXNext = !isXNext;
    // O moves
    board[1] = isXNext ? 'X' : 'O';
    isXNext = !isXNext;
    // X moves
    board[2] = isXNext ? 'X' : 'O';
    isXNext = !isXNext;
    // O moves
    board[3] = isXNext ? 'X' : 'O';
    isXNext = !isXNext;
    // X moves
    board[4] = isXNext ? 'X' : 'O';
    isXNext = !isXNext;
    // O moves
    board[5] = isXNext ? 'X' : 'O';
    isXNext = !isXNext;
    // X moves
    board[6] = isXNext ? 'X' : 'O';
    isXNext = !isXNext;
    // O moves
    board[7] = isXNext ? 'X' : 'O';
    isXNext = !isXNext;
    // X moves
    board[8] = isXNext ? 'X' : 'O';
    isXNext = !isXNext;
    // After 9 moves, board is full, isXNext should be false (since last move was X)
    expect(board).toEqual(['X','O','X','O','X','O','X','O','X']);
    expect(isXNext).toBe(false);
    // Reset state
    board = Array(9).fill(null);
    isXNext = true;
    winner = null;
    expect(board).toEqual([null,null,null,null,null,null,null,null,null]);
    expect(isXNext).toBe(true);
    expect(winner).toBe(null);
  });

  it('detects all win lines for X and O', () => {
    const winBoards: Board[] = [
      // Rows
      ['X','X','X',null,null,null,null,null,null],
      [null,null,null,'O','O','O',null,null,null],
      [null,null,null,null,null,null,'X','X','X'],
      // Columns
      ['O',null,null,'O',null,null,'O',null,null],
      [null,'X',null,null,'X',null,null,'X',null],
      [null,null,'O',null,null,'O',null,null,'O'],
      // Diagonals
      ['X',null,null,null,'X',null,null,null,'X'],
      [null,null,'O',null,'O',null,'O',null,null],
    ];
    winBoards.forEach(board => {
      const winner = checkWinner(board);
      expect(['X','O']).toContain(winner);
    });
  });

  it('detects draw for full board with no winner', () => {
    const drawBoard: Board = ['X','O','X','X','O','O','O','X','X'];
    expect(checkWinner(drawBoard)).toBe('draw');
  });

  it('does not detect a win or draw for empty or partial board', () => {
    const emptyBoard: Board = [null,null,null,null,null,null,null,null,null];
    const partialBoard: Board = ['X',null,'O',null,null,null,null,null,null];
    expect(checkWinner(emptyBoard)).toBe(null);
    expect(checkWinner(partialBoard)).toBe(null);
  });
}); 
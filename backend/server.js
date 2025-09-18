const express = require('express');
const cors = require('cors');
const path = require('path');
const compression = require('compression');

// Get version information
const packageJson = require('../package.json');
const VERSION = packageJson.version;
const BUILD_TIME = new Date().toISOString();

const app = express();
const PORT = process.env.PORT || 3000;
const BASE_PATH = process.env.BASE_PATH || '';

// Enable compression and caching
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? false : true,
  credentials: true
}));

// Set Content Security Policy to allow necessary scripts
app.use((req, res, next) => {
  const isDevelopment = process.env.NODE_ENV !== 'production';
  
  if (isDevelopment) {
    // Development CSP - allows unsafe-eval for development tools and extensions
    res.setHeader('Content-Security-Policy', 
      "default-src 'self' 'unsafe-inline' 'unsafe-eval' data: blob:; " +
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
      "style-src 'self' 'unsafe-inline' data:; " +
      "img-src 'self' data: blob:; " +
      "font-src 'self' data:; " +
      "connect-src 'self' ws: wss:; " +
      "frame-ancestors 'none'; " +
      "base-uri 'self'; " +
      "form-action 'self'"
    );
  } else {
    // Production CSP - strict security without unsafe-eval
    res.setHeader('Content-Security-Policy', 
      "default-src 'self' 'unsafe-inline' data:; " +
      "script-src 'self' 'unsafe-inline'; " +
      "style-src 'self' 'unsafe-inline' data:; " +
      "img-src 'self' data:; " +
      "font-src 'self' data:; " +
      "connect-src 'self'; " +
      "frame-ancestors 'none'; " +
      "base-uri 'self'; " +
      "form-action 'self'"
    );
  }
  next();
});

// Cache static files for 1 week
app.use(BASE_PATH, express.static(path.join(__dirname, '../frontend'), {
  maxAge: '1w',
  etag: true,
  lastModified: true
}));

class SudokuGame {
  constructor() {
    this.originalBoard = this.generatePuzzle();
    this.board = this.deepCopy(this.originalBoard);
    this.solution = this.solvePuzzle(this.deepCopy(this.originalBoard));
  }

  generateEmptyBoard() {
    return Array(9).fill().map(() => Array(9).fill(0));
  }

  deepCopy(board) {
    return board.map(row => [...row]);
  }

  isValid(board, row, col, num) {
    for (let i = 0; i < 9; i++) {
      if (board[row][i] === num || board[i][col] === num) {
        return false;
      }
    }

    const boxRow = Math.floor(row / 3) * 3;
    const boxCol = Math.floor(col / 3) * 3;
    for (let i = boxRow; i < boxRow + 3; i++) {
      for (let j = boxCol; j < boxCol + 3; j++) {
        if (board[i][j] === num) {
          return false;
        }
      }
    }

    return true;
  }

  solvePuzzle(board) {
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (board[row][col] === 0) {
          for (let num = 1; num <= 9; num++) {
            if (this.isValid(board, row, col, num)) {
              board[row][col] = num;
              if (this.solvePuzzle(board)) {
                return board;
              }
              board[row][col] = 0;
            }
          }
          return false;
        }
      }
    }
    return board;
  }

  generateCompletedBoard() {
    const board = this.generateEmptyBoard();
    const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    
    const fillBoard = (board) => {
      for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
          if (board[row][col] === 0) {
            const shuffled = [...numbers].sort(() => Math.random() - 0.5);
            for (let num of shuffled) {
              if (this.isValid(board, row, col, num)) {
                board[row][col] = num;
                if (fillBoard(board)) {
                  return true;
                }
                board[row][col] = 0;
              }
            }
            return false;
          }
        }
      }
      return true;
    };

    fillBoard(board);
    return board;
  }

  generatePuzzle() {
    const completed = this.generateCompletedBoard();
    const puzzle = this.deepCopy(completed);
    
    // Pre-calculate all cell positions to avoid repeated random generation
    const cells = [];
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        cells.push({ row, col });
      }
    }
    
    // Shuffle cells once
    for (let i = cells.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [cells[i], cells[j]] = [cells[j], cells[i]];
    }
    
    const cellsToRemove = Math.min(40 + Math.floor(Math.random() * 10), cells.length);
    
    for (let i = 0; i < cellsToRemove; i++) {
      const { row, col } = cells[i];
      puzzle[row][col] = 0;
    }
    
    return puzzle;
  }

  validateMove(board, row, col, num) {
    if (num < 1 || num > 9) {
      return { valid: false, message: "Number must be between 1 and 9" };
    }

    if (!this.isValid(board, row, col, num)) {
      return { valid: false, message: "This number conflicts with Sudoku rules" };
    }

    return { valid: true, message: "Valid move!" };
  }

  isSolved(board) {
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (board[row][col] === 0) {
          return false;
        }
      }
    }
    
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        const num = board[row][col];
        board[row][col] = 0;
        if (!this.isValid(board, row, col, num)) {
          board[row][col] = num;
          return false;
        }
        board[row][col] = num;
      }
    }
    
    return true;
  }
}

let currentGame = new SudokuGame();

app.get(BASE_PATH + '/api/new-game', (req, res) => {
  // Set cache headers for better performance
  res.set({
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0'
  });
  
  currentGame = new SudokuGame();
  res.json({
    board: currentGame.originalBoard,
    message: "New game started!",
    version: VERSION,
    buildTime: BUILD_TIME
  });
});

app.get(BASE_PATH + '/api/game-state', (req, res) => {
  res.json({
    board: currentGame.board
  });
});

app.get(BASE_PATH + '/api/version', (req, res) => {
  res.json({
    version: VERSION,
    buildTime: BUILD_TIME,
    name: packageJson.name,
    description: packageJson.description,
    nodeVersion: process.version,
    environment: process.env.NODE_ENV || 'development'
  });
});

app.post(BASE_PATH + '/api/validate-move', (req, res) => {
  const { board, row, col, num } = req.body;
  
  if (row < 0 || row > 8 || col < 0 || col > 8) {
    return res.status(400).json({
      valid: false,
      message: "Invalid position"
    });
  }

  const validation = currentGame.validateMove(board, row, col, num);
  
  if (validation.valid) {
    currentGame.board = board;
    currentGame.board[row][col] = num;
    
    const solved = currentGame.isSolved(currentGame.board);
    
    res.json({
      valid: true,
      message: solved ? "Congratulations! Puzzle solved!" : "Valid move!",
      solved: solved,
      board: currentGame.board
    });
  } else {
    res.json(validation);
  }
});

app.get(BASE_PATH + '/api/hint', (req, res) => {
  const { row, col } = req.query;
  
  if (row !== undefined && col !== undefined) {
    const r = parseInt(row);
    const c = parseInt(col);
    
    if (r >= 0 && r < 9 && c >= 0 && c < 9 && currentGame.originalBoard[r][c] === 0) {
      res.json({
        hint: currentGame.solution[r][c],
        message: `The correct number for this cell is ${currentGame.solution[r][c]}`
      });
    } else {
      res.status(400).json({
        message: "Invalid position or cell is pre-filled"
      });
    }
  } else {
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (currentGame.originalBoard[row][col] === 0) {
          return res.json({
            hint: currentGame.solution[row][col],
            row: row,
            col: col,
            message: `Try placing ${currentGame.solution[row][col]} at row ${row + 1}, column ${col + 1}`
          });
        }
      }
    }
    
    res.json({
      message: "No empty cells found"
    });
  }
});

app.post(BASE_PATH + '/api/validate-board', (req, res) => {
  const { board } = req.body;
  
  if (!board || !Array.isArray(board) || board.length !== 9) {
    return res.status(400).json({
      valid: false,
      message: "Invalid board format"
    });
  }
  
  // Check if board is solved using the existing game logic
  const solved = currentGame.isSolved(board);
  
  if (solved) {
    res.json({
      valid: true,
      solved: true,
      message: "Congratulations! Puzzle solved correctly!"
    });
  } else {
    res.json({
      valid: false,
      solved: false,
      message: "Board contains errors"
    });
  }
});

app.get(BASE_PATH + '/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

app.listen(PORT, () => {
  console.log(`Sudoku server running on port ${PORT}`);
});
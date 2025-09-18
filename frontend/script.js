class SudokuClient {
    constructor() {
        this.grid = document.getElementById('sudoku-grid');
        this.feedback = document.getElementById('feedback');
        this.newGameBtn = document.getElementById('new-game-btn');
        this.hintBtn = document.getElementById('hint-btn');
        this.validateBtn = document.getElementById('validate-btn');
        this.easyModeRadio = document.getElementById('easy-mode');
        this.normalModeRadio = document.getElementById('normal-mode');
        this.validationInstruction = document.getElementById('validation-instruction');
        
        this.board = [];
        this.originalBoard = [];
        this.selectedCell = null;
        this.isEasyMode = true; // Default to easy mode
        
        // Handle base path for subdirectory deployment
        this.basePath = window.location.pathname.replace(/\/$/, '') || '';
        if (this.basePath && !this.basePath.includes('/api')) {
            // Remove trailing path if it's the app root
            const pathParts = this.basePath.split('/');
            if (pathParts[pathParts.length - 1] === '') {
                pathParts.pop();
            }
            this.basePath = pathParts.join('/');
        } else {
            this.basePath = '';
        }
        
        this.init();
    }
    
    init() {
        this.newGameBtn.addEventListener('click', () => this.newGame());
        this.hintBtn.addEventListener('click', () => this.getHint());
        this.validateBtn.addEventListener('click', () => this.validateBoard());
        
        // Difficulty mode listeners
        this.easyModeRadio.addEventListener('change', () => this.setDifficultyMode(true));
        this.normalModeRadio.addEventListener('change', () => this.setDifficultyMode(false));
        
        document.addEventListener('keydown', (e) => this.handleKeydown(e));
        
        // Save game state before page unload
        window.addEventListener('beforeunload', () => {
            this.saveGameState();
            this.removeMobileInput();
        });
        
        this.setDifficultyMode(true); // Start in easy mode
        
        // Try to load existing game state, otherwise start new game
        if (!this.loadGameState()) {
            this.newGame();
        }
    }
    
    setDifficultyMode(isEasy) {
        this.isEasyMode = isEasy;
        
        // Show/hide validate button
        if (isEasy) {
            this.validateBtn.classList.add('hidden');
            this.validationInstruction.textContent = 'Server validation provides immediate feedback';
        } else {
            this.validateBtn.classList.remove('hidden');
            this.validationInstruction.textContent = 'Click "Validate" to check your solution';
        }
        
        // Clear any existing feedback
        this.showFeedback('', '');
    }
    
    saveGameState() {
        if (this.board && this.originalBoard) {
            const gameState = {
                board: this.board,
                originalBoard: this.originalBoard,
                isEasyMode: this.isEasyMode,
                timestamp: Date.now()
            };
            localStorage.setItem('sudokuGameState', JSON.stringify(gameState));
        }
    }
    
    loadGameState() {
        try {
            const savedState = localStorage.getItem('sudokuGameState');
            if (!savedState) {
                return false;
            }
            
            const gameState = JSON.parse(savedState);
            
            // Check if the saved state is not too old (24 hours max)
            const maxAge = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
            if (Date.now() - gameState.timestamp > maxAge) {
                localStorage.removeItem('sudokuGameState');
                return false;
            }
            
            // Validate the saved state structure
            if (!gameState.board || !gameState.originalBoard || 
                !Array.isArray(gameState.board) || !Array.isArray(gameState.originalBoard) ||
                gameState.board.length !== 9 || gameState.originalBoard.length !== 9) {
                localStorage.removeItem('sudokuGameState');
                return false;
            }
            
            // Restore the game state
            this.board = gameState.board;
            this.originalBoard = gameState.originalBoard;
            this.isEasyMode = gameState.isEasyMode !== undefined ? gameState.isEasyMode : true;
            
            // Update difficulty mode UI
            this.easyModeRadio.checked = this.isEasyMode;
            this.normalModeRadio.checked = !this.isEasyMode;
            this.setDifficultyMode(this.isEasyMode);
            
            // Render the restored game
            this.renderGrid();
            this.showFeedback('Game restored from previous session', 'info');
            
            return true;
        } catch (error) {
            console.error('Error loading game state:', error);
            localStorage.removeItem('sudokuGameState');
            return false;
        }
    }
    
    clearGameState() {
        localStorage.removeItem('sudokuGameState');
    }
    
    async newGame() {
        try {
            this.showFeedback('Loading new game...', 'info');
            
            // Clean up any existing mobile input
            this.removeMobileInput();
            
            // Clear any existing saved game state
            this.clearGameState();
            
            const response = await fetch(`${this.basePath}/api/new-game`);
            const data = await response.json();
            
            this.board = data.board;
            this.originalBoard = data.board.map(row => [...row]);
            
            this.renderGrid();
            this.showFeedback(data.message, 'success');
            
            // Save the new game state
            this.saveGameState();
        } catch (error) {
            this.showFeedback('Failed to load new game. Please try again.', 'error');
            console.error('Error loading new game:', error);
        }
    }
    
    renderGrid() {
        this.grid.innerHTML = '';
        
        // Add ARIA roles to grid
        this.grid.setAttribute('role', 'grid');
        this.grid.setAttribute('aria-rowcount', '9');
        this.grid.setAttribute('aria-colcount', '9');
        
        // Remove loading placeholder
        const loadingElement = document.getElementById('grid-loading');
        if (loadingElement) {
            loadingElement.remove();
        }
        
        // Create rowgroup container
        const rowGroup = document.createElement('div');
        rowGroup.setAttribute('role', 'rowgroup');
        
        for (let row = 0; row < 9; row++) {
            // Create row container
            const rowElement = document.createElement('div');
            rowElement.className = 'grid-row';
            if (row === 2 || row === 5) { // 3rd and 6th rows (0-indexed)
                rowElement.classList.add(`row-${row + 1}`);
            }
            rowElement.setAttribute('role', 'row');
            rowElement.setAttribute('aria-rowindex', row + 1);
            
            for (let col = 0; col < 9; col++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                cell.dataset.row = row;
                cell.dataset.col = col;
                cell.tabIndex = 0;
                cell.setAttribute('role', 'gridcell');
                cell.setAttribute('aria-rowindex', row + 1);
                cell.setAttribute('aria-colindex', col + 1);
                cell.setAttribute('aria-label', `Cell ${row + 1},${col + 1}. ${this.originalBoard[row][col] !== 0 ? 'Pre-filled' : 'Empty'}`);
                
                const value = this.board[row][col];
                if (value !== 0) {
                    cell.textContent = value;
                    if (this.originalBoard[row][col] !== 0) {
                        cell.classList.add('prefilled');
                        cell.setAttribute('aria-label', `Cell ${row + 1},${col + 1}. Pre-filled with ${value}`);
                    } else {
                        cell.setAttribute('aria-label', `Cell ${row + 1},${col + 1}. Contains ${value}`);
                    }
                }
                
                cell.addEventListener('click', () => this.selectCell(row, col));
                cell.addEventListener('keydown', (e) => this.handleCellKeydown(e, row, col));
                
                rowElement.appendChild(cell);
            }
            
            rowGroup.appendChild(rowElement);
        }
        
        this.grid.appendChild(rowGroup);
    }
    
    handleCellKeydown(e, row, col) {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            this.selectCell(row, col);
        } else if (e.key >= '1' && e.key <= '9') {
            e.preventDefault();
            this.selectCell(row, col);
            const num = parseInt(e.key);
            this.makeMove(row, col, num);
        } else if (e.key === 'Backspace' || e.key === 'Delete' || e.key === '0') {
            e.preventDefault();
            this.selectCell(row, col);
            this.clearCell(row, col);
        }
    }
    
    selectCell(row, col) {
        if (this.originalBoard[row][col] !== 0) {
            return;
        }
        
        document.querySelectorAll('.cell').forEach(cell => {
            cell.classList.remove('selected');
        });
        
        const cell = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
        if (cell) {
            cell.classList.add('selected');
            cell.focus();
            
            this.selectedCell = { row, col };
            
            // Show mobile keyboard input
            this.showMobileInput(cell, row, col);
        }
    }
    
    showMobileInput(cell, row, col) {
        // Check if device is mobile/touch-enabled
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) 
                          || window.innerWidth < 768 
                          || 'ontouchstart' in window;
        
        if (!isMobile) return;
        
        // Remove any existing mobile input
        this.removeMobileInput();
        
        // Create mobile input element
        const input = document.createElement('input');
        input.type = 'number';
        input.inputMode = 'numeric';
        input.pattern = '[1-9]';
        input.min = '1';
        input.max = '9';
        input.className = 'mobile-input';
        input.value = this.board[row][col] || '';
        
        // Position the input over the cell
        const cellRect = cell.getBoundingClientRect();
        input.style.position = 'fixed';
        input.style.left = cellRect.left + 'px';
        input.style.top = cellRect.top + 'px';
        input.style.width = cellRect.width + 'px';
        input.style.height = cellRect.height + 'px';
        input.style.zIndex = '1000';
        input.style.opacity = '0';
        input.style.pointerEvents = 'none';
        
        // Add input event listeners
        input.addEventListener('input', (e) => {
            const num = parseInt(e.target.value);
            if (num >= 1 && num <= 9) {
                this.makeMove(row, col, num);
                this.removeMobileInput();
            } else if (e.target.value === '') {
                this.clearCell(row, col);
                this.removeMobileInput();
            }
        });
        
        input.addEventListener('blur', () => {
            this.removeMobileInput();
        });
        
        // Add to DOM and focus
        document.body.appendChild(input);
        input.focus();
        
        // Store reference for cleanup
        this.mobileInput = input;
    }
    
    removeMobileInput() {
        if (this.mobileInput) {
            this.mobileInput.remove();
            this.mobileInput = null;
        }
    }
    
    async handleKeydown(e) {
        if (!this.selectedCell) return;
        
        const { row, col } = this.selectedCell;
        
        if (e.key >= '1' && e.key <= '9') {
            const num = parseInt(e.key);
            await this.makeMove(row, col, num);
        } else if (e.key === 'Backspace' || e.key === 'Delete' || e.key === '0') {
            await this.clearCell(row, col);
        }
    }
    
    async makeMove(row, col, num) {
        if (this.originalBoard[row][col] !== 0) {
            this.showFeedback('Cannot modify pre-filled cells', 'error');
            return;
        }
        
        // Store the original value before making the move
        const originalValue = this.board[row][col];
        
        // If the same number is already in this cell, just show success (no change needed)
        if (originalValue === num) {
            if (this.isEasyMode) {
                this.updateCell(row, col, num, 'success');
                this.showFeedback('Number confirmed!', 'success');
            }
            return;
        }
        
        // Update the board immediately for UI responsiveness
        this.board[row][col] = num;
        this.updateCell(row, col, num, '');
        
        if (this.isEasyMode) {
            // Easy mode: validate immediately
            try {
                // Create a copy of the board with the current cell cleared for validation
                const boardForValidation = this.board.map(r => [...r]);
                boardForValidation[row][col] = 0; // Clear the cell temporarily for validation
                
                const response = await fetch(`${this.basePath}/api/validate-move`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        board: boardForValidation,
                        row: row,
                        col: col,
                        num: num
                    })
                });
                
                const result = await response.json();
                
                if (result.valid) {
                    this.board = result.board;
                    this.updateCell(row, col, num, 'success');
                    
                    // Save game state after valid move
                    this.saveGameState();
                    
                    if (result.solved) {
                        this.showFeedback(result.message, 'solved');
                        this.celebrateSolution();
                        // Clear saved state when puzzle is solved
                        this.clearGameState();
                    } else {
                        this.showFeedback(result.message, 'success');
                    }
                } else {
                    // Revert the board state for invalid moves
                    this.board[row][col] = originalValue;
                    this.updateCell(row, col, num, 'error');
                    this.showFeedback(result.message, 'error');
                    
                    setTimeout(() => {
                        this.updateCell(row, col, originalValue || '', '');
                    }, 1000);
                }
            } catch (error) {
                // Revert the board state on server error
                this.board[row][col] = originalValue;
                this.updateCell(row, col, originalValue || '', '');
                this.showFeedback('Server error. Please try again.', 'error');
                console.error('Error validating move:', error);
            }
        } else {
            // Normal mode: just place the number, no immediate validation
            this.showFeedback('Number placed. Use "Validate" to check your solution.', 'info');
            // Save game state after placing number in normal mode
            this.saveGameState();
        }
    }
    
    async clearCell(row, col) {
        if (this.originalBoard[row][col] !== 0) {
            this.showFeedback('Cannot clear pre-filled cells', 'error');
            return;
        }
        
        this.board[row][col] = 0;
        this.updateCell(row, col, '', '');
        this.showFeedback('Cell cleared', 'info');
        
        // Save game state after clearing cell
        this.saveGameState();
    }
    
    updateCell(row, col, value, state) {
        const cell = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
        cell.textContent = value || '';
        
        // Update ARIA label
        if (value) {
            cell.setAttribute('aria-label', `Cell ${row + 1},${col + 1}. Contains ${value}`);
        } else {
            cell.setAttribute('aria-label', `Cell ${row + 1},${col + 1}. Empty`);
        }
        
        cell.classList.remove('error', 'success');
        if (state) {
            cell.classList.add(state);
        }
    }
    
    async validateBoard() {
        try {
            this.showFeedback('Validating board...', 'info');
            
            // Check if board is complete
            let isEmpty = false;
            for (let row = 0; row < 9; row++) {
                for (let col = 0; col < 9; col++) {
                    if (this.board[row][col] === 0) {
                        isEmpty = true;
                        break;
                    }
                }
                if (isEmpty) break;
            }
            
            if (isEmpty) {
                this.showFeedback('Board is not complete yet. Keep solving!', 'info');
                return;
            }
            
            // Validate the complete board by checking if it's solved
            const response = await fetch(`${this.basePath}/api/validate-board`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    board: this.board
                })
            });
            
            const result = await response.json();
            
            if (result.valid && result.solved) {
                this.showFeedback('🎉 Congratulations! You solved the puzzle correctly!', 'solved');
                this.celebrateSolution();
                // Clear saved state when puzzle is solved
                this.clearGameState();
            } else if (result.valid) {
                this.showFeedback('Board is valid but not complete yet.', 'success');
            } else {
                this.showFeedback('❌ Board contains errors. Check your numbers!', 'error');
            }
        } catch (error) {
            this.showFeedback('Error validating board. Please try again.', 'error');
            console.error('Error validating board:', error);
        }
    }
    
    async getHint() {
        if (!this.selectedCell) {
            this.showFeedback('Please select a cell first', 'error');
            return;
        }
        
        const { row, col } = this.selectedCell;
        
        if (this.originalBoard[row][col] !== 0) {
            this.showFeedback('Cannot get hint for pre-filled cells', 'error');
            return;
        }
        
        if (this.board[row][col] !== 0) {
            this.showFeedback('Cell is already filled', 'error');
            return;
        }
        
        try {
            console.log(`Getting hint for cell (${row}, ${col})`);
            const response = await fetch(`${this.basePath}/api/hint?row=${row}&col=${col}`);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const result = await response.json();
            console.log('Hint response:', result);
            
            if (result.hint) {
                this.showFeedback(result.message, 'info');
                this.updateCell(row, col, result.hint, 'success');
                this.board[row][col] = result.hint;
                
                // Save game state after applying hint
                this.saveGameState();
                
                // Check for completion in Easy mode
                if (this.isEasyMode) {
                    await this.checkCompletionAfterHint();
                }
            } else {
                this.showFeedback(result.message || 'No hint available', 'error');
            }
        } catch (error) {
            this.showFeedback('Failed to get hint. Please try again.', 'error');
            console.error('Error getting hint:', error);
        }
    }
    
    async checkCompletionAfterHint() {
        // Check if the board is complete (no empty cells)
        let isComplete = true;
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                if (this.board[row][col] === 0) {
                    isComplete = false;
                    break;
                }
            }
            if (!isComplete) break;
        }
        
        if (isComplete) {
            // Validate the complete board to check if it's solved correctly
            try {
                const response = await fetch(`${this.basePath}/api/validate-board`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        board: this.board
                    })
                });
                
                const result = await response.json();
                
                if (result.valid && result.solved) {
                    this.showFeedback('🎉 Congratulations! Puzzle solved!', 'solved');
                    this.celebrateSolution();
                    // Clear saved state when puzzle is solved
                    this.clearGameState();
                }
            } catch (error) {
                console.error('Error checking completion after hint:', error);
                // If validation fails, at least save the current state
                this.saveGameState();
            }
        }
    }
    
    showFeedback(message, type) {
        this.feedback.textContent = message;
        this.feedback.className = `feedback ${type}`;
        
        if (type === 'error') {
            setTimeout(() => {
                this.feedback.className = 'feedback';
                this.feedback.textContent = '';
            }, 3000);
        }
    }
    
    celebrateSolution() {
        const cells = document.querySelectorAll('.cell');
        cells.forEach((cell, index) => {
            setTimeout(() => {
                cell.style.animation = 'pulse 0.5s ease';
            }, index * 20);
        });
        
        setTimeout(() => {
            cells.forEach(cell => {
                cell.style.animation = '';
            });
        }, 2000);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.sudokuClient = new SudokuClient();
});
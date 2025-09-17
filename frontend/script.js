class SudokuClient {
    constructor() {
        this.grid = document.getElementById('sudoku-grid');
        this.feedback = document.getElementById('feedback');
        this.newGameBtn = document.getElementById('new-game-btn');
        this.hintBtn = document.getElementById('hint-btn');
        
        this.board = [];
        this.originalBoard = [];
        this.selectedCell = null;
        
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
        
        document.addEventListener('keydown', (e) => this.handleKeydown(e));
        
        // Cleanup mobile input on page unload
        window.addEventListener('beforeunload', () => this.removeMobileInput());
        
        this.newGame();
    }
    
    async newGame() {
        try {
            this.showFeedback('Loading new game...', 'info');
            
            // Clean up any existing mobile input
            this.removeMobileInput();
            
            const response = await fetch(`${this.basePath}/api/new-game`);
            const data = await response.json();
            
            this.board = data.board;
            this.originalBoard = data.board.map(row => [...row]);
            
            this.renderGrid();
            this.showFeedback(data.message, 'success');
        } catch (error) {
            this.showFeedback('Failed to load new game. Please try again.', 'error');
            console.error('Error loading new game:', error);
        }
    }
    
    renderGrid() {
        this.grid.innerHTML = '';
        
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                cell.dataset.row = row;
                cell.dataset.col = col;
                
                const value = this.board[row][col];
                if (value !== 0) {
                    cell.textContent = value;
                    if (this.originalBoard[row][col] !== 0) {
                        cell.classList.add('prefilled');
                    }
                }
                
                cell.addEventListener('click', () => this.selectCell(row, col));
                
                this.grid.appendChild(cell);
            }
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
        cell.classList.add('selected');
        
        this.selectedCell = { row, col };
        
        // Show mobile keyboard input
        this.showMobileInput(cell, row, col);
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
        
        try {
            const response = await fetch(`${this.basePath}/api/validate-move`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    board: this.board,
                    row: row,
                    col: col,
                    num: num
                })
            });
            
            const result = await response.json();
            
            if (result.valid) {
                this.board = result.board;
                this.updateCell(row, col, num, 'success');
                
                if (result.solved) {
                    this.showFeedback(result.message, 'solved');
                    this.celebrateSolution();
                } else {
                    this.showFeedback(result.message, 'success');
                }
            } else {
                this.updateCell(row, col, num, 'error');
                this.showFeedback(result.message, 'error');
                
                setTimeout(() => {
                    this.updateCell(row, col, this.board[row][col] || '', '');
                }, 1000);
            }
        } catch (error) {
            this.showFeedback('Server error. Please try again.', 'error');
            console.error('Error validating move:', error);
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
    }
    
    updateCell(row, col, value, state) {
        const cell = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
        cell.textContent = value || '';
        
        cell.classList.remove('error', 'success');
        if (state) {
            cell.classList.add(state);
        }
    }
    
    async getHint() {
        if (this.selectedCell) {
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
                const response = await fetch(`${this.basePath}/api/hint?row=${row}&col=${col}`);
                const result = await response.json();
                
                if (result.hint) {
                    this.showFeedback(result.message, 'info');
                    this.updateCell(row, col, result.hint, 'success');
                    this.board[row][col] = result.hint;
                } else {
                    this.showFeedback(result.message, 'error');
                }
            } catch (error) {
                this.showFeedback('Failed to get hint. Please try again.', 'error');
                console.error('Error getting hint:', error);
            }
        } else {
            try {
                const response = await fetch(`${this.basePath}/api/hint`);
                const result = await response.json();
                
                if (result.hint && result.row !== undefined && result.col !== undefined) {
                    this.showFeedback(result.message, 'info');
                    this.selectCell(result.row, result.col);
                    
                    setTimeout(() => {
                        this.updateCell(result.row, result.col, result.hint, 'success');
                        this.board[result.row][result.col] = result.hint;
                    }, 500);
                } else {
                    this.showFeedback(result.message, 'info');
                }
            } catch (error) {
                this.showFeedback('Failed to get hint. Please try again.', 'error');
                console.error('Error getting hint:', error);
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
    new SudokuClient();
});
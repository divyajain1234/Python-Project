console.log("Script loaded");

let board = ['', '', '', '', '', '', '', '', ''];
let currentPlayer = 'X';
let gameActive = false;

let p1Name = '';
let p2Name = '';
let p1Score = 0;
let p2Score = 0;
let player2Type = 'computer'; // computer or human
let difficulty = 'easy';

const cells = document.querySelectorAll('.cell');
const startBtn = document.getElementById('startBtn');
const restartBtn = document.getElementById('restartBtn');
const p1nameDisplay = document.getElementById('p1name');
const p2nameDisplay = document.getElementById('p2name');
const p1scoreDisplay = document.getElementById('p1score');
const p2scoreDisplay = document.getElementById('p2score');
const playerSetupDiv = document.getElementById('playerSetup');
const gameArea = document.getElementById('gameArea');
const dashboardBody = document.querySelector('#dashboard tbody');

const difficultySelect = document.getElementById('difficultySelect');
const player2Select = document.getElementById('player2Select');
const player2Input = document.getElementById('player2');

const modal = document.getElementById('popupModal');
const modalMessage = document.getElementById('modalMessage');
const closeModalBtn = document.getElementById('closeModal');
const modalOkBtn = document.getElementById('modalBtn');

const winningConditions = [
  [0,1,2],[3,4,5],[6,7,8],
  [0,3,6],[1,4,7],[2,5,8],
  [0,4,8],[2,4,6]
];

// Show/hide player 2 input and difficulty select
player2Select.addEventListener('change', (e) => {
  player2Type = e.target.value;
  if(player2Type === 'human') {
    player2Input.style.display = 'inline-block';
    difficultySelect.style.display = 'none';
  } else {
    player2Input.style.display = 'none';
    difficultySelect.style.display = 'inline-block';
  }
});

// Select difficulty level
difficultySelect.addEventListener('change', (e) => {
  difficulty = e.target.value;
});

// Start game button
startBtn.addEventListener('click', () => {
  p1Name = document.getElementById('player1').value.trim() || 'Player 1';
  p2Name = player2Type === 'human' ? (player2Input.value.trim() || 'Player 2') : 'Computer 🤖';

  p1Score = 0;
  p2Score = 0;
  currentPlayer = 'X';
  gameActive = true;
  board.fill('');

  p1nameDisplay.textContent = p1Name;
  p2nameDisplay.textContent = p2Name;
  p1scoreDisplay.textContent = p1Score;
  p2scoreDisplay.textContent = p2Score;

  playerSetupDiv.style.display = 'none';
  gameArea.style.display = 'block';

  clearBoard();
  updateDashboard();
});

// ✅ Restart game button — fixed
restartBtn.addEventListener('click', () => {
  currentPlayer = 'X';
  gameActive = true;
  board.fill('');
  clearBoard();
});

// Board click handling
cells.forEach(cell => cell.addEventListener('click', (e) => {
  if (!gameActive) return;
  if(currentPlayer === 'O' && player2Type === 'computer') return;

  const index = parseInt(e.target.getAttribute('data-index'));
  if (board[index] !== '') return;

  makeMove(index, currentPlayer);
}));

function makeMove(index, player) {
  board[index] = player;
  cells[index].textContent = player;

  if (checkWin(player)) {
    gameActive = false;
    if(player === 'X') p1Score++;
    else p2Score++;

    updateScoreDisplay();
    showModal(`${player === 'X' ? p1Name : p2Name} wins!`);
    updateDashboard();
    return;
  }

  if (board.every(cell => cell !== '')) {
    gameActive = false;
    showModal("It's a draw!");
    updateDashboard();
    return;
  }

  currentPlayer = (player === 'X') ? 'O' : 'X';

  if(currentPlayer === 'O' && player2Type === 'computer' && gameActive) {
    setTimeout(computerMove, 600);
  }
}

// AI difficulty modes
function computerMove() {
  let move;
  switch(difficulty) {
    case 'easy':
      move = getRandomMove();
      break;
    case 'medium':
      move = getMediumMove();
      break;
    case 'difficult':
      move = getBestMove();
      break;
    default:
      move = getRandomMove();
  }
  makeMove(move, 'O');
}

function getRandomMove() {
  const emptyIndices = board.map((v, i) => v === '' ? i : null).filter(i => i !== null);
  return emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
}

function getMediumMove() {
  let winMove = findWinningMove('O');
  if (winMove !== -1) return winMove;

  let blockMove = findWinningMove('X');
  if (blockMove !== -1) return blockMove;

  return getRandomMove();
}

function findWinningMove(player) {
  for(let i=0; i<9; i++) {
    if(board[i] === '') {
      board[i] = player;
      if(checkWin(player)) {
        board[i] = '';
        return i;
      }
      board[i] = '';
    }
  }
  return -1;
}

function getBestMove() {
  let bestScore = -Infinity;
  let move = -1;
  for(let i=0; i<9; i++) {
    if(board[i] === '') {
      board[i] = 'O';
      let score = minimax(board, 0, false);
      board[i] = '';
      if(score > bestScore) {
        bestScore = score;
        move = i;
      }
    }
  }
  return move;
}

function minimax(newBoard, depth, isMaximizing) {
  if(checkWinForMinimax(newBoard, 'O')) return 10 - depth;
  if(checkWinForMinimax(newBoard, 'X')) return depth - 10;
  if(newBoard.every(cell => cell !== '')) return 0;

  if(isMaximizing) {
    let bestScore = -Infinity;
    for(let i=0; i<9; i++) {
      if(newBoard[i] === '') {
        newBoard[i] = 'O';
        let score = minimax(newBoard, depth+1, false);
        newBoard[i] = '';
        bestScore = Math.max(score, bestScore);
      }
    }
    return bestScore;
  } else {
    let bestScore = Infinity;
    for(let i=0; i<9; i++) {
      if(newBoard[i] === '') {
        newBoard[i] = 'X';
        let score = minimax(newBoard, depth+1, true);
        newBoard[i] = '';
        bestScore = Math.min(score, bestScore);
      }
    }
    return bestScore;
  }
}

// 🟢 Core checkWin logic — works as expected
function checkWin(player) {
  return winningConditions.some(condition =>
    condition.every(index => board[index] === player)
  );
}

function checkWinForMinimax(boardToCheck, player) {
  return winningConditions.some(condition =>
    condition.every(i => boardToCheck[i] === player)
  );
}

// 🔄 Clears board UI
function clearBoard() {
  cells.forEach((cell, index) => {
    board[index] = '';
    cell.textContent = '';
  });
}

// 📈 Update Score Display
function updateScoreDisplay() {
  p1scoreDisplay.textContent = p1Score;
  p2scoreDisplay.textContent = p2Score;
}

// 📊 Dashboard
function updateDashboard() {
  const newRow = document.createElement('tr');
  const timeStamp = new Date().toLocaleTimeString();
  newRow.innerHTML = `
    <td>${p1Name}</td>
    <td>${p2Name}</td>
    <td>${p1Score}</td>
    <td>${p2Score}</td>
    <td>${timeStamp}</td>
  `;
  dashboardBody.appendChild(newRow);
}

// 🪟 Modal
function showModal(message) {
  modalMessage.textContent = message;
  modal.style.display = 'block';
}

closeModalBtn.addEventListener('click', () => {
  modal.style.display = 'none';
});

modalOkBtn.addEventListener('click', () => {
  modal.style.display = 'none';
});

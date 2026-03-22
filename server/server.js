const { WebSocketServer } = require('ws');
const http = require('http');

const PORT = process.env.PORT || 8080;

const server = http.createServer();
const wss = new WebSocketServer({ server });

// rooms: Map<code, Room>
const rooms = new Map();

// ─── Helpers ────────────────────────────────────────────────────────────────

function generateCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code;
  do {
    code = Array.from({ length: 4 }, () =>
      chars[Math.floor(Math.random() * chars.length)]
    ).join('');
  } while (rooms.has(code));
  return code;
}

function checkWinner(board) {
  const lines = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // cols
    [0, 4, 8], [2, 4, 6],             // diagonals
  ];
  for (const line of lines) {
    const [a, b, c] = line;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { winner: board[a], line };
    }
  }
  if (board.every(cell => cell !== null)) {
    return { winner: 'draw', line: null };
  }
  return null;
}

function send(ws, data) {
  if (ws.readyState === ws.OPEN) {
    ws.send(JSON.stringify(data));
  }
}

function serializeRoom(room, playerIndex) {
  return {
    code: room.code,
    board: room.board,
    currentTurn: room.currentTurn,
    status: room.status,
    winner: room.winner,
    winningLine: room.winningLine,
    players: room.players.map(p => ({ nickname: p.nickname, symbol: p.symbol })),
    mySymbol: room.players[playerIndex]?.symbol ?? null,
    rematchVotes: { ...room.rematchVotes },
  };
}

function broadcast(room, type = 'game_update') {
  room.players.forEach((player, i) => {
    send(player.ws, { type, room: serializeRoom(room, i) });
  });
}

// ─── Connection handler ──────────────────────────────────────────────────────

wss.on('connection', (ws) => {
  ws.roomCode = null;

  ws.on('message', (raw) => {
    let msg;
    try { msg = JSON.parse(raw); } catch { return; }

    switch (msg.type) {

      // ── Create a new room ──────────────────────────────────────────────────
      case 'create_room': {
        const nickname = String(msg.nickname || 'Player').slice(0, 20);
        const code = generateCode();

        const room = {
          code,
          players: [{ ws, nickname, symbol: 'X' }],
          board: Array(9).fill(null),
          currentTurn: 'X',
          status: 'waiting',
          winner: null,
          winningLine: null,
          rematchVotes: { X: false, O: false },
        };

        rooms.set(code, room);
        ws.roomCode = code;
        send(ws, { type: 'room_created', code });
        break;
      }

      // ── Join an existing room ──────────────────────────────────────────────
      case 'join_room': {
        const code = String(msg.code || '').toUpperCase().trim();
        const nickname = String(msg.nickname || 'Player').slice(0, 20);
        const room = rooms.get(code);

        if (!room) {
          send(ws, { type: 'error', message: 'Room not found. Check the code and try again.' });
          return;
        }
        if (room.players.length >= 2) {
          send(ws, { type: 'error', message: 'This room is already full.' });
          return;
        }
        if (room.status !== 'waiting') {
          send(ws, { type: 'error', message: 'Game already in progress.' });
          return;
        }

        room.players.push({ ws, nickname, symbol: 'O' });
        ws.roomCode = code;
        room.status = 'playing';

        broadcast(room, 'game_start');
        break;
      }

      // ── Make a move ────────────────────────────────────────────────────────
      case 'make_move': {
        const room = rooms.get(ws.roomCode);
        if (!room || room.status !== 'playing') return;

        const player = room.players.find(p => p.ws === ws);
        if (!player || player.symbol !== room.currentTurn) return;

        const index = Number(msg.index);
        if (index < 0 || index > 8 || room.board[index] !== null) return;

        room.board[index] = player.symbol;

        const result = checkWinner(room.board);
        if (result) {
          room.status = 'ended';
          room.winner = result.winner;
          room.winningLine = result.line;
        } else {
          room.currentTurn = room.currentTurn === 'X' ? 'O' : 'X';
        }

        broadcast(room);
        break;
      }

      // ── Rematch vote ───────────────────────────────────────────────────────
      case 'rematch': {
        const room = rooms.get(ws.roomCode);
        if (!room || room.status !== 'ended') return;

        const player = room.players.find(p => p.ws === ws);
        if (!player) return;

        room.rematchVotes[player.symbol] = true;

        if (room.rematchVotes.X && room.rematchVotes.O) {
          // Swap symbols so the loser goes first next round
          room.players[0].symbol = room.players[0].symbol === 'X' ? 'O' : 'X';
          room.players[1].symbol = room.players[1].symbol === 'X' ? 'O' : 'X';

          // Reset board
          room.board = Array(9).fill(null);
          room.currentTurn = 'X';
          room.status = 'playing';
          room.winner = null;
          room.winningLine = null;
          room.rematchVotes = { X: false, O: false };
        }

        broadcast(room);
        break;
      }

      default:
        break;
    }
  });

  // ── Disconnect handler ─────────────────────────────────────────────────────
  ws.on('close', () => {
    if (!ws.roomCode) return;

    const room = rooms.get(ws.roomCode);
    if (!room) return;

    // Notify the remaining player
    const other = room.players.find(p => p.ws !== ws);
    if (other) {
      send(other.ws, { type: 'opponent_disconnected' });
      other.ws.roomCode = null;
    }

    rooms.delete(ws.roomCode);
  });
});

// ─── Start ───────────────────────────────────────────────────────────────────

server.listen(PORT, () => {
  console.log(`✅ WebSocket server listening on port ${PORT}`);
});

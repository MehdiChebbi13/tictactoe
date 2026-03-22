# 🎮 X vs O — Multiplayer Tic-Tac-Toe

Real-time multiplayer Tic-Tac-Toe built with React + WebSockets.

## Project Structure

```
tictactoe/
├── server/          Node.js WebSocket server
│   ├── server.js
│   └── package.json
└── client/          React + Vite frontend
    ├── src/
    │   ├── App.jsx
    │   └── components/
    │       ├── Lobby.jsx        → nickname + create/join room
    │       ├── WaitingRoom.jsx  → share room code with friend
    │       ├── Game.jsx         → game board + result panel
    │       └── Board.jsx        → 3×3 grid
    ├── .env.example
    └── package.json
```

---

## Running Locally

### 1. Start the server

```bash
cd server
npm install
npm run dev        # uses node --watch for auto-reload
```

Server listens on **port 8080** by default.

### 2. Start the client

```bash
cd client
npm install
npm run dev
```

Open **http://localhost:5173** in two browser tabs to test.

---

## Deploying to a Server

### Server

```bash
cd server
npm install
PORT=8080 npm start
```

Point a reverse proxy (nginx/Caddy) at port 8080 and expose it via **wss://** for production.

Example nginx snippet:
```nginx
location /ws {
    proxy_pass http://localhost:8080;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "Upgrade";
    proxy_set_header Host $host;
}
```

### Client

Create a `.env` file in `client/`:
```
VITE_WS_URL=wss://yourdomain.com/ws
```

Then build and serve the static files:
```bash
cd client
npm run build
# dist/ folder can be served by nginx, Caddy, Vercel, etc.
```

---

## How It Works

1. **Player A** enters a nickname → clicks **Create Room** → gets a 4-character code
2. **Player B** enters a nickname → clicks **Join Room** → enters the code
3. Game starts immediately — Player A plays as **X**, Player B as **O**
4. Turns alternate in real time via WebSocket
5. After a win or draw, either player can click **Rematch** (symbols swap, so the loser goes first)

---

## WebSocket Message Protocol

| Direction | Message | Payload |
|-----------|---------|---------|
| C → S | `create_room` | `{ nickname }` |
| C → S | `join_room` | `{ nickname, code }` |
| C → S | `make_move` | `{ index }` (0–8) |
| C → S | `rematch` | — |
| S → C | `room_created` | `{ code }` |
| S → C | `game_start` | `{ room }` |
| S → C | `game_update` | `{ room }` |
| S → C | `opponent_disconnected` | — |
| S → C | `error` | `{ message }` |

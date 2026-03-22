import { useState, useRef, useCallback } from 'react';
import Lobby from './components/Lobby.jsx';
import WaitingRoom from './components/WaitingRoom.jsx';
import Game from './components/Game.jsx';

const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8080';

export default function App() {
  const [screen, setScreen] = useState('lobby'); // 'lobby' | 'waiting' | 'game'
  const [roomCode, setRoomCode] = useState('');
  const [gameState, setGameState] = useState(null);
  const [error, setError] = useState('');
  const wsRef = useRef(null);

  // ── Connect to WebSocket server ──────────────────────────────────────────
  const connect = useCallback(() => {
    return new Promise((resolve, reject) => {
      const ws = new WebSocket(WS_URL);
      ws.onopen = () => resolve(ws);
      ws.onerror = () => reject(new Error('Connection failed'));
      wsRef.current = ws;
    });
  }, []);

  // ── Attach message listeners ─────────────────────────────────────────────
  const attachListeners = useCallback((ws) => {
    ws.onmessage = (e) => {
      let msg;
      try { msg = JSON.parse(e.data); } catch { return; }

      switch (msg.type) {

        case 'room_created':
          setRoomCode(msg.code);
          setScreen('waiting');
          break;

        case 'game_start':
        case 'game_update':
          setGameState(msg.room);
          setScreen('game');
          break;

        case 'opponent_disconnected':
          setGameState(prev => prev ? { ...prev, opponentDisconnected: true } : prev);
          break;

        case 'error':
          setError(msg.message);
          break;

        default:
          break;
      }
    };

    ws.onclose = () => {
      // If we're in-game and the connection drops unexpectedly, flag it
      setGameState(prev => {
        if (prev && prev.status === 'playing') {
          return { ...prev, opponentDisconnected: true };
        }
        return prev;
      });
    };
  }, []);

  // ── Public actions ───────────────────────────────────────────────────────
  const createRoom = useCallback(async (nickname) => {
    setError('');
    try {
      const ws = await connect();
      attachListeners(ws);
      ws.send(JSON.stringify({ type: 'create_room', nickname }));
    } catch {
      setError('Could not connect to server. Is it running?');
    }
  }, [connect, attachListeners]);

  const joinRoom = useCallback(async (nickname, code) => {
    setError('');
    try {
      const ws = await connect();
      attachListeners(ws);
      ws.send(JSON.stringify({ type: 'join_room', nickname, code: code.toUpperCase() }));
    } catch {
      setError('Could not connect to server. Is it running?');
    }
  }, [connect, attachListeners]);

  const makeMove = useCallback((index) => {
    wsRef.current?.send(JSON.stringify({ type: 'make_move', index }));
  }, []);

  const requestRematch = useCallback(() => {
    wsRef.current?.send(JSON.stringify({ type: 'rematch' }));
  }, []);

  const leaveGame = useCallback(() => {
    wsRef.current?.close();
    wsRef.current = null;
    setScreen('lobby');
    setGameState(null);
    setRoomCode('');
    setError('');
  }, []);

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-500 via-purple-600 to-pink-500 flex items-center justify-center p-4">
      {screen === 'lobby' && (
        <Lobby
          onCreateRoom={createRoom}
          onJoinRoom={joinRoom}
          error={error}
          onClearError={() => setError('')}
        />
      )}
      {screen === 'waiting' && (
        <WaitingRoom code={roomCode} onLeave={leaveGame} />
      )}
      {screen === 'game' && gameState && (
        <Game
          gameState={gameState}
          onMove={makeMove}
          onRematch={requestRematch}
          onLeave={leaveGame}
        />
      )}
    </div>
  );
}

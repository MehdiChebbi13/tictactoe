import { useState } from 'react';

export default function Lobby({ onCreateRoom, onJoinRoom, error, onClearError }) {
  const [nickname, setNickname] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [mode, setMode] = useState(null); // null | 'create' | 'join'
  const [loading, setLoading] = useState(false);

  const nicknameOk = nickname.trim().length > 0;

  const handleCreate = async () => {
    if (!nicknameOk || loading) return;
    setLoading(true);
    await onCreateRoom(nickname.trim());
    setLoading(false);
  };

  const handleJoin = async () => {
    if (!nicknameOk || joinCode.length !== 4 || loading) return;
    setLoading(true);
    await onJoinRoom(nickname.trim(), joinCode);
    setLoading(false);
  };

  const pickMode = (m) => {
    onClearError();
    setMode(m);
  };

  return (
    <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-sm">
      {/* Title */}
      <div className="text-center mb-8">
        <div className="text-6xl mb-3">🎮</div>
        <h1 className="text-4xl font-black tracking-tight">
          <span className="text-rose-500">X</span>
          <span className="text-gray-300 mx-1">·</span>
          <span className="text-sky-500">O</span>
        </h1>
        <p className="text-gray-400 font-medium mt-1 text-sm">Multiplayer Tic-Tac-Toe</p>
      </div>

      {/* Nickname */}
      <div className="mb-5">
        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
          Your Nickname
        </label>
        <input
          type="text"
          maxLength={20}
          value={nickname}
          onChange={e => setNickname(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter') {
              if (mode === 'create') handleCreate();
              if (mode === 'join') handleJoin();
            }
          }}
          placeholder="Enter your name…"
          className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 focus:border-violet-400 focus:outline-none font-semibold text-gray-800 placeholder-gray-300 transition-colors"
        />
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 px-4 py-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-600 text-sm font-medium">
          {error}
        </div>
      )}

      {/* Mode: pick */}
      {mode === null && (
        <div className="flex gap-3">
          <button
            onClick={() => pickMode('create')}
            disabled={!nicknameOk}
            className="flex-1 bg-violet-500 hover:bg-violet-600 active:bg-violet-700 disabled:bg-gray-100 disabled:text-gray-300 text-white font-bold py-3 rounded-xl transition-colors"
          >
            Create Room
          </button>
          <button
            onClick={() => pickMode('join')}
            disabled={!nicknameOk}
            className="flex-1 bg-pink-500 hover:bg-pink-600 active:bg-pink-700 disabled:bg-gray-100 disabled:text-gray-300 text-white font-bold py-3 rounded-xl transition-colors"
          >
            Join Room
          </button>
        </div>
      )}

      {/* Mode: create */}
      {mode === 'create' && (
        <div>
          <button
            onClick={handleCreate}
            disabled={loading}
            className="w-full bg-violet-500 hover:bg-violet-600 active:bg-violet-700 disabled:bg-violet-300 text-white font-bold py-3 rounded-xl mb-3 transition-colors flex items-center justify-center gap-2"
          >
            {loading ? <Spinner /> : 'Create Room →'}
          </button>
          <button
            onClick={() => pickMode(null)}
            className="w-full text-gray-400 hover:text-gray-600 font-medium py-2 transition-colors text-sm"
          >
            ← Back
          </button>
        </div>
      )}

      {/* Mode: join */}
      {mode === 'join' && (
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
            Room Code
          </label>
          <input
            type="text"
            maxLength={4}
            value={joinCode}
            onChange={e => setJoinCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
            onKeyDown={e => e.key === 'Enter' && handleJoin()}
            placeholder="ABCD"
            autoFocus
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 focus:border-pink-400 focus:outline-none font-black text-center text-3xl tracking-widest text-gray-800 mb-4 transition-colors uppercase"
          />
          <button
            onClick={handleJoin}
            disabled={joinCode.length !== 4 || loading}
            className="w-full bg-pink-500 hover:bg-pink-600 active:bg-pink-700 disabled:bg-gray-100 disabled:text-gray-300 text-white font-bold py-3 rounded-xl mb-3 transition-colors flex items-center justify-center gap-2"
          >
            {loading ? <Spinner /> : 'Join Room →'}
          </button>
          <button
            onClick={() => pickMode(null)}
            className="w-full text-gray-400 hover:text-gray-600 font-medium py-2 transition-colors text-sm"
          >
            ← Back
          </button>
        </div>
      )}
    </div>
  );
}

function Spinner() {
  return (
    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
    </svg>
  );
}

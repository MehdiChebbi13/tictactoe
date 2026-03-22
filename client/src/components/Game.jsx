import Board from './Board.jsx';

export default function Game({ gameState, onMove, onRematch, onLeave }) {
  const {
    board,
    currentTurn,
    status,
    winner,
    winningLine,
    players,
    mySymbol,
    rematchVotes,
    opponentDisconnected,
    code,
  } = gameState;

  const me = players?.find(p => p.symbol === mySymbol);
  const opponent = players?.find(p => p.symbol !== mySymbol);
  const myTurn = status === 'playing' && currentTurn === mySymbol;
  const iVotedRematch = rematchVotes?.[mySymbol] ?? false;

  // ── Result label ─────────────────────────────────────────────────────────
  const resultEmoji = opponentDisconnected
    ? '👋'
    : winner === 'draw'
    ? '🤝'
    : winner === mySymbol
    ? '🎉'
    : '😔';

  const resultText = opponentDisconnected
    ? 'Opponent disconnected'
    : winner === 'draw'
    ? "It's a draw!"
    : winner === mySymbol
    ? 'You win!'
    : 'You lose…';

  // ── Turn label ───────────────────────────────────────────────────────────
  const turnLabel = myTurn
    ? 'Your turn!'
    : opponent
    ? `${opponent.nickname}'s turn…`
    : 'Waiting…';

  return (
    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden">

      {/* ── Header bar ── */}
      <div className="bg-gradient-to-r from-violet-500 to-pink-500 px-5 py-3 flex items-center justify-between">
        <div className="text-white font-black text-lg tracking-tight">
          <span className="text-rose-200">X</span>
          <span className="opacity-50 mx-1">vs</span>
          <span className="text-sky-200">O</span>
        </div>
        <span className="bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full tracking-widest">
          {code}
        </span>
      </div>

      {/* ── Players ── */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
        <PlayerBadge
          player={me}
          isActive={status === 'playing' && currentTurn === mySymbol}
          isMe
        />
        <span className="text-gray-200 font-bold text-sm">VS</span>
        <PlayerBadge
          player={opponent}
          isActive={status === 'playing' && opponent && currentTurn === opponent.symbol}
        />
      </div>

      {/* ── Turn indicator ── */}
      {status === 'playing' && (
        <div
          className={`text-center py-2 text-xs font-bold uppercase tracking-wider transition-colors ${
            myTurn ? 'text-violet-600' : 'text-gray-300'
          }`}
        >
          {myTurn && <span className="inline-block w-2 h-2 rounded-full bg-violet-500 mr-1.5 animate-pulse-ring" />}
          {turnLabel}
        </div>
      )}

      {/* ── Board ── */}
      <div className="flex justify-center">
        <Board
          board={board}
          winningLine={winningLine}
          onMove={onMove}
          myTurn={myTurn}
        />
      </div>

      {/* ── Result panel (shown when game ends) ── */}
      {(status === 'ended' || opponentDisconnected) && (
        <div className="border-t border-gray-100 px-6 py-6 text-center">
          <div className="text-4xl mb-2">{resultEmoji}</div>
          <p className="text-2xl font-black text-gray-800 mb-5">{resultText}</p>

          {!opponentDisconnected ? (
            <div className="space-y-2">
              <button
                onClick={onRematch}
                disabled={iVotedRematch}
                className={`w-full py-3 rounded-xl font-bold transition-colors ${
                  iVotedRematch
                    ? 'bg-violet-100 text-violet-400 cursor-default'
                    : 'bg-violet-500 hover:bg-violet-600 text-white'
                }`}
              >
                {iVotedRematch ? '⏳ Waiting for opponent…' : '🔁 Rematch'}
              </button>
              <button
                onClick={onLeave}
                className="w-full py-3 rounded-xl font-bold bg-gray-50 hover:bg-gray-100 text-gray-500 transition-colors"
              >
                Leave
              </button>
            </div>
          ) : (
            <button
              onClick={onLeave}
              className="w-full py-3 rounded-xl font-bold bg-violet-500 hover:bg-violet-600 text-white transition-colors"
            >
              Back to Lobby
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ── PlayerBadge ──────────────────────────────────────────────────────────────

function PlayerBadge({ player, isActive, isMe }) {
  const side = isMe ? 'items-start' : 'items-end';

  if (!player) {
    // Skeleton while waiting for opponent to join
    return (
      <div className={`flex flex-col ${side} gap-1 opacity-30`}>
        <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse" />
        <div className="h-2.5 w-16 bg-gray-200 rounded animate-pulse" />
      </div>
    );
  }

  const isX = player.symbol === 'X';

  return (
    <div className={`flex flex-col ${side} gap-1`}>
      <div
        className={`w-9 h-9 rounded-full flex items-center justify-center font-black text-base transition-all ${
          isX ? 'bg-rose-100 text-rose-500' : 'bg-sky-100 text-sky-500'
        } ${isActive ? (isX ? 'ring-2 ring-rose-400 ring-offset-1' : 'ring-2 ring-sky-400 ring-offset-1') : ''}`}
      >
        {isX ? '✕' : '○'}
      </div>
      <span className="text-xs font-bold text-gray-600 max-w-[80px] truncate">
        {player.nickname}
        {isMe && <span className="text-gray-300"> (you)</span>}
      </span>
    </div>
  );
}

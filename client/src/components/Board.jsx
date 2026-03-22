export default function Board({ board, winningLine, onMove, myTurn }) {
  return (
    <div className="grid grid-cols-3 gap-2.5 p-5">
      {board.map((cell, i) => {
        const isWin = winningLine?.includes(i);
        const isEmpty = cell === null;
        const canClick = isEmpty && myTurn;

        return (
          <button
            key={i}
            onClick={() => canClick && onMove(i)}
            disabled={!canClick}
            className={[
              'w-24 h-24 rounded-2xl flex items-center justify-center text-5xl font-black transition-all duration-150 select-none',
              isWin
                ? 'bg-yellow-100 ring-2 ring-yellow-400 scale-105'
                : canClick
                ? 'bg-gray-50 hover:bg-gray-100 hover:scale-105 active:scale-95 cursor-pointer shadow-sm'
                : 'bg-gray-50 cursor-default',
            ].join(' ')}
          >
            {cell === 'X' && (
              <span className="text-rose-500 animate-pop">✕</span>
            )}
            {cell === 'O' && (
              <span className="text-sky-500 animate-pop">○</span>
            )}
          </button>
        );
      })}
    </div>
  );
}

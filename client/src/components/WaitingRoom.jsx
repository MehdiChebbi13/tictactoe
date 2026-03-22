import { useState } from 'react';

export default function WaitingRoom({ code, onLeave }) {
  const [copied, setCopied] = useState(false);

  const copyCode = () => {
    navigator.clipboard.writeText(code).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-sm text-center">
      {/* Header */}
      <div className="text-4xl mb-3">🔗</div>
      <h2 className="text-2xl font-black text-gray-800 mb-1">Room Created!</h2>
      <p className="text-gray-400 text-sm mb-8">Share this code with your friend to start the game</p>

      {/* Code card */}
      <button
        onClick={copyCode}
        className="w-full bg-gradient-to-br from-violet-50 to-pink-50 border-2 border-dashed border-violet-200 hover:border-violet-400 rounded-2xl px-6 py-6 mb-8 transition-all group cursor-pointer"
      >
        <div className="text-5xl font-black tracking-widest text-violet-600 mb-2 font-mono">
          {code}
        </div>
        <div className="text-xs font-semibold text-violet-400 group-hover:text-violet-600 transition-colors">
          {copied ? '✓ Copied to clipboard!' : 'Click to copy'}
        </div>
      </button>

      {/* Waiting animation */}
      <div className="flex items-center justify-center gap-3 mb-8 text-gray-400">
        <div className="flex gap-1.5">
          {[0, 150, 300].map((delay) => (
            <span
              key={delay}
              className="w-2.5 h-2.5 rounded-full bg-violet-400 animate-bounce"
              style={{ animationDelay: `${delay}ms` }}
            />
          ))}
        </div>
        <span className="font-medium text-sm">Waiting for opponent…</span>
      </div>

      {/* Symbol hint */}
      <p className="text-sm text-gray-400 mb-6">
        You will play as{' '}
        <span className="font-black text-rose-500 text-base">X</span>
      </p>

      <button
        onClick={onLeave}
        className="text-gray-300 hover:text-gray-500 font-medium text-sm transition-colors"
      >
        Leave Room
      </button>
    </div>
  );
}

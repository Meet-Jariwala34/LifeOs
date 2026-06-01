// client/src/features/Content/ContentCardSkeleton.jsx
import React from 'react';

export default function ContentCardSkeleton() {
  return (
    <div className="rounded-2xl border border-zinc-900/80 bg-[#131313]/60 p-6 flex flex-col justify-between h-[180px] animate-pulse shadow-xl">
      <div className="space-y-4">
        {/* Top Badge Indicators Bar */}
        <div className="flex items-center justify-between">
          <div className="h-4 w-20 rounded bg-zinc-800" />
          <div className="h-4 w-14 rounded bg-zinc-800" />
        </div>

        {/* Main Header String Rows */}
        <div className="space-y-2 pt-1">
          <div className="h-4 w-[90%] rounded bg-zinc-800" />
          <div className="h-4 w-[60%] rounded bg-zinc-800" />
        </div>
      </div>

      {/* Bottom Control Actions Bar Component */}
      <div className="pt-4 flex items-center justify-between border-t border-zinc-900/40">
        <div className="h-3 w-20 rounded bg-zinc-800/60" />
        
        {/* Animated AI Processing Badge Tracker */}
        <div className="flex items-center space-x-2 bg-purple-500/5 border border-purple-500/10 px-3 py-1.5 rounded-lg">
          <div className="h-2 w-2 rounded-full bg-purple-400 animate-ping" />
          <span className="font-mono text-[9px] font-bold text-purple-400 uppercase tracking-widest">
            AI Rendering...
          </span>
        </div>
      </div>
    </div>
  );
}
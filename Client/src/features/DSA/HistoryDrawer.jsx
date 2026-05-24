// client/src/features/DSA/HistoryDrawer.jsx
import React, { useEffect, useState } from 'react';
import API from '../../services/api';
import { DismissRegular, HistoryRegular, ArrowClockwiseRegular, CheckmarkCircleRegular } from '@fluentui/react-icons';

export default function HistoryDrawer({ isOpen, onClose }) {
  const [historyLogs, setHistoryLogs] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const fetchHistory = async () => {
        setLoading(true);
        try {
          const response = await API.get('/dsa/history');
          if (response.data.success) {
            setHistoryLogs(response.data.data);
          }
        } catch (err) {
          console.error("Failed to load timeline streams:", err);
        } finally {
          setLoading(false);
        }
      };
      fetchHistory();
    }
  }, [isOpen]);

  return (
    <>
      {/* BACKGROUND BLUR OVERLAY */}
      <div 
        onClick={onClose}
        className={`fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity duration-500 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} 
      />

      {/* CORE SLIDING PANEL PANEL */}
      <div className={`fixed top-0 right-0 z-50 h-screen w-full max-w-md border-l border-zinc-900 bg-[#131313] p-6 shadow-2xl transition-transform duration-500 ease-out transform ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        
        {/* PANEL DRAWER HEADER */}
        <div className="flex items-center justify-between border-b border-zinc-900 pb-4 mb-6">
          <div className="flex items-center space-x-2 text-white">
            <HistoryRegular className="text-xl" />
            <h2 className="text-base font-bold tracking-wide">System Audit Trail</h2>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-zinc-800 transition-all"
          >
            <DismissRegular className="text-xl" />
          </button>
        </div>

        {/* LOG SCROLL CONTAINER */}
        <div className="h-[calc(100vh-100px)] overflow-y-auto space-y-4 pr-1 scrollbar-thin">
          {loading ? (
            <div className="text-xs font-mono text-gray-500 animate-pulse py-8 text-center">PARSING TIMELINE MATRICES...</div>
          ) : historyLogs.length === 0 ? (
            <div className="text-xs font-mono text-gray-600 text-center py-12 border border-dashed border-zinc-800 rounded-xl">
              NO ACTION snapshots LOCATED. COMMIT QUEUES TO POPULATE AUDIT TRACKS.
            </div>
          ) : (
            historyLogs.map((log) => (
              <div 
                key={log._id}
                className="group relative rounded-xl border border-zinc-900 bg-[#0a0a0a]/50 p-4 transition-all hover:border-zinc-800"
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-white tracking-wide group-hover:text-emerald-400 transition-colors">
                      {log.title}
                    </h4>
                    <div className="flex items-center space-x-2 font-mono text-[10px] text-gray-500 uppercase tracking-wider">
                      <span>{log.topic}</span>
                      <span>•</span>
                      <span>Lvl {log.revisionStage}</span>
                    </div>
                  </div>

                  {/* STAGE RESULT PILL */}
                  <div className="text-gray-500 text-xs">
                    {log.revisionStage === 5 ? (
                      <span className="text-emerald-400 font-mono text-[10px] bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">Mastered</span>
                    ) : (
                      <span className="text-amber-400 font-mono text-[10px] bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">Active Loop</span>
                    )}
                  </div>
                </div>

                {/* LOG TIME FOOTER */}
                <div className="mt-3 pt-2 border-t border-zinc-900/60 flex items-center justify-between text-[10px] font-mono text-gray-600">
                  <span>Synced Core Cluster</span>
                  <span>{new Date(log.lastSolvedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>
            ))
          )}
        </div>

      </div>
    </>
  );
}
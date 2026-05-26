// client/src/features/DSA/DSA.jsx
import React, { useState, useEffect } from 'react';
import API from '../../services/api'; // Direct link to your local Express backend server instance
import { 
  CheckmarkCircleRegular, 
  ArrowClockwiseRegular, 
  OpenRegular,
  ClockRegular,
  PulseRegular
} from '@fluentui/react-icons';
import HistoryDrawer from './HistoryDrawer';
import Loader from '../../components/Loader/Loader';

export default function DSA() {
  const [dailyDeck, setDailyDeck] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  // Real-time local operational statistics for the gauge header cards
  const [stats, setStats] = useState({ solvedToday: 0, targetToday: 5, progress: 0 });
  const [isServerOnline, setIsServerOnline] = useState(true);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  // ⏳ Local Tracking Map for running background writes: { [problemIdOrIndex]: 'PASSED' | 'FAILED' }
  const [syncingRows, setSyncingRows] = useState({});

  // Math variables for our Circular Progress Ring layout
  const radius = 52;
  const circumference = 2 * Math.PI * radius; // Approx 226.19

  // Calculate offset value relative to progress state percentage
  const strokeDashoffset = circumference - (stats.progress / 100) * circumference;

  // 📡 1. Network Operation: Fetch active queue from your backend
  const fetchDailyDeck = async (silent = false) => {
    setErrorMessage('');
    // Only invoke the global full-screen spinner on hard initial mounts, not background refreshes
    if (!silent) setLoading(true);
    try {
      const minimumDelayPromise = new Promise(resolve => setTimeout(resolve, 2500));
      const [response] = await Promise.all([
        API.get('/dsa/getDeck'),
        minimumDelayPromise
      ]);

      // Once BOTH promises resolve, map your backend properties smoothly
      if (response.data.success) {
        setDailyDeck(response.data.data);
        
        const solvedToday = response.data.solvedTodayCount || 0;
        const targetGoal = 5; 
        
        setStats({
          solvedToday: solvedToday,
          targetToday: targetGoal,
          progress: Math.min(Math.round((solvedToday / targetGoal) * 100), 100)
        });
      }

    } catch (err) {
      console.error('Error connecting to operational database nodes:', err);
      setErrorMessage('Failed to fetch algorithmic data nodes from server.');
    } finally {
      if (!silent) setLoading(false);
    }
  };

  // 💓 2. Automated Heartbeat Check Polling Loop
  const checkServerHealth = async () => {
    try {
      const response = await API.get('/ready');
      if (response.status === 200) {
        setIsServerOnline(true);
      }
    } catch (err) {
      setIsServerOnline(false);
    }
  };

  // 🔄 3. Hook Event: Fire network pipeline instantly on component startup
  useEffect(() => {
    fetchDailyDeck();
    checkServerHealth();

    // Set up a background pulse check interval to clear every 10 seconds (10000ms)
    const healthInterval = setInterval(checkServerHealth, 10000);

    // Clean up the timer when switching sidebar tabs to prevent memory leaks
    return () => clearInterval(healthInterval);
  }, []);

  // ⚡ 4. UI Mutation Action: Sync your Spaced Repetition choice with the database
  const handleStatusUpdate = async (problem, index, actionType) => {
    const rowKey = problem._id || String(index);

    // Guard: Prevent double firing if this row is currently parsing a payload
    if (syncingRows[rowKey]) return;

    // Set the specific action processing status for this localized row index
    setSyncingRows(prev => ({ ...prev, [rowKey]: actionType }));

    try {
      const response = await API.post('/dsa/updateStatus', {
        title: problem.title,
        topic: problem.topic,
        difficulty: problem.difficulty,
        problemUrl: problem.problemUrl,
        action: actionType // Expects 'PASSED' (Mastered) or 'FAILED' (Needs Revision)
      });
      
      if (response.data.success) {
        // Automatically re-fetch data stream silently in the background to avoid layout pops
        await fetchDailyDeck(true);
      }
    } catch (err) {
      console.error('Failed to update task timeline snapshot:', err);
    } finally {
      // Clear out the tracking token to unlock operation rules for this index row
      setSyncingRows(prev => {
        const next = { ...prev };
        delete next[rowKey];
        return next;
      });
    }
  };

  // Helper utility to match difficulty flags to clean color states
  const getDifficultyStyles = (diff) => {
    if (diff === 'Easy') return { dot: 'bg-emerald-500', text: 'text-zinc-400' };
    if (diff === 'Medium') return { dot: 'bg-amber-500', text: 'text-zinc-400' };
    return { dot: 'bg-red-500', text: 'text-zinc-400' };
  };

  return (
    loading ? (
      <div className="flex flex-col items-center justify-center space-y-3 w-full bg-[#0a0a0a] h-screen">
        <div className="h-6 w-6 rounded-full border border-t-white border-zinc-800 animate-spin" />
        <span className="font-mono text-[9px] text-gray-500 uppercase tracking-[0.2em] animate-pulse">Syncing Lab Clusters...</span>
      </div>
    ) : (
      <div className="flex-1 h-screen overflow-y-auto bg-[#0a0a0a] text-zinc-100 p-10 space-y-8 animate-fade-in font-sans">
        
        {/* HEADER SECTION */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white uppercase font-mono text-left">Workspace</h1>
          </div>
          <div className="flex items-center space-x-5 text-gray-400">
            <ClockRegular 
              onClick={() => setIsHistoryOpen(true)} 
              className="text-2xl hover:text-white cursor-pointer transition-colors active:scale-95" 
            />
            
            <div 
              className="relative cursor-pointer group"
              title={isServerOnline ? "Server Nodes: Operational" : "Server Nodes: Critical Error Disconnect"}
            >
              <PulseRegular className={`text-2xl transition-colors duration-500 ${isServerOnline ? 'text-emerald-400' : 'text-red-500'}`} />
              <span className={`absolute top-0 right-0 flex h-2 w-2 rounded-full transition-all duration-500 ${isServerOnline ? 'bg-emerald-500 animate-pulse' : 'bg-red-500 animate-ping'}`} />
            </div>
          </div>
        </div>

        {errorMessage && (
          <div className="rounded-xl bg-red-950/20 border border-red-500/20 p-4 text-xs font-mono text-red-400 text-left">
            {errorMessage}
          </div>
        )}

        {/* TOP ANALYTICS GRID WITH CIRCULAR GAUGE COMPONENT */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          
          <div className="md:col-span-2 flex items-center justify-between rounded-2xl border border-zinc-900 bg-[#131313] p-8 text-left">
            <div className="space-y-4">
              <h2 className="text-3xl font-bold text-white tracking-wide">Algorithm Mastery</h2>
              <p className="text-sm text-gray-400 max-w-md leading-relaxed">
                Tracking consistent Blind 75 logic blocks. Your active spacing replication intervals prevent cognitive pattern decay.
              </p>
              <div className="pt-2">
                <button 
                  onClick={() => fetchDailyDeck(false)} 
                  className="rounded-xl bg-white px-5 py-3 font-medium text-xs text-black transition-all hover:bg-gray-200 active:scale-95"
                >
                  Refresh Queue Matrix
                </button>
              </div>
            </div>

            {/* NEON CIRCULAR PROGRESS GRAPH MODULE */}
            <div className="relative flex items-center justify-center pr-2 group">
              <svg className="w-28 h-28 transform -rotate-90">
                <circle
                  cx="56"
                  cy="56"
                  r={radius}
                  className="stroke-zinc-800"
                  strokeWidth="7"
                  fill="transparent"
                />
                <circle
                  cx="56"
                  cy="56"
                  r={radius}
                  className="stroke-green-400 transition-all duration-700 ease-out"
                  strokeWidth="7"
                  fill="transparent"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center translate-x-[-7px]">
                <span className="text-xl font-black text-white leading-none tracking-tighter">
                  {stats.progress}%
                </span>
                <span className="font-mono text-[8px] tracking-widest text-gray-500 uppercase mt-0.5">
                  Done
                </span>
              </div>
            </div>
          </div>

          {/* Daily Progression Target Card */}
          <div className="rounded-2xl border border-zinc-800 bg-[#131313] p-8 flex flex-col justify-between text-left">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold uppercase tracking-widest text-gray-400">Daily Target</span>
              <div className="text-emerald-400">
                <CheckmarkCircleRegular className="text-2xl" />
              </div>
            </div>
            <div className="space-y-3">
              <div className="text-3xl font-bold text-white">{stats.solvedToday} / {stats.targetToday} Solved</div>
              <div className="h-1.5 w-full rounded-full bg-zinc-900 overflow-hidden border border-zinc-800/50">
                <div 
                  className="h-full rounded-full bg-green-400 transition-all duration-700" 
                  style={{ width: `${(stats.solvedToday / stats.targetToday) * 100}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 leading-relaxed">
                {stats.solvedToday === stats.targetToday ? "All current intervals satisfied!" : "Execute your open queues below."}
              </p>
            </div>
          </div>
        </div>

        {/* FILTER CONTROLS HUB HEADER */}
        <div className="flex items-center justify-between pt-4 border-t border-zinc-900">
          <h2 className="text-lg font-semibold text-white tracking-wide">Active Queue</h2>
          <div className="font-mono text-[10px] tracking-widest text-gray-500 uppercase">
            Spaced Repetition System Loop
          </div>
        </div>

        {/* CORE QUEUE SYSTEM DATA SHEET */}
        <div className="overflow-hidden rounded-2xl border border-zinc-900 bg-[#131313]/40 shadow-xl">
          {dailyDeck.length === 0 ? (
            <div className="p-16 text-center font-mono text-xs text-gray-500 border border-dashed border-zinc-800 m-4 rounded-xl">
              ⚡ TARGET DECK LOOP VACANT. ALL TODAY'S REVISIONS SATISFIED.
            </div>
          ) : (
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="border-b border-zinc-900 bg-[#131313] font-mono text-[11px] font-bold tracking-wider text-gray-400 uppercase">
                  <th className="p-5 w-24">ID</th>
                  <th className="p-5">Title / Reference Nodes</th>
                  <th className="p-5 w-40">Status Interval</th>
                  <th className="p-5 w-32">Difficulty</th>
                  <th className="p-5 w-32 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900/40 text-gray-300">
                {dailyDeck.map((problem, index) => {
                  const diffStyles = getDifficultyStyles(problem.difficulty);
                  const rowKey = problem._id || String(index);
                  
                  // Extract active sync operation strings for this localized mapping cell row
                  const currentSyncAction = syncingRows[rowKey];
                  const isRowSyncing = !!currentSyncAction;

                  return (
                    <tr key={rowKey} className={`group hover:bg-[#131313]/30 transition-colors ${isRowSyncing ? 'opacity-60 bg-zinc-900/10' : ''}`}>
                      <td className="p-5 font-mono text-gray-600 group-hover:text-gray-400 transition-colors">
                        #{String(index + 1).padStart(3, '0')}
                      </td>
                      <td className="p-5">
                        <a 
                          href={problem.problemUrl} 
                          target="_blank" 
                          rel="noreferrer"
                          className="inline-flex items-center space-x-2 font-medium text-white hover:text-gray-300 hover:underline transition-colors tracking-wide"
                        >
                          <span>{problem.title}</span>
                          <OpenRegular className="opacity-0 group-hover:opacity-100 text-gray-500 transition-opacity text-sm" />
                        </a>
                      </td>
                      <td className="p-5 font-mono text-[10px] font-bold tracking-widest uppercase">
                        {problem.revisionStage > 0 ? (
                          <span className="rounded bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 text-amber-400">
                            Revision Lvl {problem.revisionStage}
                          </span>
                        ) : (
                          <span className="rounded bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 text-cyan-400">
                            Untouched
                          </span>
                        )}
                      </td>
                      <td className="p-5">
                        <div className="flex items-center space-x-2">
                          <span className={`h-2 w-2 rounded-full ${diffStyles.dot}`} />
                          <span className={`font-medium ${diffStyles.text}`}>{problem.difficulty}</span>
                        </div>
                      </td>
                      <td className="p-5 text-center">
                        <div className="flex items-center justify-center space-x-3">
                          
                          {/* 🟡 REVISION FLAGGING BUTTON (FAILED) */}
                          <button
                            disabled={isRowSyncing}
                            onClick={() => handleStatusUpdate(problem, index, 'FAILED')}
                            className={`p-1.5 rounded border border-zinc-800 bg-[#1c1c1c] transition-all flex items-center justify-center min-w-[32px] min-h-[32px] ${
                              isRowSyncing && currentSyncAction !== 'FAILED'
                                ? 'opacity-30 cursor-not-allowed'
                                : 'text-gray-400 hover:text-amber-400 hover:border-amber-500/30 active:scale-90'
                            }`}
                            title="Flag problem for revision interval"
                          >
                            {currentSyncAction === 'FAILED' ? (
                              <div className="h-3.5 w-3.5 rounded-full border-2 border-zinc-700 border-t-amber-400 animate-spin" />
                            ) : (
                              <ArrowClockwiseRegular className="text-base" />
                            )}
                          </button>

                          {/* 🟢 MASTERED SUBMISSION BUTTON (PASSED) */}
                          <button
                            disabled={isRowSyncing}
                            onClick={() => handleStatusUpdate(problem, index, 'PASSED')}
                            className={`p-1.5 rounded border border-zinc-800 bg-[#1c1c1c] transition-all flex items-center justify-center min-w-[32px] min-h-[32px] ${
                              isRowSyncing && currentSyncAction !== 'PASSED'
                                ? 'opacity-30 cursor-not-allowed'
                                : 'text-gray-400 hover:text-emerald-400 hover:border-emerald-500/30 active:scale-90'
                            }`}
                            title="Mark problem as completed"
                          >
                            {currentSyncAction === 'PASSED' ? (
                              <div className="h-3.5 w-3.5 rounded-full border-2 border-zinc-700 border-t-emerald-400 animate-spin" />
                            ) : (
                              <CheckmarkCircleRegular className="text-base" />
                            )}
                          </button>

                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* MOUNT THE SLIDING OVERLAY CONTAINER AT THE VERY BOTTOM OF YOUR JSX ROW */}
        <HistoryDrawer 
          isOpen={isHistoryOpen} 
          onClose={() => setIsHistoryOpen(false)} 
        />
      </div>
    )
  );
}
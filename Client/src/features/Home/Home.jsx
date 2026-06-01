// client/src/features/Dashboard/DashboardOverview.jsx
import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import { 
  BoardRegular, AccessTimeRegular, CodeRegular, 
  VideoClipRegular, CheckmarkCircleRegular, FlashRegular,
  PulseRegular, ArrowClockwiseRegular, OpenRegular
} from '@fluentui/react-icons';

export default function DashboardOverview() {
  const [metrics, setMetrics] = useState({ dsaSolvedToday: 0, activeProjects: 0, pendingContent: 0 });
  const [dsaDeck, setDsaDeck] = useState([]);
  const [projects, setProjects] = useState([]);
  const [contentTasks, setContentTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isServerOnline, setIsServerOnline] = useState(true);

  const [ritual, setRitual] = useState(() => {
    const saved = localStorage.getItem('lifeos_369_ritual');
    return saved ? JSON.parse(saved) : { morning: false, afternoon: false, evening: false };
  });

  useEffect(() => {
    localStorage.setItem('lifeos_369_ritual', JSON.stringify(ritual));
  }, [ritual]);

  const fetchDashboardOverviewData = async () => {
    try {
      const [dsaRes, projectRes, contentRes] = await Promise.all([
        API.get('/dsa/getDeck'),
        API.get('/projects/all'),
        API.get('/content/active')
      ]);

      if (dsaRes.data.success) {
        setDsaDeck(dsaRes.data.data.slice(0, 3)); 
        setMetrics(prev => ({ ...prev, dsaSolvedToday: dsaRes.data.solvedTodayCount || 0 }));
      }
      if (projectRes.data.success) {
        setProjects(projectRes.data.data.slice(0, 2)); 
        setMetrics(prev => ({ ...prev, activeProjects: projectRes.data.data.length }));
      }
      if (contentRes.data.success) {
        setContentTasks(contentRes.data.data.slice(0, 3)); 
        setMetrics(prev => ({ ...prev, pendingContent: contentRes.data.data.length }));
      }
    } catch (err) {
      console.error("Dashboard engine link dropped:", err);
    } finally {
      setLoading(false);
    }
  };

  const checkServerHealth = async () => {
    try {
      const response = await API.get('/ready');
      setIsServerOnline(response.status === 200);
    } catch (err) {
      setIsServerOnline(false);
    }
  };

  useEffect(() => {
    fetchDashboardOverviewData();
    checkServerHealth();
    const interval = setInterval(checkServerHealth, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    loading ? (
      <div className="flex flex-col items-center justify-center space-y-3 w-full bg-[#0a0a0a] h-screen font-mono">
        <div className="h-5 w-5 rounded-full border border-t-white border-zinc-800 animate-spin" />
        <span className="text-[9px] text-gray-500 uppercase tracking-widest animate-pulse">Syncing Central Matrix...</span>
      </div>
    ) : (
      <div className="flex-1 h-screen overflow-y-auto bg-[#0a0a0a] text-zinc-100 p-10 space-y-8 animate-fade-in font-sans relative">
        
        {/* TOP STATUS HUB BAR HEADER */}
        <div className="flex items-center justify-between border-b border-zinc-900 pb-5">
          <div className="text-left space-y-1">
            <h1 className="text-2xl font-black text-white uppercase tracking-tight font-mono flex items-center space-x-2">
              <BoardRegular className="text-xl text-purple-400" />
              <span>LifeOS Command Deck</span>
            </h1>
            <p className="text-xs text-zinc-500 font-mono">Unified Full-Stack Operational Control Center</p>
          </div>
          <div className="flex items-center space-x-5 text-zinc-500">
            <button 
              onClick={() => { setLoading(true); fetchDashboardOverviewData(); }}
              className="p-1.5 rounded-lg border border-zinc-900 bg-zinc-950/40 hover:text-white transition-all"
            >
              <ArrowClockwiseRegular className="text-lg" />
            </button>
            <div className="relative group">
              <PulseRegular className={`text-2xl transition-colors duration-500 ${isServerOnline ? 'text-emerald-400' : 'text-red-500'}`} />
              <span className={`absolute top-0 right-0 flex h-2 w-2 rounded-full ${isServerOnline ? 'bg-emerald-500 animate-pulse' : 'bg-red-500 animate-ping'}`} />
            </div>
          </div>
        </div>

        {/* METRICS ROW */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="rounded-xl border border-zinc-900 bg-[#131313] p-5 flex items-center justify-between">
            <div className="text-left space-y-1">
              <p className="text-[9px] font-mono uppercase text-zinc-500 tracking-wider">Algorithmic Spacing</p>
              <p className="text-2xl font-bold font-mono text-white">{metrics.dsaSolvedToday} <span className="text-xs text-zinc-600">/ 5 Done</span></p>
            </div>
            <CodeRegular className="text-2xl text-blue-400" />
          </div>
          <div className="rounded-xl border border-zinc-900 bg-[#131313] p-5 flex items-center justify-between">
            <div className="text-left space-y-1">
              <p className="text-[9px] font-mono uppercase text-zinc-500 tracking-wider">Active Blueprints</p>
              <p className="text-2xl font-bold font-mono text-white">{metrics.activeProjects}</p>
            </div>
            <FlashRegular className="text-2xl text-emerald-400" />
          </div>
          <div className="rounded-xl border border-zinc-900 bg-[#131313] p-5 flex items-center justify-between">
            <div className="text-left space-y-1">
              <p className="text-[9px] font-mono uppercase text-zinc-500 tracking-wider">Active Studio Tracks</p>
              <p className="text-2xl font-bold font-mono text-white">{metrics.pendingContent}</p>
            </div>
            <VideoClipRegular className="text-2xl text-purple-400" />
          </div>
          <div className="rounded-xl border border-zinc-900 bg-[#131313] p-5 flex items-center justify-between">
            <div className="text-left space-y-1">
              <p className="text-[9px] font-mono uppercase text-zinc-500 tracking-wider">Ritual Synergy</p>
              <p className="text-xs font-mono font-bold text-amber-400 uppercase pt-1 tracking-wider">
                {Object.values(ritual).filter(Boolean).length === 3 ? "⚡ COMPLETE PEAK" : "🔋 SYNC RENDERING"}
              </p>
            </div>
            <AccessTimeRegular className="text-2xl text-amber-400" />
          </div>
        </div>

        {/* WORKSPACE SECTORS ROW */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-6 flex flex-col justify-between">
            <div className="rounded-2xl border border-zinc-900 bg-[#131313] p-6 text-left space-y-4 flex-1">
              <h3 className="text-xs font-bold uppercase font-mono tracking-widest text-zinc-500">Active Spaced Repetition Array</h3>
              <div className="space-y-2.5 pt-1">
                {dsaDeck.length === 0 ? (
                  <div className="p-8 text-center font-mono text-[10px] text-zinc-700 border border-dashed border-zinc-900 rounded-xl bg-zinc-950/20">⚡ Queue clear. All today's revisions satisfied.</div>
                ) : (
                  dsaDeck.map((prob, idx) => (
                    <div key={prob._id || idx} className="flex items-center justify-between p-3.5 rounded-xl border border-zinc-900/60 bg-zinc-950/30 hover:border-zinc-800 transition-all font-mono text-xs group">
                      <div className="flex items-center space-x-3 truncate">
                        <span className="text-zinc-600 font-bold">#0{idx + 1}</span>
                        <a href={prob.problemUrl} target="_blank" rel="noreferrer" className="text-zinc-200 font-sans font-semibold hover:text-white hover:underline truncate inline-flex items-center space-x-1.5">
                          <span>{prob.title}</span>
                          <OpenRegular className="text-[10px] opacity-0 group-hover:opacity-100 text-zinc-500 transition-opacity" />
                        </a>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold tracking-wider uppercase ${prob.status === 'Revision' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'}`}>
                        {prob.status}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-zinc-900 bg-[#131313] p-6 text-left space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase font-mono tracking-widest text-zinc-500">3-6-9 Dynamic Manifest Ritual</h3>
                <span onClick={() => setRitual({ morning: false, afternoon: false, evening: false })} className="text-[9px] font-mono text-zinc-600 hover:text-zinc-400 uppercase cursor-pointer tracking-wider">Reset Cycle</span>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <button onClick={() => setRitual(prev => ({ ...prev, morning: !prev.morning }))} className={`p-4 rounded-xl border font-mono text-center transition-all active:scale-95 flex flex-col items-center justify-center space-y-1 ${ritual.morning ? 'border-amber-500/30 bg-amber-500/5 text-amber-400 shadow-lg' : 'border-zinc-900 bg-zinc-950/20 text-zinc-600 hover:text-zinc-400'}`}><span className="text-[10px] font-black tracking-widest uppercase">3x Morning</span></button>
                <button onClick={() => setRitual(prev => ({ ...prev, afternoon: !prev.afternoon }))} className={`p-4 rounded-xl border font-mono text-center transition-all active:scale-95 flex flex-col items-center justify-center space-y-1 ${ritual.afternoon ? 'border-amber-500/30 bg-amber-500/5 text-amber-400 shadow-lg' : 'border-zinc-900 bg-zinc-950/20 text-zinc-600 hover:text-zinc-400'}`}><span className="text-[10px] font-black tracking-widest uppercase">6x Afternoon</span></button>
                <button onClick={() => setRitual(prev => ({ ...prev, evening: !prev.evening }))} className={`p-4 rounded-xl border font-mono text-center transition-all active:scale-95 flex flex-col items-center justify-center space-y-1 ${ritual.evening ? 'border-amber-500/30 bg-amber-500/5 text-amber-400 shadow-lg' : 'border-zinc-900 bg-zinc-950/20 text-zinc-600 hover:text-zinc-400'}`}><span className="text-[10px] font-black tracking-widest uppercase">9x Evening</span></button>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-2xl border border-zinc-900 bg-[#131313] p-6 text-left space-y-5 shadow-xl">
              <h3 className="text-xs font-bold uppercase font-mono tracking-widest text-zinc-500">Architecture Pipeline Gauges</h3>
              <div className="space-y-4 pt-1">
                {projects.map((proj) => (
                  <div key={proj._id} className="space-y-2 font-mono text-xs">
                    <div className="flex items-center justify-between text-zinc-400"><span className="font-sans font-semibold text-zinc-200 tracking-wide">{proj.title}</span><span>{proj.progress}% Complete</span></div>
                    <div className="h-2 w-full bg-zinc-950 border border-zinc-900 rounded-full overflow-hidden p-0.5">
                      <div className="h-full bg-gradient-to-r from-purple-500 via-indigo-500 to-emerald-400 rounded-full transition-all duration-700" style={{ width: `${proj.progress}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-zinc-900 bg-[#131313] p-6 text-left space-y-4 shadow-xl">
              <h3 className="text-xs font-bold uppercase font-mono tracking-widest text-zinc-500">Staged Content Studio Queues</h3>
              <div className="space-y-2.5 pt-1">
                {contentTasks.length === 0 ? (
                  <div className="p-8 text-center font-mono text-[10px] text-zinc-700 border border-dashed border-zinc-900 rounded-xl bg-zinc-950/20">🎬 Studio catalog slots empty.</div>
                ) : (
                  contentTasks.map((task) => (
                    <div key={task._id} className="flex items-center justify-between p-3 rounded-xl border border-zinc-900/60 bg-zinc-950/30 text-xs font-mono">
                      <div className="flex items-center space-x-2.5 truncate max-w-[200px]">
                        {/* 🚀 FIXED REAL-TIME STATUS BADGES AT HOME DECK SCREEN */}
                        <span className={`h-1.5 w-1.5 rounded-full ${task.status === 'Staged' ? 'bg-blue-400 animate-pulse' : 'bg-zinc-600'}`} />
                        <span className="text-zinc-300 font-sans font-medium truncate tracking-wide">{task.title}</span>
                      </div>
                      <span className={`text-[8px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded border ${task.status === 'Staged' ? 'text-blue-400 border-blue-500/20 bg-blue-500/5' : 'text-zinc-500 border-zinc-800 bg-zinc-900/20'}`}>
                        {task.status === 'Staged' ? 'Ready' : 'Staged'}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

      </div>
    )
  );
}
// client/src/features/Content/ContentStudio.jsx
import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import ContentCardSkeleton from './ContentCardSkeletion'; 
import { 
  HistoryRegular, CheckmarkRegular, DismissRegular, 
  OpenRegular, FolderOpenRegular, TagRegular, EyeRegular,
  DocumentCopyRegular, CalendarClockRegular, InfoRegular, ListRegular
} from '@fluentui/react-icons';

export default function ContentStudio() {
  const [tasks, setTasks] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [activeDetailsTask, setActiveDetailsTask] = useState(null);
  const [finalizedKitModal, setFinalizedKitModal] = useState(null);
  const [processingId, setProcessingId] = useState(null);
  const [copyFeedback, setCopyFeedback] = useState(false);

  const fetchStudioData = async () => {
    try {
      const activeRes = await API.get('/content/active');
      const historyRes = await API.get('/content/history');
      if (activeRes.data.success) setTasks(activeRes.data.data);
      if (historyRes.data.success) setHistory(historyRes.data.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchStudioData(); }, []);

  const triggerAutomation = async (id) => {
    setProcessingId(id);
    setTasks(prev => prev.map(t => t._id === id ? { ...t, status: 'Processing' } : t));
    try {
      const res = await API.post(`/content/complete/${id}`);
      if (res.data.success) {
        setFinalizedKitModal(res.data.data);
      }
    } catch (err) { 
      console.error("Pipeline automation fumbled:", err); 
    } finally { 
      setProcessingId(null); 
      await fetchStudioData();
    }
  };

  const handleArchiveTask = async (id) => {
    try {
      const res = await API.put(`/content/archive/${id}`);
      if (res.data.success) {
        setFinalizedKitModal(null);
        await fetchStudioData();
      }
    } catch (err) { console.error(err); }
  };

  const copyTextToClipboard = (text) => {
    if (!text) return;
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed"; 
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand("copy");
      setCopyFeedback(true);
      setTimeout(() => setCopyFeedback(false), 2000);
    } catch (err) { console.error("Clipboard copy fumbled:", err); }
    document.body.removeChild(textArea);
  };

  const parseStepsFromDescription = (description) => {
    if (!description) return ["No explicit structure staged yet."];
    return description
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0 && (line.match(/^\d+:\d+/) || line.startsWith('-') || line.match(/^\d+\./) || line.includes('Approach') || line.includes('Implementation')));
  };

  return (
    loading ? (
      <div className="flex flex-col items-center justify-center space-y-3 w-full bg-[#0a0a0a] h-screen">
        <div className="h-6 w-6 rounded-full border border-t-white border-zinc-800 animate-spin" />
        <span className="font-mono text-[9px] text-gray-500 uppercase tracking-widest animate-pulse">Syncing Studio Nodes...</span>
      </div>
    ) : (
      <div className="flex-1 h-screen overflow-y-auto bg-[#0a0a0a] text-zinc-100 p-10 space-y-8 animate-fade-in font-sans relative">
        
        {/* HEADER CONTROL DASHBOARD */}
        <div className="flex items-center justify-between border-b border-zinc-900 pb-5">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight text-white uppercase font-mono">Content Production</h1>
            <p className="text-xs text-zinc-500 font-mono">Asynchronous Pipeline Matrix Staging Hub</p>
          </div>
          <div className="flex items-center space-x-3">
            <button onClick={() => setIsHistoryOpen(true)} className="p-3 rounded-xl border border-zinc-800 bg-[#131313] text-zinc-400 hover:text-white transition-all active:scale-95"><HistoryRegular className="text-lg" /></button>
          </div>
        </div>

        {/* ACTIVE CONTENT GRID DISPLAY CONTAINER */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tasks.length === 0 ? (
            <div className="col-span-full p-16 text-center font-mono text-xs text-zinc-600 border border-dashed border-zinc-900 rounded-2xl bg-[#131313]/20">⚡ PRODUCTION SLOTS OPEN. SOLVE PROBLEMS TO SEED AUTOMATION.</div>
          ) : (
            tasks.map((task) => {
              if (processingId === task._id) {
                return <ContentCardSkeleton key={task._id} />;
              }

              return (
                <div key={task._id} className="group relative rounded-2xl border border-zinc-900 bg-[#131313] p-6 text-left flex flex-col justify-between hover:border-zinc-700 transition-all shadow-xl animate-fade-in">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <span className="rounded-md font-mono text-[9px] font-bold tracking-widest uppercase px-2 py-0.5 border bg-zinc-500/5 border-zinc-800 text-zinc-400">
                        {task.associatedType} {task.relatedProjectName && `• ${task.relatedProjectName}`}
                      </span>
                      <span className={`font-mono text-[9px] border px-2 py-0.5 rounded-md tracking-wider uppercase font-bold ${task.status === 'Staged' ? 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5' : 'text-purple-400 border-purple-500/20 bg-purple-500/5'}`}>
                        {task.status === 'Staged' ? 'Prompt Toolkit Ready' : `${task.aiMetadata?.contentType || 'Long Form'} Staged`}
                      </span>
                    </div>
                    <h3 className="text-base font-semibold text-white tracking-wide group-hover:text-zinc-200 transition-colors line-clamp-2">{task.title}</h3>
                  </div>

                  {/* 🚀 FIXED DYNAMIC ACTION BAR SECTOR */}
                  <div className="pt-6 flex items-center justify-between border-t border-zinc-900/60 mt-4">
                    <button onClick={() => setActiveDetailsTask(task)} className="text-xs font-mono text-zinc-500 hover:text-white transition-colors inline-flex items-center space-x-1.5"><span>Topics to Cover</span><OpenRegular className="text-[11px]" /></button>
                    
                    {task.status === 'Staged' ? (
                      <button 
                        onClick={() => setFinalizedKitModal(task)} 
                        className="bg-blue-500/10 border border-blue-500/20 text-blue-400 hover:bg-blue-500 hover:text-black active:scale-95 flex items-center space-x-1.5 px-3 py-1.5 rounded-lg font-mono text-[10px] uppercase font-bold tracking-wider transition-all"
                      >
                        <EyeRegular />
                        <span>Show Result</span>
                      </button>
                    ) : (
                      <button 
                        onClick={() => triggerAutomation(task._id)} 
                        className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-black active:scale-95 flex items-center space-x-1.5 px-3 py-1.5 rounded-lg font-mono text-[10px] uppercase font-bold tracking-wider transition-all"
                      >
                        <CheckmarkRegular />
                        <span>Compile Kit</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* 🎯 MAP MODAL: TOPICS / STEPS TO COVER OUTLINE */}
        {activeDetailsTask && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="w-full max-w-xl rounded-2xl border border-zinc-800 bg-[#0d0d0d] p-7 text-left space-y-6 shadow-2xl relative max-h-[85vh] overflow-y-auto">
              <button onClick={() => setActiveDetailsTask(null)} className="absolute top-6 right-6 text-zinc-500 hover:text-white transition-colors"><DismissRegular className="text-xl" /></button>
              <div className="space-y-1">
                <div className="flex items-center space-x-2 text-purple-400 font-mono text-xs font-bold uppercase tracking-widest"><ListRegular /><span>Production Guide Roadmap</span></div>
                <h2 className="text-lg font-bold text-white tracking-wide">{activeDetailsTask.aiMetadata?.optimizedTitle || activeDetailsTask.title}</h2>
              </div>
              <div className="space-y-3">
                <div className="font-mono text-[10px] uppercase font-bold text-zinc-500 tracking-widest flex items-center space-x-1.5"><InfoRegular /><span>Core Milestone Steps / Topics</span></div>
                <div className="w-full rounded-xl border border-zinc-900 bg-zinc-950 p-5 space-y-3">
                  {parseStepsFromDescription(activeDetailsTask.aiMetadata?.description).map((step, idx) => (
                    <div key={idx} className="flex items-start space-x-3 text-xs text-zinc-300 font-mono border-b border-zinc-900/40 pb-2 last:border-0 last:pb-0">
                      <span className="text-purple-400 font-bold select-none">❯</span>
                      <span>{step}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="p-4 rounded-xl bg-[#131313] border border-zinc-900/80 space-y-2">
                <div className="text-zinc-500 font-mono text-[10px] font-bold uppercase tracking-wider flex items-center space-x-1.5"><TagRegular /><span>Target Tags</span></div>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {activeDetailsTask.aiMetadata?.tags?.map((tag, i) => (
                    <span key={i} className="bg-zinc-900 text-zinc-400 px-2 py-0.5 rounded border border-zinc-800/60 font-mono text-[11px]">{tag}</span>
                  )) || <span className="text-zinc-600 font-mono text-xs">No tags configured</span>}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 🎯 THE COMPLETED AI TOOLKIT OVERLAY MODAL */}
        {finalizedKitModal && (
          <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="w-full max-w-2xl rounded-2xl border border-zinc-800 bg-[#0d0d0d] p-8 text-left space-y-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
              
              {/* 🎯 HEADER ACTION TOOL BAR WITH ARCHIVE EMBEDDED */}
              <div className="flex items-center justify-between border-b border-zinc-900 pb-4">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2 text-emerald-400 font-mono text-xs font-bold uppercase tracking-widest"><CheckmarkRegular /><span>Asset Compilation Toolkit</span></div>
                  <h2 className="text-xl font-bold text-white tracking-wide">{finalizedKitModal.aiMetadata?.optimizedTitle || finalizedKitModal.title}</h2>
                </div>
                <div className="flex items-center space-x-3 pt-2">
                  <button 
                    onClick={() => handleArchiveTask(finalizedKitModal._id)}
                    className="bg-emerald-500 border border-emerald-400 text-black font-mono font-bold text-[10px] px-3 py-1.5 rounded-lg uppercase tracking-wider hover:bg-emerald-400 transition-all active:scale-95 shadow-md"
                    title="Move this staged blueprint permanently to asset catalog history vaults"
                  >
                    Archive Kit
                  </button>
                  <button onClick={() => { setFinalizedKitModal(null); fetchStudioData(); }} className="text-zinc-500 hover:text-white p-1 rounded-lg border border-zinc-900 bg-zinc-950/40"><DismissRegular className="text-lg" /></button>
                </div>
              </div>

              {/* 🚀 CHATGPT DALL-E 3 MASTER GENERATION PROMPT PANEL */}
              <div className="p-5 rounded-xl border border-dashed border-purple-500/30 bg-purple-500/5 space-y-3 relative">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[9px] font-extrabold text-purple-400 uppercase tracking-widest bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 rounded">
                    ChatGPT DALL-E 3 Engine Node Prompt
                  </span>
                  <button 
                    onClick={() => copyTextToClipboard(finalizedKitModal.aiMetadata?.dallePrompt)} 
                    className="text-[10px] font-mono bg-purple-500 border border-purple-400 text-black px-3 py-1.5 rounded-lg font-bold hover:bg-purple-400 transition-all active:scale-95 shadow-lg"
                  >
                    {copyFeedback ? '📋 Prompt Copied!' : '📥 Copy Thumbnail Prompt'}
                  </button>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed font-mono bg-zinc-950 p-4 rounded-lg border border-zinc-900 select-all max-h-[120px] overflow-y-auto">
                  {finalizedKitModal.aiMetadata?.dallePrompt || "No prompt parameters staged into cluster record storage blocks."}
                </p>
              </div>

              {/* Dynamic Information Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                <div className="p-4 rounded-xl bg-[#131313] border border-zinc-900 space-y-2">
                  <div className="text-zinc-500 font-bold uppercase tracking-wider flex items-center space-x-1.5"><TagRegular /><span>Optimized Tags</span></div>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {finalizedKitModal.aiMetadata?.tags?.map((tag, i) => <span key={i} className="bg-zinc-900 text-zinc-400 px-2 py-0.5 rounded border border-zinc-800/60">{tag}</span>) || <span className="text-zinc-600">No tags configured</span>}
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-[#131313] border border-zinc-900 space-y-2">
                  <div className="text-zinc-500 font-bold uppercase tracking-wider flex items-center space-x-1.5"><CalendarClockRegular /><span>Publish Parameters</span></div>
                  <p className="text-zinc-400 pt-1"><span className="text-zinc-600">Ideal upload window:</span> 6:00 PM - 9:00 PM IST</p>
                  <p className="text-zinc-400"><span className="text-zinc-600">Target loop structure:</span> Retention Booster Strategy</p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="font-mono text-[10px] uppercase font-bold text-zinc-500 tracking-widest flex items-center space-x-1.5"><DocumentCopyRegular /><span>Video Description Metadata</span></div>
                  <button 
                    onClick={() => copyTextToClipboard(finalizedKitModal.aiMetadata?.description)} 
                    className="text-[10px] font-mono border border-zinc-800 bg-zinc-900/60 hover:bg-zinc-800 text-zinc-400 hover:text-white px-2.5 py-1 rounded-md transition-all"
                  >
                    {copyFeedback ? '📋 Copied Layout!' : '📥 Copy Block'}
                  </button>
                </div>
                <textarea readOnly value={finalizedKitModal.aiMetadata?.description || 'No description block compiled.'} className="w-full h-32 rounded-xl border border-zinc-900 bg-zinc-950 p-4 text-xs text-zinc-400 focus:outline-none font-sans leading-relaxed resize-none" />
              </div>
            </div>
          </div>
        )}

        {/* VAULT SLIDING RIGHT DRAWER (HISTORY) */}
        <div className={`fixed top-0 right-0 h-screen w-full max-w-md bg-[#0d0d0d] border-l border-zinc-900 shadow-2xl z-50 p-8 transform transition-transform duration-500 ease-in-out overflow-y-auto ${isHistoryOpen ? 'translate-x-0' : 'translate-x-full'}`}>
          <div className="flex items-center justify-between border-b border-zinc-900 pb-4 mb-6">
            <div className="flex items-center space-x-2"><FolderOpenRegular className="text-zinc-500 text-lg" /><h3 className="text-sm font-bold font-mono text-white uppercase tracking-wider">Asset Catalog</h3></div>
            <button onClick={() => setIsHistoryOpen(false)} className="text-zinc-500 hover:text-white"><DismissRegular className="text-xl" /></button>
          </div>
          <div className="space-y-4">
            {history.length === 0 ? (
              <div className="p-10 text-center font-mono text-xs text-zinc-700">Vault history is empty.</div>
            ) : (
              history.map(item => (
                <div 
                  key={item._id} 
                  onClick={() => { setFinalizedKitModal(item); setIsHistoryOpen(false); }}
                  className="group rounded-xl border border-zinc-900 bg-zinc-950/40 p-4 text-left space-y-2 hover:border-zinc-700 transition-all cursor-pointer shadow-md"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[8px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded tracking-wider uppercase font-bold">Archived Catalog</span>
                    <span className="font-mono text-[9px] text-zinc-600">View Blueprint</span>
                  </div>
                  <h4 className="text-xs font-semibold text-zinc-300 line-clamp-1 group-hover:text-white transition-colors">{item.aiMetadata?.optimizedTitle || item.title}</h4>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    )
  );
}
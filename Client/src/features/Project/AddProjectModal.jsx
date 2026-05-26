// client/src/features/Project/AddProjectModal.jsx
import React, { useState } from 'react';
import API from '../../services/api';
import { DismissRegular, AddRegular, SparkleRegular } from '@fluentui/react-icons';

export default function AddProjectModal({ isOpen, onClose, onProjectCreated }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [baseTech, setBaseTech] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !description) return;
    setIsGenerating(true);

    try {
      const minimumDelayPromise = new Promise(resolve => setTimeout(resolve, 2500));
      const [response] = await Promise.all([
        API.post('/projects/add', { title, description, baseTech }),
        minimumDelayPromise
      ]);

      if (response.data.success) {
        onProjectCreated(response.data.data);
        setTitle(''); setDescription(''); setBaseTech('');
        onClose();
      }
    } catch (err) {
      console.error("AI Generation pipeline fumbled:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div onClick={onClose} className="absolute inset-0 bg-black/70 backdrop-blur-md" />

      {isGenerating ? (
        <div className="relative z-10 flex flex-col items-center justify-center text-center space-y-4">
          {/* 🎬 YOUR HIGH-RES 4K VIDEO ANIMATION LOADER RENDERS SAFELY HERE */}
          <div className="h-20 w-20 rounded-full border-2 border-t-white border-zinc-800 animate-spin flex items-center justify-center bg-[#131313]">
            <SparkleRegular className="text-2xl text-emerald-400 animate-pulse" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-white tracking-widest font-mono uppercase">AI MASALA ENGINE ACTIVE</h3>
            <p className="text-[10px] text-gray-500 font-mono max-w-xs leading-relaxed">
              n8n automation is compiling architecture matrices and hydrating your Atlas cluster document...
            </p>
          </div>
        </div>
      ) : (
        <div className="relative z-10 w-full max-w-md rounded-2xl border border-zinc-900 bg-[#131313] p-6 shadow-2xl font-mono text-xs text-left">
          <div className="flex items-center justify-between border-b border-zinc-900 pb-3 mb-4">
            <div className="flex items-center space-x-2 text-white">
              <SparkleRegular className="text-lg text-emerald-400" />
              <h2 className="text-xs font-bold tracking-wider uppercase">Initialize AI Blueprint</h2>
            </div>
            <button onClick={onClose} className="text-gray-500 hover:text-white p-1 rounded-lg">
              <DismissRegular className="text-lg" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex flex-col space-y-1.5">
              <label className="text-gray-500 uppercase tracking-widest text-[9px] font-bold">Project Label</label>
              <input
                type="text" required placeholder="e.g., Full-Stack Instagram Clone" value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-[#0a0a0a] border border-zinc-900 rounded-xl p-3 text-white focus:border-zinc-700 focus:outline-none"
              />
            </div>

            <div className="flex flex-col space-y-1.5">
              <label className="text-gray-500 uppercase tracking-widest text-[9px] font-bold">Architecture Brief Summary</label>
              <textarea
                required rows="3" placeholder="Describe components (e.g., secure auth module, real-time messaging using websockets, and scalable redis caching layers)." value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-[#0a0a0a] border border-zinc-900 rounded-xl p-3 text-white focus:border-zinc-700 focus:outline-none font-sans"
              />
            </div>

            <div className="flex flex-col space-y-1.5">
              <label className="text-gray-500 uppercase tracking-widest text-[9px] font-bold">Target Stack Tags</label>
              <input
                type="text" placeholder="React, Node.js, Redis, Socket.io" value={baseTech}
                onChange={(e) => setBaseTech(e.target.value)}
                className="w-full bg-[#0a0a0a] border border-zinc-900 rounded-xl p-3 text-white focus:border-zinc-700 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-white text-black font-bold tracking-widest py-3 rounded-xl uppercase hover:bg-gray-200 transition-all text-[10px] flex items-center justify-center space-x-1.5 pt-2.5"
            >
              <AddRegular className="text-sm font-black" />
              <span>Generate Dev Canvas</span>
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API from '../../services/api';

const AddSection = () => {
    // Structural layout UI states
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formLoading, setFormLoading] = useState(false);
    const [status, setStatus] = useState({ type: '', message: '' });

    // Data inputs
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');

    // State arrays mapped exactly to your Project component logic
    const [tasks, setTasks] = useState([]);
    const [selectedTask, setSelectedTask] = useState(null);

    // 📡 Balanced Fetching Routine matching your exact architectural pattern
    const fetchTasks = async (isBackgroundSync = false) => {
        if (!isBackgroundSync) setLoading(true);
        try {
            // Setting a minimum loading delay to keep the transition smooth
            const minimumDelayPromise = new Promise(resolve => setTimeout(resolve, 1000));
            const [response] = await Promise.all([
                API.get('/task/allTask'), // Targets your custom endpoint: router.get('/allTask', getAllTasks)
                minimumDelayPromise
            ]);

            if (response.data.success) {
                const allTasks = response.data.data || [];
                setTasks(allTasks);

                if (allTasks.length > 0) {
                    // 1. Maintain active selection context across refreshes
                    const currentlySelectedId = selectedTask?._id;
                    const updatedTask = allTasks.find(t => t._id === currentlySelectedId) || allTasks[0];
                    setSelectedTask(updatedTask);
                } else {
                    setSelectedTask(null);
                    setIsSidebarOpen(false);
                }
            }
        } catch (err) {
            console.error("Error connecting to data node streams:", err);
        } finally {
            if (!isBackgroundSync) setLoading(false);
        }
    };

    const handleToggleStep = async (taskId, stepId) => {
    try {
        // Optimistically flip state on frontend immediately for a lightning-fast feel
        setTasks(prevTasks => prevTasks.map(task => {
            if (task._id === taskId) {
                const updatedSteps = task.steps.map(step => 
                    step._id === stepId ? { ...step, isCompleted: !step.isCompleted } : step
                );
                const allDone = updatedSteps.every(s => s.isCompleted);
                const updatedTask = { ...task, steps: updatedSteps, status: allDone ? 'completed' : 'in-progress' };
                
                // Update the open sidebar card reference data live too!
                if (selectedTask?._id === taskId) {
                    setSelectedTask(updatedTask);
                }
                return updatedTask;
            }
            return task;
        }));

        // Fire network update to persist the checkbox state to MongoDB Atlas
        await API.patch('/task/toggle-step', { taskId, stepId });
        
        // Background sync to ensure data is 100% in alignment with server values
        fetchTasks(true);

    } catch (error) {
        console.error("Failed to toggle checkpoint checkbox item:", error);
        // Fallback: reload state from server if network fails to prevent ghost states
        fetchTasks(true);
    }
};

    // Initial load tracking trigger
    useEffect(() => {
        fetchTasks();
    }, []);

    // Form pipeline submission handler
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!title.trim()) {
            setStatus({ type: 'error', message: '⚠️ Objective title is required.' });
            return;
        }

        setFormLoading(true);
        setStatus({ type: '', message: '' });

        try {
            const response = await API.post('/task/input', {
                title: title.trim(),
                description: description.trim()
            });

            if (response.data.success) {
                setStatus({ type: 'success', message: '🚀 Telemetry synchronized! Compiling AI task lines...' });
                setTitle('');
                setDescription('');
                
                // Allow user to see success alert, then hide modal and refresh background arrays
                setTimeout(() => {
                    setIsModalOpen(false);
                    setStatus({ type: '', message: '' });
                    fetchTasks(true); // Background refresh
                }, 2000);
            }
        } catch (error) {
            console.error(error);
            setStatus({ type: 'error', message: '❌ Automation routing network handshake failed.' });
        } finally {
            setFormLoading(false);
        }
    };

    // Filter rules for tasks arrays
    const activeTasks = tasks.filter(t => t.status !== 'completed');
    const completedHistory = tasks.filter(t => t.status === 'completed');

    return (
        <div className="w-full h-screen bg-[#0a0a0a] text-zinc-100 p-4 md:p-6 antialiased font-sans flex relative min-h-[calc(100vh-4rem)] overflow-hidden">
            
            {/* 📊 LEFT/CENTER COMPONENT PANEL: MAIN CONTENT VIEW */}
            <div className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'lg:mr-[400px]' : 'mr-0'}`}>
                
                {/* HEAD UNIT BAR */}
                <div className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-850 pb-6 mb-8">
                    <div>
                        <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                            <span>🛰️</span> LifeOS Central Command Matrix
                        </h2>
                        <p className="text-zinc-500 text-xs mt-1">
                            Deploy AI roadmap layers, audit execution states, and track technical milestones.
                        </p>
                    </div>
                    
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="bg-white text-black hover:bg-zinc-200 font-bold px-4 py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 transition active:scale-[0.98] shadow-md whitespace-nowrap self-start sm:self-center"
                    >
                        <span className="text-sm">+</span> Initialize New AI Task
                    </button>
                </div>

                {loading ? (
                    /* SKELETON LOADER SCREEN MATCHING DESIGN PATTERNS */
                    <div className="w-full flex flex-col items-center justify-center py-32 gap-3 text-zinc-500 text-xs font-mono">
                        <div className="h-5 w-5 border-2 border-zinc-800 border-t-violet-500 rounded-full animate-spin" />
                        <span>Synchronizing active database metrics...</span>
                    </div>
                ) : (
                    /* CORE WORKSPACE PANELS */
                    <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-8">
                        
                        {/* COL 1 & 2: ACTIVE TARGET CARD CONTAINER */}
                        <div className="md:col-span-2 space-y-4">
                            <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400 flex items-center gap-2 mb-2">
                                <span className="h-1.5 w-1.5 rounded-full bg-violet-400 animate-pulse" />
                                Active Tracks ({activeTasks.length})
                            </h3>

                            {activeTasks.length === 0 ? (
                                <div className="text-center py-16 border border-dashed border-zinc-850 rounded-2xl text-zinc-600 text-xs font-mono bg-zinc-900/10">
                                    No active tracking logs. Initialize a blueprint to generate items.
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {activeTasks.map((task) => (
                                        <div 
                                            key={task._id} 
                                            onClick={() => { setSelectedTask(task); setIsSidebarOpen(true); }}
                                            className={`border rounded-xl p-5 cursor-pointer transition flex flex-col justify-between relative group overflow-hidden ${
                                                selectedTask?._id === task._id 
                                                    ? 'bg-zinc-900/90 border-violet-500/50 shadow-lg shadow-violet-500/5' 
                                                    : 'bg-zinc-900/40 border-zinc-850 hover:border-zinc-700'
                                            }`}
                                        >
                                            <div>
                                                <div className="flex items-center justify-between gap-2 mb-2">
                                                    <h4 className="font-semibold text-sm text-white truncate group-hover:text-violet-400 transition">
                                                        {task.title}
                                                    </h4>
                                                    <span className="text-[9px] font-mono px-1.5 py-0.5 bg-zinc-950 border border-zinc-800 text-zinc-400 rounded">
                                                        {task.status || 'pending'}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">{task.description}</p>
                                            </div>
                                            <div className="text-[10px] font-mono text-zinc-500 mt-4 flex items-center gap-1">
                                                <span>📋 Steps generated:</span> 
                                                <span className="text-zinc-300 font-bold">{task.steps?.length || 0}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* COL 3: ARCHIVED TIMELINE TRACKER */}
                        <div className="space-y-4 border-t md:border-t-0 md:border-l border-zinc-850 pt-6 md:pt-0 md:pl-6">
                            <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400 flex items-center gap-2 mb-2">
                                <span>⏳</span> Operational History ({completedHistory.length})
                            </h3>

                            {completedHistory.length === 0 ? (
                                <div className="text-center py-12 border border-dashed border-zinc-850 rounded-2xl text-zinc-600 text-xs font-mono">
                                    No completed logs in current cluster database frames.
                                </div>
                            ) : (
                                <div className="space-y-3 max-h-[65vh] overflow-y-auto pr-1">
                                    {completedHistory.map((task) => (
                                        <div 
                                            key={task._id}
                                            onClick={() => { setSelectedTask(task); setIsSidebarOpen(true); }}
                                            className={`border rounded-xl p-4 cursor-pointer transition opacity-60 hover:opacity-100 ${
                                                selectedTask?._id === task._id ? 'bg-zinc-900 border-zinc-700' : 'bg-zinc-900/20 border-zinc-850/60'
                                            }`}
                                        >
                                            <div className="flex items-center justify-between gap-2 mb-1">
                                                <h4 className="text-xs font-medium text-zinc-400 truncate max-w-[140px] line-through">{task.title}</h4>
                                                <span className="text-[8px] font-mono px-1.5 py-0.2 bg-emerald-950/20 border border-emerald-900/30 rounded text-emerald-400">Archived</span>
                                            </div>
                                            <p className="text-[11px] text-zinc-600 truncate">{task.description}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* 📑 RIGHT SIDE PANEL: SLIDE-OUT STEP DECK PANEL VIEW */}
            <div className={`fixed top-0 right-0 bottom-0 w-full sm:w-[380px] bg-zinc-900 border-l border-zinc-800 z-40 p-6 shadow-2xl flex flex-col justify-between transform transition-transform duration-300 ease-in-out ${
                isSidebarOpen && selectedTask ? 'translate-x-0' : 'translate-x-full'
            }`}>
                <div className="absolute top-0 left-0 bottom-0 w-[1px] bg-gradient-to-b from-purple-500/20 via-transparent to-transparent" />
                
                <div className="overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                    {/* Sidebar Header Panel */}
                    <div className="flex items-start justify-between gap-4 border-b border-zinc-850 pb-4 mb-6 mt-12 sm:mt-4">
                        <div>
                            <span className="text-[9px] font-mono uppercase text-purple-400 bg-purple-950/40 border border-purple-900 px-2 py-0.5 rounded">
                                Deck Terminal
                            </span>
                            <h3 className="text-base font-semibold text-white mt-2 tracking-tight">
                                {selectedTask?.title}
                            </h3>
                        </div>
                        <button 
                            onClick={() => setIsSidebarOpen(false)}
                            className="text-zinc-500 hover:text-white transition p-1.5 hover:bg-zinc-800 rounded-lg font-mono text-xs"
                        >
                            ✕
                        </button>
                    </div>

                    <p className="text-zinc-400 text-xs leading-relaxed mb-6 bg-zinc-950/40 p-3 rounded-lg border border-zinc-850/60">
                        {selectedTask?.description || "No parameters provided for this task matrix shell."}
                    </p>

                    {/* Checkbox Execution System Loop */}
                    <div className="space-y-3">
                        <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">
                            Action Checklists
                        </h4>
                        {selectedTask?.steps && selectedTask.steps.length > 0 ? (
                            <div className="space-y-2">
                                {selectedTask.steps.map((step, idx) => (
                                    <div 
                                        key={step._id || idx} 
                                        className="w-full flex items-center gap-3 p-3 bg-zinc-950/60 border hover:border-zinc-300 border-zinc-800 rounded-2xl transition"
                                    >
                                        <input 
    type="checkbox"
    checked={step.isCompleted}
    onChange={() => handleToggleStep(selectedTask._id, step._id)} // 🔥 Fires the database sync loop on click!
    className="h-4 w-4 rounded bg-zinc-900 border-zinc-800 text-violet-600 focus:ring-0 focus:ring-offset-0 transition cursor-pointer"
/>
                                        <span 
    onClick={() => handleToggleStep(selectedTask._id, step._id)}
    className={`text-xs font-medium font-mono cursor-pointer select-none ${step.isCompleted ? 'text-zinc-600 line-through' : 'text-zinc-300'}`}
>
    {step.text}
</span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-xs text-zinc-600 font-mono italic py-4">
                                Orchestrating target array arrays in background...
                            </div>
                        )}
                    </div>
                </div>

                <div className="border-t border-zinc-850 pt-4 text-[10px] font-mono text-zinc-500 flex justify-between">
                    <span>ID: {selectedTask?._id?.substring(0, 8)}...</span>
                    <span>Status: {selectedTask?.status}</span>
                </div>
            </div>

            {/* 🚨 THE MODAL POPUP BACKDROP OVERLAY OVERLAY */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
                    <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-150">
                        <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-violet-600 via-fuchsia-500 to-cyan-400" />

                        <button 
                            onClick={() => { setIsModalOpen(false); setStatus({type:'', message:''}); }}
                            className="absolute top-4 right-4 text-zinc-500 hover:text-white transition font-mono text-xs p-1 hover:bg-zinc-850 rounded"
                        >
                            ✕
                        </button>

                        <div className="mb-5 pr-6">
                            <h3 className="text-base font-semibold text-white tracking-tight flex items-center gap-2">
                                🧠 Construct AI Action Matrix
                            </h3>
                            <p className="text-zinc-400 text-xs mt-1 leading-relaxed">
                                Enter your target curriculum or engineering roadmap goals. This request triggers n8n to command Gemini to scaffold sequential checklists.
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1.5">Objective Title</label>
                                <input 
                                    type="text"
                                    className="w-full px-3 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-white text-sm placeholder-zinc-600 focus:outline-none focus:border-violet-500 transition font-medium"
                                    placeholder="e.g., GTU Mathematics 2 Matrices"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    disabled={formLoading}
                                />
                            </div>

                            <div>
                                <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1.5">Specifications</label>
                                <textarea 
                                    rows="3"
                                    className="w-full px-3 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-white text-sm placeholder-zinc-600 focus:outline-none focus:border-violet-500 transition resize-none font-medium"
                                    placeholder="List exact chapters, arrays, or proofs to compile..."
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    disabled={formLoading}
                                />
                            </div>

                            <div className="flex items-center gap-3 justify-end pt-2">
                                <button
                                    type="button"
                                    onClick={() => { setIsModalOpen(false); setStatus({type:'', message:''}); }}
                                    className="px-3 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white transition"
                                    disabled={formLoading}
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit"
                                    className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                                        formLoading ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed' : 'bg-white text-black hover:bg-zinc-200'
                                    }`}
                                    disabled={formLoading}
                                >
                                    {formLoading ? (
                                        <>
                                            <div className="h-3 w-3 border-2 border-zinc-500 border-t-zinc-300 rounded-full animate-spin" />
                                            <span>Compiling...</span>
                                        </>
                                    ) : "Compile Strategy"}
                                </button>
                            </div>
                        </form>

                        {status.message && (
                            <div className={`mt-4 p-3 rounded-xl border text-xs font-mono ${
                                status.type === 'success' ? 'bg-zinc-950 border-emerald-900/50 text-emerald-400' : 'bg-zinc-950 border-rose-950 text-rose-400'
                            }`}>
                                <div className="flex items-center gap-2">
                                    <span className={`h-1 w-1 rounded-full ${status.type === 'success' ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`} />
                                    <span>{status.message}</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default AddSection;

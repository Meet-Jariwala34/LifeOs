import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import { 
  FlashRegular, FoodAppleRegular, ArrowClockwiseRegular,
  CheckmarkCircleRegular, AlertRegular, TrophyRegular,
  DumbbellRegular
} from '@fluentui/react-icons';

export default function BodySection() {
    const targetSplitMapping = {
        0: { name: "Rest Cycle", routines: [] },
        1: { name: "Pull Day Matrix", routines: ["Assisted Pull-ups", "Lat pulldown Wide", "Seated cable rows", "Dumbbell bicep curl", "Hammer curl"] },
        2: { name: "Leg Day Matrix", routines: ["Barbell squats", "Romanian Deadlifts", "Leg press", "Standing Calf Raises"] },
        3: { name: "Push Day Matrix", routines: ["Incline Dumbbell Press", "Overhead Barbell/Dumbbell Press", "Weighted / Deficit pushup", "Cable Lateral Raises", "Tricep overhead extension"] },
        4: { name: "Pull Day Matrix", routines: ["Assisted Pull-ups", "Lat pulldown Wide", "Seated cable rows", "Dumbbell bicep curl", "Hammer curl"] },
        5: { name: "Leg Day Matrix", routines: ["Barbell squats", "Romanian Deadlifts", "Leg press", "Standing Calf Raises"] },
        6: { name: "Push Day Matrix", routines: ["Incline Dumbbell Press", "Overhead Barbell/Dumbbell Press", "Weighted / Deficit pushup", "Cable Lateral Raises", "Tricep overhead extension"] }
    };

    const currentDayIndex = new Date().getDay();
    const todaySplit = targetSplitMapping[currentDayIndex];

    // Lifts inputs
    const [selectedExercise, setSelectedExercise] = useState(todaySplit.routines[0] || '');
    const [customExercise, setCustomExercise] = useState('');
    const [reps, setReps] = useState('');
    const [weight, setWeight] = useState('');

    // 🟩 Direct Healthify Inputs States
    const [inputCalories, setInputCalories] = useState('');
    const [inputProtein, setInputProtein] = useState('');

    // Telemetry Sync State
    const [todayLog, setTodayLog] = useState({ exercises: [], totalCaloriesIntake: 0, totalProteinIntake: 0 });
    const [loading, setLoading] = useState(true);
    const [formLoading, setFormLoading] = useState(false);
    const [status, setStatus] = useState({ type: '', message: '' });

    const fetchTodayStats = async () => {
        try {
            const res = await API.get('/body/today');
            if (res.data.success) {
                setTodayLog(res.data.data);
                // Pre-populate input box fields with current DB status for clean monitoring
                setInputCalories(res.data.data.totalCaloriesIntake || '');
                setInputProtein(res.data.data.totalProteinIntake || '');
            }
        } catch (err) {
            console.error("Failed syncing body logs node:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTodayStats();
    }, []);

    const handleWorkoutSubmit = async (e) => {
        e.preventDefault();
        const activeExerciseName = customExercise.trim() || selectedExercise;
        if (!activeExerciseName || !reps || !weight) {
            setStatus({ type: 'error', message: '⚠️ Input all active set parameters.' });
            return;
        }

        setFormLoading(true);
        try {
            const res = await API.post('/body/workout', {
                exerciseName: activeExerciseName,
                sets: [{ reps: Number(reps), weight: Number(weight) }]
            });
            if (res.data.success) {
                setStatus({ type: 'success', message: '💪 Set metrics successfully committed down line!' });
                setReps('');
                setWeight('');
                setCustomExercise('');
                setTodayLog(res.data.data);
            }
        } catch (err) {
            setStatus({ type: 'error', message: '❌ Telemetry write dropped.' });
        } finally {
            setFormLoading(false);
        }
    };

    // 🟩 Handle Direct Manual Healthify Submit
    const handleMacroSubmit = async (e) => {
        e.preventDefault();
        if (!inputCalories && !inputProtein) {
            setStatus({ type: 'error', message: '⚠️ Enter at least one macro metric input.' });
            return;
        }

        setFormLoading(true);
        try {
            const res = await API.post('/body/macros', {
                calories: inputCalories ? Number(inputCalories) : todayLog.totalCaloriesIntake,
                protein: inputProtein ? Number(inputProtein) : todayLog.totalProteinIntake
            });
            if (res.data.success) {
                setStatus({ type: 'success', message: '🎯 Healthify tracking data synchronized to cloud database!' });
                setTodayLog(res.data.data);
            }
        } catch (err) {
            setStatus({ type: 'error', message: '❌ Failed to push tracking values to database.' });
        } finally {
            setFormLoading(false);
        }
    };

    return (
        loading ? (
            <div className="flex flex-col items-center justify-center space-y-3 w-full bg-[#050505] h-screen font-mono text-zinc-600">
                <div className="h-6 w-6 border border-zinc-800 border-t-zinc-400 rounded-full animate-spin" />
                <span className="tracking-widest text-[11px]">SYNCING PHYSICAL METRICS ENGINE...</span>
            </div>
        ) : (
            <div className="flex-1 h-screen overflow-y-auto bg-[#070708] text-zinc-100 p-6 md:p-10 space-y-8 animate-fade-in font-sans selection:bg-purple-500/30">
                
                {/* HEADER ZONE */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-900 pb-6">
                    <div>
                        <h1 className="text-xl font-bold text-white uppercase tracking-tight font-mono flex items-center gap-2">
                            <TrophyRegular className="text-xl text-amber-400" />
                            <span>Physical Optimization Matrix</span>
                        </h1>
                        <p className="text-xs text-zinc-500 font-mono mt-1">
                            Current Split Target: <span className="text-purple-400 font-semibold uppercase tracking-wider">{todaySplit.name}</span>
                        </p>
                    </div>
                    <button 
                        onClick={fetchTodayStats} 
                        className="p-2.5 rounded-xl border border-zinc-850 bg-zinc-900/20 text-zinc-400 hover:text-white hover:bg-zinc-900/60 transition active:scale-95 flex items-center justify-center shadow-lg"
                    >
                        <ArrowClockwiseRegular className="text-base" />
                    </button>
                </div>

                {/* TELEMETRY TILES DASHBOARD CONTAINER */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                    <div className="rounded-2xl border border-zinc-900/80 bg-gradient-to-br from-[#121214] to-[#0e0e10] p-6 shadow-xl relative overflow-hidden">
                        <p className="text-[10px] font-bold font-mono uppercase text-zinc-500 tracking-widest">Energy Accumulation</p>
                        <p className="text-3xl font-bold font-mono text-emerald-400 mt-2 tracking-tight">
                            {todayLog.totalCaloriesIntake} <span className="text-xs font-sans font-medium text-zinc-500">kcal</span>
                        </p>
                    </div>
                    <div className="rounded-2xl border border-zinc-900/80 bg-gradient-to-br from-[#121214] to-[#0e0e10] p-6 shadow-xl relative overflow-hidden">
                        <p className="text-[10px] font-bold font-mono uppercase text-zinc-500 tracking-widest">Protein Yield</p>
                        <p className="text-3xl font-bold font-mono text-amber-400 mt-2 tracking-tight">
                            {todayLog.totalProteinIntake}<span className="text-xs font-sans font-medium text-zinc-500">g</span>
                        </p>
                    </div>
                    <div className="rounded-2xl border border-zinc-900/80 bg-gradient-to-br from-[#121214] to-[#0e0e10] p-6 shadow-xl relative overflow-hidden">
                        <p className="text-[10px] font-bold font-mono uppercase text-zinc-500 tracking-widest">Completed Lifts</p>
                        <p className="text-3xl font-bold font-mono text-purple-400 mt-2 tracking-tight">
                            {todayLog.exercises?.length || 0} <span className="text-xs font-sans font-medium text-zinc-500">tracks</span>
                        </p>
                    </div>
                </div>

                {/* BANNER SYSTEM ALERTS */}
                {status.message && (
                    <div className={`p-4 rounded-xl border text-xs font-mono flex items-center gap-3 max-w-3xl backdrop-blur-md shadow-lg ${
                        status.type === 'success' ? 'bg-emerald-950/20 border-emerald-900/40 text-emerald-400' : 'bg-rose-950/20 border-rose-900/40 text-rose-400'
                    }`}>
                        {status.type === 'success' ? <CheckmarkCircleRegular className="text-lg flex-shrink-0" /> : <AlertRegular className="text-lg flex-shrink-0" />}
                        <span>{status.message}</span>
                    </div>
                )}

                {/* MAIN FORMS GRID CONTROLLER */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl">
                    
                    {/* FORM CONTAINER BLOCK 1: WORKOUT SYSTEM */}
                    <div className="rounded-2xl border border-zinc-900 bg-gradient-to-b from-[#111113] to-[#0b0b0c] p-6 space-y-6 shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-purple-500/60 to-indigo-500/60" />
                        
                        <div className="flex items-center gap-2.5">
                            <div className="p-2 bg-purple-500/10 border border-purple-500/20 rounded-xl text-purple-400">
                                <DumbbellRegular className="text-lg" />
                            </div>
                            <div>
                                <h3 className="text-sm font-bold uppercase font-mono tracking-wider text-zinc-200">Strength Core Engine</h3>
                                <p className="text-[10px] text-zinc-500 font-mono">Record execution parameters to local matrices</p>
                            </div>
                        </div>

                        <form onSubmit={handleWorkoutSubmit} className="space-y-4 pt-1">
                            {todaySplit.routines.length > 0 && (
                                <div className="space-y-1.5">
                                    <label className="block text-zinc-400 uppercase text-[10px] font-bold tracking-widest font-mono">Select Routine Item</label>
                                    <div className="relative">
                                        <select 
                                            className="w-full px-3.5 py-3 bg-[#161619] border border-zinc-850 text-sm text-zinc-200 rounded-xl focus:outline-none focus:border-purple-500 transition appearance-none cursor-pointer font-sans font-medium"
                                            value={selectedExercise}
                                            onChange={(e) => { setSelectedExercise(e.target.value); setCustomExercise(''); }}
                                        >
                                            {todaySplit.routines.map((item, i) => (
                                                <option key={i} value={item} className="bg-[#161619] text-zinc-200">{item}</option>
                                            ))}
                                        </select>
                                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-zinc-500 text-xs">▼</div>
                                    </div>
                                </div>
                            )}

                            <div className="space-y-1.5">
                                <label className="block text-zinc-400 uppercase text-[10px] font-bold tracking-widest font-mono">Custom Target Input</label>
                                <input 
                                    type="text"
                                    placeholder="Or type alternative custom exercise label..."
                                    className="w-full px-3.5 py-3 bg-[#161619] border border-zinc-850 placeholder-zinc-600 rounded-xl text-sm text-white focus:outline-none focus:border-purple-500 transition font-sans font-medium"
                                    value={customExercise}
                                    onChange={(e) => setCustomExercise(e.target.value)}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="block text-zinc-400 uppercase text-[10px] font-bold tracking-widest font-mono">Rep Volume</label>
                                    <input 
                                        type="number" 
                                        placeholder="e.g., 10"
                                        className="w-full px-3.5 py-3 bg-[#161619] border border-zinc-850 rounded-xl text-sm text-white focus:outline-none focus:border-purple-500 transition font-mono font-semibold"
                                        value={reps} 
                                        onChange={(e) => setReps(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="block text-zinc-400 uppercase text-[10px] font-bold tracking-widest font-mono">Weight Load (kg)</label>
                                    <input 
                                        type="number" 
                                        placeholder="e.g., 40"
                                        className="w-full px-3.5 py-3 bg-[#161619] border border-zinc-850 rounded-xl text-sm text-white focus:outline-none focus:border-purple-500 transition font-mono font-semibold"
                                        value={weight} 
                                        onChange={(e) => setWeight(e.target.value)}
                                    />
                                </div>
                            </div>

                            <button type="submit" disabled={formLoading} className="w-full py-3 bg-white hover:bg-zinc-200 text-black font-sans font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg disabled:opacity-50">
                                Commit Set Telemetry
                            </button>
                        </form>
                    </div>

                    {/* 🟩 FORM CONTAINER BLOCK 2: HEALTHIFY MANUAL METRICS SYNC */}
                    <div className="rounded-2xl border border-zinc-900 bg-gradient-to-b from-[#111113] to-[#0b0b0c] p-6 space-y-6 shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-emerald-500/60 to-teal-500/60" />
                        
                        <div className="flex items-center gap-2.5">
                            <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400">
                                <FoodAppleRegular className="text-lg" />
                            </div>
                            <div>
                                <h3 className="text-sm font-bold uppercase font-mono tracking-wider text-zinc-200">Healthify App Sync</h3>
                                <p className="text-[10px] text-zinc-500 font-mono">Input consolidated daily totals from your phone</p>
                            </div>
                        </div>

                        <form onSubmit={handleMacroSubmit} className="space-y-4 pt-1 font-mono text-xs">
                            <div className="space-y-1.5">
                                <label className="block text-zinc-400 uppercase text-[10px] font-bold tracking-widest">Total Caloric Volume Today (kcal)</label>
                                <input 
                                    type="number" 
                                    placeholder="Copy total kcal from healthify app dashboard..."
                                    className="w-full px-3.5 py-3 bg-[#161619] border border-zinc-850 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500 transition font-sans font-medium"
                                    value={inputCalories}
                                    onChange={(e) => setInputCalories(e.target.value)}
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="block text-zinc-400 uppercase text-[10px] font-bold tracking-widest">Total Protein Intake Today (grams)</label>
                                <input 
                                    type="number" 
                                    placeholder="Copy total protein mass metrics..."
                                    className="w-full px-3.5 py-3 bg-[#161619] border border-zinc-850 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500 transition font-sans font-medium"
                                    value={inputProtein}
                                    onChange={(e) => setInputProtein(e.target.value)}
                                />
                            </div>

                            <button 
                                type="submit" 
                                disabled={formLoading} 
                                className="w-full py-3 bg-white hover:bg-zinc-200 text-black font-sans font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg mt-8 disabled:opacity-50"
                            >
                                Synchronize Macro Ledger
                            </button>
                        </form>
                    </div>

                </div>

            </div>
        )
    );
}
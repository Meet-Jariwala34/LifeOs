// client/src/features/Project/Project.jsx
import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import AddProjectModal from './AddProjectModal';
import { 
  FolderRegular, 
  CheckmarkCircleRegular, 
  CircleRegular, 
  SparkleRegular,
  ChevronRightRegular,
  PanelRightExpandRegular,
  DismissFilled 
} from '@fluentui/react-icons';

export default function Project() {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [activeModule, setActiveModule] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // client/src/features/Project/Project.jsx

const fetchProjects = async () => {
  setLoading(true);
  try {
    const minimumDelayPromise = new Promise(resolve => setTimeout(resolve, 1500));
    const [response] = await Promise.all([
      API.get('/projects/all'),
      minimumDelayPromise
    ]);
    
    if (response.data.success) {
      const allProjects = response.data.data;
      setProjects(allProjects);
      
      if (allProjects.length > 0) {
        // 1. Check if a project was already selected before the background sync run
        const currentlySelectedId = selectedProject?._id;
        
        // 2. Find that matching project in the fresh array, or default to the newest project item
        const updatedProject = allProjects.find(p => p._id === currentlySelectedId) || allProjects[0];
        
        setSelectedProject(updatedProject);
        
        // 3. Keep the sidebar slide-out execution deck view pinned open seamlessly if a module is active
        if (activeModule) {
          const updatedModule = updatedProject.modules?.find(m => m._id === activeModule._id);
          if (updatedModule) {
            setActiveModule(updatedModule);
          } else {
            setActiveModule(null);
            setIsSidebarOpen(false);
          }
        }
      } else {
        // Clear views if the data array is completely empty
        setSelectedProject(null);
        setActiveModule(null);
        setIsSidebarOpen(false);
      }
    }
  } catch (err) {
    console.error("Error connecting to data node streams:", err);
  } finally {
    setLoading(false);
  }
};

  useEffect(() => { fetchProjects(); }, []);

  const handleToggleStep = async (moduleId, stepId, currentStatus) => {
    if (!selectedProject) return;
    try {
      const response = await API.put(`/projects/${selectedProject._id}/modules/${moduleId}/steps/${stepId}`, {
        isCompleted: !currentStatus
      });
      if (response.data.success) {
        fetchProjects();
      }
    } catch (err) {
      console.error("Failed to sync structural checkbox:", err);
    }
  };

  return (
    <div className="flex-1 h-screen overflow-y-auto bg-[#0a0a0a] text-zinc-100 p-10 space-y-8 font-sans relative">
      <div className="flex items-center justify-between">
        <div className="text-left">
          <h1 className="text-xl font-bold tracking-tight text-white uppercase font-mono">Project Lab</h1>
          <p className="text-[10px] text-gray-500 mt-0.5 font-mono uppercase tracking-wider">Multi-Tier Automated Blueprint Matrix</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="rounded-xl bg-white px-4 py-2 text-xs font-bold text-black hover:bg-gray-200 transition-all flex items-center space-x-1.5 font-mono uppercase tracking-wider"
        >
          <SparkleRegular className="text-sm" />
          <span>Architect Build</span>
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center space-y-3 h-[50vh]">
          <div className="h-6 w-6 rounded-full border border-t-white border-zinc-800 animate-spin" />
          <span className="font-mono text-[9px] text-gray-500 uppercase tracking-[0.2em] animate-pulse">Syncing Lab Clusters...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="space-y-3 lg:col-span-1">
            <h3 className="font-mono text-[9px] uppercase tracking-widest text-gray-500 font-bold px-1 text-left">Active Build Modules</h3>
            {projects.map(proj => (
              <div 
                key={proj._id} onClick={() => { setSelectedProject(proj); setActiveModule(null); }}
                className={`p-4 rounded-xl border transition-all cursor-pointer text-left ${selectedProject?._id === proj._id ? 'bg-[#131313] border-zinc-700' : 'bg-[#131313]/30 border-zinc-900 hover:border-zinc-800'}`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-2.5 truncate mr-2">
                    <FolderRegular className={`text-base ${selectedProject?._id === proj._id ? 'text-white' : 'text-gray-600'}`} />
                    <h4 className="font-bold text-xs text-white tracking-wide truncate">{proj.title}</h4>
                  </div>
                  <span className="font-mono text-[10px] font-bold text-gray-400">{proj.progress}%</span>
                </div>
                <div className="h-1 w-full rounded-full bg-zinc-900 overflow-hidden">
                  <div className="h-full bg-green-400 transition-all duration-500" style={{ width: `${proj.progress}%` }} />
                </div>
              </div>
            ))}
          </div>

          <div className="lg:col-span-2 space-y-4">
            {selectedProject ? (
              <>
                <div className="border-b border-zinc-900 pb-3 px-1 text-left">
                  <h2 className="text-base font-bold text-white tracking-wide">{selectedProject.title}</h2>
                  <p className="text-xs text-gray-400 mt-1 leading-relaxed font-sans">{selectedProject.description}</p>
                  <div className="flex flex-wrap gap-1.5 pt-3">
                    {selectedProject.techStack?.map((tech, i) => (
                      <span key={i} className="font-mono text-[9px] px-2 py-0.5 bg-zinc-900 text-gray-500 rounded-md border border-zinc-800 uppercase">
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  {selectedProject.modules?.map(mod => {
                    const doneCount = mod.steps.filter(s => s.isCompleted).length;
                    const totalCount = mod.steps.length;
                    const modProgress = totalCount === 0 ? 0 : Math.round((doneCount / totalCount) * 100);

                    return (
                      <div 
                        key={mod._id} onClick={() => { setActiveModule(mod); setIsSidebarOpen(true); }}
                        className="p-4.5 rounded-xl bg-[#131313]/50 border border-zinc-900 hover:border-zinc-700 transition-all cursor-pointer flex flex-col justify-between h-36 text-left group"
                      >
                        <div className="space-y-1.5">
                          <div className="flex justify-between items-start">
                            <h4 className="font-bold text-xs text-white tracking-wide leading-snug group-hover:text-gray-300 transition-colors">{mod.title}</h4>
                            <ChevronRightRegular className="text-gray-600 text-sm group-hover:text-white transition-colors ml-2 flex-shrink-0" />
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {mod.techStack?.map((t, i) => (
                              <span key={i} className="font-mono text-[8px] px-1.5 bg-[#0a0a0a] text-gray-600 rounded border border-zinc-900 uppercase">
                                {t}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <div className="flex justify-between text-[9px] font-mono text-gray-500">
                            <span>SPRINT TASK FLOW</span>
                            <span>{doneCount}/{totalCount} STEPS</span>
                          </div>
                          <div className="h-0.5 w-full bg-zinc-900 rounded-full overflow-hidden">
                            <div className="h-full bg-green-400 transition-all duration-500" style={{ width: `${modProgress}%` }} />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              <div className="h-[350px] border border-dashed border-zinc-950 rounded-2xl flex flex-col items-center justify-center text-center p-6">
                <FolderRegular className="text-3xl text-zinc-800 mb-2" />
                <p className="font-mono text-[10px] text-gray-600 uppercase tracking-widest">Select an active compilation pipeline node to begin tracking metrics</p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeModule && (
        <>
          <div onClick={() => setIsSidebarOpen(false)} className={`fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} />
          <div className={`fixed top-0 right-0 z-50 h-screen w-full max-w-sm border-l border-zinc-900 bg-[#131313] p-5 shadow-2xl transition-transform duration-300 transform ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'}`}>
            <div className="flex items-center justify-between border-b border-zinc-900 pb-3 mb-5">
              <div className="flex items-center space-x-2 text-white text-left max-w-[240px]">
                <PanelRightExpandRegular className="text-lg text-gray-500 flex-shrink-0" />
                <div className="truncate">
                  <h3 className="text-xs font-bold tracking-wide truncate">{activeModule.title}</h3>
                  <span className="font-mono text-[8px] text-gray-600 tracking-widest uppercase">Execution Deck</span>
                </div>
              </div>
              <button onClick={() => setIsSidebarOpen(false)} className="text-[10px] font-mono text-gray-500 hover:text-white px-2 py-1 rounded bg-[#0a0a0a] border border-zinc-800 uppercase tracking-wider">
                <DismissFilled className='text-red-500'/>
              </button>
            </div>

            <div className="space-y-2.5 h-[calc(100vh-140px)] overflow-y-auto pr-0.5">
              <h4 className="font-mono text-[9px] uppercase tracking-widest text-gray-600 font-bold text-left px-0.5 mb-1">Step Configuration</h4>
              {activeModule.steps?.map((step) => (
                <div 
                  key={step._id} onClick={() => handleToggleStep(activeModule._id, step._id, step.isCompleted)}
                  className={`p-3 rounded-xl border flex items-start space-x-2.5 cursor-pointer transition-all ${step.isCompleted ? 'bg-[#0a0a0a]/40 border-zinc-950 opacity-50' : 'bg-[#0a0a0a] border-zinc-900 hover:border-zinc-800'}`}
                >
                  <div className="pt-0.5 flex-shrink-0">
                    {step.isCompleted ? <CheckmarkCircleRegular className="text-white text-base" /> : <CircleRegular className="text-gray-600 text-base hover:text-white" />}
                  </div>
                  <span className={`text-xs text-left leading-relaxed font-sans ${step.isCompleted ? 'line-through text-gray-500' : 'text-gray-300'}`}>
                    {step.text}
                  </span>
                </div>
              ))}

              {activeModule.resources?.length > 0 && (
                <div className="pt-4 space-y-2">
                  <h4 className="font-mono text-[9px] uppercase tracking-widest text-gray-600 font-bold text-left px-0.5">Reference Sandboxes</h4>
                  {activeModule.resources.map((res, i) => (
                    <a 
                      key={i} href={res.url} target="_blank" rel="noreferrer"
                      className="p-3 rounded-xl bg-zinc-950 border border-zinc-900 text-xs flex items-center justify-between text-gray-500 hover:text-white hover:border-zinc-800 transition-all font-sans"
                    >
                      <span className="font-medium truncate max-w-[220px]">{res.label}</span>
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}

      <AddProjectModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onProjectCreated={(p) => setProjects(prev => [p, ...prev])} />
    </div>
  );
}
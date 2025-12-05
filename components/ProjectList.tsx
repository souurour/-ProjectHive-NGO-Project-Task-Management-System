
import React, { useState } from 'react';
import { Project, Task, TaskStatus, TaskPriority } from '../types';
import { Link } from 'react-router-dom';
import { Plus, Search, Sparkles, Loader2, Calendar, Hexagon } from 'lucide-react';
import { generateProjectPlan } from '../services/geminiService';

interface ProjectListProps {
  projects: Project[];
  addProject: (p: Project) => void;
}

const ProjectList: React.FC<ProjectListProps> = ({ projects, addProject }) => {
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Form State
  const [title, setTitle] = useState('');
  const [goal, setGoal] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const handleGenerateAndCreate = async () => {
    if (!title || !goal || !startDate || !endDate) {
      alert("Please fill in all fields");
      return;
    }

    setLoading(true);
    try {
      const plan = await generateProjectPlan(title, goal);
      
      const newTasks: Task[] = plan?.tasks.map((t: any, index: number) => ({
        id: `t-${Date.now()}-${index}`,
        title: t.title,
        status: TaskStatus.TODO,
        priority: t.priority === 'High' ? TaskPriority.HIGH : t.priority === 'Medium' ? TaskPriority.MEDIUM : TaskPriority.LOW,
        assignee: t.assignee,
        dueDate: endDate, // Default to project end date
        createdAt: new Date().toISOString()
      })) || [];

      const newProject: Project = {
        id: `p-${Date.now()}`,
        title: title,
        description: plan?.description || goal,
        startDate,
        endDate,
        progress: 0,
        tasks: newTasks,
        documents: [],
        kpi: plan?.kpi || { beneficiaries: 0, volunteers: 0, budget: 0 }
      };

      addProject(newProject);
      setShowModal(false);
      resetForm();
    } catch (e) {
      console.error(e);
      alert("Failed to generate plan with AI. Creating basic project.");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setTitle('');
    setGoal('');
    setStartDate('');
    setEndDate('');
  };

  const filteredProjects = projects.filter(p => p.title.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
           <h2 className="text-3xl font-bold text-hive-dark font-heading">Projects</h2>
           <p className="text-gray-500 mt-1">Manage all your initiatives in one place.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-hive-brand hover:bg-blue-700 text-white px-6 py-3 rounded-full flex items-center gap-2 shadow-lg shadow-hive-brand/20 transition-all font-semibold"
        >
          <Plus size={20} strokeWidth={2.5} /> New Project
        </button>
      </div>

      <div className="relative max-w-xl">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
        <input 
          type="text" 
          placeholder="Search projects..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-hive-brand focus:border-transparent outline-none shadow-sm text-hive-dark"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.map(project => (
          <Link to={`/projects/${project.id}`} key={project.id} className="block group">
            <div className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-xl hover:shadow-gray-200/50 hover:border-hive-brand/30 transition-all h-full flex flex-col relative overflow-hidden">
               {/* Decorative background element */}
               <div className="absolute top-0 right-0 -mt-8 -mr-8 w-24 h-24 bg-blue-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>

              <div className="flex justify-between items-start mb-4 relative z-10">
                <div className="p-3 bg-gray-50 rounded-xl text-hive-dark group-hover:bg-hive-brand group-hover:text-white transition-colors">
                  <Hexagon size={24} strokeWidth={1.5} />
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  project.progress === 100 ? 'bg-hive-green/20 text-hive-green' : 'bg-gray-100 text-gray-600'
                }`}>
                  {project.progress === 100 ? 'Completed' : 'In Progress'}
                </span>
              </div>
              
              <h3 className="text-xl font-bold text-hive-dark mb-2 font-heading group-hover:text-hive-brand transition-colors">{project.title}</h3>
              <p className="text-gray-500 text-sm mb-6 line-clamp-2 flex-1 leading-relaxed">{project.description}</p>
              
              <div className="mt-auto relative z-10">
                <div className="flex justify-between text-xs text-gray-400 mb-2 font-semibold uppercase tracking-wider">
                  <span>Progress</span>
                  <span>{project.progress}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div 
                    className="bg-hive-brand h-2 rounded-full shadow-sm" 
                    style={{ width: `${project.progress}%` }}
                  ></div>
                </div>
                <div className="mt-5 flex justify-between items-center text-xs text-gray-500 font-medium">
                  <span className="flex items-center gap-1"><Calendar size={14}/> Due {new Date(project.endDate).toLocaleDateString()}</span>
                  <span>{project.tasks.length} Tasks</span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* New Project Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-hive-dark/40 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-gray-100 bg-gray-50/50">
              <h3 className="text-xl font-bold text-hive-dark flex items-center gap-2 font-heading">
                <Sparkles className="text-hive-brand" size={24} fill="#2563EB" />
                Create Smart Project
              </h3>
              <p className="text-sm text-gray-500 mt-1">AI will generate initial tasks and KPIs for you.</p>
            </div>
            
            <div className="p-8 space-y-5">
              <div>
                <label className="block text-sm font-semibold text-hive-dark mb-2">Project Title</label>
                <input 
                  type="text" 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Clean Water Initiative 2024"
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-hive-brand outline-none transition-all"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-hive-dark mb-2">Goal / Objective</label>
                <textarea 
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  placeholder="What do you want to achieve?"
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-hive-brand outline-none h-28 resize-none transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                   <label className="block text-sm font-semibold text-hive-dark mb-2">Start Date</label>
                   <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-hive-brand outline-none" />
                </div>
                 <div>
                   <label className="block text-sm font-semibold text-hive-dark mb-2">End Date</label>
                   <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-hive-brand outline-none" />
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-100 bg-gray-50/50 flex justify-end gap-3">
              <button 
                onClick={() => setShowModal(false)}
                className="px-5 py-2.5 text-gray-600 hover:text-hive-dark font-medium"
              >
                Cancel
              </button>
              <button 
                onClick={handleGenerateAndCreate}
                disabled={loading}
                className="bg-hive-dark hover:bg-black text-white px-6 py-2.5 rounded-xl font-medium flex items-center gap-2 disabled:opacity-50 transition-all shadow-lg"
              >
                {loading ? <Loader2 className="animate-spin" size={18} /> : <Sparkles size={18} />}
                {loading ? "Generating Plan..." : "Create with AI"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectList;

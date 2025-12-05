
import React, { useState, useEffect } from 'react';
import { Project, Task, TaskStatus, TaskPriority, Document } from '../types';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Calendar as CalIcon, FileText, LayoutList, CheckCircle2, Hexagon, X, User, Flag, Calendar, Trash2, Settings, DollarSign, Users, Heart, AlertCircle, UploadCloud, Download } from 'lucide-react';

interface ProjectDetailProps {
  projects: Project[];
  updateProject: (p: Project) => void;
  deleteProject: (id: string) => void;
}

// Helper to generate consistent colors based on name
const getAvatarColor = (name: string) => {
    const colors = [
        'bg-red-100 text-red-600 border-red-200',
        'bg-orange-100 text-orange-600 border-orange-200',
        'bg-amber-100 text-amber-600 border-amber-200',
        'bg-lime-100 text-lime-600 border-lime-200',
        'bg-green-100 text-green-600 border-green-200',
        'bg-emerald-100 text-emerald-600 border-emerald-200',
        'bg-teal-100 text-teal-600 border-teal-200',
        'bg-cyan-100 text-cyan-600 border-cyan-200',
        'bg-blue-100 text-blue-600 border-blue-200',
        'bg-indigo-100 text-indigo-600 border-indigo-200',
        'bg-violet-100 text-violet-600 border-violet-200',
        'bg-purple-100 text-purple-600 border-purple-200',
        'bg-fuchsia-100 text-fuchsia-600 border-fuchsia-200',
        'bg-pink-100 text-pink-600 border-pink-200',
        'bg-rose-100 text-rose-600 border-rose-200'
    ];
    
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    return colors[Math.abs(hash) % colors.length];
};

interface TaskCardProps {
  task: Task;
  moveTask: (taskId: string, newStatus: TaskStatus) => void;
  onClick: (task: Task) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, moveTask, onClick }) => {
  const isHighPriority = task.priority === TaskPriority.HIGH;
  
  // Overdue Logic
  const today = new Date().toLocaleDateString('en-CA');
  const isOverdue = task.dueDate < today && task.status !== TaskStatus.DONE;

  return (
    <div 
      onClick={() => onClick(task)}
      className={`bg-white p-4 rounded-xl shadow-sm border transition-all hover:shadow-md cursor-pointer group relative overflow-hidden
        ${isOverdue ? 'border-red-300 ring-1 ring-red-100' : 'border-gray-200 hover:border-hive-brand/30'}
      `}
    >
      {isOverdue && (
        <div className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-bl-lg"></div>
      )}

      <div className="flex justify-between items-start mb-2">
        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
          isHighPriority ? 'bg-red-50 text-red-600' : 
          task.priority === TaskPriority.MEDIUM ? 'bg-orange-50 text-orange-600' : 'bg-blue-50 text-blue-600'
        }`}>
          {task.priority}
        </span>
        {isOverdue && (
             <span className="flex items-center gap-1 text-[10px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-md">
                <AlertCircle size={10} /> Overdue
             </span>
        )}
      </div>
      
      <h4 className={`font-semibold text-hive-dark mb-3 text-sm leading-snug ${task.status === TaskStatus.DONE ? 'line-through text-gray-400' : ''}`}>
        {task.title}
      </h4>
      
      <div className="flex items-end justify-between mt-2">
         <div className="flex items-center gap-2">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border-2 border-white shadow-sm ${getAvatarColor(task.assignee)}`}>
                {task.assignee.charAt(0)}
            </div>
            <div className="flex flex-col">
                <span className="text-[10px] text-gray-400 font-medium leading-none mb-0.5">Due</span>
                <span className={`text-[10px] font-semibold flex items-center gap-1 ${isOverdue ? 'text-red-600' : 'text-gray-600'}`}>
                    {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' })}
                </span>
            </div>
         </div>

         <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
           {task.status !== TaskStatus.TODO && (
             <button 
               onClick={() => moveTask(task.id, task.status === TaskStatus.DONE ? TaskStatus.IN_PROGRESS : TaskStatus.TODO)}
               className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-hive-dark"
               title="Move Back"
             >
               <ArrowLeft size={14} />
             </button>
           )}
           {task.status !== TaskStatus.DONE && (
             <button 
               onClick={() => moveTask(task.id, task.status === TaskStatus.IN_PROGRESS ? TaskStatus.DONE : TaskStatus.IN_PROGRESS)}
               className="p-1.5 hover:bg-hive-brand hover:text-white rounded-lg text-gray-400 transition-colors"
               title="Advance Task"
             >
               <CheckCircle2 size={14} />
             </button>
           )}
         </div>
      </div>
    </div>
  );
};

const ProjectDetail: React.FC<ProjectDetailProps> = ({ projects, updateProject, deleteProject }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const project = projects.find(p => p.id === id);

  const [activeTab, setActiveTab] = useState<'kanban' | 'timeline' | 'files'>('kanban');

  // Edit Task Modal State
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editAssignee, setEditAssignee] = useState('');
  const [editPriority, setEditPriority] = useState<TaskPriority>(TaskPriority.MEDIUM);
  const [editStatus, setEditStatus] = useState<TaskStatus>(TaskStatus.TODO);
  const [editDueDate, setEditDueDate] = useState('');

  // New Task Modal State
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskAssignee, setNewTaskAssignee] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<TaskPriority>(TaskPriority.MEDIUM);
  const [newTaskDueDate, setNewTaskDueDate] = useState('');

  // Project Settings Modal State
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settingsTitle, setSettingsTitle] = useState('');
  const [settingsDesc, setSettingsDesc] = useState('');
  const [settingsBeneficiaries, setSettingsBeneficiaries] = useState(0);
  const [settingsVolunteers, setSettingsVolunteers] = useState(0);
  const [settingsBudget, setSettingsBudget] = useState(0);
  const [settingsStart, setSettingsStart] = useState('');
  const [settingsEnd, setSettingsEnd] = useState('');

  useEffect(() => {
    if (editingTask) {
        setEditTitle(editingTask.title);
        setEditAssignee(editingTask.assignee);
        setEditPriority(editingTask.priority);
        setEditStatus(editingTask.status);
        setEditDueDate(editingTask.dueDate);
    }
  }, [editingTask]);

  useEffect(() => {
    if (project && isSettingsOpen) {
        setSettingsTitle(project.title);
        setSettingsDesc(project.description);
        setSettingsBeneficiaries(project.kpi?.beneficiaries || 0);
        setSettingsVolunteers(project.kpi?.volunteers || 0);
        setSettingsBudget(project.kpi?.budget || 0);
        setSettingsStart(project.startDate);
        setSettingsEnd(project.endDate);
    }
  }, [project, isSettingsOpen]);

  if (!project) return <div>Project not found</div>;

  const handleMoveTask = (taskId: string, newStatus: TaskStatus) => {
    const updatedTasks = project.tasks.map(t => 
      t.id === taskId ? { ...t, status: newStatus } : t
    );
    
    // Recalculate progress
    const completed = updatedTasks.filter(t => t.status === TaskStatus.DONE).length;
    const progress = Math.round((completed / updatedTasks.length) * 100);
    
    updateProject({ ...project, tasks: updatedTasks, progress });
  };

  const handleCreateTask = () => {
    if (!newTaskTitle) return;
    
    const newTask: Task = {
        id: `t-${Date.now()}`,
        title: newTaskTitle,
        assignee: newTaskAssignee || 'Unassigned',
        priority: newTaskPriority,
        status: TaskStatus.TODO,
        dueDate: newTaskDueDate || project.endDate,
        createdAt: new Date().toISOString()
    };

    const updatedTasks = [...project.tasks, newTask];
    const completed = updatedTasks.filter(t => t.status === TaskStatus.DONE).length;
    const progress = Math.round((completed / updatedTasks.length) * 100);

    updateProject({ ...project, tasks: updatedTasks, progress });
    
    // Reset and close
    setNewTaskTitle('');
    setNewTaskAssignee('');
    setNewTaskPriority(TaskPriority.MEDIUM);
    setNewTaskDueDate('');
    setIsTaskModalOpen(false);
  };

  const handleUpdateTask = () => {
    if (!editingTask) return;
    
    const updatedTasks = project.tasks.map(t => 
        t.id === editingTask.id 
        ? { ...t, title: editTitle, assignee: editAssignee, priority: editPriority, status: editStatus, dueDate: editDueDate } 
        : t
    );

    const completed = updatedTasks.filter(t => t.status === TaskStatus.DONE).length;
    const progress = Math.round((completed / updatedTasks.length) * 100);

    updateProject({ ...project, tasks: updatedTasks, progress });
    setEditingTask(null);
  };

  const handleDeleteTask = () => {
      if (!editingTask) return;
      if (!window.confirm("Are you sure you want to delete this task?")) return;

      const updatedTasks = project.tasks.filter(t => t.id !== editingTask.id);
      const completed = updatedTasks.filter(t => t.status === TaskStatus.DONE).length;
      const progress = updatedTasks.length > 0 ? Math.round((completed / updatedTasks.length) * 100) : 0;

      updateProject({ ...project, tasks: updatedTasks, progress });
      setEditingTask(null);
  };

  const handleDeleteProject = () => {
      if (window.confirm("Are you sure you want to delete this entire project? This action cannot be undone.")) {
          deleteProject(project.id);
          navigate('/projects');
      }
  };

  const handleSaveSettings = () => {
      const updatedProject = {
          ...project,
          title: settingsTitle,
          description: settingsDesc,
          startDate: settingsStart,
          endDate: settingsEnd,
          kpi: {
              beneficiaries: Number(settingsBeneficiaries),
              volunteers: Number(settingsVolunteers),
              budget: Number(settingsBudget)
          }
      };
      updateProject(updatedProject);
      setIsSettingsOpen(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && project) {
      const newDoc: Document = {
        id: `d-${Date.now()}`,
        name: file.name,
        type: file.type || 'application/octet-stream',
        uploadDate: new Date().toISOString()
      };
      const updatedProject = {
        ...project,
        documents: [...(project.documents || []), newDoc]
      };
      updateProject(updatedProject);
    }
  };

  const handleDeleteFile = (docId: string) => {
      if (window.confirm("Are you sure you want to delete this file?")) {
          const updatedDocs = (project.documents || []).filter(d => d.id !== docId);
          updateProject({ ...project, documents: updatedDocs });
      }
  };

  const tasksByStatus = {
    [TaskStatus.TODO]: project.tasks.filter(t => t.status === TaskStatus.TODO),
    [TaskStatus.IN_PROGRESS]: project.tasks.filter(t => t.status === TaskStatus.IN_PROGRESS),
    [TaskStatus.DONE]: project.tasks.filter(t => t.status === TaskStatus.DONE),
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto h-full flex flex-col">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start gap-4">
        <div className="flex items-start gap-4">
          <button 
            onClick={() => navigate('/projects')}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors mt-1"
          >
            <ArrowLeft size={24} className="text-gray-500" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-hive-dark font-heading">{project.title}</h1>
            <div className="flex items-center gap-4 text-sm text-gray-500 mt-2">
              <span className="flex items-center gap-1"><CalIcon size={14} /> {new Date(project.startDate).toLocaleDateString()} - {new Date(project.endDate).toLocaleDateString()}</span>
              <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
              <span className="flex items-center gap-1"><LayoutList size={14} /> {project.tasks.length} Tasks</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
           <button 
              onClick={() => setIsSettingsOpen(true)}
              className="p-2.5 text-gray-500 hover:bg-gray-100 rounded-xl transition-colors border border-gray-200"
              title="Project Settings"
           >
              <Settings size={20} />
           </button>
           <button 
              onClick={handleDeleteProject}
              className="p-2.5 text-red-500 hover:bg-red-50 rounded-xl transition-colors border border-red-100"
              title="Delete Project"
           >
              <Trash2 size={20} />
           </button>
        </div>
      </div>

      {/* Tabs / Navigation */}
      <div className="flex border-b border-gray-200">
        <button 
            onClick={() => setActiveTab('kanban')}
            className={`px-6 py-3 font-medium transition-colors ${activeTab === 'kanban' ? 'text-hive-brand font-bold border-b-2 border-hive-brand font-heading' : 'text-gray-500 hover:text-hive-dark'}`}
        >
            Kanban Board
        </button>
        <button 
            onClick={() => setActiveTab('timeline')}
            className={`px-6 py-3 font-medium transition-colors ${activeTab === 'timeline' ? 'text-hive-brand font-bold border-b-2 border-hive-brand font-heading' : 'text-gray-500 hover:text-hive-dark'}`}
        >
            Timeline
        </button>
        <button 
            onClick={() => setActiveTab('files')}
            className={`px-6 py-3 font-medium transition-colors ${activeTab === 'files' ? 'text-hive-brand font-bold border-b-2 border-hive-brand font-heading' : 'text-gray-500 hover:text-hive-dark'}`}
        >
            Files
        </button>
      </div>

      {/* Content Area */}
      {activeTab === 'kanban' && (
        <div className="flex-1 overflow-x-auto overflow-y-hidden">
            <div className="flex gap-6 h-full min-w-[1000px] pb-4">
            
            {/* To Do Column */}
            <div className="flex-1 flex flex-col bg-gray-50/50 rounded-2xl border border-gray-100 h-full">
                <div className="p-4 flex justify-between items-center border-b border-gray-100 bg-white/50 rounded-t-2xl backdrop-blur-sm">
                <h3 className="font-bold text-gray-700 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-gray-400"></span> To Do
                    <span className="ml-2 bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs">{tasksByStatus[TaskStatus.TODO].length}</span>
                </h3>
                <button onClick={() => setIsTaskModalOpen(true)} className="text-gray-400 hover:text-hive-brand transition-colors">
                    <Plus size={20} />
                </button>
                </div>
                <div className="p-4 space-y-3 overflow-y-auto flex-1 custom-scrollbar">
                {tasksByStatus[TaskStatus.TODO].map(task => (
                    <TaskCard key={task.id} task={task} moveTask={handleMoveTask} onClick={setEditingTask} />
                ))}
                <button 
                    onClick={() => setIsTaskModalOpen(true)}
                    className="w-full py-3 border-2 border-dashed border-gray-200 rounded-xl text-gray-400 text-sm font-semibold hover:border-hive-brand hover:text-hive-brand transition-all flex items-center justify-center gap-2"
                >
                    <Plus size={16} /> Add Task
                </button>
                </div>
            </div>

            {/* In Progress Column */}
            <div className="flex-1 flex flex-col bg-blue-50/30 rounded-2xl border border-blue-100/50 h-full">
                <div className="p-4 flex justify-between items-center border-b border-blue-100 bg-white/50 rounded-t-2xl backdrop-blur-sm">
                <h3 className="font-bold text-hive-brand flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-hive-brand animate-pulse"></span> In Progress
                    <span className="ml-2 bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-xs">{tasksByStatus[TaskStatus.IN_PROGRESS].length}</span>
                </h3>
                </div>
                <div className="p-4 space-y-3 overflow-y-auto flex-1 custom-scrollbar">
                {tasksByStatus[TaskStatus.IN_PROGRESS].map(task => (
                    <TaskCard key={task.id} task={task} moveTask={handleMoveTask} onClick={setEditingTask} />
                ))}
                </div>
            </div>

            {/* Done Column */}
            <div className="flex-1 flex flex-col bg-green-50/30 rounded-2xl border border-green-100/50 h-full">
                <div className="p-4 flex justify-between items-center border-b border-green-100 bg-white/50 rounded-t-2xl backdrop-blur-sm">
                <h3 className="font-bold text-green-700 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-hive-green"></span> Done
                    <span className="ml-2 bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs">{tasksByStatus[TaskStatus.DONE].length}</span>
                </h3>
                </div>
                <div className="p-4 space-y-3 overflow-y-auto flex-1 custom-scrollbar">
                {tasksByStatus[TaskStatus.DONE].map(task => (
                    <TaskCard key={task.id} task={task} moveTask={handleMoveTask} onClick={setEditingTask} />
                ))}
                </div>
            </div>

            </div>
        </div>
      )}

      {activeTab === 'timeline' && (
        <div className="flex-1 overflow-y-auto custom-scrollbar p-4">
             <div className="max-w-3xl mx-auto py-4">
                 <h3 className="text-lg font-bold text-hive-dark mb-6">Task Timeline</h3>
                <div className="relative border-l-2 border-gray-200 ml-4 space-y-8 pb-10">
                    {[...project.tasks].sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()).map((task) => (
                        <div key={task.id} className="relative pl-8">
                            {/* Dot on line */}
                            <div className={`absolute -left-[9px] top-4 w-4 h-4 rounded-full border-2 border-white shadow-sm z-10 ${
                                task.status === TaskStatus.DONE ? 'bg-green-500' : 'bg-hive-brand'
                            }`}></div>

                            <div 
                                onClick={() => setEditingTask(task)}
                                className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer group"
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                                         <Calendar size={12} />
                                         {new Date(task.dueDate).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'long', day: 'numeric' })}
                                    </span>
                                    <span className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase ${
                                        task.status === TaskStatus.DONE ? 'bg-green-100 text-green-700' :
                                        task.status === TaskStatus.IN_PROGRESS ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
                                    }`}>
                                        {task.status}
                                    </span>
                                </div>
                                <h4 className={`text-base font-bold text-hive-dark mb-3 ${task.status === TaskStatus.DONE ? 'line-through text-gray-400' : ''}`}>{task.title}</h4>
                                <div className="flex items-center gap-2">
                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border-2 border-white shadow-sm ${getAvatarColor(task.assignee)}`}>
                                        {task.assignee.charAt(0)}
                                    </div>
                                    <span className="text-sm font-medium text-gray-600">{task.assignee}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                    {project.tasks.length === 0 && (
                        <div className="pl-8 text-gray-400 italic">No tasks scheduled yet.</div>
                    )}
                </div>
            </div>
        </div>
      )}

      {activeTab === 'files' && (
         <div className="flex-1 overflow-y-auto custom-scrollbar p-4">
             <div className="space-y-6">
                <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl p-8 flex flex-col items-center justify-center text-center hover:bg-gray-100/50 transition-colors group">
                    <div className="bg-white p-4 rounded-full shadow-sm mb-3 group-hover:scale-110 transition-transform">
                        <UploadCloud className="text-hive-brand" size={28} />
                    </div>
                    <h3 className="font-bold text-hive-dark text-lg">Upload Documents</h3>
                    <p className="text-sm text-gray-500 mb-4">Support for PDF, Images, or Spreadsheets</p>
                    <label className="bg-hive-brand text-white px-6 py-2.5 rounded-xl font-medium cursor-pointer hover:bg-blue-700 transition-colors shadow-lg shadow-hive-brand/20">
                        Choose File
                        <input type="file" className="hidden" onChange={handleFileUpload} />
                    </label>
                </div>

                <div>
                     <h3 className="text-lg font-bold text-hive-dark mb-4">Project Files ({project.documents?.length || 0})</h3>
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {project.documents?.map(doc => (
                            <div key={doc.id} className="bg-white p-4 rounded-xl border border-gray-200 flex items-start gap-3 hover:shadow-lg hover:border-hive-brand/20 transition-all group">
                                <div className="p-3 bg-blue-50 text-hive-brand rounded-xl">
                                    <FileText size={20} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-semibold text-hive-dark text-sm truncate" title={doc.name}>{doc.name}</h4>
                                    <p className="text-xs text-gray-400 mt-1">{new Date(doc.uploadDate).toLocaleDateString()} • {doc.type.split('/')[1]?.toUpperCase() || 'FILE'}</p>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <button className="text-gray-400 hover:text-hive-brand p-1.5 rounded-lg hover:bg-gray-50 opacity-0 group-hover:opacity-100 transition-all" title="Download">
                                        <Download size={16} />
                                    </button>
                                     <button 
                                        onClick={() => handleDeleteFile(doc.id)}
                                        className="text-gray-400 hover:text-red-500 p-1.5 rounded-lg hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all" 
                                        title="Delete"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        ))}
                        {(!project.documents || project.documents.length === 0) && (
                            <div className="col-span-full text-center py-10 bg-white rounded-xl border border-gray-100">
                                <p className="text-gray-400 italic">No documents uploaded yet.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
         </div>
      )}

       {/* Edit Task Modal */}
       {editingTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-hive-dark/40 backdrop-blur-sm p-4 animate-in fade-in zoom-in-95 duration-200">
           <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-gray-100">
              <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                 <h3 className="font-heading font-bold text-lg text-hive-dark">Edit Task</h3>
                 <button onClick={() => setEditingTask(null)} className="text-gray-400 hover:text-gray-600 transition-colors">
                    <X size={20} />
                 </button>
              </div>
              
              <div className="p-6 space-y-5">
                 <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Task Title</label>
                    <input 
                        type="text" 
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-hive-brand outline-none"
                    />
                 </div>
                 
                 <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Assignee</label>
                    <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18}/>
                        <input 
                            type="text" 
                            value={editAssignee}
                            onChange={(e) => setEditAssignee(e.target.value)}
                            className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-hive-brand outline-none"
                        />
                    </div>
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                     <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Priority</label>
                        <select 
                            value={editPriority}
                            onChange={(e) => setEditPriority(e.target.value as TaskPriority)}
                            className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-hive-brand outline-none bg-white"
                        >
                            <option value={TaskPriority.LOW}>Low</option>
                            <option value={TaskPriority.MEDIUM}>Medium</option>
                            <option value={TaskPriority.HIGH}>High</option>
                        </select>
                     </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Status</label>
                        <select 
                            value={editStatus}
                            onChange={(e) => setEditStatus(e.target.value as TaskStatus)}
                            className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-hive-brand outline-none bg-white"
                        >
                            <option value={TaskStatus.TODO}>To Do</option>
                            <option value={TaskStatus.IN_PROGRESS}>In Progress</option>
                            <option value={TaskStatus.DONE}>Done</option>
                        </select>
                     </div>
                 </div>

                 <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Due Date</label>
                    <input 
                        type="date" 
                        value={editDueDate}
                        onChange={(e) => setEditDueDate(e.target.value)}
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-hive-brand outline-none"
                    />
                 </div>
              </div>

              <div className="p-5 border-t border-gray-100 bg-gray-50/50 flex justify-between items-center">
                 <button 
                    onClick={handleDeleteTask}
                    className="text-red-500 hover:bg-red-50 px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1"
                 >
                    <Trash2 size={16} /> Delete Task
                 </button>
                 <div className="flex gap-3">
                    <button 
                        onClick={() => setEditingTask(null)}
                        className="px-4 py-2 text-gray-600 font-medium hover:text-gray-900"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={handleUpdateTask}
                        className="bg-hive-brand text-white px-6 py-2 rounded-xl font-medium shadow-md shadow-hive-brand/20 hover:bg-blue-700 transition-all"
                    >
                        Save Changes
                    </button>
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* New Task Modal */}
      {isTaskModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-hive-dark/40 backdrop-blur-sm p-4 animate-in fade-in zoom-in-95 duration-200">
           <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-gray-100">
              <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                 <h3 className="font-heading font-bold text-lg text-hive-dark">New Task</h3>
                 <button onClick={() => setIsTaskModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                    <X size={20} />
                 </button>
              </div>
              
              <div className="p-6 space-y-5">
                 <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Task Title</label>
                    <input 
                        type="text" 
                        placeholder="What needs to be done?"
                        value={newTaskTitle}
                        onChange={(e) => setNewTaskTitle(e.target.value)}
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-hive-brand outline-none"
                    />
                 </div>
                 
                 <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Assignee</label>
                    <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18}/>
                        <input 
                            type="text" 
                            placeholder="Name of person responsible"
                            value={newTaskAssignee}
                            onChange={(e) => setNewTaskAssignee(e.target.value)}
                            className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-hive-brand outline-none"
                        />
                    </div>
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                     <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Priority</label>
                        <select 
                            value={newTaskPriority}
                            onChange={(e) => setNewTaskPriority(e.target.value as TaskPriority)}
                            className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-hive-brand outline-none bg-white"
                        >
                            <option value={TaskPriority.LOW}>Low</option>
                            <option value={TaskPriority.MEDIUM}>Medium</option>
                            <option value={TaskPriority.HIGH}>High</option>
                        </select>
                     </div>
                     <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Due Date</label>
                        <input 
                            type="date" 
                            value={newTaskDueDate}
                            onChange={(e) => setNewTaskDueDate(e.target.value)}
                            className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-hive-brand outline-none"
                        />
                     </div>
                 </div>
              </div>

              <div className="p-5 border-t border-gray-100 bg-gray-50/50 flex justify-end gap-3">
                 <button 
                    onClick={() => setIsTaskModalOpen(false)}
                    className="px-4 py-2 text-gray-600 font-medium hover:text-gray-900"
                 >
                    Cancel
                 </button>
                 <button 
                    onClick={handleCreateTask}
                    disabled={!newTaskTitle}
                    className="bg-hive-brand text-white px-6 py-2 rounded-xl font-medium shadow-md shadow-hive-brand/20 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                 >
                    Create Task
                 </button>
              </div>
           </div>
        </div>
      )}

      {/* Project Settings Modal */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-hive-dark/40 backdrop-blur-sm p-4 animate-in fade-in zoom-in-95 duration-200">
           <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden border border-gray-100 flex flex-col max-h-[90vh]">
              <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                 <h3 className="font-heading font-bold text-lg text-hive-dark flex items-center gap-2">
                    <Settings className="text-hive-brand" size={20} />
                    Project Settings
                 </h3>
                 <button onClick={() => setIsSettingsOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                    <X size={20} />
                 </button>
              </div>
              
              <div className="p-8 space-y-6 overflow-y-auto custom-scrollbar">
                 {/* Basic Info */}
                 <div className="space-y-4">
                    <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider">General Information</h4>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Project Title</label>
                        <input 
                            type="text" 
                            value={settingsTitle}
                            onChange={(e) => setSettingsTitle(e.target.value)}
                            className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-hive-brand outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Description</label>
                        <textarea 
                            value={settingsDesc}
                            onChange={(e) => setSettingsDesc(e.target.value)}
                            className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-hive-brand outline-none h-24 resize-none"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                             <label className="block text-sm font-semibold text-gray-700 mb-1.5">Start Date</label>
                             <input type="date" value={settingsStart} onChange={(e) => setSettingsStart(e.target.value)} className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-hive-brand outline-none" />
                        </div>
                        <div>
                             <label className="block text-sm font-semibold text-gray-700 mb-1.5">End Date</label>
                             <input type="date" value={settingsEnd} onChange={(e) => setSettingsEnd(e.target.value)} className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-hive-brand outline-none" />
                        </div>
                    </div>
                 </div>

                 <div className="border-t border-gray-100 pt-6 space-y-4">
                    <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Impact KPIs (Real Data)</h4>
                    <p className="text-xs text-gray-500 -mt-3 mb-4">Update these numbers to reflect the real-world impact of your project. These feed into the Impact Dashboard.</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-1"><Users size={14}/> Beneficiaries</label>
                            <input 
                                type="number" 
                                value={settingsBeneficiaries}
                                onChange={(e) => setSettingsBeneficiaries(Number(e.target.value))}
                                className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-hive-brand outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-1"><Heart size={14}/> Volunteers</label>
                            <input 
                                type="number" 
                                value={settingsVolunteers}
                                onChange={(e) => setSettingsVolunteers(Number(e.target.value))}
                                className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-hive-brand outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-1"><DollarSign size={14}/> Budget ($)</label>
                            <input 
                                type="number" 
                                value={settingsBudget}
                                onChange={(e) => setSettingsBudget(Number(e.target.value))}
                                className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-hive-brand outline-none"
                            />
                        </div>
                    </div>
                 </div>
              </div>

              <div className="p-5 border-t border-gray-100 bg-gray-50/50 flex justify-end gap-3">
                 <button 
                    onClick={() => setIsSettingsOpen(false)}
                    className="px-4 py-2 text-gray-600 font-medium hover:text-gray-900"
                 >
                    Cancel
                 </button>
                 <button 
                    onClick={handleSaveSettings}
                    className="bg-hive-brand text-white px-6 py-2 rounded-xl font-medium shadow-md shadow-hive-brand/20 hover:bg-blue-700 transition-all"
                 >
                    Save Project
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default ProjectDetail;


import React, { useState, useEffect } from 'react';
import { X, Sparkles, User, Flag, Calendar, Layers } from 'lucide-react';
import { Project, Task, TaskPriority, TaskStatus } from '../types';

interface QuickTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  projects: Project[];
  onCreate: (projectId: string, task: Task) => void;
}

const QuickTaskModal: React.FC<QuickTaskModalProps> = ({ isOpen, onClose, projects, onCreate }) => {
  const [title, setTitle] = useState('');
  const [projectId, setProjectId] = useState('');
  const [assignee, setAssignee] = useState('');
  const [priority, setPriority] = useState<TaskPriority>(TaskPriority.MEDIUM);
  const [dueDate, setDueDate] = useState('');

  // Set default project when modal opens or projects load
  useEffect(() => {
    if (isOpen && projects.length > 0 && !projectId) {
      setProjectId(projects[0].id);
    }
  }, [isOpen, projects, projectId]);

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (!title || !projectId) return;
    
    const newTask: Task = {
        id: `t-${Date.now()}`,
        title,
        assignee: assignee || 'Unassigned',
        priority,
        status: TaskStatus.TODO,
        dueDate: dueDate || new Date().toISOString(),
        createdAt: new Date().toISOString()
    };

    onCreate(projectId, newTask);
    
    // Reset form
    setTitle('');
    setAssignee('');
    setPriority(TaskPriority.MEDIUM);
    setDueDate('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-hive-dark/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
       <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
          {/* Header */}
          <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <h3 className="font-heading font-bold text-lg text-hive-dark flex items-center gap-2">
                    <Sparkles className="text-hive-brand" size={20} />
                    Quick Task
                </h3>
                <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                    <X size={20} />
                </button>
            </div>

            <div className="p-6 space-y-5">
                 {/* Project Selection */}
                 <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Project <span className="text-red-500">*</span></label>
                    <div className="relative">
                        <Layers className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18}/>
                        <select
                            value={projectId}
                            onChange={(e) => setProjectId(e.target.value)}
                            className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-hive-brand focus:border-transparent outline-none appearance-none bg-white transition-all"
                        >
                            {projects.map(p => (
                                <option key={p.id} value={p.id}>{p.title}</option>
                            ))}
                        </select>
                    </div>
                 </div>

                 {/* Title */}
                 <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Task Title <span className="text-red-500">*</span></label>
                    <input 
                        type="text" 
                        autoFocus
                        placeholder="What needs to be done?"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-hive-brand focus:border-transparent outline-none transition-all"
                    />
                </div>

                {/* Assignee */}
                <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Assignee</label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18}/>
                            <input 
                                type="text" 
                                placeholder="Name of person responsible"
                                value={assignee}
                                onChange={(e) => setAssignee(e.target.value)}
                                className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-hive-brand focus:border-transparent outline-none transition-all"
                            />
                        </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                        <div>
                             <label className="block text-sm font-semibold text-gray-700 mb-1.5">Priority</label>
                             <div className="relative">
                                <Flag className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18}/>
                                <select 
                                    value={priority}
                                    onChange={(e) => setPriority(e.target.value as TaskPriority)}
                                    className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-hive-brand focus:border-transparent outline-none appearance-none bg-white transition-all"
                                >
                                    <option value={TaskPriority.LOW}>Low</option>
                                    <option value={TaskPriority.MEDIUM}>Medium</option>
                                    <option value={TaskPriority.HIGH}>High</option>
                                </select>
                             </div>
                        </div>
                        <div>
                             <label className="block text-sm font-semibold text-gray-700 mb-1.5">Due Date</label>
                             <div className="relative">
                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18}/>
                                <input 
                                    type="date" 
                                    value={dueDate}
                                    onChange={(e) => setDueDate(e.target.value)}
                                    className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-hive-brand focus:border-transparent outline-none transition-all"
                                />
                             </div>
                        </div>
                    </div>

            </div>
            
             <div className="p-5 border-t border-gray-100 bg-gray-50/50 flex justify-end gap-3">
                    <button 
                        onClick={onClose}
                        className="px-4 py-2 text-gray-600 font-medium hover:text-gray-900 transition-colors"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={handleSubmit}
                        disabled={!title.trim() || !projectId}
                        className="bg-hive-brand text-white px-6 py-2 rounded-xl font-medium shadow-md shadow-hive-brand/20 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                        Create Task
                    </button>
                </div>

       </div>
    </div>
  );
}

export default QuickTaskModal;

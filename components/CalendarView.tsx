
import React, { useState, useMemo } from 'react';
import { Project, Task, TaskPriority, TaskStatus } from '../types';
import { ChevronLeft, ChevronRight, Filter, X, Calendar, Flag, User, CheckCircle2, Circle, Clock } from 'lucide-react';

interface CalendarViewProps {
  projects: Project[];
  updateProject: (p: Project) => void;
}

interface ExtendedTask extends Task {
  projectId: string;
  projectName: string;
}

// Helper to generate consistent colors based on name (Duplicated for now, better in utils)
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

const CalendarView: React.FC<CalendarViewProps> = ({ projects, updateProject }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedProject, setSelectedProject] = useState<string>('all');
  const [selectedTask, setSelectedTask] = useState<ExtendedTask | null>(null);

  // Modal State for Edits
  const [editStatus, setEditStatus] = useState<TaskStatus>(TaskStatus.TODO);
  const [editPriority, setEditPriority] = useState<TaskPriority>(TaskPriority.MEDIUM);
  const [editDueDate, setEditDueDate] = useState<string>('');

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Calendar Logic
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 = Sunday
  const daysInPrevMonth = new Date(year, month, 0).getDate();
  const paddingDays = firstDayOfMonth;

  const calendarDays = useMemo(() => {
    const days = [];
    for (let i = paddingDays - 1; i >= 0; i--) {
      days.push({ day: daysInPrevMonth - i, type: 'prev', date: new Date(year, month - 1, daysInPrevMonth - i) });
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({ day: i, type: 'current', date: new Date(year, month, i) });
    }
    const remainingCells = 42 - days.length;
    for (let i = 1; i <= remainingCells; i++) {
      days.push({ day: i, type: 'next', date: new Date(year, month + 1, i) });
    }
    return days;
  }, [year, month]);

  // Flatten and Filter Tasks
  const displayedTasks = useMemo(() => {
    let all = projects.flatMap(p => p.tasks.map(t => ({ 
      ...t, 
      projectId: p.id,
      projectName: p.title 
    })));

    if (selectedProject !== 'all') {
      all = all.filter(t => t.projectId === selectedProject);
    }
    return all;
  }, [projects, selectedProject]);

  const getTasksForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return displayedTasks.filter(t => t.dueDate === dateStr);
  };

  const handleTaskClick = (task: ExtendedTask) => {
    setSelectedTask(task);
    setEditStatus(task.status);
    setEditPriority(task.priority);
    setEditDueDate(task.dueDate);
  };

  const handleSaveChanges = () => {
    if (!selectedTask) return;

    const projectToUpdate = projects.find(p => p.id === selectedTask.projectId);
    if (!projectToUpdate) return;

    const updatedTasks = projectToUpdate.tasks.map(t => {
      if (t.id === selectedTask.id) {
        return {
          ...t,
          status: editStatus,
          priority: editPriority,
          dueDate: editDueDate
        };
      }
      return t;
    });

    // Recalculate progress
    const completed = updatedTasks.filter(t => t.status === TaskStatus.DONE).length;
    const progress = Math.round((completed / updatedTasks.length) * 100);

    updateProject({ ...projectToUpdate, tasks: updatedTasks, progress });
    setSelectedTask(null);
  };

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const isToday = (date: Date) => {
    const today = new Date();
    return date.getDate() === today.getDate() && date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear();
  };

  return (
    <div className="h-full flex flex-col max-w-7xl mx-auto space-y-6 relative">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-hive-dark font-heading">Calendar</h2>
          <p className="text-gray-500 mt-1">Manage schedules and deadlines efficiently.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
          {/* Filter Dropdown */}
          <div className="relative group min-w-[200px]">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
               <Filter size={16} />
            </div>
            <select
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-hive-dark shadow-sm outline-none focus:ring-2 focus:ring-hive-brand/20 appearance-none cursor-pointer hover:border-hive-brand/30 transition-all"
            >
              <option value="all">All Projects</option>
              {projects.map(p => (
                <option key={p.id} value={p.id}>{p.title}</option>
              ))}
            </select>
          </div>

          {/* Navigation */}
          <div className="flex items-center gap-3 self-end sm:self-auto">
            <button 
              onClick={() => setCurrentDate(new Date())}
              className="px-4 py-2.5 bg-white border border-gray-200 text-hive-dark text-sm font-semibold rounded-xl hover:bg-gray-50 transition-colors shadow-sm"
            >
              Today
            </button>
            <div className="flex items-center bg-white p-1 rounded-xl border border-gray-200 shadow-sm">
              <button onClick={() => setCurrentDate(new Date(year, month - 1, 1))} className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors">
                <ChevronLeft size={20}/>
              </button>
              <span className="font-bold text-hive-dark w-36 text-center font-heading select-none">
                {monthNames[month]} {year}
              </span>
              <button onClick={() => setCurrentDate(new Date(year, month + 1, 1))} className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors">
                <ChevronRight size={20}/>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm flex-1 overflow-hidden flex flex-col min-h-[600px]">
        {/* Days Header */}
        <div className="grid grid-cols-7 border-b border-gray-100 bg-gray-50/50">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="py-4 text-center text-xs font-bold uppercase tracking-wider text-gray-400">
              {day}
            </div>
          ))}
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-7 grid-rows-6 flex-1 divide-x divide-y divide-gray-100">
          {calendarDays.map((cell, index) => {
            const tasks = getTasksForDate(cell.date);
            const currentDay = isToday(cell.date);
            
            return (
              <div 
                key={index} 
                className={`relative p-2 min-h-[100px] flex flex-col gap-1 transition-colors
                  ${cell.type !== 'current' ? 'bg-gray-50/40' : 'bg-white hover:bg-blue-50/5'}
                  ${currentDay ? 'bg-blue-50/20' : ''}
                `}
              >
                <div className="flex justify-between items-start mb-1">
                  <span className={`text-sm w-7 h-7 flex items-center justify-center rounded-full font-medium transition-all
                    ${currentDay 
                      ? 'bg-hive-brand text-white font-bold shadow-md shadow-hive-brand/20 scale-110' 
                      : cell.type === 'current' ? 'text-gray-700' : 'text-gray-300'
                    }
                  `}>
                    {cell.day}
                  </span>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar space-y-1.5">
                  {tasks.map((task, tIndex) => (
                    <div 
                      key={`${task.id}-${tIndex}`}
                      onClick={() => handleTaskClick(task)}
                      className={`
                        group text-[11px] px-2 py-1.5 rounded-lg border flex items-center gap-2 cursor-pointer shadow-sm transition-all hover:scale-[1.02]
                        ${task.status === TaskStatus.DONE 
                          ? 'bg-gray-50 border-gray-100 text-gray-400 line-through opacity-70' 
                          : task.priority === TaskPriority.HIGH 
                            ? 'bg-red-50 border-red-100 text-red-700 hover:bg-red-100 hover:border-red-200' 
                            : task.priority === TaskPriority.MEDIUM
                              ? 'bg-orange-50 border-orange-100 text-orange-700 hover:bg-orange-100 hover:border-orange-200'
                              : 'bg-blue-50 border-blue-100 text-blue-700 hover:bg-blue-100 hover:border-blue-200'
                        }
                      `}
                    >
                        <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                            task.status === TaskStatus.DONE ? 'bg-gray-400' :
                            task.priority === TaskPriority.HIGH ? 'bg-red-500' :
                            task.priority === TaskPriority.MEDIUM ? 'bg-orange-500' : 'bg-blue-500'
                        }`}></div>
                        
                        <span className="truncate font-medium flex-1">{task.title}</span>
                        
                        <div className={`w-4 h-4 rounded-full flex items-center justify-center font-bold text-[8px] flex-shrink-0 border border-white ${getAvatarColor(task.assignee)}`}>
                            {task.assignee.charAt(0)}
                        </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Task Detail Modal */}
      {selectedTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-hive-dark/40 backdrop-blur-sm p-4 animate-in fade-in zoom-in-95 duration-200">
           <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-100">
              <div className="p-5 border-b border-gray-100 flex justify-between items-start bg-gray-50/50">
                <div>
                   <h3 className="font-heading font-bold text-lg text-hive-dark pr-8">{selectedTask.title}</h3>
                   <p className="text-xs text-gray-500 font-medium mt-1 flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-hive-brand"></span>
                      {selectedTask.projectName}
                   </p>
                </div>
                <button 
                  onClick={() => setSelectedTask(null)} 
                  className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-full transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 space-y-5">
                {/* Assignee Display */}
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                   <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${getAvatarColor(selectedTask.assignee)}`}>
                     {selectedTask.assignee.charAt(0)}
                   </div>
                   <div>
                      <p className="text-xs text-gray-500 font-semibold uppercase">Assigned To</p>
                      <p className="font-semibold text-hive-dark">{selectedTask.assignee}</p>
                   </div>
                </div>

                {/* Edit Status */}
                <div>
                   <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
                   <div className="grid grid-cols-3 gap-2">
                      {[TaskStatus.TODO, TaskStatus.IN_PROGRESS, TaskStatus.DONE].map((s) => (
                        <button
                          key={s}
                          onClick={() => setEditStatus(s)}
                          className={`
                            px-2 py-2 rounded-lg text-xs font-bold border transition-all flex items-center justify-center gap-1
                            ${editStatus === s 
                              ? s === TaskStatus.DONE ? 'bg-green-100 border-green-200 text-green-700' : s === TaskStatus.IN_PROGRESS ? 'bg-blue-100 border-blue-200 text-blue-700' : 'bg-gray-100 border-gray-200 text-gray-700'
                              : 'bg-white border-gray-200 text-gray-400 hover:border-gray-300'
                            }
                          `}
                        >
                           {editStatus === s && <CheckCircle2 size={12} />}
                           {s}
                        </button>
                      ))}
                   </div>
                </div>

                {/* Edit Priority & Date */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Priority</label>
                    <div className="relative">
                      <Flag className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                      <select 
                        value={editPriority}
                        onChange={(e) => setEditPriority(e.target.value as TaskPriority)}
                        className="w-full pl-9 pr-3 py-2.5 bg-white border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-hive-brand focus:border-transparent outline-none appearance-none"
                      >
                         <option value={TaskPriority.LOW}>Low</option>
                         <option value={TaskPriority.MEDIUM}>Medium</option>
                         <option value={TaskPriority.HIGH}>High</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Due Date</label>
                    <div className="relative">
                       <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                       <input 
                          type="date"
                          value={editDueDate}
                          onChange={(e) => setEditDueDate(e.target.value)}
                          className="w-full pl-9 pr-3 py-2.5 bg-white border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-hive-brand focus:border-transparent outline-none"
                       />
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-5 border-t border-gray-100 bg-gray-50/50 flex justify-end gap-3">
                 <button 
                    onClick={() => setSelectedTask(null)}
                    className="px-4 py-2 text-gray-600 font-medium hover:text-gray-900 transition-colors"
                 >
                    Cancel
                 </button>
                 <button 
                    onClick={handleSaveChanges}
                    className="bg-hive-brand text-white px-6 py-2 rounded-xl font-medium shadow-md shadow-hive-brand/20 hover:bg-blue-700 transition-all"
                 >
                    Save Changes
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default CalendarView;

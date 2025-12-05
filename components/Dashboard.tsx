
import React from 'react';
import { Project, TaskStatus } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { CheckCircle2, Clock, Calendar, ArrowRight, Hexagon } from 'lucide-react';
import { Link } from 'react-router-dom';

interface DashboardProps {
  projects: Project[];
}

const Dashboard: React.FC<DashboardProps> = ({ projects }) => {
  // Calculations
  const totalProjects = projects.length;
  const activeProjects = projects.filter(p => p.progress < 100).length;
  
  let totalTasks = 0;
  let completedTasks = 0;
  let inProgressTasks = 0;
  let upcomingDeadlineTasks = 0;

  const today = new Date();
  const nextWeek = new Date();
  nextWeek.setDate(today.getDate() + 7);

  projects.forEach(p => {
    p.tasks.forEach(t => {
      totalTasks++;
      if (t.status === TaskStatus.DONE) completedTasks++;
      if (t.status === TaskStatus.IN_PROGRESS) inProgressTasks++;

      // Calculate upcoming deadlines (not done, due within 7 days)
      if (t.status !== TaskStatus.DONE) {
        const dueDate = new Date(t.dueDate);
        if (dueDate >= today && dueDate <= nextWeek) {
            upcomingDeadlineTasks++;
        }
      }
    });
  });

  const completionRate = totalTasks ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const projectProgressData = projects.map(p => ({
    name: p.title.substring(0, 15) + '...',
    progress: p.progress
  }));

  // Brand Colors
  const COLORS = ['#10B981', '#2563EB', '#CBD5E1']; // Eco Green, Brand Blue, Grey
  const pieData = [
    { name: 'Completed', value: completedTasks },
    { name: 'In Progress', value: inProgressTasks },
    { name: 'Pending', value: totalTasks - completedTasks - inProgressTasks },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-blue-50 rounded-xl text-hive-brand">
              <FolderKanbanIcon size={24} />
            </div>
            <span className="text-xs font-semibold text-hive-green bg-green-50 px-2 py-1 rounded-full">{totalProjects} Total</span>
          </div>
          <h3 className="text-gray-500 text-sm font-medium font-sans">Active Projects</h3>
          <p className="text-3xl font-bold text-hive-dark mt-1 font-heading">{activeProjects}</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-green-50 rounded-xl text-hive-green">
              <CheckCircle2 size={24} />
            </div>
          </div>
          <h3 className="text-gray-500 text-sm font-medium font-sans">Task Completion</h3>
          <p className="text-3xl font-bold text-hive-dark mt-1 font-heading">{completionRate}%</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-blue-50 rounded-xl text-blue-500">
              <Clock size={24} />
            </div>
          </div>
          <h3 className="text-gray-500 text-sm font-medium font-sans">Tasks In Progress</h3>
          <p className="text-3xl font-bold text-hive-dark mt-1 font-heading">{inProgressTasks}</p>
        </div>

         <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-gray-50 rounded-xl text-hive-dark">
              <Calendar size={24} />
            </div>
            <span className="text-xs font-semibold text-orange-600 bg-orange-50 px-2 py-1 rounded-full">Next 7 Days</span>
          </div>
          <h3 className="text-gray-500 text-sm font-medium font-sans">Upcoming Deadlines</h3>
          <p className="text-3xl font-bold text-hive-dark mt-1 font-heading">{upcomingDeadlineTasks}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Project Progress Chart */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm lg:col-span-2">
          <h2 className="text-lg font-bold text-hive-dark mb-6 font-heading">Project Progress Overview</h2>
          <div className="h-64">
             <ResponsiveContainer width="100%" height="100%">
                <BarChart data={projectProgressData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <XAxis type="number" domain={[0, 100]} hide />
                  <YAxis dataKey="name" type="category" width={120} tick={{fontSize: 12, fill: '#6b7280'}} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}} />
                  <Bar dataKey="progress" fill="#3B82F6" radius={[0, 4, 4, 0]} barSize={24} />
                </BarChart>
             </ResponsiveContainer>
          </div>
        </div>

        {/* Task Stats */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
           <h2 className="text-lg font-bold text-hive-dark mb-6 font-heading">Task Status</h2>
           <div className="h-48 relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                 <div className="text-center">
                    <span className="block text-2xl font-bold text-hive-dark font-heading">{totalTasks}</span>
                    <span className="text-xs text-gray-500 font-sans">Tasks</span>
                 </div>
              </div>
           </div>
           <div className="mt-4 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-hive-green"></span> Completed</span>
                <span className="font-semibold">{completedTasks}</span>
              </div>
              <div className="flex justify-between text-sm">
                 <span className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-hive-brand"></span> In Progress</span>
                 <span className="font-semibold">{inProgressTasks}</span>
              </div>
              <div className="flex justify-between text-sm">
                 <span className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-gray-300"></span> Pending</span>
                 <span className="font-semibold">{totalTasks - completedTasks - inProgressTasks}</span>
              </div>
           </div>
        </div>
      </div>

      {/* Recent Projects List */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-lg font-bold text-hive-dark font-heading">Active Projects</h2>
          <Link to="/projects" className="text-sm text-hive-brand font-medium hover:text-blue-700 transition-colors flex items-center gap-1">
            View All <ArrowRight size={16} />
          </Link>
        </div>
        <div className="divide-y divide-gray-50">
          {projects.slice(0, 3).map(project => (
            <Link key={project.id} to={`/projects/${project.id}`} className="block p-6 hover:bg-blue-50/30 transition-colors group">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-hive-dark font-heading group-hover:text-hive-brand transition-colors">{project.title}</h3>
                <span className="text-xs font-semibold bg-gray-100 text-gray-600 px-3 py-1 rounded-full">
                  {project.progress}% Done
                </span>
              </div>
              <p className="text-gray-500 text-sm mb-4 line-clamp-1 font-sans">{project.description}</p>
              <div className="w-full bg-gray-100 rounded-full h-2.5">
                <div 
                  className="bg-hive-brand h-2.5 rounded-full transition-all duration-500" 
                  style={{ width: `${project.progress}%` }}
                ></div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

// Helper icon component for this file
const FolderKanbanIcon = ({ size }: { size: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="M6 8h2"/><path d="M6 12h2"/><path d="M10 8h2"/><path d="M10 12h2"/><path d="M14 8h2"/><path d="M14 12h2"/></svg>
);

export default Dashboard;

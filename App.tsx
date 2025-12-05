
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import ProjectList from './components/ProjectList';
import ProjectDetail from './components/ProjectDetail';
import CalendarView from './components/CalendarView';
import ImpactReport from './components/ImpactReport';
import QuickTaskModal from './components/QuickTaskModal';
import { Project, TaskStatus, TaskPriority, Task } from './types';

// Mock Data
const MOCK_PROJECTS: Project[] = [
  {
    id: '1',
    title: 'Clean Water Initiative',
    description: 'Providing clean drinking water to 5 rural villages through well construction and filtration systems.',
    startDate: '2023-10-01',
    endDate: '2024-03-01',
    progress: 65,
    tasks: [
      { 
        id: 't1', 
        title: 'Site Survey', 
        assignee: 'Alice M.', 
        assigneeAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150',
        status: TaskStatus.DONE, 
        priority: TaskPriority.HIGH, 
        dueDate: '2023-10-15',
        createdAt: '2023-10-01'
      },
      { 
        id: 't2', 
        title: 'Procure Materials', 
        assignee: 'Bob D.', 
        status: TaskStatus.DONE, 
        priority: TaskPriority.HIGH, 
        dueDate: '2023-11-01',
        createdAt: '2023-10-05'
      },
      { 
        id: 't3', 
        title: 'Community Training', 
        assignee: 'Charlie', 
        assigneeAvatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&q=80&w=150',
        status: TaskStatus.IN_PROGRESS, 
        priority: TaskPriority.MEDIUM, 
        dueDate: '2024-01-15',
        createdAt: '2023-12-01'
      },
      { 
        id: 't4', 
        title: 'Final Inspection', 
        assignee: 'Alice M.', 
        assigneeAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150',
        status: TaskStatus.TODO, 
        priority: TaskPriority.HIGH, 
        dueDate: '2024-02-28',
        createdAt: '2024-01-10'
      },
    ],
    documents: [
       { id: 'd1', name: 'Site_Map_v2.pdf', type: 'application/pdf', uploadDate: '2023-10-10' }
    ],
    kpi: { beneficiaries: 1200, volunteers: 15, budget: 50000 }
  },
  {
    id: '2',
    title: 'Education for All',
    description: 'After-school tutoring program for underprivileged children in the metro area.',
    startDate: '2024-01-10',
    endDate: '2024-12-20',
    progress: 30,
    tasks: [
      { 
        id: 't5', 
        title: 'Recruit Tutors', 
        assignee: 'Sarah J.', 
        assigneeAvatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=150',
        status: TaskStatus.DONE, 
        priority: TaskPriority.HIGH, 
        dueDate: '2024-01-30',
        createdAt: '2024-01-12'
      },
      { 
        id: 't6', 
        title: 'Curriculum Design', 
        assignee: 'Mike T.', 
        status: TaskStatus.IN_PROGRESS, 
        priority: TaskPriority.MEDIUM, 
        dueDate: '2024-02-15',
        createdAt: '2024-01-15'
      },
    ],
    documents: [],
    kpi: { beneficiaries: 350, volunteers: 40, budget: 15000 }
  },
    {
    id: '3',
    title: 'Urban Garden Project',
    description: 'Creating sustainable food sources in urban centers using rooftop gardens.',
    startDate: '2024-03-01',
    endDate: '2024-09-30',
    progress: 10,
    tasks: [
      { 
        id: 't7', 
        title: 'Location Scouting', 
        assignee: 'Dave', 
        status: TaskStatus.IN_PROGRESS, 
        priority: TaskPriority.MEDIUM, 
        dueDate: '2024-03-20',
        createdAt: '2024-03-02'
      },
    ],
    documents: [],
    kpi: { beneficiaries: 500, volunteers: 25, budget: 20000 }
  }
];

const App: React.FC = () => {
  // Initialize from LocalStorage or fall back to MOCK_PROJECTS
  const [projects, setProjects] = useState<Project[]>(() => {
    const saved = localStorage.getItem('projectHive_data');
    return saved ? JSON.parse(saved) : MOCK_PROJECTS;
  });

  const [isQuickTaskOpen, setIsQuickTaskOpen] = useState(false);

  // Persistence Effect
  useEffect(() => {
    localStorage.setItem('projectHive_data', JSON.stringify(projects));
  }, [projects]);

  const addProject = (project: Project) => {
    setProjects([project, ...projects]);
  };

  const updateProject = (updatedProject: Project) => {
    setProjects(projects.map(p => p.id === updatedProject.id ? updatedProject : p));
  };

  const deleteProject = (id: string) => {
    setProjects(projects.filter(p => p.id !== id));
  };

  const handleQuickTaskCreate = (projectId: string, task: Task) => {
    const project = projects.find(p => p.id === projectId);
    if (!project) return;

    const updatedTasks = [...project.tasks, task];
    
    // Recalculate progress logic if needed, but adding a TODO task usually decreases percentage
    const completed = updatedTasks.filter(t => t.status === TaskStatus.DONE).length;
    const progress = Math.round((completed / updatedTasks.length) * 100);

    const updatedProject = { ...project, tasks: updatedTasks, progress };
    updateProject(updatedProject);
  };

  return (
    <HashRouter>
      <Layout onQuickTask={() => setIsQuickTaskOpen(true)}>
        <Routes>
          <Route path="/" element={<Dashboard projects={projects} />} />
          <Route path="/projects" element={<ProjectList projects={projects} addProject={addProject} />} />
          <Route path="/projects/:id" element={<ProjectDetail projects={projects} updateProject={updateProject} deleteProject={deleteProject} />} />
          <Route path="/calendar" element={<CalendarView projects={projects} updateProject={updateProject} />} />
          <Route path="/impact" element={<ImpactReport projects={projects} />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
      
      <QuickTaskModal 
        isOpen={isQuickTaskOpen} 
        onClose={() => setIsQuickTaskOpen(false)}
        projects={projects}
        onCreate={handleQuickTaskCreate}
      />
    </HashRouter>
  );
};

export default App;

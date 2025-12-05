
export enum TaskStatus {
  TODO = 'To Do',
  IN_PROGRESS = 'In Progress',
  DONE = 'Done'
}

export enum TaskPriority {
  LOW = 'Low',
  MEDIUM = 'Medium',
  HIGH = 'High'
}

export interface Task {
  id: string;
  title: string;
  assignee: string; // Simplified for demo (name)
  assigneeAvatar?: string; // URL to image
  dueDate: string; // ISO date string
  createdAt?: string; // ISO date string
  status: TaskStatus;
  priority: TaskPriority;
}

export interface Document {
  id: string;
  name: string;
  type: string;
  uploadDate: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  tasks: Task[];
  documents: Document[];
  progress: number; // 0-100
  kpi: {
    beneficiaries: number;
    volunteers: number;
    budget: number;
  };
}

export interface Event {
  id: string;
  title: string;
  date: string;
  type: 'Workshop' | 'Field Work' | 'Meeting' | 'Fundraiser';
  projectId?: string;
}

export interface ImpactStat {
  name: string;
  value: number;
  target: number;
  unit: string;
}

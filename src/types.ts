export interface Routine {
  id: string;
  title: string;
  description: string;
  category: 'physical' | 'mental' | 'nutrition' | 'habit';
  frequency: 'daily' | 'weekly';
  completed: boolean;
  streak: number;
}

export interface UserProgress {
  date: string;
  completionRate: number;
}

export interface Message {
  role: 'user' | 'model';
  content: string;
  timestamp: number;
}

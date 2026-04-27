export interface UserProfile {
  name: string;
  age?: number;
  weight?: number;
  height?: number;
  gender?: string;
  activityLevel?: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
  dailyCalorieTarget?: number;
  level?: number;
  experience?: number;
  onboarded: boolean;
}

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

export interface UserGoal {
  id?: string;
  type: 'weight' | 'water' | 'sleep' | 'steps';
  target: number;
  current: number;
  unit: string;
}

export interface HealthInsight {
  id?: string;
  content: string;
  timestamp: number;
  category?: string;
}

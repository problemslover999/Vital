import { Routine, UserGoal, UserProgress } from '../types';

/**
 * Vitality Engine
 * Centralized logic for calculating health metrics and progression.
 * Moves complexity out of the UI and into a testable service layer.
 */

export function calculateVitalityScore(routines: Routine[], goals: UserGoal[]): number {
  if (routines.length === 0 && goals.length === 0) return 0;

  // 1. Completion Rate (60% weight)
  const completedRoutines = routines.filter(r => r.completed).length;
  const completionRate = routines.length > 0 ? (completedRoutines / routines.length) * 100 : 0;

  // 2. Goal Progress (40% weight)
  const goalProgress = goals.length > 0 
    ? (goals.reduce((acc, g) => acc + (Math.min(1, g.current / g.target)), 0) / goals.length) * 100 
    : 0;

  // 3. Streak Bonus (Analytical enhancement)
  const streakBonus = routines.reduce((acc, r) => acc + (r.streak > 5 ? 2 : r.streak > 0 ? 1 : 0), 0);
  
  const baseScore = (completionRate * 0.6) + (goalProgress * 0.4);
  return Math.min(100, Math.round(baseScore + (streakBonus / 2)));
}

export function calculateExperienceGained(routines: Routine[], goals: UserGoal[]): number {
  let xp = 0;
  
  // Routines give 10 XP each
  xp += routines.filter(r => r.completed).length * 10;
  
  // Goals give XP based on progress
  goals.forEach(g => {
    if (g.current >= g.target) xp += 25; // Goal reached
    else if (g.current > 0) xp += 5; // Partial progress
  });

  return xp;
}

export function getLevelFromXP(xp: number): number {
  // Simple leveling formula: level = floor(sqrt(xp / 100)) + 1
  return Math.floor(Math.sqrt(xp / 100)) + 1;
}

export function formatProgressDate(date: Date = new Date()): string {
  // Returns YYYY-MM-DD for stable Firestore document IDs
  return date.toISOString().split('T')[0];
}

export function getWeeklyTrend(history: UserProgress[]): 'up' | 'down' | 'stable' {
  if (history.length < 2) return 'stable';
  
  const last = history[history.length - 1].completionRate;
  const previous = history[history.length - 2].completionRate;
  
  if (last > previous + 5) return 'up';
  if (last < previous - 5) return 'down';
  return 'stable';
}

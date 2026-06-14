import Dexie from 'dexie';

export const db = new Dexie('FitnessTrackerDB');

db.version(5).stores({
  workouts: '++id, date, duration, totalSets, totalWeight, calories',
  sets: '++id, workoutId, exerciseName, reps, weight, setCount',
  users: '++id, email, name, gender, primaryGoal, musicApp, goalCalories, goalProtein, goalFiber, goalWater',
  food_logs: '++id, date, name, amount, calories, protein, fiber',
  water_logs: '++id, date, amountMl',
  settings: '++id, focusModeEnabled',
  weekly_plan: 'day, title, exercises',
  body_weight_logs: '++id, date, weight'
});

import { useState, useEffect, useRef } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import { Plus, X, Edit2, Check } from 'lucide-react';

const DEFAULT_WEEKLY_PLAN = [
  { day: 'Monday', title: 'Chest & Triceps', exercises: ['Bench Press', 'Incline Dumbbell Press', 'Tricep Pushdown'] },
  { day: 'Tuesday', title: 'Back & Biceps', exercises: ['Pull Ups', 'Barbell Row', 'Bicep Curls'] },
  { day: 'Wednesday', title: 'Active Recovery', exercises: ['Light Cardio', 'Yoga Flow'] },
  { day: 'Thursday', title: 'Legs & Core', exercises: ['Squats', 'Leg Press', 'Plank'] },
  { day: 'Friday', title: 'Shoulders & Arms', exercises: ['Overhead Press', 'Lateral Raises', 'Hammer Curls'] },
  { day: 'Saturday', title: 'Full Body Power', exercises: ['Deadlifts', 'Clean and Press'] },
  { day: 'Sunday', title: 'Rest Day', exercises: ['Mobility Work'] },
];

const COMMON_EXERCISES = [
  'Bench Press', 'Incline Dumbbell Press', 'Tricep Pushdown', 'Pull Ups', 'Barbell Row', 'Bicep Curls',
  'Light Cardio', 'Yoga Flow', 'Squats', 'Leg Press', 'Plank', 'Overhead Press', 'Lateral Raises', 
  'Hammer Curls', 'Deadlifts', 'Clean and Press', 'Mobility Work', 'Push Ups', 'Lunges', 'Calf Raises',
  'Lat Pulldown', 'Cable Crossover', 'Leg Extension', 'Leg Curl', 'Russian Twists', 'Burpees'
];

export default function Planner({ onStartWorkout }) {
  const [selectedDay, setSelectedDay] = useState(new Date().toLocaleDateString('en-US', { weekday: 'long' }));
  const [isEditing, setIsEditing] = useState(false);
  const [newExercise, setNewExercise] = useState('');
  const [suggestions, setSuggestions] = useState([]);

  const plans = useLiveQuery(() => db.weekly_plan.toArray());
  const pastSets = useLiveQuery(() => db.sets.toArray()) || [];

  // Initialize DB with defaults if empty
  useEffect(() => {
    if (plans !== undefined && plans.length === 0) {
      db.weekly_plan.bulkAdd(DEFAULT_WEEKLY_PLAN);
    }
  }, [plans]);

  const currentPlan = plans?.find(p => p.day === selectedDay) || DEFAULT_WEEKLY_PLAN.find(p => p.day === selectedDay);

  const handleTitleChange = async (e) => {
    if (currentPlan) {
      await db.weekly_plan.update(currentPlan.day, { title: e.target.value });
    }
  };

  const handleExerciseInput = (value) => {
    setNewExercise(value);
    if (!value.trim()) {
      setSuggestions([]);
      return;
    }
    
    // Build suggestion dictionary
    const pastExercises = new Set(pastSets.map(s => s.exerciseName));
    const allKnown = Array.from(new Set([...COMMON_EXERCISES, ...pastExercises]));
    
    const matches = allKnown.filter(ex => ex.toLowerCase().includes(value.toLowerCase()) && !currentPlan?.exercises?.includes(ex));
    setSuggestions(matches.slice(0, 5)); // show top 5
  };

  const selectSuggestion = (suggestion) => {
    setNewExercise(suggestion);
    setSuggestions([]);
  };

  const handleAddExercise = async () => {
    if (!newExercise.trim()) return;
    const updatedExercises = [...(currentPlan?.exercises || []), newExercise];
    if (currentPlan) {
      await db.weekly_plan.update(currentPlan.day, { exercises: updatedExercises });
    }
    setNewExercise('');
    setSuggestions([]);
  };

  const handleRemoveExercise = async (exerciseToRemove) => {
    const updatedExercises = currentPlan.exercises.filter(ex => ex !== exerciseToRemove);
    if (currentPlan) {
      await db.weekly_plan.update(currentPlan.day, { exercises: updatedExercises });
    }
  };

  if (!plans) return null;

  return (
    <div className="page-transition flex-col">
      <div className="flex-between" style={{ marginBottom: '1rem' }}>
        <h2 style={{ margin: 0 }}>Weekly Plan</h2>
        <button onClick={() => setIsEditing(!isEditing)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)' }}>
          {isEditing ? <Check size={20} /> : <Edit2 size={20} />}
        </button>
      </div>

      <div style={{ display: 'flex', overflowX: 'auto', gap: '0.5rem', paddingBottom: '1rem', scrollbarWidth: 'none' }}>
        {DEFAULT_WEEKLY_PLAN.map(plan => (
          <button 
            key={plan.day}
            className={selectedDay === plan.day ? 'btn-primary' : ''}
            style={{ padding: '0.5rem 1rem', whiteSpace: 'nowrap', borderRadius: '20px' }}
            onClick={() => setSelectedDay(plan.day)}
          >
            {plan.day.substring(0, 3)}
          </button>
        ))}
      </div>

      <div className="card page-transition">
        {isEditing ? (
          <input 
            value={currentPlan?.title || ''} 
            onChange={handleTitleChange} 
            style={{ marginBottom: '0.5rem', fontSize: '1.2rem', fontWeight: 600, padding: '0.5rem', width: '100%', background: 'var(--bg-color)' }}
          />
        ) : (
          <h3 style={{ marginBottom: '0.5rem' }}>{currentPlan?.title}</h3>
        )}

        <p className="text-muted" style={{ marginBottom: '1.5rem', fontSize: '0.9rem' }}>
          {selectedDay}'s prescribed routine.
        </p>

        <div className="flex-col" style={{ gap: '1rem' }}>
          {currentPlan?.exercises?.map((exercise, idx) => (
            <div key={idx} className="flex-between" style={{ padding: '1rem', backgroundColor: 'var(--bg-color)', borderRadius: '8px' }}>
              <span style={{ fontWeight: 500 }}>{exercise}</span>
              {isEditing && (
                <button onClick={() => handleRemoveExercise(exercise)} style={{ padding: 0, background: 'none', border: 'none', color: 'var(--text-secondary)' }}>
                  <X size={18} />
                </button>
              )}
            </div>
          ))}

          {isEditing && (
            <div style={{ position: 'relative', marginTop: '0.5rem' }}>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input 
                  value={newExercise} 
                  onChange={e => handleExerciseInput(e.target.value)} 
                  placeholder="New exercise..." 
                  style={{ flex: 1, padding: '0.8rem' }}
                />
                <button className="btn-primary" onClick={handleAddExercise} style={{ padding: '0.8rem' }}>
                  <Plus size={20} />
                </button>
              </div>
              
              {/* Autocomplete Dropdown */}
              {suggestions.length > 0 && (
                <div style={{ position: 'absolute', top: '100%', left: 0, right: '50px', background: 'var(--surface-color)', border: '1px solid var(--border-color)', borderRadius: '0 0 8px 8px', zIndex: 10, marginTop: '4px', overflow: 'hidden' }}>
                  {suggestions.map((suggestion, idx) => (
                    <div 
                      key={idx} 
                      onClick={() => selectSuggestion(suggestion)}
                      style={{ padding: '0.8rem 1rem', cursor: 'pointer', borderBottom: idx < suggestions.length - 1 ? '1px solid var(--bg-color)' : 'none' }}
                    >
                      {suggestion}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {!isEditing && (
          <button className="btn-primary" style={{ width: '100%', marginTop: '2rem', padding: '1rem' }} onClick={() => onStartWorkout(currentPlan?.exercises || [])}>
            Start Workout
          </button>
        )}
      </div>
    </div>
  );
}

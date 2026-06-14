import { useState, useEffect } from 'react';
import { db } from '../db/db';
import { useLiveQuery } from 'dexie-react-hooks';
import { Play, Square, Save, X, Settings2, Menu, Music, ArrowRight } from 'lucide-react';
import { Reorder, motion } from 'framer-motion';
import WaterReminder from '../components/WaterReminder';

export default function LogWorkout({ plannedExercises, onSuccess, user }) {
  const [isTracking, setIsTracking] = useState(false);
  const [duration, setDuration] = useState(0); 
  const [targetDuration, setTargetDuration] = useState(60 * 60); 
  const [showTimerSettings, setShowTimerSettings] = useState(false);
  const [sets, setSets] = useState([]);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [currentSetNumber, setCurrentSetNumber] = useState(1);

  const currentDay = new Date().toLocaleDateString('en-US', { weekday: 'long' });
  const plans = useLiveQuery(() => db.weekly_plan.toArray());

  // Pre-fill sets from plan or default
  useEffect(() => {
    if (plannedExercises && plannedExercises.length > 0) {
      setSets(plannedExercises.map((ex, i) => ({ id: Date.now() + i, exercise: ex, setCount: 3 })));
    } else if (plans && sets.length === 0) {
      const todaysPlan = plans.find(p => p.day === currentDay);
      if (todaysPlan && todaysPlan.exercises && todaysPlan.exercises.length > 0) {
        setSets(todaysPlan.exercises.map((ex, i) => ({ id: Date.now() + i, exercise: ex, setCount: 3 })));
      } else {
        setSets([{ id: Date.now(), exercise: 'Squat', setCount: 3 }]);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [plannedExercises, plans]);

  useEffect(() => {
    let interval;
    if (isTracking) {
      interval = setInterval(() => {
        setDuration(d => d + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTracking]);

  const addSet = () => {
    const lastSet = sets[sets.length - 1];
    setSets([...sets, { 
      id: Date.now(), 
      exercise: lastSet ? lastSet.exercise : 'New Exercise', 
      setCount: 3 
    }]);
  };

  const updateSet = (id, field, value) => {
    setSets(sets.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const removeSet = (id) => {
    if (sets.length > 1) {
      setSets(sets.filter(s => s.id !== id));
      if (currentExerciseIndex >= sets.length - 1) {
        setCurrentExerciseIndex(Math.max(0, sets.length - 2));
        setCurrentSetNumber(1);
      }
    }
  };

  const handleNext = () => {
    const currentExercise = sets[currentExerciseIndex];
    if (currentSetNumber < currentExercise.setCount) {
      // Move to next set of the same exercise
      setCurrentSetNumber(currentSetNumber + 1);
    } else if (currentExerciseIndex < sets.length - 1) {
      // Move to next exercise, set 1
      setCurrentExerciseIndex(currentExerciseIndex + 1);
      setCurrentSetNumber(1);
    }
  };

  const isFinished = () => {
    if (sets.length === 0) return true;
    return currentExerciseIndex === sets.length - 1 && currentSetNumber >= sets[currentExerciseIndex].setCount;
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const saveWorkout = async () => {
    const totalSets = sets.reduce((acc, set) => acc + Number(set.setCount), 0);
    const calories = Math.round((duration / 60) * 8); 
    
    const workoutId = await db.workouts.add({
      date: new Date().toISOString(),
      duration,
      totalSets,
      calories
    });

    for (const set of sets) {
      await db.sets.add({
        workoutId,
        exerciseName: set.exercise,
        setCount: Number(set.setCount)
      });
    }
    
    setIsTracking(false);
    setDuration(0);
    setCurrentExerciseIndex(0);
    setCurrentSetNumber(1);
    onSuccess();
  };

  const progress = Math.min((duration / targetDuration) * 100, 100);
  const radius = 90;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;


  return (
    <div className="page-transition flex-col">
      <div className="card flex-col" style={{ alignItems: 'center', position: 'relative' }}>
        
        <button 
          style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', color: 'var(--text-secondary)' }}
          onClick={() => setShowTimerSettings(!showTimerSettings)}
        >
          <Settings2 size={20} />
        </button>

        {showTimerSettings && (
          <div style={{ position: 'absolute', top: '3rem', right: '1rem', background: 'var(--bg-color)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)', zIndex: 10 }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem' }}>Target Time (mins)</label>
            <input 
              type="number" 
              value={targetDuration / 60} 
              onChange={(e) => setTargetDuration(Number(e.target.value) * 60)} 
              style={{ width: '80px', padding: '0.5rem' }}
            />
          </div>
        )}

        {isTracking && sets.length > 0 && currentExerciseIndex < sets.length && (
          <h2 className="breathing" style={{ fontSize: '1.2rem', marginBottom: '1.5rem', color: 'var(--text-primary)', textAlign: 'center' }}>
            {sets[currentExerciseIndex].exercise} <br/>
            <span style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', fontWeight: 'normal' }}>Set {currentSetNumber} of {sets[currentExerciseIndex].setCount}</span>
          </h2>
        )}

        <div className={`timer-container ${isTracking ? 'breathing' : ''}`} style={{ position: 'relative', width: '220px', height: '220px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>          <svg width="220" height="220" viewBox="0 0 200 200" style={{ transform: 'rotate(-90deg)', position: 'absolute' }}>
            <circle 
              cx="100" cy="100" r={radius} 
              fill="none" 
              stroke="var(--border-color)" 
              strokeWidth="8" 
            />
            <circle 
              cx="100" cy="100" r={radius} 
              fill="none" 
              stroke="var(--text-primary)" 
              strokeWidth="8" 
              strokeLinecap="round"
              style={{
                strokeDasharray: circumference,
                strokeDashoffset: strokeDashoffset,
                transition: 'stroke-dashoffset 1s linear'
              }}
            />
          </svg>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <h1 style={{ fontSize: '3rem', margin: 0, fontWeight: 700, letterSpacing: '-0.05em' }}>{formatTime(duration)}</h1>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              Goal: {targetDuration / 60}m
            </span>
          </div>
        </div>
        
        {!isTracking ? (
          <button className="btn-primary" style={{ width: '100%', marginTop: '1.5rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', padding: '1rem' }} onClick={() => setIsTracking(true)}>
            <Play size={20} fill="currentColor" /> Start Workout
          </button>
        ) : (
          <div className="flex-between" style={{ width: '100%', gap: '1rem', marginTop: '1.5rem' }}>
            <button style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', padding: '1rem' }} onClick={() => setIsTracking(false)}>
              <Square size={20} fill="currentColor" /> Pause
            </button>
            {!isFinished() ? (
              <button className="btn-primary" style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', padding: '1rem' }} onClick={handleNext}>
                Next Set <ArrowRight size={18} />
              </button>
            ) : (
              <button className="btn-primary" style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', padding: '1rem' }} onClick={saveWorkout}>
                <Save size={20} /> Finish
              </button>
            )}
          </div>
        )}
      </div>

      <div className="card flex-col">
        <div className="flex-between">
          <h3 style={{ margin: 0 }}>Exercises</h3>
          <button onClick={addSet} style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', borderRadius: '20px' }}>+ Add Exercise</button>
        </div>
        
        <Reorder.Group 
          axis="y" 
          values={sets} 
          onReorder={setSets} 
          style={{ listStyleType: 'none', padding: 0, margin: '0.5rem 0 0 0', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}
        >
          {sets.map((set, idx) => (
            <Reorder.Item 
              key={set.id} 
              value={set} 
              style={{ 
                cursor: isTracking ? 'default' : 'grab',
                display: 'grid', 
                gridTemplateColumns: '20px 1fr 50px 20px', 
                gap: '0.75rem', 
                alignItems: 'center', 
                backgroundColor: 'var(--bg-color)', 
                padding: '0.75rem', 
                borderRadius: '8px', 
                border: idx === currentExerciseIndex && isTracking ? '1px solid var(--text-primary)' : '1px solid transparent' 
              }}
              dragListener={!isTracking}
            >
              
              {/* Drag Handle */}
              <div style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center' }}>
                <Menu size={18} />
              </div>

              {/* Exercise Name Input */}
              <input 
                value={set.exercise} 
                onChange={e => updateSet(set.id, 'exercise', e.target.value)} 
                placeholder="Exercise"
                disabled={isTracking}
                style={{ padding: '0.4rem', border: 'none', background: 'transparent', fontWeight: 500 }}
              />

              {/* Sets Input */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <input 
                  type="number" 
                  value={set.setCount} 
                  onChange={e => updateSet(set.id, 'setCount', e.target.value)} 
                  disabled={isTracking}
                  style={{ width: '100%', padding: '0.4rem', textAlign: 'center', border: 'none', background: 'var(--surface-color)', borderRadius: '4px', fontWeight: 'bold' }}
                />
              </div>

              {/* Remove Set */}
              <button 
                onClick={() => removeSet(set.id)} 
                style={{ padding: '0', background: 'transparent', border: 'none', color: 'var(--text-secondary)' }}
                disabled={sets.length === 1 || isTracking}
              >
                <X size={18} />
              </button>

            </Reorder.Item>
          ))}
        </Reorder.Group>
      </div>

      <style>{`
        .breathing {
          animation: breathing 3s ease-in-out infinite;
        }
        @keyframes breathing {
          0% { transform: scale(1); }
          50% { transform: scale(1.03); }
          100% { transform: scale(1); }
        }
      `}</style>

      {!isTracking && <WaterReminder />}
    </div>
  );
}

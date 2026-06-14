import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import { ChevronDown, ChevronUp } from 'lucide-react';

export default function History() {
  const [expandedWorkoutId, setExpandedWorkoutId] = useState(null);
  const workouts = useLiveQuery(() => db.workouts.orderBy('date').reverse().toArray());
  const allSets = useLiveQuery(() => db.sets.toArray());

  const toggleWorkout = (id) => {
    setExpandedWorkoutId(prev => prev === id ? null : id);
  };

  return (
    <div className="page-transition flex-col">
      <h2 style={{ marginBottom: '1.5rem' }}>History</h2>
      {!workouts || workouts.length === 0 ? (
        <div className="text-muted" style={{ textAlign: 'center', padding: '2rem' }}>
          No past workouts.
        </div>
      ) : (
        workouts.map(workout => {
          const workoutSets = (allSets || []).filter(s => s.workoutId === workout.id);
          const workoutType = workoutSets.length > 0 ? workoutSets[0].exerciseName : 'Custom Workout';
          const isExpanded = expandedWorkoutId === workout.id;

          return (
            <div 
              key={workout.id} 
              className="card" 
              style={{ padding: '1rem', cursor: 'pointer', transition: 'background-color 0.2s' }}
              onClick={() => toggleWorkout(workout.id)}
            >
              <div className="flex-between" style={{ marginBottom: '0.5rem' }}>
                <strong style={{ fontSize: '1.1rem' }}>
                  {new Date(workout.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                </strong>
                <span className="text-muted" style={{ fontWeight: 500 }}>
                  {Math.round(workout.duration / 60)} min
                </span>
              </div>
              <div className="flex-between text-muted" style={{ fontSize: '0.9rem' }}>
                <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{workoutType}</span>
                <span>🔥 {workout.calories || 0} kcal</span>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'center', marginTop: '0.5rem', color: 'var(--text-secondary)' }}>
                {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </div>

              {isExpanded && (
                <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
                  <h4 style={{ marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Workout Details</h4>
                  {workoutSets.length === 0 ? (
                    <p className="text-muted" style={{ fontSize: '0.85rem' }}>No specific sets logged.</p>
                  ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                      <thead>
                        <tr style={{ color: 'var(--text-secondary)', textAlign: 'left', borderBottom: '1px solid var(--border-color)' }}>
                          <th style={{ paddingBottom: '0.5rem', fontWeight: 500 }}>Exercise</th>
                          <th style={{ paddingBottom: '0.5rem', fontWeight: 500, textAlign: 'center' }}>Sets</th>
                        </tr>
                      </thead>
                      <tbody>
                        {workoutSets.map((set, idx) => (
                          <tr key={idx} style={{ borderBottom: '1px solid var(--bg-color)' }}>
                            <td style={{ padding: '0.5rem 0' }}>{set.exerciseName}</td>
                            <td style={{ padding: '0.5rem 0', textAlign: 'center' }}>{set.setCount}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}

import { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from './db/db';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import LogWorkout from './pages/LogWorkout';
import History from './pages/History';
import Onboarding from './pages/Onboarding';
import LoadingScreen from './components/LoadingScreen';
import FoodLogger from './pages/FoodLogger';
import Planner from './pages/Planner';
import WaterReminder from './components/WaterReminder';
import './index.css';

function App() {
  const [currentTab, setCurrentTab] = useState('log');
  const [isInitializing, setIsInitializing] = useState(true);
  const [plannedExercises, setPlannedExercises] = useState(null);

  const users = useLiveQuery(() => db.users.toArray());

  useEffect(() => {
    if (users !== undefined) {
      // Extended slightly to show off the cool water bottle animation
      const timer = setTimeout(() => setIsInitializing(false), 2500);
      return () => clearTimeout(timer);
    }
  }, [users]);

  if (isInitializing || users === undefined) {
    return <LoadingScreen />;
  }

  if (users.length === 0) {
    return <Onboarding onComplete={() => window.location.reload()} />;
  }

  const handleStartWorkout = (exercises) => {
    setPlannedExercises(exercises);
    setCurrentTab('log');
  };

  return (
    <>
      <Layout currentTab={currentTab} setCurrentTab={setCurrentTab}>
        <div style={{ display: currentTab === 'dashboard' ? 'block' : 'none' }}>
          <Dashboard user={users[0]} />
        </div>
        <div style={{ display: currentTab === 'plan' ? 'block' : 'none' }}>
          <Planner onStartWorkout={handleStartWorkout} />
        </div>
        <div style={{ display: currentTab === 'food' ? 'block' : 'none' }}>
          <FoodLogger />
        </div>
        <div style={{ display: currentTab === 'log' ? 'block' : 'none' }}>
          <LogWorkout plannedExercises={plannedExercises} onSuccess={() => setCurrentTab('dashboard')} user={users[0]} />
        </div>
        <div style={{ display: currentTab === 'history' ? 'block' : 'none' }}>
          <History />
        </div>
      </Layout>
    </>
  );
}

export default App;

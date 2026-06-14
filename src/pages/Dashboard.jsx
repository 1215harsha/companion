import { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area, ReferenceLine } from 'recharts';
import { Weight, Plus, Settings2, X } from 'lucide-react';

const CustomTooltip = ({ active, payload, label, metric }) => {
  if (active && payload && payload.length) {
    const value = payload[0].value;
    let unit = '';
    if (metric === 'duration') unit = 'mins';
    else if (metric === 'calories' || metric === 'caloriesBurned') unit = 'kcal';
    else if (metric === 'protein' || metric === 'fiber') unit = 'g';
    else if (metric === 'water') unit = 'ml';
    else if (metric === 'bodyWeight') unit = 'kg';

    return (
      <div style={{ backgroundColor: 'var(--surface-color)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '0.5rem 1rem', color: 'var(--text-primary)' }}>
        <p style={{ margin: 0, fontWeight: 600 }}>{label}</p>
        <p style={{ margin: 0, color: 'var(--text-secondary)' }}>
          {value} {unit}
        </p>
      </div>
    );
  }
  return null;
};

export default function Dashboard({ user }) {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [expandedMetric, setExpandedMetric] = useState(null); 
  const [showWeightModal, setShowWeightModal] = useState(false);
  const [newWeight, setNewWeight] = useState('');
  
  const [showEditGoals, setShowEditGoals] = useState(false);
  const [editGoals, setEditGoals] = useState({
    goalWeight: user?.goalWeight || '',
    goalCalories: user?.goalCalories || '',
    goalProtein: user?.goalProtein || '',
    primaryGoal: user?.primaryGoal || 'general',
    geminiKey: ''
  });

  const settingsData = useLiveQuery(() => db.settings.toArray());

  useEffect(() => {
    if (settingsData && settingsData.length > 0) {
      setEditGoals(prev => ({ ...prev, geminiKey: settingsData[0].geminiKey || '' }));
    }
  }, [settingsData]);

  const [showGraphConfig, setShowGraphConfig] = useState(false);
  const [graphConfig, setGraphConfig] = useState({
    metric: 'bodyWeight',
    chartType: 'AreaChart'
  });

  // Default the main graph if the user's primary goal is to burn calories
  useEffect(() => {
    if (user?.primaryGoal === 'burnCalories') {
      setGraphConfig(prev => ({ ...prev, metric: 'caloriesBurned' }));
    }
  }, [user?.primaryGoal]);

  useEffect(() => {
    const userAgent = window.navigator.userAgent.toLowerCase();
    setIsIOS(/iphone|ipad|ipod/.test(userAgent));
    setIsStandalone(window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true);

    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    }
  };

  const workouts = useLiveQuery(() => db.workouts.orderBy('date').toArray());
  const foodLogs = useLiveQuery(() => db.food_logs.orderBy('date').toArray());
  const waterLogs = useLiveQuery(() => db.water_logs.orderBy('date').toArray());
  const weightLogs = useLiveQuery(() => db.body_weight_logs.orderBy('date').toArray());

  // Aggregate today's nutrition & workouts
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const todaysFood = (foodLogs || []).filter(f => new Date(f.date) >= todayStart);
  const todaysWater = (waterLogs || []).filter(w => new Date(w.date) >= todayStart);
  const todaysWorkouts = (workouts || []).filter(w => new Date(w.date) >= todayStart);

  const totalCaloriesIn = todaysFood.reduce((acc, curr) => acc + curr.calories, 0);
  const totalProtein = todaysFood.reduce((acc, curr) => acc + curr.protein, 0);
  const totalFiber = todaysFood.reduce((acc, curr) => acc + curr.fiber, 0);
  const totalWater = todaysWater.reduce((acc, curr) => acc + curr.amountMl, 0);
  const totalCaloriesBurned = todaysWorkouts.reduce((acc, curr) => acc + (curr.calories || 0), 0);

  const handleLogWeight = async () => {
    if (!newWeight) return;
    await db.body_weight_logs.add({
      date: new Date().toISOString(),
      weight: Number(newWeight)
    });
    setNewWeight('');
    setShowWeightModal(false);
  };

  const handleSaveGoals = async () => {
    if (user?.id) {
      await db.users.update(user.id, {
        goalWeight: Number(editGoals.goalWeight),
        goalCalories: Number(editGoals.goalCalories),
        goalProtein: Number(editGoals.goalProtein),
        primaryGoal: editGoals.primaryGoal
      });
    }
    
    if (settingsData && settingsData.length > 0) {
      await db.settings.update(settingsData[0].id, {
        geminiKey: editGoals.geminiKey
      });
    } else {
      await db.settings.add({
        geminiKey: editGoals.geminiKey,
        focusModeEnabled: false
      });
    }
    
    setShowEditGoals(false);
  };

  const handleReset = async () => {
    if (window.confirm("Are you sure you want to delete your profile and start over?")) {
      await db.users.clear();
      window.location.reload();
    }
  };

  const toggleGraph = (metric) => {
    setExpandedMetric(prev => prev === metric ? null : metric);
  };

  const getGraphData = (metric) => {
    const grouped = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      grouped[dateStr] = {
        calories: 0, protein: 0, fiber: 0, water: 0, caloriesBurned: 0, duration: 0, bodyWeight: 0
      };
    }

    let data = [];
    
    if (metric === 'calories' || metric === 'protein' || metric === 'fiber') {
      (foodLogs || []).forEach(log => {
        const d = new Date(log.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
        if (grouped[d]) grouped[d][metric] += log[metric] || 0;
      });
      data = Object.keys(grouped).map(date => ({ date, value: grouped[date][metric] }));
    } else if (metric === 'water') {
      (waterLogs || []).forEach(log => {
        const d = new Date(log.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
        if (grouped[d]) grouped[d].water += log.amountMl || 0;
      });
      data = Object.keys(grouped).map(date => ({ date, value: grouped[date].water }));
    } else if (metric === 'caloriesBurned' || metric === 'duration') {
      (workouts || []).forEach(log => {
        const d = new Date(log.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
        if (grouped[d]) {
          grouped[d].caloriesBurned += log.calories || 0;
          grouped[d].duration += log.duration || 0;
        }
      });
      data = Object.keys(grouped).map(date => ({ 
        date, 
        value: metric === 'duration' ? Math.round(grouped[date].duration / 60) : grouped[date].caloriesBurned 
      }));
    } else if (metric === 'bodyWeight') {
      const sortedWeight = [...(weightLogs || [])].sort((a,b) => new Date(a.date) - new Date(b.date));
      let lastWeight = user?.goalWeight || 70;
      if (sortedWeight.length > 0) lastWeight = sortedWeight[sortedWeight.length-1].weight;

      (weightLogs || []).forEach(w => {
        const d = new Date(w.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
        if (grouped[d]) grouped[d].bodyWeight = w.weight;
      });

      let currentCarry = sortedWeight.length > 0 ? sortedWeight[0].weight : lastWeight;
      data = Object.keys(grouped).map(date => {
        if (grouped[date].bodyWeight > 0) {
          currentCarry = grouped[date].bodyWeight;
        }
        return { date, value: currentCarry };
      });
    }
    return data;
  };

  const renderGenericChart = (data, metric, chartType, height = '200px') => {

    const color = "var(--text-primary)";
    let ChartComponent;

    switch (chartType) {
      case 'LineChart':
        ChartComponent = (
          <LineChart data={data}>
            <XAxis dataKey="date" stroke="var(--text-secondary)" tick={{fontSize: 12}} axisLine={false} tickLine={false} />
            <YAxis stroke="var(--text-secondary)" tick={{fontSize: 12}} axisLine={false} tickLine={false} width={40} />
            <Tooltip content={<CustomTooltip metric={metric} />} cursor={{stroke: 'var(--border-color)'}} />
            {metric === 'bodyWeight' && user?.goalWeight && (
              <ReferenceLine y={user.goalWeight} stroke="var(--text-secondary)" strokeDasharray="3 3" strokeWidth={1} label={{ position: 'insideTopLeft', value: `Goal: ${user.goalWeight} kg`, fill: 'var(--text-secondary)', fontSize: 12 }} />
            )}
            <Line type="monotone" dataKey="value" stroke={color} strokeWidth={3} dot={false} activeDot={{ r: 6 }} />
          </LineChart>
        );
        break;
      case 'AreaChart':
        ChartComponent = (
          <AreaChart data={data}>
            <defs>
              <linearGradient id={`colorValue-${metric}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.3}/>
                <stop offset="95%" stopColor={color} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <XAxis dataKey="date" stroke="var(--text-secondary)" tick={{fontSize: 12}} axisLine={false} tickLine={false} />
            <YAxis domain={metric === 'bodyWeight' ? ['dataMin - 2', 'dataMax + 2'] : [0, 'auto']} stroke="var(--text-secondary)" tick={{fontSize: 12}} axisLine={false} tickLine={false} width={40} />
            <Tooltip content={<CustomTooltip metric={metric} />} cursor={{stroke: 'var(--border-color)'}} />
            {metric === 'bodyWeight' && user?.goalWeight && (
              <ReferenceLine y={user.goalWeight} stroke="var(--text-secondary)" strokeDasharray="3 3" strokeWidth={1} label={{ position: 'insideTopLeft', value: `Goal: ${user.goalWeight} kg`, fill: 'var(--text-secondary)', fontSize: 12 }} />
            )}
            <Area type="monotone" dataKey="value" stroke={color} fillOpacity={1} fill={`url(#colorValue-${metric})`} strokeWidth={3} />
          </AreaChart>
        );
        break;
      case 'BarChart':
      default:
        ChartComponent = (
          <BarChart data={data}>
            <XAxis dataKey="date" stroke="var(--text-secondary)" tick={{fontSize: 12}} axisLine={false} tickLine={false} />
            <YAxis stroke="var(--text-secondary)" tick={{fontSize: 12}} axisLine={false} tickLine={false} width={40} />
            <Tooltip content={<CustomTooltip metric={metric} />} cursor={{fill: 'var(--bg-color)'}} />
            {metric === 'bodyWeight' && user?.goalWeight && (
              <ReferenceLine y={user.goalWeight} stroke="var(--text-secondary)" strokeDasharray="3 3" strokeWidth={1} label={{ position: 'insideTopLeft', value: `Goal: ${user.goalWeight} kg`, fill: 'var(--text-secondary)', fontSize: 12 }} />
            )}
            <Bar dataKey="value" fill={color} radius={[4, 4, 0, 0]} maxBarSize={40} />
          </BarChart>
        );
        break;
    }

    return (
      <div style={{ height, width: '100%', padding: '1rem 0' }} className="page-transition">
        <ResponsiveContainer width="100%" height="100%">
          {ChartComponent}
        </ResponsiveContainer>
      </div>
    );
  };

  const renderInlineGraph = (metric) => {
    const data = getGraphData(metric);
    // Use BarChart for inline metrics by default
    return renderGenericChart(data, metric, 'BarChart');
  };

  const mainGraphData = getGraphData(graphConfig.metric);

  const getMetricLabel = (key) => {
    const labels = {
      bodyWeight: 'Body Weight',
      calories: 'Calories Consumed',
      caloriesBurned: 'Calories Burned',
      protein: 'Protein Intake',
      fiber: 'Fiber Intake',
      water: 'Water Intake',
      duration: 'Workout Duration'
    };
    return labels[key] || key;
  };

  return (
    <div className="page-transition flex-col">
      <div className="flex-between" style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ margin: 0 }}>Iron Command Center</h2>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button 
            onClick={() => setShowEditGoals(true)}
            style={{ background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-primary)', padding: '0.5rem 1rem', borderRadius: '20px', fontSize: '0.85rem' }}
          >
            Edit Goals
          </button>
          <button 
            onClick={handleReset}
            style={{ background: 'transparent', border: '1px solid #FF0000', color: '#FF0000', padding: '0.5rem 1rem', borderRadius: '20px', fontSize: '0.85rem' }}
          >
            Sign Out
          </button>
        </div>
      </div>

      {deferredPrompt && !isStandalone && (
        <button 
          onClick={handleInstallClick}
          className="btn-primary"
          style={{ width: '100%', padding: '1rem', marginBottom: '1.5rem', background: '#FFFFFF', color: '#000000', fontWeight: 'bold' }}
        >
          Download App to Mobile
        </button>
      )}

      {isIOS && !isStandalone && (
        <div style={{ background: 'var(--surface-color)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border-color)', marginBottom: '1.5rem', textAlign: 'center' }}>
          <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            <strong style={{ color: 'var(--text-primary)' }}>Install App:</strong> Tap the <strong>Share</strong> icon in Safari, then select <strong>Add to Home Screen</strong>.
          </p>
        </div>
      )}

      {showEditGoals && (
        <div className="card page-transition flex-col" style={{ marginBottom: '1.5rem', gap: '1rem', border: '1px solid var(--text-primary)' }}>
          <h3 style={{ margin: 0 }}>Customize Goals</h3>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <div style={{ flex: '1 1 100px' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.2rem' }}>Primary Goal</label>
              <select value={editGoals.primaryGoal} onChange={e => setEditGoals({...editGoals, primaryGoal: e.target.value})} style={{ width: '100%', padding: '0.8rem', background: 'var(--bg-color)' }}>
                <option value="general">General Fitness</option>
                <option value="burnCalories">Burn Calories/Fat</option>
                <option value="buildMuscle">Build Muscle</option>
              </select>
            </div>
            <div style={{ flex: '1 1 100px' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.2rem' }}>Goal Weight (kg)</label>
              <input type="number" value={editGoals.goalWeight} onChange={e => setEditGoals({...editGoals, goalWeight: e.target.value})} style={{ width: '100%', padding: '0.8rem', background: 'var(--bg-color)' }} />
            </div>
            <div style={{ flex: '1 1 100px' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.2rem' }}>Calories (kcal)</label>
              <input type="number" value={editGoals.goalCalories} onChange={e => setEditGoals({...editGoals, goalCalories: e.target.value})} style={{ width: '100%', padding: '0.8rem', background: 'var(--bg-color)' }} />
            </div>
            <div style={{ flex: '1 1 100%' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.2rem' }}>Gemini AI API Key (For accurate food macros)</label>
              <input type="password" placeholder="AIzaSy..." value={editGoals.geminiKey} onChange={e => setEditGoals({...editGoals, geminiKey: e.target.value})} style={{ width: '100%', padding: '0.8rem', background: 'var(--bg-color)' }} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
            <button onClick={() => setShowEditGoals(false)} style={{ padding: '0.8rem 1.5rem', background: 'transparent', color: 'var(--text-secondary)' }}>Cancel</button>
            <button onClick={handleSaveGoals} className="btn-primary" style={{ padding: '0.8rem 1.5rem' }}>Save Goals</button>
          </div>
        </div>
      )}

      {showWeightModal && (
        <div className="card page-transition" style={{ marginBottom: '1.5rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <input 
            type="number" 
            placeholder="Current weight (kg)..." 
            value={newWeight} 
            onChange={e => setNewWeight(e.target.value)} 
            style={{ flex: 1, padding: '0.8rem' }}
            autoFocus
          />
          <button className="btn-primary" onClick={handleLogWeight} style={{ padding: '0.8rem' }}>
            <Plus size={20} />
          </button>
        </div>
      )}

      <div className="flex-between" style={{ marginBottom: '1rem' }}>
        <button 
          onClick={() => setShowWeightModal(true)}
          style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', background: 'var(--surface-color)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', padding: '1rem', borderRadius: '12px' }}
        >
          <Weight size={20} /> Log Current Weight
        </button>
      </div>
      
      <div className="card" style={{ padding: '0', overflow: 'hidden', marginBottom: '1.5rem' }}>
        <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--bg-color)' }}>
          <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Today's Intel</h3>
          <p className="text-muted" style={{ margin: 0, fontSize: '0.8rem' }}>Tap a row to view progress graph</p>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              <th style={{ padding: '1rem 1.5rem' }}>Metric</th>
              <th style={{ padding: '1rem 1.5rem' }}>Amount</th>
              <th style={{ padding: '1rem 1.5rem' }}>Goal</th>
            </tr>
          </thead>
          <tbody>
            {/* Calories Burned */}
            <tr style={{ borderBottom: expandedMetric === 'caloriesBurned' ? 'none' : '1px solid var(--border-color)', cursor: 'pointer', transition: 'background-color 0.2s' }} onClick={() => toggleGraph('caloriesBurned')} onMouseOver={e => e.currentTarget.style.backgroundColor = 'var(--bg-color)'} onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}>
              <td style={{ padding: '1rem 1.5rem', fontWeight: 500 }}>Calories Burned</td>
              <td style={{ padding: '1rem 1.5rem', color: 'var(--text-primary)' }}>{totalCaloriesBurned} kcal</td>
              <td style={{ padding: '1rem 1.5rem', color: 'var(--text-secondary)' }}>-</td>
            </tr>
            {expandedMetric === 'caloriesBurned' && (
              <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                <td colSpan="3" style={{ padding: '0 1.5rem', backgroundColor: 'var(--bg-color)' }}>
                  {renderInlineGraph('caloriesBurned')}
                </td>
              </tr>
            )}

            {/* Calories Consumed */}
            <tr style={{ borderBottom: expandedMetric === 'calories' ? 'none' : '1px solid var(--border-color)', cursor: 'pointer', transition: 'background-color 0.2s' }} onClick={() => toggleGraph('calories')} onMouseOver={e => e.currentTarget.style.backgroundColor = 'var(--bg-color)'} onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}>
              <td style={{ padding: '1rem 1.5rem', fontWeight: 500 }}>Calories Consumed</td>
              <td style={{ padding: '1rem 1.5rem' }}>{totalCaloriesIn} kcal</td>
              <td style={{ padding: '1rem 1.5rem', color: 'var(--text-secondary)' }}>{user?.goalCalories || '-'}</td>
            </tr>
            {expandedMetric === 'calories' && (
              <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                <td colSpan="3" style={{ padding: '0 1.5rem', backgroundColor: 'var(--bg-color)' }}>
                  {renderInlineGraph('calories')}
                </td>
              </tr>
            )}

            {/* Protein */}
            <tr style={{ borderBottom: expandedMetric === 'protein' ? 'none' : '1px solid var(--border-color)', cursor: 'pointer', transition: 'background-color 0.2s' }} onClick={() => toggleGraph('protein')} onMouseOver={e => e.currentTarget.style.backgroundColor = 'var(--bg-color)'} onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}>
              <td style={{ padding: '1rem 1.5rem', fontWeight: 500 }}>Protein</td>
              <td style={{ padding: '1rem 1.5rem' }}>{totalProtein} g</td>
              <td style={{ padding: '1rem 1.5rem', color: 'var(--text-secondary)' }}>{user?.goalProtein || '-'} g</td>
            </tr>
            {expandedMetric === 'protein' && (
              <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                <td colSpan="3" style={{ padding: '0 1.5rem', backgroundColor: 'var(--bg-color)' }}>
                  {renderInlineGraph('protein')}
                </td>
              </tr>
            )}

            {/* Fiber */}
            <tr style={{ borderBottom: expandedMetric === 'fiber' ? 'none' : '1px solid var(--border-color)', cursor: 'pointer', transition: 'background-color 0.2s' }} onClick={() => toggleGraph('fiber')} onMouseOver={e => e.currentTarget.style.backgroundColor = 'var(--bg-color)'} onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}>
              <td style={{ padding: '1rem 1.5rem', fontWeight: 500 }}>Fiber</td>
              <td style={{ padding: '1rem 1.5rem' }}>{totalFiber} g</td>
              <td style={{ padding: '1rem 1.5rem', color: 'var(--text-secondary)' }}>{user?.goalFiber || '-'} g</td>
            </tr>
            {expandedMetric === 'fiber' && (
              <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                <td colSpan="3" style={{ padding: '0 1.5rem', backgroundColor: 'var(--bg-color)' }}>
                  {renderInlineGraph('fiber')}
                </td>
              </tr>
            )}

            {/* Water */}
            <tr style={{ borderBottom: expandedMetric === 'water' ? 'none' : '1px solid var(--border-color)', cursor: 'pointer', transition: 'background-color 0.2s' }} onClick={() => toggleGraph('water')} onMouseOver={e => e.currentTarget.style.backgroundColor = 'var(--bg-color)'} onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}>
              <td style={{ padding: '1rem 1.5rem', fontWeight: 500 }}>Water</td>
              <td style={{ padding: '1rem 1.5rem' }}>{totalWater} ml</td>
              <td style={{ padding: '1rem 1.5rem', color: 'var(--text-secondary)' }}>{user?.goalWater || '-'} ml</td>
            </tr>
            {expandedMetric === 'water' && (
              <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                <td colSpan="3" style={{ padding: '0 1.5rem', backgroundColor: 'var(--bg-color)' }}>
                  {renderInlineGraph('water')}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="card" style={{ position: 'relative' }}>
        <div className="flex-between" style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1rem', margin: 0 }}>{getMetricLabel(graphConfig.metric)}</h3>
          <button 
            onClick={() => setShowGraphConfig(!showGraphConfig)}
            style={{ background: 'none', border: 'none', padding: '0.2rem', color: 'var(--text-secondary)', cursor: 'pointer' }}
          >
            {showGraphConfig ? <X size={20} /> : <Settings2 size={20} />}
          </button>
        </div>
        
        {showGraphConfig && (
          <div className="page-transition" style={{ position: 'absolute', top: '3.5rem', right: '1rem', background: 'var(--surface-color)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '1rem', zIndex: 10, boxShadow: '0 4px 12px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Metric to display</label>
            <select 
              value={graphConfig.metric} 
              onChange={e => setGraphConfig({...graphConfig, metric: e.target.value})}
              style={{ background: 'var(--bg-color)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', padding: '0.4rem', borderRadius: '4px', fontSize: '0.85rem' }}
            >
              <option value="bodyWeight">Body Weight</option>
              <option value="caloriesBurned">Calories Burned</option>
              <option value="calories">Calories Consumed</option>
              <option value="protein">Protein</option>
              <option value="water">Water</option>
              <option value="duration">Workout Duration</option>
            </select>
            
            <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Chart Type</label>
            <select 
              value={graphConfig.chartType} 
              onChange={e => setGraphConfig({...graphConfig, chartType: e.target.value})}
              style={{ background: 'var(--bg-color)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', padding: '0.4rem', borderRadius: '4px', fontSize: '0.85rem' }}
            >
              <option value="AreaChart">Area Chart</option>
              <option value="BarChart">Bar Chart</option>
              <option value="LineChart">Line Chart</option>
            </select>
          </div>
        )}

        {renderGenericChart(mainGraphData, graphConfig.metric, graphConfig.chartType, '220px')}
      </div>
    </div>
  );
}

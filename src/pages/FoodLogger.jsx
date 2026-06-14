import { useState } from 'react';
import { db } from '../db/db';
import { Plus, Loader, Utensils, Flame } from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';

const categorizeTime = (dateObj) => {
  const hours = dateObj.getHours();
  const minutes = dateObj.getMinutes();
  const time = hours + minutes / 60;
  
  if (time >= 5 && time < 10.5) return 'Breakfast';
  if (time >= 10.5 && time < 12.5) return 'Brunch';
  if (time >= 12.5 && time < 16) return 'Lunch';
  if (time >= 16 && time < 19) return 'Evening Snack';
  return 'Dinner'; // 19:00 to 05:00
};

const getMealSize = (calories) => {
  if (calories <= 200) return 'Light';
  if (calories <= 600) return 'Medium';
  return 'Heavy';
};

export default function FoodLogger() {
  const [foodName, setFoodName] = useState('');
  const [amount, setAmount] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const logs = useLiveQuery(() => db.food_logs.orderBy('date').reverse().toArray());

  const logFood = async (e) => {
    e.preventDefault();
    if (!foodName || !amount) return;

    setIsAnalyzing(true);

    // Simulate AI Agent connection to fetch macros
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Mock AI response
    const mockCalories = Math.floor(Math.random() * 600) + 50;
    const mockProtein = Math.floor(Math.random() * 40) + 2;
    const mockFiber = Math.floor(Math.random() * 10) + 1;

    await db.food_logs.add({
      date: new Date().toISOString(),
      name: foodName,
      amount: amount,
      calories: mockCalories,
      protein: mockProtein,
      fiber: mockFiber
    });

    setFoodName('');
    setAmount('');
    setIsAnalyzing(false);
  };

  // Group logs by Date (e.g. "June 07")
  const groupedLogs = {};
  if (logs) {
    logs.forEach(log => {
      const d = new Date(log.date);
      const dateStr = d.toLocaleDateString(undefined, { month: 'long', day: 'numeric' });
      if (!groupedLogs[dateStr]) groupedLogs[dateStr] = { items: [], totalCal: 0, totalPro: 0 };
      
      groupedLogs[dateStr].items.push({ 
        ...log, 
        category: categorizeTime(d),
        size: getMealSize(log.calories)
      });
      groupedLogs[dateStr].totalCal += log.calories;
      groupedLogs[dateStr].totalPro += log.protein;
    });
  }

  return (
    <div className="page-transition flex-col">
      <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Utensils size={24} /> AI Food Logger
      </h2>
      
      <div className="card" style={{ marginBottom: '2rem' }}>
        <form onSubmit={logFood} className="flex-col">
          <p className="text-muted" style={{ marginBottom: '1.5rem', fontSize: '0.9rem' }}>
            Enter your meal. Our AI will automatically categorize it by time and quantity, calculating macros instantly.
          </p>

          <input 
            placeholder="Food Name (e.g., Grilled Chicken Breast)" 
            value={foodName} 
            onChange={e => setFoodName(e.target.value)} 
            disabled={isAnalyzing}
            style={{ marginBottom: '1rem', padding: '1rem', borderRadius: '8px', border: 'none', background: 'var(--bg-color)' }}
          />
          
          <input 
            placeholder="Amount (e.g., 200g, 1 bowl)" 
            value={amount} 
            onChange={e => setAmount(e.target.value)} 
            disabled={isAnalyzing}
            style={{ marginBottom: '1.5rem', padding: '1rem', borderRadius: '8px', border: 'none', background: 'var(--bg-color)' }}
          />

          <button 
            type="submit" 
            className="btn-primary" 
            style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', padding: '1rem' }}
            disabled={isAnalyzing || !foodName || !amount}
          >
            {isAnalyzing ? <Loader className="spin" size={20} /> : <Plus size={20} />}
            {isAnalyzing ? 'AI Analyzing Macros...' : 'Log Food'}
          </button>
        </form>
      </div>

      <h3 style={{ marginBottom: '1rem' }}>Dietary History</h3>
      
      {Object.keys(groupedLogs).length === 0 ? (
        <p className="text-muted" style={{ textAlign: 'center', padding: '2rem' }}>No meals logged yet.</p>
      ) : (
        <div className="flex-col" style={{ gap: '2rem' }}>
          {Object.keys(groupedLogs).map(date => (
            <div key={date} className="flex-col" style={{ gap: '0.75rem' }}>
              <div className="flex-between" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                <h4 style={{ margin: 0, fontSize: '1.1rem' }}>{date}</h4>
                <div style={{ display: 'flex', gap: '1rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  <span><Flame size={14} style={{ verticalAlign: 'middle', color: '#ff5c5c' }} /> {groupedLogs[date].totalCal} kcal</span>
                  <span>{groupedLogs[date].totalPro}g Protein</span>
                </div>
              </div>

              {groupedLogs[date].items.map(item => (
                <div key={item.id} className="card" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', background: 'var(--bg-color)', border: '1px solid var(--border-color)' }}>
                  <div className="flex-between">
                    <span style={{ fontWeight: 600 }}>{item.name}</span>
                    <span style={{ fontSize: '0.8rem', background: 'var(--surface-color)', padding: '0.2rem 0.6rem', borderRadius: '12px', color: 'var(--text-secondary)' }}>
                      {item.category}
                    </span>
                  </div>
                  
                  <div className="flex-between" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    <span>{item.amount}</span>
                    <span style={{ color: item.size === 'Light' ? '#4ade80' : item.size === 'Heavy' ? '#f87171' : '#fbbf24', fontWeight: 500 }}>
                      {item.size} Meal
                    </span>
                  </div>

                  <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', fontSize: '0.85rem' }}>
                    <span style={{ color: 'var(--text-primary)' }}>{item.calories} kcal</span>
                    <span>{item.protein}g P</span>
                    <span>{item.fiber}g F</span>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      <style>{`
        .spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

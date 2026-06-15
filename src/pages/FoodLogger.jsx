import { useState } from 'react';
import { db } from '../db/db';
import { Plus, Loader, Utensils, Flame, Trash2 } from 'lucide-react';
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

    if (!navigator.onLine) {
      alert("Please connect to the internet to use the Smart AI Macro Calculator.");
      return;
    }

    setIsAnalyzing(true);

    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

      if (!apiKey) {
        alert("The app developer has not configured the Vercel API Key yet.");
        setIsAnalyzing(false);
        return;
      }

      const promptText = `I am eating ${amount} of ${foodName}. Calculate the exact nutritional values for this entire portion. Return a valid JSON object strictly with these exact keys: "calories" (number), "protein" (number), "fiber" (number). Do not include any other text, markdown formatting, or backticks. Only the raw JSON. Ensure the calculation is perfectly accurate based on standard nutritional databases.`;

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: promptText }] }]
        })
      });

      if (!response.ok) throw new Error('API Request Failed. Key might be invalid or rate limited.');
      
      const data = await response.json();
      let textResponse = data.candidates[0].content.parts[0].text.trim();
      
      // Strip markdown code blocks if the AI accidentally included them
      if (textResponse.startsWith('```json')) textResponse = textResponse.replace(/```json/g, '').replace(/```/g, '').trim();
      else if (textResponse.startsWith('```')) textResponse = textResponse.replace(/```/g, '').trim();

      const parsed = JSON.parse(textResponse);
      
      await db.food_logs.add({
        date: new Date().toISOString(),
        name: foodName,
        amount: amount,
        calories: parsed.calories || 0,
        protein: parsed.protein || 0,
        fiber: parsed.fiber || 0
      });

    } catch (err) {
      console.error("Gemini AI Error:", err);
      alert("AI analysis failed. Please verify your internet connection or check if the API key is valid.");
    } finally {
      setFoodName('');
      setAmount('');
      setIsAnalyzing(false);
    }
  };

  const deleteFood = async (id) => {
    if (window.confirm("Delete this food log?")) {
      await db.food_logs.delete(id);
    }
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

                  <div className="flex-between" style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', fontSize: '0.85rem' }}>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                      <span style={{ color: 'var(--text-primary)' }}>{item.calories} kcal</span>
                      <span>{item.protein}g P</span>
                      <span>{item.fiber}g F</span>
                    </div>
                    <button 
                      onClick={() => deleteFood(item.id)}
                      style={{ background: 'transparent', color: '#ff5c5c', padding: '0.2rem', display: 'flex', alignItems: 'center' }}
                    >
                      <Trash2 size={16} />
                    </button>
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

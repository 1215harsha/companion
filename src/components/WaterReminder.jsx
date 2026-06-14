import { useState, useEffect } from 'react';
import { db } from '../db/db';
import { X, Droplet } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function WaterReminder() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [amount, setAmount] = useState('');

  useEffect(() => {
    // Show prompt every hour (3600000 ms)
    const interval = setInterval(() => {
      setShowPrompt(true);
    }, 3600000); 

    // Pop up shortly after landing on the page
    const initialTimer = setTimeout(() => {
      setShowPrompt(true);
    }, 1500);

    return () => {
      clearInterval(interval);
      clearTimeout(initialTimer);
    };
  }, []);

  const handleLog = async () => {
    if (!amount) return;
    await db.water_logs.add({
      date: new Date().toISOString(),
      amountMl: Number(amount)
    });
    setAmount('');
    setShowPrompt(false);
  };

  return (
    <AnimatePresence>
      {showPrompt && (
        <motion.div 
          initial={{ opacity: 0, y: 50, x: '-50%' }}
          animate={{ opacity: 1, y: 0, x: '-50%' }}
          exit={{ opacity: 0, y: 50, x: '-50%' }}
          style={{
            position: 'fixed',
            bottom: '100px', // floats above the bottom nav
            left: '50%',
            width: '90%',
            maxWidth: '400px',
            backgroundColor: 'var(--surface-color)',
            border: '1px solid var(--border-color)',
            borderRadius: '16px',
            padding: '1.5rem',
            zIndex: 1000,
            boxShadow: '0 20px 40px rgba(0,0,0,0.8)'
          }}
        >
          <button 
            onClick={() => setShowPrompt(false)} 
            style={{ position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', color: 'var(--text-secondary)' }}
          >
            <X size={18} />
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
            <div style={{ background: 'var(--bg-color)', padding: '12px', borderRadius: '50%', border: '1px solid var(--text-primary)' }}>
              <Droplet size={24} color="var(--text-primary)" />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600 }}>Hydration Check</h3>
              <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Time to drink! Log your intake.</p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input 
              type="number" 
              placeholder="Amount (ml)..." 
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              style={{ flex: 1, padding: '0.8rem', backgroundColor: 'var(--bg-color)' }}
              autoFocus
            />
            <button className="btn-primary" onClick={handleLog} style={{ padding: '0.8rem 1.5rem' }}>
              Log
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

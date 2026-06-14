import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

const MOTIVATIONAL_QUOTES = [
  "Stay Hydrated, Stay Strong",
  "Water is your driving force",
  "Fuel your body, drink water",
  "Drink water and conquer today",
  "Hydration is key to power"
];

export default function LoadingScreen() {
  const [quote, setQuote] = useState('');

  useEffect(() => {
    setQuote(MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)]);
  }, []);

  return (
    <div style={{
      display: 'flex', 
      flexDirection: 'column',
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh', 
      backgroundColor: 'var(--bg-color)',
      color: 'var(--text-primary)'
    }}>
      
      {/* Water Bottle Container */}
      <div style={{ position: 'relative', width: '80px', height: '140px', border: '4px solid var(--text-primary)', borderRadius: '8px 8px 16px 16px', overflow: 'visible', marginBottom: '3rem' }}>
        
        {/* Bottle Cap */}
        <div style={{ position: 'absolute', top: '-18px', left: '16px', width: '40px', height: '16px', backgroundColor: 'var(--text-primary)', borderRadius: '4px 4px 0 0' }} />
        
        {/* Glass reflection line */}
        <div style={{ position: 'absolute', top: '10px', left: '8px', width: '6px', height: '100px', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: '10px', zIndex: 10 }} />

        {/* White Liquid Filling Animation */}
        <motion.div 
          initial={{ height: '0%' }}
          animate={{ height: '90%' }}
          transition={{ duration: 1.5, ease: 'easeInOut' }}
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: '#ffffff', // White liquid
            borderRadius: '0 0 10px 10px'
          }}
        />
      </div>

      <motion.h2 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.8 }}
        style={{ fontSize: '1.2rem', fontWeight: 600, letterSpacing: '0.5px', margin: 0 }}
      >
        {quote}
      </motion.h2>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 1 }}
        style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.5rem' }}
      >
        Initializing Companion...
      </motion.p>
    </div>
  );
}

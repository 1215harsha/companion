import { useState, useEffect } from 'react';
import { db } from '../db/db';
import { ArrowRight, Music, BellOff, Mail, CheckCircle2, User, Target, Zap, Weight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Onboarding({ onComplete }) {
  const [step, setStep] = useState(1);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // User Data State
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [gender, setGender] = useState('neutral');
  const [emailError, setEmailError] = useState('');
  const [codeError, setCodeError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [generatedCode, setGeneratedCode] = useState('');

  // No cooldown needed for offline mode
  const [currentWeight, setCurrentWeight] = useState('');
  const [goalWeight, setGoalWeight] = useState('');
  const [primaryGoal, setPrimaryGoal] = useState('');
  const [macros, setMacros] = useState({ protein: 150, carbs: 200, fats: 70, calories: 2500, fiber: 30, water: 3000 });
  const [focusMode, setFocusMode] = useState(false);

  const generateLocalCode = () => {
    setIsLoading(true);
    setEmailError('');
    setCodeError('');
    
    setTimeout(() => {
      const newCode = Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedCode(newCode);
      setStep(2);
      setIsLoading(false);
    }, 1200);
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setEmailError('Please enter a valid email address');
      return;
    }
    
    generateLocalCode();
  };

  const handleVerify = (e) => {
    e.preventDefault();
    if (code !== generatedCode) {
      setCodeError('Invalid system code');
      return;
    }
    setCodeError('');
    setStep(3);
  };

  const handleProfileSubmit = (e) => {
    e.preventDefault();
    if (name && currentWeight && goalWeight) setStep(4);
  };

  const handleGoalSelect = (goal) => {
    setPrimaryGoal(goal);
    setIsAnalyzing(true);
    setStep(5);

    setTimeout(() => {
      let calculatedMacros = {};
      const cw = Number(currentWeight) || 70;
      
      // Basic dynamic calculation
      if (goal === 'Gain Weight') calculatedMacros = { calories: 3200, protein: Math.round(cw * 2.2), fiber: 35, water: 3500 };
      else if (goal === 'Lose Weight') calculatedMacros = { calories: 1900, protein: Math.round(cw * 2.0), fiber: 30, water: 3000 };
      else if (goal === 'Gain Muscle') calculatedMacros = { calories: 2800, protein: Math.round(cw * 2.2), fiber: 30, water: 3500 };
      else if (goal === 'Body Recomposition') calculatedMacros = { calories: 2400, protein: Math.round(cw * 2.1), fiber: 30, water: 3000 };
      
      setMacros(calculatedMacros);
      setIsAnalyzing(false);
    }, 2000);
  };

  const handleComplete = async () => {
    await db.users.add({
      email,
      name,
      gender,
      currentWeight: Number(currentWeight),
      goalWeight: Number(goalWeight),
      primaryGoal,
      goalCalories: Number(macros.calories),
      goalProtein: Number(macros.protein),
      goalFiber: Number(macros.fiber),
      goalWater: Number(macros.water)
    });

    // Automatically log their first body weight entry
    await db.body_weight_logs.add({
      date: new Date().toISOString(),
      weight: Number(currentWeight)
    });

    await db.settings.add({
      focusModeEnabled: focusMode
    });

    onComplete();
  };

  return (
    <div className="page-transition flex-col" style={{ padding: '2rem', minHeight: '100vh', justifyContent: 'center' }}>
      <AnimatePresence mode="wait">

        {step === 1 && (
          <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex-col">
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem' }}>
              <div style={{ background: 'var(--surface-color)', padding: '1rem', borderRadius: '50%', border: '1px solid var(--border-color)' }}>
                <Zap size={40} color="var(--text-primary)" />
              </div>
            </div>
            <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem', textAlign: 'center' }}>Companion</h1>
            <p className="text-muted" style={{ marginBottom: '3rem', textAlign: 'center' }}>Create your account to continue.</p>
            
            <form onSubmit={handleEmailSubmit} className="flex-col" style={{ gap: '1rem' }}>
              <div style={{ position: 'relative' }}>
                <Mail size={20} style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', left: '1rem', color: 'var(--text-secondary)' }} />
                <input 
                  type="email" required placeholder="Email Address" value={email} onChange={e => setEmail(e.target.value)} 
                  style={{ width: '100%', padding: '1rem 1rem 1rem 3rem', borderRadius: '8px', border: emailError ? '1px solid #FF0000' : '1px solid var(--border-color)', background: 'var(--surface-color)' }} 
                />
              </div>
              {emailError && <p style={{ color: '#FF0000', fontSize: '0.85rem', margin: 0 }}>{emailError}</p>}
              <button type="submit" className="btn-primary" style={{ padding: '1rem', marginTop: '1rem' }} disabled={isLoading}>
                {isLoading ? 'Authenticating...' : 'Continue'} <ArrowRight size={18} style={{ verticalAlign: 'middle', marginLeft: '0.5rem' }} />
              </button>
            </form>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex-col">
            <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>System Authorization</h1>
            <p className="text-muted" style={{ marginBottom: '1rem' }}>Offline Mode Active. Use the generated system code below to authenticate.</p>
            
            <div style={{ background: '#111', color: '#00FF41', padding: '1rem', borderRadius: '8px', fontFamily: 'monospace', textAlign: 'center', fontSize: '1.5rem', marginBottom: '1.5rem', border: '1px solid #333' }}>
              [ AUTH_CODE: {generatedCode} ]
            </div>
            
            <form onSubmit={handleVerify} className="flex-col" style={{ gap: '1.5rem' }}>
              <input 
                type="text" required maxLength={6} placeholder="------" value={code} onChange={e => setCode(e.target.value)} 
                style={{ width: '100%', padding: '1rem', borderRadius: '8px', border: codeError ? '1px solid #FF0000' : '1px solid var(--text-primary)', background: 'var(--surface-color)', fontSize: '2rem', textAlign: 'center', letterSpacing: '0.5em' }} 
              />
              {codeError && <p style={{ color: '#FF0000', fontSize: '0.85rem', margin: 0, textAlign: 'center' }}>{codeError}</p>}
              <button type="submit" className="btn-primary" style={{ padding: '1rem' }}>
                Verify Code
              </button>
            </form>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex-col">
            <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Physical Metrics</h1>
            <p className="text-muted" style={{ marginBottom: '2rem' }}>Let's personalize your dashboard.</p>
            
            <form onSubmit={handleProfileSubmit} className="flex-col" style={{ gap: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>What is your name?</label>
                <div style={{ position: 'relative' }}>
                  <User size={20} style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', left: '1rem', color: 'var(--text-secondary)' }} />
                  <input type="text" required placeholder="Your Name" value={name} onChange={e => setName(e.target.value)} 
                    style={{ width: '100%', padding: '1rem 1rem 1rem 3rem', borderRadius: '8px', border: 'none', background: 'var(--surface-color)' }} />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Gender</label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button type="button" className={gender === 'male' ? 'btn-primary' : ''} style={{ flex: 1, padding: '0.8rem' }} onClick={() => setGender('male')}>Male</button>
                  <button type="button" className={gender === 'female' ? 'btn-primary' : ''} style={{ flex: 1, padding: '0.8rem' }} onClick={() => setGender('female')}>Female</button>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Current Weight</label>
                  <div style={{ position: 'relative' }}>
                    <input type="number" required placeholder="kg" value={currentWeight} onChange={e => setCurrentWeight(e.target.value)} 
                      style={{ width: '100%', padding: '1rem', borderRadius: '8px', border: 'none', background: 'var(--surface-color)' }} />
                  </div>
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Goal Weight</label>
                  <div style={{ position: 'relative' }}>
                    <input type="number" required placeholder="kg" value={goalWeight} onChange={e => setGoalWeight(e.target.value)} 
                      style={{ width: '100%', padding: '1rem', borderRadius: '8px', border: 'none', background: 'var(--surface-color)' }} />
                  </div>
                </div>
              </div>

              <button type="submit" className="btn-primary" style={{ padding: '1rem', marginTop: '1rem' }}>
                Next Step
              </button>
            </form>
          </motion.div>
        )}

        {step === 4 && (
          <motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex-col">
            <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Hey {name}, what's your primary goal?</h1>
            <p className="text-muted" style={{ marginBottom: '2rem' }}>We'll custom-tailor your macros based on this.</p>
            
            <div className="flex-col" style={{ gap: '1rem' }}>
              <button onClick={() => handleGoalSelect('Gain Weight')} style={{ padding: '1.5rem', border: '1px solid var(--border-color)', background: 'var(--surface-color)', borderRadius: '12px', textAlign: 'left' }}>
                <h3 style={{ margin: '0 0 0.5rem 0' }}>📈 Gain Weight</h3>
                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Maximize mass and overall size.</p>
              </button>
              
              <button onClick={() => handleGoalSelect('Lose Weight')} style={{ padding: '1.5rem', border: '1px solid var(--border-color)', background: 'var(--surface-color)', borderRadius: '12px', textAlign: 'left' }}>
                <h3 style={{ margin: '0 0 0.5rem 0' }}>📉 Lose Weight</h3>
                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Cut fat and drop pounds safely.</p>
              </button>

              <button onClick={() => handleGoalSelect('Gain Muscle')} style={{ padding: '1.5rem', border: '1px solid var(--border-color)', background: 'var(--surface-color)', borderRadius: '12px', textAlign: 'left' }}>
                <h3 style={{ margin: '0 0 0.5rem 0' }}>💪 Gain Muscle</h3>
                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Focus heavily on lean tissue growth.</p>
              </button>

              <button onClick={() => handleGoalSelect('Body Recomposition')} style={{ padding: '1.5rem', border: '1px solid var(--border-color)', background: 'var(--surface-color)', borderRadius: '12px', textAlign: 'left' }}>
                <h3 style={{ margin: '0 0 0.5rem 0' }}>⚔️ Body Recomposition</h3>
                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Lose fat and gain muscle simultaneously.</p>
              </button>
            </div>
          </motion.div>
        )}

        {step === 5 && (
          <motion.div key="step5" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex-col">
            {isAnalyzing ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '3rem 0' }}>
                <Target size={48} className="breathing" style={{ color: 'var(--text-primary)', marginBottom: '2rem' }} />
                <h2 className="breathing">Architecting your plan...</h2>
                <p className="text-muted">Analyzing {gender} physiology for {primaryGoal}...</p>
              </div>
            ) : (
              <div className="flex-col">
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                  <CheckCircle2 size={48} style={{ color: '#1DB954', marginBottom: '1rem' }} />
                  <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Plan Ready</h1>
                  <p className="text-muted">We've calculated your targets, but you can override them below if you have specific needs.</p>
                </div>
                
                <div className="card flex-col" style={{ gap: '1rem', marginBottom: '2rem' }}>
                  <div className="flex-between">
                    <span className="text-muted">Calories (kcal)</span>
                    <input type="number" value={macros.calories} onChange={e => setMacros({...macros, calories: e.target.value})} style={{ width: '80px', padding: '0.5rem', textAlign: 'right', background: 'transparent', border: '1px solid var(--border-color)', borderRadius: '4px', fontWeight: 'bold' }} />
                  </div>
                  <div className="flex-between">
                    <span className="text-muted">Protein (g)</span>
                    <input type="number" value={macros.protein} onChange={e => setMacros({...macros, protein: e.target.value})} style={{ width: '80px', padding: '0.5rem', textAlign: 'right', background: 'transparent', border: '1px solid var(--border-color)', borderRadius: '4px', fontWeight: 'bold' }} />
                  </div>
                  <div className="flex-between">
                    <span className="text-muted">Fiber (g)</span>
                    <input type="number" value={macros.fiber} onChange={e => setMacros({...macros, fiber: e.target.value})} style={{ width: '80px', padding: '0.5rem', textAlign: 'right', background: 'transparent', border: '1px solid var(--border-color)', borderRadius: '4px', fontWeight: 'bold' }} />
                  </div>
                  <div className="flex-between">
                    <span className="text-muted">Water (ml)</span>
                    <input type="number" value={macros.water} onChange={e => setMacros({...macros, water: e.target.value})} style={{ width: '80px', padding: '0.5rem', textAlign: 'right', background: 'transparent', border: '1px solid var(--border-color)', borderRadius: '4px', fontWeight: 'bold' }} />
                  </div>
                </div>

                <button className="btn-primary" style={{ padding: '1rem' }} onClick={() => setStep(6)}>
                  Accept Targets
                </button>
              </div>
            )}
          </motion.div>
        )}

        {step === 6 && (
          <motion.div key="step6" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex-col">
            <h2 style={{ marginBottom: '1rem' }}>Ecosystem Integrations</h2>

            <div className="card">
              <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <BellOff size={20} /> Focus Mode
              </h3>
              <p className="text-muted" style={{ marginBottom: '1rem', fontSize: '0.85rem' }}>
                Intercept calls and notifications during your workout (Requires Native Android App).
              </p>
              <button 
                className={focusMode ? 'btn-primary' : ''} 
                style={{ width: '100%', padding: '1rem' }}
                onClick={() => setFocusMode(!focusMode)}
              >
                {focusMode ? 'Focus Mode: Enabled' : 'Enable Focus Mode'}
              </button>
            </div>

            <button className="btn-primary" style={{ marginTop: '2rem', width: '100%', padding: '1rem' }} onClick={handleComplete}>
              Enter Companion
            </button>
          </motion.div>
        )}
      </AnimatePresence>
      <style>{`
        .breathing {
          animation: breathing 2s ease-in-out infinite;
        }
        @keyframes breathing {
          0% { transform: scale(1); opacity: 0.8; }
          50% { transform: scale(1.05); opacity: 1; }
          100% { transform: scale(1); opacity: 0.8; }
        }
      `}</style>
    </div>
  );
}

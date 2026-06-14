import { useState } from 'react';
import { Dumbbell, CalendarDays } from 'lucide-react';

export default function Layout({ children, currentTab, setCurrentTab, userName }) {
  const [showHeader, setShowHeader] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  const handleScroll = (e) => {
    const currentScrollY = e.target.scrollTop;
    if (currentScrollY > lastScrollY && currentScrollY > 50) {
      setShowHeader(false);
    } else if (currentScrollY < lastScrollY) {
      setShowHeader(true);
    }
    setLastScrollY(currentScrollY);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="layout">
      <header 
        className="header flex-between"
        style={{
          transition: 'transform 0.3s ease, opacity 0.3s ease, height 0.3s ease',
          transform: showHeader ? 'translateY(0)' : 'translateY(-100%)',
          opacity: showHeader ? 1 : 0,
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 50,
          backgroundColor: 'var(--bg-color)',
          maxWidth: '600px',
          margin: '0 auto'
        }}
      >
        <h2 style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>
          {userName ? `${getGreeting()}, ${userName}` : 'Companion'}
        </h2>
      </header>
      
      <main className="main-content" onScroll={handleScroll} style={{ paddingTop: '5rem' }}>
        {children}
      </main>

      <nav className="bottom-nav">
        <button 
          className={`nav-btn ${currentTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setCurrentTab('dashboard')}
        >
          <img src="/nav_stats.png" alt="Stats" style={{ width: '24px', height: '24px', opacity: currentTab === 'dashboard' ? 1 : 0.5, filter: currentTab === 'dashboard' ? 'invert(1) drop-shadow(0 0 2px rgba(255,255,255,0.5))' : 'invert(1)' }} />
          <span>Stats</span>
        </button>
        <button 
          className={`nav-btn ${currentTab === 'food' ? 'active' : ''}`}
          onClick={() => setCurrentTab('food')}
        >
          <img src="/nav_food.png" alt="Food" style={{ width: '24px', height: '24px', opacity: currentTab === 'food' ? 1 : 0.5, filter: currentTab === 'food' ? 'invert(1) drop-shadow(0 0 2px rgba(255,255,255,0.5))' : 'invert(1)' }} />
          <span>Food</span>
        </button>
        <button 
          className={`nav-btn ${currentTab === 'plan' ? 'active' : ''}`}
          onClick={() => setCurrentTab('plan')}
        >
          <img src="/nav_plan.png" alt="Plan" style={{ width: '24px', height: '24px', opacity: currentTab === 'plan' ? 1 : 0.5, filter: currentTab === 'plan' ? 'invert(1) drop-shadow(0 0 2px rgba(255,255,255,0.5))' : 'invert(1)' }} />
          <span>Plan</span>
        </button>
        <button 
          className={`nav-btn primary ${currentTab === 'log' ? 'active' : ''}`}
          onClick={() => setCurrentTab('log')}
        >
          <Dumbbell size={24} />
          <span>Workout</span>
        </button>
        <button 
          className={`nav-btn ${currentTab === 'history' ? 'active' : ''}`}
          onClick={() => setCurrentTab('history')}
        >
          <CalendarDays size={24} />
          <span>History</span>
        </button>
      </nav>
    </div>
  );
}

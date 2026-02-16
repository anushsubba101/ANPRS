import { useState, useEffect } from 'react'
import Upload from './components/Upload'
import Results from './components/Results'
import History from './components/History'
import ParkingDashboard from './components/ParkingDashboard'
import LoginPage from './components/LoginPage'
import ParkingToken from './components/ParkingToken'
import { AuthProvider, useAuth } from './components/AuthContext'
import Dashboard from './components/Dashboard'
import './App.css'
import { AlertCircle, Camera, Database, ParkingCircle, BellRing, X, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

function AppContent() {
  const { isAuthenticated, logout } = useAuth();
  const [resultsData, setResultsData] = useState(null);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('scanner');
  const [toasts, setToasts] = useState([]);
  const [gateStatus, setGateStatus] = useState('CLOSED');
  const [tokenHistory, setTokenHistory] = useState([]);
  const [tokenData, setTokenData] = useState(null);
  const [parkingStats, setParkingStats] = useState({ active_vehicles: 0, available_slots: 50, daily_earnings: 0 });

  useEffect(() => {
    if (gateStatus === 'OPEN') {
      const timer = setTimeout(() => setGateStatus('CLOSED'), 7000);
      return () => clearTimeout(timer);
    }
  }, [gateStatus]);

  const addToast = (msg, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, msg, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 6000);
  };

  const handleSuccess = (data) => {
    setResultsData(data);
    setError(null);

    // Update global stats if available in response or fetch after scan
    if (data.plate && data.slot) {
      setParkingStats(prev => ({
        ...prev,
        active_vehicles: prev.active_vehicles + 1,
        available_slots: Math.max(0, prev.available_slots - 1)
      }));
    }

    // Check for parking event in response
    if (data.parking) {
      const { event, plate, type, fee, slot_number } = data.parking;
      if (event === 'entry') {
        addToast(`Vehicle Entered: ${plate} - Slot ${slot_number}`, 'success');
        setTokenData({ plate_number: plate, type, slot_number });
        setGateStatus('OPEN');
      } else if (event === 'exit') {
        addToast(`Vehicle Exiting: ${plate} - Fee: रू ${fee}`, 'info');
        setGateStatus('OPEN');
        handleReleaseVehicle(plate);
      }
    }

    // Smooth scroll to results
    setTimeout(() => {
      document.querySelector('.results-section')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleReleaseVehicle = (plate) => {
    // Update History Sidebar: Active -> Expired
    setTokenHistory(prev => prev.map(entry =>
      entry.plate_number === plate ? { ...entry, status: 'Expired' } : entry
    ));

    // Update Stats: Available Slots +1
    setParkingStats(prev => ({
      ...prev,
      active_vehicles: Math.max(0, prev.active_vehicles - 1),
      available_slots: Math.min(50, prev.available_slots + 1)
    }));
  };

  const handleError = (msg) => {
    setError(msg);
    setResultsData(null);
  };

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <div className="app-container">
      {/* Global Toast System */}
      <div className="toast-portals" style={{ position: 'fixed', top: '2rem', right: '2rem', zIndex: 10000, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <AnimatePresence>
          {toasts.map(t => (
            <motion.div
              key={t.id}
              initial={{ x: 100, opacity: 0, scale: 0.9 }}
              animate={{ x: 0, opacity: 1, scale: 1 }}
              exit={{ x: 100, opacity: 0, scale: 0.9 }}
              className="glass-card"
              style={{
                padding: '1rem 1.5rem',
                minWidth: '320px',
                background: 'rgba(31, 41, 55, 0.95)',
                borderLeft: `6px solid ${t.type === 'success' ? '#98FFED' : '#0ea5e9'}`,
                boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
                display: 'flex',
                alignItems: 'center',
                gap: '1rem'
              }}
            >
              <BellRing size={20} color={t.type === 'success' ? '#98FFED' : '#0ea5e9'} className="mint-glow" />
              <p style={{ margin: 0, fontSize: '0.95rem', fontWeight: 600, color: '#fff', flex: 1 }}>{t.msg}</p>
              <button
                onClick={() => setToasts(prev => prev.filter(toast => toast.id !== t.id))}
                style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer' }}
              >
                <X size={16} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <header className="app-header">
        <div className="header-top">
          <h1>ANPR System</h1>
          <nav className="app-nav">
            <button
              className={`nav-item ${activeTab === 'scanner' ? 'active' : ''}`}
              onClick={() => setActiveTab('scanner')}
            >
              <Camera size={18} />
              <span>Scanner</span>
            </button>
            <button
              className={`nav-item ${activeTab === 'history' ? 'active' : ''}`}
              onClick={() => setActiveTab('history')}
            >
              <Database size={18} />
              <span>History</span>
            </button>
            <button
              className={`nav-item ${activeTab === 'parking' ? 'active' : ''}`}
              onClick={() => setActiveTab('parking')}
            >
              <ParkingCircle size={18} />
              <span>Parking</span>
            </button>
            <button
              className="nav-item logout-btn"
              onClick={logout}
              style={{ color: '#ef4444' }}
            >
              <LogOut size={18} />
              <span>Logout</span>
            </button>
          </nav>
        </div>
        <p>Advanced Automatic Number Plate Recognition for Nepal</p>
      </header>

      <main>
        {activeTab === 'scanner' ? (
          <Dashboard
            gateStatus={gateStatus}
            setGateStatus={setGateStatus}
            tokenHistory={tokenHistory}
            setTokenHistory={setTokenHistory}
            tokenData={tokenData}
            setTokenData={setTokenData}
            parkingStats={parkingStats}
            setParkingStats={setParkingStats}
          />
        ) : activeTab === 'history' ? (
          <History />
        ) : (
          <ParkingDashboard
            gateStatus={gateStatus}
            onReleaseSuccess={handleReleaseVehicle}
            parkingStats={parkingStats}
            setParkingStats={setParkingStats}
          />
        )}
      </main>

      <footer style={{ textAlign: 'center', padding: '4rem 0 2rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
        <p>&copy; {new Date().getFullYear()} Smart ANPR System. AI-Powered Analysis.</p>
      </footer>
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App

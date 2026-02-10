import { useState } from 'react'
import Upload from './components/Upload'
import Results from './components/Results'
import './App.css'
import { AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

function App() {
  const [resultsData, setResultsData] = useState(null);
  const [error, setError] = useState(null);

  const handleSuccess = (data) => {
    setResultsData(data);
    setError(null);
    // Smooth scroll to results
    setTimeout(() => {
      document.querySelector('.results-section')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleError = (msg) => {
    setError(msg);
    setResultsData(null);
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>ANPR System</h1>
        <p>Advanced Automatic Number Plate Recognition for Nepal</p>
      </header>

      <main>
        <Upload onUploadSuccess={handleSuccess} onError={handleError} />

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="error-banner"
              style={{
                margin: '2rem auto',
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.2)',
                padding: '1rem 1.5rem',
                borderRadius: 'var(--radius-md)',
                color: '#f87171',
                maxWidth: '600px'
              }}
            >
              <AlertCircle size={24} />
              <span>{error}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <Results data={resultsData} />
      </main>

      <footer style={{ textAlign: 'center', padding: '4rem 0 2rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
        <p>&copy; {new Date().getFullYear()} Smart ANPR System. AI-Powered Analysis.</p>
      </footer>
    </div>
  )
}

export default App

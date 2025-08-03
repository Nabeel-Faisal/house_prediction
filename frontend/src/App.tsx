import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import HousePricePredictor from './components/HousePricePredictor';
import PredictionsHistory from './components/PredictionsHistory';
import './App.css';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<HousePricePredictor />} />
            <Route path="/history" element={<PredictionsHistory />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App; 
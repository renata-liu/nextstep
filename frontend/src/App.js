import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import MockInterview from './components/MockInterview';
import HomePage from './components/HomePage';
import Navbar from './components/Navbar';
import Login from './components/Login';
import InterviewAnalysis from './components/InterviewAnalysis';


function App() {
  return (
    <Router>
      <div className="App">
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/mock-interview" element={<MockInterview />} />
            <Route path="/login" element={<Login />} />
            <Route path="/interview-analysis" element={<InterviewAnalysis />} />
          </Routes>
        </main>
        <footer className="footer">
          <p>&copy; 2024 NextStep. All rights reserved.</p>
        </footer>
      </div>
    </Router>
  );
}

export default App;

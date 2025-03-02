import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import MockInterview from './components/MockInterview';
import HomePage from './components/HomePage';
import Navbar from './components/Navbar';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import NewApplication from './components/NewApplication';
import EditApplication from './components/EditApplication';
import ProtectedRoute from './components/ProtectedRoute';
import InterviewAnalysis from './components/InterviewAnalysis';
import Footer from './components/Footer';

function App() {
  return (
    <Router>
      <div className="App">
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/mock-interview" element={
              <ProtectedRoute>
                <MockInterview />
              </ProtectedRoute>
            } />
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/new-application" element={
              <ProtectedRoute>
                <NewApplication />
              </ProtectedRoute>
            } />
            <Route path="/edit-application/:id" element={
              <ProtectedRoute>
                <EditApplication />
              </ProtectedRoute>
            } />
            <Route path="/interview-analysis" element={<ProtectedRoute><InterviewAnalysis /></ProtectedRoute>} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;

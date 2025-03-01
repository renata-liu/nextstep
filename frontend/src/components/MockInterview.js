import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './MockInterview.css';

const MockInterview = () => {
  const navigate = useNavigate();
  const [time, setTime] = useState(120); // 2 minutes in seconds
  const [isRunning, setIsRunning] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [isStopped, setIsStopped] = useState(false);
  const videoRef = useRef(null);
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [questionCount, setQuestionCount] = useState(1); // Start at 1 instead of 0
  const [isSessionComplete, setIsSessionComplete] = useState(false);

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Sample questions - in a real app, these would come from an API or database
  const sampleQuestions = [
    "Tell me about yourself and your experience.",
    "What are your greatest strengths and weaknesses?",
    "Why are you interested in this position?",
    "Where do you see yourself in 5 years?",
    "Describe a challenging situation at work and how you handled it."
  ];

  useEffect(() => {
    // Start camera when component mounts
    startCamera();
    // Set initial question without incrementing counter
    const randomIndex = Math.floor(Math.random() * sampleQuestions.length);
    setCurrentQuestion(sampleQuestions[randomIndex]);
    
    return () => {
      // Cleanup: stop camera when component unmounts
      if (videoRef.current && videoRef.current.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  useEffect(() => {
    let interval;
    if (isRunning && time > 0) {
      interval = setInterval(() => {
        setTime(prevTime => prevTime - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, time]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
    }
  };

  const generateNewQuestion = () => {
    if (questionCount >= 5) {
      setIsSessionComplete(true);
      setIsRunning(false);
      setIsStopped(true);
      return;
    }
    const randomIndex = Math.floor(Math.random() * sampleQuestions.length);
    setCurrentQuestion(sampleQuestions[randomIndex]);
    setQuestionCount(prevCount => prevCount + 1);
    // Reset timer and states for new question
    setTime(120);
    setIsRunning(false);
    setHasStarted(false);
    setIsStopped(false);
  };

  const startNewSession = () => {
    setQuestionCount(1);
    setIsSessionComplete(false);
    setTime(120);
    setIsRunning(false);
    setHasStarted(false);
    setIsStopped(false);
    const randomIndex = Math.floor(Math.random() * sampleQuestions.length);
    setCurrentQuestion(sampleQuestions[randomIndex]);
  };

  const toggleTimer = () => {
    if (!hasStarted) {
      // First time starting
      setHasStarted(true);
      setIsRunning(true);
    } else {
      // Stopping the timer
      setIsRunning(false);
      setIsStopped(true);
    }
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const isLastQuestion = questionCount === 5; // Check for 5 instead of 4

  const viewAnalysis = () => {
    navigate('/interview-analysis');
  };

  return (
    <div className="mock-interview-container">
      <h1>Mock Interview Practice</h1>
      <div className="interview-main">
        <div className="content-section">
          <div className="video-section">
            <div className="camera-container">
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                muted 
                className="camera-feed"
              />
            </div>
            {!isSessionComplete && (
              <div className="question-container">
                <h2>Interview Question:</h2>
                <p className="question-text">{currentQuestion}</p>
              </div>
            )}
          </div>
        </div>

        <div className="controls-section">
          <div className="question-counter">
            Question {questionCount} of 5
          </div>
          {!isSessionComplete ? (
            <>
              <div className="timer-container">
                <div className="timer-display">{formatTime(time)}</div>
                <div className="timer-controls">
                  <button 
                    className={`timer-button ${isRunning ? 'stop' : 'start'}`}
                    onClick={toggleTimer}
                    disabled={isStopped}
                  >
                    {isStopped ? 'Stopped' : isRunning ? 'Stop' : 'Start'}
                  </button>
                </div>
              </div>
              <button 
                className="next-question-button"
                onClick={generateNewQuestion}
                disabled={!hasStarted}
              >
                {isLastQuestion ? 'Complete Session' : 'Next Question'}
              </button>
            </>
          ) : (
            <div className="session-complete">
              <p className="completion-message">Practice session complete! 🎉</p>
              <button 
                className="new-session-button"
                onClick={viewAnalysis}
              >
                View Analysis
              </button>
            </div>
          )}
          <div className="tips-card">
            <h3>Tips for this question:</h3>
            <ul>
              <li>Structure your answer using the STAR method</li>
              <li>Keep your response under 2 minutes</li>
              <li>Include specific examples from your experience</li>
              <li>Maintain good eye contact with the camera</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MockInterview; 
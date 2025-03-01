import React, { useState, useEffect, useRef } from 'react';
import './MockInterview.css';

const MockInterview = () => {
  const [time, setTime] = useState(120); // 2 minutes in seconds
  const [isRunning, setIsRunning] = useState(false);
  const videoRef = useRef(null);
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [questionCount, setQuestionCount] = useState(1); // Start at 1 instead of 0
  const [isSessionComplete, setIsSessionComplete] = useState(false);

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
    if (questionCount >= 5) { // Check for 5 instead of 4
      setIsSessionComplete(true);
      return;
    }
    const randomIndex = Math.floor(Math.random() * sampleQuestions.length);
    setCurrentQuestion(sampleQuestions[randomIndex]);
    setQuestionCount(prevCount => prevCount + 1);
    // Reset timer for new question
    setTime(120);
    setIsRunning(false);
  };

  const startNewSession = () => {
    setQuestionCount(1); // Reset to 1 instead of 0
    setIsSessionComplete(false);
    setTime(120);
    setIsRunning(false);
    // Set initial question without incrementing counter
    const randomIndex = Math.floor(Math.random() * sampleQuestions.length);
    setCurrentQuestion(sampleQuestions[randomIndex]);
  };

  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setTime(120); // Reset to 2 minutes
    setIsRunning(false);
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const isLastQuestion = questionCount === 5; // Check for 5 instead of 4

  return (
    <div className="mock-interview-container">
      <div className="interview-header">
        <h1>Mock Interview Practice</h1>
        <p>Practice your interview skills with real-time feedback</p>
        <div className="question-counter">
          Question {questionCount} of 5
        </div>
      </div>

      <div className="interview-main">
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
          <div className="timer-container">
            <div className="timer-display">{formatTime(time)}</div>
            <div className="timer-controls">
              <button 
                className={`timer-button ${isRunning ? 'pause' : 'start'}`}
                onClick={toggleTimer}
              >
                {isRunning ? 'Pause' : 'Start'}
              </button>
              <button 
                className="timer-button reset"
                onClick={resetTimer}
              >
                Reset
              </button>
            </div>
          </div>
        </div>

        <div className="question-section">
          <div className="question-card">
            <h2>Interview Question:</h2>
            <p className="question-text">{currentQuestion}</p>
            {isSessionComplete ? (
              <div className="session-complete">
                <p className="completion-message">Practice session complete! 🎉</p>
                <button 
                  className="new-session-button"
                  onClick={startNewSession}
                >
                  Start New Session
                </button>
              </div>
            ) : (
              <button 
                className="next-question-button"
                onClick={generateNewQuestion}
              >
                {isLastQuestion ? 'Complete Session' : 'Next Question'}
              </button>
            )}
          </div>
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
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './MockInterview.css';

const MockInterview = () => {
  const navigate = useNavigate();
  const [time, setTime] = useState(120);
  const [isRunning, setIsRunning] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [isStopped, setIsStopped] = useState(false);
  const videoRef = useRef(null);
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [questionCount, setQuestionCount] = useState(1);
  const [isSessionComplete, setIsSessionComplete] = useState(false);
  const [stream, setStream] = useState(null);
  const location = useLocation();

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

  const stopCamera = useCallback(() => {
    console.log('stopCamera function called', new Date().toISOString());

    if (stream) {
      console.log('Stopping stream tracks...', stream.getTracks().length, 'tracks found');
      stream.getTracks().forEach(track => {
        console.log('Stopping track:', track.kind, track.readyState);
        track.stop();
        track.enabled = false;
        console.log('Track stopped:', track.readyState);
      });
      setStream(null);
    }

    if (videoRef.current && videoRef.current.srcObject) {
      console.log('Cleaning up video element source');
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => {
        track.stop();
        track.enabled = false;
      });
      videoRef.current.srcObject = null;
    }
  }, [stream]);

  // Component mount/unmount cleanup
  useEffect(() => {
    console.log('Component mounted');
    startCamera();

    return () => {
      console.log('Component unmounting cleanup');
      stopCamera();
    };
  }, [stopCamera]);

  // Route change cleanup
  useEffect(() => {
    console.log('Location changed:', location.pathname);

    return () => {
      console.log('Route change cleanup triggered');
      stopCamera();
    };
  }, [location, stopCamera]);

  // Navigation guard
  const handleNavigation = useCallback((to) => {
    console.log('Navigation requested to:', to);
    stopCamera();
    navigate(to);
  }, [navigate, stopCamera]);

  // Optional: Add a confirmation dialog when leaving the page
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      console.log('beforeunload event triggered');
      stopCamera();
      // Optional: Show confirmation dialog
      e.preventDefault();
      e.returnValue = '';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [stopCamera]);

  useEffect(() => {
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
      setStream(stream);
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

  const isLastQuestion = questionCount === 5;

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
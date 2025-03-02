import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { uploadInterviewVideo } from '../services/videoService';
import { getUser } from '../services/auth';
import InterviewAnalysis from './InterviewAnalysis';
import './MockInterview.css';

const MockInterview = () => {
  const navigate = useNavigate();
  const [time, setTime] = useState(120);
  const [isRunning, setIsRunning] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [isStopped, setIsStopped] = useState(false);
  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [questionCount, setQuestionCount] = useState(1);
  const [isSessionComplete, setIsSessionComplete] = useState(false);
  const [recordings, setRecordings] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingError, setRecordingError] = useState(null);
  const chunksRef = useRef([]);
  const isAuthenticated = !!getUser();

  // Sample questions - in a real app, these would come from an API or database
  const sampleQuestions = [
    "Tell me about yourself and your experience.",
    "What are your greatest strengths and weaknesses?",
    "Why are you interested in this position?",
    "Where do you see yourself in 5 years?",
    "Describe a challenging situation at work and how you handled it."
  ];

  // Analysis data state
  const [analysisData, setAnalysisData] = useState({
    overallScore: 85,
    totalDuration: "10:00",
    questions: []
  });

  // Update analysis data when session completes
  useEffect(() => {
    if (isSessionComplete) {
      setAnalysisData({
        overallScore: 85,
        totalDuration: formatTime(time * questionCount),
        questions: recordings.map(recording => ({
          id: recording.questionNumber,
          question: sampleQuestions[recording.questionNumber - 1],
          duration: "2:00",
          metrics: {
            confidence: Math.floor(Math.random() * 20) + 80,
            clarity: Math.floor(Math.random() * 20) + 80,
            eyeContact: Math.floor(Math.random() * 20) + 80,
            pacing: Math.floor(Math.random() * 20) + 80
          },
          strengths: [
            "Clear and confident delivery",
            "Good use of specific examples",
            "Well-structured response"
          ],
          improvements: [
            "Could provide more detailed examples",
            "Consider speaking at a slightly slower pace"
          ],
          keywordsCovered: ["Experience", "Skills", "Projects", "Goals"],
          transcription: isAuthenticated 
            ? "Full transcription available for authenticated users..."
            : "Sign up to access full transcription and save your progress!"
        }))
      });
    }
  }, [isSessionComplete, recordings, questionCount, time, sampleQuestions, isAuthenticated]);

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

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

  const startRecording = async () => {
    try {
      chunksRef.current = [];
      const stream = videoRef.current.srcObject;
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp8,opus'
      });

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const videoBlob = new Blob(chunksRef.current, { type: 'video/webm' });
        try {
          const result = await uploadInterviewVideo(videoBlob, questionCount);
          setRecordings(prev => [...prev, {
            url: result.url,
            timestamp: result.timestamp,
            questionNumber: questionCount,
            isAuthenticated: result.isAuthenticated,
            filename: result.filename
          }]);
        } catch (error) {
          console.error('Error saving recording:', error);
          setRecordingError('Failed to save recording. Please try again.');
        }
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
      setRecordingError('Failed to start recording. Please check camera permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const toggleTimer = () => {
    if (!hasStarted) {
      // First time starting
      setHasStarted(true);
      setIsRunning(true);
      startRecording();
    } else {
      // Stopping the timer
      setIsRunning(false);
      setIsStopped(true);
      stopRecording();
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

  // Clean up URLs when component unmounts
  useEffect(() => {
    return () => {
      // Clean up object URLs
      recordings.forEach(recording => {
        if (recording.url) {
          URL.revokeObjectURL(recording.url);
        }
      });
    };
  }, [recordings]);

  return (
    <div className="mock-interview-container">
      <h1>Mock Interview Practice</h1>
      {recordingError && (
        <div className="error-message">
          {recordingError}
        </div>
      )}
      
      {isSessionComplete ? (
        <>
          <div className="session-complete">
            <p className="completion-message">Practice session complete! 🎉</p>
          </div>
          <InterviewAnalysis analysisData={analysisData} />
          {!isAuthenticated && (
            <div className="login-prompt-container">
              <p>Want more features? Create an account to:</p>
              <ul>
                <li>Save your recordings permanently</li>
                <li>Access full interview transcriptions</li>
                <li>Track your progress over time</li>
                <li>Get personalized improvement recommendations</li>
              </ul>
              <button 
                className="login-button"
                onClick={() => navigate('/login')}
              >
                Sign Up Now
              </button>
            </div>
          )}
        </>
      ) : (
        <>
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
                <div className="question-container">
                  <h2>Interview Question:</h2>
                  <p className="question-text">{currentQuestion}</p>
                </div>
              </div>
            </div>

            <div className="controls-section">
              <div className="question-counter">
                Question {questionCount} of 5
              </div>
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

          {recordings.length > 0 && (
            <div className="recordings-section">
              <h2>Your Recordings</h2>
              <div className="recordings-grid">
                {recordings.map((recording, index) => (
                  <div key={index} className="recording-card">
                    <h3>Question {recording.questionNumber}</h3>
                    <video controls src={recording.url} className="recording-playback" />
                    <p className="recording-timestamp">
                      Recorded at: {new Date(recording.timestamp).toLocaleTimeString()}
                    </p>
                    {!recording.isAuthenticated && (
                      <p className="login-prompt">
                        Sign up to save your recordings permanently
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default MockInterview; 
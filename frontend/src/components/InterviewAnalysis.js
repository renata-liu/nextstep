import React from 'react';
import './InterviewAnalysis.css';

const InterviewAnalysis = ({ analysisData }) => {
  // This is placeholder data - replace with actual data from backend
  const mockAnalysis = {
    overallScore: 85,
    totalDuration: "15:30",
    questions: [
      {
        id: 1,
        question: "Tell me about yourself and your experience with React.",
        duration: "1:34",
        metrics: {
          confidence: 82,
          clarity: 88,
          eyeContact: 75,
          pacing: 85
        },
        strengths: [
          "Strong opening statement",
          "Clear project examples",
          "Good technical depth"
        ],
        improvements: [
          "Could maintain more consistent eye contact",
          "Slight tendency to speak quickly when discussing technical details"
        ],
        keywordsCovered: ["React", "Components", "State Management", "APIs"],
        transcription: "I have been working with React for the past three years..."
      },
      // Add more questions as needed
    ]
  };

  return (
    <div className="analysis-container">
      <header className="analysis-header">
        <h1>Mock Interview Analysis</h1>
        <div className="overall-score">
          <div className="score-circle">
            <span className="score-number">{mockAnalysis.overallScore}</span>
            <span className="score-label">Overall Score</span>
          </div>
          <div className="total-time">
            <span className="time-label">Total Duration</span>
            <span className="time-value">{mockAnalysis.totalDuration}</span>
          </div>
        </div>
      </header>

      <div className="questions-analysis">
        {mockAnalysis.questions.map((q, index) => (
          <div key={q.id} className="question-analysis-card">
            <div className="question-header">
              <h2>Question {index + 1}</h2>
              <span className="duration">Duration: {q.duration}</span>
            </div>

            <div className="question-text">
              <h3>Question:</h3>
              <p>{q.question}</p>
            </div>

            <div className="metrics-grid">
              <div className="metric">
                <label>Confidence</label>
                <div className="metric-bar">
                  <div className="metric-fill" style={{ width: `${q.metrics.confidence}%` }}></div>
                  <span>{q.metrics.confidence}%</span>
                </div>
              </div>
              <div className="metric">
                <label>Clarity</label>
                <div className="metric-bar">
                  <div className="metric-fill" style={{ width: `${q.metrics.clarity}%` }}></div>
                  <span>{q.metrics.clarity}%</span>
                </div>
              </div>
              <div className="metric">
                <label>Eye Contact</label>
                <div className="metric-bar">
                  <div className="metric-fill" style={{ width: `${q.metrics.eyeContact}%` }}></div>
                  <span>{q.metrics.eyeContact}%</span>
                </div>
              </div>
              <div className="metric">
                <label>Pacing</label>
                <div className="metric-bar">
                  <div className="metric-fill" style={{ width: `${q.metrics.pacing}%` }}></div>
                  <span>{q.metrics.pacing}%</span>
                </div>
              </div>
            </div>

            <div className="analysis-sections">
              <div className="strengths-section">
                <h3>Strengths</h3>
                <ul>
                  {q.strengths.map((strength, i) => (
                    <li key={i}>{strength}</li>
                  ))}
                </ul>
              </div>

              <div className="improvements-section">
                <h3>Areas for Improvement</h3>
                <ul>
                  {q.improvements.map((improvement, i) => (
                    <li key={i}>{improvement}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="keywords-section">
              <h3>Key Topics Covered</h3>
              <div className="keywords-list">
                {q.keywordsCovered.map((keyword, i) => (
                  <span key={i} className="keyword-tag">{keyword}</span>
                ))}
              </div>
            </div>

            <div className="transcription-section">
              <h3>Answer Transcription</h3>
              <p className="transcription-text">{q.transcription}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default InterviewAnalysis; 
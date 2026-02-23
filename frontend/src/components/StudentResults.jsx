import React, { useState, useEffect } from 'react';
import { getMyAssessmentAttempts, getAttemptDetails } from '../api/assessmentApi';
import './StudentResults.css';

const StudentResults = () => {
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedAttempt, setSelectedAttempt] = useState(null);
  const [attemptDetails, setAttemptDetails] = useState(null);

  useEffect(() => {
    loadMyAttempts();
  }, []);

  const loadMyAttempts = async () => {
    try {
      setLoading(true);
      const data = await getMyAssessmentAttempts();
      setAttempts(data || []);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load results');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = async (attempt) => {
    try {
      const details = await getAttemptDetails(attempt.id);
      setAttemptDetails(details);
      setSelectedAttempt(attempt);
    } catch (err) {
      alert('Failed to load attempt details');
      console.error(err);
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'Pending';
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const getResultBadge = (attempt) => {
    if (!attempt.marksObtained && attempt.marksObtained !== 0) {
      return <span className="badge badge-info">Pending</span>;
    }
    if (attempt.marksObtained >= attempt.assessment?.passingMarks) {
      return <span className="badge badge-success">Passed</span>;
    }
    return <span className="badge badge-danger">Failed</span>;
  };

  const calculatePercentage = (obtained, total) => {
    if (!total) return 0;
    return ((obtained / total) * 100).toFixed(1);
  };

  if (loading) {
    return (
      <div className="student-results">
        <div className="loading">Loading your results...</div>
      </div>
    );
  }

  if (selectedAttempt && attemptDetails) {
    return (
      <div className="student-results">
        <button className="btn btn-secondary" onClick={() => {
          setSelectedAttempt(null);
          setAttemptDetails(null);
        }}>
          ← Back to Results
        </button>

        <div className="result-detail-card">
          <div className="detail-header">
            <div>
              <h2>{selectedAttempt.assessment?.title}</h2>
              <p className="course-name">{selectedAttempt.assessment?.course?.courseName}</p>
            </div>
            {getResultBadge(selectedAttempt)}
          </div>

          {selectedAttempt.marksObtained !== null && selectedAttempt.marksObtained !== undefined && (
            <div className="marks-section">
              <div className="marks-display">
                <div className="marks-number">
                  {selectedAttempt.marksObtained} / {selectedAttempt.assessment?.totalMarks}
                </div>
                <div className="percentage">
                  {calculatePercentage(selectedAttempt.marksObtained, selectedAttempt.assessment?.totalMarks)}%
                </div>
              </div>
              <div className="marks-bar">
                <div
                  className="marks-fill"
                  style={{
                    width: `${calculatePercentage(selectedAttempt.marksObtained, selectedAttempt.assessment?.totalMarks)}%`
                  }}
                />
              </div>
            </div>
          )}

          <div className="metadata-section">
            <div className="metadata-item">
              <strong>Duration:</strong> {selectedAttempt.assessment?.durationMinutes} minutes
            </div>
            <div className="metadata-item">
              <strong>Submitted:</strong> {formatDateTime(selectedAttempt.submittedAt)}
            </div>
            {selectedAttempt.marksObtained !== null && selectedAttempt.marksObtained !== undefined && (
              <>
                <div className="metadata-item">
                  <strong>Graded:</strong> {formatDateTime(selectedAttempt.gradedAt)}
                </div>
              </>
            )}
          </div>

          {selectedAttempt.feedback && (
            <div className="feedback-section">
              <h4>Feedback</h4>
              <p>{selectedAttempt.feedback}</p>
            </div>
          )}

          {attemptDetails && attemptDetails.answers && (
            <div className="answers-section">
              <h4>Your Answers</h4>
              <div className="answers-list">
                {attemptDetails.answers.map((answer, idx) => (
                  <div key={idx} className={`answer-item ${answer.isCorrect ? 'correct' : answer.isCorrect === false ? 'incorrect' : 'subjective'}`}>
                    <div className="answer-header">
                      <h5>Question {idx + 1}</h5>
                      {answer.isCorrect === true && <span className="badge badge-success">✓ Correct</span>}
                      {answer.isCorrect === false && <span className="badge badge-danger">✗ Incorrect</span>}
                      {answer.questionType === 'SHORT_ANSWER' || answer.questionType === 'ESSAY' && answer.isCorrect === null && (
                        <span className="badge badge-warning">Manual Grading</span>
                      )}
                    </div>
                    <p className="question-text">{answer.questionText}</p>
                    <p className="question-type">Type: <em>{answer.questionType}</em></p>
                    <div className="answer-content">
                      <p><strong>Your Answer:</strong></p>
                      <p className="answer-text">{answer.studentAnswer || 'No answer provided'}</p>
                    </div>
                    {(answer.questionType === 'MULTIPLE_CHOICE' || answer.questionType === 'TRUE_FALSE') && (
                      <div className="correct-answer-content">
                        <p><strong>Correct Answer:</strong> {answer.correctAnswer}</p>
                      </div>
                    )}
                    {answer.marks && (
                      <p className="marks-awarded">Marks: {answer.marks}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="student-results">
      <h1>My Assessment Results</h1>

      {error && <div className="error-message">{error}</div>}

      {attempts.length === 0 ? (
        <div className="info-message">No attempts yet</div>
      ) : (
        <div className="results-grid">
          {attempts.map((attempt) => (
            <div key={attempt.id} className="result-card">
              <div className="card-header">
                <h3>{attempt.assessment?.title}</h3>
                {getResultBadge(attempt)}
              </div>

              <p className="course-info">{attempt.assessment?.course?.courseName}</p>

              <div className="assessment-info">
                <div className="info-row">
                  <span>Type:</span>
                  <strong>{attempt.assessment?.assessmentType}</strong>
                </div>
                {attempt.marksObtained !== null && attempt.marksObtained !== undefined && (
                  <div className="info-row marks-row">
                    <span>Marks:</span>
                    <strong>
                      {attempt.marksObtained} / {attempt.assessment?.totalMarks}
                      {' '}
                      <span className="percentage">
                        ({calculatePercentage(attempt.marksObtained, attempt.assessment?.totalMarks)}%)
                      </span>
                    </strong>
                  </div>
                )}
              </div>

              <div className="card-footer">
                <div className="date-info">
                  <small>Submitted: {formatDateTime(attempt.submittedAt)}</small>
                  {attempt.marksObtained !== null && attempt.marksObtained !== undefined && (
                    <small>Graded: {formatDateTime(attempt.gradedAt)}</small>
                  )}
                </div>
                <button
                  className="btn btn-primary"
                  onClick={() => handleViewDetails(attempt)}
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentResults;

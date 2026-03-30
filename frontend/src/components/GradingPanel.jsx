import React, { useState, useEffect } from 'react';
import { getAssessmentAttempts, gradeAttempt, getAttemptDetails } from '../api/assessmentApi';
import './GradingPanel.css';

const GradingPanel = ({ assessmentId, assessmentTitle, totalMarks, onClose } ) => {
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [gradingAttemptId, setGradingAttemptId] = useState(null);
  const [attemptDetails, setAttemptDetails] = useState(null);
  const [gradeData, setGradeData] = useState({ marksObtained: '', feedback: '' });
  const [grading, setGrading] = useState(false);

  useEffect(() => {
    loadAttempts();
  }, [assessmentId]);

  const loadAttempts = async () => {
    try {
      setLoading(true);
      const data = await getAssessmentAttempts(assessmentId);
      setAttempts(data || []);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load submissions');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleGradeClick = async (attempt) => {
    try {
      const details = await getAttemptDetails(attempt.id);
      setAttemptDetails(details);
      setGradingAttemptId(attempt.id);
      setGradeData({
        marksObtained: attempt.marksObtained || '',
        feedback: attempt.feedback || ''
      });
    } catch (err) {
      alert('Failed to load attempt details');
      console.error(err);
    }
  };

  const handleGradeChange = (e) => {
    const { name, value } = e.target;
    setGradeData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmitGrade = async (e) => {
    e.preventDefault();

    if (!gradeData.marksObtained) {
      alert('Please enter marks');
      return;
    }

    if (parseInt(gradeData.marksObtained) > totalMarks) {
      alert(`Marks cannot exceed ${totalMarks}`);
      return;
    }

    try {
      setGrading(true);
      await gradeAttempt(gradingAttemptId, gradeData);
      
      // Update local state
      setAttempts(prev => prev.map(attempt =>
        attempt.id === gradingAttemptId
          ? {
              ...attempt,
              marksObtained: parseInt(gradeData.marksObtained),
              feedback: gradeData.feedback,
              status: 'GRADED'
            }
          : attempt
      ));

      setGradingAttemptId(null);
      setAttemptDetails(null);
      setGradeData({ marksObtained: '', feedback: '' });
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save grade');
      console.error(err);
    } finally {
      setGrading(false);
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'Not submitted';
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const getStatusBadge = (attempt) => {
    if (attempt.autoGraded) {
      return <span className="badge badge-info">Auto-Graded</span>;
    }
    if (attempt.status === 'GRADED' || (attempt.marksObtained !== null && attempt.marksObtained !== undefined)) {
      return <span className="badge badge-success">Graded</span>;
    }
    if (attempt.status === 'IN_PROGRESS') {
      return <span className="badge badge-warning">In Progress</span>;
    }
    return <span className="badge badge-warning">Pending</span>;
  };

  if (loading) {
    return (
      <div className="grading-panel-modal">
        <div className="modal-content">
          <button className="close-btn" onClick={onClose}>&times;</button>
          <div className="loading">Loading attempts...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="grading-panel-modal">
      <div className="modal-content large-modal">
        <div className="modal-header">
          <h2>Grade: {assessmentTitle}</h2>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>

        {error && <div className="error-message">{error}</div>}

        {attempts.length === 0 ? (
          <div className="info-message">No submissions yet</div>
        ) : (
          <div className="attempts-list">
            {attempts.map((attempt) => (
              <div key={attempt.id} className="attempt-item">
                <div className="attempt-header">
                  <div className="student-info">
                    <h4>{attempt.student?.fullName || 'Student'}</h4>
                    <p className="student-email">{attempt.student?.email}</p>
                  </div>
                  <div className="status-badge">
                    {getStatusBadge(attempt)}
                  </div>
                </div>

                <div className="attempt-metadata">
                  <div className="metadata-item">
                    <strong>Submitted:</strong> {formatDateTime(attempt.submittedAt)}
                  </div>
                  {attempt.marksObtained !== null && attempt.marksObtained !== undefined && (
                    <div className="metadata-item">
                      <strong>Marks:</strong> {attempt.marksObtained} / {totalMarks}
                    </div>
                  )}
                </div>

                {gradingAttemptId === attempt.id ? (
                  <form onSubmit={handleSubmitGrade} className="grading-form">
                    {attemptDetails && (
                      <div className="attempt-details">
                        <h5>Student Answers:</h5>
                        {attemptDetails.answers && attemptDetails.answers.map((answer, idx) => (
                          <div key={idx} className="answer-detail">
                            <strong>Q{idx + 1}: {answer.questionText}</strong>
                            <p><em>Type: {answer.questionType}</em></p>
                            <p className="student-answer">Student Answer: {answer.studentAnswer || 'No answer'}</p>
                            {answer.questionType !== 'SHORT_ANSWER' && answer.questionType !== 'ESSAY' && (
                              <p className="correct-answer">Correct Answer: {answer.correctAnswer}</p>
                            )}
                            {(answer.marks !== null && answer.marks !== undefined) && <p className="marks">Marks: {answer.marks}</p>}
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="form-group">
                      <label htmlFor={`marks-${attempt.id}`}>Marks Obtained (Max: {totalMarks})</label>
                      <input
                        type="number"
                        id={`marks-${attempt.id}`}
                        name="marksObtained"
                        value={gradeData.marksObtained}
                        onChange={handleGradeChange}
                        min="0"
                        max={totalMarks}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor={`feedback-${attempt.id}`}>Feedback</label>
                      <textarea
                        id={`feedback-${attempt.id}`}
                        name="feedback"
                        value={gradeData.feedback}
                        onChange={handleGradeChange}
                        rows="3"
                        placeholder="Enter your feedback here..."
                      />
                    </div>

                    <div className="form-actions">
                      <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={grading}
                      >
                        {grading ? 'Saving...' : 'Save Grade'}
                      </button>
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => {
                          setGradingAttemptId(null);
                          setAttemptDetails(null);
                          setGradeData({ marksObtained: '', feedback: '' });
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="attempt-actions">
                    {attemptDetails && (
                      <div className="marks-display">
                        <strong>Marks:</strong> {attempt.marksObtained} / {totalMarks}
                        {attempt.feedback && (
                          <div className="feedback-display">
                            <strong>Feedback:</strong> {attempt.feedback}
                          </div>
                        )}
                      </div>
                    )}
                    <button
                      className="btn btn-secondary"
                      onClick={() => handleGradeClick(attempt)}
                    >
                      {attempt.marksObtained !== null && attempt.marksObtained !== undefined ? 'Edit Grade' : 'Grade'}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
};

export default GradingPanel;

import React, { useState, useEffect } from 'react';
import { getSubmissions, gradeSubmission } from '../api/assignmentApi';
import './SubmissionViewer.css';

const SubmissionViewer = ({ assignmentId, assignmentTitle, maxMarks, onClose }) => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [gradingSubmissionId, setGradingSubmissionId] = useState(null);
  const [gradeData, setGradeData] = useState({ marksObtained: '', feedback: '' });
  const [grading, setGrading] = useState(false);

  useEffect(() => {
    loadSubmissions();
  }, [assignmentId]);

  const loadSubmissions = async () => {
    try {
      setLoading(true);
      const data = await getSubmissions(assignmentId);
      setSubmissions(data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load submissions');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleGradeClick = (submission) => {
    setGradingSubmissionId(submission.id);
    setGradeData({
      marksObtained: submission.marksObtained || '',
      feedback: submission.feedback || ''
    });
  };

  const handleGradeChange = (e) => {
    const { name, value } = e.target;
    setGradeData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmitGrade = async (e) => {
    e.preventDefault();

    try {
      setGrading(true);
      await gradeSubmission(gradingSubmissionId, gradeData);
      
      // Update local state
      setSubmissions(prev => prev.map(sub => 
        sub.id === gradingSubmissionId 
          ? {
              ...sub,
              marksObtained: parseInt(gradeData.marksObtained),
              feedback: gradeData.feedback,
              gradedAt: new Date().toISOString()
            }
          : sub
      ));

      setGradingSubmissionId(null);
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

  const getStatusBadge = (submission) => {
    if (submission.marksObtained !== null && submission.marksObtained !== undefined) {
      return <span className="badge badge-success">Graded</span>;
    }
    return <span className="badge badge-warning">Pending</span>;
  };

  if (loading) {
    return (
      <div className="submission-viewer-modal">
        <div className="modal-content">
          <button className="close-btn" onClick={onClose}>&times;</button>
          <div className="loading">Loading submissions...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="submission-viewer-modal">
      <div className="modal-content large-modal">
        <div className="modal-header">
          <h2>Submissions for: {assignmentTitle}</h2>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>

        {error && <div className="error-message">{error}</div>}

        {submissions.length === 0 ? (
          <div className="info-message">No submissions yet</div>
        ) : (
          <div className="submissions-list">
            {submissions.map((submission) => (
              <div key={submission.id} className="submission-item">
                <div className="submission-header">
                  <div className="student-info">
                    <h4>{submission.student?.fullName || 'Student'}</h4>
                    <p className="student-email">{submission.student?.email}</p>
                  </div>
                  <div className="submission-status">
                    {getStatusBadge(submission)}
                  </div>
                </div>

                <div className="submission-content">
                  <div className="submission-text-section">
                    <h5>Submission:</h5>
                    <p className="submission-text">{submission.submissionText || 'No text provided'}</p>
                  </div>

                  {submission.fileUrl && (
                    <div className="submission-url-section">
                      <h5>URL:</h5>
                      <a href={submission.fileUrl} target="_blank" rel="noopener noreferrer">
                        {submission.fileUrl}
                      </a>
                    </div>
                  )}

                  <div className="submission-metadata">
                    <div className="metadata-item">
                      <strong>Submitted:</strong> {formatDateTime(submission.submittedAt)}
                    </div>
                    {submission.gradedAt && (
                      <div className="metadata-item">
                        <strong>Graded:</strong> {formatDateTime(submission.gradedAt)}
                        {submission.gradedBy && (
                          <span> by {submission.gradedBy.fullName}</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {gradingSubmissionId === submission.id ? (
                  <form onSubmit={handleSubmitGrade} className="grading-form">
                    <div className="form-group">
                      <label htmlFor={`marks-${submission.id}`}>Marks Obtained (Max: {maxMarks})</label>
                      <input
                        type="number"
                        id={`marks-${submission.id}`}
                        name="marksObtained"
                        value={gradeData.marksObtained}
                        onChange={handleGradeChange}
                        min="0"
                        max={maxMarks}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor={`feedback-${submission.id}`}>Feedback</label>
                      <textarea
                        id={`feedback-${submission.id}`}
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
                          setGradingSubmissionId(null);
                          setGradeData({ marksObtained: '', feedback: '' });
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="submission-actions">
                    {submission.marksObtained !== null && submission.marksObtained !== undefined ? (
                      <div className="marks-display">
                        <strong>Marks:</strong> {submission.marksObtained} / {maxMarks}
                        {submission.feedback && (
                          <div className="feedback-display">
                            <strong>Feedback:</strong> {submission.feedback}
                          </div>
                        )}
                      </div>
                    ) : null}
                    <button 
                      className="btn btn-secondary"
                      onClick={() => handleGradeClick(submission)}
                    >
                      {submission.marksObtained !== null && submission.marksObtained !== undefined ? 'Edit Grade' : 'Grade'}
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

export default SubmissionViewer;

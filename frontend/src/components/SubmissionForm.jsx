import React, { useState } from 'react';
import { submitAssignment } from '../api/assignmentApi';

const SubmissionForm = ({ assignment, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    submissionText: '',
    fileUrl: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.submissionText && !formData.fileUrl) {
      setError('Please provide either submission text or file URL');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      await submitAssignment(assignment.id, formData);
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit assignment');
      console.error('Error submitting assignment:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  return (
    <div className="submission-form">
      <h3>Submit Assignment</h3>
      
      <div className="assignment-info">
        <h4>{assignment.title}</h4>
        <p className="assignment-desc">{assignment.description}</p>
        <div className="assignment-details">
          <span><strong>Due:</strong> {formatDateTime(assignment.dueDate)}</span>
          <span><strong>Max Marks:</strong> {assignment.maxMarks}</span>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="submissionText">Submission Text</label>
          <textarea
            id="submissionText"
            name="submissionText"
            value={formData.submissionText}
            onChange={handleChange}
            rows="6"
            placeholder="Enter your submission text here..."
          />
        </div>

        <div className="form-group">
          <label htmlFor="fileUrl">File URL (Optional)</label>
          <input
            type="url"
            id="fileUrl"
            name="fileUrl"
            value={formData.fileUrl}
            onChange={handleChange}
            placeholder="https://example.com/your-file.pdf"
          />
          <small className="form-help">
            Upload your file to a cloud service (Google Drive, Dropbox, etc.) and paste the link here
          </small>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Submitting...' : 'Submit'}
          </button>
          <button type="button" className="btn btn-secondary" onClick={onCancel}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default SubmissionForm;

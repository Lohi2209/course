import React, { useState, useEffect } from 'react';
import { createAssessment } from '../api/assessmentApi';

const AssessmentForm = ({ assessment, courseId, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    assessmentType: 'QUIZ',
    dueDate: '',
    durationMinutes: '',
    totalMarks: '',
    passingMarks: '',
    autoGrade: true,
    courseId: courseId
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (assessment) {
      setFormData({
        title: assessment.title || '',
        description: assessment.description || '',
        assessmentType: assessment.assessmentType || 'QUIZ',
        dueDate: assessment.dueDate ? new Date(assessment.dueDate).toISOString().slice(0, 16) : '',
        durationMinutes: assessment.durationMinutes || '',
        totalMarks: assessment.totalMarks || '',
        passingMarks: assessment.passingMarks || '',
        autoGrade: assessment.autoGrade !== undefined ? assessment.autoGrade : true,
        courseId: assessment.course?.id || courseId
      });
    }
  }, [assessment, courseId]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.dueDate || !formData.totalMarks) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      await createAssessment(formData);
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save assessment');
      console.error('Error saving assessment:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="assessment-form">
      <h3>{assessment ? 'Edit Assessment' : 'Create Assessment'}</h3>
      
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title">Title *</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="3"
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="assessmentType">Type *</label>
            <select
              id="assessmentType"
              name="assessmentType"
              value={formData.assessmentType}
              onChange={handleChange}
              required
            >
              <option value="QUIZ">Quiz</option>
              <option value="EXAM">Exam</option>
              <option value="ASSIGNMENT">Assignment</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="durationMinutes">Duration (minutes) *</label>
            <input
              type="number"
              id="durationMinutes"
              name="durationMinutes"
              value={formData.durationMinutes}
              onChange={handleChange}
              min="1"
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="dueDate">Due Date *</label>
          <input
            type="datetime-local"
            id="dueDate"
            name="dueDate"
            value={formData.dueDate}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="totalMarks">Total Marks *</label>
            <input
              type="number"
              id="totalMarks"
              name="totalMarks"
              value={formData.totalMarks}
              onChange={handleChange}
              min="1"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="passingMarks">Passing Marks *</label>
            <input
              type="number"
              id="passingMarks"
              name="passingMarks"
              value={formData.passingMarks}
              onChange={handleChange}
              min="0"
              max={formData.totalMarks}
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              name="autoGrade"
              checked={formData.autoGrade}
              onChange={handleChange}
            />
            Enable Auto-Grading (for MCQ and True/False questions)
          </label>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Saving...' : (assessment ? 'Update' : 'Create')}
          </button>
          <button type="button" className="btn btn-secondary" onClick={onCancel}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default AssessmentForm;

import React, { useState, useEffect } from 'react';
import { createAssignment, updateAssignment } from '../api/assignmentApi';

const AssignmentForm = ({ assignment, courseId, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dueDate: '',
    maxMarks: '',
    courseId: courseId
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (assignment) {
      setFormData({
        title: assignment.title || '',
        description: assignment.description || '',
        dueDate: assignment.dueDate ? new Date(assignment.dueDate).toISOString().slice(0, 16) : '',
        maxMarks: assignment.maxMarks || '',
        courseId: assignment.course?.id || courseId
      });
    }
  }, [assignment, courseId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.dueDate || !formData.maxMarks) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      if (assignment) {
        await updateAssignment(assignment.id, formData);
      } else {
        await createAssignment(formData);
      }
      
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save assignment');
      console.error('Error saving assignment:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="assignment-form">
      <h3>{assignment ? 'Edit Assignment' : 'Create Assignment'}</h3>
      
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
            rows="4"
          />
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

        <div className="form-group">
          <label htmlFor="maxMarks">Maximum Marks *</label>
          <input
            type="number"
            id="maxMarks"
            name="maxMarks"
            value={formData.maxMarks}
            onChange={handleChange}
            min="1"
            required
          />
        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Saving...' : (assignment ? 'Update' : 'Create')}
          </button>
          <button type="button" className="btn btn-secondary" onClick={onCancel}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default AssignmentForm;

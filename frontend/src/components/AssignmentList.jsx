import React, { useState, useEffect } from 'react';
import { getAssignmentsByCourse, deleteAssignment } from '../api/assignmentApi';

const AssignmentList = ({ courseId, onEdit, onSubmit, userRole }) => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (courseId) {
      loadAssignments();
    }
  }, [courseId]);

  const loadAssignments = async () => {
    try {
      setLoading(true);
      const data = await getAssignmentsByCourse(courseId);
      setAssignments(data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load assignments');
      console.error('Error loading assignments:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this assignment?')) {
      return;
    }
    
    try {
      await deleteAssignment(id);
      setAssignments(assignments.filter(a => a.id !== id));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete assignment');
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const isPastDue = (dueDate) => {
    return new Date(dueDate) < new Date();
  };

  if (loading) {
    return <div className="loading">Loading assignments...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="assignment-list">
      {assignments.length === 0 ? (
        <p className="info-message">No assignments found for this course</p>
      ) : (
        <div className="assignments-grid">
          {assignments.map((assignment) => (
            <div key={assignment.id} className="assignment-card">
              <div className="assignment-header">
                <h4>{assignment.title}</h4>
                {isPastDue(assignment.dueDate) && (
                  <span className="badge badge-danger">Past Due</span>
                )}
              </div>
              <p className="assignment-desc">{assignment.description}</p>
              <div className="assignment-details">
                <span className="detail-item">
                  <strong>Due:</strong> {formatDateTime(assignment.dueDate)}
                </span>
                <span className="detail-item">
                  <strong>Max Marks:</strong> {assignment.maxMarks}
                </span>
              </div>
              <div className="assignment-actions">
                {userRole === 'STUDENT' && (
                  <button 
                    className="btn btn-primary"
                    onClick={() => onSubmit(assignment)}
                  >
                    Submit
                  </button>
                )}
                {(userRole === 'FACULTY' || userRole === 'ADMIN' || userRole === 'HOD') && (
                  <>
                    <button 
                      className="btn btn-secondary"
                      onClick={() => onEdit(assignment)}
                    >
                      Edit
                    </button>
                    {(userRole === 'ADMIN' || userRole === 'HOD') && (
                      <button 
                        className="btn btn-danger"
                        onClick={() => handleDelete(assignment.id)}
                      >
                        Delete
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AssignmentList;

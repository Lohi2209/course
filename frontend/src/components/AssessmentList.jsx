import React, { useState, useEffect } from 'react';
import { getAssessmentsByCourse, deleteAssessment } from '../api/assessmentApi';

const AssessmentList = ({ courseId, onEdit, onTake, onViewQuestions, userRole }) => {
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (courseId) {
      loadAssessments();
    }
  }, [courseId]);

  const loadAssessments = async () => {
    try {
      setLoading(true);
      const data = await getAssessmentsByCourse(courseId);
      setAssessments(data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load assessments');
      console.error('Error loading assessments:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this assessment?')) {
      return;
    }
    
    try {
      await deleteAssessment(id);
      setAssessments(assessments.filter(a => a.id !== id));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete assessment');
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

  const getTypeBadgeClass = (type) => {
    switch(type) {
      case 'QUIZ': return 'badge-info';
      case 'EXAM': return 'badge-warning';
      case 'ASSIGNMENT': return 'badge-primary';
      default: return 'badge-secondary';
    }
  };

  if (loading) {
    return <div className="loading">Loading assessments...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="assessment-list">
      {assessments.length === 0 ? (
        <p className="info-message">No assessments found for this course</p>
      ) : (
        <div className="assessments-grid">
          {assessments.map((assessment) => (
            <div key={assessment.id} className="assessment-card">
              <div className="assessment-header">
                <h4>{assessment.title}</h4>
                <div className="badges">
                  <span className={`badge ${getTypeBadgeClass(assessment.assessmentType)}`}>
                    {assessment.assessmentType}
                  </span>
                  {isPastDue(assessment.dueDate) && (
                    <span className="badge badge-danger">Past Due</span>
                  )}
                  {assessment.autoGrade && (
                    <span className="badge badge-success">Auto-Graded</span>
                  )}
                </div>
              </div>
              <p className="assessment-desc">{assessment.description}</p>
              <div className="assessment-details">
                <span className="detail-item">
                  <strong>Due:</strong> {formatDateTime(assessment.dueDate)}
                </span>
                <span className="detail-item">
                  <strong>Duration:</strong> {assessment.durationMinutes} mins
                </span>
                <span className="detail-item">
                  <strong>Total Marks:</strong> {assessment.totalMarks}
                </span>
                <span className="detail-item">
                  <strong>Passing:</strong> {assessment.passingMarks}
                </span>
              </div>
              <div className="assessment-actions">
                {userRole === 'STUDENT' && (
                  <button 
                    className="btn btn-primary"
                    onClick={() => onTake(assessment)}
                    disabled={isPastDue(assessment.dueDate)}
                  >
                    Start Assessment
                  </button>
                )}
                {(userRole === 'FACULTY' || userRole === 'ADMIN' || userRole === 'HOD') && (
                  <>
                    <button 
                      className="btn btn-info"
                      onClick={() => onViewQuestions(assessment)}
                    >
                      View Questions
                    </button>
                    <button 
                      className="btn btn-secondary"
                      onClick={() => onEdit(assessment)}
                    >
                      Edit
                    </button>
                    {(userRole === 'ADMIN' || userRole === 'HOD') && (
                      <button 
                        className="btn btn-danger"
                        onClick={() => handleDelete(assessment.id)}
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

export default AssessmentList;

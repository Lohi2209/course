import React, { useState, useEffect } from 'react';
import { getCourses, getMyEnrolledCourses } from '../api/courseApi';
import { getAssignmentsByCourse, createAssignment, updateAssignment, deleteAssignment, submitAssignment } from '../api/assignmentApi';
import { getAuth } from '../api/authApi';
import SubmissionViewer from './SubmissionViewer';
import './AssignmentManager.css';

const AssignmentManager = () => {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState(null);
  const [submittingFor, setSubmittingFor] = useState(null);
  const [viewingSubmissionsFor, setViewingSubmissionsFor] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const auth = getAuth();
  const isStudent = auth?.role === 'STUDENT';
  const canCreate = auth?.role === 'ADMIN' || auth?.role === 'FACULTY' || auth?.role === 'HOD';
  const canDelete = auth?.role === 'ADMIN' || auth?.role === 'HOD';

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dueDate: '',
    maxMarks: ''
  });

  const [submissionData, setSubmissionData] = useState({
    submissionText: '',
    submissionUrl: ''
  });

  useEffect(() => {
    loadCourses();
  }, []);

  useEffect(() => {
    if (selectedCourse) {
      loadAssignments();
    }
  }, [selectedCourse]);

  const loadCourses = async () => {
    try {
      const data = isStudent ? await getMyEnrolledCourses() : await getCourses();
      setCourses(data);
      if (data.length > 0 && !selectedCourse) {
        setSelectedCourse(data[0]);
      }
    } catch (err) {
      setError('Failed to load courses');
      console.error(err);
    }
  };

  const loadAssignments = async () => {
    if (!selectedCourse) return;
    
    try {
      setLoading(true);
      const data = await getAssignmentsByCourse(selectedCourse.id);
      setAssignments(data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load assignments');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmissionChange = (e) => {
    const { name, value } = e.target;
    setSubmissionData(prev => ({ ...prev, [name]: value }));
  };

  const handleCreateOrUpdate = async (e) => {
    e.preventDefault();
    
    if (!selectedCourse) {
      setError('Please select a course');
      return;
    }

    try {
      setLoading(true);
      const payload = {
        ...formData,
        courseId: selectedCourse.id,
        maxMarks: parseInt(formData.maxMarks)
      };

      if (editingAssignment) {
        await updateAssignment(editingAssignment.id, payload);
      } else {
        await createAssignment(payload);
      }

      setFormData({ title: '', description: '', dueDate: '', maxMarks: '' });
      setEditingAssignment(null);
      setShowForm(false);
      await loadAssignments();
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save assignment');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (assignment) => {
    setEditingAssignment(assignment);
    setFormData({
      title: assignment.title,
      description: assignment.description || '',
      dueDate: assignment.dueDate ? new Date(assignment.dueDate).toISOString().slice(0, 16) : '',
      maxMarks: assignment.maxMarks
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure?')) return;
    
    try {
      await deleteAssignment(id);
      await loadAssignments();
    } catch (err) {
      setError('Failed to delete assignment');
    }
  };

  const handleSubmitWork = async (e) => {
    e.preventDefault();
    
    if (!submissionData.submissionText && !submissionData.submissionUrl) {
      setError('Please provide submission text or URL');
      return;
    }

    try {
      setLoading(true);
      await submitAssignment(submittingFor.id, submissionData);
      setSubmissionData({ submissionText: '', submissionUrl: '' });
      setSubmittingFor(null);
      setError(null);
      alert('Assignment submitted successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit assignment');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleString();
  };

  const isPastDue = (dueDate) => {
    return new Date(dueDate) < new Date();
  };

  return (
    <div className="assignment-manager">
      <h2>Assignments</h2>

      {error && <div className="error-message">{error}</div>}

      {/* Course Selector */}
      <div className="course-selector">
        <label htmlFor="courseSelect"><strong>Select Course:</strong></label>
        <select
          id="courseSelect"
          value={selectedCourse?.id || ''}
          onChange={(e) => {
            const course = courses.find(c => c.id === parseInt(e.target.value));
            setSelectedCourse(course);
            setShowForm(false);
            setEditingAssignment(null);
          }}
        >
          {courses.map(course => (
            <option key={course.id} value={course.id}>
              {course.courseCode} - {course.courseName}
            </option>
          ))}
        </select>
      </div>

      {/* Create Button */}
      {canCreate && !showForm && (
        <button 
          className="btn btn-primary"
          onClick={() => {
            setShowForm(true);
            setEditingAssignment(null);
            setFormData({ title: '', description: '', dueDate: '', maxMarks: '' });
          }}
        >
          + Create Assignment
        </button>
      )}

      {/* Assignment Form */}
      {showForm && canCreate && (
        <div className="assignment-form-container">
          <h3>{editingAssignment ? 'Edit Assignment' : 'Create Assignment'}</h3>
          <form onSubmit={handleCreateOrUpdate} className="assignment-form">
            <div className="form-group">
              <label htmlFor="title">Title *</label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleFormChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleFormChange}
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
                onChange={handleFormChange}
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
                onChange={handleFormChange}
                min="1"
                required
              />
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Saving...' : (editingAssignment ? 'Update' : 'Create')}
              </button>
              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={() => {
                  setShowForm(false);
                  setEditingAssignment(null);
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Submission Form */}
      {submittingFor && (
        <div className="submission-modal">
          <div className="modal-content">
            <h3>Submit: {submittingFor.title}</h3>
            <form onSubmit={handleSubmitWork}>
              <div className="form-group">
                <label htmlFor="submissionText">Submission Text</label>
                <textarea
                  id="submissionText"
                  name="submissionText"
                  value={submissionData.submissionText}
                  onChange={handleSubmissionChange}
                  rows="6"
                  placeholder="Enter your submission here..."
                />
              </div>

              <div className="form-group">
                <label htmlFor="submissionUrl">Submission URL (optional)</label>
                <input
                  type="url"
                  id="submissionUrl"
                  name="submissionUrl"
                  value={submissionData.submissionUrl}
                  onChange={handleSubmissionChange}
                  placeholder="https://example.com/your-work"
                />
              </div>

              <div className="form-actions">
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Submitting...' : 'Submit'}
                </button>
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => {
                    setSubmittingFor(null);
                    setSubmissionData({ submissionText: '', submissionUrl: '' });
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assignments List */}
      {loading && <div className="loading">Loading...</div>}
      
      {!loading && selectedCourse && (
        <div className="assignments-container">
          {assignments.length === 0 ? (
            <p className="info-message">No assignments for this course</p>
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
                    <div className="detail-item">
                      <strong>Due:</strong> {formatDateTime(assignment.dueDate)}
                    </div>
                    <div className="detail-item">
                      <strong>Max Marks:</strong> {assignment.maxMarks}
                    </div>
                  </div>
                  <div className="assignment-actions">
                    {isStudent && (
                      <button 
                        className="btn btn-primary"
                        onClick={() => setSubmittingFor(assignment)}
                      >
                        Submit Work
                      </button>
                    )}
                    {canCreate && (
                      <>
                        <button 
                          className="btn btn-info"
                          onClick={() => setViewingSubmissionsFor(assignment)}
                        >
                          View Submissions
                        </button>
                        <button 
                          className="btn btn-secondary"
                          onClick={() => handleEdit(assignment)}
                        >
                          Edit
                        </button>
                      </>
                    )}
                    {canDelete && (
                      <button 
                        className="btn btn-danger"
                        onClick={() => handleDelete(assignment.id)}
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      {/* Submission Viewer Modal */}
      {viewingSubmissionsFor && (
        <SubmissionViewer 
          assignmentId={viewingSubmissionsFor.id}
          assignmentTitle={viewingSubmissionsFor.title}
          maxMarks={viewingSubmissionsFor.maxMarks}
          onClose={() => setViewingSubmissionsFor(null)}
        />
      )}
    </div>
  );
};

export default AssignmentManager;

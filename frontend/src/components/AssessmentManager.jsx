import React, { useState, useEffect } from 'react';
import { getCourses, getMyEnrolledCourses } from '../api/courseApi';
import { createAssessment, updateAssessment, deleteAssessment, getAssessmentsByCourse, getQuestions } from '../api/assessmentApi';
import { getAuth } from '../api/authApi';
import QuestionBuilder from './QuestionBuilder';
import GradingPanel from './GradingPanel';
import './AssessmentManager.css';

const AssessmentManager = () => {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [assessments, setAssessments] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingAssessment, setEditingAssessment] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [addingQuestionsFor, setAddingQuestionsFor] = useState(null);
  const [gradingAssessment, setGradingAssessment] = useState(null);
  const [viewingQuestionsFor, setViewingQuestionsFor] = useState(null);
  const [questionsData, setQuestionsData] = useState([]);

  const auth = getAuth();
  const userRole = auth?.role?.toUpperCase();
  const canCreate = ['ADMIN', 'FACULTY', 'HOD'].includes(userRole);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    assessmentType: 'QUIZ',
    dueDate: '',
    durationMinutes: '',
    totalMarks: '',
    passingMarks: '',
    autoGrade: true,
    courseId: ''
  });

  // Load courses on mount
  useEffect(() => {
    loadCourses();
  }, []);

  // Load assessments when course is selected
  useEffect(() => {
    if (selectedCourse) {
      loadAssessments();
    } else {
      setAssessments([]);
    }
  }, [selectedCourse]);

  const loadCourses = async () => {
    try {
      const data = userRole === 'STUDENT'
        ? await getMyEnrolledCourses()
        : await getCourses();
      setCourses(data || []);
      if (data && data.length > 0) {
        setSelectedCourse(data[0]);
      }
    } catch (err) {
      setError('Failed to load courses');
      console.error(err);
    }
  };

  const loadAssessments = async () => {
    if (!selectedCourse) return;
    try {
      setLoading(true);
      const data = await getAssessmentsByCourse(selectedCourse.id);
      setAssessments(data || []);
      setError(null);
    } catch (err) {
      setError('Failed to load assessments');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCourseChange = (e) => {
    const courseId = parseInt(e.target.value);
    const course = courses.find(c => c.id === courseId);
    setSelectedCourse(course);
    setSuccess(null);
    setError(null);
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleCreateOrUpdate = async (e) => {
    e.preventDefault();
    
    // Comprehensive validation
    if (!formData.title || formData.title.trim() === '') {
      setError('Title is required');
      return;
    }
    
    if (!formData.dueDate || formData.dueDate === '') {
      setError('Due date is required');
      return;
    }
    
    if (!formData.totalMarks || formData.totalMarks === '') {
      setError('Total marks is required');
      return;
    }
    
    if (!selectedCourse || !selectedCourse.id) {
      setError('Please select a course');
      return;
    }

    const totalMarksNum = parseInt(formData.totalMarks);
    if (isNaN(totalMarksNum) || totalMarksNum <= 0) {
      setError('Total marks must be a valid number greater than 0');
      return;
    }

    const passingMarksNum = formData.passingMarks ? parseInt(formData.passingMarks) : 0;
    if (isNaN(passingMarksNum) || passingMarksNum < 0) {
      setError('Passing marks must be a valid number');
      return;
    }

    if (passingMarksNum > totalMarksNum) {
      setError('Passing marks cannot be greater than total marks');
      return;
    }

    const durationNum = formData.durationMinutes ? parseInt(formData.durationMinutes) : 60;
    if (isNaN(durationNum) || durationNum <= 0) {
      setError('Duration must be a valid number greater than 0');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const payload = {
        title: formData.title.trim(),
        description: formData.description ? formData.description.trim() : '',
        assessmentType: formData.assessmentType,
        dueDate: formData.dueDate,
        durationMinutes: durationNum,
        totalMarks: totalMarksNum,
        passingMarks: passingMarksNum,
        autoGrade: formData.autoGrade === true || formData.autoGrade === 'on',
        courseId: parseInt(selectedCourse.id)
      };

      console.log('=== ASSESSMENT PAYLOAD ===');
      console.log('Payload:', JSON.stringify(payload, null, 2));
      console.log('Selected Course:', JSON.stringify(selectedCourse, null, 2));
      console.log('Form Data:', JSON.stringify(formData, null, 2));
      console.log('========================');

      if (editingAssessment) {
        await updateAssessment(editingAssessment.id, payload);
        setSuccess('Assessment updated successfully');
      } else {
        await createAssessment(payload);
        setSuccess('Assessment created successfully');
      }

      // Reset form and reload
      resetForm();
      loadAssessments();
      setShowForm(false);
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('=== ASSESSMENT ERROR ===');
      console.error('Error:', err);
      console.error('Response Status:', err.response?.status);
      console.error('Response Data:', err.response?.data);
      console.error('========================');
      setError(err.response?.data?.message || err.message || 'Failed to save assessment');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (assessment) => {
    setEditingAssessment(assessment);
    setFormData({
      title: assessment.title,
      description: assessment.description,
      assessmentType: assessment.assessmentType,
      dueDate: assessment.dueDate ? new Date(assessment.dueDate).toISOString().slice(0, 16) : '',
      durationMinutes: assessment.durationMinutes,
      totalMarks: assessment.totalMarks,
      passingMarks: assessment.passingMarks,
      autoGrade: assessment.autoGrade !== undefined ? assessment.autoGrade : true,
      courseId: selectedCourse?.id || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (assessmentId) => {
    if (!window.confirm('Are you sure you want to delete this assessment?')) return;

    try {
      setLoading(true);
      await deleteAssessment(assessmentId);
      setSuccess('Assessment deleted successfully');
      loadAssessments();
    } catch (err) {
      setError('Failed to delete assessment');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      assessmentType: 'QUIZ',
      dueDate: '',
      durationMinutes: '',
      totalMarks: '',
      passingMarks: '',
      autoGrade: true,
      courseId: selectedCourse?.id || ''
    });
    setEditingAssessment(null);
  };

  const handleCancel = () => {
    resetForm();
    setShowForm(false);
  };

  const handleViewQuestions = async (assessment) => {
    try {
      const data = await getQuestions(assessment.id);
      setQuestionsData(data || []);
      setViewingQuestionsFor(assessment);
    } catch (err) {
      alert('Failed to load questions');
      console.error(err);
    }
  };

  const getAssessmentTypeLabel = (type) => {
    const types = {
      'QUIZ': '📝 Quiz',
      'EXAM': '📋 Exam',
      'ASSIGNMENT': '📚 Assignment'
    };
    return types[type] || type;
  };

  return (
    <div className="assessment-manager">
      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {/* Course Selector */}
      {courses.length === 0 ? (
        <div className="alert alert-warning">
          No courses available. {!canCreate ? 'Contact your instructor to create a course.' : 'Create a course first to add assessments.'}
        </div>
      ) : (
        <>
      <div className="course-selector-section">
        <label htmlFor="courseSelect">Select Course:</label>
        <select
          id="courseSelect"
          value={selectedCourse?.id || ''}
          onChange={handleCourseChange}
          className="course-select"
        >
          <option value="">-- Select a Course --</option>
          {courses.map(course => (
            <option key={course.id} value={course.id}>
              {course.courseName}
            </option>
          ))}
        </select>
      </div>

      {selectedCourse && (
        <>
          {/* Create/Edit Form */}
          <div className="form-section">
            {!showForm && canCreate && (
              <button
                onClick={() => setShowForm(true)}
                className="btn btn-primary btn-create"
              >
                + Create Assessment
              </button>
            )}

            {showForm && (
              <form className="assessment-form" onSubmit={handleCreateOrUpdate}>
                <h3>{editingAssessment ? 'Edit Assessment' : 'Create Assessment'}</h3>

                <div className="form-group">
                  <label htmlFor="title">Title *</label>
                  <input
                    id="title"
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleFormChange}
                    placeholder="Assessment title"
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
                    placeholder="Assessment description"
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
                      onChange={handleFormChange}
                    >
                      <option value="QUIZ">Quiz</option>
                      <option value="EXAM">Exam</option>
                      <option value="ASSIGNMENT">Assignment</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="dueDate">Due Date *</label>
                    <input
                      id="dueDate"
                      type="datetime-local"
                      name="dueDate"
                      value={formData.dueDate}
                      onChange={handleFormChange}
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="durationMinutes">Duration (minutes)</label>
                    <input
                      id="durationMinutes"
                      type="number"
                      name="durationMinutes"
                      value={formData.durationMinutes}
                      onChange={handleFormChange}
                      placeholder="60"
                      min="1"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="totalMarks">Total Marks *</label>
                    <input
                      id="totalMarks"
                      type="number"
                      name="totalMarks"
                      value={formData.totalMarks}
                      onChange={handleFormChange}
                      placeholder="100"
                      required
                      min="1"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="passingMarks">Passing Marks</label>
                    <input
                      id="passingMarks"
                      type="number"
                      name="passingMarks"
                      value={formData.passingMarks}
                      onChange={handleFormChange}
                      placeholder="50"
                      min="0"
                    />
                  </div>
                </div>

                <div className="form-group checkbox">
                  <input
                    id="autoGrade"
                    type="checkbox"
                    name="autoGrade"
                    checked={formData.autoGrade}
                    onChange={handleFormChange}
                  />
                  <label htmlFor="autoGrade">Enable Auto-grading for objective questions</label>
                </div>

                <div className="form-actions">
                  <button type="submit" className="btn btn-success" disabled={loading}>
                    {loading ? 'Saving...' : editingAssessment ? 'Update' : 'Create'}
                  </button>
                  <button type="button" className="btn btn-secondary" onClick={handleCancel}>
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Assessments List */}
          <div className="assessments-section">
            <h3>Assessments in {selectedCourse.courseName}</h3>
            {loading && <p className="loading">Loading assessments...</p>}
            {!loading && assessments.length === 0 && (
              <p className="empty-state">No assessments yet. {canCreate && 'Create one to get started!'}</p>
            )}

            {!loading && assessments.length > 0 && (
              <div className="assessments-grid">
                {assessments.map(assessment => (
                  <div key={assessment.id} className="assessment-card">
                    <div className="card-header">
                      <h4>{assessment.title}</h4>
                      <span className="assessment-type">{getAssessmentTypeLabel(assessment.assessmentType)}</span>
                    </div>
                    <div className="card-body">
                      <p className="description">{assessment.description || 'No description'}</p>
                      <div className="details">
                        <div className="detail-row">
                          <span className="label">Due Date:</span>
                          <span className="value">
                            {new Date(assessment.dueDate).toLocaleString()}
                          </span>
                        </div>
                        <div className="detail-row">
                          <span className="label">Total Marks:</span>
                          <span className="value">{assessment.totalMarks}</span>
                        </div>
                        <div className="detail-row">
                          <span className="label">Duration:</span>
                          <span className="value">{assessment.durationMinutes} mins</span>
                        </div>
                        <div className="detail-row">
                          <span className="label">Auto-grading:</span>
                          <span className="value">{assessment.autoGrade ? '✓ Enabled' : '✗ Disabled'}</span>
                        </div>
                      </div>
                    </div>
                    <div className="card-actions">
                      {canCreate && (
                        <>
                          <button
                            onClick={() => setAddingQuestionsFor(assessment)}
                            className="btn btn-sm btn-warning"
                            title="Add new questions"
                          >
                            + Add Questions
                          </button>
                          <button
                            onClick={() => handleViewQuestions(assessment)}
                            className="btn btn-sm btn-info"
                            title="View all questions"
                          >
                            View Questions
                          </button>
                          <button
                            onClick={() => setGradingAssessment(assessment)}
                            className="btn btn-sm btn-success"
                            title="Grade student submissions"
                          >
                            Grade
                          </button>
                          <button
                            onClick={() => handleEdit(assessment)}
                            className="btn btn-sm btn-info"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(assessment.id)}
                            className="btn btn-sm btn-danger"
                          >
                            Delete
                          </button>
                        </>
                      )}
                      {userRole === 'STUDENT' && (
                        <button className="btn btn-sm btn-primary">
                          Attempt
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* Question Builder Modal */}
      {addingQuestionsFor && (
        <div className="modal-overlay">
          <div className="modal-dialog">
            <QuestionBuilder
              assessmentId={addingQuestionsFor.id}
              onSuccess={() => {
                setAddingQuestionsFor(null);
                handleViewQuestions(addingQuestionsFor);
              }}
              onCancel={() => setAddingQuestionsFor(null)}
            />
          </div>
        </div>
      )}

      {/* View Questions Modal */}
      {viewingQuestionsFor && (
        <div className="modal-overlay">
          <div className="modal-dialog large-modal">
            <div className="modal-content">
              <div className="modal-header">
                <h3>Questions for: {viewingQuestionsFor.title}</h3>
                <button 
                  className="close-btn" 
                  onClick={() => setViewingQuestionsFor(null)}
                >
                  &times;
                </button>
              </div>
              <div className="modal-body">
                {questionsData.length === 0 ? (
                  <p className="no-data">No questions added yet</p>
                ) : (
                  <div className="questions-list">
                    {questionsData.map((q, idx) => (
                      <div key={q.id} className="question-item">
                        <div className="question-order">Q{idx + 1}</div>
                        <div className="question-content">
                          <p className="question-text">{q.questionText}</p>
                          <div className="question-meta">
                            <span className="badge">{q.questionType}</span>
                            <span className="marks">{q.marks} marks</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button 
                  className="btn btn-secondary" 
                  onClick={() => setViewingQuestionsFor(null)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Grading Panel Modal */}
      {gradingAssessment && (
        <GradingPanel
          assessmentId={gradingAssessment.id}
          assessmentTitle={gradingAssessment.title}
          totalMarks={gradingAssessment.totalMarks}
          onClose={() => setGradingAssessment(null)}
        />
      )}
        </>
      )}
    </div>
  );
};

export default AssessmentManager;

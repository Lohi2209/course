import React, { useState, useEffect } from 'react';
import { getCourses, getMyEnrolledCourses } from '../api/courseApi';
import {
  getAssignmentsByCourse,
  createAssignment,
  updateAssignment,
  deleteAssignment,
  submitAssignment,
  getAssignmentQuestions,
  deleteAssignmentQuestion
} from '../api/assignmentApi';
import { getAuth } from '../api/authApi';
import SubmissionViewer from './SubmissionViewer';
import QuestionBuilder from './QuestionBuilder';
import './AssignmentManager.css';

const AssignmentManager = () => {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState(null);
  const [submittingFor, setSubmittingFor] = useState(null);
  const [viewingSubmissionsFor, setViewingSubmissionsFor] = useState(null);
  const [addingQuestionsFor, setAddingQuestionsFor] = useState(null);
  const [questionsMap, setQuestionsMap] = useState({});
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
    maxMarks: '',
    assignmentType: 'WRITTEN'
  });

  const [submissionData, setSubmissionData] = useState({
    submissionText: '',
    submissionUrl: ''
  });
  const [questionAnswers, setQuestionAnswers] = useState({});
  const [codingLanguages, setCodingLanguages] = useState({});

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
      setCourses(data || []);
      if ((data || []).length > 0 && !selectedCourse) {
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
      setAssignments(data || []);
      setError(null);

      const qMap = {};
      for (const a of (data || [])) {
        if (a.assignmentType === 'MCQ' || a.assignmentType === 'CODING') {
          try {
            const qs = await getAssignmentQuestions(a.id);
            qMap[a.id] = qs;
          } catch (_) {
            qMap[a.id] = [];
          }
        }
      }
      setQuestionsMap(qMap);
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

  const handleQuestionAnswerChange = (questionId, value) => {
    setQuestionAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const handleCodingLanguageChange = (questionId, value) => {
    setCodingLanguages(prev => ({ ...prev, [questionId]: value }));
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

      let saved;
      if (editingAssignment) {
        saved = await updateAssignment(editingAssignment.id, payload);
      } else {
        saved = await createAssignment(payload);
      }

      setFormData({ title: '', description: '', dueDate: '', maxMarks: '', assignmentType: 'WRITTEN' });
      setEditingAssignment(null);
      setShowForm(false);
      await loadAssignments();
      setError(null);

      if (payload.assignmentType !== 'WRITTEN' && saved && !editingAssignment) {
        setAddingQuestionsFor(saved);
      }
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
      maxMarks: assignment.maxMarks,
      assignmentType: assignment.assignmentType || 'WRITTEN'
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

  const handleDeleteQuestion = async (assignmentId, questionId) => {
    if (!window.confirm('Delete this question?')) return;
    try {
      await deleteAssignmentQuestion(assignmentId, questionId);
      const updated = await getAssignmentQuestions(assignmentId);
      setQuestionsMap(prev => ({ ...prev, [assignmentId]: updated }));
    } catch (err) {
      setError('Failed to delete question');
    }
  };

  const handleSubmitWork = async (e) => {
    e.preventDefault();

    const assignmentQuestions = questionsMap[submittingFor?.id] || [];
    const isQuestionBased = submittingFor?.assignmentType === 'MCQ' || submittingFor?.assignmentType === 'CODING';

    if (isQuestionBased && assignmentQuestions.length === 0) {
      setError('No questions are published for this assignment yet. Please contact your faculty.');
      return;
    }

    let payload;
    if (isQuestionBased && assignmentQuestions.length > 0) {
      const missingAnswers = assignmentQuestions.filter((q) => {
        if (q.questionType === 'CODING') {
          return !questionAnswers[q.id] || !String(questionAnswers[q.id]).trim();
        }
        return !questionAnswers[q.id];
      });

      if (missingAnswers.length > 0) {
        setError('Please answer all questions before submitting.');
        return;
      }

      const answers = assignmentQuestions.map((q) => {
        if (q.questionType === 'CODING') {
          return {
            questionId: q.id,
            questionType: q.questionType,
            language: codingLanguages[q.id] || (q.programmingLanguages?.split(',')[0] || 'Java').trim(),
            code: questionAnswers[q.id]
          };
        }
        return {
          questionId: q.id,
          questionType: q.questionType,
          answer: questionAnswers[q.id]
        };
      });

      payload = {
        submissionText: JSON.stringify({ format: 'QUESTION_RESPONSES_V1', answers }),
        submissionUrl: submissionData.submissionUrl || ''
      };
    } else {
      if (!submissionData.submissionText && !submissionData.submissionUrl) {
        setError('Please provide submission text or URL');
        return;
      }
      payload = submissionData;
    }

    try {
      setLoading(true);
      await submitAssignment(submittingFor.id, payload);
      setSubmissionData({ submissionText: '', submissionUrl: '' });
      setQuestionAnswers({});
      setCodingLanguages({});
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

      {canCreate && !showForm && (
        <button
          className="btn btn-primary"
          onClick={() => {
            setShowForm(true);
            setEditingAssignment(null);
            setFormData({ title: '', description: '', dueDate: '', maxMarks: '', assignmentType: 'WRITTEN' });
          }}
        >
          + Create Assignment
        </button>
      )}

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
              <label htmlFor="assignmentType">Assignment Type *</label>
              <select
                id="assignmentType"
                name="assignmentType"
                value={formData.assignmentType}
                onChange={handleFormChange}
              >
                <option value="WRITTEN">Written / File Upload</option>
                <option value="MCQ">MCQ (Multiple Choice Questions)</option>
                <option value="CODING">Coding Assignment</option>
              </select>
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

      {addingQuestionsFor && (
        <div className="question-builder-panel">
          <h3>Add Questions - {addingQuestionsFor.title}
            <span className="badge badge-info" style={{ marginLeft: '8px', fontSize: '0.75rem' }}>{addingQuestionsFor.assignmentType}</span>
          </h3>
          {questionsMap[addingQuestionsFor.id]?.length > 0 && (
            <div className="questions-list" style={{ marginBottom: '16px' }}>
              <strong>Questions added ({questionsMap[addingQuestionsFor.id].length}):</strong>
              <ul style={{ margin: '8px 0 0 16px' }}>
                {questionsMap[addingQuestionsFor.id].map((q, idx) => (
                  <li key={q.id} style={{ marginBottom: '4px' }}>
                    <span>#{idx + 1} [{q.questionType}] {q.questionText?.slice(0, 60)}{q.questionText?.length > 60 ? '...' : ''} <em>({q.marks} marks)</em></span>
                    <button
                      className="btn btn-danger"
                      style={{ marginLeft: '8px', padding: '2px 8px', fontSize: '0.75rem' }}
                      onClick={() => handleDeleteQuestion(addingQuestionsFor.id, q.id)}
                    >x</button>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <QuestionBuilder
            assignmentId={addingQuestionsFor.id}
            onSuccess={async () => {
              const updated = await getAssignmentQuestions(addingQuestionsFor.id);
              setQuestionsMap(prev => ({ ...prev, [addingQuestionsFor.id]: updated }));
            }}
            onCancel={() => setAddingQuestionsFor(null)}
          />
        </div>
      )}

      {submittingFor && (
        <div className="submission-modal">
          <div className="modal-content">
            <h3>Submit: {submittingFor.title}</h3>
            <form onSubmit={handleSubmitWork}>
              {(submittingFor.assignmentType === 'MCQ' || submittingFor.assignmentType === 'CODING') ? (
                <div className="question-submission-block">
                  {(questionsMap[submittingFor.id] || []).length === 0 ? (
                    <div className="info-message">
                      No questions are published for this assignment yet. Please contact your faculty.
                    </div>
                  ) : (
                    <>
                      {(questionsMap[submittingFor.id] || []).map((q, idx) => (
                        <div key={q.id} className="student-question-item">
                          <h4>
                            Q{idx + 1}. {q.questionText}
                            <span style={{ fontWeight: 400 }}> ({q.marks} marks)</span>
                          </h4>

                          {q.questionType === 'MULTIPLE_CHOICE' && (
                            <div className="mcq-options">
                              {[q.optionA, q.optionB, q.optionC, q.optionD].filter(Boolean).map((opt, i) => {
                                const optionLetter = ['A', 'B', 'C', 'D'][i];
                                return (
                                  <label key={`${q.id}-${optionLetter}`} className="mcq-option-row">
                                    <input
                                      type="radio"
                                      name={`question-${q.id}`}
                                      value={optionLetter}
                                      checked={questionAnswers[q.id] === optionLetter}
                                      onChange={(ev) => handleQuestionAnswerChange(q.id, ev.target.value)}
                                    />
                                    <span>{optionLetter}. {opt}</span>
                                  </label>
                                );
                              })}
                            </div>
                          )}

                          {q.questionType === 'CODING' && (
                            <div className="coding-answer-block">
                              <div className="form-group">
                                <label>Language</label>
                                <select
                                  value={codingLanguages[q.id] || ''}
                                  onChange={(ev) => handleCodingLanguageChange(q.id, ev.target.value)}
                                >
                                  {(q.programmingLanguages || 'Java').split(',').map((lang) => {
                                    const trimmed = lang.trim();
                                    return <option key={`${q.id}-${trimmed}`} value={trimmed}>{trimmed}</option>;
                                  })}
                                </select>
                              </div>

                              {q.sampleInput && (
                                <div className="info-message"><strong>Sample Input:</strong> {q.sampleInput}</div>
                              )}
                              {q.expectedOutput && (
                                <div className="info-message"><strong>Expected Output:</strong> {q.expectedOutput}</div>
                              )}

                              <div className="form-group">
                                <label>Code Answer</label>
                                <textarea
                                  rows="10"
                                  value={questionAnswers[q.id] ?? q.starterCode ?? ''}
                                  onChange={(ev) => handleQuestionAnswerChange(q.id, ev.target.value)}
                                  placeholder="Write your code here..."
                                  style={{ fontFamily: 'Consolas, Monaco, monospace' }}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </>
                  )}
                </div>
              ) : (
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
              )}

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
                    setQuestionAnswers({});
                    setCodingLanguages({});
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      {assignment.assignmentType && assignment.assignmentType !== 'WRITTEN' && (
                        <span className={`badge badge-${assignment.assignmentType === 'MCQ' ? 'info' : 'warning'}`}>
                          {assignment.assignmentType}
                        </span>
                      )}
                      {isPastDue(assignment.dueDate) && (
                        <span className="badge badge-danger">Past Due</span>
                      )}
                    </div>
                  </div>
                  <p className="assignment-desc">{assignment.description}</p>
                  <div className="assignment-details">
                    <div className="detail-item">
                      <strong>Due:</strong> {formatDateTime(assignment.dueDate)}
                    </div>
                    <div className="detail-item">
                      <strong>Max Marks:</strong> {assignment.maxMarks}
                    </div>
                    {(assignment.assignmentType === 'MCQ' || assignment.assignmentType === 'CODING') && (
                      <div className="detail-item">
                        <strong>Questions:</strong> {questionsMap[assignment.id]?.length ?? 0}
                      </div>
                    )}
                  </div>
                  <div className="assignment-actions">
                    {isStudent && (
                      <button
                        className="btn btn-primary"
                        onClick={async () => {
                          try {
                            setError(null);
                            let qs = questionsMap[assignment.id] || [];
                            if ((assignment.assignmentType === 'MCQ' || assignment.assignmentType === 'CODING') && qs.length === 0) {
                              qs = await getAssignmentQuestions(assignment.id);
                              setQuestionsMap(prev => ({ ...prev, [assignment.id]: qs }));
                            }

                            const initialLanguages = {};
                            qs.forEach((q) => {
                              if (q.questionType === 'CODING') {
                                initialLanguages[q.id] = (q.programmingLanguages?.split(',')[0] || 'Java').trim();
                              }
                            });

                            setQuestionAnswers({});
                            setCodingLanguages(initialLanguages);
                            setSubmittingFor(assignment);
                          } catch (err) {
                            // Still open modal so student sees what's wrong instead of "button not working"
                            setSubmittingFor(assignment);
                            setError(err?.response?.data?.message || 'Unable to load assignment questions right now. Please retry.');
                          }
                        }}
                      >
                        Submit Work
                      </button>
                    )}
                    {canCreate && (
                      <>
                        {(assignment.assignmentType === 'MCQ' || assignment.assignmentType === 'CODING') && (
                          <button
                            className="btn btn-warning"
                            onClick={async () => {
                              try {
                                setError(null);
                                // Open panel immediately so the click always feels responsive.
                                setAddingQuestionsFor(assignment);
                                const qs = await getAssignmentQuestions(assignment.id);
                                setQuestionsMap(prev => ({ ...prev, [assignment.id]: qs }));
                              } catch (err) {
                                setError(err?.response?.data?.message || 'Unable to load questions for this assignment. Please retry.');
                              }
                            }}
                          >
                            Manage Questions
                          </button>
                        )}
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
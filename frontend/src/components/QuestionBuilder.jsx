import React, { useState } from 'react';
import { addQuestion } from '../api/assessmentApi';
import { addAssignmentQuestion } from '../api/assignmentApi';

const QuestionBuilder = ({ assessmentId, assignmentId, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    questionText: '',
    questionType: 'MULTIPLE_CHOICE',
    optionA: '',
    optionB: '',
    optionC: '',
    optionD: '',
    correctAnswer: '',
    programmingLanguages: 'Java,Python,JavaScript',
    starterCode: '',
    codingConstraints: '',
    sampleInput: '',
    expectedOutput: '',
    testCasesJson: '[{"input":"","output":""}]',
    marks: '',
    order: 0
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
    
    if (!formData.questionText || !formData.correctAnswer || !formData.marks) {
      setError('Please fill in all required fields');
      return;
    }

    if (formData.questionType === 'MULTIPLE_CHOICE') {
      if (!formData.optionA || !formData.optionB || !formData.optionC || !formData.optionD) {
        setError('Please provide all four options for multiple choice questions');
        return;
      }
    }

    try {
      setLoading(true);
      setError(null);
      
      if (assignmentId) {
        await addAssignmentQuestion(assignmentId, formData);
      } else {
        await addQuestion(assessmentId, formData);
      }
      
      // Reset form for next question
      setFormData({
        questionText: '',
        questionType: 'MULTIPLE_CHOICE',
        optionA: '',
        optionB: '',
        optionC: '',
        optionD: '',
        correctAnswer: '',
        programmingLanguages: 'Java,Python,JavaScript',
        starterCode: '',
        codingConstraints: '',
        sampleInput: '',
        expectedOutput: '',
        testCasesJson: '[{"input":"","output":""}]',
        marks: formData.marks,
        order: formData.order + 1
      });
      
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add question');
      console.error('Error adding question:', err);
    } finally {
      setLoading(false);
    }
  };

  const isMCQ = formData.questionType === 'MULTIPLE_CHOICE';
  const isTrueFalse = formData.questionType === 'TRUE_FALSE';
  const isCoding = formData.questionType === 'CODING';

  return (
    <div className="question-builder">
      <h3>Add Question</h3>
      
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="questionType">Question Type *</label>
          <select
            id="questionType"
            name="questionType"
            value={formData.questionType}
            onChange={handleChange}
            required
          >
            <option value="MULTIPLE_CHOICE">Multiple Choice</option>
            <option value="TRUE_FALSE">True/False</option>
            <option value="SHORT_ANSWER">Short Answer</option>
            <option value="ESSAY">Essay</option>
            <option value="CODING">Coding</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="questionText">Question *</label>
          <textarea
            id="questionText"
            name="questionText"
            value={formData.questionText}
            onChange={handleChange}
            rows="3"
            required
          />
        </div>

        {isMCQ && (
          <>
            <div className="form-group">
              <label htmlFor="optionA">Option A *</label>
              <input
                type="text"
                id="optionA"
                name="optionA"
                value={formData.optionA}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="optionB">Option B *</label>
              <input
                type="text"
                id="optionB"
                name="optionB"
                value={formData.optionB}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="optionC">Option C *</label>
              <input
                type="text"
                id="optionC"
                name="optionC"
                value={formData.optionC}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="optionD">Option D *</label>
              <input
                type="text"
                id="optionD"
                name="optionD"
                value={formData.optionD}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="correctAnswer">Correct Answer (A/B/C/D) *</label>
              <select
                id="correctAnswer"
                name="correctAnswer"
                value={formData.correctAnswer}
                onChange={handleChange}
                required
              >
                <option value="">Select...</option>
                <option value="A">A</option>
                <option value="B">B</option>
                <option value="C">C</option>
                <option value="D">D</option>
              </select>
            </div>
          </>
        )}

        {isTrueFalse && (
          <div className="form-group">
            <label htmlFor="correctAnswer">Correct Answer *</label>
            <select
              id="correctAnswer"
              name="correctAnswer"
              value={formData.correctAnswer}
              onChange={handleChange}
              required
            >
              <option value="">Select...</option>
              <option value="TRUE">True</option>
              <option value="FALSE">False</option>
            </select>
          </div>
        )}

        {!isMCQ && !isTrueFalse && !isCoding && (
          <div className="form-group">
            <label htmlFor="correctAnswer">Model Answer/Keywords *</label>
            <textarea
              id="correctAnswer"
              name="correctAnswer"
              value={formData.correctAnswer}
              onChange={handleChange}
              rows="2"
              placeholder="Enter the expected answer or key points"
              required
            />
          </div>
        )}

        {isCoding && (
          <>
            <div className="form-group">
              <label htmlFor="programmingLanguages">Allowed Languages (comma separated) *</label>
              <input
                type="text"
                id="programmingLanguages"
                name="programmingLanguages"
                value={formData.programmingLanguages}
                onChange={handleChange}
                placeholder="Java,Python,JavaScript"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="starterCode">Starter Code (optional)</label>
              <textarea
                id="starterCode"
                name="starterCode"
                value={formData.starterCode}
                onChange={handleChange}
                rows="5"
                placeholder="Provide starter function/template code"
              />
            </div>

            <div className="form-group">
              <label htmlFor="codingConstraints">Problem Constraints / Expected Output *</label>
              <textarea
                id="codingConstraints"
                name="codingConstraints"
                value={formData.codingConstraints}
                onChange={handleChange}
                rows="3"
                placeholder="Input format, output format, constraints, examples"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="sampleInput">Sample Input</label>
              <textarea
                id="sampleInput"
                name="sampleInput"
                value={formData.sampleInput}
                onChange={handleChange}
                rows="3"
                placeholder="Example input for student reference"
              />
            </div>

            <div className="form-group">
              <label htmlFor="expectedOutput">Expected Output</label>
              <textarea
                id="expectedOutput"
                name="expectedOutput"
                value={formData.expectedOutput}
                onChange={handleChange}
                rows="3"
                placeholder="Expected output for sample input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="testCasesJson">Test Cases JSON (skeleton)</label>
              <textarea
                id="testCasesJson"
                name="testCasesJson"
                value={formData.testCasesJson}
                onChange={handleChange}
                rows="4"
                placeholder='[{"input":"1 2","output":"3"}]'
              />
            </div>

            <div className="form-group">
              <label htmlFor="correctAnswer">Reference Solution / Evaluation Notes *</label>
              <textarea
                id="correctAnswer"
                name="correctAnswer"
                value={formData.correctAnswer}
                onChange={handleChange}
                rows="4"
                placeholder="Reference logic for manual evaluation"
                required
              />
            </div>
          </>
        )}

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="marks">Marks *</label>
            <input
              type="number"
              id="marks"
              name="marks"
              value={formData.marks}
              onChange={handleChange}
              min="0.5"
              step="0.5"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="order">Order</label>
            <input
              type="number"
              id="order"
              name="order"
              value={formData.order}
              onChange={handleChange}
              min="0"
            />
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Adding...' : 'Add Question'}
          </button>
          <button type="button" className="btn btn-secondary" onClick={onCancel}>
            Done
          </button>
        </div>
      </form>
    </div>
  );
};

export default QuestionBuilder;

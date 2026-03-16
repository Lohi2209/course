import React, { useState, useEffect } from 'react';
import { getQuestions, startAssessment, submitAssessment } from '../api/assessmentApi';

const QuizTaker = ({ assessment, onComplete, onCancel }) => {
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [codingLanguage, setCodingLanguage] = useState({});
  const [attemptId, setAttemptId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    loadQuestions();
  }, [assessment.id]);

  useEffect(() => {
    if (started && timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            handleSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      return () => clearInterval(timer);
    }
  }, [started, timeRemaining]);

  const loadQuestions = async () => {
    try {
      setLoading(true);
      const data = await getQuestions(assessment.id);
      setQuestions(data.sort((a, b) => a.order - b.order));
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load questions');
      console.error('Error loading questions:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStart = async () => {
    try {
      const attempt = await startAssessment(assessment.id);
      setAttemptId(attempt.id);
      setTimeRemaining(assessment.durationMinutes * 60);
      setStarted(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to start assessment');
    }
  };

  const handleAnswerChange = (questionId, answer) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const handleCodingLanguageChange = (questionId, language) => {
    setCodingLanguage((prev) => ({
      ...prev,
      [questionId]: language,
    }));
  };

  const handleSubmit = async () => {
    if (!window.confirm('Are you sure you want to submit? You cannot change answers after submission.')) {
      return;
    }

    try {
      setSubmitting(true);
      const submissionPayload = Object.entries(answers).reduce((acc, [questionId, answer]) => {
        const q = questions.find((item) => String(item.id) === String(questionId));
        if (q?.questionType === 'CODING') {
          const selectedLanguage = codingLanguage[questionId] || 'PlainText';
          acc[`question_${questionId}`] = JSON.stringify({
            language: selectedLanguage,
            code: answer,
          });
        } else {
          acc[`question_${questionId}`] = answer;
        }
        return acc;
      }, {});

      await submitAssessment(assessment.id, submissionPayload);
      onComplete();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit assessment');
      console.error('Error submitting assessment:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getAnsweredCount = () => {
    return Object.keys(answers).length;
  };

  if (loading) {
    return <div className="loading">Loading assessment...</div>;
  }

  if (error && !started) {
    return <div className="error-message">{error}</div>;
  }

  if (!started) {
    return (
      <div className="quiz-start">
        <h3>{assessment.title}</h3>
        <p className="assessment-desc">{assessment.description}</p>
        
        <div className="assessment-info-box">
          <div className="info-item">
            <strong>Type:</strong> {assessment.assessmentType}
          </div>
          <div className="info-item">
            <strong>Total Questions:</strong> {questions.length}
          </div>
          <div className="info-item">
            <strong>Duration:</strong> {assessment.durationMinutes} minutes
          </div>
          <div className="info-item">
            <strong>Total Marks:</strong> {assessment.totalMarks}
          </div>
          <div className="info-item">
            <strong>Passing Marks:</strong> {assessment.passingMarks}
          </div>
        </div>

        <div className="instructions">
          <h4>Instructions:</h4>
          <ul>
            <li>Once started, the timer will begin automatically</li>
            <li>You must complete within {assessment.durationMinutes} minutes</li>
            <li>The assessment will auto-submit when time expires</li>
            <li>Make sure you have stable internet connection</li>
            <li>You cannot pause or return to this assessment once started</li>
          </ul>
        </div>

        <div className="form-actions">
          <button className="btn btn-primary" onClick={handleStart}>
            Start Assessment
          </button>
          <button className="btn btn-secondary" onClick={onCancel}>
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="quiz-taker">
      <div className="quiz-header">
        <h3>{assessment.title}</h3>
        <div className="quiz-stats">
          <span className={`timer ${timeRemaining < 300 ? 'warning' : ''}`}>
            Time: {formatTime(timeRemaining)}
          </span>
          <span className="progress">
            Answered: {getAnsweredCount()} / {questions.length}
          </span>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="questions-container">
        {questions.map((question, index) => (
          <div key={question.id} className="question-card">
            <div className="question-header">
              <span className="question-number">Question {index + 1}</span>
              <span className="question-marks">{question.marks} marks</span>
            </div>
            
            <p className="question-text">{question.questionText}</p>

            {question.questionType === 'MULTIPLE_CHOICE' && (
              <div className="options-list">
                {['A', 'B', 'C', 'D'].map(option => (
                  <label key={option} className="option-label">
                    <input
                      type="radio"
                      name={`question-${question.id}`}
                      value={option}
                      checked={answers[question.id] === option}
                      onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                    />
                    <span className="option-text">
                      <strong>{option}.</strong> {question[`option${option}`]}
                    </span>
                  </label>
                ))}
              </div>
            )}

            {question.questionType === 'TRUE_FALSE' && (
              <div className="options-list">
                <label className="option-label">
                  <input
                    type="radio"
                    name={`question-${question.id}`}
                    value="TRUE"
                    checked={answers[question.id] === 'TRUE'}
                    onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                  />
                  <span className="option-text">True</span>
                </label>
                <label className="option-label">
                  <input
                    type="radio"
                    name={`question-${question.id}`}
                    value="FALSE"
                    checked={answers[question.id] === 'FALSE'}
                    onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                  />
                  <span className="option-text">False</span>
                </label>
              </div>
            )}

            {(question.questionType === 'SHORT_ANSWER' || question.questionType === 'ESSAY') && (
              <textarea
                className="answer-textarea"
                rows={question.questionType === 'ESSAY' ? 6 : 3}
                value={answers[question.id] || ''}
                onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                placeholder="Enter your answer here..."
              />
            )}

            {question.questionType === 'CODING' && (
              <div className="coding-question-block">
                <label>
                  Programming Language
                  <select
                    value={codingLanguage[question.id] || (question.programmingLanguages?.split(',')[0] || 'Java')}
                    onChange={(e) => handleCodingLanguageChange(question.id, e.target.value)}
                  >
                    {(question.programmingLanguages || 'Java')
                      .split(',')
                      .map((lang) => lang.trim())
                      .filter(Boolean)
                      .map((lang) => (
                        <option key={lang} value={lang}>{lang}</option>
                      ))}
                  </select>
                </label>

                {question.codingConstraints && (
                  <p className="coding-guidelines">{question.codingConstraints}</p>
                )}

                {question.sampleInput && (
                  <p className="coding-guidelines"><strong>Sample Input:</strong> {question.sampleInput}</p>
                )}

                {question.expectedOutput && (
                  <p className="coding-guidelines"><strong>Expected Output:</strong> {question.expectedOutput}</p>
                )}

                {question.testCasesJson && (
                  <p className="coding-guidelines">
                    <strong>Auto-Evaluation:</strong> Coding auto-check skeleton enabled. Detailed test execution pipeline will validate against configured test cases.
                  </p>
                )}

                <textarea
                  className="answer-textarea"
                  rows={10}
                  value={answers[question.id] || question.starterCode || ''}
                  onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                  placeholder="Write your code solution here..."
                />
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="quiz-footer">
        <button 
          className="btn btn-primary btn-lg" 
          onClick={handleSubmit}
          disabled={submitting}
        >
          {submitting ? 'Submitting...' : 'Submit Assessment'}
        </button>
      </div>
    </div>
  );
};

export default QuizTaker;

import React, { useState, useEffect } from 'react';
import { getMyGrades } from '../api/gradebookApi';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const Gradebook = () => {
  const [gradebook, setGradebook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadGradebook();
  }, []);

  const loadGradebook = async () => {
    try {
      setLoading(true);
      const data = await getMyGrades();
      setGradebook(data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load gradebook');
      console.error('Error loading gradebook:', err);
    } finally {
      setLoading(false);
    }
  };

  const getGradeColor = (grade) => {
    const colors = {
      'A+': '#4CAF50',
      'A': '#66BB6A',
      'B+': '#FFA726',
      'B': '#FFCA28',
      'C': '#FFD54F',
      'D': '#FF7043',
      'F': '#E57373'
    };
    return colors[grade] || '#9E9E9E';
  };

  if (loading) {
    return <div className="loading">Loading gradebook...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  if (!gradebook || !gradebook.grades || gradebook.grades.length === 0) {
    return (
      <div className="gradebook">
        <h2>My Gradebook</h2>
        <p className="info-message">No grades available yet</p>
      </div>
    );
  }

  // Prepare grade distribution data for pie chart
  const gradeDistributionData = Object.entries(gradebook.gradeDistribution || {}).map(([grade, count]) => ({
    name: grade,
    value: count,
    color: getGradeColor(grade)
  }));

  // Prepare course-wise performance data for bar chart
  const coursePerformanceMap = {};
  gradebook.grades.forEach(grade => {
    if (!coursePerformanceMap[grade.courseName]) {
      coursePerformanceMap[grade.courseName] = {
        courseName: grade.courseName,
        totalMarks: 0,
        obtainedMarks: 0,
        count: 0
      };
    }
    coursePerformanceMap[grade.courseName].totalMarks += grade.totalMarks;
    coursePerformanceMap[grade.courseName].obtainedMarks += grade.marksObtained;
    coursePerformanceMap[grade.courseName].count++;
  });

  const coursePerformanceData = Object.values(coursePerformanceMap).map(course => ({
    name: course.courseName,
    percentage: ((course.obtainedMarks / course.totalMarks) * 100).toFixed(1)
  }));

  return (
    <div className="gradebook">
      <h2>My Gradebook</h2>

      <div className="gradebook-summary">
        <div className="summary-card">
          <h3>Overall Performance</h3>
          <div className="grade-display">
            <span className="grade-value" style={{ color: getGradeColor(gradebook.overallGrade) }}>
              {gradebook.overallGrade}
            </span>
            <span className="percentage-value">{gradebook.overallAverage?.toFixed(1)}%</span>
          </div>
        </div>

        <div className="summary-card">
          <h3>Total Assessments</h3>
          <p className="stat-number">{gradebook.grades.length}</p>
        </div>
      </div>

      <div className="charts-section">
        <div className="chart-container">
          <h3>Grade Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={gradeDistributionData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {gradeDistributionData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-container">
          <h3>Course-wise Performance</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={coursePerformanceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Legend />
              <Bar dataKey="percentage" fill="#8884d8" name="Percentage" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grades-table-section">
        <h3>All Grades</h3>
        <div className="table-responsive">
          <table className="grades-table">
            <thead>
              <tr>
                <th>Course</th>
                <th>Assessment</th>
                <th>Type</th>
                <th>Marks Obtained</th>
                <th>Total Marks</th>
                <th>Percentage</th>
                <th>Grade</th>
              </tr>
            </thead>
            <tbody>
              {gradebook.grades.map((grade, index) => (
                <tr key={index}>
                  <td>{grade.courseName}</td>
                  <td>{grade.assessmentTitle}</td>
                  <td>
                    <span className="badge badge-info">{grade.assessmentType}</span>
                  </td>
                  <td>{grade.marksObtained}</td>
                  <td>{grade.totalMarks}</td>
                  <td>{grade.percentage?.toFixed(1)}%</td>
                  <td>
                    <span 
                      className="grade-badge" 
                      style={{ backgroundColor: getGradeColor(grade.grade) }}
                    >
                      {grade.grade}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Gradebook;

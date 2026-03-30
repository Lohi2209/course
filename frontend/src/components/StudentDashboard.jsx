import React, { useState, useEffect } from 'react';
import { getStudentStats } from '../api/dashboardApi';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const StudentDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const data = await getStudentStats();
      setStats(data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load statistics');
      console.error('Error loading student stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  if (loading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  if (!stats) {
    return null;
  }

  return (
    <div className="student-dashboard">
      <h2>🎯 Student Dashboard</h2>
      
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Enrolled Courses</h3>
          <p className="stat-number">{stats.enrolledCourses?.length || 0}</p>
        </div>
        
        <div className="stat-card alert">
          <h3>Pending Submissions</h3>
          <p className="stat-number">{stats.submissionsPending}</p>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="section">
          <h3>Upcoming Deadlines</h3>
          {stats.upcomingDeadlines && stats.upcomingDeadlines.length > 0 ? (
            <div className="deadlines-list">
              {stats.upcomingDeadlines.map((assignment) => (
                <div key={assignment.id} className="deadline-card">
                  <div className="deadline-header">
                    <h4>{assignment.title}</h4>
                    <span className="course-badge">{assignment.course?.courseName}</span>
                  </div>
                  <p className="deadline-desc">{assignment.description}</p>
                  <div className="deadline-footer">
                    <span className="deadline-date">Due: {formatDateTime(assignment.dueDate)}</span>
                    <span className="deadline-marks">Max Marks: {assignment.maxMarks}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="info-message">No upcoming deadlines in the next 7 days</p>
          )}
        </div>
      </div>

      <div className="section">
        <h3>My Enrolled Courses</h3>
        {stats.enrolledCourses && stats.enrolledCourses.length > 0 ? (
          <div className="courses-grid">
            {stats.enrolledCourses.map((course) => (
              <div key={course.id} className="course-card">
                <h4>{course.courseName}</h4>
                <p className="course-code">{course.courseCode}</p>
                <p className="course-desc">{course.description}</p>
                {course.faculty && (
                  <p className="course-faculty">Faculty: {course.faculty.fullName}</p>
                )}
                {course.semester && (
                  <span className="course-badge">{course.semester}</span>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="info-message">Not enrolled in any courses yet</p>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;

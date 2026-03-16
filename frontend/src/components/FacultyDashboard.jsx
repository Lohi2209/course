import React, { useState, useEffect } from 'react';
import { getFacultyStats } from '../api/dashboardApi';

const FacultyDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const data = await getFacultyStats();
      setStats(data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load statistics');
      console.error('Error loading faculty stats:', err);
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
    <div className="faculty-dashboard">
      <h2>Faculty Dashboard</h2>
      
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Courses Teaching</h3>
          <p className="stat-number">{stats.totalCourses}</p>
        </div>
        
        <div className="stat-card">
          <h3>Total Students</h3>
          <p className="stat-number">{stats.totalStudents}</p>
        </div>
        
        <div className="stat-card alert">
          <h3>Pending Grading</h3>
          <p className="stat-number">{stats.pendingSubmissions}</p>
          <p className="stat-description">Assignments & Assessments</p>
        </div>

        <div className="stat-card alert">
          <h3>Low Attendance Alerts</h3>
          <p className="stat-number">{stats.lowAttendanceCount || 0}</p>
          <p className="stat-description">Students below 75%</p>
        </div>
      </div>

      {(stats.lowAttendanceAlerts?.length || 0) > 0 && (
        <div className="section">
          <h3>At-Risk Attendance Students</h3>
          <div className="deadlines-list">
            {stats.lowAttendanceAlerts.slice(0, 10).map((alert, idx) => (
              <div key={`${alert.studentId}-${alert.courseId}-${idx}`} className="deadline-card">
                <div className="deadline-header">
                  <h4>{alert.studentName}</h4>
                  <span className="course-badge">{alert.courseName}</span>
                </div>
                <div className="deadline-footer">
                  <span className="deadline-date">Attendance: {alert.attendancePercentage}%</span>
                  <span className="deadline-marks">Classes: {alert.totalClasses}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

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
  );
};

export default FacultyDashboard;

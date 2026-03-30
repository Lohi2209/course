import React, { useState, useEffect } from 'react';
import { getAdminStats, getAllStudents, getAllFaculty, getAllHOD, getAllUsers } from '../api/dashboardApi';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('stats');
  const [userType, setUserType] = useState('all');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await getAdminStats();
      setStats(data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load statistics');
      console.error('Error loading admin stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async (type) => {
    try {
      setLoading(true);
      let data;
      switch(type) {
        case 'students':
          data = await getAllStudents();
          break;
        case 'faculty':
          data = await getAllFaculty();
          break;
        case 'hod':
          data = await getAllHOD();
          break;
        default:
          data = await getAllUsers();
      }
      setUsers(data || []);
      setUserType(type);
      setActiveTab('users');
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load users');
      console.error('Error loading users:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading && activeTab === 'stats') {
    return <div className="loading">Loading dashboard...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  if (!stats && activeTab === 'stats') {
    return null;
  }

  // Prepare data for pie chart
  const enrollmentData = [
    { name: 'Approved', value: stats?.enrollmentsByStatus?.APPROVED || 0, color: '#4CAF50' },
    { name: 'Pending', value: stats?.enrollmentsByStatus?.PENDING || 0, color: '#FF9800' },
    { name: 'Rejected', value: stats?.enrollmentsByStatus?.REJECTED || 0, color: '#F44336' },
    { name: 'Dropped', value: stats?.enrollmentsByStatus?.DROPPED || 0, color: '#9E9E9E' },
  ];

  return (
    <div className="admin-dashboard">
      <h2>🛡 Admin Dashboard</h2>
      
      <div className="dashboard-tabs">
        <button
          className={activeTab === 'stats' ? 'active' : ''}
          onClick={() => setActiveTab('stats')}
        >
          Dashboard Statistics
        </button>
        <button
          className={activeTab === 'users' ? 'active' : ''}
          onClick={() => loadUsers('all')}
        >
          View All Users
        </button>
      </div>

      {activeTab === 'stats' && (
        <>
          <div className="stats-grid">
            <div className="stat-card" onClick={() => loadUsers('students')} style={{cursor: 'pointer'}}>
              <h3>Total Students</h3>
              <p className="stat-number">{stats?.totalStudents || 0}</p>
              <p className="stat-action">Click to view details →</p>
            </div>
            
            <div className="stat-card" onClick={() => loadUsers('faculty')} style={{cursor: 'pointer'}}>
              <h3>Total Faculty</h3>
              <p className="stat-number">{stats?.totalFaculty || 0}</p>
              <p className="stat-action">Click to view details →</p>
            </div>
            
            <div className="stat-card" onClick={() => loadUsers('hod')} style={{cursor: 'pointer'}}>
              <h3>Total HOD</h3>
              <p className="stat-number">{stats?.totalHOD || 0}</p>
              <p className="stat-action">Click to view details →</p>
            </div>
            
            <div className="stat-card">
              <h3>Total Courses</h3>
              <p className="stat-number">{stats?.totalCourses || 0}</p>
            </div>
            
            <div className="stat-card">
              <h3>Total Enrollments</h3>
              <p className="stat-number">{stats?.totalEnrollments || 0}</p>
            </div>
            
            <div className="stat-card alert">
              <h3>Pending Approvals</h3>
              <p className="stat-number">{stats?.pendingEnrollments || 0}</p>
            </div>

            <div className="stat-card alert">
              <h3>Low Attendance Alerts</h3>
              <p className="stat-number">{stats?.lowAttendanceCount || 0}</p>
              <p className="stat-description">Students below 75%</p>
            </div>
          </div>

          {(stats?.lowAttendanceAlerts?.length || 0) > 0 && (
            <div className="section">
              <h3>Top Low Attendance Alerts</h3>
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

          <div className="chart-section">
            <h3>Enrollment Status Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={enrollmentData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {enrollmentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </>
      )}

      {activeTab === 'users' && (
        <div className="users-section">
          <div className="user-type-buttons">
            <button
              className={userType === 'all' ? 'active' : ''}
              onClick={() => loadUsers('all')}
            >
              All Users ({users.length})
            </button>
            <button
              className={userType === 'students' ? 'active' : ''}
              onClick={() => loadUsers('students')}
            >
              Students ({users.filter(u => u.role === 'STUDENT').length})
            </button>
            <button
              className={userType === 'faculty' ? 'active' : ''}
              onClick={() => loadUsers('faculty')}
            >
              Faculty ({users.filter(u => u.role === 'FACULTY').length})
            </button>
            <button
              className={userType === 'hod' ? 'active' : ''}
              onClick={() => loadUsers('hod')}
            >
              HOD ({users.filter(u => u.role === 'HOD').length})
            </button>
          </div>

          {loading ? (
            <div className="loading">Loading users...</div>
          ) : users.length === 0 ? (
            <div className="info-message">No users found.</div>
          ) : (
            <table className="users-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Username</th>
                  <th>Full Name</th>
                  <th>Email</th>
                  <th>Role</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td>{user.id}</td>
                    <td><strong>{user.username}</strong></td>
                    <td>{user.fullName}</td>
                    <td>{user.email}</td>
                    <td>
                      <span className={`role-badge role-${user.role?.toLowerCase()}`}>
                        {user.role}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;

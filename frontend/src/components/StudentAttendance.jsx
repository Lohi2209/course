import { useEffect, useState } from 'react';
import { getMyAttendanceRecords, getMyAttendanceSummary } from '../api/attendanceApi';

function StudentAttendance() {
  const [summary, setSummary] = useState(null);
  const [records, setRecords] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadAttendance = async () => {
      try {
        const [summaryData, recordsData] = await Promise.all([
          getMyAttendanceSummary(),
          getMyAttendanceRecords(),
        ]);
        setSummary(summaryData);
        setRecords(recordsData || []);
        setError('');
      } catch {
        setError('Unable to load your attendance right now.');
      }
    };

    loadAttendance();
  }, []);

  return (
    <section className="attendance-section">
      <h2>📅 My Attendance</h2>
      <p>Track your attendance percentage and complete attendance history.</p>

      {error && <div className="error-banner">{error}</div>}

      <div className="attendance-overview">
        <div className="attendance-kpi">
          <span>Overall Attendance</span>
          <strong>{summary?.overallAttendancePercentage ?? 0}%</strong>
        </div>
      </div>

      <h3>Course-wise Attendance</h3>
      <div className="attendance-table-wrap">
        <table className="attendance-table">
          <thead>
            <tr>
              <th>Course</th>
              <th>Total Classes</th>
              <th>Present</th>
              <th>Late</th>
              <th>Percentage</th>
            </tr>
          </thead>
          <tbody>
            {(summary?.courseSummaries || []).map((course) => (
              <tr key={course.courseId}>
                <td>{course.courseName}</td>
                <td>{course.totalClasses}</td>
                <td>{course.presentClasses}</td>
                <td>{course.lateClasses}</td>
                <td>{course.attendancePercentage}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h3>Recent Attendance Records</h3>
      <div className="attendance-table-wrap">
        <table className="attendance-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Course</th>
              <th>Status</th>
              <th>Remarks</th>
            </tr>
          </thead>
          <tbody>
            {records.slice(0, 30).map((record) => (
              <tr key={record.id}>
                <td>{record.attendanceDate}</td>
                <td>{record.courseName}</td>
                <td>{record.status}</td>
                <td>{record.remarks || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default StudentAttendance;

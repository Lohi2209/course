import { useEffect, useMemo, useState } from 'react';
import { getCourses } from '../api/courseApi';
import { getEnrollmentsByCourse } from '../api/enrollmentApi';
import { downloadAttendanceReport, getCourseAttendanceByDate, markAttendance } from '../api/attendanceApi';

function AttendanceManager() {
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().slice(0, 10));
  const [exportMonth, setExportMonth] = useState(new Date().toISOString().slice(0, 7));
  const [students, setStudents] = useState([]);
  const [statuses, setStatuses] = useState({});
  const [remarks, setRemarks] = useState({});
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const selectedCourse = useMemo(
    () => courses.find((course) => String(course.id) === String(selectedCourseId)),
    [courses, selectedCourseId]
  );

  useEffect(() => {
    const loadCourses = async () => {
      try {
        setError('');
        setMessage('');
        const data = await getCourses();
        setCourses(data || []);
        if (data?.length) {
          setSelectedCourseId(String(data[0].id));
        } else {
          setSelectedCourseId('');
          setMessage('No courses available yet. Create a course first to manage attendance.');
        }
      } catch (apiError) {
        const status = apiError?.response?.status;
        const apiMessage = apiError?.response?.data?.message;
        if (status === 401) {
          setError('Session expired. Please login again.');
          return;
        }
        if (status === 403) {
          setError('You do not have permission to load courses for attendance.');
          return;
        }
        setError(apiMessage || 'Failed to load courses. Please ensure backend is running.');
      }
    };
    loadCourses();
  }, []);

  useEffect(() => {
    if (!selectedCourseId) {
      setStudents([]);
      setStatuses({});
      setRemarks({});
      return;
    }

    const loadStudentsAndAttendance = async () => {
      try {
        setError('');
        setMessage('');
        const [enrollmentResponse, attendanceRecords] = await Promise.all([
          getEnrollmentsByCourse(selectedCourseId),
          getCourseAttendanceByDate(selectedCourseId, attendanceDate),
        ]);

        const approvedStudents = (enrollmentResponse.data || [])
          .filter((enrollment) => enrollment.status === 'APPROVED')
          .map((enrollment) => ({
            id: enrollment.studentId,
            name: enrollment.studentName,
            email: enrollment.studentEmail,
          }));

        const initialStatus = {};
        const initialRemarks = {};

        for (const student of approvedStudents) {
          const existingRecord = (attendanceRecords || []).find(
            (record) => String(record.studentId) === String(student.id)
          );
          initialStatus[student.id] = existingRecord?.status || 'PRESENT';
          initialRemarks[student.id] = existingRecord?.remarks || '';
        }

        setStudents(approvedStudents);
        setStatuses(initialStatus);
        setRemarks(initialRemarks);
      } catch (apiError) {
        const apiMessage = apiError?.response?.data?.message;
        setError(apiMessage || 'Failed to load attendance data for selected course/date.');
      }
    };

    loadStudentsAndAttendance();
  }, [selectedCourseId, attendanceDate]);

  const updateStatus = (studentId, value) => {
    setStatuses((prev) => ({ ...prev, [studentId]: value }));
  };

  const updateRemarks = (studentId, value) => {
    setRemarks((prev) => ({ ...prev, [studentId]: value }));
  };

  const saveAttendance = async () => {
    try {
      setError('');
      setMessage('');
      if (!selectedCourseId || students.length === 0) {
        setError('Select a course with enrolled students to mark attendance.');
        return;
      }

      const records = students.map((student) => ({
        studentId: student.id,
        status: statuses[student.id] || 'PRESENT',
        remarks: remarks[student.id] || '',
      }));

      await markAttendance({
        courseId: Number(selectedCourseId),
        attendanceDate,
        records,
      });

      setMessage('Attendance saved successfully.');
    } catch (apiError) {
      const apiMessage = apiError.response?.data?.message;
      setError(apiMessage || 'Failed to save attendance.');
    }
  };

  const triggerReportDownload = async (format) => {
    try {
      setError('');
      const blob = await downloadAttendanceReport(Number(selectedCourseId), exportMonth, format);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `attendance_${selectedCourse?.courseCode || 'course'}_${exportMonth}.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      setMessage(`Attendance ${format.toUpperCase()} report downloaded.`);
    } catch {
      setError('Failed to download attendance report.');
    }
  };

  return (
    <section className="attendance-section">
      <h2>🗓 Attendance Manager</h2>
      <p>Track and maintain professional attendance records per course and date.</p>

      {error && <div className="error-banner">{error}</div>}
      {message && <div className="success-banner">{message}</div>}

      <div className="attendance-controls">
        <label>
          Course
          <select value={selectedCourseId} onChange={(event) => setSelectedCourseId(event.target.value)}>
            {courses.length === 0 && <option value="">No courses available</option>}
            {courses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.courseCode} - {course.courseName}
              </option>
            ))}
          </select>
        </label>

        <label>
          Date
          <input
            type="date"
            value={attendanceDate}
            onChange={(event) => setAttendanceDate(event.target.value)}
          />
        </label>

        <button onClick={saveAttendance} disabled={!selectedCourseId || students.length === 0}>Save Attendance</button>
      </div>

      <div className="attendance-controls">
        <label>
          Export Month
          <input
            type="month"
            value={exportMonth}
            onChange={(event) => setExportMonth(event.target.value)}
          />
        </label>
        <button className="secondary" onClick={() => triggerReportDownload('csv')} disabled={!selectedCourseId}>Export CSV</button>
        <button className="secondary" onClick={() => triggerReportDownload('pdf')} disabled={!selectedCourseId}>Export PDF</button>
      </div>

      <h3>{selectedCourse ? `${selectedCourse.courseName} Attendance` : 'Attendance'}</h3>

      {students.length === 0 ? (
        <p className="info-message">No approved students found for this course.</p>
      ) : (
        <div className="attendance-table-wrap">
          <table className="attendance-table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Email</th>
                <th>Status</th>
                <th>Remarks</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => (
                <tr key={student.id}>
                  <td>{student.name}</td>
                  <td>{student.email}</td>
                  <td>
                    <select
                      value={statuses[student.id] || 'PRESENT'}
                      onChange={(event) => updateStatus(student.id, event.target.value)}
                    >
                      <option value="PRESENT">Present</option>
                      <option value="ABSENT">Absent</option>
                      <option value="LATE">Late</option>
                    </select>
                  </td>
                  <td>
                    <input
                      type="text"
                      value={remarks[student.id] || ''}
                      onChange={(event) => updateRemarks(student.id, event.target.value)}
                      placeholder="Optional note"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

export default AttendanceManager;

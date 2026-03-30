import { Suspense, lazy, useEffect, useState } from 'react';
import { createCourse, deleteCourse, getCourses, updateCourse, getMyEnrolledCourses } from './api/courseApi';
import AuthForm from './components/AuthForm';
import { clearAuth, getAuth, login, register, saveAuth } from './api/authApi';

const CourseForm = lazy(() => import('./components/CourseForm'));
const CourseList = lazy(() => import('./components/CourseList'));
const Profile = lazy(() => import('./components/Profile'));
const CourseMaterials = lazy(() => import('./components/CourseMaterials'));
const CourseRegistration = lazy(() => import('./components/CourseRegistration'));
const MyEnrollments = lazy(() => import('./components/MyEnrollments'));
const EnrollmentApprovals = lazy(() => import('./components/EnrollmentApprovals'));
const AdminDashboard = lazy(() => import('./components/AdminDashboard'));
const FacultyDashboard = lazy(() => import('./components/FacultyDashboard'));
const StudentDashboard = lazy(() => import('./components/StudentDashboard'));
const AssignmentManager = lazy(() => import('./components/AssignmentManager'));
const Gradebook = lazy(() => import('./components/Gradebook'));
const AttendanceManager = lazy(() => import('./components/AttendanceManager'));
const StudentAttendance = lazy(() => import('./components/StudentAttendance'));
const MessagingCenter = lazy(() => import('./components/MessagingCenter'));

const SectionLoader = () => <div className="info-message">Loading...</div>;

function App() {
  const [courses, setCourses] = useState([]);
  const [editingCourse, setEditingCourse] = useState(null);
  const [viewingMaterials, setViewingMaterials] = useState(null);
  const [showRegistration, setShowRegistration] = useState(false);
  const [showMyEnrollments, setShowMyEnrollments] = useState(false);
  const [showApprovals, setShowApprovals] = useState(false);
  const [error, setError] = useState('');
  const [auth, setAuth] = useState(getAuth());
  const [activeTab, setActiveTab] = useState('dashboard');

  const canCreate = auth?.role === 'ADMIN' || auth?.role === 'FACULTY' || auth?.role === 'HOD';
  const canDelete = auth?.role === 'ADMIN' || auth?.role === 'HOD';
  const isStudent = auth?.role === 'STUDENT';
  const canApprove = auth?.role === 'ADMIN' || auth?.role === 'FACULTY' || auth?.role === 'HOD';

  const loadCourses = async () => {
    try {
      setError('');
      // Students only see their enrolled courses, others see all courses
      const data = isStudent ? await getMyEnrolledCourses() : await getCourses();
      setCourses(data);
    } catch (apiError) {
      if (apiError.response?.status === 401) {
        clearAuth();
        setAuth(null);
        setCourses([]);
        setError('Session expired. Please login again.');
        return;
      }

      const message = apiError.response?.data?.message
        || (apiError.message === 'Network Error' ? 'Unable to reach server. Please try again shortly.' : null)
        || 'Unable to load courses right now.';
      setError(typeof message === 'string' ? message : 'Unable to load courses right now.');
    }
  };

  useEffect(() => {
    if (auth?.token) {
      loadCourses();
    }
  }, [auth?.token]);

  const handleAuth = async ({ mode, username, password, fullName, email, role }) => {
    try {
      console.log('=== HANDLE AUTH START ===', { mode, username });
      setError('');
      
      const payload = mode === 'login' 
        ? { username, password } 
        : { username, password, fullName, email, role };
      
      console.log('=== CALLING AUTH API ===', mode, payload);
      const response = mode === 'login' ? await login(payload) : await register(payload);
      
      console.log('=== AUTH RESPONSE RECEIVED ===', response);
      saveAuth(response);
      setAuth(response);
      console.log('=== AUTH SUCCESS ===', response.username, response.role);
      setError('');
    } catch (apiError) {
      console.error('=== HANDLE AUTH ERROR ===', apiError);
      const errorMsg = apiError.response?.data?.message 
        || apiError.response?.data 
        || apiError.message 
        || 'Authentication failed. Please check your credentials.';
      console.error('=== AUTH ERROR MESSAGE ===', errorMsg);
      setError(typeof errorMsg === 'string' ? errorMsg : JSON.stringify(errorMsg));
      throw apiError;
    }
  };

  const handleLogout = () => {
    clearAuth();
    setAuth(null);
    setCourses([]);
    setEditingCourse(null);
    setError('');
  };

  const handleSubmit = async (courseData) => {
    try {
      setError('');
      if (!canCreate) {
        setError('You do not have permission to create or update courses.');
        return;
      }
      if (editingCourse) {
        await updateCourse(editingCourse.id, courseData);
        setEditingCourse(null);
      } else {
        await createCourse(courseData);
      }
      await loadCourses();
    } catch (apiError) {
      const message = apiError.response?.data?.message || 'Save failed. Check input and try again.';
      setError(message);
    }
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm('Delete this course?');
    if (!confirmed) {
      return;
    }

    try {
      setError('');
      if (!canDelete) {
        setError('You do not have permission to delete courses.');
        return;
      }
      await deleteCourse(id);
      if (editingCourse?.id === id) {
        setEditingCourse(null);
      }
      await loadCourses();
    } catch (apiError) {
      const message = apiError.response?.data?.message || 'Delete failed. Try again.';
      setError(message);
    }
  };

  if (!auth?.token) {
    return (
      <div className="container">
        <header className="site-hero">
          <h1>Course Management System</h1>
          <p>Sign in to access secure course management operations.</p>
        </header>
        <AuthForm onAuthSuccess={handleAuth} />
      </div>
    );
  }

  return (
    <div className="container">
      <header className="site-hero">
        <h1>Course Management System</h1>
        <p>
          Logged in as <strong>{auth.username}</strong> ({auth.role})
        </p>
        <div className="form-actions">
          <button className="secondary" onClick={handleLogout}>Logout</button>
        </div>
      </header>

      <div className="nav-tabs">
        <button
          className={activeTab === 'dashboard' ? 'active' : ''}
          onClick={() => {
            setActiveTab('dashboard');
            setError('');
          }}
        >
          📊 Overview
        </button>
        <button
          className={activeTab === 'courses' ? 'active' : ''}
          onClick={() => {
            setActiveTab('courses');
            setError('');
          }}
        >
          📚 Courses
        </button>
        <button
          className={activeTab === 'assignments' ? 'active' : ''}
          onClick={() => {
            setActiveTab('assignments');
            setError('');
          }}
        >
          📝 Assignments
        </button>
        {isStudent && (
          <button
            className={activeTab === 'gradebook' ? 'active' : ''}
            onClick={() => {
              setActiveTab('gradebook');
              setError('');
            }}
          >
            📈 Results
          </button>
        )}
        {isStudent && (
          <button
            className={activeTab === 'attendance' ? 'active' : ''}
            onClick={() => {
              setActiveTab('attendance');
              setError('');
            }}
          >
            🕒 Attendance
          </button>
        )}
        {!isStudent && (
          <button
            className={activeTab === 'attendanceManager' ? 'active' : ''}
            onClick={() => {
              setActiveTab('attendanceManager');
              setError('');
            }}
          >
            ✅ Attendance Hub
          </button>
        )}
        {isStudent && (
          <>
            <button
              className={activeTab === 'register' ? 'active' : ''}
              onClick={() => {
                setActiveTab('register');
                setShowRegistration(true);
                setError('');
              }}
            >
              🎓 Enroll Courses
            </button>
            <button
              className={activeTab === 'enrollments' ? 'active' : ''}
              onClick={() => {
                setActiveTab('enrollments');
                setShowMyEnrollments(true);
                setError('');
              }}
            >
              📄 Enrollments
            </button>
          </>
        )}
        {canApprove && (
          <button
            className={activeTab === 'approvals' ? 'active' : ''}
            onClick={() => {
              setActiveTab('approvals');
              setShowApprovals(true);
              setError('');
            }}
          >
            ✔ Approvals
          </button>
        )}
        <button
          className={activeTab === 'profile' ? 'active' : ''}
          onClick={() => {
            setActiveTab('profile');
            setError('');
            setEditingCourse(null);
          }}
        >
          👤 Profile
        </button>
        <button
          className={activeTab === 'messages' ? 'active' : ''}
          onClick={() => {
            setActiveTab('messages');
            setError('');
          }}
        >
          💬 Messages
        </button>
      </div>

      {showRegistration && (
        <Suspense fallback={<SectionLoader />}>
          <CourseRegistration
            onClose={() => {
              setShowRegistration(false);
              setActiveTab('courses');
            }}
          />
        </Suspense>
      )}

      {showMyEnrollments && (
        <Suspense fallback={<SectionLoader />}>
          <MyEnrollments
            onClose={() => {
              setShowMyEnrollments(false);
              setActiveTab('courses');
            }}
          />
        </Suspense>
      )}

      {showApprovals && (
        <Suspense fallback={<SectionLoader />}>
          <EnrollmentApprovals
            onClose={() => {
              setShowApprovals(false);
              setActiveTab('courses');
            }}
          />
        </Suspense>
      )}

      {error && <div className="error-banner">{error}</div>}

      {activeTab === 'dashboard' && (
        <Suspense fallback={<SectionLoader />}>
          {(auth.role === 'ADMIN' || auth.role === 'HOD') && <AdminDashboard />}
          {auth.role === 'FACULTY' && <FacultyDashboard />}
          {auth.role === 'STUDENT' && <StudentDashboard />}
        </Suspense>
      )}

      {activeTab === 'courses' && (
        <Suspense fallback={<SectionLoader />}>
          {canCreate && (
            <CourseForm onSubmit={handleSubmit} editingCourse={editingCourse} onCancel={() => setEditingCourse(null)} />
          )}

          <section>
            <h2>{isStudent ? 'My Enrolled Courses' : 'Courses'}</h2>
            {isStudent && courses.length === 0 && (
              <p className="info-message">You are not enrolled in any courses yet. Use "Register for Courses" to enroll.</p>
            )}
            <CourseList
              courses={courses}
              onEdit={setEditingCourse}
              onDelete={handleDelete}
              onViewDetails={setViewingMaterials}
              canManage={canCreate}
              canDelete={canDelete}
            />
          </section>
        </Suspense>
      )}

      {activeTab === 'assignments' && (
        <Suspense fallback={<SectionLoader />}>
          <AssignmentManager />
        </Suspense>
      )}

      {activeTab === 'gradebook' && (
        <Suspense fallback={<SectionLoader />}>
          <Gradebook />
        </Suspense>
      )}

      {activeTab === 'attendance' && (
        <Suspense fallback={<SectionLoader />}>
          <StudentAttendance />
        </Suspense>
      )}

      {activeTab === 'attendanceManager' && (
        <Suspense fallback={<SectionLoader />}>
          <AttendanceManager />
        </Suspense>
      )}

      {activeTab === 'profile' && (
        <Suspense fallback={<SectionLoader />}>
          <Profile />
        </Suspense>
      )}

      {activeTab === 'messages' && (
        <Suspense fallback={<SectionLoader />}>
          <MessagingCenter />
        </Suspense>
      )}

      {viewingMaterials && (
        <Suspense fallback={<SectionLoader />}>
          <CourseMaterials
            course={viewingMaterials}
            canManage={canCreate}
            canDelete={canDelete}
            onClose={() => setViewingMaterials(null)}
          />
        </Suspense>
      )}
    </div>
  );
}

export default App;

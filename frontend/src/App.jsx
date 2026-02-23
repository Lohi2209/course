import { useEffect, useState } from 'react';
import CourseForm from './components/CourseForm';
import CourseList from './components/CourseList';
import Profile from './components/Profile';
import CourseMaterials from './components/CourseMaterials';
import CourseRegistration from './components/CourseRegistration';
import MyEnrollments from './components/MyEnrollments';
import EnrollmentApprovals from './components/EnrollmentApprovals';
import AdminDashboard from './components/AdminDashboard';
import FacultyDashboard from './components/FacultyDashboard';
import StudentDashboard from './components/StudentDashboard';
import AssignmentManager from './components/AssignmentManager';
import Gradebook from './components/Gradebook';
import { createCourse, deleteCourse, getCourses, updateCourse, getMyEnrolledCourses } from './api/courseApi';
import AuthForm from './components/AuthForm';
import { clearAuth, getAuth, login, register, saveAuth } from './api/authApi';

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
      setError('Unable to load courses. Ensure backend is running.');
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
        <header>
          <h1>Course Management System</h1>
          <p>Sign in to access secure course management operations.</p>
        </header>
        <AuthForm onAuthSuccess={handleAuth} />
      </div>
    );
  }

  return (
    <div className="container">
      <header>
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
          Dashboard
        </button>
        <button
          className={activeTab === 'courses' ? 'active' : ''}
          onClick={() => {
            setActiveTab('courses');
            setError('');
          }}
        >
          Courses
        </button>
        <button
          className={activeTab === 'assignments' ? 'active' : ''}
          onClick={() => {
            setActiveTab('assignments');
            setError('');
          }}
        >
          Assignments
        </button>
        {isStudent && (
          <button
            className={activeTab === 'gradebook' ? 'active' : ''}
            onClick={() => {
              setActiveTab('gradebook');
              setError('');
            }}
          >
            My Gradebook
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
              Register for Courses
            </button>
            <button
              className={activeTab === 'enrollments' ? 'active' : ''}
              onClick={() => {
                setActiveTab('enrollments');
                setShowMyEnrollments(true);
                setError('');
              }}
            >
              My Enrollments
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
            Enrollment Approvals
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
          My Profile
        </button>
      </div>

      {showRegistration && (
        <CourseRegistration
          onClose={() => {
            setShowRegistration(false);
            setActiveTab('courses');
          }}
        />
      )}

      {showMyEnrollments && (
        <MyEnrollments
          onClose={() => {
            setShowMyEnrollments(false);
            setActiveTab('courses');
          }}
        />
      )}

      {showApprovals && (
        <EnrollmentApprovals
          onClose={() => {
            setShowApprovals(false);
            setActiveTab('courses');
          }}
        />
      )}

      {error && <div className="error-banner">{error}</div>}

      {activeTab === 'dashboard' && (
        <>
          {(auth.role === 'ADMIN' || auth.role === 'HOD') && <AdminDashboard />}
          {auth.role === 'FACULTY' && <FacultyDashboard />}
          {auth.role === 'STUDENT' && <StudentDashboard />}
        </>
      )}

      {activeTab === 'courses' && (
        <>
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
        </>
      )}

      {activeTab === 'assignments' && <AssignmentManager />}

      {activeTab === 'gradebook' && <Gradebook />}

      {activeTab === 'profile' && <Profile />}

      {viewingMaterials && (
        <CourseMaterials
          course={viewingMaterials}
          canManage={canCreate}
          canDelete={canDelete}
          onClose={() => setViewingMaterials(null)}
        />
      )}
    </div>
  );
}

export default App;

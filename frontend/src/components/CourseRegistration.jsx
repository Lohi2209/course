import { useState, useEffect } from 'react';
import { getCourses } from '../api/courseApi';
import { registerForCourse } from '../api/enrollmentApi';
import '../styles.css';

function CourseRegistration({ onClose }) {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [registering, setRegistering] = useState(null);

    useEffect(() => {
        loadCourses();
    }, []);

    const loadCourses = async () => {
        try {
            const data = await getCourses();
            setCourses(data);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load courses');
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async (courseId) => {
        if (registering) return;
        
        try {
            setRegistering(courseId);
            setError('');
            await registerForCourse(courseId);
            alert('Registration submitted successfully! Awaiting approval.');
        } catch (err) {
            const errorMsg = err.response?.data?.message || err.response?.data || 'Failed to register';
            setError(typeof errorMsg === 'string' ? errorMsg : 'Failed to register for course');
        } finally {
            setRegistering(null);
        }
    };

    if (loading) return <div className="loading">Loading courses...</div>;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content registration-modal" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Course Registration</h2>
                    <button className="close-button" onClick={onClose}>&times;</button>
                </div>

                {error && <div className="error-message">{error}</div>}

                <div className="courses-grid">
                    {courses.length === 0 ? (
                        <p>No courses available for registration.</p>
                    ) : (
                        courses.map(course => (
                            <div key={course.id} className="course-card">
                                <div className="course-card-header">
                                    <h3>{course.courseName}</h3>
                                    <span className="course-code">{course.courseCode}</span>
                                </div>
                                
                                <p className="course-description">{course.description}</p>
                                
                                <div className="course-details">
                                    {course.faculty && (
                                        <div className="detail-item">
                                            <strong>Faculty:</strong> {course.faculty.fullName}
                                        </div>
                                    )}
                                    
                                    {course.semester && (
                                        <div className="detail-item">
                                            <strong>Semester:</strong> {course.semester}
                                        </div>
                                    )}
                                    
                                    {course.meetingDays && course.meetingTime && (
                                        <div className="detail-item">
                                            <strong>Schedule:</strong> {course.meetingDays}, {course.meetingTime}
                                        </div>
                                    )}
                                    
                                    {course.prerequisites && course.prerequisites.length > 0 && (
                                        <div className="detail-item">
                                            <strong>Prerequisites:</strong> {course.prerequisites.length} course(s)
                                        </div>
                                    )}
                                </div>
                                
                                <button 
                                    className="button primary"
                                    onClick={() => handleRegister(course.id)}
                                    disabled={registering === course.id}
                                >
                                    {registering === course.id ? 'Registering...' : 'Register'}
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}

export default CourseRegistration;

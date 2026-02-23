import { useState, useEffect } from 'react';
import { getMyEnrollments, dropCourse } from '../api/enrollmentApi';
import '../styles.css';

function MyEnrollments({ onClose }) {
    const [enrollments, setEnrollments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [dropping, setDropping] = useState(null);

    useEffect(() => {
        loadEnrollments();
    }, []);

    const loadEnrollments = async () => {
        try {
            const response = await getMyEnrollments();
            setEnrollments(response.data);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load enrollments');
        } finally {
            setLoading(false);
        }
    };

    const handleDrop = async (enrollmentId) => {
        if (!confirm('Are you sure you want to drop this course?')) return;
        
        try {
            setDropping(enrollmentId);
            setError('');
            await dropCourse(enrollmentId);
            // Refresh the list
            await loadEnrollments();
            alert('Course dropped successfully');
        } catch (err) {
            setError(err.response?.data?.message || err.response?.data || 'Failed to drop course');
        } finally {
            setDropping(null);
        }
    };

    const getStatusBadge = (status) => {
        const statusClasses = {
            PENDING: 'status-badge pending',
            APPROVED: 'status-badge approved',
            REJECTED: 'status-badge rejected',
            DROPPED: 'status-badge dropped'
        };
        return <span className={statusClasses[status]}>{status}</span>;
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    if (loading) return <div className="loading">Loading enrollments...</div>;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content enrollment-modal" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>My Enrollments</h2>
                    <button className="close-button" onClick={onClose}>&times;</button>
                </div>

                {error && <div className="error-message">{error}</div>}

                <div className="enrollments-list">
                    {enrollments.length === 0 ? (
                        <p>You have no enrollments yet.</p>
                    ) : (
                        <table className="enrollments-table">
                            <thead>
                                <tr>
                                    <th>Course Code</th>
                                    <th>Course Name</th>
                                    <th>Status</th>
                                    <th>Request Date</th>
                                    <th>Approval Date</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {enrollments.map(enrollment => (
                                    <tr key={enrollment.id}>
                                        <td>{enrollment.courseCode}</td>
                                        <td>{enrollment.courseName}</td>
                                        <td>{getStatusBadge(enrollment.status)}</td>
                                        <td>{formatDate(enrollment.requestDate)}</td>
                                        <td>{formatDate(enrollment.approvalDate)}</td>
                                        <td>
                                            {(enrollment.status === 'APPROVED' || enrollment.status === 'PENDING') && (
                                                <button
                                                    className="button danger small"
                                                    onClick={() => handleDrop(enrollment.id)}
                                                    disabled={dropping === enrollment.id}
                                                >
                                                    {dropping === enrollment.id ? 'Dropping...' : 'Drop'}
                                                </button>
                                            )}
                                            {enrollment.status === 'REJECTED' && (
                                                <span className="text-muted">-</span>
                                            )}
                                            {enrollment.status === 'DROPPED' && (
                                                <span className="text-muted">-</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
}

export default MyEnrollments;

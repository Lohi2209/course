import { useState, useEffect } from 'react';
import { getPendingEnrollments, approveEnrollment, rejectEnrollment } from '../api/enrollmentApi';
import '../styles.css';

function EnrollmentApprovals({ onClose }) {
    const [enrollments, setEnrollments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [processing, setProcessing] = useState(null);

    useEffect(() => {
        loadPendingEnrollments();
    }, []);

    const loadPendingEnrollments = async () => {
        try {
            const response = await getPendingEnrollments();
            setEnrollments(response.data);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load enrollments');
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (enrollmentId) => {
        try {
            setProcessing(enrollmentId);
            setError('');
            await approveEnrollment(enrollmentId);
            // Remove from list
            setEnrollments(enrollments.filter(e => e.id !== enrollmentId));
            alert('Enrollment approved successfully');
        } catch (err) {
            setError(err.response?.data?.message || err.response?.data || 'Failed to approve enrollment');
        } finally {
            setProcessing(null);
        }
    };

    const handleReject = async (enrollmentId) => {
        if (!confirm('Are you sure you want to reject this enrollment?')) return;
        
        try {
            setProcessing(enrollmentId);
            setError('');
            await rejectEnrollment(enrollmentId);
            // Remove from list
            setEnrollments(enrollments.filter(e => e.id !== enrollmentId));
            alert('Enrollment rejected');
        } catch (err) {
            setError(err.response?.data?.message || err.response?.data || 'Failed to reject enrollment');
        } finally {
            setProcessing(null);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) return <div className="loading">Loading pending enrollments...</div>;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content approval-modal" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>✅ Enrollment Approvals</h2>
                    <button className="close-button" onClick={onClose}>&times;</button>
                </div>

                {error && <div className="error-message">{error}</div>}

                <div className="approvals-list">
                    {enrollments.length === 0 ? (
                        <p className="no-pending">No pending enrollments at this time.</p>
                    ) : (
                        <table className="approvals-table">
                            <thead>
                                <tr>
                                    <th>Student</th>
                                    <th>Email</th>
                                    <th>Course</th>
                                    <th>Request Date</th>
                                    <th>Notes</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {enrollments.map(enrollment => (
                                    <tr key={enrollment.id}>
                                        <td>{enrollment.studentName}</td>
                                        <td>{enrollment.studentEmail}</td>
                                        <td>
                                            <div>
                                                <strong>{enrollment.courseCode}</strong>
                                                <div className="course-name-small">{enrollment.courseName}</div>
                                            </div>
                                        </td>
                                        <td>{formatDate(enrollment.requestDate)}</td>
                                        <td>{enrollment.notes || '-'}</td>
                                        <td>
                                            <div className="action-buttons">
                                                <button
                                                    className="button success small"
                                                    onClick={() => handleApprove(enrollment.id)}
                                                    disabled={processing === enrollment.id}
                                                >
                                                    {processing === enrollment.id ? '...' : 'Approve'}
                                                </button>
                                                <button
                                                    className="button danger small"
                                                    onClick={() => handleReject(enrollment.id)}
                                                    disabled={processing === enrollment.id}
                                                >
                                                    {processing === enrollment.id ? '...' : 'Reject'}
                                                </button>
                                            </div>
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

export default EnrollmentApprovals;

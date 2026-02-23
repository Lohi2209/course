function CourseList({ courses, onEdit, onDelete, onViewDetails, canManage, canDelete }) {
  if (courses.length === 0) {
    return <p className="empty-state">No courses available. Add your first course.</p>;
  }

  return (
    <div className="course-list">
      {courses.map((course) => (
        <div key={course.id} className="course-card">
          <h3>{course.courseName}</h3>
          <p><strong>Code:</strong> {course.courseCode}</p>
          <p><strong>Duration:</strong> {course.durationInWeeks} weeks</p>
          {course.faculty && (
            <p><strong>Faculty:</strong> {course.faculty.fullName}</p>
          )}
          {course.semester && (
            <p><strong>Semester:</strong> {course.semester}</p>
          )}
          {course.meetingDays && (
            <p><strong>Schedule:</strong> {course.meetingDays} {course.meetingTime && `at ${course.meetingTime}`}</p>
          )}
          {course.prerequisites && course.prerequisites.length > 0 && (
            <p><strong>Prerequisites:</strong> {course.prerequisites.length} course(s)</p>
          )}
          <p>{course.description || 'No description provided.'}</p>
          <div className="card-actions">
            {onViewDetails && (
              <button className="secondary" onClick={() => onViewDetails(course)}>
                View Materials
              </button>
            )}
            {canManage && (
              <>
                <button onClick={() => onEdit(course)}>Edit</button>
                {canDelete && (
                  <button className="danger" onClick={() => onDelete(course.id)}>
                    Delete
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export default CourseList;

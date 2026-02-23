import { useEffect, useState } from 'react';
import { getAllFaculty } from '../api/userApi';
import { getCourses } from '../api/courseApi';

const initialState = {
  courseCode: '',
  courseName: '',
  description: '',
  durationInWeeks: '',
  facultyId: '',
  prerequisiteIds: [],
  semester: '',
  startDate: '',
  endDate: '',
  meetingDays: '',
  meetingTime: ''
};

function CourseForm({ onSubmit, editingCourse, onCancel }) {
  const [formData, setFormData] = useState(initialState);
  const [faculty, setFaculty] = useState([]);
  const [allCourses, setAllCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [facultyData, coursesData] = await Promise.all([
        getAllFaculty(),
        getCourses()
      ]);
      setFaculty(facultyData);
      setAllCourses(coursesData);
    } catch (err) {
      console.error('Failed to load data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (editingCourse) {
      setFormData({
        courseCode: editingCourse.courseCode,
        courseName: editingCourse.courseName,
        description: editingCourse.description || '',
        durationInWeeks: editingCourse.durationInWeeks,
        facultyId: editingCourse.faculty?.id || '',
        prerequisiteIds: editingCourse.prerequisites?.map(p => p.id) || [],
        semester: editingCourse.semester || '',
        startDate: editingCourse.startDate || '',
        endDate: editingCourse.endDate || '',
        meetingDays: editingCourse.meetingDays || '',
        meetingTime: editingCourse.meetingTime || ''
      });
    } else {
      setFormData(initialState);
    }
  }, [editingCourse]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePrerequisiteChange = (event) => {
    const options = event.target.options;
    const selected = [];
    for (let i = 0; i < options.length; i++) {
      if (options[i].selected) {
        selected.push(Number(options[i].value));
      }
    }
    setFormData((prev) => ({ ...prev, prerequisiteIds: selected }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    const submitData = {
      courseCode: formData.courseCode,
      courseName: formData.courseName,
      description: formData.description,
      durationInWeeks: Number(formData.durationInWeeks),
      faculty: formData.facultyId ? { id: Number(formData.facultyId) } : null,
      prerequisites: formData.prerequisiteIds.map(id => ({ id })),
      semester: formData.semester,
      startDate: formData.startDate || null,
      endDate: formData.endDate || null,
      meetingDays: formData.meetingDays,
      meetingTime: formData.meetingTime
    };

    await onSubmit(submitData);

    if (!editingCourse) {
      setFormData(initialState);
    }
  };

  if (loading) {
    return <div className="course-form"><p>Loading...</p></div>;
  }

  return (
    <form className="course-form" onSubmit={handleSubmit}>
      <h2>{editingCourse ? 'Update Course' : 'Add New Course'}</h2>

      <div className="form-grid">
        <label>
          Course Code *
          <input
            type="text"
            name="courseCode"
            value={formData.courseCode}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          Course Name *
          <input
            type="text"
            name="courseName"
            value={formData.courseName}
            onChange={handleChange}
            required
          />
        </label>
      </div>

      <label>
        Description
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows="3"
        />
      </label>

      <div className="form-grid">
        <label>
          Duration (weeks) *
          <input
            type="number"
            name="durationInWeeks"
            value={formData.durationInWeeks}
            onChange={handleChange}
            min="1"
            required
          />
        </label>

        <label>
          Assign Faculty
          <select
            name="facultyId"
            value={formData.facultyId}
            onChange={handleChange}
          >
            <option value="">-- Select Faculty --</option>
            {faculty.map((f) => (
              <option key={f.id} value={f.id}>
                {f.fullName} ({f.role})
              </option>
            ))}
          </select>
        </label>
      </div>

      <label>
        Prerequisites (Hold Ctrl to select multiple)
        <select
          multiple
          size="4"
          value={formData.prerequisiteIds}
          onChange={handlePrerequisiteChange}
        >
          {allCourses
            .filter(c => !editingCourse || c.id !== editingCourse.id)
            .map((course) => (
              <option key={course.id} value={course.id}>
                {course.courseCode} - {course.courseName}
              </option>
            ))}
        </select>
      </label>

      <h3>Scheduling</h3>

      <div className="form-grid">
        <label>
          Semester
          <input
            type="text"
            name="semester"
            value={formData.semester}
            onChange={handleChange}
            placeholder="e.g., Fall 2026"
          />
        </label>

        <label>
          Meeting Days
          <input
            type="text"
            name="meetingDays"
            value={formData.meetingDays}
            onChange={handleChange}
            placeholder="e.g., Mon, Wed, Fri"
          />
        </label>
      </div>

      <div className="form-grid">
        <label>
          Start Date
          <input
            type="date"
            name="startDate"
            value={formData.startDate}
            onChange={handleChange}
          />
        </label>

        <label>
          End Date
          <input
            type="date"
            name="endDate"
            value={formData.endDate}
            onChange={handleChange}
          />
        </label>
      </div>

      <label>
        Meeting Time
        <input
          type="text"
          name="meetingTime"
          value={formData.meetingTime}
          onChange={handleChange}
          placeholder="e.g., 10:00 AM - 11:30 AM"
        />
      </label>

      <div className="form-actions">
        <button type="submit">{editingCourse ? 'Update' : 'Create'}</button>
        {editingCourse && (
          <button type="button" className="secondary" onClick={onCancel}>
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}

export default CourseForm;

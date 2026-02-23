import { useEffect, useState } from 'react';
import { getProfile, updateProfile, changePassword } from '../api/profileApi';

function Profile() {
  const [profile, setProfile] = useState(null);
  const [mode, setMode] = useState('view');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getProfile();
      setProfile(data);
      setFullName(data.fullName);
      setEmail(data.email);
    } catch (err) {
      setError('Failed to load profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    try {
      const response = await updateProfile({ fullName, email });
      setSuccess(response.message);
      setProfile({ ...profile, fullName, email });
      setMode('view');
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to update profile. Please try again.';
      setError(message);
    }
  };

  const handleChangePassword = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    try {
      const response = await changePassword({ currentPassword, newPassword });
      setSuccess(response.message);
      setCurrentPassword('');
      setNewPassword('');
      setMode('view');
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to change password. Please try again.';
      setError(message);
    }
  };

  if (loading) {
    return (
      <div className="container">
        <p>Loading profile...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container">
        <div className="error-banner">Failed to load profile.</div>
      </div>
    );
  }

  const getRoleLabel = (role) => {
    const roleLabels = {
      ADMIN: 'Administrator',
      FACULTY: 'Faculty',
      STUDENT: 'Student',
      HOD: 'Head of Department'
    };
    return roleLabels[role] || role;
  };

  return (
    <div className="profile-container">
      <h2>My Profile</h2>

      {error && <div className="error-banner">{error}</div>}
      {success && <div className="success-banner">{success}</div>}

      {mode === 'view' && (
        <div className="profile-view">
          <div className="profile-field">
            <label>Username:</label>
            <span>{profile.username}</span>
          </div>
          <div className="profile-field">
            <label>Full Name:</label>
            <span>{profile.fullName}</span>
          </div>
          <div className="profile-field">
            <label>Email:</label>
            <span>{profile.email}</span>
          </div>
          <div className="profile-field">
            <label>Role:</label>
            <span>{getRoleLabel(profile.role)}</span>
          </div>

          <div className="form-actions">
            <button onClick={() => setMode('edit')}>Edit Profile</button>
            <button className="secondary" onClick={() => setMode('password')}>
              Change Password
            </button>
          </div>
        </div>
      )}

      {mode === 'edit' && (
        <form className="course-form" onSubmit={handleUpdateProfile}>
          <label>
            Full Name
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              maxLength={100}
            />
          </label>

          <label>
            Email
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              maxLength={100}
            />
          </label>

          <div className="form-actions">
            <button type="submit">Save Changes</button>
            <button
              type="button"
              className="secondary"
              onClick={() => {
                setMode('view');
                setFullName(profile.fullName);
                setEmail(profile.email);
                setError('');
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {mode === 'password' && (
        <form className="course-form" onSubmit={handleChangePassword}>
          <label>
            Current Password
            <div className="password-input-wrap">
              <input
                type={showCurrentPassword ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="secondary"
                onClick={() => setShowCurrentPassword((current) => !current)}
              >
                {showCurrentPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </label>

          <label>
            New Password
            <div className="password-input-wrap">
              <input
                type={showNewPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={6}
              />
              <button
                type="button"
                className="secondary"
                onClick={() => setShowNewPassword((current) => !current)}
              >
                {showNewPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </label>

          <div className="form-actions">
            <button type="submit">Change Password</button>
            <button
              type="button"
              className="secondary"
              onClick={() => {
                setMode('view');
                setCurrentPassword('');
                setNewPassword('');
                setError('');
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

export default Profile;

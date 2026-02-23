import { useState } from 'react';

function AuthForm({ onAuthSuccess }) {
  const [mode, setMode] = useState('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('STUDENT');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const isLogin = mode === 'login';

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    try {
      const authData = isLogin 
        ? { mode, username, password }
        : { mode, username, password, fullName, email, role };
      await onAuthSuccess(authData);
    } catch (apiError) {
      const message = apiError.response?.data?.message || 'Authentication failed. Please try again.';
      setError(message);
    }
  };

  return (
    <div className="auth-wrapper">
      <form className="course-form" onSubmit={handleSubmit}>
        <h2>{isLogin ? 'Login' : 'Register'}</h2>

        {error && <div className="error-banner">{error}</div>}

        <label>
          Username
          <input
            type="text"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            required
            minLength={3}
          />
        </label>

        {!isLogin && (
          <>
            <label>
              Full Name
              <input
                type="text"
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                required
                maxLength={100}
              />
            </label>

            <label>
              Email
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                maxLength={100}
              />
            </label>

            <label>
              Role
              <select
                value={role}
                onChange={(event) => setRole(event.target.value)}
                required
              >
                <option value="STUDENT">Student</option>
                <option value="FACULTY">Faculty</option>
                <option value="HOD">Head of Department</option>
                <option value="ADMIN">Administrator</option>
              </select>
            </label>
          </>
        )}

        <label>
          Password
          <div className="password-input-wrap">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              minLength={6}
            />
            <button
              type="button"
              className="secondary"
              onClick={() => setShowPassword((current) => !current)}
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>
        </label>

        <div className="form-actions">
          <button type="submit">{isLogin ? 'Login' : 'Register'}</button>
          <button
            type="button"
            className="secondary"
            onClick={() => {
              setError('');
              setMode(isLogin ? 'register' : 'login');
            }}
          >
            {isLogin ? 'Switch to Register' : 'Switch to Login'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default AuthForm;

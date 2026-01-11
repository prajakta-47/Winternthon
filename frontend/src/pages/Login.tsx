import React, { useState } from 'react';

interface LoginProps {
  onLogin: (name: string, role: 'student' | 'teacher') => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [name, setName] = useState('');
  const [role, setRole] = useState<'student' | 'teacher'>('student');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onLogin(name, role);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>Personalized Learning Student Support System</h1>
        <p style={styles.subtitle}>Enter your details to continue</p>
        
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Your Name:</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              style={styles.input}
              required
            />
          </div>
          
          <div style={styles.inputGroup}>
            <label style={styles.label}>I am a:</label>
            <div style={styles.roleButtons}>
              <button
                type="button"
                onClick={() => setRole('student')}
                style={{
                  ...styles.roleButton,
                  ...(role === 'student' ? styles.roleButtonActive : {})
                }}
              >
                👨‍🎓 Student
              </button>
              <button
                type="button"
                onClick={() => setRole('teacher')}
                style={{
                  ...styles.roleButton,
                  ...(role === 'teacher' ? styles.roleButtonActive : {})
                }}
              >
                👩‍🏫 Teacher
              </button>
            </div>
          </div>
          
          <button type="submit" style={styles.submitButton}>
            Enter Classroom
          </button>
        </form>
        
        <div style={styles.infoBox}>
          <h3 style={styles.infoTitle}>System Features:</h3>
          <ul style={styles.featureList}>
            <li>🎯 AI-powered HelpBot for student support</li>
            <li>📝 Automatic lecture summary generation</li>
            <li>📊 Real-time student progress tracking</li>
            <li>🔔 Instant alerts for struggling students</li>
            <li>📱 Interactive polls and assessments</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    padding: '20px',
  },
  card: {
    background: 'white',
    borderRadius: '20px',
    padding: '40px',
    width: '100%',
    maxWidth: '500px',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
  },
  title: {
    color: '#333',
    textAlign: 'center' as const,
    marginBottom: '10px',
    fontSize: '28px',
  },
  subtitle: {
    color: '#666',
    textAlign: 'center' as const,
    marginBottom: '30px',
    fontSize: '16px',
  },
  form: {
    marginBottom: '30px',
  },
  inputGroup: {
    marginBottom: '20px',
  },
  label: {
    display: 'block',
    marginBottom: '8px',
    color: '#333',
    fontWeight: '500' as const,
  },
  input: {
    width: '100%',
    padding: '12px 15px',
    border: '2px solid #e1e8ed',
    borderRadius: '10px',
    fontSize: '16px',
    transition: 'border-color 0.3s',
  },
  roleButtons: {
    display: 'flex',
    gap: '10px',
  },
  roleButton: {
    flex: 1,
    padding: '15px',
    border: '2px solid #e1e8ed',
    borderRadius: '10px',
    background: 'white',
    fontSize: '16px',
    cursor: 'pointer',
  },
  roleButtonActive: {
    borderColor: '#667eea',
    background: '#667eea',
    color: 'white',
  },
  submitButton: {
    width: '100%',
    padding: '15px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    fontSize: '18px',
    fontWeight: '600' as const,
    cursor: 'pointer',
  },
  infoBox: {
    background: '#f8f9fa',
    borderRadius: '10px',
    padding: '20px',
    border: '1px solid #e1e8ed',
  },
  infoTitle: {
    color: '#333',
    marginBottom: '15px',
    fontSize: '18px',
  },
  featureList: {
    listStyle: 'none',
    padding: '0',
  },
  featureListLi: {
    marginBottom: '8px',
    color: '#555',
    paddingLeft: '20px',
    position: 'relative' as const,
  },
};

export default Login;
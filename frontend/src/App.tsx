import React, { useState, useEffect } from 'react';
import Login from './pages/Login';
import StudentDashboard from './pages/StudentDashboard';
import TeacherDashboard from './pages/TeacherDashboard';

function App() {
  const [name, setName] = useState('');
  const [role, setRole] = useState<'student' | 'teacher' | null>(null);
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (name && role) {
      const websocket = new WebSocket('ws://localhost:8080');
      
      websocket.onopen = () => {
        console.log('WebSocket connected');
        setConnected(true);
        
        // Register user with WebSocket server
        websocket.send(JSON.stringify({
          type: 'register',
          name,
          role
        }));
      };
      
      websocket.onerror = (error) => {
        console.error('WebSocket error:', error);
        setConnected(false);
      };
      
      websocket.onclose = () => {
        console.log('WebSocket disconnected');
        setConnected(false);
      };
      
      setWs(websocket);
      
      return () => {
        websocket.close();
      };
    }
  }, [name, role]);

  const handleLogin = (userName: string, userRole: 'student' | 'teacher') => {
    setName(userName);
    setRole(userRole);
    
    // Also register with HTTP API
    fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: userName, role: userRole })
    }).catch(console.error);
  };

  const handleLogout = () => {
    setName('');
    setRole(null);
    setWs(null);
    setConnected(false);
  };

  if (!name || !role) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div>
      {/* Status Bar */}
      <div style={styles.statusBar}>
        <div style={styles.statusInfo}>
          <span style={styles.userInfo}>
            👤 {name} ({role === 'student' ? '👨‍🎓 Student' : '👩‍🏫 Teacher'})
          </span>
          <span style={{
            ...styles.connectionStatus,
            color: connected ? '#28a745' : '#dc3545'
          }}>
            {connected ? '● Connected' : '○ Disconnected'}
          </span>
        </div>
        <button onClick={handleLogout} style={styles.logoutButton}>
          Logout
        </button>
      </div>
      
      {/* Main Content */}
      {role === 'student' ? (
        <StudentDashboard name={name} ws={ws} />
      ) : (
        <TeacherDashboard name={name} ws={ws} />
      )}
      
      {/* Connection Warning */}
      {!connected && (
        <div style={styles.warningBanner}>
          ⚠️ Connection lost. Trying to reconnect...
        </div>
      )}
    </div>
  );
}

const styles = {
  statusBar: {
    backgroundColor: '#2c3e50',
    color: 'white',
    padding: '10px 20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    position: 'sticky' as const,
    top: 0,
    zIndex: 1000,
  },
  statusInfo: {
    display: 'flex',
    gap: '20px',
    alignItems: 'center',
  },
  userInfo: {
    fontSize: '16px',
  },
  connectionStatus: {
    fontSize: '14px',
  },
  logoutButton: {
    backgroundColor: '#e74c3c',
    color: 'white',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '14px',
  },
  warningBanner: {
    position: 'fixed' as const,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#ffc107',
    color: '#856404',
    padding: '10px',
    textAlign: 'center' as const,
    fontWeight: 'bold' as const,
    zIndex: 1000,
  },
};

export default App;
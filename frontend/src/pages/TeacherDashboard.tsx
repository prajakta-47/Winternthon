import React, { useState, useEffect, useRef } from 'react';

interface TeacherDashboardProps {
  name: string;
  ws: WebSocket | null;
}

interface StrugglingStudent {
  count: number;
  students: string[];
}

interface StudentAnswer {
  studentName: string;
  answer: number;
  correct: boolean;
  timestamp: Date;
}

interface Alert {
  id: string;
  type: 'warning' | 'info' | 'success';
  message: string;
  timestamp: Date;
  studentName?: string;
  topic?: string;
}

const TeacherDashboard: React.FC<TeacherDashboardProps> = ({ name, ws }) => {
  const [transcript, setTranscript] = useState('');
  const [summary, setSummary] = useState('');
  const [generatedSummary, setGeneratedSummary] = useState('');
  const [strugglingStudents, setStrugglingStudents] = useState<Record<string, StrugglingStudent>>({});
  const [recentAnswers, setRecentAnswers] = useState<StudentAnswer[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [pollQuestion, setPollQuestion] = useState('What does useState do in React?');
  const [pollOptions, setPollOptions] = useState([
    'Stores props',
    'Manages component state',
    'Handles API calls',
    'Styles components'
  ]);
  const [correctAnswer, setCorrectAnswer] = useState(1);
  const [activePoll, setActivePoll] = useState<any>(null);

  const wsRef = useRef<WebSocket | null>(null);
  wsRef.current = ws;

  useEffect(() => {
    if (!ws) return;

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      
      switch (message.type) {
        case 'teacher_init':
          setSummary(message.summary || '');
          if (message.difficultyMap) {
            const struggling: Record<string, StrugglingStudent> = {};
            message.difficultyMap.forEach(([topic, data]: [string, StrugglingStudent]) => {
              struggling[topic] = data;
            });
            setStrugglingStudents(struggling);
          }
          setRecentAnswers(message.studentAnswers || []);
          break;
          
        case 'student_struggling':
          const newAlert: Alert = {
            id: Date.now().toString(),
            type: 'warning',
            message: `Student struggling with "${message.topic}"`,
            timestamp: new Date(),
            studentName: message.studentName,
            topic: message.topic
          };
          setAlerts(prev => [newAlert, ...prev.slice(0, 9)]);
          break;
          
        case 'poll_update':
          setRecentAnswers(message.studentAnswers || []);
          if (message.difficultyMap) {
            const struggling: Record<string, StrugglingStudent> = {};
            message.difficultyMap.forEach(([topic, data]: [string, StrugglingStudent]) => {
              struggling[topic] = data;
            });
            setStrugglingStudents(struggling);
          }
          break;
      }
    };

    // Add welcome alert
    setAlerts([{
      id: 'welcome',
      type: 'info',
      message: `Welcome ${name}! You're now connected as teacher.`,
      timestamp: new Date()
    }]);

  }, [ws, name]);

  const generateSummary = async () => {
    if (!transcript.trim()) {
      alert('Please enter lecture transcript first');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/summary/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript })
      });
      
      const data = await response.json();
      if (data.success) {
        setGeneratedSummary(data.summary);
        setSummary(data.summary);
        
        // Publish to students
        await fetch('http://localhost:5000/api/summary/publish', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ summary: data.summary, teacherName: name })
        });

        const newAlert: Alert = {
          id: Date.now().toString(),
          type: 'success',
          message: 'Summary generated and published to all students',
          timestamp: new Date()
        };
        setAlerts(prev => [newAlert, ...prev]);
      }
    } catch (error) {
      console.error('Error generating summary:', error);
      alert('Failed to generate summary');
    }
  };

  const triggerPoll = () => {
    if (!wsRef.current) return;

    wsRef.current.send(JSON.stringify({
      type: 'create_poll',
      role: 'teacher',
      question: pollQuestion,
      options: pollOptions,
      correctAnswer: correctAnswer
    }));

    setActivePoll({
      question: pollQuestion,
      options: pollOptions,
      correctAnswer
    });

    const newAlert: Alert = {
      id: Date.now().toString(),
      type: 'info',
      message: 'Poll sent to all students',
      timestamp: new Date()
    };
    setAlerts(prev => [newAlert, ...prev]);
  };

  const endPoll = () => {
    if (!wsRef.current || !activePoll) return;

    wsRef.current.send(JSON.stringify({
      type: 'end_poll',
      role: 'teacher'
    }));

    setActivePoll(null);
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.title}>Teacher Dashboard 👩‍🏫</h1>
        <p style={styles.subtitle}>Welcome, {name}! Monitor and support your students.</p>
      </header>

      <div style={styles.grid}>
        {/* Left Column - Lecture Management */}
        <div style={styles.column}>
          <div className="section-card">
            <h2 style={styles.sectionTitle}>📝 Post Lecture</h2>
            <textarea
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              placeholder="Paste your lecture transcript here..."
              style={styles.textarea}
              rows={8}
            />
            <button onClick={generateSummary} style={styles.primaryButton}>
              Generate & Publish Summary
            </button>
            
            {generatedSummary && (
              <div style={styles.summaryPreview}>
                <h3 style={styles.previewTitle}>Generated Summary:</h3>
                <div style={styles.previewContent}>
                  {generatedSummary.split('\n').map((line, idx) => (
                    <p key={idx}>{line}</p>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="section-card">
            <h2 style={styles.sectionTitle}>🎯 Create Poll</h2>
            <div style={styles.pollForm}>
              <input
                type="text"
                value={pollQuestion}
                onChange={(e) => setPollQuestion(e.target.value)}
                placeholder="Poll question..."
                style={styles.input}
              />
              
              {pollOptions.map((option, idx) => (
                <div key={idx} style={styles.optionRow}>
                  <input
                    type="radio"
                    checked={correctAnswer === idx}
                    onChange={() => setCorrectAnswer(idx)}
                    style={styles.radio}
                  />
                  <input
                    type="text"
                    value={option}
                    onChange={(e) => {
                      const newOptions = [...pollOptions];
                      newOptions[idx] = e.target.value;
                      setPollOptions(newOptions);
                    }}
                    placeholder={`Option ${idx + 1}`}
                    style={styles.optionInput}
                  />
                </div>
              ))}
              
              <div style={styles.pollButtons}>
                <button onClick={triggerPoll} style={styles.primaryButton}>
                  {activePoll ? 'Update Poll' : 'Send Poll to Students'}
                </button>
                {activePoll && (
                  <button onClick={endPoll} style={styles.secondaryButton}>
                    End Poll
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Monitoring */}
        <div style={styles.column}>
          {/* Alerts */}
          <div className="section-card">
            <h2 style={styles.sectionTitle}>🔔 Real-time Alerts</h2>
            <div style={styles.alertsContainer}>
              {alerts.length === 0 ? (
                <p style={styles.placeholder}>No alerts yet</p>
              ) : (
                alerts.map(alert => (
                  <div
                    key={alert.id}
                    style={{
                      ...styles.alertItem,
                      backgroundColor: alert.type === 'warning' ? '#fff3cd' :
                                      alert.type === 'success' ? '#d4edda' : '#d1ecf1',
                      borderColor: alert.type === 'warning' ? '#ffeaa7' :
                                   alert.type === 'success' ? '#c3e6cb' : '#bee5eb',
                    }}
                    className={alert.type === 'warning' ? 'alert-box' : ''}
                  >
                    <div style={styles.alertHeader}>
                      <span style={styles.alertType}>
                        {alert.type === 'warning' ? '⚠️' :
                         alert.type === 'success' ? '✅' : 'ℹ️'}
                      </span>
                      <span style={styles.alertTime}>
                        {alert.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                    <p style={styles.alertMessage}>{alert.message}</p>
                    {alert.studentName && (
                      <p style={styles.alertDetail}>Student: {alert.studentName}</p>
                    )}
                    {alert.topic && (
                      <p style={styles.alertDetail}>Topic: {alert.topic}</p>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Struggling Students */}
          <div className="section-card">
            <h2 style={styles.sectionTitle}>📊 Students Needing Help</h2>
            {Object.keys(strugglingStudents).length === 0 ? (
              <p style={styles.placeholder}>All students are doing well! 🎉</p>
            ) : (
              Object.entries(strugglingStudents).map(([topic, data]) => (
                <div key={topic} style={styles.strugglingCard}>
                  <h3 style={styles.topicTitle}>{topic}</h3>
                  <p style={styles.strugglingCount}>
                    {data.count} student{data.count > 1 ? 's' : ''} struggling
                  </p>
                  <div style={styles.studentList}>
                    {data.students.map(student => (
                      <span key={student} style={styles.studentTag}>{student}</span>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Recent Answers */}
          <div className="section-card">
            <h2 style={styles.sectionTitle}>📈 Recent Answers</h2>
            <div style={styles.answersList}>
              {recentAnswers.slice(-5).map((answer, idx) => (
                <div key={idx} style={styles.answerItem}>
                  <div style={styles.answerHeader}>
                    <span style={styles.studentName}>{answer.studentName}</span>
                    <span style={{
                      ...styles.answerStatus,
                      color: answer.correct ? '#28a745' : '#dc3545'
                    }}>
                      {answer.correct ? '✓ Correct' : '✗ Incorrect'}
                    </span>
                  </div>
                  <p style={styles.answerTime}>
                    {new Date(answer.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '20px',
  },
  header: {
    textAlign: 'center' as const,
    marginBottom: '40px',
    color: 'white',
  },
  title: {
    fontSize: '36px',
    marginBottom: '10px',
    textShadow: '2px 2px 4px rgba(0,0,0,0.2)',
  },
  subtitle: {
    fontSize: '18px',
    opacity: 0.9,
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '30px',
    '@media (max-width: 1024px)': {
      gridTemplateColumns: '1fr',
    },
  },
  column: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '25px',
  },
  sectionTitle: {
    color: '#333',
    marginBottom: '20px',
    fontSize: '22px',
    borderBottom: '3px solid #667eea',
    paddingBottom: '10px',
  },
  textarea: {
    width: '100%',
    padding: '15px',
    border: '2px solid #e1e8ed',
    borderRadius: '10px',
    fontSize: '16px',
    marginBottom: '15px',
    resize: 'vertical' as const,
    minHeight: '150px',
  },
  input: {
    width: '100%',
    padding: '12px 15px',
    border: '2px solid #e1e8ed',
    borderRadius: '10px',
    fontSize: '16px',
    marginBottom: '15px',
  },
  primaryButton: {
    width: '100%',
    padding: '15px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    fontSize: '16px',
    fontWeight: '600' as const,
    cursor: 'pointer',
    marginBottom: '15px',
  },
  secondaryButton: {
    width: '100%',
    padding: '15px',
    background: '#6c757d',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    fontSize: '16px',
    fontWeight: '600' as const,
    cursor: 'pointer',
  },
  summaryPreview: {
    marginTop: '20px',
    padding: '15px',
    backgroundColor: '#f8f9fa',
    borderRadius: '10px',
    borderLeft: '4px solid #28a745',
  },
  previewTitle: {
    color: '#333',
    marginBottom: '10px',
    fontSize: '18px',
  },
  previewContent: {
    lineHeight: '1.6',
    color: '#555',
  },
  pollForm: {
    marginTop: '15px',
  },
  optionRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '10px',
  },
  radio: {
    width: '20px',
    height: '20px',
  },
  optionInput: {
    flex: 1,
    padding: '10px 15px',
    border: '2px solid #e1e8ed',
    borderRadius: '8px',
    fontSize: '16px',
  },
  pollButtons: {
    display: 'flex',
    gap: '10px',
    marginTop: '20px',
  },
  alertsContainer: {
    maxHeight: '300px',
    overflowY: 'auto' as const,
  },
  alertItem: {
    padding: '15px',
    borderRadius: '10px',
    marginBottom: '10px',
    border: '1px solid',
  },
  alertHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '10px',
  },
  alertType: {
    fontSize: '20px',
  },
  alertTime: {
    fontSize: '12px',
    color: '#666',
  },
  alertMessage: {
    margin: '0',
    fontWeight: '500' as const,
  },
  alertDetail: {
    margin: '5px 0 0',
    fontSize: '14px',
    color: '#666',
  },
  placeholder: {
    color: '#999',
    textAlign: 'center' as const,
    padding: '30px 20px',
    fontStyle: 'italic' as const,
  },
  strugglingCard: {
    padding: '15px',
    backgroundColor: '#fff3cd',
    borderRadius: '10px',
    marginBottom: '15px',
    border: '1px solid #ffeaa7',
  },
  topicTitle: {
    color: '#856404',
    marginBottom: '5px',
    fontSize: '16px',
  },
  strugglingCount: {
    color: '#856404',
    marginBottom: '10px',
    fontSize: '14px',
  },
  studentList: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: '8px',
  },
  studentTag: {
    backgroundColor: '#ffeaa7',
    color: '#856404',
    padding: '5px 10px',
    borderRadius: '20px',
    fontSize: '12px',
  },
  answersList: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '10px',
  },
  answerItem: {
    padding: '12px',
    backgroundColor: '#f8f9fa',
    borderRadius: '8px',
    borderLeft: '3px solid #6c757d',
  },
  answerHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '5px',
  },
  studentName: {
    fontWeight: '500' as const,
    color: '#333',
  },
  answerStatus: {
    fontSize: '12px',
    fontWeight: '600' as const,
  },
  answerTime: {
    margin: '0',
    fontSize: '11px',
    color: '#666',
  },
};

export default TeacherDashboard;
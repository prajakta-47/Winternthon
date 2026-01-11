import React, { useState, useEffect, useRef } from 'react';
import HelpBot from './HelpBot';
import PollView from './PollView';

interface StudentDashboardProps {
  name: string;
  ws: WebSocket | null;
}

interface Summary {
  content: string;
  fromTeacher: string;
  timestamp: string;
}

const StudentDashboard: React.FC<StudentDashboardProps> = ({ name, ws }) => {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [activePoll, setActivePoll] = useState<any>(null);
  const [answeredPolls, setAnsweredPolls] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!ws) return;

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      
      switch (message.type) {
        case 'new_summary':
          setSummary({
            content: message.summary,
            fromTeacher: message.fromTeacher || 'Teacher',
            timestamp: message.timestamp
          });
          break;
          
        case 'new_poll':
          setActivePoll(message.poll);
          break;
          
        case 'answer_result':
          if (activePoll) {
            setAnsweredPolls(prev => new Set([...prev, activePoll.id]));
            setTimeout(() => setActivePoll(null), 3000);
          }
          break;
          
        case 'poll_ended':
          setActivePoll(null);
          break;
      }
    };
  }, [ws, activePoll]);

  const handleAnswerSubmit = (answerIndex: number) => {
    if (!ws || !activePoll) return;
    
    ws.send(JSON.stringify({
      type: 'submit_answer',
      answer: answerIndex
    }));
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.title}>Welcome, {name}! 👨‍🎓</h1>
        <p style={styles.subtitle}>Student Dashboard - Personalized Learning Support</p>
      </header>
      
      <div style={styles.content}>
        {/* Summary Section */}
        <div className="section-card" style={styles.section}>
          <h2 style={styles.sectionTitle}>📚 Lecture Summary</h2>
          {summary ? (
            <div>
              <p style={styles.summaryMeta}>
                From: {summary.fromTeacher} • {new Date(summary.timestamp).toLocaleTimeString()}
              </p>
              <div style={styles.summaryContent}>
                {summary.content.split('\n').map((line, idx) => (
                  <p key={idx} style={styles.summaryLine}>{line}</p>
                ))}
              </div>
            </div>
          ) : (
            <p style={styles.placeholder}>No summary posted yet. Check back soon!</p>
          )}
        </div>
        
        {/* HelpBot Section */}
        <div className="section-card" style={styles.section}>
          <HelpBot studentName={name} />
        </div>
        
        {/* Active Poll */}
        {activePoll && !answeredPolls.has(activePoll.id) && (
          <div style={styles.pollContainer}>
            <PollView 
              poll={activePoll}
              onSubmit={handleAnswerSubmit}
              studentName={name}
            />
          </div>
        )}
        
        {/* Recent Activity */}
        <div className="section-card" style={styles.section}>
          <h2 style={styles.sectionTitle}>📈 Your Activity</h2>
          <div style={styles.activityList}>
            <div style={styles.activityItem}>
              <span>✅ Connected to classroom</span>
              <span style={styles.activityTime}>Just now</span>
            </div>
            {summary && (
              <div style={styles.activityItem}>
                <span>📖 Received lecture summary</span>
                <span style={styles.activityTime}>
                  {new Date(summary.timestamp).toLocaleTimeString()}
                </span>
              </div>
            )}
            {answeredPolls.size > 0 && (
              <div style={styles.activityItem}>
                <span>🎯 Completed {answeredPolls.size} poll(s)</span>
                <span style={styles.activityTime}>Recent activity</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '1000px',
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
  content: {
    display: 'grid',
    gap: '25px',
  },
  section: {
    marginBottom: '0',
  },
  sectionTitle: {
    color: '#333',
    marginBottom: '20px',
    fontSize: '24px',
    borderBottom: '3px solid #667eea',
    paddingBottom: '10px',
  },
  summaryMeta: {
    color: '#666',
    fontSize: '14px',
    marginBottom: '15px',
    fontStyle: 'italic' as const,
  },
  summaryContent: {
    backgroundColor: '#f8f9fa',
    padding: '20px',
    borderRadius: '10px',
    borderLeft: '4px solid #667eea',
  },
  summaryLine: {
    marginBottom: '10px',
    lineHeight: '1.6',
  },
  placeholder: {
    color: '#999',
    textAlign: 'center' as const,
    padding: '40px 20px',
    fontStyle: 'italic' as const,
  },
  pollContainer: {
    position: 'fixed' as const,
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    zIndex: 1000,
    width: '90%',
    maxWidth: '500px',
  },
  activityList: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '10px',
  },
  activityItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '15px',
    backgroundColor: '#f8f9fa',
    borderRadius: '8px',
    borderLeft: '3px solid #28a745',
  },
  activityTime: {
    color: '#666',
    fontSize: '12px',
  },
};

export default StudentDashboard;
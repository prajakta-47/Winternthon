import React, { useState } from 'react';

interface PollViewProps {
  poll: {
    id: string;
    question: string;
    options: string[];
    correctAnswer: number;
    active: boolean;
  };
  onSubmit: (answerIndex: number) => void;
  studentName: string;
}

const PollView: React.FC<PollViewProps> = ({ poll, onSubmit, studentName }) => {
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (selectedAnswer !== null) {
      onSubmit(selectedAnswer);
      setSubmitted(true);
    }
  };

  if (!poll.active) {
    return (
      <div style={styles.container}>
        <div style={styles.pollEnded}>
          <h3 style={styles.endedTitle}>📊 Poll Ended</h3>
          <p>This poll is no longer active. Wait for the next one!</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h3 style={styles.title}>🎯 Quick Check</h3>
        <p style={styles.subtitle}>Teacher wants to check your understanding!</p>
      </div>
      
      <div style={styles.questionCard}>
        <h4 style={styles.question}>{poll.question}</h4>
        
        <div style={styles.optionsContainer}>
          {poll.options.map((option, idx) => (
            <div
              key={idx}
              style={{
                ...styles.option,
                ...(selectedAnswer === idx ? styles.optionSelected : {}),
                ...(submitted && idx === poll.correctAnswer ? styles.optionCorrect : {}),
                ...(submitted && selectedAnswer === idx && idx !== poll.correctAnswer ? styles.optionWrong : {})
              }}
              onClick={() => !submitted && setSelectedAnswer(idx)}
            >
              <div style={styles.optionIndicator}>
                {!submitted ? (
                  <div style={{
                    ...styles.radio,
                    ...(selectedAnswer === idx ? styles.radioSelected : {})
                  }} />
                ) : (
                  <span style={styles.resultIcon}>
                    {idx === poll.correctAnswer ? '✓' : selectedAnswer === idx ? '✗' : ''}
                  </span>
                )}
              </div>
              <span style={styles.optionText}>{option}</span>
              {submitted && idx === poll.correctAnswer && (
                <span style={styles.correctBadge}>Correct Answer</span>
              )}
            </div>
          ))}
        </div>
        
        {!submitted ? (
          <button
            onClick={handleSubmit}
            disabled={selectedAnswer === null}
            style={{
              ...styles.submitButton,
              ...(selectedAnswer === null ? styles.submitButtonDisabled : {})
            }}
          >
            Submit Answer
          </button>
        ) : (
          <div style={styles.submittedMessage}>
            <p>✅ Answer submitted! Teacher will review it.</p>
            <p style={styles.encouragement}>Keep up the good work, {studentName}! 🎉</p>
          </div>
        )}
        
        <div style={styles.footer}>
          <p style={styles.footerText}>
            This helps your teacher understand what topics need more attention.
          </p>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    backgroundColor: 'white',
    borderRadius: '15px',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
    overflow: 'hidden',
  },
  header: {
    backgroundColor: '#ff6b6b',
    color: 'white',
    padding: '20px',
    textAlign: 'center' as const,
  },
  title: {
    margin: '0',
    fontSize: '24px',
  },
  subtitle: {
    margin: '5px 0 0',
    opacity: 0.9,
  },
  pollEnded: {
    padding: '40px 20px',
    textAlign: 'center' as const,
    color: '#666',
  },
  endedTitle: {
    color: '#333',
    marginBottom: '10px',
  },
  questionCard: {
    padding: '25px',
  },
  question: {
    color: '#333',
    marginBottom: '25px',
    fontSize: '18px',
    lineHeight: '1.5',
  },
  optionsContainer: {
    marginBottom: '25px',
  },
  option: {
    display: 'flex',
    alignItems: 'center',
    padding: '15px',
    marginBottom: '12px',
    backgroundColor: '#f8f9fa',
    borderRadius: '10px',
    border: '2px solid transparent',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  optionSelected: {
    borderColor: '#667eea',
    backgroundColor: '#eef2ff',
  },
  optionCorrect: {
    borderColor: '#28a745',
    backgroundColor: '#d4edda',
  },
  optionWrong: {
    borderColor: '#dc3545',
    backgroundColor: '#f8d7da',
  },
  optionIndicator: {
    marginRight: '15px',
  },
  radio: {
    width: '20px',
    height: '20px',
    borderRadius: '50%',
    border: '2px solid #adb5bd',
    transition: 'all 0.2s',
  },
  radioSelected: {
    borderColor: '#667eea',
    backgroundColor: '#667eea',
    boxShadow: 'inset 0 0 0 4px white',
  },
  resultIcon: {
    fontSize: '18px',
    fontWeight: 'bold' as const,
  },
  optionText: {
    flex: 1,
    fontSize: '16px',
  },
  correctBadge: {
    backgroundColor: '#28a745',
    color: 'white',
    padding: '5px 10px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '600' as const,
  },
  submitButton: {
    width: '100%',
    padding: '15px',
    backgroundColor: '#667eea',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    fontSize: '16px',
    fontWeight: '600' as const,
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  submitButtonDisabled: {
    backgroundColor: '#adb5bd',
    cursor: 'not-allowed',
  },
  submittedMessage: {
    textAlign: 'center' as const,
    padding: '20px',
    backgroundColor: '#d4edda',
    borderRadius: '10px',
    border: '1px solid #c3e6cb',
    color: '#155724',
  },
  encouragement: {
    margin: '10px 0 0',
    fontSize: '14px',
  },
  footer: {
    marginTop: '20px',
    paddingTop: '15px',
    borderTop: '1px solid #e1e8ed',
  },
  footerText: {
    color: '#666',
    fontSize: '12px',
    textAlign: 'center' as const,
    margin: '0',
  },
};

export default PollView;
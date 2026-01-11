import React, { useState, useEffect } from "react";

interface Message {
  id: string;
  text: string;
  sender: "bot" | "student";
  timestamp: Date;
}

interface HelpBotProps {
  studentName: string;
}

const HelpBot: React.FC<HelpBotProps> = ({ studentName }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: `Hello ${studentName}! I'm here to support your learning.`,
      sender: "bot",
      timestamp: new Date()
    },
    {
      id: "2",
      text: "How are you feeling about today's lesson?",
      sender: "bot",
      timestamp: new Date()
    },
    {
      id: "3",
      text: "Do you have any doubts or questions I can help with?",
      sender: "bot",
      timestamp: new Date()
    }
  ]);
  
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<"connected" | "disconnected">("connected");

  const addMessage = (text: string, sender: "bot" | "student") => {
    const newMessage: Message = {
      id: Date.now().toString(),
      text,
      sender,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const sendMessage = async (messageText: string) => {
    if (!messageText.trim() || loading) return;

    // Add student message immediately
    addMessage(messageText, "student");
    setInput("");
    setLoading(true);

    try {
      console.log("Sending to backend:", { message: messageText, studentName });
      
      const response = await fetch("http://localhost:5000/api/chat/help", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: messageText,
          studentName: studentName
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        addMessage(data.response, "bot");
        setConnectionStatus("connected");
      } else {
        addMessage("Sorry, I couldn't process your request.", "bot");
      }
    } catch (error) {
      console.error("Chat error:", error);
      setConnectionStatus("disconnected");
      
      // Simple fallback response
      addMessage(`I understand, ${studentName}. Thanks for sharing. How can I help you further?`, "bot");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  // Auto-scroll to bottom
  useEffect(() => {
    const messagesContainer = document.getElementById("messages-container");
    if (messagesContainer) {
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
  }, [messages]);

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>🤖 HelpBot</h2>
        <div style={styles.statusIndicator}>
          <span style={{
            ...styles.statusDot,
            backgroundColor: connectionStatus === "connected" ? "#4CAF50" : "#f44336"
          }} />
          <span style={styles.statusText}>
            {connectionStatus === "connected" ? "Online" : "Offline"}
          </span>
        </div>
      </div>

      {/* Chat Messages */}
      <div id="messages-container" style={styles.messagesContainer}>
        {messages.map((message) => (
          <div
            key={message.id}
            style={{
              ...styles.message,
              ...(message.sender === "student" ? styles.studentMessage : styles.botMessage)
            }}
          >
            <div style={styles.messageHeader}>
              <span style={styles.sender}>
                {message.sender === "student" ? "You" : "HelpBot"}
              </span>
              <span style={styles.time}>
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            <p style={styles.messageText}>{message.text}</p>
          </div>
        ))}
        {loading && (
          <div style={styles.botMessage}>
            <div style={styles.messageHeader}>
              <span style={styles.sender}>HelpBot</span>
            </div>
            <p style={styles.messageText}>
              <span style={styles.typingIndicator}>Thinking...</span>
            </p>
          </div>
        )}
      </div>

      {/* Message Input */}
      <form onSubmit={handleSubmit} style={styles.inputForm}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message here..."
          style={styles.input}
          disabled={loading}
        />
        <button 
          type="submit" 
          style={styles.sendButton} 
          disabled={loading || !input.trim()}
        >
          {loading ? "..." : "Send"}
        </button>
      </form>
    </div>
  );
};

const styles = {
  container: {
    backgroundColor: "white",
    borderRadius: "10px",
    overflow: "hidden" as const,
    border: "1px solid #e0e0e0",
  },
  header: {
    backgroundColor: "#4A6FA5",
    color: "white",
    padding: "15px 20px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    margin: "0",
    fontSize: "18px",
  },
  statusIndicator: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  statusDot: {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
  },
  statusText: {
    fontSize: "12px",
    opacity: 0.9,
  },
  messagesContainer: {
    height: "300px",
    overflowY: "auto" as const,
    padding: "15px",
    backgroundColor: "#f9f9f9",
  },
  message: {
    marginBottom: "12px",
    padding: "10px 12px",
    borderRadius: "12px",
    maxWidth: "85%",
  },
  studentMessage: {
    backgroundColor: "#4A6FA5",
    color: "white",
    marginLeft: "auto",
    borderBottomRightRadius: "3px",
  },
  botMessage: {
    backgroundColor: "white",
    color: "#333",
    border: "1px solid #e0e0e0",
    marginRight: "auto",
    borderBottomLeftRadius: "3px",
  },
  messageHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "5px",
  },
  sender: {
    fontWeight: "600" as const,
    fontSize: "12px",
  },
  time: {
    fontSize: "10px",
    opacity: 0.7,
  },
  messageText: {
    margin: "0",
    lineHeight: "1.4",
    fontSize: "14px",
  },
  typingIndicator: {
    color: "#666",
    fontStyle: "italic" as const,
  },
  inputForm: {
    display: "flex",
    padding: "15px",
    borderTop: "1px solid #e0e0e0",
    backgroundColor: "white",
  },
  input: {
    flex: 1,
    padding: "10px 15px",
    border: "1px solid #e0e0e0",
    borderRadius: "20px",
    fontSize: "14px",
    marginRight: "10px",
    outline: "none",
  },
  sendButton: {
    padding: "10px 20px",
    backgroundColor: "#4A6FA5",
    color: "white",
    border: "none",
    borderRadius: "20px",
    fontSize: "14px",
    cursor: "pointer",
    minWidth: "60px",
  },
};

export default HelpBot;
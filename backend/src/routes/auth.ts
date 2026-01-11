import express from "express";

const router = express.Router();

// Simple authentication (just store name and role for demo)
interface Session {
  id: string;
  name: string;
  role: 'student' | 'teacher';
}

const sessions: Map<string, Session> = new Map();

router.post("/login", (req, res) => {
  const { name, role } = req.body;
  
  if (!name || !role) {
    return res.status(400).json({ error: "Name and role are required" });
  }
  
  if (role !== 'student' && role !== 'teacher') {
    return res.status(400).json({ error: "Role must be 'student' or 'teacher'" });
  }
  
  const sessionId = Math.random().toString(36).substring(7);
  const session: Session = { id: sessionId, name, role };
  sessions.set(sessionId, session);
  
  res.json({
    sessionId,
    name,
    role,
    message: `Welcome ${name}! You are logged in as ${role}`
  });
});

router.get("/session/:id", (req, res) => {
  const session = sessions.get(req.params.id);
  if (!session) {
    return res.status(404).json({ error: "Session not found" });
  }
  res.json(session);
});

export default router;
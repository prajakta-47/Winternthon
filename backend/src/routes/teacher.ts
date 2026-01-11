import express from "express";

const router = express.Router();

// Store data in memory for demo
interface StudentAnswer {
  studentName: string;
  topic: string;
  correct: boolean;
  answer: string;
  timestamp: string;
}

interface DifficultyData {
  count: number;
  students: string[];
}

const studentAnswers: StudentAnswer[] = [];
const difficultyMap: Map<string, DifficultyData> = new Map();

// Add some demo data
difficultyMap.set("React Hooks", { count: 3, students: ["Alice", "Bob", "Charlie"] });
difficultyMap.set("State Management", { count: 2, students: ["David", "Eve"] });
difficultyMap.set("Async Programming", { count: 1, students: ["Frank"] });

studentAnswers.push(
  { studentName: "Alice", topic: "React Hooks", correct: true, answer: "useState", timestamp: new Date().toISOString() },
  { studentName: "Bob", topic: "State Management", correct: false, answer: "Redux only", timestamp: new Date().toISOString() },
  { studentName: "Charlie", topic: "Async Programming", correct: true, answer: "async/await", timestamp: new Date().toISOString() }
);

router.get("/dashboard", (req, res) => {
  // Convert Map to object for JSON response
  const strugglingStudents: Record<string, DifficultyData> = {};
  
  difficultyMap.forEach((data, topic) => {
    strugglingStudents[topic] = {
      count: data.count,
      students: data.students
    };
  });
  
  // Calculate statistics
  const totalAnswers = studentAnswers.length;
  const correctAnswers = studentAnswers.filter(a => a.correct).length;
  const accuracyRate = totalAnswers > 0 ? Math.round((correctAnswers / totalAnswers) * 100) : 0;
  
  res.json({
    success: true,
    data: {
      strugglingStudents,
      recentAnswers: studentAnswers.slice(-10).reverse(), // Show latest first
      statistics: {
        totalStudents: 5, // Demo count
        activeStudents: 3,
        totalAnswers,
        correctAnswers,
        accuracyRate: `${accuracyRate}%`,
        topicsWithDifficulty: difficultyMap.size
      },
      alerts: difficultyMap.size > 0 ? [
        {
          type: "warning",
          message: `${difficultyMap.get("React Hooks")?.count || 0} students struggling with React Hooks`,
          priority: "high"
        },
        {
          type: "info",
          message: "Consider reviewing State Management concepts",
          priority: "medium"
        }
      ] : []
    },
    timestamp: new Date().toISOString(),
    message: "Teacher dashboard data loaded successfully"
  });
});

router.post("/trigger-poll", (req, res) => {
  const { question, options, correctAnswer, teacherName } = req.body;
  
  console.log(`🎯 ${teacherName || "Teacher"} triggered poll: ${question}`);
  
  // Record this poll in student answers for demo
  if (question && options) {
    studentAnswers.push({
      studentName: "Demo Student",
      topic: question.substring(0, 30),
      correct: Math.random() > 0.5,
      answer: options[Math.floor(Math.random() * options.length)],
      timestamp: new Date().toISOString()
    });
  }
  
  res.json({
    success: true,
    poll: {
      question: question || "What does useState do in React?",
      options: options || ["Stores props", "Manages component state", "Handles API calls", "Styles components"],
      correctAnswer: correctAnswer || 1,
      timestamp: new Date().toISOString()
    },
    message: "Poll created and sent to students",
    studentsNotified: 5, // Demo count
    note: "In full implementation, this would trigger WebSocket broadcast"
  });
});

router.post("/record-answer", (req, res) => {
  const { studentName, topic, correct, answer } = req.body;
  
  if (!studentName || !topic) {
    return res.status(400).json({ error: "Student name and topic are required" });
  }
  
  const studentAnswer: StudentAnswer = {
    studentName,
    topic,
    correct: correct || false,
    answer: answer || "No answer provided",
    timestamp: new Date().toISOString()
  };
  
  studentAnswers.push(studentAnswer);
  
  // Update difficulty map for wrong answers
  if (!correct) {
    const current = difficultyMap.get(topic) || { count: 0, students: [] };
    current.count++;
    if (!current.students.includes(studentName)) {
      current.students.push(studentName);
    }
    difficultyMap.set(topic, current);
  }
  
  res.json({
    success: true,
    answerRecorded: studentAnswer,
    difficultyStats: difficultyMap.get(topic),
    totalAnswers: studentAnswers.length
  });
});

router.get("/analytics", (req, res) => {
  // Calculate topic-wise performance
  const topicPerformance: Record<string, { total: number, correct: number, accuracy: number }> = {};
  
  studentAnswers.forEach(answer => {
    if (!topicPerformance[answer.topic]) {
      topicPerformance[answer.topic] = { total: 0, correct: 0, accuracy: 0 };
    }
    topicPerformance[answer.topic].total++;
    if (answer.correct) {
      topicPerformance[answer.topic].correct++;
    }
  });
  
  // Calculate accuracy percentages
  Object.keys(topicPerformance).forEach(topic => {
    const data = topicPerformance[topic];
    data.accuracy = data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0;
  });
  
  res.json({
    success: true,
    analytics: {
      topicPerformance,
      difficultyMap: Object.fromEntries(difficultyMap.entries()),
      studentActivity: studentAnswers.length,
      averageAccuracy: studentAnswers.length > 0 
        ? Math.round((studentAnswers.filter(a => a.correct).length / studentAnswers.length) * 100)
        : 0
    }
  });
});

export default router;
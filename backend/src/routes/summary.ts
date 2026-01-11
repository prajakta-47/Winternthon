import express from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";

const router = express.Router();

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-pro" });

// Store summaries in memory (for demo)
let currentSummary = "";
let summaryHistory: Array<{summary: string, teacher: string, timestamp: string}> = [];

router.post("/generate", async (req, res) => {
  try {
    const { transcript, teacherName } = req.body;
    
    if (!transcript || transcript.trim() === "") {
      return res.status(400).json({ 
        error: "Transcript is required",
        hint: "Paste your lecture notes or transcript"
      });
    }
    
    console.log(`📝 Generating summary for ${teacherName || "Teacher"}...`);
    console.log(`Transcript length: ${transcript.length} characters`);
    
    // Create a prompt for summary generation
    const prompt = `You are an expert teacher's assistant. Create a clear, concise summary of the following lecture transcript for students.

    LECTURE TRANSCRIPT:
    ${transcript}
    
    Please provide:
    1. 5-7 key bullet points of main concepts
    2. Important terms and definitions
    3. Practical examples mentioned
    4. Key takeaways for students
    5. Any assignments or follow-up work
    
    Format the summary in a way that's easy for students to review:`;
    
    // Generate summary
    const result = await model.generateContent(prompt);
    const summary = result.response.text();
    
    // Store the summary
    currentSummary = summary;
    summaryHistory.push({
      summary,
      teacher: teacherName || "Teacher",
      timestamp: new Date().toISOString()
    });
    
    // Keep only last 10 summaries
    if (summaryHistory.length > 10) {
      summaryHistory = summaryHistory.slice(-10);
    }
    
    console.log(`✅ Summary generated successfully (${summary.length} chars)`);
    
    res.json({
      success: true,
      summary,
      teacher: teacherName || "Teacher",
      timestamp: new Date().toISOString(),
      length: summary.length,
      preview: summary.substring(0, 200) + "...",
      message: "Summary generated successfully. Ready to publish to students."
    });
    
  } catch (error: any) {
    console.error("❌ Summary generation error:", error.message);
    
    // Create a demo summary if API fails
    const demoSummary = `Lecture Summary (Demo - API Unavailable)

    Main Topics Covered:
    1. Introduction to React Components
    2. Understanding State and Props
    3. Hooks: useState and useEffect
    4. Component Lifecycle
    5. Best Practices in React Development
    
    Key Concepts:
    • Components are reusable UI pieces
    • State is internal data that can change
    • Props are data passed from parent to child
    • Hooks allow using state in functional components
    
    Important Terms:
    - JSX: JavaScript XML for UI
    - Virtual DOM: Efficient updating
    - Reconciliation: DOM update process
    - Re-rendering: When components update
    
    Practice Exercise: Create a counter component with useState`;
    
    res.json({
      success: true,
      summary: demoSummary,
      teacher: req.body.teacherName || "Teacher",
      demo: true,
      message: "Demo summary generated (API unavailable)",
      error: error.message
    });
  }
});

router.post("/publish", (req, res) => {
  const { teacherName } = req.body;
  
  if (!currentSummary) {
    return res.status(400).json({ 
      error: "No summary available to publish",
      hint: "Generate a summary first using /generate endpoint"
    });
  }
  
  console.log(`📢 ${teacherName || "Teacher"} published summary to students`);
  
  // In a real app, this would broadcast via WebSocket
  // For now, we'll just log and respond
  
  res.json({
    success: true,
    summary: currentSummary.substring(0, 300) + "...",
    teacher: teacherName || "Teacher",
    timestamp: new Date().toISOString(),
    message: "Summary published successfully! Students can now view it.",
    note: "In full implementation, this would trigger WebSocket broadcast to all students",
    studentCount: "All connected students"
  });
});

router.get("/current", (req, res) => {
  if (!currentSummary) {
    return res.json({
      success: false,
      message: "No summary available",
      hint: "Generate a summary first"
    });
  }
  
  res.json({
    success: true,
    summary: currentSummary,
    lastUpdated: summaryHistory[summaryHistory.length - 1]?.timestamp,
    historyCount: summaryHistory.length
  });
});

router.get("/history", (req, res) => {
  res.json({
    success: true,
    history: summaryHistory,
    count: summaryHistory.length
  });
});

export default router;
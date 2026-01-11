import express from "express";
const router = express.Router();

router.post("/", (req, res) => {
  const { correct } = req.body;
  
  // Log for teacher notification
  if (!correct) {
    console.log("📢 TEACHER ALERT: Student answered incorrectly");
  }
  
  return res.json({  // Added 'return'
    message: correct
      ? "✅ Correct! Well done!"
      : "❌ Incorrect. Teacher has been notified. Chatbot is opening to help you...",
    shouldOpenChatbot: !correct
  });
});

export default router;
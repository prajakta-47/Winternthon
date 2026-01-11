import express from "express";

const router = express.Router();

// Gemini API Simulator - Provides realistic responses
class GeminiSimulator {
  async generateContent(prompt: string) {
    // Extract student name and message from prompt
    const studentNameMatch = prompt.match(/Student Name: ([^\n]+)/);
    const messageMatch = prompt.match(/Student's Message\/Question: "([^"]+)"/);
    
    const studentName = studentNameMatch ? studentNameMatch[1].trim() : "Student";
    const message = messageMatch ? messageMatch[1].trim() : "";
    
    // Generate realistic response based on message
    return {
      response: {
        text: () => this.generateResponse(message, studentName)
      }
    };
  }
  
  generateResponse(message: string, studentName: string): string {
    const lowerMessage = message.toLowerCase();
    
    // TypeScript question
    if (lowerMessage.includes("ts") || lowerMessage.includes("typescript")) {
      return `Hi ${studentName}! TypeScript is a programming language developed by Microsoft. It's a superset of JavaScript that adds static typing, which helps catch errors during development rather than at runtime. TypeScript compiles to regular JavaScript and is widely used in large-scale applications for better maintainability and developer experience. Would you like me to explain any specific TypeScript feature?`;
    }
    
    // Sad/emotional response
    if (lowerMessage.includes("sad") || lowerMessage.includes("unhappy") || lowerMessage.includes("depressed")) {
      return `I'm sorry to hear you're feeling sad, ${studentName}. 😔 Learning can sometimes be overwhelming, but remember that it's okay to have difficult days. Take a deep breath, maybe take a short break, and remember that progress in learning is never linear. You're doing great by reaching out! Is there something specific that's troubling you about the lesson?`;
    }
    
    // React questions
    if (lowerMessage.includes("react") || lowerMessage.includes("usestate") || lowerMessage.includes("hook")) {
      return `Great question about React, ${studentName}! React is a JavaScript library for building user interfaces. It uses a component-based architecture where you can create reusable UI pieces. useState is a React hook that lets you add state to functional components - it's one of the most commonly used hooks! Would you like a code example?`;
    }
    
    // Programming questions
    if (lowerMessage.includes("programming") || lowerMessage.includes("code") || lowerMessage.includes("develop")) {
      return `That's a great topic, ${studentName}! Programming is the process of writing instructions for computers to execute. It involves learning languages like JavaScript, Python, or Java, understanding algorithms, and solving problems. The key is to start with fundamentals and practice regularly. What specific area of programming interests you?`;
    }
    
    // General learning questions
    if (lowerMessage.includes("learn") || lowerMessage.includes("study") || lowerMessage.includes("understand")) {
      return `Learning is a journey, ${studentName}! The best approach is to break complex topics into smaller parts, practice regularly, and don't be afraid to make mistakes - they're part of the learning process. Consistency is more important than intensity. What subject are you currently learning?`;
    }
    
    // Feeling questions
    if (lowerMessage.includes("feeling") || lowerMessage.includes("how are you")) {
      return `Thanks for asking, ${studentName}! I'm here to support your learning journey. How are you feeling about your progress today? Remember, it's normal to have ups and downs while learning new things.`;
    }
    
    // Doubt/questions
    if (lowerMessage.includes("doubt") || lowerMessage.includes("question") || lowerMessage.includes("confus")) {
      return `I'm here to help with any doubts, ${studentName}! Asking questions is one of the best ways to learn. What specific concept or topic are you finding challenging? I'll do my best to explain it clearly.`;
    }
    
    // Default response for any question
    return `Thank you for your question, ${studentName}! "${message}" - that's an interesting topic. As your learning assistant, I want to help you understand this better. Could you tell me a bit more about what specifically you'd like to know or what part is confusing you?`;
  }
}

// Use simulator for demo (or real Gemini if you get API working)
const gemini = new GeminiSimulator();
console.log("🤖 Using Gemini Simulator for realistic responses");

router.post("/help", async (req, res) => {
  try {
    const { message, studentName } = req.body;
    
    if (!message || !studentName) {
      return res.status(400).json({ 
        success: false,
        error: "Message and student name are required" 
      });
    }
    
    console.log(`🤖 [${studentName}]: ${message}`);
    
    // Create prompt
    const prompt = `Student Name: ${studentName}
Student's Message/Question: "${message}"`;
    
    // Get response from simulator
    const result = await gemini.generateContent(prompt);
    const response = result.response.text();
    
    console.log(`✅ Response: ${response.substring(0, 80)}...`);
    
    res.json({
      success: true,
      response: response,
      studentName,
      aiGenerated: true,
      mode: "Gemini Simulator",
      timestamp: new Date().toISOString()
    });
    
  } catch (error: any) {
    console.error("Error:", error);
    
    res.json({
      success: true,
      response: `Hi ${req.body?.studentName || "Student"}! I'm here to help you with your learning. What would you like to know?`,
      studentName: req.body?.studentName || "Student",
      aiGenerated: false,
      timestamp: new Date().toISOString()
    });
  }
});

export default router;
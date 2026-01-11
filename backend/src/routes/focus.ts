import express from "express";
const router = express.Router();

let focusScore = 100;
let lastInteraction = Date.now();

export function updateInteraction() {
  lastInteraction = Date.now();
  focusScore = Math.min(100, focusScore + 10); // Increase focus on interaction
}

function checkFocus() {
  const idleTime = Date.now() - lastInteraction;
  
  // If idle for more than 2 minutes, reduce focus
  if (idleTime > 120000) { // 2 minutes = 120,000ms
    focusScore -= 30;
  }
  
  // If idle for more than 30 seconds, reduce slightly
  else if (idleTime > 30000) { // 30 seconds
    focusScore -= 10;
  }
  
  console.log(`Focus Score: ${focusScore}, Idle Time: ${Math.floor(idleTime/1000)}s`);
  
  return focusScore < 60; // Trigger poll if focus < 60%
}

router.get("/check", (req, res) => {
  const triggerPoll = checkFocus();
  res.json({ 
    triggerPoll,
    focusScore,
    lastInteraction: new Date(lastInteraction).toLocaleTimeString()
  });
});

export default router;
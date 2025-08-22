const express = require("express");
const router = express.Router();
const {
  generateQuiz,
  checkUsage,
  chatWithAssistant,
} = require("../controllers/aiController");

router.post("/generate-quiz", generateQuiz);
router.post("/chat", chatWithAssistant);
router.get("/check-usage", checkUsage);

module.exports = router;

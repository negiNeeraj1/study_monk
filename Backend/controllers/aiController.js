const { GoogleGenerativeAI } = require("@google/generative-ai");

const getGenAI = () => {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY;
  if (!apiKey) {
    throw new Error(
      "No API key found. Please set GEMINI_API_KEY or GOOGLE_AI_API_KEY in your environment variables."
    );
  }
  return new GoogleGenerativeAI(apiKey);
};

// Function to get available models
const getAvailableModel = async () => {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY;

  if (!apiKey) {
    throw new Error(
      "No API key found. Please set GEMINI_API_KEY or GOOGLE_AI_API_KEY in your environment variables."
    );
  }
  const models = [
    "gemini-2.0-flash",
    "gemini-1.5-pro",
    "gemini-pro",
    "gemini-1.0-pro",
  ];

  for (const modelName of models) {
    try {
      const genAI = getGenAI();
      const model = genAI.getGenerativeModel({ model: modelName });
      // Test the model with a simple prompt
      const result = await model.generateContent("Hello");
      await result.response;
      console.log(`Using model: ${modelName}`);
      return model;
    } catch (error) {
      console.log(`Model ${modelName} not available:`, error.message);
      continue;
    }
  }
  throw new Error("No available models found");
};

// Function to check API usage
const checkAPIUsage = async () => {
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${
        process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY
      }`
    );
    const data = await response.json();
    return {
      success: true,
      models: data.models || [],
      quotaInfo: "Check Google AI Studio for detailed quota information",
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
};

// AI Assistant chat function
const generateAssistantResponse = async (userMessage) => {
  try {
    const model = await getAvailableModel();

    const systemPrompt = `You are a helpful AI study assistant. You help students with:
    - Explaining difficult concepts in simple terms
    - Providing study tips and techniques
    - Answering academic questions
    - Giving advice on exam preparation
    - Explaining topics from various subjects
    
    IMPORTANT FORMATTING INSTRUCTIONS:
    - Always structure your responses in clear, well-spaced paragraphs
    - Use double line breaks (\\n\\n) to separate paragraphs
    - Use **BOLD TEXT** for headings and important points
    - Use bullet points (- or *) for lists when appropriate
    - Use numbered lists (1., 2., 3.) for step-by-step instructions
    - Add relevant emojis to make responses engaging and relatable
    - Make your responses educational and encouraging
    - Keep responses conversational but informative
    - Break down complex topics into digestible sections
    - Provide practical examples when helpful
    
    RESPONSE LENGTH GUIDELINES:
    - For simple questions: Provide concise, direct answers (2-3 paragraphs)
    - For complex topics: Provide detailed explanations (4-6 paragraphs)
    - For "explain" or "how to" questions: Give comprehensive step-by-step guidance
    - For "what is" questions: Give clear definitions with examples
    - For study tips: Provide actionable advice with examples
    
    EMOJI USAGE:
    - 📚 for study-related topics
    - 🎯 for goals and objectives
    - 💡 for tips and insights
    - ⏰ for time management
    - 🧠 for learning and memory
    - 📝 for note-taking and writing
    - 🎓 for academic topics
    - 🚀 for motivation and success
    - ❓ for questions and clarifications
    - ✅ for completed tasks or achievements
    
    Example format:
    **📚 Study Strategy Guide**
    
    Here's how to approach your studies effectively:
    
    **🎯 Set Clear Goals**
    - Define what you want to achieve
    - Break down large goals into smaller tasks
    - Track your progress regularly
    
    **💡 Active Learning Techniques**
    1. Take detailed notes while studying
    2. Create flashcards for key concepts
    3. Practice with past exam questions
    4. Form study groups with classmates
    
    Always format your response with proper paragraphs, bold headings, and relevant emojis.`;

    const prompt = `${systemPrompt}\n\nStudent: ${userMessage}\n\nAssistant:`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return text;
  } catch (error) {
    console.error("Assistant response generation error:", error);
    throw new Error("Failed to generate assistant response");
  }
};

exports.generateQuiz = async (req, res) => {
  console.log("Request body:", req.body);
  const { topic, level, count = 5 } = req.body;
  if (!topic || !level) {
    return res.status(400).json({ error: "Topic and level are required." });
  }

  try {
    const model = await getAvailableModel();

    const prompt = `Generate ${count} multiple-choice quiz questions on the topic of '${topic}' for a ${level} level student. Each question must have EXACTLY 4 options (A, B, C, D) and indicate the correct answer. 

CRITICAL REQUIREMENTS:
- Each question must have EXACTLY 4 options, no more, no less
- All options must be unique and different from each other
- The answer should be the exact text of the correct option, not just A, B, C, or D
- Return ONLY the JSON array, no additional text or explanations
- Ensure the response is valid JSON format
- Make sure no option text is repeated

Format as JSON: [{"question": "question text", "options": ["option A text", "option B text", "option C text", "option D text"], "answer": "exact text of correct option"}]`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    console.log("Gemini response:", text);

    // Try to parse the JSON from the response
    let quiz;
    try {
      quiz = JSON.parse(text);
    } catch (e) {
      console.log(
        "Failed to parse JSON directly, trying to extract JSON from response"
      );
      // fallback: try to extract JSON from the response
      const match = text.match(/\[.*\]/s);
      quiz = match ? JSON.parse(match[0]) : null;
    }

    if (!quiz) {
      return res
        .status(500)
        .json({ error: "Failed to parse quiz from AI response." });
    }

    // Validate and fix quiz data
    const validatedQuiz = quiz.map((question, index) => {
      // Ensure we have exactly 4 options
      if (!question.options || question.options.length !== 4) {
        console.warn(
          `Question ${index + 1} has ${question.options?.length || 0} options, expected 4`
        );
        // If we have more than 4 options, take only the first 4
        if (question.options && question.options.length > 4) {
          question.options = question.options.slice(0, 4);
        }
      }

      // Remove duplicate options
      const uniqueOptions = [...new Set(question.options)];
      if (uniqueOptions.length !== question.options.length) {
        console.warn(
          `Question ${index + 1} had duplicate options, removed duplicates`
        );
        question.options = uniqueOptions;
      }

      // Ensure we still have 4 options after deduplication
      if (question.options.length < 4) {
        console.warn(
          `Question ${index + 1} has only ${question.options.length} options after deduplication`
        );
        // Add placeholder options if needed
        while (question.options.length < 4) {
          question.options.push(
            `Option ${String.fromCharCode(65 + question.options.length)}`
          );
        }
      }

      return question;
    });

    res.json({ quiz: validatedQuiz });
  } catch (error) {
    console.error("Gemini quiz generation error:", error);

    // Provide more specific error messages
    if (error.status === 404) {
      return res.status(500).json({
        error:
          "AI model not available. Please check your API key and model configuration.",
      });
    }

    if (error.message.includes("No available models found")) {
      return res.status(500).json({
        error: "No compatible AI models available. Please check your API key.",
      });
    }

    res
      .status(500)
      .json({ error: "Failed to generate quiz. Please try again." });
  }
};

// New endpoint for AI Assistant chat
exports.chatWithAssistant = async (req, res) => {
  console.log("Assistant chat request:", req.body);
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: "Message is required." });
  }

  try {
    const response = await generateAssistantResponse(message);
    res.json({ response });
  } catch (error) {
    console.error("Assistant chat error:", error);
    res.status(500).json({ error: "Failed to get assistant response." });
  }
};

// New endpoint to check API usage
exports.checkUsage = async (req, res) => {
  try {
    const usageInfo = await checkAPIUsage();
    res.json(usageInfo);
  } catch (error) {
    res.status(500).json({ error: "Failed to check API usage" });
  }
};

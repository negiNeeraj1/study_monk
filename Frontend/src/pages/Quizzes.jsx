import React, { useState, useEffect } from "react";
import QuizLevelCard from "../Components/quiz/QuizLevelCard";
import QuizQuestion from "../Components/quiz/QuizQuestion";
import QuizList from "../Components/quiz/QuizList";
import quizAttemptService from "../services/quizAttemptService";
import { motion } from "framer-motion";
import QuizBanner from "../images/QuizBanner.jpg";
import { Clock, CheckCircle, XCircle, Award, RotateCcw } from "lucide-react";

const SUBJECTS = [
  "Data Structures & Algorithms",
  "Operating Systems",
  "Computer Networks",
  "Database Management Systems",
  "Object-Oriented Programming",
  "Web Development",
  "Software Engineering",
  "Aptitude & Reasoning",
  "System Design",
  "Cybersecurity",
  "Machine Learning",
  "Cloud Computing",
  "Career Skills",
  "Artificial Intelligence",
  "Mobile App Development",
  "DevOps",
  "Discrete Mathematics",
  "Compiler Design",
  "Digital Logic",
  "Computer Architecture",
  "Unix/Linux",
  "Project Management",
  "Communication Skills",
  "Resume & Interview",
];

const LEVELS = [
  {
    level: "Beginner",
    color: "bg-green-500",
    description: "Easy questions to build confidence",
    icon: (
      <span role="img" aria-label="star">
        ⭐
      </span>
    ),
  },
  {
    level: "Intermediate",
    color: "bg-orange-500",
    description: "Challenging questions to test skills",
    icon: (
      <span role="img" aria-label="award">
        🏅
      </span>
    ),
  },
  {
    level: "Advanced",
    color: "bg-purple-500",
    description: "Complex questions for experts",
    icon: (
      <span role="img" aria-label="rocket">
        🚀
      </span>
    ),
  },
];

const Quizzes = () => {
  const [step, setStep] = useState(1); // 1: selection, 2: quiz, 3: score, 4: review
  const [quizConfig, setQuizConfig] = useState(null); // {subject, difficulty, questionCount}
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [timeLeft, setTimeLeft] = useState(0);
  const [userAnswers, setUserAnswers] = useState([]); // Track user's answers
  const [quizStartTime, setQuizStartTime] = useState(null);

  // Timer effect
  useEffect(() => {
    if (step === 2 && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (step === 2 && timeLeft === 0) {
      handleQuizComplete();
    }
  }, [timeLeft, step]);

  // Handle quiz start from QuizList component
  const handleQuizStart = async (config) => {
    setQuizConfig(config);
    setLoading(true);
    setError("");

    try {
      // Calculate time limit based on difficulty and question count
      const timePerQuestion =
        config.difficulty.id === "beginner"
          ? 2
          : config.difficulty.id === "intermediate"
          ? 3
          : 4;
      const totalTime = config.questionCount.value * timePerQuestion * 60; // in seconds

      const res = await fetch("/api/ai/generate-quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: config.subject.name,
          level: config.difficulty.name,
          count: config.questionCount.value,
        }),
      });

      const data = await res.json();
      if (data.quiz && Array.isArray(data.quiz)) {
        console.log("Quiz data received:", data.quiz);

        // Process only the requested number of questions
        const limitedQuestions = data.quiz.slice(0, config.questionCount.value);

        const processedQuestions = limitedQuestions.map((q, qIndex) => {
          return {
            text: q.question,
            options: q.options.map((opt, index) => {
              const isCorrect = opt === q.answer;
              return {
                text: opt,
                correct: isCorrect,
              };
            }),
          };
        });

        setQuestions(processedQuestions);
        setStep(2);
        setCurrentQuestionIndex(0);
        setScore(0);
        setTimeLeft(totalTime);
        setUserAnswers([]);
        setQuizStartTime(new Date());
      } else {
        setError("Failed to load quiz questions.");
      }
    } catch (err) {
      console.error("Quiz generation error:", err);
      setError("Failed to contact quiz service.");
    }
    setLoading(false);
  };

  // Handle answer selection during quiz
  const handleAnswer = (selectedOption) => {
    // Track user's answer
    const userAnswer = {
      questionIndex: currentQuestionIndex,
      selectedOption: selectedOption,
      isCorrect: selectedOption.correct,
      question: questions[currentQuestionIndex],
    };
    setUserAnswers((prev) => [...prev, userAnswer]);

    if (selectedOption.correct) {
      setScore((prev) => prev + 1);
    }

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      handleQuizComplete();
    }
  };

  // Handle quiz completion
  const handleQuizComplete = async () => {
    try {
      // Save quiz attempt to database
      const quizAttemptData = {
        subject: quizConfig.subject,
        difficulty: quizConfig.difficulty,
        questionCount: quizConfig.questionCount,
        questions: questions,
        score: {
          correct: score,
          total: questions.length,
          percentage: Math.round((score / questions.length) * 100),
        },
        timeTaken: quizStartTime
          ? Math.round((new Date() - quizStartTime) / 1000 / 60)
          : 0,
        userAnswers: userAnswers,
      };

      const result = await quizAttemptService.createQuizAttempt(
        quizAttemptData
      );
      console.log("Quiz attempt saved successfully:", result);

      // Show any insights from the backend
      if (result.data && result.data.insights) {
        console.log("Performance insights:", result.data.insights);
      }
    } catch (error) {
      console.error("Error saving quiz attempt:", error);
      // Don't block the UI flow if saving fails
    }

    setStep(3); // Show score regardless of save success
  };

  // Calculate quiz performance stats
  const getQuizStats = () => {
    const totalQuestions = questions.length;
    const correctAnswers = score;
    const wrongAnswers = totalQuestions - correctAnswers;
    const percentage =
      totalQuestions > 0
        ? Math.round((correctAnswers / totalQuestions) * 100)
        : 0;
    const timeTaken = quizStartTime
      ? Math.round((new Date() - quizStartTime) / 1000 / 60)
      : 0;
    const passed = percentage >= (quizConfig?.difficulty?.passingScore || 60);

    return {
      totalQuestions,
      correctAnswers,
      wrongAnswers,
      percentage,
      timeTaken,
      passed,
      passingScore: quizConfig?.difficulty?.passingScore || 60,
    };
  };

  // Timer display
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? "0" : ""}${remainingSeconds}`;
  };

  // Enhanced Score Display Component
  const ScoreDisplay = () => {
    const stats = getQuizStats();

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
        className="min-h-screen bg-gray-50 py-8"
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-center mb-8"
          >
            <div className="mb-6">
              {stats.passed ? (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2 }}
                  className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4"
                >
                  <CheckCircle className="w-12 h-12 text-green-600" />
                </motion.div>
              ) : (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2 }}
                  className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mb-4"
                >
                  <XCircle className="w-12 h-12 text-red-600" />
                </motion.div>
              )}
            </div>

            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              {stats.passed ? "🎉 Congratulations!" : "📚 Keep Learning!"}
            </h1>
            <p className="text-xl text-gray-600 mb-4">
              {stats.passed
                ? "You passed the quiz! Great work!"
                : `You need ${stats.passingScore}% to pass. You're getting there!`}
            </p>
            <div className="text-lg text-gray-600">
              <span className="font-semibold">{quizConfig?.subject?.name}</span>{" "}
              •{" "}
              <span className="font-semibold">
                {quizConfig?.difficulty?.name} Level
              </span>
            </div>
          </motion.div>

          {/* Score Stats */}
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
          >
            <div className="bg-white rounded-xl p-6 shadow-lg text-center">
              <div
                className={`text-4xl font-bold mb-2 ${
                  stats.passed ? "text-green-600" : "text-red-600"
                }`}
              >
                {stats.percentage}%
              </div>
              <div className="text-gray-600 font-medium">Your Score</div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">
                {stats.correctAnswers}
              </div>
              <div className="text-gray-600 font-medium">Correct Answers</div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg text-center">
              <div className="text-4xl font-bold text-orange-600 mb-2">
                {stats.wrongAnswers}
              </div>
              <div className="text-gray-600 font-medium">Wrong Answers</div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg text-center">
              <div className="text-4xl font-bold text-purple-600 mb-2">
                {stats.timeTaken}m
              </div>
              <div className="text-gray-600 font-medium">Time Taken</div>
            </div>
          </motion.div>

          {/* Progress Bar */}
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: "100%" }}
            transition={{ delay: 0.5, duration: 1 }}
            className="mb-8"
          >
            <div className="bg-gray-200 rounded-full h-4 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${stats.percentage}%` }}
                transition={{ delay: 0.8, duration: 1.5, ease: "easeOut" }}
                className={`h-full rounded-full ${
                  stats.percentage >= 80
                    ? "bg-green-500"
                    : stats.percentage >= 60
                    ? "bg-yellow-500"
                    : "bg-red-500"
                }`}
              />
            </div>
            <div className="flex justify-between text-sm text-gray-600 mt-2">
              <span>0%</span>
              <span className="font-medium">
                Passing: {stats.passingScore}%
              </span>
              <span>100%</span>
            </div>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <button
              onClick={() => setStep(4)} // Go to review
              className="px-8 py-3 bg-blue-600 text-white rounded-lg shadow-lg hover:bg-blue-700 transition-colors duration-200 font-semibold"
            >
              📖 Review Answers
            </button>

            <button
              onClick={handleRestartQuiz}
              className="px-8 py-3 bg-gray-600 text-white rounded-lg shadow-lg hover:bg-gray-700 transition-colors duration-200 font-semibold"
            >
              🔄 Try Again
            </button>

            <button
              onClick={() => {
                setStep(1);
                setQuizConfig(null);
                setQuestions([]);
                setScore(0);
                setUserAnswers([]);
              }}
              className="px-8 py-3 bg-green-600 text-white rounded-lg shadow-lg hover:bg-green-700 transition-colors duration-200 font-semibold"
            >
              📝 New Quiz
            </button>
          </motion.div>
        </div>
      </motion.div>
    );
  };

  // Restart the same quiz with same settings
  const handleRestartQuiz = () => {
    if (quizConfig) {
      setStep(1); // Go back to loading
      handleQuizStart(quizConfig); // Restart with same config
    }
  };

  // Enhanced Review Answers Component
  const ReviewAnswers = () => {
    const stats = getQuizStats();

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen bg-gray-50 py-8"
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-center mb-8"
          >
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              📖 Detailed Review
            </h1>
            <p className="text-xl text-gray-600 mb-4">
              <span className="font-semibold">{quizConfig?.subject?.name}</span>{" "}
              •{" "}
              <span className="font-semibold">
                {quizConfig?.difficulty?.name} Level
              </span>
            </p>
            <div className="bg-white rounded-xl p-6 shadow-lg inline-block">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {stats.correctAnswers} / {stats.totalQuestions}
              </div>
              <div className="text-gray-600">Questions Answered Correctly</div>
            </div>
          </motion.div>

          {/* Quick Stats */}
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-3 gap-4 mb-8"
          >
            <div className="bg-green-50 p-4 rounded-lg border border-green-200 text-center">
              <div className="text-2xl font-bold text-green-600">
                {stats.correctAnswers}
              </div>
              <div className="text-green-700 text-sm">Correct</div>
            </div>
            <div className="bg-red-50 p-4 rounded-lg border border-red-200 text-center">
              <div className="text-2xl font-bold text-red-600">
                {stats.wrongAnswers}
              </div>
              <div className="text-red-700 text-sm">Wrong</div>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 text-center">
              <div className="text-2xl font-bold text-blue-600">
                {stats.percentage}%
              </div>
              <div className="text-blue-700 text-sm">Score</div>
            </div>
          </motion.div>

          {/* Questions Review */}
          <div className="space-y-6">
            {questions.map((question, index) => {
              const userAnswer = userAnswers[index];
              const correctOption = question.options.find((opt) => opt.correct);

              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`bg-white rounded-xl shadow-lg p-6 border-l-4 ${
                    userAnswer?.isCorrect
                      ? "border-green-500"
                      : "border-red-500"
                  }`}
                >
                  {/* Question Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <span className="bg-gray-100 rounded-full w-8 h-8 flex items-center justify-center text-sm font-semibold">
                        {index + 1}
                      </span>
                      <span className="text-lg font-semibold text-gray-800">
                        Question {index + 1}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {userAnswer?.isCorrect ? (
                        <div className="flex items-center gap-1 text-green-600">
                          <CheckCircle className="w-5 h-5" />
                          <span className="font-medium">Correct</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-red-600">
                          <XCircle className="w-5 h-5" />
                          <span className="font-medium">Incorrect</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Question Text */}
                  <h3 className="text-lg font-medium text-gray-900 mb-6">
                    {question.text}
                  </h3>

                  {/* Options */}
                  <div className="space-y-3">
                    {question.options.map((option, optIndex) => {
                      const isUserAnswer =
                        userAnswer?.selectedOption === option;
                      const isCorrectAnswer = option.correct;

                      let optionClass =
                        "p-4 rounded-lg border-2 transition-colors ";
                      let iconElement = null;

                      if (isCorrectAnswer) {
                        optionClass += "bg-green-50 border-green-300";
                        iconElement = (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        );
                      } else if (isUserAnswer && !isCorrectAnswer) {
                        optionClass += "bg-red-50 border-red-300";
                        iconElement = (
                          <XCircle className="w-5 h-5 text-red-600" />
                        );
                      } else {
                        optionClass += "bg-gray-50 border-gray-200";
                      }

                      return (
                        <div key={optIndex} className={optionClass}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <span className="font-semibold text-gray-600">
                                {String.fromCharCode(65 + optIndex)}.
                              </span>
                              <span className="text-gray-800">
                                {option.text}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              {iconElement}
                              {isCorrectAnswer && (
                                <span className="text-green-600 font-medium text-sm">
                                  Correct Answer
                                </span>
                              )}
                              {isUserAnswer && !isCorrectAnswer && (
                                <span className="text-red-600 font-medium text-sm">
                                  Your Answer
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Explanation for wrong answers */}
                  {!userAnswer?.isCorrect && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      transition={{ delay: 0.3 }}
                      className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg"
                    >
                      <div className="flex items-start gap-2">
                        <span className="text-yellow-600 text-lg">💡</span>
                        <div>
                          <p className="text-yellow-800 font-medium mb-1">
                            <span className="font-semibold">Analysis:</span>
                          </p>
                          <p className="text-yellow-700 text-sm">
                            You selected: "{userAnswer?.selectedOption?.text}"
                          </p>
                          <p className="text-yellow-700 text-sm">
                            Correct answer: "{correctOption?.text}"
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
          </div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center mt-12 space-y-4"
          >
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => setStep(3)} // Back to score
                className="px-6 py-3 bg-gray-600 text-white rounded-lg shadow-lg hover:bg-gray-700 transition-colors duration-200 font-medium"
              >
                ← Back to Results
              </button>

              <button
                onClick={handleRestartQuiz}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg shadow-lg hover:bg-blue-700 transition-colors duration-200 font-medium"
              >
                <RotateCcw className="w-4 h-4 inline mr-2" />
                Retake Quiz
              </button>

              <button
                onClick={() => {
                  setStep(1);
                  setQuizConfig(null);
                  setQuestions([]);
                  setScore(0);
                  setUserAnswers([]);
                }}
                className="px-6 py-3 bg-green-600 text-white rounded-lg shadow-lg hover:bg-green-700 transition-colors duration-200 font-medium"
              >
                🎯 New Quiz
              </button>
            </div>
          </motion.div>
        </div>
      </motion.div>
    );
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full mx-auto mb-4"
          />
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">
            🧠 Generating Your Quiz...
          </h2>
          <p className="text-gray-600">
            Creating{" "}
            <span className="font-semibold">
              {quizConfig?.questionCount?.value} {quizConfig?.difficulty?.name}
            </span>{" "}
            questions on{" "}
            <span className="font-semibold">{quizConfig?.subject?.name}</span>
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Header */}
      {step === 1 && (
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-white shadow-sm border-b"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                🎓 Interactive Quiz Platform
              </h1>
            </div>
          </div>
        </motion.div>
      )}

      {/* Error Display */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 border border-red-200 rounded-lg p-4 m-4 text-center"
        >
          <div className="text-red-600 font-semibold text-lg mb-2">
            ⚠️ Oops! Something went wrong
          </div>
          <div className="text-red-700">{error}</div>
          <button
            onClick={() => {
              setError("");
              setStep(1);
            }}
            className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </motion.div>
      )}

      {/* Step Content */}
      {step === 1 && <QuizList onQuizStart={handleQuizStart} />}

      {step === 2 && questions.length > 0 && (
        <div className="py-8">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Quiz Header */}
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="bg-white rounded-xl shadow-lg p-6 mb-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    <span className="font-semibold">
                      {quizConfig?.subject?.name}
                    </span>
                  </h2>
                  <p className="text-gray-600">
                    {quizConfig?.difficulty?.name} Level • Question{" "}
                    {currentQuestionIndex + 1} of {questions.length}
                  </p>
                </div>
                <div className="text-right">
                  <div className="flex items-center text-lg font-semibold text-gray-900 mb-1">
                    <Clock className="w-5 h-5 mr-2 text-red-500" />
                    {formatTime(timeLeft)}
                  </div>
                  <div className="text-sm text-gray-600">Time Remaining</div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${
                      ((currentQuestionIndex + 1) / questions.length) * 100
                    }%`,
                  }}
                />
              </div>
            </motion.div>

            {/* Question Component */}
            <QuizQuestion
              question={questions[currentQuestionIndex]}
              options={questions[currentQuestionIndex].options}
              onAnswer={handleAnswer}
            />
          </div>
        </div>
      )}

      {step === 3 && <ScoreDisplay />}
      {step === 4 && <ReviewAnswers />}
    </div>
  );
};

export default Quizzes;

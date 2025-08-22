import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Clock,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  XCircle,
} from "lucide-react";
import quizService from "../../services/quizService";

const QuizTaking = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [results, setResults] = useState(null);
  const [startTime, setStartTime] = useState(null);

  useEffect(() => {
    loadQuiz();
  }, [quizId]);

  useEffect(() => {
    if (quizStarted && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (quizStarted && timeLeft === 0) {
      handleSubmitQuiz();
    }
  }, [timeLeft, quizStarted]);

  const loadQuiz = async () => {
    try {
      setLoading(true);
      const response = await quizService.getQuizById(quizId);

      if (response.success) {
        setQuiz(response.data);
        setTimeLeft(response.data.timeLimit * 60); // Convert minutes to seconds
      }
    } catch (error) {
      console.error("Failed to load quiz:", error);
      navigate("/quizzes");
    } finally {
      setLoading(false);
    }
  };

  const startQuiz = () => {
    setQuizStarted(true);
    setStartTime(new Date());
  };

  const handleAnswerSelect = (questionIndex, optionIndex) => {
    setAnswers((prev) => ({
      ...prev,
      [questionIndex]: optionIndex,
    }));
  };

  const handleSubmitQuiz = async () => {
    try {
      const timeTaken = Math.round((new Date() - startTime) / 1000 / 60); // in minutes

      // Format answers for backend
      const formattedAnswers = quiz.questions.map((question, index) => ({
        questionId: question._id || index,
        selectedOption: answers[index] ?? -1,
        isCorrect:
          (answers[index] !== undefined &&
            question.options[answers[index]]?.isCorrect) ||
          false,
        points:
          answers[index] !== undefined &&
          question.options[answers[index]]?.isCorrect
            ? question.points || 10
            : 0,
        timeTaken: 0, // Could track per question if needed
      }));

      const response = await quizService.submitQuizAttempt(
        quizId,
        formattedAnswers,
        timeTaken
      );

      if (response.success) {
        setResults(response.data);
        setQuizCompleted(true);
      }
    } catch (error) {
      console.error("Failed to submit quiz:", error);
      alert("Failed to submit quiz. Please try again.");
    }
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const getProgressPercentage = () => {
    const answeredQuestions = Object.keys(answers).length;
    return (answeredQuestions / quiz.questions.length) * 100;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading quiz...</p>
        </div>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Quiz not found
          </h1>
          <button
            onClick={() => navigate("/quizzes")}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Back to Quizzes
          </button>
        </div>
      </div>
    );
  }

  if (quizCompleted && results) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow-lg p-8 text-center"
          >
            <div className="mb-6">
              {results.passed ? (
                <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              ) : (
                <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
              )}
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Quiz {results.passed ? "Completed!" : "Incomplete"}
              </h1>
              <p className="text-gray-600">
                {results.passed
                  ? "Congratulations! You passed the quiz."
                  : "Keep studying and try again!"}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {Math.round(results.score)}%
                </div>
                <div className="text-gray-600">Your Score</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600 mb-2">
                  {results.totalPoints}/{results.maxPoints}
                </div>
                <div className="text-gray-600">Points Earned</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">
                  {results.timeTaken}m
                </div>
                <div className="text-gray-600">Time Taken</div>
              </div>
            </div>

            {/* Detailed Results */}
            {results.answers && results.answers.length > 0 && (
              <div className="mt-8 text-left">
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  📊 Detailed Analysis
                </h3>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {results.answers.map((answer, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`p-4 rounded-lg border-l-4 ${
                        answer.isCorrect
                          ? "border-green-500 bg-green-50"
                          : "border-red-500 bg-red-50"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        {answer.isCorrect ? (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-600" />
                        )}
                        <span className="font-semibold text-gray-800">
                          Question {index + 1}
                        </span>
                        <span
                          className={`text-sm font-medium ${
                            answer.isCorrect ? "text-green-600" : "text-red-600"
                          }`}
                        >
                          {answer.isCorrect ? "Correct" : "Incorrect"}
                        </span>
                      </div>

                      {!answer.isCorrect && (
                        <div className="text-sm space-y-1">
                          <p className="text-gray-700">
                            <span className="font-medium">Your answer:</span>{" "}
                            Option {answer.selectedOption + 1}
                          </p>
                          <p className="text-gray-700">
                            <span className="font-medium">Correct answer:</span>{" "}
                            {answer.correctAnswer || "Not available"}
                          </p>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-4 mt-8">
              <button
                onClick={() => navigate("/quizzes")}
                className="w-full md:w-auto px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 mr-4"
              >
                Back to Quizzes
              </button>
              <button
                onClick={() => {
                  // Reset quiz state instead of reloading page
                  setQuizCompleted(false);
                  setResults(null);
                  setCurrentQuestion(0);
                  setAnswers({});
                  setTimeLeft(quiz.timeLimit * 60);
                  setQuizStarted(false);
                  setStartTime(null);
                }}
                className="w-full md:w-auto px-6 py-3 bg-gray-600 text-white rounded-md hover:bg-gray-700"
              >
                Retake Quiz
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  if (!quizStarted) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow-lg p-8"
          >
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                {quiz.title}
              </h1>
              <p className="text-gray-600 text-lg">{quiz.description}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <Clock className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <div className="text-lg font-semibold text-gray-900">
                  Time Limit
                </div>
                <div className="text-gray-600">{quiz.timeLimit} minutes</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <div className="text-lg font-semibold text-gray-900">
                  Questions
                </div>
                <div className="text-gray-600">
                  {quiz.questions.length} questions
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8">
              <h3 className="font-semibold text-yellow-800 mb-2">
                Instructions:
              </h3>
              <ul className="text-yellow-700 space-y-1">
                <li>
                  • Read each question carefully before selecting an answer
                </li>
                <li>
                  • You can navigate between questions and change your answers
                </li>
                <li>• The quiz will auto-submit when time runs out</li>
                <li>• Passing score: {quiz.passingScore}%</li>
              </ul>
            </div>

            <div className="text-center">
              <button
                onClick={startQuiz}
                className="px-8 py-3 bg-blue-600 text-white text-lg font-semibold rounded-md hover:bg-blue-700 transition-colors duration-200"
              >
                Start Quiz
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                {quiz.title}
              </h1>
              <p className="text-sm text-gray-600">
                Question {currentQuestion + 1} of {quiz.questions.length}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-lg font-semibold text-gray-900 flex items-center">
                  <Clock className="h-5 w-5 mr-1" />
                  {formatTime(timeLeft)}
                </div>
                <div className="text-sm text-gray-600">Time Remaining</div>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-4">
            <div className="bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${getProgressPercentage()}%` }}
              ></div>
            </div>
            <div className="text-sm text-gray-600 mt-1">
              {Object.keys(answers).length} of {quiz.questions.length} answered
            </div>
          </div>
        </div>

        {/* Question */}
        <motion.div
          key={currentQuestion}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-lg shadow-md p-6 mb-6"
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            {quiz.questions[currentQuestion].question}
          </h2>

          <div className="space-y-3">
            {quiz.questions[currentQuestion].options.map(
              (option, optionIndex) => (
                <motion.div
                  key={optionIndex}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                    answers[currentQuestion] === optionIndex
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                  onClick={() =>
                    handleAnswerSelect(currentQuestion, optionIndex)
                  }
                >
                  <div className="flex items-center">
                    <div
                      className={`w-4 h-4 rounded-full border-2 mr-3 ${
                        answers[currentQuestion] === optionIndex
                          ? "border-blue-500 bg-blue-500"
                          : "border-gray-300"
                      }`}
                    >
                      {answers[currentQuestion] === optionIndex && (
                        <div className="w-2 h-2 bg-white rounded-full m-0.5"></div>
                      )}
                    </div>
                    <span className="text-gray-900">{option.text}</span>
                  </div>
                </motion.div>
              )
            )}
          </div>
        </motion.div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
            disabled={currentQuestion === 0}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Previous
          </button>

          <div className="flex space-x-4">
            {currentQuestion === quiz.questions.length - 1 ? (
              <button
                onClick={handleSubmitQuiz}
                className="inline-flex items-center px-6 py-2 border border-transparent rounded-md shadow-sm bg-green-600 text-base font-medium text-white hover:bg-green-700"
              >
                Submit Quiz
              </button>
            ) : (
              <button
                onClick={() =>
                  setCurrentQuestion(
                    Math.min(quiz.questions.length - 1, currentQuestion + 1)
                  )
                }
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm bg-blue-600 text-sm font-medium text-white hover:bg-blue-700"
              >
                Next
                <ArrowRight className="h-4 w-4 ml-1" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizTaking;

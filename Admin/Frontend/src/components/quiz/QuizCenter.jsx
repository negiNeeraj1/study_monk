import React, { useState } from "react";

const QuizCenter = () => {
  const [selectedSubject, setSelectedSubject] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const subjects = [
    { id: "all", name: "All Subjects", count: 15 },
    { id: "mathematics", name: "Mathematics", count: 5 },
    { id: "physics", name: "Physics", count: 4 },
    { id: "chemistry", name: "Chemistry", count: 3 },
    { id: "biology", name: "Biology", count: 3 },
  ];

  const quizzes = [
    {
      id: 1,
      title: "Calculus Derivatives",
      subject: "mathematics",
      description: "Test your knowledge of derivative rules and applications",
      questions: 20,
      timeLimit: 30,
      difficulty: "Intermediate",
      bestScore: 85,
      attempts: 3,
      status: "available",
    },
    {
      id: 2,
      title: "Quantum Mechanics Quiz",
      subject: "physics",
      description: "Advanced concepts in quantum mechanics and wave functions",
      questions: 25,
      timeLimit: 45,
      difficulty: "Advanced",
      bestScore: 72,
      attempts: 2,
      status: "available",
    },
    {
      id: 3,
      title: "Organic Chemistry Basics",
      subject: "chemistry",
      description: "Fundamental concepts in organic chemistry and reactions",
      questions: 18,
      timeLimit: 25,
      difficulty: "Beginner",
      bestScore: 95,
      attempts: 1,
      status: "completed",
    },
    {
      id: 4,
      title: "Cell Biology Fundamentals",
      subject: "biology",
      description: "Basic cell structure and cellular processes",
      questions: 22,
      timeLimit: 35,
      difficulty: "Beginner",
      bestScore: 88,
      attempts: 2,
      status: "available",
    },
  ];

  const filteredQuizzes = quizzes.filter((quiz) => {
    const matchesSubject =
      selectedSubject === "all" || quiz.subject === selectedSubject;
    const matchesSearch =
      quiz.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      quiz.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSubject && matchesSearch;
  });

  const getDifficultyColor = (difficulty) => {
    switch (difficulty.toLowerCase()) {
      case "beginner":
        return "bg-green-100 text-green-800";
      case "intermediate":
        return "bg-yellow-100 text-yellow-800";
      case "advanced":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "available":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white shadow rounded-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Quiz Center</h1>
        <p className="text-gray-600">
          Test your knowledge with interactive quizzes across all subjects
        </p>
      </div>

      {/* Search and Filters */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search quizzes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex gap-2">
            {subjects.map((subject) => (
              <button
                key={subject.id}
                onClick={() => setSelectedSubject(subject.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedSubject === subject.id
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {subject.name} ({subject.count})
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Quiz Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <span className="text-2xl">📝</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Quizzes</p>
              <p className="text-2xl font-bold text-gray-900">15</p>
            </div>
          </div>
        </div>
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <span className="text-2xl">✅</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-gray-900">8</p>
            </div>
          </div>
        </div>
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <span className="text-2xl">📊</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Average Score</p>
              <p className="text-2xl font-bold text-gray-900">82%</p>
            </div>
          </div>
        </div>
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <span className="text-2xl">⏱️</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Study Time</p>
              <p className="text-2xl font-bold text-gray-900">12h</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quizzes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredQuizzes.map((quiz) => (
          <div
            key={quiz.id}
            className="bg-white shadow rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
          >
            <div className="p-6">
              <div className="flex items-start justify-between mb-3">
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                    quiz.status
                  )}`}
                >
                  {quiz.status === "completed" ? "Completed" : "Available"}
                </span>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(
                    quiz.difficulty
                  )}`}
                >
                  {quiz.difficulty}
                </span>
              </div>

              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {quiz.title}
              </h3>
              <p className="text-gray-600 text-sm mb-4">{quiz.description}</p>

              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Questions:</span>
                    <p className="font-medium">{quiz.questions}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Time Limit:</span>
                    <p className="font-medium">{quiz.timeLimit} min</p>
                  </div>
                </div>

                {quiz.status === "completed" && (
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Best Score</span>
                      <span className="font-medium text-green-600">
                        {quiz.bestScore}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm mt-1">
                      <span className="text-gray-600">Attempts</span>
                      <span className="font-medium">{quiz.attempts}</span>
                    </div>
                  </div>
                )}

                <button
                  className={`w-full px-4 py-2 rounded-lg font-medium transition-colors ${
                    quiz.status === "completed"
                      ? "bg-green-600 text-white hover:bg-green-700"
                      : "bg-blue-600 text-white hover:bg-blue-700"
                  }`}
                >
                  {quiz.status === "completed" ? "Retake Quiz" : "Start Quiz"}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredQuizzes.length === 0 && (
        <div className="bg-white shadow rounded-lg p-12 text-center">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No quizzes found
          </h3>
          <p className="text-gray-600">
            Try adjusting your search or filter criteria
          </p>
        </div>
      )}
    </div>
  );
};

export default QuizCenter;

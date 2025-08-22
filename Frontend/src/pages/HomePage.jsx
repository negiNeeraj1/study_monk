import React from "react";
import { Link } from "react-router-dom";

const HomePage = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-500 via-purple-600 to-purple-700 p-4">
      <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl w-full max-w-2xl p-10 text-center">
        <h1 className="text-4xl font-extrabold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
          Welcome to Study AI
        </h1>
        <p className="text-lg text-gray-700 mb-8">
          The ultimate platform for AI-powered quizzes, study material, and your
          personal AI assistant. Sign up or log in to unlock all features!
        </p>
        <div className="flex justify-center gap-6 mb-8">
          <Link
            to="/login"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold shadow hover:bg-blue-700 transition"
          >
            Login
          </Link>
          <Link
            to="/signup"
            className="px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg font-semibold shadow hover:from-purple-600 hover:to-blue-600 transition"
          >
            Register
          </Link>
        </div>
        <div className="grid md:grid-cols-2 gap-8 mt-8">
          <div className="bg-blue-50 rounded-xl p-6 shadow flex flex-col items-center">
            <span className="text-3xl mb-2">📝</span>
            <h2 className="text-xl font-bold mb-2">AI Quizzes</h2>
            <p className="text-gray-600 mb-2">
              Practice placement and computer science topics with AI-generated
              quizzes.
            </p>
            <Link
              to="/login"
              className="text-blue-600 font-semibold hover:underline"
            >
              Try Now
            </Link>
          </div>
          <div className="bg-purple-50 rounded-xl p-6 shadow flex flex-col items-center">
            <span className="text-3xl mb-2">📚</span>
            <h2 className="text-xl font-bold mb-2">Study Material</h2>
            <p className="text-gray-600 mb-2">
              Access curated study resources for every subject.
            </p>
            <Link
              to="/login"
              className="text-purple-600 font-semibold hover:underline"
            >
              Explore
            </Link>
          </div>
          <div className="bg-green-50 rounded-xl p-6 shadow flex flex-col items-center">
            <span className="text-3xl mb-2">🤖</span>
            <h2 className="text-xl font-bold mb-2">AI Assistant</h2>
            <p className="text-gray-600 mb-2">
              Get instant help and answers from your personal AI assistant.
            </p>
            <Link
              to="/login"
              className="text-green-600 font-semibold hover:underline"
            >
              Ask Now
            </Link>
          </div>
          <div className="bg-yellow-50 rounded-xl p-6 shadow flex flex-col items-center">
            <span className="text-3xl mb-2">📊</span>
            <h2 className="text-xl font-bold mb-2">Dashboard</h2>
            <p className="text-gray-600 mb-2">
              Track your progress and achievements.
            </p>
            <Link
              to="/login"
              className="text-yellow-600 font-semibold hover:underline"
            >
              View Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;

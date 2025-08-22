import React from "react";
import { motion } from "framer-motion";
import { ArrowLeft, BookOpen } from "lucide-react";
import QuizHistory from "../Components/dashboard/QuizHistory";

const QuizHistoryPage = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gray-50 py-8"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <button
              onClick={() => window.history.back()}
              className="flex items-center text-gray-600 hover:text-gray-800 mr-4"
            >
              <ArrowLeft className="w-5 h-5 mr-1" />
              Back
            </button>
            <div className="flex items-center">
              <BookOpen className="w-8 h-8 text-blue-600 mr-3" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Quiz History
                </h1>
                <p className="text-gray-600">
                  View all your quiz attempts and performance
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Quiz History Component */}
        <QuizHistory showAll={true} />
      </div>
    </motion.div>
  );
};

export default QuizHistoryPage;

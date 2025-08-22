import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  BookOpen,
  Code,
  Database,
  Network,
  Shield,
  Brain,
  Server,
  Smartphone,
  Cloud,
  Calculator,
  Briefcase,
  MessageCircle,
  FileText,
  Trophy,
  Target,
  Star,
} from "lucide-react";

// Comprehensive list of subjects for B.Tech/Computer Science students
const SUBJECTS = [
  {
    id: 1,
    name: "Data Structures & Algorithms",
    icon: <Code className="w-8 h-8" />,
    color: "from-blue-500 to-blue-700",
    description: "Arrays, Linked Lists, Trees, Graphs, Sorting & Searching",
    difficulty: "Core",
    popularity: 95,
  },
  {
    id: 2,
    name: "Object-Oriented Programming",
    icon: <BookOpen className="w-8 h-8" />,
    color: "from-green-500 to-green-700",
    description: "Classes, Objects, Inheritance, Polymorphism, Encapsulation",
    difficulty: "Core",
    popularity: 90,
  },
  {
    id: 3,
    name: "Database Management Systems",
    icon: <Database className="w-8 h-8" />,
    color: "from-purple-500 to-purple-700",
    description: "SQL, NoSQL, Normalization, Transactions, Query Optimization",
    difficulty: "Core",
    popularity: 88,
  },
  {
    id: 4,
    name: "Computer Networks",
    icon: <Network className="w-8 h-8" />,
    color: "from-orange-500 to-orange-700",
    description: "OSI Model, TCP/IP, Routing, Network Security, Protocols",
    difficulty: "Core",
    popularity: 85,
  },
  {
    id: 5,
    name: "Operating Systems",
    icon: <Server className="w-8 h-8" />,
    color: "from-red-500 to-red-700",
    description: "Process Management, Memory Management, File Systems",
    difficulty: "Core",
    popularity: 87,
  },
  {
    id: 6,
    name: "Web Development",
    icon: <Code className="w-8 h-8" />,
    color: "from-teal-500 to-teal-700",
    description: "HTML, CSS, JavaScript, React, Node.js, Full Stack",
    difficulty: "Applied",
    popularity: 92,
  },
  {
    id: 7,
    name: "Software Engineering",
    icon: <Briefcase className="w-8 h-8" />,
    color: "from-indigo-500 to-indigo-700",
    description: "SDLC, Agile, Testing, Design Patterns, Project Management",
    difficulty: "Applied",
    popularity: 82,
  },
  {
    id: 8,
    name: "Machine Learning",
    icon: <Brain className="w-8 h-8" />,
    color: "from-pink-500 to-pink-700",
    description: "Supervised Learning, Neural Networks, Deep Learning, AI",
    difficulty: "Advanced",
    popularity: 89,
  },
  {
    id: 9,
    name: "Cybersecurity",
    icon: <Shield className="w-8 h-8" />,
    color: "from-gray-500 to-gray-700",
    description: "Cryptography, Network Security, Ethical Hacking, Forensics",
    difficulty: "Advanced",
    popularity: 78,
  },
  {
    id: 10,
    name: "Mobile App Development",
    icon: <Smartphone className="w-8 h-8" />,
    color: "from-cyan-500 to-cyan-700",
    description: "Android, iOS, React Native, Flutter, Cross-platform",
    difficulty: "Applied",
    popularity: 85,
  },
  {
    id: 11,
    name: "Cloud Computing",
    icon: <Cloud className="w-8 h-8" />,
    color: "from-blue-400 to-blue-600",
    description: "AWS, Azure, Docker, Kubernetes, Microservices",
    difficulty: "Advanced",
    popularity: 80,
  },
  {
    id: 12,
    name: "DevOps",
    icon: <Server className="w-8 h-8" />,
    color: "from-green-400 to-green-600",
    description: "CI/CD, Infrastructure as Code, Monitoring, Automation",
    difficulty: "Advanced",
    popularity: 75,
  },
  {
    id: 13,
    name: "Discrete Mathematics",
    icon: <Calculator className="w-8 h-8" />,
    color: "from-yellow-500 to-yellow-700",
    description: "Logic, Set Theory, Graph Theory, Combinatorics",
    difficulty: "Core",
    popularity: 70,
  },
  {
    id: 14,
    name: "Computer Architecture",
    icon: <BookOpen className="w-8 h-8" />,
    color: "from-purple-400 to-purple-600",
    description: "CPU Design, Memory Systems, I/O Systems, Performance",
    difficulty: "Core",
    popularity: 72,
  },
  {
    id: 15,
    name: "Compiler Design",
    icon: <Code className="w-8 h-8" />,
    color: "from-red-400 to-red-600",
    description: "Lexical Analysis, Parsing, Code Generation, Optimization",
    difficulty: "Advanced",
    popularity: 68,
  },
  {
    id: 16,
    name: "Digital Logic Design",
    icon: <Calculator className="w-8 h-8" />,
    color: "from-orange-400 to-orange-600",
    description: "Boolean Algebra, Logic Gates, Circuits, Sequential Systems",
    difficulty: "Core",
    popularity: 75,
  },
  {
    id: 17,
    name: "System Design",
    icon: <Network className="w-8 h-8" />,
    color: "from-indigo-400 to-indigo-600",
    description: "Scalability, Load Balancing, Distributed Systems",
    difficulty: "Advanced",
    popularity: 88,
  },
  {
    id: 18,
    name: "Artificial Intelligence",
    icon: <Brain className="w-8 h-8" />,
    color: "from-pink-400 to-pink-600",
    description: "Search Algorithms, Knowledge Representation, Expert Systems",
    difficulty: "Advanced",
    popularity: 85,
  },
  {
    id: 19,
    name: "Linux/Unix Systems",
    icon: <Server className="w-8 h-8" />,
    color: "from-green-600 to-green-800",
    description: "Shell Scripting, System Administration, Commands",
    difficulty: "Applied",
    popularity: 77,
  },
  {
    id: 20,
    name: "Software Testing",
    icon: <Target className="w-8 h-8" />,
    color: "from-teal-400 to-teal-600",
    description: "Unit Testing, Integration Testing, Test Automation",
    difficulty: "Applied",
    popularity: 73,
  },
  {
    id: 21,
    name: "Aptitude & Reasoning",
    icon: <Calculator className="w-8 h-8" />,
    color: "from-yellow-400 to-yellow-600",
    description: "Quantitative Aptitude, Logical Reasoning, Verbal Ability",
    difficulty: "Core",
    popularity: 90,
  },
  {
    id: 22,
    name: "Interview Preparation",
    icon: <MessageCircle className="w-8 h-8" />,
    color: "from-rose-500 to-rose-700",
    description: "Technical Questions, HR Questions, Coding Problems",
    difficulty: "Applied",
    popularity: 93,
  },
  {
    id: 23,
    name: "Communication Skills",
    icon: <MessageCircle className="w-8 h-8" />,
    color: "from-blue-300 to-blue-500",
    description:
      "Technical Writing, Presentation Skills, Business Communication",
    difficulty: "Applied",
    popularity: 80,
  },
  {
    id: 24,
    name: "Project Management",
    icon: <Briefcase className="w-8 h-8" />,
    color: "from-gray-400 to-gray-600",
    description: "Agile, Scrum, Planning, Risk Management, Leadership",
    difficulty: "Applied",
    popularity: 75,
  },
];

// Difficulty levels with enhanced options
const DIFFICULTY_LEVELS = [
  {
    id: "beginner",
    name: "Beginner",
    icon: <Star className="w-6 h-6" />,
    color: "from-green-500 to-emerald-600",
    description: "Foundation concepts and basic understanding",
    timePerQuestion: "2 minutes",
    passingScore: 60,
  },
  {
    id: "intermediate",
    name: "Intermediate",
    icon: <Trophy className="w-6 h-6" />,
    color: "from-orange-500 to-amber-600",
    description: "Applied knowledge and problem solving",
    timePerQuestion: "3 minutes",
    passingScore: 70,
  },
  {
    id: "advanced",
    name: "Advanced",
    icon: <Target className="w-6 h-6" />,
    color: "from-purple-500 to-violet-600",
    description: "Complex scenarios and expert level concepts",
    timePerQuestion: "4 minutes",
    passingScore: 80,
  },
];

// Question count options
const QUESTION_COUNTS = [
  {
    value: 10,
    label: "10 Questions",
    duration: "20-30 min",
    difficulty: "Quick",
  },
  {
    value: 20,
    label: "20 Questions",
    duration: "40-60 min",
    difficulty: "Standard",
  },
  {
    value: 30,
    label: "30 Questions",
    duration: "60-90 min",
    difficulty: "Comprehensive",
  },
];

const QuizList = ({ onQuizStart }) => {
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState(null);
  const [selectedQuestionCount, setSelectedQuestionCount] = useState(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDifficulty, setFilterDifficulty] = useState("all");

  // Filter subjects based on search and difficulty
  const filteredSubjects = SUBJECTS.filter((subject) => {
    const matchesSearch =
      subject.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      subject.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDifficulty =
      filterDifficulty === "all" ||
      subject.difficulty.toLowerCase() === filterDifficulty.toLowerCase();
    return matchesSearch && matchesDifficulty;
  });

  // Handle subject selection
  const handleSubjectSelect = (subject) => {
    setSelectedSubject(subject);
    setCurrentStep(2);
  };

  // Handle difficulty selection
  const handleDifficultySelect = (difficulty) => {
    setSelectedDifficulty(difficulty);
    setCurrentStep(3);
  };

  // Handle question count selection
  const handleQuestionCountSelect = (count) => {
    setSelectedQuestionCount(count);
    // Call parent function to start quiz
    if (onQuizStart) {
      onQuizStart({
        subject: selectedSubject,
        difficulty: selectedDifficulty,
        questionCount: count,
      });
    }
  };

  // Reset to start
  const resetSelection = () => {
    setSelectedSubject(null);
    setSelectedDifficulty(null);
    setSelectedQuestionCount(null);
    setCurrentStep(1);
  };

  // Step 1: Subject Selection
  const SubjectSelection = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="text-center mb-8">
        <motion.h2
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-3xl font-bold text-gray-800 mb-4"
        >
          🎓 Choose Your Subject
        </motion.h2>
        <motion.p
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-lg text-gray-600"
        >
          Select a subject to test your knowledge and enhance your skills
        </motion.p>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1">
          <input
            type="text"
            placeholder=" Search subjects..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={searchTerm}
            onChange={(e) => {
              e.preventDefault();
              setSearchTerm(e.target.value);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
              }
            }}
          />
        </div>
        <div>
          <select
            className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={filterDifficulty}
            onChange={(e) => setFilterDifficulty(e.target.value)}
          >
            <option value="all">All Categories</option>
            <option value="core">Core Subjects</option>
            <option value="applied">Applied Subjects</option>
            <option value="advanced">Advanced Subjects</option>
          </select>
        </div>
      </div>

      {/* Subject Cards */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: {
              delayChildren: 0.2,
              staggerChildren: 0.1,
            },
          },
        }}
      >
        {filteredSubjects.map((subject) => (
          <motion.div
            key={subject.id}
            variants={{
              hidden: { y: 20, opacity: 0 },
              visible: { y: 0, opacity: 1 },
            }}
            whileHover={{
              scale: 1.05,
              transition: { duration: 0.2 },
            }}
            whileTap={{ scale: 0.95 }}
            className={`relative cursor-pointer bg-gradient-to-br ${subject.color} rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300`}
            onClick={() => handleSubjectSelect(subject)}
          >
            {/* Popularity Badge */}
            <div className="absolute top-2 right-2 bg-white bg-opacity-20 rounded-full px-2 py-1 text-xs font-semibold">
              ⭐ {subject.popularity}%
            </div>

            {/* Icon */}
            <div className="mb-4">{subject.icon}</div>

            {/* Subject Name */}
            <h3 className="text-xl font-bold mb-2">{subject.name}</h3>

            {/* Description */}
            <p className="text-white text-opacity-90 text-sm mb-3">
              {subject.description}
            </p>

            {/* Difficulty Badge */}
            <div className="flex justify-between items-center">
              <span className="bg-white bg-opacity-20 rounded-full px-3 py-1 text-xs font-medium">
                {subject.difficulty}
              </span>
              <span className="text-lg">→</span>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {filteredSubjects.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <div className="text-6xl mb-4">📚</div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            No subjects found
          </h3>
          <p className="text-gray-500">
            Try adjusting your search or filter criteria
          </p>
        </motion.div>
      )}
    </motion.div>
  );

  // Step 2: Difficulty Selection
  const DifficultySelection = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="text-center mb-8">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex items-center justify-center mb-4"
        >
          <button
            onClick={() => setCurrentStep(1)}
            className="mr-4 text-blue-600 hover:text-blue-800 font-medium"
          >
            ← Back to Subjects
          </button>
          <h2 className="text-3xl font-bold text-gray-800">
            ⚡ Choose Difficulty Level
          </h2>
        </motion.div>
        <motion.p
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-lg text-gray-600"
        >
          Selected:{" "}
          <span className="font-semibold">{selectedSubject?.name}</span>
        </motion.p>
      </div>

      {/* Difficulty Cards */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: {
              delayChildren: 0.2,
              staggerChildren: 0.2,
            },
          },
        }}
      >
        {DIFFICULTY_LEVELS.map((difficulty) => (
          <motion.div
            key={difficulty.id}
            variants={{
              hidden: { y: 30, opacity: 0 },
              visible: { y: 0, opacity: 1 },
            }}
            whileHover={{
              scale: 1.05,
              transition: { duration: 0.2 },
            }}
            whileTap={{ scale: 0.95 }}
            className={`cursor-pointer bg-gradient-to-br ${difficulty.color} rounded-xl p-8 text-white shadow-lg hover:shadow-xl transition-all duration-300`}
            onClick={() => handleDifficultySelect(difficulty)}
          >
            {/* Icon */}
            <div className="flex justify-center mb-4">{difficulty.icon}</div>

            {/* Difficulty Name */}
            <h3 className="text-2xl font-bold text-center mb-3">
              {difficulty.name}
            </h3>

            {/* Description */}
            <p className="text-white text-opacity-90 text-center text-sm mb-4">
              {difficulty.description}
            </p>

            {/* Stats */}
            <div className="space-y-2 text-sm text-white text-opacity-80">
              <div className="flex justify-between">
                <span>Time per question:</span>
                <span className="font-semibold">
                  {difficulty.timePerQuestion}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Passing score:</span>
                <span className="font-semibold">
                  {difficulty.passingScore}%
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );

  // Step 3: Question Count Selection
  const QuestionCountSelection = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="text-center mb-8">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex items-center justify-center mb-4"
        >
          <button
            onClick={() => setCurrentStep(2)}
            className="mr-4 text-blue-600 hover:text-blue-800 font-medium"
          >
            ← Back to Difficulty
          </button>
          <h2 className="text-3xl font-bold text-gray-800">
            📊 Choose Question Count
          </h2>
        </motion.div>
        <motion.p
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-lg text-gray-600"
        >
          <span className="font-semibold">{selectedSubject?.name}</span> •{" "}
          <span className="font-semibold">
            {selectedDifficulty?.name} Level
          </span>
        </motion.p>
      </div>

      {/* Question Count Cards */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: {
              delayChildren: 0.2,
              staggerChildren: 0.2,
            },
          },
        }}
      >
        {QUESTION_COUNTS.map((count, index) => (
          <motion.div
            key={count.value}
            variants={{
              hidden: { y: 30, opacity: 0 },
              visible: { y: 0, opacity: 1 },
            }}
            whileHover={{
              scale: 1.05,
              transition: { duration: 0.2 },
            }}
            whileTap={{ scale: 0.95 }}
            className={`cursor-pointer bg-gradient-to-br ${
              index === 0
                ? "from-blue-500 to-blue-700"
                : index === 1
                ? "from-green-500 to-green-700"
                : "from-purple-500 to-purple-700"
            } rounded-xl p-8 text-white shadow-lg hover:shadow-xl transition-all duration-300`}
            onClick={() => handleQuestionCountSelect(count)}
          >
            {/* Question Count */}
            <div className="text-center mb-4">
              <div className="text-4xl font-bold mb-2">{count.value}</div>
              <h3 className="text-xl font-semibold">{count.label}</h3>
            </div>

            {/* Duration */}
            <div className="text-center text-white text-opacity-90 mb-4">
              <div className="text-sm">Estimated Duration</div>
              <div className="font-semibold">{count.duration}</div>
            </div>

            {/* Difficulty */}
            <div className="text-center">
              <span className="bg-white bg-opacity-20 rounded-full px-4 py-2 text-sm font-medium">
                {count.difficulty}
              </span>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Start Quiz Button */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="text-center mt-8"
      >
        <button
          onClick={resetSelection}
          className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200"
        >
          🔄 Start Over
        </button>
      </motion.div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Progress Steps */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex justify-center mb-8"
        >
          <div className="flex items-center space-x-4">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                    currentStep >= step
                      ? "bg-blue-600 text-white"
                      : "bg-gray-300 text-gray-600"
                  }`}
                >
                  {step}
                </div>
                {step < 3 && (
                  <div
                    className={`w-12 h-1 ${
                      currentStep > step ? "bg-blue-600" : "bg-gray-300"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Step Content */}
        {currentStep === 1 && <SubjectSelection />}
        {currentStep === 2 && <DifficultySelection />}
        {currentStep === 3 && <QuestionCountSelection />}
      </div>
    </div>
  );
};

export default QuizList;

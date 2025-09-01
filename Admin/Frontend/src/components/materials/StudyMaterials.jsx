import React, { useState } from "react";

const StudyMaterials = () => {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const categories = [
    { id: "all", name: "All Materials", count: 24 },
    { id: "mathematics", name: "Mathematics", count: 8 },
    { id: "physics", name: "Physics", count: 6 },
    { id: "chemistry", name: "Chemistry", count: 5 },
    { id: "biology", name: "Biology", count: 5 },
  ];

  const materials = [
    {
      id: 1,
      title: "Calculus Fundamentals",
      category: "mathematics",
      description:
        "Complete guide to calculus concepts including limits, derivatives, and integrals.",
      difficulty: "Intermediate",
      duration: "2 hours",
      progress: 75,
      type: "PDF",
    },
    {
      id: 2,
      title: "Quantum Mechanics Basics",
      category: "physics",
      description:
        "Introduction to quantum mechanics principles and wave-particle duality.",
      difficulty: "Advanced",
      duration: "3 hours",
      progress: 45,
      type: "Video",
    },
    {
      id: 3,
      title: "Organic Chemistry Reactions",
      category: "chemistry",
      description:
        "Comprehensive overview of organic chemistry reactions and mechanisms.",
      difficulty: "Intermediate",
      duration: "2.5 hours",
      progress: 90,
      type: "Interactive",
    },
    {
      id: 4,
      title: "Cell Biology Structure",
      category: "biology",
      description:
        "Detailed study of cell structure, organelles, and cellular processes.",
      difficulty: "Beginner",
      duration: "1.5 hours",
      progress: 100,
      type: "PDF",
    },
  ];

  const filteredMaterials = materials.filter((material) => {
    const matchesCategory =
      selectedCategory === "all" || material.category === selectedCategory;
    const matchesSearch =
      material.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      material.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
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

  const getTypeIcon = (type) => {
    switch (type.toLowerCase()) {
      case "pdf":
        return "📄";
      case "video":
        return "🎥";
      case "interactive":
        return "🔄";
      default:
        return "📚";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white shadow rounded-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Study Materials
        </h1>
        <p className="text-gray-600">
          Access comprehensive study resources across all subjects
        </p>
      </div>

      {/* Search and Filters */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search materials..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex gap-2">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedCategory === category.id
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {category.name} ({category.count})
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Materials Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMaterials.map((material) => (
          <div
            key={material.id}
            className="bg-white shadow rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
          >
            <div className="p-6">
              <div className="flex items-start justify-between mb-3">
                <span className="text-2xl">{getTypeIcon(material.type)}</span>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(
                    material.difficulty
                  )}`}
                >
                  {material.difficulty}
                </span>
              </div>

              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {material.title}
              </h3>
              <p className="text-gray-600 text-sm mb-4">
                {material.description}
              </p>

              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>Duration: {material.duration}</span>
                  <span>{material.type}</span>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Progress</span>
                    <span className="font-medium">{material.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${material.progress}%` }}
                    ></div>
                  </div>
                </div>

                <button className="w-full mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  {material.progress === 100 ? "Review" : "Continue Learning"}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredMaterials.length === 0 && (
        <div className="bg-white shadow rounded-lg p-12 text-center">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No materials found
          </h3>
          <p className="text-gray-600">
            Try adjusting your search or filter criteria
          </p>
        </div>
      )}
    </div>
  );
};

export default StudyMaterials;

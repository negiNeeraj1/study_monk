import React from "react";
import { motion } from "framer-motion";
import { Download, Calendar, Eye } from "lucide-react";

const MaterialCard = ({ material, onDownload }) => {
  const {
    _id,
    title,
    description,
    subject,
    type,
    difficulty,
    createdAt,
    downloads,
    views,
    author,
    fileUrl,
    tags,
  } = material;

  // Function to get difficulty color
  const getDifficultyColor = (difficulty) => {
    const colors = {
      beginner: "bg-green-100 text-green-800",
      intermediate: "bg-yellow-100 text-yellow-800",
      advanced: "bg-red-100 text-red-800",
    };
    return colors[difficulty] || "bg-gray-100 text-gray-800";
  };

  // Function to get type icon
  const getTypeIcon = (type) => {
    switch (type) {
      case "pdf":
        return "📄";
      case "video":
        return "🎥";
      case "link":
        return "🔗";
      default:
        return "📝";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow"
    >
      <div className="relative h-48 overflow-hidden bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="text-6xl mb-2">{getTypeIcon(type)}</div>
            <div className="text-sm text-gray-600 capitalize">{type}</div>
          </div>
        </div>
        <div className="absolute top-4 left-4">
          <span
            className={`px-3 py-1 rounded-full text-xs font-medium ${getDifficultyColor(
              difficulty
            )}`}
          >
            {difficulty?.charAt(0).toUpperCase() + difficulty?.slice(1)}
          </span>
        </div>
        <div className="absolute top-4 right-4">
          <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            {subject}
          </span>
        </div>
      </div>

      <div className="p-6">
        <h3 className="text-xl font-semibold mb-2 text-gray-900">{title}</h3>
        <p className="text-gray-600 mb-4 line-clamp-2">{description}</p>

        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
          <div className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            <span>{new Date(createdAt).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center gap-1">
            <Eye className="w-4 h-4" />
            <span>{downloads || 0} downloads</span>
          </div>
        </div>

        {author && (
          <div className="text-sm text-gray-500 mb-4">
            By {author.name || "Unknown Author"}
          </div>
        )}

        {tags && tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onDownload(_id)}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg flex items-center justify-center gap-2 transition-colors"
        >
          <Download className="w-4 h-4" />
          Download
        </motion.button>
      </div>
    </motion.div>
  );
};

export default MaterialCard;

import React from 'react';
import { motion } from 'framer-motion';
import { Download, Calendar, Eye } from 'lucide-react';

const MaterialCard = ({ material, onDownload }) => {
  const { id, title, description, category, thumbnailUrl, uploadDate, downloadCount } = material;

  // Function to get category label
  const getCategoryLabel = (categoryValue) => {
    const categories = {
      'ai-ml': 'AI & ML',
      'web-dev': 'Web Development',
      'dsa': 'Data Structures & Algorithms',
      'programming': 'Programming',
      'database': 'Database'
    };
    return categories[categoryValue] || categoryValue;
  };

  // Function to get category color
  const getCategoryColor = (categoryValue) => {
    const colors = {
      'ai-ml': 'bg-purple-100 text-purple-800',
      'web-dev': 'bg-blue-100 text-blue-800',
      'dsa': 'bg-green-100 text-green-800',
      'programming': 'bg-yellow-100 text-yellow-800',
      'database': 'bg-red-100 text-red-800'
    };
    return colors[categoryValue] || 'bg-gray-100 text-gray-800';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow"
    >
      <div className="relative h-48 overflow-hidden">
        <img 
          src={thumbnailUrl || 'https://via.placeholder.com/400x200?text=Study+Material'} 
          alt={title}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = 'https://via.placeholder.com/400x200?text=Study+Material';
          }}
        />
        <div className="absolute top-4 left-4">
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(category)}`}>
            {getCategoryLabel(category)}
          </span>
        </div>
      </div>
      
      <div className="p-6">
        <h3 className="text-xl font-semibold mb-2 text-gray-900">{title}</h3>
        <p className="text-gray-600 mb-4 line-clamp-2">{description}</p>
        
        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
          <div className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            <span>{uploadDate}</span>
          </div>
          <div className="flex items-center gap-1">
            <Eye className="w-4 h-4" />
            <span>{downloadCount} downloads</span>
          </div>
        </div>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onDownload(id)}
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
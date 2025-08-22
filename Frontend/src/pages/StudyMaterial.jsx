import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Download, Star, Crown, BookOpen, Filter } from 'lucide-react';
import Card from '../Components/ui/Card';
import PremiumNotes from "../images/PreiumNotes.jpg"
import SubjectBundle from "../images/SubjectBundle.jpg"
import FullPackage from "../images/FullPackage.jpg"

// Import study material components
import CategoryFilter from '../Components/study/CategoryFilter';
import MaterialsGrid from '../Components/study/MaterialsGrid';
import SearchBar from '../Components/study/SearchBar';

// Import study material context
import { useStudyMaterial } from '../context/StudyMaterialContext';
const StudyMaterial = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedNotes, setGeneratedNotes] = useState('');
  
  // Get study material context
  const { 
    filteredMaterials, 
    categories, 
    activeCategory, 
    setActiveCategory, 
    isLoading, 
    error, 
    searchMaterials, 
    downloadMaterial 
  } = useStudyMaterial();

  const premiumFeatures = [
    {
      title: "Premium Study Notes",
      oldPrice: "$49.99",
      price: "$29.99",
      features: ["Downloadable PDF notes", "HD Quality diagrams", "Practice worksheets"],
      icon: <Crown className="w-6 h-6 text-yellow-500" />,
      src:PremiumNotes
    },
    {
      title: "Subject Bundle",
      oldPrice: "$79.99",
      price: "$49.99",
      features: ["All subjects access", "Monthly tests", "Personal progress tracker"],
      icon: <Star className="w-6 h-6 text-yellow-500" />,
      src:SubjectBundle
    },
    {
      title: "Complete Package",
      oldPrice: "$99.99",
      price: "$69.99",
      features: ["1-on-1 mentoring", "Live doubt clearing", "Custom study plan"],
      icon: <BookOpen className="w-6 h-6 text-yellow-500" />,
      src:FullPackage
    }
  ];

  // Handle search
  const handleSearch = (query) => {
    setSearchQuery(query);
    searchMaterials(query);
  };
  
  // Handle AI note generation
  const handleGenerateNotes = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setGeneratedNotes('Generated notes would appear here...');
      setIsGenerating(false);
    }, 2000);
  };
  
  // Handle download
  const handleDownload = async (id) => {
    try {
      const response = await downloadMaterial(id);
      // In a real application, you would handle the file download here
      console.log('Download response:', response);
      alert(`Download started for material ID: ${id}`);
    } catch (err) {
      console.error('Error downloading material:', err);
      alert('Failed to download material. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 rounded-2xl">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16"
      >
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold mb-4">Study Materials</h1>
          <p className="text-xl mb-8">Access high-quality learning resources for your studies</p>
          
          <div className="max-w-2xl bg-white rounded-lg flex items-center p-2">
            <input
              type="text"
              placeholder="Enter a topic to generate AI notes..."
              className="flex-1 px-4 py-2 outline-none"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)} style={{color:"black"}}
            />
            <button
              onClick={handleGenerateNotes}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg flex items-center gap-2"
            >
              <Search className="w-5 h-5" />
              Generate
            </button>
          </div>
        </div>
      </motion.div>

      <div className="container mx-auto px-4 py-8">
        {/* Search and Filter Section */}
        <div className="mb-8">
          <SearchBar onSearch={handleSearch} />
          
          <div className="flex items-center gap-2 mb-4">
            <Filter className="text-blue-600 w-5 h-5" />
            <h2 className="text-xl font-semibold">Filter by Category</h2>
          </div>
          
          <CategoryFilter 
            categories={categories} 
            activeCategory={activeCategory} 
            setActiveCategory={setActiveCategory} 
          />
        </div>
        
        {/* Error Message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}
        
        {/* Study Materials Grid */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Available Study Materials</h2>
          <MaterialsGrid 
            materials={filteredMaterials} 
            onDownload={handleDownload} 
            isLoading={isLoading} 
          />
        </div>
        
        {/* Premium Features Section */}
        <h2 className="text-3xl font-bold mb-8">Premium Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {premiumFeatures.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.2 }}
            >
              <Card className="h-full hover:shadow-lg transition-shadow">
                <div className="relative h-48 overflow-hidden rounded-t-xl">
                  <img 
                    src={feature.src}
                    alt={feature.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-4 left-4 text-white">
                    <p className="text-sm line-through opacity-75">{feature.oldPrice}</p>
                    <p className="text-2xl font-bold">{feature.price}</p>
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    {feature.icon}
                    <h3 className="text-xl font-semibold">{feature.title}</h3>
                  </div>
                  <ul className="space-y-2">
                    {feature.features.map((item, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <Download className="w-4 h-4 text-blue-600" />
                        {item}
                      </li>
                    ))}
                  </ul>
                  <button className="w-full mt-6 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors">
                    Get Started
                  </button>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="container mx-auto px-4 pb-16">
        <Card className="p-8">
          <h2 className="text-2xl font-bold mb-6">Study Notes</h2>
          {isGenerating ? (
            <div className="flex gap-2 items-center">
              <motion.div
                className="w-3 h-3 bg-blue-600 rounded-full"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 1 }}
              />
              <motion.div
                className="w-3 h-3 bg-blue-600 rounded-full"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 1, delay: 0.2 }}
              />
              <motion.div
                className="w-3 h-3 bg-blue-600 rounded-full"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 1, delay: 0.4 }}
              />
            </div>
          ) : (
            <div className="prose max-w-none">
              {generatedNotes || (
                <div className="text-center text-gray-500">
                  Search for a topic to generate study notes
                </div>
              )}
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
            <div className="bg-gray-100 h-48 rounded-lg flex items-center justify-center text-gray-500">
              Image Placeholder 1
            </div>
            <div className="bg-gray-100 h-48 rounded-lg flex items-center justify-center text-gray-500">
              Image Placeholder 2
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default StudyMaterial;
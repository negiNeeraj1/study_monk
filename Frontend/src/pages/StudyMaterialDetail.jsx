import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Download, Calendar, Eye, Tag, Clock } from "lucide-react";
import Card from "../Components/ui/Card";
import { useStudyMaterial } from "../context/StudyMaterialContext";
import studyMaterialService from "../services/studyMaterialService";

const StudyMaterialDetail = () => {
  const { id } = useParams();
  const { downloadMaterial } = useStudyMaterial();

  const [material, setMaterial] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [relatedMaterials, setRelatedMaterials] = useState([]);

  // Fetch material details
  useEffect(() => {
    const fetchMaterialDetails = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await studyMaterialService.getMaterialById(id);
        setMaterial(response.data);

        // Fetch related materials
        if (response.data) {
          const allMaterials = await studyMaterialService.getAllMaterials();
          const related = allMaterials.data
            .filter(
              (item) =>
                item.category === response.data.category &&
                item.id !== response.data.id
            )
            .slice(0, 3);
          setRelatedMaterials(related);
        }
      } catch (err) {
        console.error("Error fetching material details:", err);
        setError("Failed to load material details. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchMaterialDetails();
  }, [id]);

  // Handle download
  const handleDownload = async () => {
    try {
      if (!material) return;

      const response = await downloadMaterial(material.id);
      console.log("Download response:", response);
      alert(`Download started for ${material.title}`);
    } catch (err) {
      console.error("Error downloading material:", err);
      alert("Failed to download material. Please try again.");
    }
  };

  // Function to get category label
  const getCategoryLabel = (categoryValue) => {
    const categories = {
      "ai-ml": "AI & ML",
      "web-dev": "Web Development",
      dsa: "Data Structures & Algorithms",
      programming: "Programming",
      database: "Database",
    };
    return categories[categoryValue] || categoryValue;
  };

  // Function to get category color
  const getCategoryColor = (categoryValue) => {
    const colors = {
      "ai-ml": "bg-purple-100 text-purple-800",
      "web-dev": "bg-blue-100 text-blue-800",
      dsa: "bg-green-100 text-green-800",
      programming: "bg-yellow-100 text-yellow-800",
      database: "bg-red-100 text-red-800",
    };
    return colors[categoryValue] || "bg-gray-100 text-gray-800";
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-1/4 mb-4"></div>
            <div className="h-64 bg-gray-300 rounded-lg mb-6"></div>
            <div className="h-8 bg-gray-300 rounded mb-4"></div>
            <div className="h-4 bg-gray-300 rounded mb-2"></div>
            <div className="h-4 bg-gray-300 rounded mb-2"></div>
            <div className="h-4 bg-gray-300 rounded mb-6 w-3/4"></div>
            <div className="h-12 bg-gray-300 rounded-lg w-1/3"></div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="container mx-auto px-4 py-8">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
          <Link
            to="/study-material"
            className="text-blue-600 hover:underline flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Study Materials
          </Link>
        </div>
      </div>
    );
  }

  // No material found
  if (!material) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <div className="text-gray-500 text-xl">
              Study material not found
            </div>
            <Link
              to="/study-material"
              className="text-blue-600 hover:underline mt-4 inline-block"
            >
              Back to Study Materials
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="container mx-auto px-4 py-8">
        {/* Back button */}
        <Link
          to="/study-material"
          className="text-blue-600 hover:underline flex items-center gap-2 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Study Materials
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2">
            <Card className="overflow-hidden">
              {/* Material image */}
              <div className="relative h-64 md:h-80 overflow-hidden">
                <img
                  src={
                    material.thumbnailUrl ||
                    "https://picsum.photos/800/400?random=2"
                  }
                  alt={material.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "https://picsum.photos/800/400?random=2";
                  }}
                />
                <div className="absolute top-4 left-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(
                      material.category
                    )}`}
                  >
                    {getCategoryLabel(material.category)}
                  </span>
                </div>
              </div>

              {/* Material details */}
              <div className="p-6">
                <h1 className="text-3xl font-bold mb-4 text-gray-900">
                  {material.title}
                </h1>

                <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-6">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>Uploaded: {material.uploadDate}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Eye className="w-4 h-4" />
                    <span>{material.downloadCount} downloads</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Tag className="w-4 h-4" />
                    <span>{getCategoryLabel(material.category)}</span>
                  </div>
                </div>

                <div className="prose max-w-none mb-8">
                  <h2 className="text-xl font-semibold mb-2">Description</h2>
                  <p className="text-gray-700">{material.description}</p>
                </div>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleDownload}
                  className="bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg flex items-center justify-center gap-2 transition-colors"
                >
                  <Download className="w-5 h-5" />
                  Download Material
                </motion.button>
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div>
            <Card className="p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">Related Materials</h2>

              {relatedMaterials.length > 0 ? (
                <div className="space-y-4">
                  {relatedMaterials.map((item) => (
                    <Link
                      key={item.id}
                      to={`/study-material/${item.id}`}
                      className="block hover:bg-gray-50 p-3 rounded-lg transition-colors"
                    >
                      <div className="flex gap-3">
                        <div className="w-16 h-16 bg-gray-200 rounded overflow-hidden flex-shrink-0">
                          <img
                            src={
                              item.thumbnailUrl ||
                              "https://picsum.photos/64/64?random=3"
                            }
                            alt={item.title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src =
                                "https://picsum.photos/64/64?random=3";
                            }}
                          />
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900 line-clamp-1">
                            {item.title}
                          </h3>
                          <p className="text-sm text-gray-500 line-clamp-2">
                            {item.description}
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No related materials found</p>
              )}
            </Card>

            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Study Tips</h2>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start gap-2">
                  <Clock className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <span>
                    Schedule regular study sessions with this material
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <Clock className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <span>Take notes while reading to improve retention</span>
                </li>
                <li className="flex items-start gap-2">
                  <Clock className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <span>Test yourself on key concepts after studying</span>
                </li>
                <li className="flex items-start gap-2">
                  <Clock className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <span>Join study groups to discuss this material</span>
                </li>
              </ul>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudyMaterialDetail;

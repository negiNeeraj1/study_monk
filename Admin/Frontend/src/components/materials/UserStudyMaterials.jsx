import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Download, 
  Eye, 
  BookOpen, 
  FileText, 
  Video, 
  Link,
  Star,
  Clock,
  User
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const UserStudyMaterials = () => {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    subject: 'all',
    difficulty: 'all',
    type: 'all'
  });
  const [pagination, setPagination] = useState({
    current: 1,
    total: 1,
    count: 0,
    limit: 12
  });
  const [categories, setCategories] = useState([]);
  const [popularMaterials, setPopularMaterials] = useState([]);
  const [recentMaterials, setRecentMaterials] = useState([]);

  const subjects = [
    'Mathematics', 'Physics', 'Chemistry', 'Biology', 'Computer Science',
    'Engineering', 'Business', 'Literature', 'History', 'Geography',
    'Economics', 'Psychology', 'Sociology', 'Philosophy', 'Arts'
  ];

  const difficulties = ['beginner', 'intermediate', 'advanced'];
  const types = ['note', 'pdf', 'video', 'link'];

  useEffect(() => {
    fetchMaterials();
    fetchCategories();
    fetchPopularMaterials();
    fetchRecentMaterials();
  }, [filters, pagination.current]);

  const fetchMaterials = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        page: pagination.current,
        limit: pagination.limit,
        ...filters
      });

      const response = await fetch(`/api/study-materials?${queryParams}`);
      if (!response.ok) throw new Error('Failed to fetch materials');

      const data = await response.json();
      setMaterials(data.data.materials);
      setPagination(data.data.pagination);
    } catch (error) {
      console.error('Error fetching materials:', error);
      toast.error('Failed to fetch study materials');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/study-materials/categories');
      if (response.ok) {
        const data = await response.json();
        setCategories(data.data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchPopularMaterials = async () => {
    try {
      const response = await fetch('/api/study-materials/popular?limit=6');
      if (response.ok) {
        const data = await response.json();
        setPopularMaterials(data.data.materials);
      }
    } catch (error) {
      console.error('Error fetching popular materials:', error);
    }
  };

  const fetchRecentMaterials = async () => {
    try {
      const response = await fetch('/api/study-materials/recent?limit=6');
      if (response.ok) {
        const data = await response.json();
        setRecentMaterials(data.data.materials);
      }
    } catch (error) {
      console.error('Error fetching recent materials:', error);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, current: 1 }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPagination(prev => ({ ...prev, current: 1 }));
  };

  const handleDownload = async (materialId, materialTitle) => {
    try {
      const response = await fetch(`/api/study-materials/${materialId}/download`);
      if (!response.ok) throw new Error('Download failed');

      // Create blob and download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = materialTitle;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success('Download started successfully');
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Download failed');
    }
  };

  const handlePreview = (materialId) => {
    window.open(`/api/study-materials/${materialId}/preview`, '_blank');
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'pdf': return <FileText className="w-5 h-5 text-red-500" />;
      case 'video': return <Video className="w-5 h-5 text-purple-500" />;
      case 'link': return <Link className="w-5 h-5 text-blue-500" />;
      default: return <BookOpen className="w-5 h-5 text-green-500" />;
    }
  };

  const getDifficultyBadge = (difficulty) => {
    const difficultyConfig = {
      beginner: 'bg-blue-100 text-blue-800',
      intermediate: 'bg-yellow-100 text-yellow-800',
      advanced: 'bg-red-100 text-red-800'
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${difficultyConfig[difficulty]}`}>
        {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
      </span>
    );
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (loading && materials.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Study Materials
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Access a comprehensive collection of study materials, notes, and resources 
          to enhance your learning experience across various subjects and difficulty levels.
        </p>
      </div>

      {/* Popular and Recent Materials */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Popular Materials */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <Star className="w-5 h-5 text-yellow-500 mr-2" />
            Popular Materials
          </h2>
          <div className="space-y-3">
            {popularMaterials.map((material) => (
              <div key={material._id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex-shrink-0">
                  {getTypeIcon(material.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {material.title}
                  </p>
                  <p className="text-sm text-gray-500">{material.subject}</p>
                </div>
                <div className="flex-shrink-0 text-right">
                  <div className="text-sm text-gray-900">{material.views || 0}</div>
                  <div className="text-xs text-gray-500">views</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Materials */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <Clock className="w-5 h-5 text-blue-500 mr-2" />
            Recent Materials
          </h2>
          <div className="space-y-3">
            {recentMaterials.map((material) => (
              <div key={material._id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex-shrink-0">
                  {getTypeIcon(material.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {material.title}
                  </p>
                  <p className="text-sm text-gray-500">{material.subject}</p>
                </div>
                <div className="flex-shrink-0 text-right">
                  <div className="text-xs text-gray-500">
                    {new Date(material.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white shadow rounded-lg p-6">
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Search
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  placeholder="Search materials..."
                  className="pl-10 w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Subject
              </label>
              <select
                value={filters.subject}
                onChange={(e) => handleFilterChange('subject', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Subjects</option>
                {subjects.map(subject => (
                  <option key={subject} value={subject}>{subject}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Difficulty
              </label>
              <select
                value={filters.difficulty}
                onChange={(e) => handleFilterChange('difficulty', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Difficulties</option>
                {difficulties.map(difficulty => (
                  <option key={difficulty} value={difficulty}>
                    {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type
              </label>
              <select
                value={filters.type}
                onChange={(e) => handleFilterChange('type', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Types</option>
                {types.map(type => (
                  <option key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Filter className="w-4 h-4 mr-2" />
              Apply Filters
            </button>
          </div>
        </form>
      </div>

      {/* Materials Grid */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            Study Materials ({pagination.count})
          </h2>
        </div>

        {materials.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No materials found</h3>
            <p className="mt-1 text-sm text-gray-500">
              Try adjusting your search criteria or filters.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {materials.map((material) => (
              <div key={material._id} className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-shrink-0">
                      {getTypeIcon(material.type)}
                    </div>
                    <div className="flex items-center space-x-2">
                      {getDifficultyBadge(material.difficulty)}
                      {material.isPremium && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          Premium
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                      {material.title}
                    </h3>
                    <p className="text-sm text-gray-600 line-clamp-3">
                      {material.description}
                    </p>
                  </div>

                  <div className="mb-4">
                    <div className="flex items-center text-sm text-gray-500 mb-2">
                      <User className="w-4 h-4 mr-1" />
                      {material.author?.name || 'Unknown'}
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <Clock className="w-4 h-4 mr-1" />
                      {new Date(material.createdAt).toLocaleDateString()}
                    </div>
                  </div>

                  {material.fileInfo && material.fileInfo.fileExists && (
                    <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">File Size:</span>
                        <span className="font-medium text-gray-900">
                          {material.fileInfo.fileSizeFormatted}
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <div className="flex items-center">
                      <Eye className="w-4 h-4 mr-1" />
                      {material.views || 0} views
                    </div>
                    <div className="flex items-center">
                      <Download className="w-4 h-4 mr-1" />
                      {material.downloads || 0} downloads
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <button
                      onClick={() => handlePreview(material._id)}
                      className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      Preview
                    </button>
                    {material.fileInfo && material.fileInfo.fileExists && (
                      <button
                        onClick={() => handleDownload(material._id, material.title)}
                        className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        <Download className="w-4 h-4 mr-1" />
                        Download
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.total > 1 && (
          <div className="mt-8 flex items-center justify-between">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setPagination(prev => ({ ...prev, current: prev.current - 1 }))}
                disabled={pagination.current === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => setPagination(prev => ({ ...prev, current: prev.current + 1 }))}
                disabled={pagination.current === pagination.total}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing{' '}
                  <span className="font-medium">{(pagination.current - 1) * pagination.limit + 1}</span>
                  {' '}to{' '}
                  <span className="font-medium">
                    {Math.min(pagination.current * pagination.limit, pagination.count)}
                  </span>
                  {' '}of{' '}
                  <span className="font-medium">{pagination.count}</span>
                  {' '}results
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  {Array.from({ length: pagination.total }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setPagination(prev => ({ ...prev, current: page }))}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        page === pagination.current
                          ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                          : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserStudyMaterials;

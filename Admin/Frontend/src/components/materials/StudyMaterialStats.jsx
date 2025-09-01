import React from 'react';
import { 
  BookOpen, 
  Eye, 
  Download, 
  TrendingUp, 
  FileText, 
  Video, 
  Link, 
  CheckCircle,
  Clock,
  Archive
} from 'lucide-react';

const StudyMaterialStats = ({ stats }) => {
  const {
    overview = {},
    distribution = {},
    recentUploads = [],
    topMaterials = []
  } = stats;

  const {
    total = 0,
    published = 0,
    draft = 0,
    archived = 0,
    totalViews = 0,
    totalDownloads = 0
  } = overview;

  const getStatusIcon = (status) => {
    switch (status) {
      case 'published': return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'draft': return <Clock className="w-5 h-5 text-yellow-600" />;
      case 'archived': return <Archive className="w-5 h-5 text-red-600" />;
      default: return <Clock className="w-5 h-5 text-gray-600" />;
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'pdf': return <FileText className="w-4 h-4" />;
      case 'video': return <Video className="w-4 h-4" />;
      case 'link': return <Link className="w-4 h-4" />;
      default: return <BookOpen className="w-4 h-4" />;
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'beginner': return 'text-blue-600 bg-blue-100';
      case 'intermediate': return 'text-yellow-600 bg-yellow-100';
      case 'advanced': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <BookOpen className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Materials
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {total.toLocaleString()}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Eye className="h-6 w-6 text-blue-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Views
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {totalViews.toLocaleString()}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Download className="h-6 w-6 text-green-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Downloads
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {totalDownloads.toLocaleString()}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <TrendingUp className="h-6 w-6 text-purple-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Published
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {published.toLocaleString()}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Status Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Status Distribution</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                <span className="text-sm font-medium text-gray-700">Published</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-900">{published}</span>
                <span className="text-sm text-gray-500">
                  ({total > 0 ? Math.round((published / total) * 100) : 0}%)
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Clock className="w-5 h-5 text-yellow-600 mr-2" />
                <span className="text-sm font-medium text-gray-700">Draft</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-900">{draft}</span>
                <span className="text-sm text-gray-500">
                  ({total > 0 ? Math.round((draft / total) * 100) : 0}%)
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Archive className="w-5 h-5 text-red-600 mr-2" />
                <span className="text-sm font-medium text-gray-700">Archived</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-900">{archived}</span>
                <span className="text-sm text-gray-500">
                  ({total > 0 ? Math.round((archived / total) * 100) : 0}%)
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Subject Distribution */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Top Subjects</h3>
          <div className="space-y-3">
            {distribution.bySubject?.slice(0, 5).map((subject, index) => (
              <div key={subject._id} className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">
                  {subject._id}
                </span>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-900">{subject.count}</span>
                  <span className="text-sm text-gray-500">
                    ({total > 0 ? Math.round((subject.count / total) * 100) : 0}%)
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Uploads and Top Materials */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Uploads */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Uploads</h3>
          <div className="space-y-3">
            {recentUploads.slice(0, 5).map((material) => (
              <div key={material._id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className="flex-shrink-0">
                  {getTypeIcon(material.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {material.title}
                  </p>
                  <p className="text-sm text-gray-500">
                    {material.subject} • {material.author?.name}
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <span className="text-xs text-gray-400">
                    {new Date(material.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
            {recentUploads.length === 0 && (
              <p className="text-sm text-gray-500 text-center py-4">
                No recent uploads
              </p>
            )}
          </div>
        </div>

        {/* Top Materials */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Top Materials</h3>
          <div className="space-y-3">
            {topMaterials.slice(0, 5).map((material, index) => (
              <div key={material._id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-xs font-medium text-blue-600">{index + 1}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {material.title}
                  </p>
                  <p className="text-sm text-gray-500">{material.subject}</p>
                </div>
                <div className="flex-shrink-0 text-right">
                  <div className="text-sm text-gray-900">
                    {material.views || 0} views
                  </div>
                  <div className="text-sm text-gray-500">
                    {material.downloads || 0} downloads
                  </div>
                </div>
              </div>
            ))}
            {topMaterials.length === 0 && (
              <p className="text-sm text-gray-500 text-center py-4">
                No materials available
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Type Distribution */}
      {distribution.byType && (
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Material Types</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {distribution.byType.map((type) => (
              <div key={type._id} className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="flex justify-center mb-2">
                  {getTypeIcon(type._id)}
                </div>
                <div className="text-sm font-medium text-gray-900 capitalize">
                  {type._id}
                </div>
                <div className="text-2xl font-bold text-blue-600">
                  {type.count}
                </div>
                <div className="text-xs text-gray-500">
                  {total > 0 ? Math.round((type.count / total) * 100) : 0}%
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Difficulty Distribution */}
      {distribution.byDifficulty && (
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Difficulty Levels</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {distribution.byDifficulty.map((difficulty) => (
              <div key={difficulty._id} className="text-center p-4 bg-gray-50 rounded-lg">
                <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(difficulty._id)} mb-2`}>
                  {difficulty._id.charAt(0).toUpperCase() + difficulty._id.slice(1)}
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  {difficulty.count}
                </div>
                <div className="text-sm text-gray-500">
                  {total > 0 ? Math.round((difficulty.count / total) * 100) : 0}% of total
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default StudyMaterialStats;

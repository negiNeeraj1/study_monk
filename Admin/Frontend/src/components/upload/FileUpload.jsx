import React, { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Upload, Cloud, FileText, Image, Video, File, X, Check } from "lucide-react";
import { useDashboard } from "../../context/DashboardContext";

const FileUpload = () => {
  const [dragActive, setDragActive] = useState(false);
  const [files, setFiles] = useState([]);
  const { showToast } = useDashboard();

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  }, []);

  const handleFiles = (fileList) => {
    const newFiles = Array.from(fileList).map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      name: file.name,
      size: file.size,
      type: file.type,
      progress: 0,
      status: 'pending' // pending, uploading, completed, error
    }));
    
    setFiles(prev => [...prev, ...newFiles]);
    
    // Simulate upload
    newFiles.forEach(fileItem => {
      simulateUpload(fileItem.id);
    });
  };

  const simulateUpload = (fileId) => {
    setFiles(prev => prev.map(f => 
      f.id === fileId ? { ...f, status: 'uploading' } : f
    ));

    const interval = setInterval(() => {
      setFiles(prev => prev.map(f => {
        if (f.id === fileId) {
          const newProgress = f.progress + Math.random() * 20;
          if (newProgress >= 100) {
            clearInterval(interval);
            showToast(`${f.name} uploaded successfully`, 'success');
            return { ...f, progress: 100, status: 'completed' };
          }
          return { ...f, progress: Math.min(newProgress, 100) };
        }
        return f;
      }));
    }, 200);
  };

  const removeFile = (fileId) => {
    setFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const getFileIcon = (type) => {
    if (type.startsWith('image/')) return Image;
    if (type.startsWith('video/')) return Video;
    if (type.includes('pdf') || type.includes('document')) return FileText;
    return File;
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
          File Upload
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Upload and manage study materials, documents, and media files
        </p>
      </div>

      {/* Upload Area */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`glass-card p-8 rounded-xl border-2 border-dashed transition-all duration-300 ${
          dragActive 
            ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/20' 
            : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
        }`}
      >
        <div className="text-center">
          <motion.div
            animate={{ 
              y: dragActive ? -10 : 0,
              scale: dragActive ? 1.1 : 1 
            }}
            transition={{ duration: 0.2 }}
          >
            <Cloud size={64} className={`mx-auto mb-4 ${
              dragActive ? 'text-blue-500' : 'text-gray-400'
            }`} />
          </motion.div>
          
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            {dragActive ? 'Drop files here' : 'Drag and drop files here'}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            or click to browse and select files
          </p>
          
          <input
            type="file"
            multiple
            onChange={(e) => handleFiles(e.target.files)}
            className="hidden"
            id="file-upload"
          />
          <label
            htmlFor="file-upload"
            className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all duration-300 cursor-pointer"
          >
            <Upload size={18} />
            <span>Choose Files</span>
          </label>
          
          <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
            Supported formats: PDF, DOC, DOCX, PPT, PPTX, JPG, PNG, MP4, etc.
            <br />
            Maximum file size: 100MB per file
          </div>
        </div>
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="glass-card p-6 rounded-xl">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Upload Progress ({files.length} files)
          </h3>
          
          <div className="space-y-3">
            {files.map((fileItem) => {
              const FileIcon = getFileIcon(fileItem.type);
              
              return (
                <motion.div
                  key={fileItem.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center space-x-4 p-4 bg-white/30 dark:bg-gray-800/30 rounded-lg"
                >
                  <div className="flex-shrink-0">
                    <FileIcon size={24} className="text-gray-600 dark:text-gray-400" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {fileItem.name}
                      </p>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {formatFileSize(fileItem.size)}
                        </span>
                        {fileItem.status === 'completed' ? (
                          <Check size={16} className="text-green-500" />
                        ) : (
                          <button
                            onClick={() => removeFile(fileItem.id)}
                            className="text-red-500 hover:text-red-700 transition-colors"
                          >
                            <X size={16} />
                          </button>
                        )}
                      </div>
                    </div>
                    
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${fileItem.progress}%` }}
                        transition={{ duration: 0.3 }}
                        className={`h-2 rounded-full ${
                          fileItem.status === 'completed' 
                            ? 'bg-green-500' 
                            : fileItem.status === 'error'
                              ? 'bg-red-500'
                              : 'bg-blue-500'
                        }`}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {fileItem.status === 'completed' ? 'Completed' :
                         fileItem.status === 'error' ? 'Error' :
                         fileItem.status === 'uploading' ? 'Uploading...' : 'Pending'}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {Math.round(fileItem.progress)}%
                      </span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
          
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200/50 dark:border-gray-700/50">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {files.filter(f => f.status === 'completed').length} of {files.length} files completed
            </span>
            <button
              onClick={() => setFiles([])}
              className="text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors"
            >
              Clear All
            </button>
          </div>
        </div>
      )}

      {/* Upload Tips */}
      <div className="glass-card p-6 rounded-xl">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Upload Tips
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <h4 className="font-medium text-gray-900 dark:text-white">Best Practices</h4>
            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <li>• Use descriptive file names</li>
              <li>• Compress large files when possible</li>
              <li>• Organize files in folders</li>
              <li>• Include relevant tags and descriptions</li>
            </ul>
          </div>
          <div className="space-y-2">
            <h4 className="font-medium text-gray-900 dark:text-white">Supported Formats</h4>
            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <li>• Documents: PDF, DOC, DOCX, PPT, PPTX</li>
              <li>• Images: JPG, PNG, GIF, SVG</li>
              <li>• Videos: MP4, AVI, MOV, WMV</li>
              <li>• Audio: MP3, WAV, OGG</li>
            </ul>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default FileUpload;

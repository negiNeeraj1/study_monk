import React, { useState, useEffect } from "react";
import {
  X,
  Upload,
  FileText,
  Video,
  Link,
  BookOpen,
  Save,
  Loader,
  Eye,
  Download,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";
import adminAPI from "../../services/api";

const StudyMaterialForm = ({ material, onClose, onSuccess }) => {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    content: "",
    type: "note",
    subject: "",
    difficulty: "beginner",
    tags: "",
    isPublished: true,
    isPremium: false,
    status: "published",
  });
  const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [errors, setErrors] = useState({});
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const subjects = [
    "Mathematics",
    "Physics",
    "Chemistry",
    "Biology",
    "Computer Science",
    "Engineering",
    "Business",
    "Literature",
    "History",
    "Geography",
    "Economics",
    "Psychology",
    "Sociology",
    "Philosophy",
    "Arts",
  ];

  const difficulties = ["beginner", "intermediate", "advanced"];
  const types = ["note", "pdf", "video", "link"];
  const statuses = ["draft", "published", "archived"];

  useEffect(() => {
    if (material) {
      setFormData({
        title: material.title || "",
        description: material.description || "",
        content: material.content || "",
        type: material.type || "note",
        subject: material.subject || "",
        difficulty: material.difficulty || "beginner",
        tags: material.tags ? material.tags.join(", ") : "",
        isPublished: material.isPublished || false,
        isPremium: material.isPremium || false,
        status: material.status || "draft",
      });

      if (material.fileUrl) {
        setFilePreview({
          name: material.fileUrl.split("/").pop(),
          url: material.fileUrl,
          size: material.fileSize || 0,
        });
      }
    }
  }, [material]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      processFile(selectedFile);
    }
  };

  const processFile = (selectedFile) => {
    // Clear any previous errors
    setErrors((prev) => ({ ...prev, file: "" }));

    // Validate file size (50MB limit)
    if (selectedFile.size > 50 * 1024 * 1024) {
      const errorMsg = "File size must be less than 50MB";
      toast.error(errorMsg);
      setErrors((prev) => ({ ...prev, file: errorMsg }));
      return;
    }

    // Validate file type with more detailed checking
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-powerpoint",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      "text/plain",
      "text/csv",
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
      "video/mp4",
      "video/webm",
      "video/ogg",
      "video/avi",
      "audio/mpeg",
      "audio/wav",
      "audio/ogg",
    ];

    const fileExtension = selectedFile.name.split(".").pop().toLowerCase();
    const allowedExtensions = [
      "pdf",
      "doc",
      "docx",
      "ppt",
      "pptx",
      "txt",
      "csv",
      "jpg",
      "jpeg",
      "png",
      "gif",
      "webp",
      "mp4",
      "webm",
      "ogg",
      "avi",
      "mp3",
      "wav",
    ];

    if (
      !allowedTypes.includes(selectedFile.type) &&
      !allowedExtensions.includes(fileExtension)
    ) {
      const errorMsg = `Invalid file type. Allowed formats: PDF, DOC, DOCX, PPT, PPTX, TXT, CSV, Images (JPG, PNG, GIF, WebP), Videos (MP4, WebM, OGG, AVI), Audio (MP3, WAV)`;
      toast.error(errorMsg);
      setErrors((prev) => ({ ...prev, file: errorMsg }));
      return;
    }

    // Additional validation for specific file types
    if (
      selectedFile.type.startsWith("image/") &&
      selectedFile.size > 10 * 1024 * 1024
    ) {
      const errorMsg =
        "Image files should be less than 10MB for better performance";
      toast.warning(errorMsg);
    }

    if (
      selectedFile.type.startsWith("video/") &&
      selectedFile.size > 100 * 1024 * 1024
    ) {
      const errorMsg = "Video files should be less than 100MB";
      toast.error(errorMsg);
      setErrors((prev) => ({ ...prev, file: errorMsg }));
      return;
    }

    setFile(selectedFile);
    setFilePreview({
      name: selectedFile.name,
      size: selectedFile.size,
      type: selectedFile.type,
    });

    // Show success message
    toast.success(`File "${selectedFile.name}" selected successfully`);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const removeFile = () => {
    setFile(null);
    setFilePreview(null);
  };

  const validateForm = () => {
    const newErrors = {};

    const titleTrimmed = formData.title.trim();
    const descriptionTrimmed = formData.description.trim();
    const subjectTrimmed = formData.subject.trim();

    if (!titleTrimmed) {
      newErrors.title = "Title is required";
    } else if (titleTrimmed.length < 3 || titleTrimmed.length > 200) {
      newErrors.title = "Title must be between 3 and 200 characters";
    }

    if (!descriptionTrimmed) {
      newErrors.description = "Description is required";
    } else if (
      descriptionTrimmed.length < 10 ||
      descriptionTrimmed.length > 1000
    ) {
      newErrors.description =
        "Description must be between 10 and 1000 characters";
    }

    if (!subjectTrimmed) {
      newErrors.subject = "Subject is required";
    } else if (subjectTrimmed.length < 2 || subjectTrimmed.length > 50) {
      newErrors.subject = "Subject must be between 2 and 50 characters";
    }

    if (formData.type === "note" && !formData.content.trim()) {
      newErrors.content = "Content is required for note type";
    }

    if (formData.type !== "note" && !file && !filePreview) {
      newErrors.file = "File is required for this material type";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const formDataToSend = new FormData();

      // Add form fields
      Object.keys(formData).forEach((key) => {
        if (key === "tags") {
          formDataToSend.append(key, formData[key]);
        } else if (key === "isPublished" || key === "isPremium") {
          formDataToSend.append(key, formData[key].toString());
        } else {
          formDataToSend.append(key, formData[key]);
        }
      });

      // Add file if present
      if (file) {
        formDataToSend.append("file", file);
      }

      // Use adminAPI service for consistent error handling
      let data;
      if (material) {
        data = await adminAPI.updateMaterial(material._id, formDataToSend);
      } else {
        data = await adminAPI.createMaterial(formDataToSend);
      }

      toast.success(data.message);
      onSuccess();
    } catch (error) {
      console.error("Error saving material:", error);
      toast.error(error.message || "Failed to save material");
    } finally {
      setLoading(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case "pdf":
        return <FileText className="w-5 h-5" />;
      case "video":
        return <Video className="w-5 h-5" />;
      case "link":
        return <Link className="w-5 h-5" />;
      default:
        return <BookOpen className="w-5 h-5" />;
    }
  };

  const getFileTypeIcon = (fileType) => {
    if (fileType?.includes("pdf"))
      return <FileText className="w-5 h-5 text-red-500" />;
    if (fileType?.includes("video"))
      return <Video className="w-5 h-5 text-purple-500" />;
    if (fileType?.includes("image"))
      return <Eye className="w-5 h-5 text-green-500" />;
    if (fileType?.includes("word") || fileType?.includes("document"))
      return <FileText className="w-5 h-5 text-blue-500" />;
    return <FileText className="w-5 h-5 text-gray-500" />;
  };

  return (
    <div
      className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50"
      style={{ zIndex: 9999 }}
    >
      <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-medium text-gray-900">
            {material ? "Edit Study Material" : "Add New Study Material"}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title and Description */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.title ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Enter material title"
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">{errors.title}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Subject *
              </label>
              <select
                name="subject"
                value={formData.subject}
                onChange={handleInputChange}
                className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.subject ? "border-red-500" : "border-gray-300"
                }`}
              >
                <option value="">Select Subject</option>
                {subjects.map((subject) => (
                  <option key={subject} value={subject}>
                    {subject}
                  </option>
                ))}
              </select>
              {errors.subject && (
                <p className="mt-1 text-sm text-red-600">{errors.subject}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={3}
              className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.description ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="Enter material description"
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description}</p>
            )}
          </div>

          {/* Type and Difficulty */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type *
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {types.map((type) => (
                  <option key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Difficulty *
              </label>
              <select
                name="difficulty"
                value={formData.difficulty}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {difficulties.map((difficulty) => (
                  <option key={difficulty} value={difficulty}>
                    {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Content for Note Type */}
          {formData.type === "note" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Content *
              </label>
              <textarea
                name="content"
                value={formData.content}
                onChange={handleInputChange}
                rows={6}
                className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.content ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Enter material content"
              />
              {errors.content && (
                <p className="mt-1 text-sm text-red-600">{errors.content}</p>
              )}
            </div>
          )}

          {/* File Upload Section - Always Visible */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {formData.type !== "note" ? "File *" : "Attach File (Optional)"}
            </label>
            <div
              className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md transition-all duration-300 ${
                dragActive
                  ? "border-blue-400 bg-blue-50 scale-105"
                  : isUploading
                  ? "border-green-400 bg-green-50"
                  : "border-gray-300 hover:border-gray-400 hover:bg-gray-50"
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              {filePreview ? (
                <div className="space-y-3 text-center">
                  <div className="flex items-center justify-center">
                    {getFileTypeIcon(filePreview.type)}
                  </div>
                  <div className="text-sm text-gray-600">
                    <p className="font-medium">{filePreview.name}</p>
                    <p className="text-gray-500">
                      {formatFileSize(filePreview.size)}
                    </p>
                    <p className="text-xs text-gray-400 capitalize">
                      {filePreview.type?.split("/")[1] || "Unknown"} file
                    </p>
                  </div>

                  {/* Upload Progress Bar */}
                  {isUploading && (
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                  )}

                  <div className="flex justify-center space-x-2">
                    <button
                      type="button"
                      onClick={removeFile}
                      disabled={isUploading}
                      className="text-red-600 hover:text-red-800 text-sm px-3 py-1 border border-red-300 rounded hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Remove File
                    </button>
                    {material?.fileUrl && (
                      <button
                        type="button"
                        onClick={() => window.open(material.fileUrl, "_blank")}
                        className="text-blue-600 hover:text-blue-800 text-sm px-3 py-1 border border-blue-300 rounded hover:bg-blue-50 flex items-center"
                      >
                        <Eye className="w-3 h-3 mr-1" />
                        Preview
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-3 text-center">
                  <Upload
                    className={`mx-auto h-12 w-12 transition-all duration-300 ${
                      dragActive
                        ? "text-blue-500 scale-110"
                        : isUploading
                        ? "text-green-500 animate-pulse"
                        : "text-gray-400"
                    }`}
                  />
                  <div className="flex text-sm text-gray-600">
                    <label className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500 transition-colors">
                      <span>Upload a file</span>
                      <input
                        type="file"
                        name="file"
                        onChange={handleFileChange}
                        className="sr-only"
                        accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.csv,.jpg,.jpeg,.png,.gif,.webp,.mp4,.webm,.ogg,.avi,.mp3,.wav"
                        disabled={isUploading}
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500">
                    PDF, DOC, DOCX, PPT, PPTX, TXT, CSV, Images, Videos, Audio
                    up to 50MB
                  </p>
                  {dragActive && (
                    <p className="text-sm text-blue-600 font-medium animate-pulse">
                      Drop your file here
                    </p>
                  )}
                  {isUploading && (
                    <p className="text-sm text-green-600 font-medium">
                      Uploading... {uploadProgress}%
                    </p>
                  )}
                </div>
              )}
            </div>
            {errors.file && (
              <p className="mt-1 text-sm text-red-600">{errors.file}</p>
            )}
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tags
            </label>
            <input
              type="text"
              name="tags"
              value={formData.tags}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter tags separated by commas"
            />
            <p className="mt-1 text-sm text-gray-500">
              Separate multiple tags with commas
            </p>
          </div>

          {/* Settings */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {statuses.map((status) => (
                  <option key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                name="isPublished"
                checked={formData.isPublished}
                onChange={handleInputChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm text-gray-900">
                Publish immediately
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                name="isPremium"
                checked={formData.isPremium}
                onChange={handleInputChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm text-gray-900">
                Premium content
              </label>
            </div>
          </div>

          {/* Additional Information */}
          <div className="bg-gray-50 p-4 rounded-md">
            <h4 className="text-sm font-medium text-gray-700 mb-2">
              Upload Guidelines
            </h4>
            <ul className="text-xs text-gray-600 space-y-1">
              <li>• Maximum file size: 50MB (Images: 10MB, Videos: 100MB)</li>
              <li>
                • Supported formats: PDF, DOC, DOCX, PPT, PPTX, TXT, CSV, Images
                (JPG, PNG, GIF, WebP), Videos (MP4, WebM, OGG, AVI), Audio (MP3,
                WAV)
              </li>
              <li>
                • For best results, use descriptive titles and detailed
                descriptions
              </li>
              <li>• Add relevant tags to help students find your materials</li>
              <li>
                • Choose appropriate difficulty level and subject category
              </li>
              <li>
                • Files are automatically organized and can be downloaded by
                students
              </li>
            </ul>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  {material ? "Update Material" : "Create Material"}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StudyMaterialForm;

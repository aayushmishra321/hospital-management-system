import { useState, useRef } from 'react';
import { Upload, X, File, Image, FileText, Download, Eye } from 'lucide-react';
import { toast } from 'sonner';

interface FileUploadProps {
  onFileUpload: (files: File[]) => void;
  acceptedTypes?: string[];
  maxSize?: number; // in MB
  maxFiles?: number;
  multiple?: boolean;
  existingFiles?: UploadedFile[];
  onFileDelete?: (fileId: string) => void;
  onFileView?: (file: UploadedFile) => void;
}

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  uploadedAt: string;
}

export function FileUpload({
  onFileUpload,
  acceptedTypes = ['image/*', 'application/pdf', '.doc', '.docx'],
  maxSize = 10, // 10MB default
  maxFiles = 5,
  multiple = true,
  existingFiles = [],
  onFileDelete,
  onFileView
}: FileUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFiles(Array.from(e.target.files));
    }
  };

  const handleFiles = (files: File[]) => {
    const validFiles: File[] = [];
    
    for (const file of files) {
      // Check file size
      if (file.size > maxSize * 1024 * 1024) {
        toast.error(`File ${file.name} is too large. Maximum size is ${maxSize}MB.`);
        continue;
      }

      // Check file type
      const isValidType = acceptedTypes.some(type => {
        if (type.includes('*')) {
          return file.type.startsWith(type.replace('*', ''));
        }
        return file.type === type || file.name.toLowerCase().endsWith(type);
      });

      if (!isValidType) {
        toast.error(`File ${file.name} is not a supported file type.`);
        continue;
      }

      validFiles.push(file);
    }

    // Check total file count
    if (existingFiles.length + validFiles.length > maxFiles) {
      toast.error(`Maximum ${maxFiles} files allowed.`);
      return;
    }

    if (validFiles.length > 0) {
      onFileUpload(validFiles);
    }
  };

  const onButtonClick = () => {
    fileInputRef.current?.click();
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) {
      return <Image className="w-5 h-5 text-blue-500" />;
    } else if (type === 'application/pdf') {
      return <FileText className="w-5 h-5 text-red-500" />;
    } else {
      return <File className="w-5 h-5 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        className={`relative border-2 border-dashed rounded-lg p-6 transition-colors ${
          dragActive
            ? 'border-blue-400 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple={multiple}
          accept={acceptedTypes.join(',')}
          onChange={handleChange}
          className="hidden"
        />

        <div className="text-center">
          <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <div className="text-lg font-medium text-gray-900 mb-2">
            Drop files here or click to upload
          </div>
          <div className="text-sm text-gray-500 mb-4">
            Supports: {acceptedTypes.join(', ')} • Max {maxSize}MB per file • Up to {maxFiles} files
          </div>
          <button
            type="button"
            onClick={onButtonClick}
            disabled={uploading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploading ? 'Uploading...' : 'Choose Files'}
          </button>
        </div>
      </div>

      {/* Existing Files */}
      {existingFiles.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-3">Uploaded Files</h4>
          <div className="space-y-2">
            {existingFiles.map((file) => (
              <div
                key={file.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border"
              >
                <div className="flex items-center gap-3">
                  {getFileIcon(file.type)}
                  <div>
                    <div className="text-sm font-medium text-gray-900">{file.name}</div>
                    <div className="text-xs text-gray-500">
                      {formatFileSize(file.size)} • Uploaded {new Date(file.uploadedAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {onFileView && (
                    <button
                      onClick={() => onFileView(file)}
                      className="p-1 text-gray-500 hover:text-blue-600 rounded"
                      title="View file"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  )}
                  
                  <a
                    href={file.url}
                    download={file.name}
                    className="p-1 text-gray-500 hover:text-green-600 rounded"
                    title="Download file"
                  >
                    <Download className="w-4 h-4" />
                  </a>

                  {onFileDelete && (
                    <button
                      onClick={() => onFileDelete(file.id)}
                      className="p-1 text-gray-500 hover:text-red-600 rounded"
                      title="Delete file"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upload Progress */}
      {uploading && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
            <span className="text-sm text-blue-800">Uploading files...</span>
          </div>
        </div>
      )}
    </div>
  );
}
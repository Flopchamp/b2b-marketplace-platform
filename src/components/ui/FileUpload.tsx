"use client";

import { useState, useRef, useCallback } from 'react';
import { Upload, X, FileText, Loader } from 'lucide-react';
import Image from 'next/image';

interface FileUploadProps {
  type: 'images' | 'documents';
  multiple?: boolean;
  maxFiles?: number;
  maxSize?: number; // in bytes
  value?: string[];
  onChange?: (urls: string[]) => void;
  disabled?: boolean;
  className?: string;
}

export default function FileUpload({
  type,
  multiple = true,
  maxFiles = 10,
  maxSize = 10 * 1024 * 1024, // 10MB
  value = [],
  onChange,
  disabled = false,
  className = ''
}: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const acceptedTypes = type === 'images' 
    ? 'image/jpeg,image/jpg,image/png,image/webp,image/gif'
    : 'application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document';

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const uploadFiles = useCallback(async (files: FileList) => {
    const validateFiles = (files: FileList) => {
      const fileArray = Array.from(files);
      
      // Check file count
      if (value.length + fileArray.length > maxFiles) {
        alert(`Maximum ${maxFiles} files allowed. You can upload ${maxFiles - value.length} more files.`);
        return false;
      }

      // Check file sizes and types
      for (const file of fileArray) {
        if (file.size > maxSize) {
          alert(`File "${file.name}" is too large. Maximum size: ${formatFileSize(maxSize)}`);
          return false;
        }

        const allowedTypes = type === 'images' 
          ? ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
          : ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

        if (!allowedTypes.includes(file.type)) {
          alert(`File "${file.name}" has an invalid type. Allowed types: ${allowedTypes.join(', ')}`);
          return false;
        }
      }

      return true;
    };

    if (!validateFiles(files)) return;

    setUploading(true);
    try {
      const formData = new FormData();
      Array.from(files).forEach(file => {
        formData.append('files', file);
      });
      formData.append('type', type);

      const accessToken = localStorage.getItem('accessToken');
      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        const newUrls = [...value, ...result.data.urls];
        onChange?.(newUrls);
        
        // Show success message
        const notification = document.createElement('div');
        notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
        notification.textContent = `Successfully uploaded ${result.data.count} file(s)`;
        document.body.appendChild(notification);
        
        setTimeout(() => {
          document.body.removeChild(notification);
        }, 3000);
      } else {
        alert(`Upload failed: ${result.error}`);
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  }, [type, value, onChange, maxFiles, maxSize]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      uploadFiles(e.target.files);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    
    if (disabled || uploading) return;
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      uploadFiles(e.dataTransfer.files);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!disabled && !uploading) {
      setDragOver(true);
    }
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const removeFile = (index: number) => {
    const newUrls = value.filter((_, i) => i !== index);
    onChange?.(newUrls);
  };

  const openFileDialog = () => {
    if (!disabled && !uploading && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Area */}
      <div
        onClick={openFileDialog}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`
          border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
          ${dragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}
          ${disabled || uploading ? 'opacity-50 cursor-not-allowed' : 'hover:border-blue-400 hover:bg-gray-50'}
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={acceptedTypes}
          multiple={multiple}
          onChange={handleFileSelect}
          disabled={disabled || uploading}
          className="hidden"
        />

        <div className="flex flex-col items-center">
          {uploading ? (
            <Loader className="h-12 w-12 text-blue-500 animate-spin mb-4" />
          ) : (
            <Upload className="h-12 w-12 text-gray-400 mb-4" />
          )}
          
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {uploading ? 'Uploading...' : `Upload ${type}`}
          </h3>
          
          <p className="text-sm text-gray-500 mb-2">
            {uploading ? 'Please wait while files are being uploaded' : 'Drag and drop files here, or click to select'}
          </p>
          
          <p className="text-xs text-gray-400">
            {type === 'images' ? 'JPG, PNG, WebP, GIF' : 'PDF, DOC, DOCX'} up to {formatFileSize(maxSize)}
          </p>
          
          {multiple && (
            <p className="text-xs text-gray-400">
              Maximum {maxFiles} files ({value.length}/{maxFiles} uploaded)
            </p>
          )}
        </div>
      </div>

      {/* Uploaded Files */}
      {value.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700">Uploaded {type}</h4>
          <div className={type === 'images' ? 'grid grid-cols-2 md:grid-cols-4 gap-4' : 'space-y-2'}>
            {value.map((url, index) => (
              <div key={index} className="relative group">
                {type === 'images' ? (
                  <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                    <Image
                      src={url}
                      alt={`Upload ${index + 1}`}
                      width={200}
                      height={200}
                      className="w-full h-full object-cover"
                    />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFile(index);
                      }}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <FileText className="h-8 w-8 text-gray-400 mr-3" />
                      <span className="text-sm text-gray-700 truncate">
                        {url.split('/').pop()}
                      </span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFile(index);
                      }}
                      className="text-red-500 hover:text-red-700 transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

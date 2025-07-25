"use client";

import { useEffect, useRef } from 'react';
import Uppy from '@uppy/core';
import Dashboard from '@uppy/dashboard';
import XHRUpload from '@uppy/xhr-upload';

import '@uppy/core/dist/style.min.css';
import '@uppy/dashboard/dist/style.min.css';

interface UppyImageUploadProps {
  userId: string;
  onUploadSuccess: (imageUrl: string) => void;
  onUploadError: (error: string) => void;
}

export default function UppyImageUpload({ 
  userId, 
  onUploadSuccess, 
  onUploadError 
}: UppyImageUploadProps) {
  const uppyRef = useRef<HTMLDivElement>(null);
  const uppyInstance = useRef<Uppy | null>(null);

  useEffect(() => {
    if (!uppyRef.current) return;

    // Create Uppy instance
    uppyInstance.current = new Uppy({
      restrictions: {
        maxFileSize: 5 * 1024 * 1024, // 5MB
        maxNumberOfFiles: 1,
        allowedFileTypes: ['image/*'],
      },
      autoProceed: false,
    })
    .use(Dashboard, {
      target: uppyRef.current,
      inline: true,
      width: '100%',
      height: 300,
      showProgressDetails: true,
      note: 'Images only, up to 5MB',
      proudlyDisplayPoweredByUppy: false,
    })
    .use(XHRUpload, {
      endpoint: '/api/upload/profile-image',
      formData: true,
      fieldName: 'file',
    });

    // Add userId to form data
    uppyInstance.current.on('file-added', () => {
      uppyInstance.current?.setMeta({ userId });
    });

    // Handle successful upload
    uppyInstance.current.on('upload-success', (file, response) => {
      console.log('Upload successful:', response);
      if (response.body?.imageUrl) {
        onUploadSuccess(response.body.imageUrl);
      }
    });

    // Handle upload errors
    uppyInstance.current.on('upload-error', (file, error, response) => {
      console.error('Upload error:', error);
      onUploadError(error.message || 'Upload failed');
    });

    return () => {
      uppyInstance.current?.destroy();
    };
  }, [userId, onUploadSuccess, onUploadError]);

  return <div ref={uppyRef} className="uppy-container" />;
}
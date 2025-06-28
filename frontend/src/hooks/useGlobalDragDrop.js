import { useEffect, useState } from 'react';

export const useGlobalDragDrop = (onFileDrop) => {
  const [isDragOver, setIsDragOver] = useState(false);

  useEffect(() => {
    const handleDragOver = (e) => {
      e.preventDefault();
      setIsDragOver(true);
    };

    const handleDragLeave = (e) => {
      e.preventDefault();
      // Only set to false if we're leaving the window entirely
      if (e.clientX <= 0 || e.clientY <= 0 || 
          e.clientX >= window.innerWidth || e.clientY >= window.innerHeight) {
        setIsDragOver(false);
      }
    };

    const handleDrop = (e) => {
      e.preventDefault();
      setIsDragOver(false);
      
      const files = Array.from(e.dataTransfer.files);
      const imageFiles = files.filter(file => file.type.startsWith('image/'));
      
      if (imageFiles.length > 0 && onFileDrop) {
        onFileDrop(imageFiles[0]); // Pass the first image file
      }
    };

    // Add event listeners to the document
    document.addEventListener('dragover', handleDragOver);
    document.addEventListener('dragleave', handleDragLeave);
    document.addEventListener('drop', handleDrop);

    // Cleanup
    return () => {
      document.removeEventListener('dragover', handleDragOver);
      document.removeEventListener('dragleave', handleDragLeave);
      document.removeEventListener('drop', handleDrop);
    };
  }, [onFileDrop]);

  return { isDragOver };
}; 
"use client";

import { useState } from 'react';
import Image from 'next/image';
import { ShoppingCartIcon } from 'lucide-react';

interface SafeImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  fallbackIcon?: React.ReactNode;
}

export default function SafeImage({ 
  src, 
  alt, 
  width = 400, 
  height = 400, 
  className = "",
  fallbackIcon 
}: SafeImageProps) {
  const [imageError, setImageError] = useState(false);
  const [imageSrc] = useState(src);

  // Handle image load error
  const handleError = () => {
    setImageError(true);
  };

  // If there's an error or invalid src, show fallback
  if (imageError || !imageSrc || imageSrc.includes('example.com')) {
    return (
      <div className={`bg-gray-200 rounded-lg flex items-center justify-center ${className}`}>
        {fallbackIcon || <ShoppingCartIcon className="h-8 w-8 text-gray-400" />}
      </div>
    );
  }

  return (
    <Image
      src={imageSrc}
      alt={alt}
      width={width}
      height={height}
      className={className}
      onError={handleError}
      onLoad={() => setImageError(false)}
    />
  );
}

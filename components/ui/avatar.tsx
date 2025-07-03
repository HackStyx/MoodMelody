import React, { useState } from 'react';

interface AvatarProps {
  src?: string;
  alt?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'xxl';
  fallbackText?: string;
  className?: string;
  style?: React.CSSProperties;
}

export function Avatar({ 
  src, 
  alt = "Avatar", 
  size = 'md', 
  fallbackText, 
  className = "",
  style 
}: AvatarProps) {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const sizeClasses = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-12 h-12 text-lg',
    lg: 'w-16 h-16 text-xl',
    xl: 'w-32 h-32 text-2xl',
    xxl: 'w-44 h-44 text-4xl'
  };

  const handleImageError = () => {
    setImageError(true);
  };

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  // Generate initials from fallback text or email
  const getInitials = (text?: string) => {
    if (!text) return '👤';
    
    // If it's an email, use the part before @
    const name = text.includes('@') ? text.split('@')[0] : text;
    
    const words = name.split(/[\s._-]+/).filter(word => word.length > 0);
    if (words.length === 0) return '👤';
    
    if (words.length === 1) {
      return words[0].substring(0, 2).toUpperCase();
    }
    
    return (words[0][0] + words[1][0]).toUpperCase();
  };

  const initials = getInitials(fallbackText);

  // Show fallback if no src, image error, or still loading
  const showFallback = !src || imageError || !imageLoaded;

  return (
    <div className={`relative ${sizeClasses[size]} ${className}`} style={style}>
      {/* Image */}
      {src && !imageError && (
        <img
          src={src}
          alt={alt}
          className={`absolute inset-0 w-full h-full rounded-full object-cover border-4 border-white shadow-xl bg-white transition-opacity duration-300 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          onError={handleImageError}
          onLoad={handleImageLoad}
        />
      )}
      
      {/* Fallback */}
      <div className={`absolute inset-0 w-full h-full rounded-full border-4 border-white shadow-xl bg-gradient-to-br from-indigo-400 via-pink-400 to-yellow-300 flex items-center justify-center text-white font-bold transition-opacity duration-300 ${
        showFallback ? 'opacity-100' : 'opacity-0'
      }`}>
        {initials}
      </div>
    </div>
  );
} 
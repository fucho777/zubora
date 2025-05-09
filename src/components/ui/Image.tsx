import React, { useState } from 'react';
import { cn } from '../../lib/utils';

interface ImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackSrc?: string;
}

const Image: React.FC<ImageProps> = ({
  src,
  alt,
  className,
  fallbackSrc = '/placeholder.jpg',
  ...props
}) => {
  const [error, setError] = useState(false);

  const handleError = () => {
    if (!error) {
      setError(true);
    }
  };

  return (
    <img
      src={error ? fallbackSrc : src}
      alt={alt}
      className={cn('object-cover', className)}
      onError={handleError}
      {...props}
    />
  );
};

export default Image;
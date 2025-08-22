import React from 'react';
import { motion } from 'framer-motion';

const LoadingSkeleton = ({ className = "", variant = "default" }) => {
  const baseClasses = "loading-shimmer rounded";
  
  const variants = {
    default: "h-4 w-full",
    card: "h-32 w-full",
    avatar: "h-10 w-10 rounded-full",
    button: "h-10 w-24",
    text: "h-4 w-3/4"
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`${baseClasses} ${variants[variant]} ${className}`}
    />
  );
};

export default LoadingSkeleton;

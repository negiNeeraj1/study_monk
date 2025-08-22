import React, { useState, useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';

const AnimatedCounter = ({ 
  end, 
  start = 0, 
  duration = 2, 
  prefix = '', 
  suffix = '',
  decimals = 0 
}) => {
  const [current, setCurrent] = useState(start);
  const controls = useAnimation();

  useEffect(() => {
    let startTime;
    let animationFrame;

    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / (duration * 1000), 1);
      
      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      
      const value = start + (end - start) * easeOutQuart;
      setCurrent(parseFloat(value.toFixed(decimals)));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [end, start, duration, decimals]);

  const formatNumber = (num) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toLocaleString();
  };

  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="tabular-nums"
    >
      {prefix}{formatNumber(current)}{suffix}
    </motion.span>
  );
};

export default AnimatedCounter;

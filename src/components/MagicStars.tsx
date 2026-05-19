import React from 'react';
import { motion } from 'motion/react';
import { Star } from 'lucide-react';

export const MagicStars = () => {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {[...Array(12)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ 
            opacity: 0, 
            scale: 0,
            x: '50%',
            y: '50%'
          }}
          animate={{ 
            opacity: [0, 1, 0],
            scale: [0, 1.5, 0],
            x: `${50 + (Math.random() - 0.5) * 60}%`,
            y: `${50 + (Math.random() - 0.5) * 60}%`,
            rotate: Math.random() * 360
          }}
          transition={{ 
            duration: 1.5,
            delay: Math.random() * 0.5,
            ease: "easeOut"
          }}
          className="absolute"
        >
          <Star className="w-8 h-8 text-yellow-400 fill-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.8)]" />
        </motion.div>
      ))}
    </div>
  );
};

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface Particle {
  id: number;
  x: number;
  y: number;
}

export const MouseTrail = () => {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const colors = ['#FF9F1C', '#B19CD9', '#4CAF50', '#FF6B6B', '#fde68a'];
      const newParticles = [...Array(2)].map((_, i) => ({
        id: Date.now() + i,
        x: e.clientX + (Math.random() * 20 - 10),
        y: e.clientY + (Math.random() * 20 - 10),
        color: colors[Math.floor(Math.random() * colors.length)]
      }));
      setParticles(prev => [...prev.slice(-30), ...newParticles]);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden">
      <AnimatePresence>
        {particles.map(p => (
          <motion.div
            key={p.id}
            initial={{ opacity: 1, scale: 1, rotate: 0 }}
            animate={{ opacity: 0, scale: 0, rotate: 180, y: (p as any).y + 50 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="absolute w-2 h-2"
            style={{ 
              left: p.x, 
              top: p.y,
              transform: 'translate(-50%, -50%)',
              backgroundColor: (p as any).color,
              borderRadius: Math.random() > 0.5 ? '50%' : '0%'
            }}
          >
            <div className="w-full h-full blur-[1px] shadow-[0_0_8px_currentColor]" />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

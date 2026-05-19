import React from 'react';
import { motion } from 'motion/react';
import { Volume2 } from 'lucide-react';
import { speak } from '../services/audioService';

interface AdaVoiceProps {
  currentLevel: number;
}

export default function AdaVoice({ currentLevel }: AdaVoiceProps) {
  const getTip = () => {
    switch(currentLevel) {
      case 1: return "¡Fíjate en el número rojo! Es la cantidad de partes que cortará el cuchillo mágico.";
      case 2: return "Si el número de arriba es más grande que el de abajo, ¡necesitaremos más de un pastel!";
      case 3: return "Las marcas en el tazón no cambian, solo sube el líquido azul. ¡Es como sumar!";
      default: return "¿Me necesitas?";
    }
  };

  return (
    <motion.div 
      initial={{ x: 100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="fixed bottom-32 right-10 flex flex-col items-end gap-6 z-50 pointer-events-none"
    >
      <div className="pointer-events-auto relative">
        {/* Speech Bubble */}
        <div className="bg-white border-4 border-primary p-6 rounded-[32px] shadow-2xl max-w-xs">
          <p className="text-baked-brown font-black text-lg leading-tight uppercase tracking-tighter">
            {getTip()}
          </p>
          <button 
            onClick={() => speak(getTip())}
            className="mt-4 flex items-center gap-2 text-primary font-black text-sm hover:scale-105 transition-transform"
          >
            <Volume2 className="w-5 h-5 fill-current" /> 🔊 LEER DE NUEVO
          </button>
          
          {/* Bubble Tail */}
          <div className="absolute -bottom-4 right-10 w-8 h-8 bg-white border-b-4 border-r-4 border-primary rotate-45" />
        </div>
      </div>

      {/* Ada Avatar */}
      <div className="pointer-events-auto w-32 h-32 bg-[#FFE0B2] rounded-full border-8 border-white shadow-2xl flex items-center justify-center overflow-hidden -mr-2">
        <div className="text-8xl mt-4">👩‍🍳</div>
      </div>
    </motion.div>
  );
}

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  PlayCircle, 
  RotateCcw, 
  ChevronRight, 
  Undo2,
  CheckCircle2,
  Star,
  IceCream,
  Plus
} from 'lucide-react';
import { speak, playSuccessSound } from '../services/audioService.ts';

interface Level5Props {
  onComplete: (stars: number) => void;
  setProgress: (val: number) => void;
}

const MISSIONS = [
  { target: "1/2", text: "¡Heladería! Sirve media bola de helado (1/2) en el cono.", n: 1, d: 2 },
  { target: "1/4", text: "Ahora un poquito, solo 1 cuarto (1/4).", n: 1, d: 4 },
  { target: "3/4", text: "Tres cuartos de helado. ¡Qué rico!", n: 3, d: 4 },
  { target: "2/2", text: "¡Un helado completo! Sirve 2 medios.", n: 2, d: 2 },
  { target: "1/3", text: "Sirve 1 tercio de helado de fresa.", n: 1, d: 3 },
  { target: "2/3", text: "¡Más! Queremos 2 tercios hoy.", n: 2, d: 3 },
  { target: "3/3", text: "¡Bolas triples! 3 tercios por favor.", n: 3, d: 3 },
  { target: "2/4", text: "Sirve 2 cuartos. ¿Sabías que es lo mismo que media bola?", n: 2, d: 4 },
  { target: "4/4", text: "Cuatro cuartos. ¡Helado gigante!", n: 4, d: 4 },
  { target: "1/1", text: "¡El último! Sirve 1 unidad completa de helado.", n: 1, d: 1 }
];

export default function Level5({ onComplete, setProgress }: Level5Props) {
  const [missionIndex, setMissionIndex] = useState(0);
  const [currentN, setCurrentN] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errors, setErrors] = useState(0);
  const [showSummary, setShowSummary] = useState(false);

  const currentMission = MISSIONS[missionIndex];

  useEffect(() => {
    speak(currentMission.text);
  }, [missionIndex]);

  const addScoop = () => {
    if (currentN < currentMission.n) {
      const newVal = currentN + 1;
      setCurrentN(newVal);
      if (newVal === currentMission.n) {
        setShowSuccess(true);
        playSuccessSound();
        speak("¡Mmm, helado perfecto!");
        setProgress(40 + ((missionIndex + 1) / MISSIONS.length) * 10);
      }
    } else {
      speak("¡Se va a caer el helado! Ya hay suficiente.");
    }
  };

  const nextMission = () => {
    if (missionIndex < MISSIONS.length - 1) {
      setMissionIndex(prev => prev + 1);
      setCurrentN(0);
      setShowSuccess(false);
    } else {
      setShowSummary(true);
      const stars = errors === 0 ? 3 : errors < 3 ? 2 : 1;
      speak(`¡Helado listo! Ganaste ${stars} estrellas.`);
    }
  };

  const reset = () => {
    setCurrentN(0);
    setShowSuccess(false);
  };

  return (
    <div className="w-full max-w-5xl flex flex-col items-center gap-10 px-10">
      <AnimatePresence>
        {showSummary && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-white rounded-[40px] p-10 max-w-lg w-full text-center shadow-2xl border-8 border-pink-100"
            >
              <div className="text-6xl mb-4">🍦</div>
              <h3 className="text-3xl font-black text-baked-brown mb-4">¡Maestría en Helados!</h3>
              <div className="bg-pink-50 p-6 rounded-3xl mb-8">
                <p className="text-xl font-bold text-baked-brown/80 mb-4">
                  "Cuando comparamos fracciones con el mismo denominador, ¡la más grande es la que tiene el número de arriba (numerador) mayor! Más bolas, más helado."
                </p>
                <div className="flex justify-center gap-2">
                  {[1, 2, 3].map(s => (
                    <Star 
                      key={s} 
                      className={`w-12 h-12 ${s <= (errors === 0 ? 3 : errors < 3 ? 2 : 1) ? 'fill-yellow-400 text-yellow-400' : 'text-stone-200'}`} 
                    />
                  ))}
                </div>
              </div>
              <button 
                onClick={() => onComplete(errors === 0 ? 3 : errors < 3 ? 2 : 1)}
                className="btn-success w-full py-5 text-2xl font-black"
              >
                ¡DELICIOSO!
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <div className="glass-morphism p-8 text-center max-w-2xl w-full border-8 border-dashed border-pink-200 bg-pink-50/30">
        <h3 className="text-2xl font-black text-pink-600 tracking-tighter uppercase mb-4">HELADERÍA MÁGICA 🍦</h3>
        <div className="flex items-center justify-center gap-8 mb-6">
           <div className="flex flex-col items-center p-4 bg-white rounded-3xl border-4 border-pink-400 shadow-lg">
             <span className="text-4xl font-black text-pink-600 border-b-2 border-baked-brown leading-none">{currentMission.n}</span>
             <span className="text-4xl font-black text-pink-400 leading-none pt-1">{currentMission.d}</span>
           </div>
        </div>
        <button onClick={() => speak(currentMission.text)} className="btn-primary bg-pink-500 border-pink-400">
          <PlayCircle className="w-8 h-8 fill-current" /> ESCUCHAR A ADA
        </button>
      </div>

      <div className="flex flex-col items-center gap-8">
        <div className="relative w-64 h-80 flex flex-col items-center justify-end">
          {/* Scoops */}
          <div className="mb-[-20px] transition-all duration-500 flex flex-col-reverse items-center">
            {[...Array(currentMission.n)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ scale: 0, y: -50 }}
                animate={{ 
                  scale: i < currentN ? 1 : 0.8, 
                  opacity: i < currentN ? 1 : 0.2,
                  y: 0 
                }}
                className="w-32 h-16 rounded-t-full rounded-b-lg border-4 border-pink-200 shadow-inner"
                style={{ backgroundColor: i % 2 === 0 ? '#F8BBD0' : '#E1BEE7', marginBottom: '-10px' }}
              />
            ))}
          </div>
          {/* Cone */}
          <div className="w-32 h-40 bg-orange-200 rounded-b-full border-x-8 border-b-8 border-orange-300 relative overflow-hidden">
            <div className="absolute inset-0 opacity-20 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,#000_10px,#000_12px)]" />
          </div>

          {!showSuccess && (
            <button 
              onClick={addScoop}
              className="absolute top-0 right-[-100px] w-24 h-24 bg-pink-500 text-white rounded-full border-4 border-white shadow-xl flex flex-col items-center justify-center animate-bounce"
            >
              <Plus className="w-8 h-8" />
              <span className="text-xs font-black">SERVIR</span>
            </button>
          )}
        </div>

        <div className="flex gap-4">
           <button onClick={reset} className="btn-magic"><Undo2 /> REINICIAR</button>
           {showSuccess && (
             <button onClick={nextMission} className="btn-success">
               ¡SIGUIENTE HELADO! <ChevronRight />
             </button>
           )}
        </div>
      </div>
    </div>
  );
}

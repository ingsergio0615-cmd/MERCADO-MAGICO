import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  PlayCircle, 
  RotateCcw, 
  ChevronRight, 
  Undo2,
  CheckCircle2,
  Star,
  Package
} from 'lucide-react';
import { speak, playSuccessSound } from '../services/audioService.ts';

interface Level9Props {
  onComplete: (stars: number) => void;
  setProgress: (val: number) => void;
}

const MISSIONS = [
  { target: 1, type: "sandwich", text: "¡La Lonchera! Empaca 1 sandwich entero (1/1).", den: 1 },
  { target: 2, type: "manzana", text: "Ahora corta la manzana en dos y empaca 1 mitad (1/2).", den: 2 },
  { target: 3, type: "naranja", text: "Empaca 3 cuartos (3/4) de la naranja para el postre.", den: 4 },
  { target: 4, type: "galleta", text: "¡Galletas mágicas! Sirve 4 cuartos, que es igual a una galleta completa.", den: 4 },
  { target: 2, type: "queso", text: "Dos tercios (2/3) de queso para tener fuerza.", den: 3 },
  { target: 1, type: "pera", text: "Solo 1 cuarto (1/4) de pera, para un bocado pequeño.", den: 4 },
  { target: 3, type: "pan", text: "Tres quintos (3/5) del pan artesanal.", den: 5 },
  { target: 5, type: "uvas", text: "¡Muchas uvas! 5 octavos (5/8) de racimo.", den: 8 },
  { target: 6, type: "jugo", text: "6 décimos (6/10) de tu bebida favorita.", den: 10 },
  { target: 1, type: "fruta", text: "Para terminar, empaca 1 tercio de la fruta mixta.", den: 3 }
];

export default function Level9({ onComplete, setProgress }: Level9Props) {
  const [missionIndex, setMissionIndex] = useState(0);
  const [currentCount, setCurrentCount] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errors, setErrors] = useState(0);
  const [showSummary, setShowSummary] = useState(false);

  const currentMission = MISSIONS[missionIndex];

  useEffect(() => {
    speak(currentMission.text);
  }, [missionIndex]);

  const addItem = () => {
    if (currentCount < currentMission.target) {
      const newVal = currentCount + 1;
      setCurrentCount(newVal);
      if (newVal === currentMission.target) {
        setShowSuccess(true);
        playSuccessSound();
        speak("¡Merienda empacada!");
        setProgress(80 + ((missionIndex + 1) / MISSIONS.length) * 10);
      }
    } else {
      setErrors(prev => prev + 1);
      speak("¡No cabe más en ese compartimento!");
    }
  };

  const nextMission = () => {
    if (missionIndex < MISSIONS.length - 1) {
      setMissionIndex(prev => prev + 1);
      setCurrentCount(0);
      setShowSuccess(false);
    } else {
      setShowSummary(true);
      const stars = errors === 0 ? 3 : errors < 3 ? 2 : 1;
      speak(`¡Lonchera lista! Ganaste ${stars} estrellas.`);
    }
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
              className="bg-white rounded-[40px] p-10 max-w-lg w-full text-center shadow-2xl border-8 border-teal-100"
            >
              <div className="text-6xl mb-4">🍱</div>
              <h3 className="text-3xl font-black text-baked-brown mb-4">¡Merienda Nutritiva!</h3>
              <div className="bg-teal-50 p-6 rounded-3xl mb-8">
                <p className="text-xl font-bold text-baked-brown/80 mb-4">
                  "¡La merienda está lista! Aprendiste que empacar una fracción es como repartir tesoros en compartimentos de tu lonchera."
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
                ¡A COMER!
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <div className="glass-morphism p-8 text-center max-w-2xl w-full border-8 border-dashed border-teal-200 bg-teal-50/30">
        <h3 className="text-2xl font-black text-teal-600 tracking-tighter uppercase mb-4">LA LONCHERA NUTRITIVA 🍱</h3>
        <div className="flex items-center justify-center gap-8 mb-6">
           <div className="flex flex-col items-center p-4 bg-white rounded-3xl border-4 border-teal-400 shadow-lg">
             <span className="text-4xl font-black text-teal-600 border-b-2 border-teal-600 leading-none">{currentMission.target}</span>
             <span className="text-4xl font-black text-teal-400 leading-none pt-1">{currentMission.den}</span>
           </div>
        </div>
        <button onClick={() => speak(currentMission.text)} className="btn-primary bg-teal-500 border-teal-400 text-white">
          <PlayCircle className="w-8 h-8 fill-current" /> ESCUCHAR
        </button>
      </div>

      <div className="flex flex-col md:flex-row items-center gap-12 w-full justify-center">
        {/* Bento Box */}
        <div className="w-80 h-96 bg-teal-100 rounded-[40px] border-8 border-teal-200 p-6 flex flex-wrap gap-4 shadow-xl relative">
           <div className="w-full h-1/2 bg-white/40 rounded-2xl border-4 border-dashed border-teal-300 flex items-center justify-center relative overflow-hidden">
             <div className="grid grid-cols-2 gap-2 p-4 w-full h-full">
                {[...Array(currentCount)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ scale: 0, rotate: -15 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring" }}
                    className="flex items-center justify-center text-5xl"
                  >
                    {currentMission.type === 'sandwich' ? '🥪' : 
                     currentMission.type === 'manzana' ? '🍎' : 
                     currentMission.type === 'naranja' ? '🍊' : 
                     currentMission.type === 'galleta' ? '🍪' : '🍓'}
                  </motion.div>
                ))}
             </div>
           </div>
           <div className="w-full h-1/3 bg-white/40 rounded-2xl border-4 border-dashed border-teal-300 flex items-center justify-center">
             <p className="text-teal-400 font-black text-xs uppercase">Otros alimentos</p>
           </div>
        </div>

        {/* Action Button */}
        {!showSuccess && (
          <button 
            onClick={addItem}
            className="w-40 h-40 bg-teal-500 text-white rounded-full border-8 border-white shadow-2xl flex flex-col items-center justify-center animate-pulse hover:scale-105 transition-transform"
          >
            <Package className="w-12 h-12 mb-2" />
            <span className="font-black">EMPACA</span>
            <span className="text-xs opacity-80">1/{currentMission.den}</span>
          </button>
        )}
      </div>

      <div className="flex gap-4">
         {showSuccess && (
           <button onClick={nextMission} className="btn-success px-12 py-6 text-2xl font-black">
             ¡SIGUIENTE TUPPER! <ChevronRight className="w-10 h-10" />
           </button>
         )}
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  PlayCircle, 
  RotateCcw, 
  ChevronRight, 
  Undo2,
  CheckCircle2,
  Star,
  Flower2
} from 'lucide-react';
import { speak, playSuccessSound } from '../services/audioService.ts';

interface Level8Props {
  onComplete: (stars: number) => void;
  setProgress: (val: number) => void;
}

const MISSIONS = [
  { target: 2, total: 3, text: "Floristería Mágica. Pon 2 tercios (2/3) de las flores en el jarrón azul." },
  { target: 1, total: 2, text: "Solo la mitad de las margaritas, 1 de cada 2 (1/2)." },
  { target: 3, total: 4, text: "Pon 3 cuartos (3/4) de las rosas en el jarrón." },
  { target: 4, total: 5, text: "Un ramo más grande: 4 quintos (4/5) del total." },
  { target: 2, total: 4, text: "Pon 2 de 4. ¡Eso es exactamente la mitad!" },
  { target: 1, total: 5, text: "Solo una flor especial, 1 quinto del total." },
  { target: 5, total: 6, text: "Casi todas: pon 5 sextos en el jarrón." },
  { target: 3, total: 8, text: "Un ramo artístico: 3 octavos de las flores." },
  { target: 9, total: 10, text: "¡Muchísimas flores! Necesito 9 décimos para el banquete." },
  { target: 5, total: 5, text: "¡Todas las flores! 5 de cada 5 (5/5)." }
];

export default function Level8({ onComplete, setProgress }: Level8Props) {
  const [missionIndex, setMissionIndex] = useState(0);
  const [flowersInVase, setFlowersInVase] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errors, setErrors] = useState(0);
  const [showSummary, setShowSummary] = useState(false);

  const currentMission = MISSIONS[missionIndex];

  useEffect(() => {
    speak(currentMission.text);
  }, [missionIndex]);

  const addFlower = () => {
    if (flowersInVase < currentMission.target) {
      const newVal = flowersInVase + 1;
      setFlowersInVase(newVal);
      if (newVal === currentMission.target) {
        setShowSuccess(true);
        playSuccessSound();
        speak("¡Qué ramo tan hermoso!");
        setProgress(70 + ((missionIndex + 1) / MISSIONS.length) * 10);
      }
    } else {
      setErrors(prev => prev + 1);
      speak("¡Cuidado! Si pones más, el jarrón se verá muy lleno.");
    }
  };

  const nextMission = () => {
    if (missionIndex < MISSIONS.length - 1) {
      setMissionIndex(prev => prev + 1);
      setFlowersInVase(0);
      setShowSuccess(false);
    } else {
      setShowSummary(true);
      const stars = errors === 0 ? 3 : errors < 3 ? 2 : 1;
      speak(`¡Floristería completada! Ganaste ${stars} estrellas.`);
    }
  };

  const reset = () => {
    setFlowersInVase(0);
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
              className="bg-white rounded-[40px] p-10 max-w-lg w-full text-center shadow-2xl border-8 border-rose-100"
            >
              <div className="text-6xl mb-4">🌸</div>
              <h3 className="text-3xl font-black text-baked-brown mb-4">¡Maestra Florista!</h3>
              <div className="bg-rose-50 p-6 rounded-3xl mb-8">
                <p className="text-xl font-bold text-baked-brown/80 mb-4">
                  "¡Las flores nos enseñan a repartir! 3/4 de un ramo significa que de cada 4 flores, tomamos 3 para el jarrón. ¡Es muy divertido!"
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
                ¡ME ENCANTA!
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <div className="glass-morphism p-8 text-center max-w-2xl w-full border-8 border-dashed border-rose-200 bg-rose-50/30">
        <h3 className="text-2xl font-black text-rose-600 tracking-tighter uppercase mb-4">FLORISTERÍA DE ADA 🌸</h3>
        <div className="flex items-center justify-center gap-8 mb-6">
           <div className="flex flex-col items-center p-4 bg-white rounded-3xl border-4 border-rose-400 shadow-lg">
             <span className="text-4xl font-black text-rose-600 border-b-2 border-rose-600 leading-none">{currentMission.target}</span>
             <span className="text-4xl font-black text-rose-400 leading-none pt-1">{currentMission.total}</span>
           </div>
        </div>
        <button onClick={() => speak(currentMission.text)} className="btn-primary bg-rose-500 border-rose-400">
          <PlayCircle className="w-8 h-8 fill-current" /> ESCUCHAR
        </button>
      </div>

      <div className="flex flex-col md:flex-row items-center gap-12 w-full justify-center">
        {/* Available Flowers */}
        <div className="flex flex-col items-center gap-4">
           <p className="text-baked-brown/60 font-black uppercase text-sm">Flores en Mesa</p>
           <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 bg-white/40 p-6 rounded-[32px] border-4 border-white shadow-inner min-h-[200px]">
             {[...Array(currentMission.total - flowersInVase)].map((_, i) => (
               <motion.button
                 key={`avail-${i}`}
                 whileHover={{ scale: 1.1 }}
                 whileTap={{ scale: 0.9 }}
                 onClick={addFlower}
                 className="w-16 h-16 bg-white rounded-full border-2 border-rose-100 flex items-center justify-center text-3xl shadow-sm"
               >
                 🌹
               </motion.button>
             ))}
           </div>
        </div>

        {/* Vase */}
        <div className="flex flex-col items-center gap-4">
           <p className="text-baked-brown/60 font-black uppercase text-sm">Tu Jarrón</p>
           <div className="relative w-48 h-64 flex flex-col items-center justify-end">
             {/* Flowers in Vase */}
             <div className="flex flex-wrap justify-center gap-1 absolute bottom-24 p-2 w-full">
                {[...Array(flowersInVase)].map((_, i) => (
                  <motion.div
                    key={`vase-${i}`}
                    initial={{ scale: 0, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="text-4xl"
                  >
                    🌸
                  </motion.div>
                ))}
             </div>
             {/* Vase Body */}
             <div className="w-32 h-32 bg-blue-400 rounded-b-3xl border-x-8 border-b-8 border-blue-500 relative shadow-lg">
                <div className="absolute inset-0 bg-white/20 blur-sm w-4 h-full left-2" />
             </div>
           </div>
        </div>
      </div>

      <div className="flex gap-4">
         <button onClick={reset} className="btn-magic"><Undo2 /> REINICIAR</button>
         {showSuccess && (
           <button onClick={nextMission} className="btn-success">
             ¡SIGUIENTE RAMO! <ChevronRight />
           </button>
         )}
      </div>
    </div>
  );
}

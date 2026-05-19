import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  PlayCircle, 
  ChevronRight, 
  Undo2,
  Trophy,
  Star
} from 'lucide-react';
import { speak, playSuccessSound } from '../services/audioService.ts';

interface Level7Props {
  onComplete: (stars: number) => void;
  setProgress: (val: number) => void;
}

const MISSIONS = [
  { target: 1, total: 2, text: "¡Última parada! La Juguetería. Hay 2 juguetes, uno es un oso. ¿Qué fracción es 1 de 2?" },
  { target: 3, total: 4, text: "Había 4 juguetes, 3 se han perdido. ¿Qué fracción son los que faltan?" },
  { target: 1, total: 3, text: "De 3 pelotas, 1 es roja. ¿Qué fracción es la roja?" },
  { target: 2, total: 5, text: "5 muñecas, 2 tienen sombrero. ¿Qué fracción tienen sombrero?" },
  { target: 4, total: 6, text: "6 piezas de lego, 4 son azules." },
  { target: 1, total: 4, text: "De 4 coches, 1 es rápido." },
  { target: 5, total: 8, text: "8 canicas, 5 son verdes." },
  { target: 1, total: 10, text: "¡10 juguetes! Solo uno es para Ada." },
  { target: 9, total: 10, text: "9 de cada 10 niños aman este mercado." },
  { target: 10, total: 10, text: "¡Prueba final! 10 de 10 juguetes están listos. ¡Eres la mejor!" }
];

export default function Level7({ onComplete, setProgress }: Level7Props) {
  const [missionIndex, setMissionIndex] = useState(0);
  const [inputN, setInputN] = useState<number | null>(null);
  const [inputD, setInputD] = useState<number | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errors, setErrors] = useState(0);
  const [showSummary, setShowSummary] = useState(false);

  const currentMission = MISSIONS[missionIndex];

  useEffect(() => {
    speak(currentMission.text);
  }, [missionIndex]);

  const check = () => {
    if (inputN === currentMission.target && inputD === currentMission.total) {
      setShowSuccess(true);
      playSuccessSound();
      speak("¡Matemática perfecta! Eres una maestra de las fracciones.");
      setProgress(60 + ((missionIndex + 1) / MISSIONS.length) * 10);
    } else {
      setErrors(prev => prev + 1);
      speak("¡Uy! Revisa los números. Cuenta bien los juguetes.");
    }
  };

  const nextMission = () => {
    if (missionIndex < MISSIONS.length - 1) {
      setMissionIndex(prev => prev + 1);
      setInputN(null);
      setInputD(null);
      setShowSuccess(false);
    } else {
      setShowSummary(true);
      const stars = errors === 0 ? 3 : errors < 3 ? 2 : 1;
      speak(`¡Juguetería completada! Ganaste ${stars} estrellas.`);
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
              className="bg-white rounded-[40px] p-10 max-w-lg w-full text-center shadow-2xl border-8 border-purple-100"
            >
              <div className="text-6xl mb-4">🧸</div>
              <h3 className="text-3xl font-black text-baked-brown mb-4">¡Gran Maestra!</h3>
              <div className="bg-purple-50 p-6 rounded-3xl mb-8">
                <p className="text-xl font-bold text-baked-brown/80 mb-4">
                  "¡Las fracciones también sirven para contar grupos! Como 1/2 de 4 pelotas son 2 pelotas. ¡Mira qué fácil!"
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
                ¡ENTENDIDO!
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <div className="glass-morphism p-8 text-center max-w-2xl w-full border-8 border-dashed border-purple-200 bg-purple-50/30">
        <h3 className="text-2xl font-black text-purple-600 tracking-tighter uppercase mb-4">JUGUETERÍA FINAL 🧸</h3>
        <p className="text-xl font-bold mb-6 text-baked-brown">{currentMission.text}</p>
        <button onClick={() => speak(currentMission.text)} className="btn-primary bg-purple-500 border-purple-400">
          <PlayCircle className="w-8 h-8 fill-current" /> ESCUCHAR
        </button>
      </div>

      <div className="flex flex-col md:flex-row items-center gap-12">
        {/* Toys Visual */}
        <div className="flex flex-wrap gap-4 max-w-xs justify-center p-8 bg-white rounded-[40px] shadow-inner border-4 border-purple-100">
           {[...Array(currentMission.total)].map((_, i) => (
             <motion.div
               key={i}
               initial={{ scale: 0 }}
               animate={{ scale: 1 }}
               className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${i < currentMission.target ? 'bg-purple-500' : 'bg-stone-200'}`}
             >
               {i < currentMission.target ? '🎁' : '📦'}
             </motion.div>
           ))}
        </div>

        {/* Input area */}
        <div className="flex flex-col items-center gap-4 bg-white p-8 rounded-[40px] shadow-xl border-4 border-purple-200">
          <input 
            type="number" 
            placeholder="?"
            className="w-24 h-24 text-center text-5xl font-black text-purple-600 bg-purple-50 rounded-2xl border-4 border-purple-200 outline-none focus:border-purple-500"
            value={inputN || ''}
            onChange={(e) => setInputN(parseInt(e.target.value))}
          />
          <div className="w-32 h-3 bg-purple-600 rounded-full" />
          <input 
            type="number" 
            placeholder="?"
            className="w-24 h-24 text-center text-5xl font-black text-purple-600 bg-purple-50 rounded-2xl border-4 border-purple-200 outline-none focus:border-purple-500"
            value={inputD || ''}
            onChange={(e) => setInputD(parseInt(e.target.value))}
          />
          {!showSuccess && (
            <button onClick={check} className="mt-4 btn-primary bg-purple-500 border-purple-300 px-8">ORDENAR</button>
          )}
        </div>
      </div>

      {showSuccess && (
        <button onClick={nextMission} className="btn-success text-2xl px-12 py-5 font-black flex items-center gap-4">
          {missionIndex < MISSIONS.length - 1 ? '¡SIGUIENTE JUGUETE!' : '¡MERCADO COMPLETADO!'} <Trophy />
        </button>
      )}
    </div>
  );
}

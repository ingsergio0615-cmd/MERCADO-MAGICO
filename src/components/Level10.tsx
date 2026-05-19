import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  PlayCircle, 
  RotateCcw, 
  ChevronRight, 
  Undo2,
  CheckCircle2,
  Star,
  Gem
} from 'lucide-react';
import { speak, playSuccessSound } from '../services/audioService.ts';

interface Level10Props {
  onComplete: (stars: number) => void;
  setProgress: (val: number) => void;
}

const MISSIONS = [
  { target: "1/2", options: ["2/4", "3/4"], text: "¡Gran Bazar! Busca el diamante que pesa igual a 1 medio." },
  { target: "2/3", options: ["4/6", "1/3"], text: "Ahora busca 2 tercios en estas gemas expertas." },
  { target: "3/4", options: ["6/8", "1/2"], text: "Tres cuartos... ¿Cuál de estas es igual?" },
  { target: "1/1", options: ["5/5", "2/4"], text: "¡Un cristal completo! 1 entero." },
  { n: 3, d: 2, type: "input", text: "Si tengo 3 diamantes y cada caja tiene 2 espacios... ¿Cuál es la fracción? (3 arriba, 2 abajo)" },
  { n: 1, d: 4, type: "input", text: "Solo una pizca de polvo de estrellas: 1 de 4 partes." },
  { n: 5, d: 4, type: "input", text: "Cinco cuartos: una gema entera y un pedacito más." },
  { target: "2/2", options: ["1/1", "1/2"], text: "Dos medios es lo mismo que..." },
  { target: "1/3", options: ["2/6", "3/9"], text: "Busca los 1 tercios gemelos. (¡Aquí hay dos correctas, toca cualquiera!)" },
  { target: "Completo", type: "finish", text: "¡Increíble! Has dominado todas las tiendas del mercado." }
];

export default function Level10({ onComplete, setProgress }: Level10Props) {
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

  const handleOption = (opt: string) => {
    const isEquivalent = (target: string, o: string) => {
      const [tn, td] = target.split('/').map(Number);
      const [on, od] = o.split('/').map(Number);
      return tn / td === on / od;
    };

    if (isEquivalent(currentMission.target!, opt)) {
      success();
    } else {
      setErrors(prev => prev + 1);
      speak("¡Casi! Prueba con otro diamante.");
    }
  };

  const handleInput = () => {
    if (inputN === currentMission.n && inputD === currentMission.d) {
      success();
    } else {
      setErrors(prev => prev + 1);
      speak("Revisa los números, ¡tú puedes!");
    }
  };

  const success = () => {
    setShowSuccess(true);
    playSuccessSound();
    speak("¡Brillante!");
    setProgress(90 + ((missionIndex + 1) / MISSIONS.length) * 10);
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
      speak(`¡Gran Bazar completado! Eres una gema de las matemáticas. Ganaste ${stars} estrellas.`);
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
              className="bg-white rounded-[40px] p-10 max-w-lg w-full text-center shadow-2xl border-8 border-indigo-100"
            >
              <div className="text-6xl mb-4">💎</div>
              <h3 className="text-3xl font-black text-baked-brown mb-4">¡Maestra de Gemas!</h3>
              <div className="bg-indigo-50 p-6 rounded-3xl mb-8">
                <p className="text-xl font-bold text-baked-brown/80 mb-4">
                  "¡Eres una gema de las matemáticas! Has dominado el arte de las fracciones, equivalencias y grupos en todo el Mercado Mágico."
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
                ¡VIAJE COMPLETADO!
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <div className="glass-morphism p-8 text-center max-w-2xl w-full border-8 border-dashed border-indigo-200 bg-indigo-50/30">
        <h3 className="text-2xl font-black text-indigo-600 tracking-tighter uppercase mb-4">EL GRAN BAZAR DE CRISTAL 💎</h3>
        <p className="text-xl font-bold text-baked-brown mb-6">{currentMission.text}</p>
        <button onClick={() => speak(currentMission.text)} className="btn-primary bg-indigo-500 border-indigo-400">
          <PlayCircle className="w-8 h-8 fill-current" /> ESCUCHAR
        </button>
      </div>

      <div className="flex justify-center w-full min-h-[300px]">
        {currentMission.type === 'input' ? (
          <div className="flex flex-col items-center gap-4 bg-white p-10 rounded-[40px] shadow-2xl border-4 border-indigo-100">
             <input 
               type="number" 
               className="w-24 h-24 text-center text-4xl font-black text-indigo-600 bg-indigo-50 rounded-2xl border-4 border-indigo-200"
               placeholder="N"
               value={inputN || ''}
               onChange={(e) => setInputN(parseInt(e.target.value))}
             />
             <div className="w-32 h-2 bg-indigo-600 rounded-full" />
             <input 
               type="number" 
               className="w-24 h-24 text-center text-4xl font-black text-indigo-600 bg-indigo-50 rounded-2xl border-4 border-indigo-200"
               placeholder="D"
               value={inputD || ''}
               onChange={(e) => setInputD(parseInt(e.target.value))}
             />
             {!showSuccess && <button onClick={handleInput} className="mt-4 btn-primary bg-indigo-500">TASAR GEMAS</button>}
          </div>
        ) : currentMission.type === 'finish' ? (
          <div className="flex flex-col items-center gap-6">
            <motion.div 
              animate={{ rotate: 360 }} 
              transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
              className="text-9xl"
            >
              🌌
            </motion.div>
            <button onClick={onComplete} className="btn-success text-2xl px-12 py-6">¡TERMINAR MI VIAJE!</button>
          </div>
        ) : (
          <div className="flex gap-8">
            {currentMission.options?.map((opt, i) => (
              <motion.button
                key={i}
                whileHover={{ scale: 1.1 }}
                onClick={() => handleOption(opt)}
                disabled={showSuccess}
                className="w-48 h-48 bg-white rounded-[40px] border-4 border-dashed border-indigo-200 flex flex-col items-center justify-center shadow-lg hover:border-indigo-400"
              >
                <Gem className="w-12 h-12 text-indigo-400 mb-2" />
                <span className="text-3xl font-black text-indigo-600">{opt}</span>
              </motion.button>
            ))}
          </div>
        )}
      </div>

      {showSuccess && currentMission.type !== 'finish' && (
        <button onClick={nextMission} className="btn-success text-xl px-10 py-4 font-black">
          SIGUIENTE SECRETO <ChevronRight />
        </button>
      )}
    </div>
  );
}

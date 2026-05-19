import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  PlayCircle, 
  RotateCcw, 
  ChevronRight, 
  Undo2,
  CheckCircle2,
  Star
} from 'lucide-react';
import { speak, playSuccessSound } from '../services/audioService.ts';

interface Level4Props {
  onComplete: (stars: number) => void;
  setProgress: (val: number) => void;
}

const MISSIONS = [
  { target: "1/2", options: ["2/4", "1/3", "4/8"], text: "¡Bienvenida a la Panadería! Aquí hacemos panes mágicos que se ven diferentes pero pesan lo mismo. ¿Puedes encontrar qué bandeja tiene la misma cantidad que 1 medio?" },
  { target: "1/4", options: ["2/8", "1/2", "4/16"], text: "¡Excelente! Ahora busca qué bandeja es igual a 1 cuarto." },
  { target: "2/2", options: ["4/4", "1/2", "3/4"], text: "¡Pan entero! ¿Qué otra bandeja tiene un pan entero?" },
  { target: "1/3", options: ["2/6", "1/2", "2/4"], text: "Busca el equivalente a 1 tercio. ¡Fíjate bien!" },
  { target: "2/3", options: ["4/6", "1/3", "2/4"], text: "Buscamos 2 tercios ahora." },
  { target: "2/4", options: ["1/2", "1/4", "3/4"], text: "Dos cuartos es lo mismo que... ¡Adivina!" },
  { target: "3/4", options: ["6/8", "1/2", "2/4"], text: "Tres cuartos. ¿Dónde hay otro igual?" },
  { target: "4/6", options: ["2/3", "1/2", "3/6"], text: "Cuatro sextos. ¡Esta es difícil!" },
  { target: "1/5", options: ["2/10", "1/2", "1/3"], text: "Un quinto. Busca su gemelo." },
  { target: "5/5", options: ["10/10", "1/2", "1/1"], text: "¡El gran maestro panadero! Busca la bandeja que sea una unidad completa." }
];

export default function Level4({ onComplete, setProgress }: Level4Props) {
  const [missionIndex, setMissionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errors, setErrors] = useState(0);
  const [showSummary, setShowSummary] = useState(false);

  const currentMission = MISSIONS[missionIndex];

  useEffect(() => {
    speak(currentMission.text);
  }, [missionIndex]);

  const handleSelect = (option: string) => {
    // Basic equivalence check (simplified for the demo logic)
    const isEquivalent = (target: string, opt: string) => {
      const [tn, td] = target.split('/').map(Number);
      const [on, od] = opt.split('/').map(Number);
      return tn / td === on / od;
    };

    setSelectedOption(option);

    if (isEquivalent(currentMission.target, option)) {
      setShowSuccess(true);
      playSuccessSound();
      speak("¡Increíble! Son exactamente iguales aunque tengan más cortes.");
      setProgress(30 + ((missionIndex + 1) / MISSIONS.length) * 10);
    } else {
      setErrors(prev => prev + 1);
      speak("¡Oh! Esas no pesan lo mismo. ¡Mira bien los dibujos!");
      setTimeout(() => setSelectedOption(null), 1000);
    }
  };

  const nextMission = () => {
    if (missionIndex < MISSIONS.length - 1) {
      setMissionIndex(prev => prev + 1);
      setSelectedOption(null);
      setShowSuccess(false);
    } else {
      setShowSummary(true);
      const stars = errors === 0 ? 3 : errors < 3 ? 2 : 1;
      speak(`¡Panadería completada! Ganaste ${stars} estrellas.`);
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
              className="bg-white rounded-[40px] p-10 max-w-lg w-full text-center shadow-2xl border-8 border-orange-100"
            >
              <div className="text-6xl mb-4">🥐</div>
              <h3 className="text-3xl font-black text-baked-brown mb-4">¡Maestría Panadera!</h3>
              <div className="bg-orange-50 p-6 rounded-3xl mb-8">
                <p className="text-xl font-bold text-baked-brown/80 mb-4">
                  "¡Las fracciones equivalentes son como gemelas mágicas: se ven diferentes pero valen lo mismo! 1/2 es exactamente igual a 2/4."
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
                ¡LO COMPRENDO!
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <div className="glass-morphism p-8 text-center max-w-2xl w-full border-8 border-dashed border-primary/20">
        <h3 className="text-2xl font-black text-baked-brown tracking-tighter uppercase mb-4">PANADERÍA DE EQUIVALENCIAS 🥐</h3>
        <div className="flex items-center justify-center gap-8 mb-6">
           <div className="flex flex-col items-center p-4 bg-white rounded-3xl border-4 border-numerator shadow-lg">
             <span className="text-sm font-black text-numerator mb-1 uppercase">BUSCAR:</span>
             <span className="text-6xl font-black text-numerator border-b-2 border-baked-brown leading-none">{currentMission.target.split('/')[0]}</span>
             <span className="text-6xl font-black text-denominator leading-none pt-1">{currentMission.target.split('/')[1]}</span>
           </div>
        </div>
        <button onClick={() => speak(currentMission.text)} className="btn-primary">
          <PlayCircle className="w-8 h-8 fill-current" /> ESCUCHAR A ADA
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
        {currentMission.options.map((opt, i) => {
          const [n, d] = opt.split('/').map(Number);
          const isSelected = selectedOption === opt;
          
          return (
            <motion.button
              key={opt}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleSelect(opt)}
              disabled={showSuccess}
              className={`p-6 rounded-[40px] border-8 transition-all flex flex-col items-center gap-4 ${
                isSelected 
                  ? 'bg-success/10 border-success shadow-xl' 
                  : 'bg-white/50 border-white hover:border-primary/30 shadow-md'
              }`}
            >
              {/* Visual implementation of equivalence (Circle split into D parts, N colored) */}
              <div className="relative w-40 h-40 bg-baked-brown/5 rounded-full overflow-hidden border-4 border-baked-brown/10">
                  {[...Array(d)].map((_, idx) => (
                    <div 
                      key={idx}
                      className={`absolute inset-0 transition-opacity duration-500 ${idx < n ? 'bg-numerator/40' : 'bg-transparent'}`}
                      style={{ 
                        clipPath: `polygon(50% 50%, ${50 + 50 * Math.cos((2 * Math.PI * idx) / d)}% ${50 + 50 * Math.sin((2 * Math.PI * idx) / d)}%, ${50 + 50 * Math.cos((2 * Math.PI * (idx + 1)) / d)}% ${50 + 50 * Math.sin((2 * Math.PI * (idx + 1)) / d)}%)`
                      }}
                    />
                  ))}
                  {[...Array(d)].map((_, idx) => (
                    <div 
                      key={idx}
                      className="absolute h-full w-1 bg-baked-brown/10 left-1/2 -translate-x-1/2"
                      style={{ transform: `rotate(${(360 / d) * idx}deg)` }}
                    />
                  ))}
              </div>
              
              <div className="flex flex-col items-center">
                <span className="text-4xl font-black text-baked-brown border-b-2 border-baked-brown">{n}</span>
                <span className="text-4xl font-black text-baked-brown">{d}</span>
              </div>

              {isSelected && <CheckCircle2 className="w-10 h-10 text-success" />}
            </motion.button>
          );
        })}
      </div>

      <div className="mt-4">
        {showSuccess && (
          <button onClick={nextMission} className="btn-success text-2xl px-12 py-5 font-black flex items-center gap-4">
            {missionIndex < MISSIONS.length - 1 ? '¡SIGUIENTE PAN!' : '¡MERCADO COMPLETADO!'} <Star className="w-8 h-8 fill-current" />
          </button>
        )}
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  PlayCircle, 
  RotateCcw, 
  ChevronRight, 
  Undo2,
  CheckCircle2,
  Star,
  Scale
} from 'lucide-react';
import { speak, playSuccessSound } from '../services/audioService.ts';

interface Level6Props {
  onComplete: (stars: number) => void;
  setProgress: (val: number) => void;
}

const MISSIONS = [
  { q: "¿Cuál es mayor?", a: "2/4", b: "1/4", correct: "a", text: "¡Frutería! ¿Qué sandía es más grande: 2 cuartos o 1 cuarto?" },
  { q: "¿Cuál es mayor?", a: "1/2", b: "1/4", correct: "a", text: "¡Cuidado! ¿Un medio o un cuarto? ¡Mira los trozos!" },
  { q: "¿Cuál es menor?", a: "1/3", b: "2/2", correct: "a", text: "Buscamos la fruta más pequeña ahora. ¿1 tercio o 2 medios?" },
  { q: "¿Cuál es mayor?", a: "3/4", b: "2/4", correct: "a", text: "Tres cuartos contra dos cuartos. ¡Duelo de sandías!" },
  { q: "¿Cuál es igual?", a: "2/2", b: "4/4", correct: "both", text: "¡Mira! 2 medios y 4 cuartos. ¿Son iguales? Toca cualquiera." },
  { q: "¿Cuál es mayor?", a: "1/5", b: "1/2", correct: "b", text: "¿Qué trozo es más grande, 1 quinto o la mitad?" },
  { q: "¿Cuál es menor?", a: "3/8", b: "7/8", correct: "a", text: "Buscamos la menor: 3 octavos o 7 octavos." },
  { q: "¿Cual es mayor?", a: "2/3", b: "1/3", correct: "a", text: "¿2 tercios o 1 tercio?" },
  { q: "¿Cuál es igual a 1?", a: "3/3", b: "1/2", correct: "a" },
  { q: "¿Cuál es mayor?", a: "6/8", b: "1/8", correct: "a" }
];

export default function Level6({ onComplete, setProgress }: Level6Props) {
  const [missionIndex, setMissionIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errors, setErrors] = useState(0);
  const [showSummary, setShowSummary] = useState(false);

  const currentMission = MISSIONS[missionIndex];

  useEffect(() => {
    if (currentMission.text) speak(currentMission.text);
  }, [missionIndex]);

  const handleSelect = (choice: string) => {
    setSelected(choice);
    if (currentMission.correct === "both" || choice === currentMission.correct) {
      setShowSuccess(true);
      playSuccessSound();
      speak("¡Exacto! Tienes buen ojo para la fruta.");
      setProgress(50 + ((missionIndex + 1) / MISSIONS.length) * 10);
    } else {
      setErrors(prev => prev + 1);
      speak("¡Ah! Fíjate bien en el tamaño de los trozos verdes.");
      setTimeout(() => setSelected(null), 1000);
    }
  };

  const nextMission = () => {
    if (missionIndex < MISSIONS.length - 1) {
      setMissionIndex(prev => prev + 1);
      setSelected(null);
      setShowSuccess(false);
    } else {
      setShowSummary(true);
      const stars = errors === 0 ? 3 : errors < 3 ? 2 : 1;
      speak(`¡Frutería completada! Ganaste ${stars} estrellas.`);
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
              className="bg-white rounded-[40px] p-10 max-w-lg w-full text-center shadow-2xl border-8 border-green-100"
            >
              <div className="text-6xl mb-4">🍉</div>
              <h3 className="text-3xl font-black text-baked-brown mb-4">¡Vista de Águila!</h3>
              <div className="bg-green-50 p-6 rounded-3xl mb-8">
                <p className="text-xl font-bold text-baked-brown/80 mb-4">
                  "¡Aprendiste un secreto! Si el denominador es diferente pero el numerador es el mismo, ¡la fracción con el denominador más pequeño es la más grande!"
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
      <div className="glass-morphism p-8 text-center max-w-2xl w-full border-8 border-dashed border-green-200 bg-green-50/30">
        <h3 className="text-2xl font-black text-green-600 tracking-tighter uppercase mb-4">FRUTERÍA COMPARATIVA 🍉</h3>
        <p className="text-xl font-bold text-baked-brown mb-4">{currentMission.q}</p>
        <button onClick={() => speak(currentMission.text || "Compara las frutas")} className="btn-primary bg-green-500 border-green-400">
          <PlayCircle className="w-8 h-8 fill-current" /> ESCUCHAR A ADA
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 w-full max-w-3xl">
        {['a', 'b'].map((key) => {
          const val = key === 'a' ? currentMission.a : currentMission.b;
          const [n, d] = val.split('/').map(Number);
          return (
            <motion.button
              key={key}
              whileHover={{ scale: 1.05 }}
              onClick={() => handleSelect(key)}
              className={`p-10 glass-morphism flex flex-col items-center gap-6 ${selected === key ? 'border-green-500 bg-green-100' : ''}`}
            >
              <div className="relative w-48 h-48 bg-red-100 rounded-full border-8 border-green-600 overflow-hidden">
                {[...Array(d)].map((_, i) => (
                  <div 
                    key={i}
                    className={`absolute inset-0 ${i < n ? 'bg-red-500' : 'bg-transparent'}`}
                    style={{ 
                      clipPath: `polygon(50% 50%, ${50 + 50 * Math.cos((2 * Math.PI * i) / d)}% ${50 + 50 * Math.sin((2 * Math.PI * i) / d)}%, ${50 + 50 * Math.cos((2 * Math.PI * (i + 1)) / d)}% ${50 + 50 * Math.sin((2 * Math.PI * (i + 1)) / d)}%)`
                    }}
                  />
                ))}
              </div>
              <div className="flex flex-col items-center">
                <span className="text-5xl font-black text-green-700 border-b-4 border-green-700">{n}</span>
                <span className="text-5xl font-black text-green-600">{d}</span>
              </div>
            </motion.button>
          );
        })}
      </div>

      {showSuccess && (
        <button onClick={nextMission} className="btn-success">
          {missionIndex < MISSIONS.length - 1 ? '¡SIGUIENTE FRUTA!' : '¡FINAL DEL NIVEL!'} <ChevronRight />
        </button>
      )}
    </div>
  );
}

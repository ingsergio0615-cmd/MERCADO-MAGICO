import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Droplet, PlayCircle, Undo2, ChevronRight, Star } from 'lucide-react';
import { speak, playSuccessSound } from '../services/audioService.ts';
import { MagicStars } from './MagicStars.tsx';

interface Level3Props {
  onComplete: (stars: number) => void;
  setProgress: (val: number) => void;
}

const MISSIONS = [
  { target: 3, text: "¡El laboratorio de pociones! Necesito que la mezcla llegue a la marca de 3 cuartos. Agrega un poco de esencia de fresa (1/4) y cielo (2/4) para lograrlo." },
  { target: 1, text: "Empecemos suave, solo llena un cuarto (1/4)." },
  { target: 2, text: "Ahora a la mitad, 2 cuartos por favor." },
  { target: 4, text: "¡Poción máxima! Necesito llenar el matraz entero (4/4). ¿Qué esencias usarás para completarlo?" },
  { target: 3, text: "Probemos de nuevo, llega a 3 cuartos usando tres frascos de fresa." },
  { target: 4, text: "Llena el matraz usando solo frascos de fresa (1/4). ¡Toca cuatro veces!" },
  { target: 2, text: "Llega a 2 cuartos usando un solo frasco de cielo (2/4)." },
  { target: 3, text: "Mezcla secreta: un frasco de cielo y uno de fresa. ¿A qué marca llegará?" },
  { target: 4, text: "Llena todo el matraz usando dos frascos de cielo." },
  { target: 1, text: "Para terminar, solo un poquito de esencia de cielo... ¡Ah no! ¡Eso es mucho! Usa un frasco de fresa mejor." }
];

export default function Level3({ onComplete, setProgress }: Level3Props) {
  const [missionIndex, setMissionIndex] = useState(0);
  const [level, setLevel] = useState(0); // 0 to 4 (representing 1/4 marks)
  const [showSuccess, setShowSuccess] = useState(false);
  const [errors, setErrors] = useState(0);
  const [showSummary, setShowSummary] = useState(false);

  const currentMission = MISSIONS[missionIndex];

  useEffect(() => {
    speak(currentMission.text);
  }, [missionIndex]);

  const handleAddIngredient = (amount: number, name: string) => {
    if (level + amount <= 4) {
      const newLevel = level + amount;
      setLevel(newLevel);
      
      speak(`Agregando ${amount} cuarto de ${name}. ¡Mira cómo sube el color azul!`);
      
      if (newLevel === currentMission.target) {
        setShowSuccess(true);
        playSuccessSound();
        speak("¡Fórmula mágica descubierta! La poción es perfecta.");
        setProgress(20 + ((missionIndex + 1) / MISSIONS.length) * 10);
      }
    } else {
      setErrors(prev => prev + 1);
      speak("¡Cuidado! Se va a desbordar el matraz. ¡Esa no es la medida justa!");
    }
  };

  const nextMission = () => {
    if (missionIndex < MISSIONS.length - 1) {
      setMissionIndex(prev => prev + 1);
      setLevel(0);
      setShowSuccess(false);
    } else {
      setShowSummary(true);
      const stars = errors === 0 ? 3 : errors < 3 ? 2 : 1;
      speak(`¡Poción terminada! Ganaste ${stars} estrellas.`);
    }
  };

  const reset = () => {
    setLevel(0);
    setShowSuccess(false);
  };

  return (
    <div className="w-full max-w-5xl flex flex-col items-center gap-12 px-10">
      {showSuccess && <MagicStars />}
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
              className="bg-white rounded-[40px] p-10 max-w-lg w-full text-center shadow-2xl border-8 border-blue-100"
            >
              <div className="text-6xl mb-4">🧪</div>
              <h3 className="text-3xl font-black text-baked-brown mb-4">¡Resumen de Alquimista!</h3>
              <div className="bg-blue-50 p-6 rounded-3xl mb-8">
                <p className="text-xl font-bold text-baked-brown/80 mb-4">
                  "¡Sumar fracciones con el mismo denominador es pura magia! Solo sumas los números de arriba (numeradores) y dejas el de abajo igual."
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
      <div className="glass-morphism p-10 text-center max-w-2xl w-full border-8 border-dashed border-primary/20 flex flex-col items-center gap-4">
        <h3 className="text-2xl font-black text-baked-brown tracking-tighter uppercase">EL RETO DE LAS POCIONES 🧪</h3>
        
        <div className="flex items-center gap-6 bg-white/50 p-4 rounded-3xl border-4 border-white shadow-inner">
           <span className="text-xl font-bold text-baked-brown">OBJETIVO:</span>
           <div className="flex flex-col items-center">
             <span className="text-6xl font-black text-numerator border-b-2 border-baked-brown leading-none">{currentMission.target}</span>
             <span className="text-6xl font-black text-denominator leading-none pt-1">4</span>
           </div>
        </div>

        <button 
          onClick={() => speak(currentMission.text)} 
          className="btn-primary flex items-center gap-4 px-8 py-3 text-lg"
        >
          <PlayCircle className="w-10 h-10 fill-current" /> ESCUCHAR A ADA
        </button>
      </div>

      <div className="flex flex-col lg:flex-row items-center gap-16 w-full justify-center">
        {/* Ingredients */}
        <div className="flex flex-col gap-8">
          <motion.button
            whileHover={{ scale: 1.05, x: 10 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleAddIngredient(1, "fresa")}
            className="flex items-center gap-6 bg-white p-6 rounded-[32px] border-4 border-pink-200 shadow-[0_8px_0_#FBCFE8] hover:shadow-none hover:translate-y-1 transition-all"
          >
            <div className="w-16 h-16 bg-numerator rounded-full flex items-center justify-center shadow-inner">
              <Droplet className="text-white fill-current w-10 h-10" />
            </div>
            <div className="text-left">
              <div className="font-black text-baked-brown text-xl uppercase tracking-tighter">Esencia Fresa</div>
              <div className="text-numerator font-black text-4xl">1/4</div>
            </div>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05, x: 10 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleAddIngredient(2, "cielo")}
            className="flex items-center gap-6 bg-white p-6 rounded-[32px] border-4 border-blue-200 shadow-[0_8px_0_#BFDBFE] hover:shadow-none hover:translate-y-1 transition-all"
          >
            <div className="w-16 h-16 bg-numerator rounded-full flex items-center justify-center shadow-inner">
              <Droplet className="text-white fill-current w-10 h-10" />
            </div>
            <div className="text-left">
              <div className="font-black text-baked-brown text-xl uppercase tracking-tighter">Esencia Cielo</div>
              <div className="text-numerator font-black text-4xl">2/4</div>
            </div>
          </motion.button>
        </div>

        {/* The Bowl */}
        <div className="relative w-72 h-96 flex flex-col items-center">
          <div className="absolute inset-0 bg-white/40 backdrop-blur-md rounded-b-[80px] border-x-8 border-b-8 border-white shadow-2xl overflow-hidden">
            {/* The liquid */}
            <motion.div 
               className="absolute bottom-0 left-0 w-full bg-numerator/80 shadow-[inset_0_10px_20px_rgba(255,255,255,0.4)]"
               animate={{ height: `${level * 25}%` }}
               transition={{ type: 'spring', stiffness: 40 }}
            >
              <div className="absolute top-0 left-0 w-full h-4 bg-white/20 animate-pulse" />
            </motion.div>
            
            {/* Graduations */}
            {[0, 1, 2, 3, 4].map((i) => (
              <div 
                key={i} 
                className="absolute w-full border-t-4 border-baked-brown/10 flex items-center"
                style={{ bottom: `${i * 25}%` }}
              >
                <div className="w-6 h-1 bg-baked-brown/20" />
                <span className="ml-2 text-lg font-black text-baked-brown/30">
                   {i}/4
                </span>
                {i === currentMission.target && (
                   <div className="absolute right-0 w-8 h-8 bg-yellow-400 rounded-full border-2 border-white shadow-lg animate-ping opacity-30" />
                )}
                {i === currentMission.target && (
                   <Star className="absolute right-2 w-6 h-6 fill-yellow-400 text-yellow-500" />
                )}
              </div>
            ))}
          </div>
          
          {/* Bowl "Rim" */}
          <div className="w-full h-12 bg-white rounded-full border-4 border-white shadow-md mb-auto relative z-10 flex items-center justify-center">
             <div className="w-full h-2 bg-baked-brown/5 rounded-full" />
          </div>
          
          <div className="absolute -bottom-12 font-black text-baked-brown/40 uppercase tracking-widest text-sm">Matraz Mágico</div>
        </div>
        
        {/* Result Card */}
        <div className="flex flex-col items-center">
          <div className="bg-white p-10 rounded-[40px] shadow-2xl border-8 border-border-peach flex flex-col items-center w-56">
            <p className="text-baked-brown/60 font-black text-lg mb-6 tracking-widest uppercase">SUMA</p>
            <div className="flex flex-col items-center">
              <span className="text-8xl font-black text-numerator leading-none mb-3">
                {level}
              </span>
              <div className="w-32 h-4 bg-baked-brown rounded-full"></div>
              <span className="text-8xl font-black text-denominator leading-none mt-3">
                4
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-6 mt-6">
        <button onClick={reset} className="btn-magic flex items-center gap-2">
          <Undo2 className="w-5 h-5" /> DESHACER
        </button>
        {showSuccess && (
          <button onClick={nextMission} className="btn-success flex items-center gap-4 text-2xl px-12 py-5">
            ¡SIGUIDIENTE FÓRMULA! <ChevronRight className="w-8 h-8" />
          </button>
        )}
      </div>
    </div>
  );
}

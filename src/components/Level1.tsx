import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Scissors, ShoppingBasket, PlayCircle, Undo2, ChevronRight, Star } from 'lucide-react';
import { speak, playSuccessSound } from '../services/audioService.ts';
import { MagicStars } from './MagicStars.tsx';

interface Level1Props {
  onComplete: (stars: number) => void;
  setProgress: (val: number) => void;
}

const MISSIONS = [
  { targetNum: 1, targetDen: 2, text: "¡Hola! ¿Puedes darme 1 mitad de pizza? Corta la pizza en 2 partes rojas y dame 1 porción azul." },
  { targetNum: 3, targetDen: 4, text: "¡Buen inicio! Ahora necesito 3 cuartos de pizza. Corta en 4 y dame 3." },
  { targetNum: 1, targetDen: 4, text: "¡Algo ligero! Solo 1 cuarto de pizza por favor." },
  { targetNum: 2, targetDen: 2, text: "¡El cliente tiene mucha hambre! Quiere 2 medios. ¡Eso es una pizza entera!" },
  { targetNum: 2, targetDen: 3, text: "Hoy pedimos algo distinto. Pon 2 tercios en el plato. ¡Tercia la pizza!" },
  { targetNum: 1, targetDen: 3, text: "Solo 1 tercio de pizza, para un pajarito del bosque." },
  { targetNum: 4, targetDen: 4, text: "¡Otra pizza entera! Necesito 4 cuartos. ¡Llena ese plato!" },
  { targetNum: 5, targetDen: 6, text: "¡Cuidado! Cortes más finos. Divide en 6 y dame 5 porciones." },
  { targetNum: 3, targetDen: 8, text: "¡Muchos cortes! Divide en 8 partes rojas y sirve 3 azules." },
  { targetNum: 7, targetDen: 8, text: "¡Casi llena! Sirve 7 octavos de pizza para el banquete real." }
];

export default function Level1({ onComplete, setProgress }: Level1Props) {
  const [missionIndex, setMissionIndex] = useState(0);
  const [denominator, setDenominator] = useState(1);
  const [targetNumerator, setTargetNumerator] = useState(0); // This will track what the user HAS to do
  const [isCut, setIsCut] = useState(false);
  const [slicesOnPlate, setSlicesOnPlate] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errors, setErrors] = useState(0);
  const [showSummary, setShowSummary] = useState(false);

  const currentMission = MISSIONS[missionIndex];

  useEffect(() => {
    // Announce first mission
    speak(currentMission.text);
  }, [missionIndex]);

  const handleCut = () => {
    if (denominator === currentMission.targetDen) {
      setIsCut(true);
      speak(`¡Bien! La has cortado en ${denominator}. Ahora pon ${currentMission.targetNum} en el plato.`);
    } else {
      setErrors(prev => prev + 1);
      speak(`¡Uy! La receta pide cortarla en ${currentMission.targetDen} partes rojas. Intenta cambiar el número de cortes.`);
    }
  };

  const handleAddSlice = () => {
    if (slicesOnPlate < currentMission.targetNum) {
      const newVal = slicesOnPlate + 1;
      setSlicesOnPlate(newVal);
      
      if (newVal === currentMission.targetNum) {
        setShowSuccess(true);
        playSuccessSound();
        speak("¡Perfecto! Has completado este pedido.");
        setProgress(((missionIndex + 1) / MISSIONS.length) * 10);
      }
    } else {
      setErrors(prev => prev + 1);
      speak("¡Cuidado! Ya pusiste suficientes porciones.");
    }
  };

  const nextMission = () => {
    if (missionIndex < MISSIONS.length - 1) {
      setMissionIndex(prev => prev + 1);
      setIsCut(false);
      setSlicesOnPlate(0);
      setDenominator(1);
      setShowSuccess(false);
    } else {
      setShowSummary(true);
      const stars = errors === 0 ? 3 : errors < 3 ? 2 : 1;
      speak(`¡Nivel completado! Hoy aprendiste que las fracciones son partes iguales de un todo. Ganaste ${stars} estrellas.`);
    }
  };

  const reset = () => {
    setIsCut(false);
    setSlicesOnPlate(0);
    setDenominator(1);
    setShowSuccess(false);
  };

  return (
    <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-12 gap-10 items-center px-10">
      {showSuccess && <MagicStars />}
      {/* Concept Summary Modal */}
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
              <div className="text-6xl mb-4">🎓</div>
              <h3 className="text-3xl font-black text-baked-brown mb-4">¡Resumen de Chef!</h3>
              <div className="bg-orange-50 p-6 rounded-3xl mb-8">
                <p className="text-xl font-bold text-baked-brown/80 mb-4">
                  "Hoy aprendiste que el número de abajo (denominador) nos dice en cuántas partes iguales cortamos, y el de arriba (numerador) cuántas tomamos."
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
      {/* Target Display */}
      <section className="md:col-span-3 flex flex-col items-center">
        <div className="glass-morphism p-6 flex flex-col items-center w-full gap-4 border-dashed">
          <p className="text-baked-brown font-black text-sm mb-2 tracking-widest uppercase">EL RETO DE ADA</p>
          
          <div className="flex flex-col items-center">
            <span className="text-9xl font-black text-numerator leading-none mb-3">
              {currentMission.targetNum}
            </span>
            <div className="w-24 h-4 bg-baked-brown rounded-full"></div>
            <span className="text-9xl font-black text-denominator leading-none mt-3">
              {currentMission.targetDen}
            </span>
          </div>

          <motion.button 
            whileHover={{ scale: 1.1 }}
            onClick={() => speak(currentMission.text)} 
            className="mt-4 btn-primary"
          >
            <PlayCircle className="w-10 h-10 fill-current" />
          </motion.button>
        </div>
      </section>

      {/* Workspace */}
      <section className="md:col-span-6 bg-[#E8F5E9] rounded-[40px] border-8 border-dashed border-[#A5D6A7] min-h-[520px] flex flex-col items-center justify-around p-8 relative pb-12">
        {!isCut ? (
          <div className="flex flex-col items-center gap-6">
            <div className="text-baked-brown font-black text-xl uppercase tracking-widest opacity-50">Configura los cortes</div>
            <div className="flex items-center gap-6">
               <button onClick={() => setDenominator(d => Math.max(1, d - 1))} className="w-16 h-16 bg-red-100 text-denominator rounded-full border-4 border-red-200 font-black text-4xl btn-3d">-</button>
               <span className="text-8xl font-black text-denominator">{denominator}</span>
               <button onClick={() => setDenominator(d => Math.min(10, d + 1))} className="w-16 h-16 bg-red-100 text-denominator rounded-full border-4 border-red-200 font-black text-4xl btn-3d">+</button>
            </div>
            <motion.button
              whileHover={{ scale: 1.1 }}
              onClick={handleCut}
              className="px-10 py-5 bg-denominator text-white font-black text-2xl rounded-full shadow-lg border-4 border-white flex items-center gap-3 animate-pulse"
            >
              <Scissors className="w-8 h-8" /> ¡CORTAR PIZZA!
            </motion.button>
          </div>
        ) : (
          <div className="relative w-80 h-80 flex items-center justify-center">
            <motion.div className="absolute w-72 h-72 bg-[#fde68a] rounded-full border-8 border-[#d97706] shadow-xl overflow-hidden">
               <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_20%_30%,#ef4444_10%,transparent_10%),radial-gradient(circle_at_70%_60%,#ef4444_8%,transparent_8%),radial-gradient(circle_at_40%_80%,#ef4444_12%,transparent_12%)]" />
               {[...Array(denominator)].map((_, i) => (
                 <div 
                   key={i}
                   className="absolute h-full w-2 bg-denominator/40 left-1/2 -translate-x-1/2"
                   style={{ transform: `rotate(${(360 / denominator) * i}deg)` }}
                 />
               ))}
            </motion.div>
            
            {!showSuccess && (
              <div className="absolute inset-0 flex items-center justify-center z-10 cursor-pointer" onClick={handleAddSlice}>
                <motion.div 
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="w-56 h-56 rounded-full border-4 border-dashed border-numerator flex items-center justify-center bg-white/20"
                >
                  <span className="text-numerator font-black text-2xl uppercase tracking-widest">SERVIR</span>
                </motion.div>
              </div>
            )}
          </div>
        )}

        <div className="flex gap-4">
           <button onClick={reset} className="btn-magic flex items-center gap-2"><Undo2 /> DESHACER</button>
           {showSuccess && (
             <motion.button 
               initial={{ scale: 0 }} 
               animate={{ scale: 1 }} 
               onClick={nextMission}
               className="btn-success text-2xl px-12 py-5"
             >
               Siguiente Pedido <ChevronRight />
             </motion.button>
           )}
        </div>
      </section>

      {/* The Plate */}
      <section className="md:col-span-3 flex flex-col items-center">
        <div className="w-64 h-64 bg-white/60 rounded-full border-8 border-white flex flex-col items-center justify-center shadow-xl relative overflow-hidden">
          <div className="relative w-48 h-48">
             {[...Array(slicesOnPlate)].map((_, i) => (
               <motion.div
                 key={i}
                 initial={{ scale: 0, x: -150 }}
                 animate={{ scale: 1, x: 0 }}
                 className="absolute inset-0 bg-[#FFCC80] border-4 border-[#E65100] rounded-full"
                 style={{ 
                   clipPath: `polygon(50% 50%, ${50 + 50 * Math.cos((2 * Math.PI * i) / denominator)}% ${50 + 50 * Math.sin((2 * Math.PI * i) / denominator)}%, ${50 + 50 * Math.cos((2 * Math.PI * (i + 1)) / denominator)}% ${50 + 50 * Math.sin((2 * Math.PI * (i + 1)) / denominator)}%)`
                 }}
               />
             ))}
             {slicesOnPlate === 0 && (
               <div className="absolute inset-0 flex items-center justify-center border-4 border-dashed border-numerator/20 rounded-full text-5xl font-black text-numerator/20">?</div>
             )}
          </div>
          <div className="mt-4 font-black text-numerator text-4xl">
            {slicesOnPlate} / {currentMission.targetNum}
          </div>
        </div>
      </section>
    </div>
  );
}

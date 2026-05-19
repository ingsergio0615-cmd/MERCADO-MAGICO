import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, ChevronRight, PlayCircle, Undo2, Star } from 'lucide-react';
import { speak, playSuccessSound } from '../services/audioService.ts';
import { MagicStars } from './MagicStars.tsx';

interface Level2Props {
  onComplete: (stars: number) => void;
  setProgress: (val: number) => void;
}

const MISSIONS = [
  { targetNum: 3, targetDen: 2, text: "¡Bienvenida a la chocolatería! Necesito 3 bombones azules, pero las cajas rojas solo tienen 2 espacios. ¡Pide más masa para abrir otra caja!" },
  { targetNum: 5, targetDen: 4, text: "¡Vaya pedido! Necesito 5 bombones, y las cajas solo tienen 4 espacios. ¿Cuántas cajas necesitaremos?" },
  { targetNum: 2, targetDen: 1, text: "¡Pedido especial! Necesito 2 chocolates enteros. Cada caja solo tiene 1 espacio." },
  { targetNum: 4, targetDen: 3, text: "¡Cuidado! Cajas de 3 espacios. Sirve 4 bombones. ¡Necesitarás empezar la segunda caja!" },
  { targetNum: 7, targetDen: 4, text: "¡Mucho chocolate! 7 trozos en cajas de a 4." },
  { targetNum: 3, targetDen: 1, text: "¡Tres cajas enteras! Pide masa hasta tener las 3 cajas y llénalas." },
  { targetNum: 6, targetDen: 3, text: "¡6 tercios! ¿Cuántos chocolates enteros crees que serán?" },
  { targetNum: 9, targetDen: 4, text: "9 bombones para el gigante. Cajas de 4. ¡Vas a necesitar muchas manos!" },
  { targetNum: 7, targetDen: 3, text: "7 bombones en cajas de 3. ¡Qué desorden de cajas!" },
  { targetNum: 10, targetDen: 5, text: "El gran pedido: 10 bombones en cajas de 5. ¡Llena las dos!" }
];

export default function Level2({ onComplete, setProgress }: Level2Props) {
  const [missionIndex, setMissionIndex] = useState(0);
  const [numPastries, setNumPastries] = useState(1);
  const [slicesOnPlate, setSlicesOnPlate] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errors, setErrors] = useState(0);
  const [showSummary, setShowSummary] = useState(false);

  const currentMission = MISSIONS[missionIndex];

  useEffect(() => {
    speak(currentMission.text);
  }, [missionIndex]);

  const handleAddPastry = () => {
    setNumPastries(prev => prev + 1);
    speak("¡Marchando otra caja de bombones!");
  };

  const handleAddSlice = () => {
    if (slicesOnPlate < currentMission.targetNum) {
      if (slicesOnPlate >= numPastries * currentMission.targetDen) {
        setErrors(prev => prev + 1);
        speak("¡Oh! No caben más bombones. ¡Pide más masa para abrir otra caja!");
        return;
      }
      
      const newVal = slicesOnPlate + 1;
      setSlicesOnPlate(newVal);
      
      if (newVal === currentMission.targetNum) {
        setShowSuccess(true);
        playSuccessSound();
        speak("¡Pedido de chocolate completado! Los habitantes del bosque estarán encantados.");
        setProgress(10 + ((missionIndex + 1) / MISSIONS.length) * 10);
      }
    }
  };

  const nextMission = () => {
    if (missionIndex < MISSIONS.length - 1) {
      setMissionIndex(prev => prev + 1);
      setNumPastries(1);
      setSlicesOnPlate(0);
      setShowSuccess(false);
    } else {
      setShowSummary(true);
      const stars = errors === 0 ? 3 : errors < 3 ? 2 : 1;
      speak(`¡Nivel completado! Hoy aprendiste mucho sobre cajas. Ganaste ${stars} estrellas.`);
    }
  };

  const reset = () => {
    setNumPastries(1);
    setSlicesOnPlate(0);
    setShowSuccess(false);
  };

  return (
    <div className="w-full max-w-5xl flex flex-col items-center gap-10 px-10">
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
              className="bg-white rounded-[40px] p-10 max-w-lg w-full text-center shadow-2xl border-8 border-amber-100"
            >
              <div className="text-6xl mb-4">🍫</div>
              <h3 className="text-3xl font-black text-baked-brown mb-4">¡Repaso de Chocolatero!</h3>
              <div className="bg-amber-50 p-6 rounded-3xl mb-8">
                <p className="text-xl font-bold text-baked-brown/80 mb-4">
                  "Aprendiste que si necesitamos más de lo que cabe en una caja, ¡usamos una fracción mayor que 1! Eso significa que el numerador es más grande que el denominador."
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
                ¡GENIAL!
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <div className="flex flex-col items-center glass-morphism p-8 mb-4 max-w-sm w-full gap-4 border-dashed">
        <h3 className="text-xl font-black text-baked-brown/70 mb-2 tracking-widest uppercase">EL RETO DE CHOCOLATE</h3>
        
        <div className="flex items-center gap-6">
           <div className="flex flex-col items-center">
             <span className="text-8xl font-black text-numerator leading-none mb-3 border-b-4 border-baked-brown px-4">
               {currentMission.targetNum}
             </span>
             <span className="text-8xl font-black text-denominator leading-none mt-1">
               {currentMission.targetDen}
             </span>
           </div>
           
           <button onClick={() => speak(currentMission.text)} className="btn-primary">
            <PlayCircle className="w-10 h-10 fill-current" />
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-10 w-full items-center">
        {/* Work Table */}
        <div className="md:col-span-12 lg:col-span-7 bg-[#E8F5E9] rounded-[40px] border-8 border-dashed border-[#A5D6A7] min-h-[480px] flex flex-col items-center justify-around p-10 relative">
          <div className="text-baked-brown font-black uppercase text-sm tracking-widest mb-6 opacity-60">Mesa de Trabajo</div>
          <div className="flex flex-wrap gap-8 justify-center">
            {[...Array(numPastries)].map((_, pastryIdx) => (
              <div key={pastryIdx} className="relative w-48 h-48 bg-[#FFB74D] rounded-full border-4 border-[#E65100] shadow-xl overflow-hidden flex items-center justify-center">
                {/* Visual cuts based on denominator */}
                {[...Array(currentMission.targetDen)].map((_, i) => (
                  <div 
                    key={i} 
                    className="absolute h-full w-2 bg-denominator opacity-40" 
                    style={{ transform: `rotate(${(360 / currentMission.targetDen) * i}deg)` }}
                  />
                ))}
                
                {/* Slices indicators */}
                <div className="absolute inset-0 flex items-center justify-center">
                   <div className="text-[#5C3D2E] text-lg font-black opacity-40">
                     CAJA {pastryIdx + 1}
                   </div>
                </div>
              </div>
            ))}
            
            {!showSuccess && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleAddPastry}
                className="w-48 h-48 rounded-full border-8 border-dashed border-success/40 flex flex-col items-center justify-center text-success font-black hover:bg-success/5 transition-colors group"
              >
                <Plus className="w-16 h-16 group-hover:rotate-90 transition-transform" />
                <span className="text-sm tracking-tighter">MÁS MASA</span>
              </motion.button>
            )}
          </div>
          
          {!showSuccess && (
            <button 
              onClick={handleAddSlice}
              className="mt-8 btn-primary px-12 py-4 text-xl flex items-center gap-3 animate-bounce"
            >
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">🍫</div>
              PONER BOMBÓN
            </button>
          )}
        </div>

        {/* Despacho */}
        <div className="md:col-span-12 lg:col-span-5 flex flex-col items-center gap-6">
          <div className="text-baked-brown font-black uppercase text-sm tracking-widest opacity-60">Caja de Despacho</div>
          <div className="w-full aspect-square bg-white/50 rounded-[40px] p-10 flex flex-col items-center justify-center border-8 border-white relative overflow-hidden shadow-xl">
             
             <div className="grid grid-cols-2 gap-6">
                {[...Array(slicesOnPlate)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ scale: 0, rotate: -20 }}
                    animate={{ scale: 1, rotate: 0 }}
                    className="w-32 h-32 bg-[#FFCC80] border-4 border-[#E65100] rounded-full overflow-hidden shadow-md flex items-center justify-center"
                  >
                    <div className="w-16 h-16 bg-blue-400/30 rounded-full blur-xl" />
                    <span className="absolute text-numerator font-black">1/{currentMission.targetDen}</span>
                  </motion.div>
                ))}
                {slicesOnPlate < currentMission.targetNum && (
                   <div className="w-32 h-32 border-4 border-dashed border-numerator/30 rounded-full flex items-center justify-center text-numerator/40 font-black text-4xl bg-white/30">?</div>
                )}
             </div>
             
             {slicesOnPlate < currentMission.targetNum ? (
               <div className="mt-10 text-baked-brown/40 font-black tracking-widest uppercase">Faltan: {currentMission.targetNum - slicesOnPlate}</div>
             ) : (
               <div className="mt-10 text-success font-black tracking-widest uppercase animate-pulse">¡Caja llena!</div>
             )}
          </div>
        </div>
      </div>

      <div className="flex gap-6 mt-4">
        <button onClick={reset} className="btn-magic flex items-center gap-2">
          <Undo2 className="w-5 h-5" /> REINICIAR
        </button>
        {showSuccess && (
          <button onClick={nextMission} className="btn-success flex items-center gap-4 text-2xl px-12 py-5">
            ¡SIGUIENTE PEDIDO! <ChevronRight className="w-8 h-8" />
          </button>
        )}
      </div>
    </div>
  );
}

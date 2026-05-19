import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Play, 
  RotateCcw, 
  Wand2, 
  ChevronRight, 
  ChevronLeft,
  Volume2,
  VolumeX,
  Trophy,
  Star,
  CheckCircle2,
  BookHeart,
  Palette,
  User,
  Download,
  LogIn,
  LogOut
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { speak, playSuccessSound } from './services/audioService.ts';
import { generateMagicReport } from './services/pdfService.ts';
import { type GameState, type GameLevel } from './types.ts';
import { auth, signInWithGoogle, saveUserProgress, getUserProgress } from './lib/firebase.ts';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';

// Components
import Level1 from './components/Level1.tsx';
import Level2 from './components/Level2.tsx';
import Level3 from './components/Level3.tsx';
import Level4 from './components/Level4.tsx';
import Level5 from './components/Level5.tsx';
import Level6 from './components/Level6.tsx';
import Level7 from './components/Level7.tsx';
import Level8 from './components/Level8.tsx';
import Level9 from './components/Level9.tsx';
import Level10 from './components/Level10.tsx';
import AdaVoice from './components/AdaVoice.tsx';
import { MouseTrail } from './components/MouseTrail.tsx';

// Sparkle effect for cards
const Sparkles = () => (
  <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-[inherit]">
    {[...Array(6)].map((_, i) => (
      <motion.div
        key={i}
        className="absolute w-1 h-1 bg-white rounded-full opacity-0"
        animate={{
          scale: [0, 1, 0],
          opacity: [0, 0.8, 0],
          x: [Math.random() * 200 - 100, Math.random() * 200 - 100],
          y: [Math.random() * 200 - 100, Math.random() * 200 - 100],
        }}
        transition={{
          duration: 2 + Math.random() * 2,
          repeat: Infinity,
          ease: "easeInOut",
          delay: Math.random() * 5
        }}
        style={{
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
        }}
      />
    ))}
  </div>
);

export default function App() {
  const [gameState, setGameState] = useState<GameState>({
    currentLevel: 1,
    progress: 0,
    score: 0,
    isWon: false,
  });

  const [showIntro, setShowIntro] = useState(() => {
    const saved = localStorage.getItem('chefProfile');
    return !saved;
  });
  const [showMap, setShowMap] = useState(() => {
    const saved = localStorage.getItem('chefProfile');
    return !!saved;
  });
  const [showAlbum, setShowAlbum] = useState(false);
  const [chefProfile, setChefProfile] = useState(() => {
    const saved = localStorage.getItem('chefProfile');
    return saved ? JSON.parse(saved) : { name: '', color: '#F4A460', avatar: '👩‍🍳' };
  });
  const [completedLevels, setCompletedLevels] = useState<number[]>(() => {
    const saved = localStorage.getItem('completedLevels');
    return saved ? JSON.parse(saved) : [];
  });
  const [stickers, setStickers] = useState<string[]>([]);
  const [levelStars, setLevelStars] = useState<Record<number, number>>(() => {
    const saved = localStorage.getItem('levelStars');
    return saved ? JSON.parse(saved) : {};
  });
  const [backgroundMusic, setBackgroundMusic] = useState<HTMLAudioElement | null>(null);
  const [isMuted, setIsMuted] = useState(true);
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (newUser) => {
      setUser(newUser);
      if (newUser) {
        setIsSyncing(true);
        const progress = await getUserProgress(newUser.uid);
        if (progress) {
          setChefProfile({
            name: progress.name,
            color: progress.color || '#F4A460',
            avatar: progress.avatar || '👩‍🍳'
          });
          setCompletedLevels(progress.completedLevels || []);
          setLevelStars(progress.levelStars || {});
          setShowIntro(false);
          setShowMap(true);
        } else {
          // New user, maybe sync from local storage if existing
          const localProfile = localStorage.getItem('chefProfile');
          if (localProfile) {
            const parsed = JSON.parse(localProfile);
            const localLevels = JSON.parse(localStorage.getItem('completedLevels') || '[]');
            const localStars = JSON.parse(localStorage.getItem('levelStars') || '{}');
            
            await saveUserProgress(newUser.uid, {
              ...parsed,
              completedLevels: localLevels,
              levelStars: localStars
            });
          }
        }
        setIsSyncing(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    try {
      await signInWithGoogle();
      speak("¡Bienvenida de nuevo, Chef! Estamos cargando tu cocina mágica.");
    } catch (error) {
      speak("Hubo un problemita al entrar. ¡Inténtalo de nuevo!");
    }
  };

  const handleLogout = () => {
    auth.signOut();
    speak("¡Hasta pronto, Chef! Tu progreso está seguro en el Mercado Mágico.");
  };

  useEffect(() => {
    if (user) {
      saveUserProgress(user.uid, {
        ...chefProfile,
        completedLevels,
        levelStars
      });
    }
  }, [chefProfile, completedLevels, levelStars, user]);

  // Music mapping
  const getMusicForLevel = (level: number) => {
    switch(level) {
      case 1: return 'https://assets.mixkit.co/music/preview/mixkit-italian-afternoon-78.mp3';
      case 3: return 'https://assets.mixkit.co/music/preview/mixkit-mysterious-cursed-forest-554.mp3';
      case 2: return 'https://assets.mixkit.co/music/preview/mixkit-happy-clappy-66.mp3';
      default: return 'https://assets.mixkit.co/music/preview/mixkit-clown-park-567.mp3';
    }
  };

  useEffect(() => {
    if (!gameState.isWon && !isMuted) {
      const musicUrl = getMusicForLevel(gameState.currentLevel);
      if (backgroundMusic && backgroundMusic.src !== musicUrl) {
        backgroundMusic.pause();
      }
      
      const audio = backgroundMusic && backgroundMusic.src === musicUrl 
        ? backgroundMusic 
        : new Audio(musicUrl);
        
      audio.loop = true;
      audio.volume = 0.2;
      audio.play().catch(e => console.log("Audio play blocked", e));
      setBackgroundMusic(audio);
      
      return () => {
        // Only cleanup on unmount or if we change level
      };
    } else {
      backgroundMusic?.pause();
    }
  }, [gameState.currentLevel, isMuted, gameState.isWon]);

  const toggleToMap = (profile?: { name: string, color: string, avatar: string }) => {
    if (profile) setChefProfile(profile);
    setShowIntro(false);
    setShowAlbum(false);
    setShowMap(true);
    const greeting = profile 
      ? `¡Hola ${profile.name}! Bienvenida al Mercado Mágico. ¡Tu aventura comienza ahora!`
      : "¡Bienvenida de nuevo! Elige tu próxima aventura.";
    speak(greeting);
  };

  const handleDownloadReport = () => {
    const shops = [
      { id: 1, name: "La Pizzería" },
      { id: 2, name: "Chocolatería" },
      { id: 3, name: "El Laboratorio" },
      { id: 4, name: "La Panadería" },
      { id: 5, name: "Heladería" },
      { id: 6, name: "Frutería" },
      { id: 7, name: "Juguetería" },
      { id: 8, name: "Floristería" },
      { id: 9, name: "La Lonchera" },
      { id: 10, name: "Gran Bazar" }
    ];

    const reportData = shops
      .filter(s => completedLevels.includes(s.id))
      .map(s => ({
        level: s.id,
        name: s.name,
        stars: levelStars[s.id] || 0
      }));

    if (reportData.length === 0) {
      speak("¡Todavía no tienes logros para descargar! Completa al menos una tienda.");
      return;
    }

    generateMagicReport(chefProfile.name || "Invitada Mágica", reportData);
    speak("¡Tu diploma mágico se está preparando! Mira tus descargas.");
  };

  const handleDownloadIndividualReport = (levelId: number, name: string) => {
    const stars = levelStars[levelId] || 0;
    generateMagicReport(chefProfile.name || "Invitada Mágica", [{ level: levelId, name, stars }], true);
    speak(`¡Tu diploma de ${name} está listo!`);
  };

  const startLevel = (level: GameLevel) => {
    setGameState(prev => ({ ...prev, currentLevel: level }));
    setShowMap(false);
    
    switch(level) {
      case 1:
        speak("¡La Pizzería! Vamos a ver si podemos cumplir los pedidos.");
        break;
      case 2:
        speak("¡Chocolatería! Aquí las cajas son especiales.");
        break;
      case 3:
        speak("¡Laboratorio! Vamos a mezclar pociones mágicas.");
        break;
              case 4:
        speak("¡Panadería! Aprenderemos que a veces menos es más... ¡o igual!");
        break;
      case 5:
        speak("¡Heladería! Vamos a servir bolas de helado siguiendo fracciones.");
        break;
      case 6:
        speak("¡Frutería! Aquí comparamos qué trozo es más grande.");
        break;
      case 7:
        speak("¡Juguetería! Casi llegamos al final.");
        break;
      case 8:
        speak("¡Floristería! Repartamos flores en ramos mágicos.");
        break;
      case 9:
        speak("¡La Lonchera! Vamos a empacar meriendas nutritivas.");
        break;
      case 10:
        speak("¡El Gran Bazar! La prueba final del Mercado Mágico.");
        break;
    }
  };

  const handleNextLevel = (starsEarned: number = 3) => {
    setCompletedLevels(prev => [...new Set([...prev, gameState.currentLevel])]);
    setLevelStars(prev => ({
      ...prev,
      [gameState.currentLevel]: Math.max(prev[gameState.currentLevel] || 0, starsEarned)
    }));
    
    if (completedLevels.length + 1 >= 10) {
      setGameState(prev => ({ ...prev, isWon: true }));
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 }
      });
      speak("¡Increíble! ¡Eres la Genia de todo el Mercado Mágico! Todos están muy felices.");
    } else {
      setShowMap(true);
      speak("¡Buen trabajo! ¿Cuál tienda visitaremos ahora?");
    }
  };

  const updateProgress = (value: number) => {
    const newProgress = Math.min(100, Math.max(0, value));
    const oldProgress = gameState.progress;

    setGameState(prev => ({ ...prev, progress: newProgress }));

    // Voice feedback for milestones
    const oldMilestone = Math.floor(oldProgress / 10);
    const newMilestone = Math.floor(newProgress / 10);

    if (newMilestone > oldMilestone) {
      if (newProgress >= 80 && oldProgress < 80) {
        speak("¡Qué brillo! El chocolate se está envolviendo en papel de plata mágico.");
      } else if (newProgress < 80) {
        speak("¡Añadimos otra onza de chocolate a tu barra!");
      }
    }

    if (newProgress >= 100 && oldProgress < 100) {
      playSuccessSound();
      speak("¡La barra está lista y envuelta! ¡Eres una Chef Estrella!");
    }
  };

  return (
    <div className="min-h-screen flex flex-col relative bg-cream-bg p-4 md:p-8 overflow-y-auto">
      <MouseTrail />
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none">
        <div className="absolute top-20 left-1/4 w-64 h-64 bg-primary rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-blue-400 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-center px-8 py-6 bg-white/70 backdrop-blur-md rounded-[32px] mb-8 relative z-20 border-4 border-white shadow-xl gap-6">
        <div className="flex items-center gap-6">
          <motion.div 
            whileHover={{ rotate: 10, scale: 1.1 }}
            className="w-16 h-16 bg-white rounded-2xl border-4 flex items-center justify-center text-4xl shadow-md overflow-hidden shrink-0"
            style={{ borderColor: chefProfile.color }}
          >
            {showIntro ? '🎂' : chefProfile.avatar}
          </motion.div>
          <div className="flex flex-col">
            <h1 className="text-3xl md:text-4xl font-display font-black text-baked-brown tracking-tight leading-none mb-1">
              Mercado Mágico
            </h1>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
              <p className="text-baked-brown/60 font-bold text-base uppercase tracking-widest">
                {showIntro ? "¡Hola, Chef!" : showMap ? "Explora el Mercado" : `Nivel ${gameState.currentLevel}`}
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-3">
          {!showIntro && (
            <>
              {user ? (
                <div className="flex items-center bg-stone-100 rounded-2xl pl-4 pr-1 py-1 border-2 border-stone-200">
                  <span className="text-xs font-black text-stone-500 mr-3 uppercase">{chefProfile.name}</span>
                  <button
                    onClick={handleLogout}
                    className="p-2 hover:bg-stone-200 rounded-xl transition-colors text-stone-600"
                    title="Cerrar sesión"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <button 
                  onClick={handleLogin}
                  className="btn-magic bg-white text-magic-dark border-magic hover:bg-magic/10 px-4 py-2 text-sm"
                >
                  <LogIn className="w-4 h-4 inline mr-2" /> ENTRAR
                </button>
              )}
              
              <div className="flex gap-2 bg-stone-100 p-1 rounded-2xl border-2 border-stone-200">
                <button
                  onClick={() => setIsMuted(prev => !prev)}
                  className={`p-2 rounded-xl transition-all ${isMuted ? 'text-stone-400' : 'text-primary bg-white shadow-sm'}`}
                >
                  {isMuted ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
                </button>
                <button 
                  onClick={() => { setShowMap(true); setShowAlbum(false); setGameState(prev => ({ ...prev, currentLevel: null, isWon: false })); }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all font-black text-sm uppercase tracking-widest ${showMap && !gameState.currentLevel ? 'bg-primary text-white shadow-md' : 'text-stone-500 hover:bg-stone-200'}`}
                >
                  🗺️ Mapa
                </button>
                <button 
                  onClick={() => { setShowAlbum(true); setShowMap(false); setGameState(prev => ({ ...prev, currentLevel: null, isWon: false })); }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all font-black text-sm uppercase tracking-widest ${showAlbum ? 'bg-primary text-white shadow-md' : 'text-stone-500 hover:bg-stone-200'}`}
                >
                  <BookHeart className="w-5 h-5" /> Álbum
                </button>
              </div>
            </>
          )}
          <button 
            onClick={() => window.location.reload()}
            className="bg-stone-800 text-white px-5 py-2 rounded-2xl font-black text-sm hover:bg-stone-700 transition-colors shadow-lg active:scale-95"
          >
            REINICIAR
          </button>
        </div>
      </header>

      {/* Main Game Area */}
      <main className="flex-1 flex flex-col items-center justify-start lg:justify-center relative z-10 w-full py-8 md:py-12">
        <AnimatePresence mode="wait">
          {showIntro ? (
            <motion.div 
              key="intro"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 1.05, y: -20 }}
              className="glass-morphism p-10 md:p-16 max-w-4xl text-center border-8 border-white relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                <Palette className="w-64 h-64 rotate-12" />
              </div>

              <div className="flex flex-col items-center mb-12">
                <motion.div 
                  animate={{ y: [0, -10, 0], rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 4, repeat: Infinity }}
                  className="w-32 h-32 bg-white rounded-3xl border-8 flex items-center justify-center text-7xl shadow-2xl mb-6 ring-4 ring-orange-50"
                  style={{ borderColor: chefProfile.color }}
                >
                  {chefProfile.avatar}
                </motion.div>
                <h2 className="text-5xl font-display font-black text-baked-brown mb-2 tracking-tight">
                  ¡Crea tu Chef!
                </h2>
                <p className="text-baked-brown/50 font-bold uppercase tracking-[0.2em] text-sm">Personaliza tu aventura mágica</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 text-left relative z-10">
                <div className="space-y-10">
                  <div className="bg-orange-50/50 p-6 rounded-[32px] border-2 border-orange-100">
                    <label className="block text-baked-brown font-black mb-4 flex items-center gap-3 uppercase text-xs tracking-widest">
                      <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                        <User className="w-4 h-4 text-primary" />
                      </div>
                      ¿Cuál es tu nombre?
                    </label>
                    <input 
                      type="text"
                      maxLength={15}
                      placeholder="Tu nombre de chef..."
                      className="w-full p-5 rounded-2xl border-4 border-white text-2xl font-bold text-baked-brown focus:border-primary outline-none bg-white/80 shadow-sm transition-all focus:shadow-md"
                      onChange={(e) => setChefProfile(prev => ({ ...prev, name: e.target.value }))}
                      value={chefProfile.name}
                    />
                  </div>

                  <div className="bg-stone-50 p-6 rounded-[32px] border-2 border-stone-100">
                    <label className="block text-baked-brown font-black mb-4 flex items-center gap-3 uppercase text-xs tracking-widest text-stone-500">
                      <div className="w-8 h-8 rounded-lg bg-stone-200 flex items-center justify-center text-stone-400">
                        <Palette className="w-4 h-4" />
                      </div>
                      Color Mágico
                    </label>
                    <div className="grid grid-cols-6 gap-3">
                      {['#F4A460', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#A29BFE'].map(color => (
                        <button
                          key={color}
                          onClick={() => setChefProfile(prev => ({ ...prev, color }))}
                          className={`aspect-square rounded-xl border-4 transition-all ${chefProfile.color === color ? 'scale-110 border-white shadow-lg ring-4 ring-primary/30' : 'border-white/50 hover:scale-105'}`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-[32px] border-2 border-border-peach shadow-inner">
                  <label className="block text-baked-brown font-black mb-5 flex items-center gap-3 uppercase text-xs tracking-widest">
                    <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                      <Wand2 className="w-4 h-4 text-primary" />
                    </div>
                    Elige tu Avatar
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {['👩‍🍳', '👨‍🍳', '👩‍🔬', '👨‍🔬', '🧙‍♀️', '🧙‍♂️', '🤖', '🐱', '🦄'].map(avatar => (
                      <button
                        key={avatar}
                        onClick={() => setChefProfile(prev => ({ ...prev, avatar }))}
                        className={`text-4xl p-4 rounded-2xl border-4 transition-all ${chefProfile.avatar === avatar ? 'border-primary bg-orange-50 scale-110 shadow-md' : 'border-stone-50 hover:border-orange-100'}`}
                      >
                        {avatar}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-16 space-y-6">
                <button 
                  disabled={!chefProfile.name || isSyncing}
                  onClick={() => toggleToMap(chefProfile)}
                  className={`group relative px-20 py-8 text-white text-3xl font-display font-black rounded-[32px] transition-all transform flex items-center gap-6 mx-auto ${chefProfile.name ? 'bg-primary hover:bg-primary-dark hover:scale-105 shadow-[0_12px_0_#CC7E16] active:translate-y-1 active:shadow-none' : 'bg-gray-300 opacity-50 cursor-not-allowed text-gray-500'}`}
                >
                  <Play className="fill-current w-10 h-10" />
                  {isSyncing ? "PREPARANDO..." : "¡COMENZAR!"}
                </button>

                {!user && (
                  <div className="pt-4">
                    <button 
                      onClick={handleLogin}
                      className="inline-flex items-center gap-3 px-6 py-3 bg-stone-100 hover:bg-stone-200 rounded-2xl text-stone-600 font-bold transition-all border-2 border-stone-200"
                    >
                      <LogIn className="w-5 h-5 text-stone-400" /> 
                      <span>INICIA CON GOOGLE PARA GUARDAR TU PROGRESO</span>
                    </button>
                  </div>
                )}
                
                <div className="pt-4">
                   <p className="text-baked-brown/30 font-black uppercase text-[10px] tracking-[0.3em]">
                    {chefProfile.name ? `¡LISTO, ${chefProfile.name.toUpperCase()}!` : "Dinos tu nombre para continuar"}
                  </p>
                </div>
              </div>
            </motion.div>
          ) : showAlbum ? (
            <motion.div 
              key="album"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              className="w-full max-w-5xl p-12 glass-morphism bg-white border-[16px] border-border-peach relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-4 bg-primary opacity-20" />
              <div className="absolute bottom-0 left-0 w-full h-4 bg-primary opacity-20" />
              
              <div className="text-center mb-12 relative z-10">
                <div className="inline-block px-8 py-2 bg-primary/10 rounded-full mb-4">
                  <span className="text-primary font-black uppercase tracking-[0.2em] text-xs">Coleccionables</span>
                </div>
                <h2 className="text-6xl font-display font-black text-baked-brown mb-3">Mi Álbum Mágico</h2>
                <p className="text-baked-brown/50 font-bold max-w-md mx-auto">Cada tienda que completes te regala una estampa legendaria única.</p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6 relative z-10">
                {[
                  { id: 1, name: "Pizza de Oro", icon: "🍕", color: "bg-red-50 text-red-500" },
                  { id: 2, name: "Bombón Real", icon: "💎", color: "bg-amber-50 text-amber-500" },
                  { id: 3, name: "Poción Estelar", icon: "🌌", color: "bg-blue-50 text-blue-500" },
                  { id: 4, name: "Pan Galáctico", icon: "🛸", color: "bg-orange-50 text-orange-500" },
                  { id: 5, name: "Nevada Eterna", icon: "❄️", color: "bg-pink-50 text-pink-500" },
                  { id: 6, name: "Fruta Zen", icon: "🌸", color: "bg-green-50 text-green-500" },
                  { id: 7, name: "Oso Chamán", icon: "🧿", color: "bg-purple-50 text-purple-500" },
                  { id: 8, name: "Ramo Fénix", icon: "🔥", color: "bg-rose-50 text-rose-500" },
                  { id: 9, name: "Almuerzo Zen", icon: "🍱", color: "bg-teal-50 text-teal-500" },
                  { id: 10, name: "Gema Maestra", icon: "👑", color: "bg-indigo-50 text-indigo-500" }
                ].map((item) => (
                  <motion.div 
                    key={item.id}
                    whileHover={completedLevels.includes(item.id) ? { scale: 1.05, rotate: 2 } : {}}
                    className={`aspect-[3/4] rounded-2xl border-4 border-dashed flex flex-col items-center justify-between p-4 relative transition-all ${completedLevels.includes(item.id) ? `bg-white shadow-xl border-primary/20 border-solid` : 'bg-stone-50 border-stone-200'}`}
                  >
                    {completedLevels.includes(item.id) ? (
                      <>
                        <div className={`w-full flex-1 flex items-center justify-center rounded-xl mb-3 ${item.color.split(' ')[0]}`}>
                           <span className="text-6xl drop-shadow-md">{item.icon}</span>
                        </div>
                        <div className="w-full text-center">
                          <p className="text-[10px] font-black text-baked-brown uppercase tracking-widest leading-none mb-1">{item.name}</p>
                          <div className="h-1 w-full bg-primary/20 rounded-full" />
                        </div>
                        <div className="absolute -top-2 -right-2 bg-yellow-400 rounded-lg p-1 border-2 border-white shadow-md">
                          <Star className="w-3 h-3 fill-white text-white" />
                        </div>
                      </>
                    ) : (
                      <div className="flex-1 flex flex-col items-center justify-center opacity-20 filter grayscale">
                        <span className="text-4xl mb-2">?</span>
                        <div className="h-1 w-8 bg-stone-300 rounded-full" />
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 mt-16 relative z-10">
                <button 
                  onClick={() => { setShowAlbum(false); setShowMap(true); }}
                  className="flex-1 px-8 py-5 bg-baked-brown text-white rounded-2xl font-black text-xl hover:bg-stone-800 transition-all shadow-lg active:scale-95"
                >
                  VOLVER AL MAPA
                </button>
                <button 
                  onClick={handleDownloadReport}
                  className="flex-1 px-8 py-5 bg-primary text-white rounded-2xl font-black text-xl hover:bg-primary-dark transition-all shadow-lg active:scale-95 flex items-center justify-center gap-3"
                >
                  <Download className="w-6 h-6" /> MI DIPLOMA TOTAL
                </button>
              </div>
            </motion.div>
          ) : showMap ? (
            <motion.div 
              key="map"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-8 px-8"
            >
              {[
                { id: 1, name: "La Pizzería", icon: "🍕", desc: "Fracciones circulares", color: "bg-red-50" },
                { id: 2, name: "Chocolatería", icon: "🍫", desc: "Barras y rectángulos", color: "bg-orange-50" },
                { id: 3, name: "El Laboratorio", icon: "🧪", desc: "Pociones y litros", color: "bg-blue-50" },
                { id: 4, name: "La Panadería", icon: "🥐", desc: "Equivalencias", color: "bg-amber-50" },
                { id: 5, name: "Heladería", icon: "🍦", desc: "Sumas de bolas", color: "bg-pink-50" },
                { id: 6, name: "Frutería", icon: "🍉", desc: "Comparación", color: "bg-green-50" },
                { id: 7, name: "Juguetería", icon: "🧸", desc: "Porcentajes básicos", color: "bg-purple-50" },
                { id: 8, name: "Floristería", icon: "🌸", desc: "Ramos y grupos", color: "bg-rose-50" },
                { id: 9, name: "La Lonchera", icon: "🍱", desc: "Partes de un todo", color: "bg-teal-50" },
                { id: 10, name: "Gran Bazar", icon: "💎", desc: "Desafío Final", color: "bg-indigo-50" }
              ].map((shop) => (
                <div
                  key={shop.id}
                  onClick={() => startLevel(shop.id as GameLevel)}
                  className={`group relative p-8 glass-morphism card-hover text-left cursor-pointer overflow-hidden ${shop.color} ${completedLevels.includes(shop.id) ? 'opacity-90' : ''}`}
                >
                  <Sparkles />
                  <div className="flex justify-between items-start mb-6 relative z-10">
                    <motion.span 
                      whileHover={{ scale: 1.2, rotate: [0, -10, 10, 0] }}
                      className="text-7xl drop-shadow-lg"
                    >
                      {shop.icon}
                    </motion.span>
                    <div className="flex flex-col items-end gap-3">
                       {completedLevels.includes(shop.id) && (
                         <motion.div 
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="flex gap-2"
                         >
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDownloadIndividualReport(shop.id, shop.name);
                              }}
                              className="w-12 h-12 bg-white text-orange-500 rounded-xl flex items-center justify-center hover:bg-orange-50 transition-colors shadow-md border-2 border-orange-100"
                              title="Descargar diploma"
                            >
                              <Download className="w-6 h-6" />
                            </button>
                            <div className="w-12 h-12 bg-success text-white rounded-xl flex items-center justify-center shadow-lg">
                              <CheckCircle2 className="w-6 h-6" />
                            </div>
                         </motion.div>
                       )}
                       <div className="flex gap-1 bg-white/50 p-2 rounded-xl border border-white">
                          {[1, 2, 3].map(s => (
                            <Star 
                              key={s} 
                              className={`w-5 h-5 transition-colors ${(levelStars[shop.id] || 0) >= s ? 'fill-yellow-400 text-yellow-400' : 'text-stone-300'}`} 
                            />
                          ))}
                       </div>
                    </div>
                  </div>
                  <div className="relative z-10">
                    <h3 className="text-3xl font-display font-black text-baked-brown mb-1 leading-tight">{shop.name}</h3>
                    <p className="text-baked-brown/50 font-bold uppercase tracking-widest text-xs">{shop.desc}</p>
                  </div>
                  
                  {/* Decorative background number */}
                  <span className="absolute -bottom-4 -right-2 text-9xl font-black text-baked-brown/5 pointer-events-none italic">
                    {shop.id}
                  </span>
                </div>
              ))}
            </motion.div>
          ) : gameState.isWon ? (
            <motion.div 
              key="win"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-morphism p-12 text-center max-w-xl"
            >
              <div className="w-40 h-40 bg-yellow-400 rounded-full border-8 border-white flex items-center justify-center mx-auto mb-8 shadow-xl animate-bounce">
                <Trophy className="w-24 h-24 text-white" />
              </div>
              <h2 className="text-5xl font-black text-baked-brown mb-4">¡Felicidades Chef!</h2>
              <p className="text-xl text-baked-brown/80 mb-10 font-bold">
                Has completado todos los desafíos del Mercado Mágico. ¡Eres una verdadera estrella!
              </p>
              <div className="bg-[#FFF9F2] p-8 rounded-3xl border-8 border-dashed border-stone-300 mb-10">
                <div className="flex items-center justify-center gap-4 text-3xl font-black text-baked-brown">
                  <Star className="fill-yellow-400 text-yellow-400 w-10 h-10" />
                  GENIA DEL MERCADO
                  <Star className="fill-yellow-400 text-yellow-400 w-10 h-10" />
                </div>
              </div>
              <div className="flex flex-col gap-4">
                <button 
                  onClick={handleDownloadReport}
                  className="btn-magic bg-orange-500 border-orange-400 text-white text-2xl px-12 py-5 shadow-[0_8px_0_#CC7E16] flex items-center justify-center gap-3"
                >
                  📥 DESCARGAR DIPLOMA MÁGICO
                </button>
                <button 
                  onClick={() => window.location.reload()}
                  className="btn-success text-2xl px-12 py-5"
                >
                  JUGAR DE NUEVO
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key={`level-${gameState.currentLevel}`}
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              className="w-full flex flex-col items-center"
            >
              {gameState.currentLevel === 1 && <Level1 onComplete={(s) => handleNextLevel(s)} setProgress={updateProgress} />}
              {gameState.currentLevel === 2 && <Level2 onComplete={(s) => handleNextLevel(s)} setProgress={updateProgress} />}
              {gameState.currentLevel === 3 && <Level3 onComplete={(s) => handleNextLevel(s)} setProgress={updateProgress} />}
              {gameState.currentLevel === 4 && <Level4 onComplete={(s) => handleNextLevel(s)} setProgress={updateProgress} />}
              {gameState.currentLevel === 5 && <Level5 onComplete={(s) => handleNextLevel(s)} setProgress={updateProgress} />}
              {gameState.currentLevel === 6 && <Level6 onComplete={(s) => handleNextLevel(s)} setProgress={updateProgress} />}
              {gameState.currentLevel === 7 && <Level7 onComplete={(s) => handleNextLevel(s)} setProgress={updateProgress} />}
              {gameState.currentLevel === 8 && <Level8 onComplete={(s) => handleNextLevel(s)} setProgress={updateProgress} />}
              {gameState.currentLevel === 9 && <Level9 onComplete={(s) => handleNextLevel(s)} setProgress={updateProgress} />}
              {gameState.currentLevel === 10 && <Level10 onComplete={(s) => handleNextLevel(s)} setProgress={updateProgress} />}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Progress Bar (Chocolate Bar) */}
      {!showIntro && !showMap && !gameState.isWon && (
        <footer className="mt-12 relative z-20 w-full max-w-4xl mx-auto px-6 py-6 bg-white/40 backdrop-blur-sm rounded-[32px] border-4 border-white shadow-lg overflow-hidden">
          <div className="flex justify-between items-end mb-4 px-2">
            <div className="flex flex-col">
              <span className="text-baked-brown/50 font-black text-[10px] tracking-[0.2em] uppercase mb-1">Estatus del Chef</span>
              <span className="text-baked-brown font-display font-black text-2xl tracking-tight leading-none">Tu Chocolate Mágico</span>
            </div>
            <div className="flex flex-col items-end">
               <span className="text-primary font-black text-3xl font-display leading-none">{gameState.progress}%</span>
               <span className="text-baked-brown/40 font-bold text-[10px] uppercase">Completado</span>
            </div>
          </div>
          
          <div className="h-20 w-full bg-[#4A3125] rounded-[28px] flex gap-2 p-2 shadow-[inset_0_4px_12px_rgba(0,0,0,0.5)] overflow-hidden border-4 border-[#3D261C] relative">
            {/* Chocolate Bar Tiles */}
            {[...Array(10)].map((_, i) => {
              const threshold = (i + 1) * 10;
              const isFilled = gameState.progress >= threshold;
              const isWrapping = gameState.progress >= 80 && isFilled;
              
              return (
                <motion.div
                  key={i}
                  className={`flex-1 h-full rounded-2xl relative overflow-hidden transition-all duration-700 ${
                    isFilled ? (isWrapping ? 'bg-linear-to-tr from-stone-200 to-stone-400' : 'bg-[#5C3D2E]') : 'bg-black/10'
                  }`}
                  animate={{ 
                    scale: isFilled ? 1 : 0.9,
                    y: isFilled ? 0 : 2
                  }}
                >
                  {isFilled && !isWrapping && (
                    <div className="absolute inset-0 border-b-4 border-r-4 border-black/20 rounded-2xl flex items-center justify-center">
                       <div className="w-5 h-5 bg-black/10 rounded-full blur-[1px]" />
                       <div className="absolute top-1 left-1 w-2 h-2 bg-white/10 rounded-full" />
                    </div>
                  )}
                  {isWrapping && (
                    <div className="absolute inset-0 bg-linear-to-tr from-white/40 to-transparent border-t-2 border-l-2 border-white/60" />
                  )}
                </motion.div>
              );
            })}
            
            {/* Glossy overlay */}
            <div className="absolute top-0 left-0 w-full h-1/2 bg-white/5 pointer-events-none" />
          </div>
          
          <p className="mt-4 text-center text-baked-brown/30 font-bold uppercase text-[9px] tracking-[0.4em]">
            Completa fracciones para templar el chocolate
          </p>
        </footer>
      )}

      {/* Helper Ada always visible in corner when playing */}
      {!showIntro && !gameState.isWon && (
        <AdaVoice currentLevel={gameState.currentLevel} />
      )}
    </div>
  );
}

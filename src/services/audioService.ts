export const speak = (text: string) => {
  if ('speechSynthesis' in window) {
    // Cancel any ongoing speech
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'es-ES';
    utterance.rate = 0.9; // Slightly slower for NEE
    utterance.pitch = 1.2; // Slightly higher/friendlier voice
    window.speechSynthesis.speak(utterance);
  } else {
    console.warn("Speech synthesis not supported in this browser.");
  }
};

export const playSuccessSound = () => {
  const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  const notes = [261.63, 329.63, 392.00, 523.25]; // C4, E4, G4, C5
  
  notes.forEach((freq, i) => {
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(freq, audioCtx.currentTime + i * 0.15);
    
    gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime + i * 0.15);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + i * 0.15 + 0.5);
    
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    oscillator.start(audioCtx.currentTime + i * 0.15);
    oscillator.stop(audioCtx.currentTime + i * 0.15 + 0.6);
  });
};

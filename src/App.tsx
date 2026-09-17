import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Lock, Pause, Play, Volume2 } from 'lucide-react';
import TextHeart from './components/TextHeart';

const melody = [
  { note: 261.63, beats: 2 }, { note: 329.63, beats: 2 },
  { note: 392, beats: 3 }, { note: 329.63, beats: 1 },
  { note: 293.66, beats: 2 }, { note: 349.23, beats: 2 },
  { note: 440, beats: 3 }, { note: 392, beats: 1 },
  { note: 329.63, beats: 2 }, { note: 392, beats: 2 },
  { note: 523.25, beats: 2 }, { note: 493.88, beats: 2 },
  { note: 440, beats: 2 }, { note: 392, beats: 2 },
  { note: 329.63, beats: 4 },
];

function MusicPlayer() {
  const [playing, setPlaying] = useState(false);
  const contextRef = useRef<AudioContext | null>(null);
  const timerRef = useRef<number | null>(null);
  const stepRef = useRef(0);

  const stop = useCallback(() => {
    if (timerRef.current) window.clearTimeout(timerRef.current);
    timerRef.current = null;
    setPlaying(false);
  }, []);

  const playNext = useCallback(function scheduleNote() {
    const context = contextRef.current;
    if (!context) return;
    const { note, beats } = melody[stepRef.current % melody.length];
    const now = context.currentTime;
    const duration = beats * 0.32;
    const gain = context.createGain();
    const tone = context.createOscillator();
    const warmth = context.createOscillator();
    tone.type = 'sine';
    warmth.type = 'triangle';
    tone.frequency.value = note;
    warmth.frequency.value = note / 2;
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.045, now + 0.08);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
    tone.connect(gain);
    warmth.connect(gain);
    gain.connect(context.destination);
    tone.start(now);
    warmth.start(now);
    tone.stop(now + duration);
    warmth.stop(now + duration);
    stepRef.current += 1;
    timerRef.current = window.setTimeout(scheduleNote, duration * 1000);
  }, []);

  const toggle = async (event: React.MouseEvent) => {
    event.stopPropagation();
    if (playing) return stop();
    if (!contextRef.current) contextRef.current = new AudioContext();
    await contextRef.current.resume();
    setPlaying(true);
    playNext();
  };

  useEffect(() => () => {
    if (timerRef.current) window.clearTimeout(timerRef.current);
    void contextRef.current?.close();
  }, []);

  return (
    <button className={`music-player ${playing ? 'is-playing' : ''}`} onClick={toggle} aria-label={playing ? 'Müziği duraklat' : 'Müziği çal'}>
      <span className="music-icon">{playing ? <Pause size={15} /> : <Play size={15} fill="currentColor" />}</span>
      <span className="music-copy"><strong>bizim melodimiz</strong><small>{playing ? 'şimdi çalıyor' : 'dinlemek için dokun'}</small></span>
      <span className="sound-bars" aria-hidden="true"><i /><i /><i /><i /></span>
    </button>
  );
}

function HeartbeatLine() {
  return (
    <div className="heartbeat-wrap" aria-hidden="true">
      <div className="heartbeat-label"><Volume2 size={12} /><span>72 BPM</span></div>
      <svg viewBox="0 0 900 100" preserveAspectRatio="none">
        <motion.path
          d="M0 52 H235 L250 48 L263 54 L279 52 L294 83 L316 12 L337 70 L354 52 H900"
          initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 2.4, delay: 1.2, ease: 'easeInOut' }}
        />
      </svg>
      <span className="heartbeat-pulse" />
    </div>
  );
}

const Typewriter = ({ text, delay = 50, onComplete }: { text: string, delay?: number, onComplete?: () => void }) => {
  const [currentText, setCurrentText] = useState("");
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (index < text.length) {
      const timeout = setTimeout(() => {
        setCurrentText(prev => prev + text[index]);
        setIndex(prev => prev + 1);
      }, delay);
      return () => clearTimeout(timeout);
    } else if (onComplete) {
      onComplete();
    }
  }, [index, text, delay, onComplete]);

  return <span className="font-mono">{currentText}</span>;
};

export default function App() {
  const [stage, setStage] = useState<'console' | 'reveal'>('console');
  const [consoleFinished, setConsoleFinished] = useState(false);

  const handleReveal = useCallback(() => {
    if (stage === 'console' && consoleFinished) {
      setStage('reveal');
    }
  }, [stage, consoleFinished]);

  return (
    <div 
      onClick={handleReveal}
      className={`relative min-h-screen w-full flex items-center justify-center bg-[#050505] selection:bg-pink-deep/30 ${stage === 'console' && consoleFinished ? 'cursor-pointer' : ''}`}
    >
      <div className="scanline" />
      
      <AnimatePresence mode="wait">
        {stage === 'console' ? (
          <motion.div
            key="console"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            className="w-full max-w-2xl p-8 font-mono text-sm md:text-base text-white/80"
          >
            <div className="space-y-2">
              <div className="flex gap-2 text-pink-soft/60">
                <span>[system]</span>
                <Typewriter 
                  text="Initializing heart.PROTOCOL_v2.0..." 
                  delay={30} 
                  onComplete={() => setConsoleFinished(true)}
                />
              </div>
              
              <div className="flex gap-2 h-6">
                <span>[status]</span>
                {consoleFinished && (
                    <motion.span 
                        initial={{ opacity: 0 }} 
                        animate={{ opacity: 1 }} 
                        className="text-green-400"
                    >
                        READY
                    </motion.span>
                )}
              </div>

              {consoleFinished && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="pt-8 flex flex-col items-start gap-6"
                >
                  <p className="text-white/40 italic">
                    {">"} One encrypted package found for you.
                  </p>
                  
                  <button
                    id="decrypt-button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setStage('reveal');
                    }}
                    className="group flex items-center gap-3 px-6 py-3 border border-pink-deep/30 bg-pink-deep/5 hover:bg-pink-deep/10 text-pink-soft transition-all duration-300 pointer-events-auto"
                  >
                    <Lock size={16} className="group-hover:rotate-12 transition-transform" />
                    <span className="font-mono tracking-widest uppercase text-xs">Decrypt Message</span>
                    <span className="terminal-cursor" />
                  </button>
                  
                  <p className="text-[10px] text-white/20 animate-pulse">
                    (or just click anywhere)
                  </p>
                </motion.div>
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="reveal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="relative w-full h-screen flex items-center justify-center overflow-hidden"
          >
            <div className="mira-backdrop" aria-hidden="true">MİRA</div>
            <HeartbeatLine />
            <TextHeart />
            
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 3, duration: 1.5 }}
              className="z-20 text-center"
            >
              <p className="reveal-kicker">yalnızca senin için</p>
              <h2 className="text-pink-deep font-mono text-xl tracking-[0.3em] uppercase glow-text mb-2">
                MİRA
              </h2>
              <div className="w-12 h-px bg-pink-deep/30 mx-auto mb-8" />
              
              <motion.button
                onClick={(e) => {
                  e.stopPropagation();
                  setStage('console');
                }}
                className="text-white/20 hover:text-white/60 transition-colors uppercase text-[10px] tracking-widest font-mono"
              >
                yeniden şifrele
              </motion.button>
            </motion.div>

            <MusicPlayer />

            {/* Subtle tech overlays */}
            <div className="absolute top-8 left-8 text-[10px] font-mono text-white/10 uppercase tracking-widest space-y-1">
                <div>ln: 420</div>
                <div>id: 0xDEADBEEF</div>
                <div>type: organic_emotion</div>
            </div>
            
            <div className="absolute bottom-8 right-8 text-[10px] font-mono text-white/10 uppercase tracking-widest">
                heart_reveal // mira
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

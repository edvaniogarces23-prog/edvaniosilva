/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, FormEvent, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, Heart, Sparkles as SparklesIcon, Check, ArrowRight, Clock, Settings, X } from 'lucide-react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshDistortMaterial, Sphere, Sparkles } from '@react-three/drei';
import Lenis from 'lenis';

// 3D Background & Flyer Element
function Scene() {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none bg-[#050505]">
      <Canvas 
        camera={{ position: [0, 0, 8], fov: 45 }} 
        dpr={[1, 2]}
      >
        <ambientLight intensity={1} />
        <pointLight position={[10, 10, 10]} intensity={2} color="#d4a373" />
        <pointLight position={[-10, -10, 10]} intensity={1.5} color="#ffffff" />
        <spotLight position={[0, 10, 0]} angle={0.3} penumbra={1} intensity={2} color="#d4a373" />
        
        {/* The "Flyer" - A 3D Floating Glass Plate */}
        <Float speed={2} rotationIntensity={1} floatIntensity={1}>
          <group position={[0, 0, 0]}>
            <mesh rotation={[0, 0, 0]}>
              <boxGeometry args={[4.5, 6, 0.1]} />
              <MeshDistortMaterial
                color="#d4a373"
                speed={2}
                distort={0.1}
                radius={1}
                metalness={0.9}
                roughness={0.1}
                transparent
                opacity={0.15}
              />
            </mesh>
            <mesh position={[0, 0, -0.05]}>
              <boxGeometry args={[4.6, 6.1, 0.05]} />
              <meshStandardMaterial color="#d4a373" metalness={1} roughness={0.1} wireframe opacity={0.3} transparent />
            </mesh>
          </group>
        </Float>

        {/* Ambient Particles */}
        <Sparkles 
          count={100}
          scale={15}
          size={2}
          speed={0.5}
          opacity={0.4}
          color="#d4a373"
        />

        {/* Floating Blobs (Igloo Style) */}
        <Float speed={4} rotationIntensity={0.5} floatIntensity={2}>
          <Sphere args={[1, 64, 64]} position={[-4, 2, -2]} scale={1.5}>
            <MeshDistortMaterial color="#1a1a1a" speed={3} distort={0.6} />
          </Sphere>
        </Float>
        <Float speed={3} rotationIntensity={0.5} floatIntensity={1.5}>
          <Sphere args={[1, 64, 64]} position={[5, -3, -1]} scale={1.2}>
            <MeshDistortMaterial color="#d4a373" speed={2} distort={0.4} opacity={0.2} transparent />
          </Sphere>
        </Float>
      </Canvas>
      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black opacity-60 pointer-events-none" />
    </div>
  );
}

// Letter Animation Component
const RevealText = ({ text, className = "" }: { text: string; className?: string }) => {
  const letters = Array.from(text);
  const container = {
    hidden: { opacity: 0 },
    visible: (i = 1) => ({
      opacity: 1,
      transition: { staggerChildren: 0.03, delayChildren: 0.04 * i },
    }),
  };

  const child = {
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring" as const,
        damping: 12,
        stiffness: 100,
      },
    },
    hidden: {
      opacity: 0,
      y: 20,
    },
  };

  return (
    <motion.div
      style={{ display: "inline-block", overflow: "hidden" }}
      variants={container}
      initial="hidden"
      animate="visible"
      className={className}
    >
      {letters.map((letter, index) => (
        <motion.span
          variants={child}
          key={index}
          className="inline-block"
          style={{ whiteSpace: letter === " " ? "pre" : "normal" }}
        >
          {letter}
        </motion.span>
      ))}
    </motion.div>
  );
};

// Countdown Component
const Countdown = ({ targetDate }: { targetDate: Date }) => {
  const [timeLeft, setTimeLeft] = useState<{ d: number; h: number; m: number; s: number }>({ d: 0, h: 0, m: 0, s: 0 });

  useEffect(() => {
    const targetTimestamp = targetDate.getTime();
    
    const updateTimer = () => {
      const now = new Date().getTime();
      const difference = targetTimestamp - now;

      if (difference <= 0) {
        setTimeLeft({ d: 0, h: 0, m: 0, s: 0 });
        return false;
      }

      setTimeLeft({
        d: Math.floor(difference / (1000 * 60 * 60 * 24)),
        h: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        m: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
        s: Math.floor((difference % (1000 * 60)) / 1000),
      });
      return true;
    };

    updateTimer();
    const timer = setInterval(() => {
      if (!updateTimer()) clearInterval(timer);
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate.getTime()]); // Use primitive value for stability

  const isPast = targetDate.getTime() < new Date().getTime();

  if (isPast) {
    return (
      <div className="text-accent font-serif italic text-lg tracking-widest px-4">
        O evento já começou
      </div>
    );
  }

  return (
    <div className="flex gap-4 font-sans text-xs uppercase tracking-[0.3em] text-accent/60">
      <div className="flex flex-col items-center">
        <span className="text-xl font-light text-white mb-1">{String(timeLeft.d).padStart(2, '0')}</span>
        <span>Dias</span>
      </div>
      <div className="text-xl mt-1 opacity-20">:</div>
      <div className="flex flex-col items-center">
        <span className="text-xl font-light text-white mb-1">{String(timeLeft.h).padStart(2, '0')}</span>
        <span>Hrs</span>
      </div>
      <div className="text-xl mt-1 opacity-20">:</div>
      <div className="flex flex-col items-center">
        <span className="text-xl font-light text-white mb-1">{String(timeLeft.m).padStart(2, '0')}</span>
        <span>Min</span>
      </div>
      <div className="text-xl mt-1 opacity-20">:</div>
      <div className="flex flex-col items-center">
        <span className="text-xl font-light text-white mb-1">{String(timeLeft.s).padStart(2, '0')}</span>
        <span>Seg</span>
      </div>
    </div>
  );
};

// Error Boundary Component
import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#050505] flex items-center justify-center p-10 text-center">
          <div className="max-w-md">
            <h2 className="font-serif text-3xl text-accent mb-4">Algo correu mal</h2>
            <p className="text-white/40 mb-8 lowercase tracking-wider">Houve um erro técnico. Por favor, limpe os dados do site ou tente novamente.</p>
            <button 
              onClick={() => {
                localStorage.removeItem('dinner_config');
                window.location.reload();
              }}
              className="px-8 py-4 bg-accent text-black rounded-full text-xs font-bold uppercase tracking-widest"
            >
              Recarregar App
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Configuration Constants
const DEFAULT_CONFIG = {
  place: 'Lugar Especial',
  date: '2026-12-31T20:30:00',
  guestName: '',
  headlineTop: 'Uma Noite',
  headlineAccent: 'Inesquecível',
  description: 'Convido você para uma noite de elegância, boa música e conversas que valem ouro.',
  tags: 'Conversas boas, Boa companhia, Muito flerte',
  footer1: 'Traje Formal',
  footer2: 'Serviço de Manobrista Incluído'
};

export default function App() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [isConfigOpen, setIsConfigOpen] = useState(false);

  // OWNER CHECK (Determined by the absence of the 'inv' parameter)
  const isOwner = !new URLSearchParams(window.location.search).has('inv');

  // Configuration State with robust migration
  const [config, setConfig] = useState(() => {
    // Check URL for guest data first (so they see the settings you defined)
    const params = new URLSearchParams(window.location.search);
    const encodedData = params.get('inv');
    
    if (encodedData) {
      try {
        // Restore from URL Safe Base64
        const base64 = encodedData
          .replace(/-/g, '+')
          .replace(/_/g, '/');
        const pad = base64.length % 4;
        const paddedBase64 = pad ? base64 + '='.repeat(4 - pad) : base64;
        
        // Safe decoding for Unicode characters
        const decoded = decodeURIComponent(escape(atob(paddedBase64)));
        return { ...DEFAULT_CONFIG, ...JSON.parse(decoded) };
      } catch (e) {
        console.error("Erro ao decodificar dados do convite");
      }
    }

    try {
      const saved = localStorage.getItem('dinner_config');
      if (!saved) return DEFAULT_CONFIG;
      const parsed = JSON.parse(saved);
      return { ...DEFAULT_CONFIG, ...parsed };
    } catch {
      return DEFAULT_CONFIG;
    }
  });

  // Helper to generate shareable link
  const generateInviteLink = () => {
    const baseUrl = window.location.origin + window.location.pathname;
    // Safe encoding for Unicode characters (accents, etc)
    const str = JSON.stringify(config);
    const encoded = btoa(unescape(encodeURIComponent(str)))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, ''); // URL Safe Base64
    return `${baseUrl}?inv=${encoded}`;
  };

  const eventDate = new Date(config.date || DEFAULT_CONFIG.date);

  useEffect(() => {
    localStorage.setItem('dinner_config', JSON.stringify(config));
  }, [config]);

  useEffect(() => {
    const lenis = new Lenis();
    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
    return () => lenis.destroy();
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setStatus('error');
      setMessage('Por favor, insira um e-mail válido.');
      return;
    }

    setStatus('loading');

    try {
      const response = await fetch('/api/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus('success');
        setMessage(data.message || 'Presença confirmada com sucesso!');
        setEmail('');
      } else {
        setStatus('error');
        setMessage(data.error || 'Ocorreu um erro. Tente novamente.');
      }
    } catch (err) {
      setStatus('error');
      setMessage('Erro de conexão. Verifique se o servidor está rodando.');
    }
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen relative selection:bg-accent/20 font-sans">
        {/* Configuration Toggle (Floating) - Only for Owner */}
      {isOwner && (
        <button 
          onClick={() => setIsConfigOpen(true)}
          className="fixed top-24 right-8 z-[100] p-3 rounded-full bg-white/5 hover:bg-white/10 text-white/20 hover:text-accent transition-all duration-300 border border-white/5 backdrop-blur-md"
          title="Configurar Convite"
        >
          <Settings className="w-5 h-5" />
        </button>
      )}

      {/* Configuration Modal */}
      <AnimatePresence>
        {isConfigOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-xl flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-bg border border-white/10 p-10 rounded-[2.5rem] w-full max-w-2xl relative max-h-[85vh] overflow-y-auto custom-scrollbar"
            >
              <button 
                onClick={() => setIsConfigOpen(false)}
                className="absolute top-6 right-6 p-2 text-white/40 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
              
              <div className="flex items-center gap-4 mb-8">
                <div className="p-3 rounded-2xl bg-accent/10 text-accent">
                  <Settings className="w-6 h-6" />
                </div>
                <h2 className="font-serif text-3xl tracking-tight">Personalizar Convite</h2>
              </div>
              
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <label className="block text-[10px] uppercase tracking-[0.3em] text-white/40 mb-3 ml-2">Nome da Convidada</label>
                    <input 
                      type="text" 
                      placeholder="Ex: Maria"
                      value={config.guestName}
                      onChange={(e) => setConfig({ ...config, guestName: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-accent/40 text-white transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-[0.3em] text-white/40 mb-3 ml-2">Local do Encontro</label>
                    <input 
                      type="text" 
                      value={config.place}
                      onChange={(e) => setConfig({ ...config, place: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-accent/40 text-white transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-[0.3em] text-white/40 mb-3 ml-2">Data e Hora</label>
                    <input 
                      type="datetime-local" 
                      value={(config.date || DEFAULT_CONFIG.date).split('.')[0]}
                      onChange={(e) => setConfig({ ...config, date: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-accent/40 text-white transition-all font-sans"
                    />
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-[10px] uppercase tracking-[0.3em] text-white/40 mb-3 ml-2">Título Parte 1</label>
                    <input 
                      type="text" 
                      value={config.headlineTop}
                      onChange={(e) => setConfig({ ...config, headlineTop: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-accent/40 text-white transition-all font-serif"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-[0.3em] text-white/40 mb-3 ml-2">Título Destaque</label>
                    <input 
                      type="text" 
                      value={config.headlineAccent}
                      onChange={(e) => setConfig({ ...config, headlineAccent: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-accent/40 text-accent transition-all font-serif italic"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-[0.3em] text-white/40 mb-3 ml-2">Breve Descrição</label>
                    <textarea 
                      rows={2}
                      value={config.description}
                      onChange={(e) => setConfig({ ...config, description: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-accent/40 text-white transition-all resize-none text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-[0.3em] text-white/40 mb-3 ml-2">Tags (Separadas por vírgula)</label>
                    <input 
                      type="text" 
                      value={config.tags}
                      onChange={(e) => setConfig({ ...config, tags: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-accent/40 text-white transition-all text-xs"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] uppercase tracking-[0.3em] text-white/40 mb-3 ml-2">Rodapé 1</label>
                      <input 
                        type="text" 
                        value={config.footer1}
                        onChange={(e) => setConfig({ ...config, footer1: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 outline-none focus:border-accent/40 text-white/60 transition-all text-[10px]"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase tracking-[0.3em] text-white/40 mb-3 ml-2">Rodapé 2</label>
                      <input 
                        type="text" 
                        value={config.footer2}
                        onChange={(e) => setConfig({ ...config, footer2: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 outline-none focus:border-accent/40 text-white/60 transition-all text-[10px]"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-10 pt-8 border-t border-white/5 flex flex-col gap-6">
                <div className="bg-black/60 p-6 rounded-2xl border border-accent/20">
                  <p className="text-[10px] uppercase tracking-widest text-accent mb-3 font-bold flex items-center gap-2">
                    <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                    Importante: Envie este link abaixo
                  </p>
                  <p className="text-[9px] text-white/40 mb-4 leading-relaxed">
                    Não envie o link que aparece no topo do seu navegador (Google Studio). Use o link gerado aqui:
                  </p>
                  <div className="flex flex-col gap-3">
                    <input 
                      readOnly 
                      value={generateInviteLink()}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-[10px] text-accent font-mono outline-none focus:border-accent/30 transition-all"
                      onClick={(e) => (e.target as HTMLInputElement).select()}
                    />
                    <button 
                      onClick={() => {
                        const link = generateInviteLink();
                        navigator.clipboard.writeText(link);
                        alert("LINK COPIADO!\n\nEste é o link correto que deve enviar para a convidada. Não use o link da barra de endereços do seu navegador.");
                      }}
                      className="w-full bg-accent text-black py-4 rounded-xl text-[10px] font-bold hover:bg-accent/80 transition-all uppercase tracking-widest"
                    >
                      Copiar Link do Convite
                    </button>
                  </div>
                  <button 
                    onClick={() => window.open(generateInviteLink(), '_blank')}
                    className="w-full mt-4 bg-white/5 text-white/40 py-3 rounded-xl text-[9px] font-medium border border-white/5 hover:bg-white/10 transition-all uppercase tracking-[0.2em]"
                  >
                    Provar link agora (Abre nova aba)
                  </button>
                </div>
                
                <button 
                  onClick={() => setIsConfigOpen(false)}
                  className="w-full bg-white/5 text-white/60 py-5 rounded-2xl font-bold uppercase tracking-[0.2em] text-[10px] hover:bg-white/10 transition-all border border-white/10"
                >
                  Fechar Configurações
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Three.js Background */}
      <Scene />
      
      {/* Decorative Atmosphere */}
      <div className="absolute inset-0 theme-gradient opacity-20 pointer-events-none" />
      <div className="absolute top-1/2 left-[-5%] w-[400px] h-[400px] bg-accent rounded-full blur-[200px] opacity-[0.05] pointer-events-none" />
      <div className="absolute bottom-1/2 right-[-5%] w-[400px] h-[400px] bg-accent rounded-full blur-[200px] opacity-[0.05] pointer-events-none" />

      {/* Navigation Rail */}
      <nav className="absolute top-0 w-full p-12 flex justify-between items-center z-20">
        <div className="text-[11px] uppercase tracking-[0.5em] text-accent font-bold">Convite Exclusivo</div>
        <div className="text-[10px] text-white/30 uppercase tracking-[0.3em]">№ {Math.floor(Math.random() * 1000)}/24</div>
      </nav>

      {/* Main Content */}
      <main className="relative z-10 flex flex-col items-center justify-center min-h-screen max-w-3xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="mb-12">
            <div className="flex flex-col items-center gap-4 mb-6">
              <span className="text-[11px] uppercase tracking-[0.4em] text-white/40 block italic">
                <RevealText text="Reserva Exclusiva" />
              </span>
              <AnimatePresence>
                {config.guestName && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="px-4 py-1.5 rounded-full border border-accent/20 bg-accent/5 text-accent text-[10px] uppercase tracking-[0.3em] font-bold"
                  >
                    Olá, {config.guestName}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            <h1 className="font-serif text-7xl md:text-9xl font-light leading-[0.85] tracking-tighter mb-10 text-white">
              <RevealText text={config.headlineTop} /> <br /> 
              <span className="italic text-accent">
                <RevealText text={config.headlineAccent} />
              </span>
            </h1>

            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="max-w-xl mx-auto text-white/50 font-light leading-relaxed mb-10 text-lg italic"
            >
              "{config.description}"
            </motion.p>
            <motion.div 
               initial={{ scaleX: 0 }} 
               animate={{ scaleX: 1 }} 
               transition={{ duration: 1.5, delay: 0.5 }}
               className="h-[1px] w-32 bg-gradient-to-r from-transparent via-accent to-transparent mx-auto opacity-50 mb-8" 
            />
            <div className="flex flex-wrap justify-center gap-4 text-[10px] uppercase tracking-[0.4em] text-accent/80 font-medium">
               {(config.tags || DEFAULT_CONFIG.tags).split(',').map((tag: string, i: number) => (
                 <div key={i} className="flex items-center gap-4">
                    <RevealText text={tag.trim()} />
                    {i < (config.tags || DEFAULT_CONFIG.tags).split(',').length - 1 && (
                      <span className="text-white/10 hidden md:block">•</span>
                    )}
                 </div>
               ))}
            </div>
          </div>

          <div className="flex flex-col items-center gap-8 mb-16 px-4">
            <div className="flex flex-col items-center gap-2">
              <div className="text-2xl font-light tracking-wide text-white/90">{config.place}</div>
              <div className="text-sm uppercase tracking-[0.3em] text-white/40 font-light italic">
                {eventDate.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })} • {eventDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
            
            {/* Visual Countdown */}
            <div className="bg-white/5 p-8 rounded-[2rem] border border-white/5 backdrop-blur-sm">
              <Countdown targetDate={eventDate} />
            </div>
          </div>

          {/* Interaction Area */}
          <div className="w-full max-w-md mx-auto">
            <AnimatePresence mode="wait">
              {status === 'success' ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="p-8 border border-white/10 bg-white/5 backdrop-blur-md rounded-3xl flex flex-col items-center gap-4 shadow-2xl"
                >
                  <div className="w-16 h-16 border border-accent/30 rounded-full flex items-center justify-center text-accent">
                    <Heart className="w-8 h-8 fill-accent/20" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-light mb-2 tracking-wide">Convite Confirmado</h3>
                    <p className="text-sm text-white/40 italic uppercase tracking-[0.1em] max-w-[250px]">
                      {message || 'Nos encontramos em breve.'}
                    </p>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <form
                    onSubmit={handleSubmit}
                    className="relative flex items-center bg-white/5 border border-white/10 p-1.5 rounded-full shadow-2xl backdrop-blur-sm group transition-all focus-within:border-accent/40"
                  >
                    <input
                      type="email"
                      required
                      placeholder="Seu endereço de e-mail..."
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="bg-transparent border-none focus:ring-0 text-sm py-4 px-8 flex-grow text-white placeholder-white/20 tracking-wide outline-none w-full"
                    />
                    <button
                      type="submit"
                      disabled={status === 'loading'}
                      className="bg-accent hover:bg-[#c59465] text-black text-[10px] font-black uppercase tracking-[0.2em] px-10 py-5 rounded-full transition-all duration-300 disabled:opacity-50 whitespace-nowrap"
                    >
                      {status === 'loading' ? 'Enviando...' : 'Confirmar'}
                    </button>
                  </form>
                  {status === 'error' && (
                    <p className="mt-4 text-[10px] text-accent italic uppercase tracking-[0.2em]">{message}</p>
                  )}
                  <p className="mt-10 text-[9px] uppercase tracking-[0.4em] text-white/20 leading-relaxed max-w-xs mx-auto">
                    Um convite digital será enviado <br /> para ambos os participantes após a confirmação.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </main>

      {/* Footer Content */}
      <footer className="absolute bottom-12 w-full px-12 flex justify-between items-end text-white/20 z-20">
        <div className="flex flex-col gap-1.5 text-left">
          <div className="text-[9px] uppercase tracking-[0.3em] font-medium">{config.footer1}</div>
          <div className="text-[9px] uppercase tracking-[0.3em] font-medium">{config.footer2}</div>
        </div>
        
        <div className="w-24 h-24 border border-white/5 rounded-full flex items-center justify-center group hover:border-accent/20 transition-colors duration-500">
           <Heart className="w-6 h-6 opacity-20 group-hover:opacity-100 group-hover:text-accent transition-all duration-700" />
        </div>

        <div className="text-[9px] uppercase tracking-[0.6em] font-light" style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>
          MCMXXIII
        </div>
      </footer>
    </div>
    </ErrorBoundary>
  );
}

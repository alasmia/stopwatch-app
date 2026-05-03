import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { Play, Square, RotateCcw, Clock, Trophy, Zap, Target, Award } from 'lucide-react'
import './index.css'

interface Lap {
  id: number
  time: number
}

function ParticleField() {
  const particles = useMemo(() => 
    [...Array(50)].map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 1 + Math.random() * 3,
      duration: 10 + Math.random() * 20,
      delay: Math.random() * 10,
      hue: 180 + Math.random() * 60
    })), [])

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full opacity-40"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            background: `hsla(${p.hue}, 100%, 60%, 0.8)`,
            boxShadow: `0 0 ${p.size * 2}px hsla(${p.hue}, 100%, 60%, 0.5)`
          }}
          animate={{
            y: [-20, 20, -20],
            x: [0, p.size * 2, 0],
            opacity: [0.2, 0.6, 0.2],
            scale: [1, 1.5, 1]
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: "easeInOut"
          }}
        />
      ))}
    </div>
  )
}

function PulseRing({ delay = 0, size = 200 }: { delay?: number; size?: number }) {
  return (
    <motion.div
      className="absolute rounded-full border border-primary-500/20"
      style={{ width: size, height: size }}
      animate={{
        scale: [1, 1.3, 1],
        opacity: [0.3, 0, 0.3],
      }}
      transition={{
        duration: 4,
        repeat: Infinity,
        delay,
        ease: "easeOut"
      }}
    />
  )
}

function MorphingBlob() {
  return (
    <motion.div
      className="absolute -top-40 -right-40 w-80 h-80 opacity-20"
      animate={{
        borderRadius: ["60% 40% 30% 70% / 60% 30% 70% 40%", "30% 60% 70% 40% / 50% 60% 30% 60%", "60% 40% 30% 70% / 60% 30% 70% 40%"],
        rotate: [0, 180, 360]
      }}
      transition={{
        duration: 20,
        repeat: Infinity,
        ease: "easeInOut"
      }}
      style={{
        background: "linear-gradient(135deg, rgba(0,200,255,0.3), rgba(255,71,87,0.3))",
        filter: "blur(40px)"
      }}
    />
  )
}

function WaveEffect({ active }: { active: boolean }) {
  const waves = useMemo(() => 
    [...Array(5)].map((_, i) => ({ id: i, delay: i * 0.2 })), []
  )

  if (!active) return null

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {waves.map((w) => (
        <motion.div
          key={w.id}
          className="absolute inset-0"
          initial={{ scale: 0.8, opacity: 0.5 }}
          animate={{ scale: 1.5, opacity: 0 }}
          transition={{
            duration: 2,
            delay: w.delay,
            repeat: Infinity,
            ease: "easeOut"
          }}
          style={{
            border: "2px solid rgba(0, 200, 255, 0.3)",
            borderRadius: "50%"
          }}
        />
      ))}
    </div>
  )
}

function App() {
  const [time, setTime] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const [laps, setLaps] = useState<Lap[]>([])
  const [showLaps, setShowLaps] = useState(false)
  const [waveActive, setWaveActive] = useState(false)
  const intervalRef = useRef<number | null>(null)
  
  const shouldReduceMotion = useReducedMotion()

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = window.setInterval(() => {
        setTime(t => t + 10)
      }, 10)
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [isRunning])

  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / 60000)
    const seconds = Math.floor((ms % 60000) / 1000)
    const centiseconds = Math.floor((ms % 1000) / 10)
    return {
      minutes: minutes.toString().padStart(2, '0'),
      seconds: seconds.toString().padStart(2, '0'),
      centiseconds: centiseconds.toString().padStart(2, '0')
    }
  }

  const { minutes, seconds, centiseconds } = formatTime(time)

  const handleStartStop = useCallback(() => {
    if (!isRunning) {
      setWaveActive(true)
      setTimeout(() => setWaveActive(false), 2000)
    }
    setIsRunning(prev => !prev)
  }, [isRunning])

  const handleReset = useCallback(() => { 
    setIsRunning(false); 
    setTime(0); 
    setLaps([]); 
    setShowLaps(false) 
  }, [])

  const handleLap = useCallback(() => { 
    if (isRunning) { 
      setLaps(prev => [...prev, { id: Date.now(), time }]); 
      setShowLaps(true) 
    } 
  }, [isRunning, time])

  const bestLap = laps.length > 1 
    ? Math.min(...laps.slice(1).map((l, i) => l.time - laps[i].time))
    : null
  const avgLap = laps.length > 1 
    ? Math.round(laps.slice(1).reduce((acc, l, i) => acc + (l.time - laps[i].time), 0) / (laps.length - 1))
    : null

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden">
      {/* Particle Field */}
      {!shouldReduceMotion && <ParticleField />}

      {/* Morphing Background Blob */}
      {!shouldReduceMotion && <MorphingBlob />}

      {/* Pulse Rings */}
      {!shouldReduceMotion && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <PulseRing delay={0} size={200} />
          <PulseRing delay={0.8} size={250} />
          <PulseRing delay={1.6} size={300} />
        </div>
      )}

      {/* Wave Effect on Start */}
      <WaveEffect active={waveActive} />

      {/* Main Content */}
      <div className="relative z-10 w-full max-w-lg mx-auto px-4 py-8 sm:py-12">
        
        {/* Header Badge */}
        <motion.div 
          className="text-center mb-8"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, type: "spring" }}
        >
          <motion.div 
            className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-white/5 backdrop-blur-xl border border-white/10"
            whileHover={{ scale: 1.05 }}
            animate={isRunning ? {
              boxShadow: ["0 0 20px rgba(0,200,255,0.2)", "0 0 40px rgba(0,200,255,0.4)", "0 0 20px rgba(0,200,255,0.2)"]
            } : {}}
            transition={{ duration: 2, repeat: isRunning ? Infinity : 0 }}
          >
            <Zap className="w-5 h-5 text-primary-400" />
            <span className="text-sm font-semibold text-white/90 uppercase tracking-widest">Stopwatch Pro</span>
            <motion.div
              className="w-2 h-2 rounded-full bg-green-400"
              animate={isRunning ? { scale: [1, 1.3, 1], opacity: [1, 0.7, 1] } : {}}
              transition={{ duration: 1, repeat: isRunning ? Infinity : 0 }}
            />
          </motion.div>
        </motion.div>

        {/* Timer Display */}
        <motion.div 
          className="relative mb-8 sm:mb-12"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          {/* Glow Card */}
          <div className="relative backdrop-blur-2xl bg-white/[0.03] border border-white/10 rounded-[2rem] p-8 sm:p-12 shadow-2xl overflow-hidden">
            
            {/* Grid Pattern Overlay */}
            <div 
              className="absolute inset-0 opacity-5"
              style={{
                backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
                backgroundSize: "40px 40px"
              }}
            />

            {/* Running Status */}
            <AnimatePresence>
              {isRunning && (
                <motion.div 
                  className="absolute top-6 right-6 sm:right-8 flex items-center gap-2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                >
                  <motion.div 
                    className="w-2 h-2 rounded-full bg-green-400"
                    animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  />
                  <span className="text-green-400 text-xs font-bold uppercase tracking-wider">Running</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Timer Text */}
            <div className="text-center relative">
              <motion.div 
                className="font-bold text-6xl sm:text-7xl md:text-8xl tracking-tighter text-white"
                animate={isRunning ? {
                  textShadow: ["0 0 40px rgba(0,200,255,0.3)", "0 0 80px rgba(0,200,255,0.6)", "0 0 40px rgba(0,200,255,0.3)"]
                } : {}}
                transition={{ duration: 1.5, repeat: isRunning ? Infinity : 0 }}
              >
                <motion.span
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={`m-${minutes}`}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="inline-block"
                >
                  {minutes}
                </motion.span>
                <motion.span 
                  className="inline-block mx-1 text-primary-400/60"
                  animate={isRunning ? { opacity: [1, 0.3, 1] } : {}}
                  transition={{ duration: 0.5, repeat: isRunning ? Infinity : 0 }}
                >
                  :
                </motion.span>
                <motion.span
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={`s-${seconds}`}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="inline-block"
                >
                  {seconds}
                </motion.span>
                <motion.span 
                  className="inline-block mx-1 text-primary-400/60"
                  animate={isRunning ? { opacity: [1, 0.3, 1] } : {}}
                  transition={{ duration: 0.5, repeat: isRunning ? Infinity : 0 }}
                >
                  .
                </motion.span>
                <motion.span
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={`c-${centiseconds}`}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="inline-block text-4xl sm:text-5xl md:text-6xl text-primary-400/80"
                >
                  {centiseconds}
                </motion.span>
              </motion.div>

              <motion.p 
                className="text-white/40 text-sm uppercase tracking-[0.3em] mt-3 font-medium"
                animate={{ opacity: isRunning ? [0.4, 1, 0.4] : 0.4 }}
                transition={{ duration: 2, repeat: isRunning ? Infinity : 0 }}
              >
                {isRunning ? '▶ Time Elapsing' : '⏸ Ready to Start'}
              </motion.p>
            </div>

            {/* Stats Row */}
            {laps.length > 1 && (
              <motion.div 
                className="flex justify-center gap-8 mt-8 pt-6 border-t border-white/10"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-yellow-400 mb-1">
                    <Trophy className="w-4 h-4" />
                    <span className="text-xs uppercase tracking-wider">Best Lap</span>
                  </div>
                  <span className="text-lg font-bold text-white font-mono">
                    +{bestLap ? `${formatTime(bestLap).minutes}:${formatTime(bestLap).seconds}.${formatTime(bestLap).centiseconds}` : '--:--.--'}
                  </span>
                </div>
                <div className="w-px bg-white/10" />
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-primary-400 mb-1">
                    <Target className="w-4 h-4" />
                    <span className="text-xs uppercase tracking-wider">Avg Lap</span>
                  </div>
                  <span className="text-lg font-bold text-white font-mono">
                    +{avgLap ? `${formatTime(avgLap).minutes}:${formatTime(avgLap).seconds}.${formatTime(avgLap).centiseconds}` : '--:--.--'}
                  </span>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Control Buttons */}
        <motion.div 
          className="flex gap-3 sm:gap-4 mb-8"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {/* Start/Stop Button */}
          <motion.button
            className={`flex-1 relative overflow-hidden py-4 sm:py-5 px-4 rounded-2xl font-bold text-base sm:text-lg flex items-center justify-center gap-2 sm:gap-3 text-white ${
              isRunning 
                ? 'bg-gradient-to-br from-rose-500 to-pink-600 shadow-lg shadow-rose-500/30' 
                : 'bg-gradient-to-br from-emerald-400 to-cyan-500 shadow-lg shadow-emerald-500/30'
            }`}
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleStartStop}
          >
            {/* Shine Effect */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
              animate={isRunning ? {} : { x: [-100, 200] }}
              transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 2 }}
              style={{ width: "50%" }}
            />
            
            <AnimatePresence mode="wait">
              <motion.div
                key={isRunning ? 'stop' : 'start'}
                initial={{ scale: 0, rotate: -90, opacity: 0 }}
                animate={{ scale: 1, rotate: 0, opacity: 1 }}
                exit={{ scale: 0, rotate: 90, opacity: 0 }}
                transition={{ duration: 0.2, type: "spring", stiffness: 400 }}
              >
                {isRunning ? <Square className="w-6 h-6" /> : <Play className="w-6 h-6" />}
              </motion.div>
            </AnimatePresence>
            <span className="relative z-10">{isRunning ? 'STOP' : 'START'}</span>
          </motion.button>

          {/* Lap Button */}
          <motion.button 
            className="py-4 sm:py-5 px-5 sm:px-6 rounded-2xl font-bold text-base flex items-center justify-center gap-2 backdrop-blur-xl bg-white/10 border border-white/20 text-white disabled:opacity-30"
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleLap}
            disabled={!isRunning}
          >
            <Clock className="w-5 h-5" />
            <span>LAP</span>
          </motion.button>

          {/* Reset Button */}
          <motion.button 
            className="py-4 sm:py-5 px-4 sm:px-6 rounded-2xl font-bold text-base flex items-center justify-center backdrop-blur-xl bg-white/5 border border-white/10 text-white/50 disabled:opacity-20"
            whileHover={{ scale: 1.05, y: -2, backgroundColor: "rgba(255,255,255,0.15)" }}
            whileTap={{ scale: 0.95 }}
            onClick={handleReset}
            disabled={time === 0}
          >
            <RotateCcw className="w-5 h-5" />
          </motion.button>
        </motion.div>

        {/* Lap Times Panel */}
        <AnimatePresence>
          {showLaps && laps.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0, y: 20 }}
              animate={{ opacity: 1, height: 'auto', y: 0 }}
              exit={{ opacity: 0, height: 0, y: 20 }}
              transition={{ type: "spring", stiffness: 100, damping: 15 }}
              className="overflow-hidden rounded-2xl backdrop-blur-xl bg-white/[0.03] border border-white/10"
            >
              <div className="p-4 sm:p-6 border-b border-white/10">
                <div className="flex items-center justify-between">
                  <motion.div 
                    className="flex items-center gap-3"
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                  >
                    <div className="p-2 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30">
                      <Award className="w-5 h-5 text-amber-400" />
                    </div>
                    <div>
                      <span className="text-white font-bold block">Lap Times</span>
                      <span className="text-white/50 text-sm">{laps.length} {laps.length === 1 ? 'lap' : 'laps'} recorded</span>
                    </div>
                  </motion.div>
                  <motion.button
                    className="p-2 rounded-xl bg-white/5 border border-white/10 text-white/50 hover:text-white hover:bg-white/10 transition-all"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setShowLaps(false)}
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                    </svg>
                  </motion.button>
                </div>
              </div>

              <div className="max-h-72 overflow-y-auto p-2 scrollbar-thin">
                <motion.div
                  initial="hidden"
                  animate="visible"
                  variants={{
                    hidden: {},
                    visible: { transition: { staggerChildren: 0.05 } }
                  }}
                >
                  {[...laps].reverse().map((lap, index) => {
                    const lapIndex = laps.length - index
                    const prevTime = laps[laps.length - lapIndex]?.time || 0
                    const split = lap.time - prevTime
                    const isBest = split === bestLap
                    const isWorst = laps.length > 2 && split === Math.max(...laps.slice(1).map((l, i) => l.time - laps[i].time))

                    return (
                      <motion.div
                        key={lap.id}
                        variants={{
                          hidden: { opacity: 0, x: -30, scale: 0.9 },
                          visible: { opacity: 1, x: 0, scale: 1 }
                        }}
                        className={`flex items-center justify-between p-3 sm:p-4 rounded-xl mb-1 transition-all ${
                          isBest 
                            ? 'bg-gradient-to-r from-green-500/20 to-emerald-500/10 border border-green-500/30' 
                            : isWorst
                            ? 'bg-gradient-to-r from-red-500/10 to-orange-500/10 border border-red-500/20'
                            : 'bg-white/[0.02] border border-transparent hover:bg-white/[0.05]'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <motion.span 
                            className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${
                              isBest 
                                ? 'bg-gradient-to-br from-green-400 to-emerald-500 text-white shadow-lg shadow-green-500/30' 
                                : 'bg-white/10 text-white/70'
                            }`}
                            whileHover={{ scale: 1.1, rotate: 5 }}
                          >
                            {lapIndex}
                          </motion.span>
                          <div>
                            <span className="text-white font-mono text-sm sm:text-base block">{formatTime(lap.time).minutes}:{formatTime(lap.time).seconds}.{formatTime(lap.time).centiseconds}</span>
                            {isBest && <span className="text-green-400 text-xs font-medium">★ Best Lap</span>}
                            {isWorst && <span className="text-red-400 text-xs font-medium">★ Slowest</span>}
                          </div>
                        </div>
                        <motion.span 
                          className={`font-mono font-bold text-sm sm:text-base ${
                            isBest ? 'text-green-400' : isWorst ? 'text-red-400' : 'text-primary-400'
                          }`}
                          animate={isBest ? { scale: [1, 1.1, 1] } : {}}
                          transition={{ duration: 0.5 }}
                        >
                          +{formatTime(split).minutes}:{formatTime(split).seconds}.{formatTime(split).centiseconds}
                        </motion.span>
                      </motion.div>
                    )
                  })}
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer */}
        <motion.div 
          className="text-center mt-8 sm:mt-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <p className="text-white/20 text-xs">
            Built with ❤️ using React + Capacitor
          </p>
          <p className="text-white/10 text-[10px] mt-1">
            Framer Motion • Tailwind CSS • Lucide Icons
          </p>
        </motion.div>
      </div>
    </div>
  )
}

export default App
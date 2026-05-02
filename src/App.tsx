import { useState, useEffect, useRef, useMemo } from 'react'
import { motion, AnimatePresence, useScroll, useSpring } from 'framer-motion'
import { Play, Square, RotateCcw, Clock, Trophy, Zap, Target, Award, ChevronUp } from 'lucide-react'
import '@fontsource/inter/400.css'
import '@fontsource/inter/600.css'
import '@fontsource/inter/700.css'
import '@fontsource/space-grotesk/500.css'
import '@fontsource/space-grotesk/700.css'
import './index.css'

interface Lap {
  id: number
  time: number
}

function FloatingParticles() {
  const particles = useMemo(() => 
    [...Array(30)].map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 5,
      duration: 5 + Math.random() * 5,
      size: 2 + Math.random() * 4
    })), [])

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: `${p.x}%`,
            width: p.size,
            height: p.size,
            background: `linear-gradient(135deg, hsl(${180 + Math.random() * 40}, 100%, 60%), hsl(${200 + Math.random() * 40}, 100%, 50%))`,
          }}
          initial={{ y: '100vh', opacity: 0.8 }}
          animate={{ 
            y: '-10vh', 
            opacity: [0.8, 0.4, 0],
            x: [0, Math.random() * 100 - 50, 0]
          }}
          transition={{ 
            duration: p.duration, 
            repeat: Infinity, 
            delay: p.delay,
            ease: 'linear'
          }}
        />
      ))}
    </div>
  )
}

function GradientOrb({ className }: { className?: string }) {
  return (
    <div className={`absolute ${className}`}>
      <div className="w-96 h-96 rounded-full bg-gradient-to-r from-primary-500/30 via-primary-400/20 to-accent-500/30 blur-3xl animate-pulse-slow" />
    </div>
  )
}

function App() {
  const [time, setTime] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const [laps, setLaps] = useState<Lap[]>([])
  const [showLaps, setShowLaps] = useState(false)
  const intervalRef = useRef<number | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30 })

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

  const handleStartStop = () => setIsRunning(!isRunning)
  const handleReset = () => { setIsRunning(false); setTime(0); setLaps([]); setShowLaps(false) }
  const handleLap = () => { 
    if (isRunning) { 
      setLaps([...laps, { id: Date.now(), time }]); 
      setShowLaps(true) 
    } 
  }

  const bestLap = laps.length > 0 ? Math.min(...laps.map((l, i) => l.time - (laps[i - 1]?.time || 0))) : null
  const avgLap = laps.length > 0 ? Math.round(laps.reduce((acc, l, i) => acc + (l.time - (laps[i - 1]?.time || 0)), 0) / laps.length) : null

  return (
    <motion.div 
      ref={containerRef}
      className="min-h-screen bg-dark bg-gradient-to-br from-dark via-slate-900 to-slate-950 relative overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Progress bar */}
      <motion.div 
        className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary-500 to-accent-500 origin-left z-50"
        style={{ scaleX }}
      />

      {/* Floating particles */}
      <FloatingParticles />

      {/* Gradient orbs */}
      <GradientOrb className="top-0 left-0 -translate-x-1/2 -translate-y-1/2" />
      <GradientOrb className="bottom-0 right-0 translate-x-1/2 translate-y-1/2" />
      <GradientOrb className="top-1/2 right-0 translate-x-1/2" />

      {/* Main content */}
      <div className="relative z-10 w-full max-w-lg mx-auto px-4 py-8 sm:py-12">
        
        {/* Header */}
        <motion.div 
          className="text-center mb-8 sm:mb-12"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 100 }}
        >
          <motion.div 
            className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-white/5 backdrop-blur-xl border border-white/10 shadow-xl"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <motion.div
              animate={{ rotate: isRunning ? 360 : 0 }}
              transition={{ duration: 2, repeat: isRunning ? Infinity : 0, ease: 'linear' }}
            >
              <Zap className="w-5 h-5 text-primary-400" />
            </motion.div>
            <span className="text-sm sm:text-base font-semibold text-white/90 uppercase tracking-widest">Stopwatch Pro</span>
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1, repeat: isRunning ? Infinity : 0 }}
              className="w-2 h-2 rounded-full bg-green-400"
            />
          </motion.div>
        </motion.div>

        {/* Timer Display Card */}
        <motion.div 
          className="relative mb-8 sm:mb-12"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, type: 'spring', stiffness: 100, damping: 15 }}
        >
          {/* Glow effect */}
          <motion.div 
            className="absolute inset-0 rounded-[2rem] bg-gradient-to-r from-primary-500/20 via-transparent to-accent-500/20 blur-xl"
            animate={isRunning ? { opacity: [0.5, 1, 0.5] } : { opacity: 0.5 }}
            transition={{ duration: 2, repeat: isRunning ? Infinity : 0 }}
          />
          
          {/* Main card */}
          <div className="relative backdrop-blur-xl bg-white/5 border border-white/10 rounded-[2rem] p-8 sm:p-12 shadow-2xl">
            
            {/* Running indicator */}
            <AnimatePresence>
              {isRunning && (
                <motion.div 
                  className="absolute top-6 right-6 sm:right-8 flex items-center gap-2"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                >
                  <motion.div 
                    className="w-3 h-3 rounded-full bg-green-400"
                    animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  />
                  <span className="text-green-400 text-xs font-semibold uppercase tracking-wider">Running</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Timer display */}
            <div className="text-center">
              <motion.div 
                className="font-display text-6xl sm:text-7xl md:text-8xl font-extralight tracking-tight text-white mb-2"
                style={{ textShadow: '0 0 60px rgba(0, 200, 255, 0.5), 0 0 120px rgba(0, 200, 255, 0.3)' }}
                animate={isRunning ? { scale: [1, 1.01, 1] } : {}}
                transition={{ duration: 1, repeat: isRunning ? Infinity : 0 }}
              >
                <motion.span 
                  className="inline-block"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={minutes}
                >
                  {minutes}
                </motion.span>
                <motion.span 
                  className="inline-block mx-1 text-primary-400/60"
                  animate={{ opacity: isRunning ? [1, 0.3, 1] : 1 }}
                  transition={{ duration: 1, repeat: isRunning ? Infinity : 0 }}
                >:</motion.span>
                <motion.span 
                  className="inline-block"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={seconds}
                >
                  {seconds}
                </motion.span>
                <motion.span 
                  className="inline-block mx-1 text-primary-400/60"
                  animate={{ opacity: isRunning ? [1, 0.3, 1] : 1 }}
                  transition={{ duration: 1, repeat: isRunning ? Infinity : 0 }}
                >.</motion.span>
                <motion.span 
                  className="inline-block text-4xl sm:text-5xl md:text-6xl text-primary-400/80"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={centiseconds}
                >
                  {centiseconds}
                </motion.span>
              </motion.div>

              <motion.p 
                className="text-white/50 text-sm uppercase tracking-[0.3em] font-medium"
                animate={{ opacity: isRunning ? 1 : 0.5 }}
              >
                {isRunning ? 'Time is running' : 'Ready to start'}
              </motion.p>
            </div>

            {/* Stats row */}
            {laps.length > 0 && (
              <motion.div 
                className="flex justify-center gap-8 mt-8 pt-6 border-t border-white/10"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-accent-400 mb-1">
                    <Trophy className="w-4 h-4" />
                    <span className="text-xs uppercase tracking-wider">Best</span>
                  </div>
                  <span className="text-lg font-semibold text-white font-mono">
                    +{bestLap ? `${formatTime(bestLap).minutes}:${formatTime(bestLap).seconds}.${formatTime(bestLap).centiseconds}` : '--:--.--'}
                  </span>
                </div>
                <div className="w-px bg-white/10" />
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-primary-400 mb-1">
                    <Target className="w-4 h-4" />
                    <span className="text-xs uppercase tracking-wider">Avg</span>
                  </div>
                  <span className="text-lg font-semibold text-white font-mono">
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
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <motion.button
            className={`flex-1 relative overflow-hidden py-4 sm:py-5 px-4 rounded-2xl font-bold text-base sm:text-lg flex items-center justify-center gap-2 sm:gap-3 ${
              isRunning 
                ? 'bg-gradient-to-br from-accent-500 to-accent-600 text-white shadow-lg shadow-accent-500/30' 
                : 'bg-gradient-to-br from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/30'
            }`}
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleStartStop}
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
              initial={{ x: '-100%' }}
              whileHover={{ x: '100%' }}
              transition={{ duration: 0.6 }}
            />
            <AnimatePresence mode="wait">
              <motion.div
                key={isRunning ? 'stop' : 'start'}
                initial={{ scale: 0, rotate: -180, opacity: 0 }}
                animate={{ scale: 1, rotate: 0, opacity: 1 }}
                exit={{ scale: 0, rotate: 180, opacity: 0 }}
                transition={{ duration: 0.3, type: 'spring', stiffness: 200 }}
              >
                {isRunning ? <Square className="w-6 h-6" /> : <Play className="w-6 h-6" />}
              </motion.div>
            </AnimatePresence>
            <span className="relative z-10">{isRunning ? 'STOP' : 'START'}</span>
          </motion.button>

          <motion.button 
            className="relative overflow-hidden py-4 sm:py-5 px-4 sm:px-6 rounded-2xl font-bold text-base sm:text-lg flex items-center justify-center gap-2 backdrop-blur-xl bg-white/10 border border-white/20 text-white disabled:opacity-30 disabled:cursor-not-allowed"
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleLap}
            disabled={!isRunning}
          >
            <Clock className="w-5 h-5" />
            <span>LAP</span>
          </motion.button>

          <motion.button 
            className="relative overflow-hidden py-4 sm:py-5 px-4 sm:px-6 rounded-2xl font-bold text-base sm:text-lg flex items-center justify-center gap-2 backdrop-blur-xl bg-white/5 border border-white/10 text-white/60 disabled:opacity-30 disabled:cursor-not-allowed"
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleReset}
            disabled={time === 0}
          >
            <RotateCcw className="w-5 h-5" />
          </motion.button>
        </motion.div>

        {/* Lap Times */}
        <AnimatePresence>
          {showLaps && laps.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0, y: 20 }}
              animate={{ opacity: 1, height: 'auto', y: 0 }}
              exit={{ opacity: 0, height: 0, y: 20 }}
              transition={{ type: 'spring', stiffness: 100, damping: 20 }}
              className="overflow-hidden rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10"
            >
              <div className="p-4 sm:p-6 border-b border-white/10">
                <div className="flex items-center justify-between">
                  <motion.div 
                    className="flex items-center gap-2"
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                  >
                    <div className="p-2 rounded-xl bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border border-yellow-500/30">
                      <Award className="w-5 h-5 text-yellow-400" />
                    </div>
                    <div>
                      <span className="text-white font-semibold block">Lap Times</span>
                      <span className="text-white/50 text-sm">{laps.length} laps recorded</span>
                    </div>
                  </motion.div>
                  <motion.button
                    className="p-2 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:text-white transition-colors"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setShowLaps(false)}
                  >
                    <ChevronUp className="w-5 h-5" />
                  </motion.button>
                </div>
              </div>

              <div className="max-h-72 overflow-y-auto custom-scrollbar p-2">
                <motion.div
                  initial="hidden"
                  animate="visible"
                  variants={{
                    hidden: { },
                    visible: { transition: { staggerChildren: 0.05 } }
                  }}
                >
                  {[...laps].reverse().map((lap, index) => {
                    const lapIndex = laps.length - index
                    const prevTime = laps[laps.length - lapIndex]?.time || 0
                    const split = lap.time - prevTime
                    const isBest = split === bestLap
                    const isWorst = split === Math.max(...laps.map((l, i) => l.time - (laps[i - 1]?.time || 0)))

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
                            : 'bg-white/5 border border-transparent hover:bg-white/10'
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
                            {isBest && <span className="text-green-400 text-xs">★ Best Lap</span>}
                            {isWorst && <span className="text-red-400 text-xs">★ Slowest</span>}
                          </div>
                        </div>
                        <motion.span 
                          className={`font-mono font-semibold ${
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
          transition={{ delay: 0.6 }}
        >
          <p className="text-white/30 text-xs">
            Built with ❤️ using React + Capacitor + Tailwind CSS
          </p>
          <p className="text-white/20 text-[10px] mt-1">
            Framer Motion • GSAP • Inter Font
          </p>
        </motion.div>
      </div>
    </motion.div>
  )
}

export default App
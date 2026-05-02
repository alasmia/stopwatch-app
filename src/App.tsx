import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Play, Square, RotateCcw, Clock, Trophy, Zap } from 'lucide-react'
import './index.css'

interface Lap {
  id: number
  time: number
}

function App() {
  const [time, setTime] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const [laps, setLaps] = useState<Lap[]>([])
  const [showLaps, setShowLaps] = useState(false)
  const intervalRef = useRef<number | null>(null)

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
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${centiseconds.toString().padStart(2, '0')}`
  }

  const handleStartStop = () => setIsRunning(!isRunning)
  const handleReset = () => { setIsRunning(false); setTime(0); setLaps([]); setShowLaps(false) }
  const handleLap = () => { if (isRunning) { setLaps([...laps, { id: Date.now(), time }]); setShowLaps(true) } }

  const bestLap = laps.length > 0 ? Math.min(...laps.map((l, i) => l.time - (laps[i - 1]?.time || 0))) : null

  return (
    <motion.div 
      className="min-h-screen bg-animated flex flex-col items-center justify-center p-6 relative overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500"
            initial={{ y: 800, opacity: 0.8 }}
            animate={{ y: -100, opacity: 0 }}
            transition={{ duration: 8 + Math.random() * 4, repeat: Infinity, delay: Math.random() * 5 }}
            style={{ left: `${Math.random() * 100}%` }}
          />
        ))}
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-4">
            <Zap className="w-4 h-4 text-cyan-400" />
            <span className="text-sm text-gray-300 uppercase tracking-wider">Stopwatch Pro</span>
          </div>
        </motion.div>

        {/* Timer */}
        <motion.div 
          className="relative mb-10"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, type: 'spring' }}
        >
          <motion.div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 via-blue-500/20 to-purple-500/20 rounded-3xl blur-3xl" />
          
          <div className="relative glass-strong rounded-3xl p-8 text-center">
            {isRunning && (
              <motion.div className="absolute top-4 right-4 flex items-center gap-2"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <motion.div className="w-3 h-3 rounded-full bg-green-400"
                  animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
                  transition={{ duration: 1, repeat: Infinity }} />
                <span className="text-green-400 text-xs uppercase tracking-wider">Running</span>
              </motion.div>
            )}

            <motion.div
              className="text-7xl sm:text-8xl font-extralight tracking-tight text-white"
              style={{ textShadow: '0 0 40px rgba(0, 200, 255, 0.5)' }}
              animate={isRunning ? { scale: [1, 1.01, 1] } : {}}
              transition={{ duration: 1, repeat: isRunning ? Infinity : 0 }}
            >
              {formatTime(time)}
            </motion.div>

            <motion.p className="text-gray-400 text-sm mt-4 uppercase tracking-[0.3em]"
              animate={{ opacity: isRunning ? 1 : 0.5 }}>
              {isRunning ? 'Time is running' : 'Ready to start'}
            </motion.p>
          </div>
        </motion.div>

        {/* Controls */}
        <motion.div className="flex gap-3 mb-8"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <motion.button
            className={`flex-1 py-5 px-6 rounded-2xl font-semibold text-lg flex items-center justify-center gap-3 text-white ${
              isRunning ? 'bg-gradient-to-br from-red-500 to-pink-600 shadow-lg shadow-red-500/30' : 'btn-primary'
            }`}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleStartStop}
          >
            <AnimatePresence mode="wait">
              <motion.div key={isRunning ? 'stop' : 'start'} initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }} exit={{ scale: 0, rotate: 180 }} transition={{ duration: 0.3 }}>
                {isRunning ? <Square className="w-6 h-6" /> : <Play className="w-6 h-6" />}
              </motion.div>
            </AnimatePresence>
            {isRunning ? 'STOP' : 'START'}
          </motion.button>

          <motion.button className="btn-glass py-5 px-6 rounded-2xl text-gray-300 font-semibold text-lg flex items-center justify-center gap-2"
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={handleLap} disabled={!isRunning}>
            <Clock className="w-5 h-5" /> LAP
          </motion.button>

          <motion.button className="btn-glass py-5 px-6 rounded-2xl text-gray-400 font-semibold text-lg flex items-center justify-center gap-2"
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={handleReset} disabled={time === 0}>
            <RotateCcw className="w-5 h-5" />
          </motion.button>
        </motion.div>

        {/* Laps */}
        <AnimatePresence>
          {showLaps && laps.length > 0 && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
              className="glass rounded-3xl overflow-hidden">
              <div className="p-4 border-b border-white/10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2"><Trophy className="w-5 h-5 text-yellow-400" /><span className="text-white font-medium">Lap Times</span></div>
                  <span className="text-gray-400 text-sm">{laps.length} laps</span>
                </div>
                {bestLap && <div className="mt-2 text-sm text-green-400">Best: +{formatTime(bestLap)}</div>}
              </div>
              <div className="max-h-64 overflow-y-auto custom-scrollbar">
                {[...laps].reverse().map((lap, index) => {
                  const lapIndex = laps.length - index
                  const prevTime = laps[laps.length - lapIndex]?.time || 0
                  const split = lap.time - prevTime
                  const isBest = split === bestLap
                  return (
                    <motion.div key={lap.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.05 }}
                      className={`px-5 py-4 flex items-center justify-between border-b border-white/5 ${isBest ? 'bg-green-500/10' : ''}`}>
                      <div className="flex items-center gap-3">
                        <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${isBest ? 'bg-green-500 text-white' : 'bg-white/10 text-gray-400'}`}>{lapIndex}</span>
                        <span className="text-white font-mono">{formatTime(lap.time)}</span>
                      </div>
                      <span className={`font-mono ${isBest ? 'text-green-400' : 'text-cyan-400'}`}>+{formatTime(split)}</span>
                    </motion.div>
                  )
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="text-center mt-8">
          <p className="text-gray-500 text-xs">Built with ❤️ using React + Capacitor + Framer Motion</p>
        </motion.div>
      </div>
    </motion.div>
  )
}

export default App
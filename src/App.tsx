import { useState, useEffect, useRef, useCallback } from 'react'
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
  const [currentDigits, setCurrentDigits] = useState({ m: '00', s: '00', c: '00' })
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

  // Update digits without causing flicker
  useEffect(() => {
    const newDigits = {
      m: String(Math.floor(time / 60000)).padStart(2, '0'),
      s: String(Math.floor((time % 60000) / 1000)).padStart(2, '0'),
      c: String(Math.floor((time % 1000) / 10)).padStart(2, '0')
    }
    setCurrentDigits(newDigits)
  }, [time])

  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / 60000)
    const seconds = Math.floor((ms % 60000) / 1000)
    const centiseconds = Math.floor((ms % 1000) / 10)
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${String(centiseconds).padStart(2, '0')}`
  }

  const handleStartStop = useCallback(() => {
    setIsRunning(prev => !prev)
  }, [])

  const handleReset = useCallback(() => { 
    setIsRunning(false)
    setTime(0)
    setLaps([])
    setShowLaps(false)
    setCurrentDigits({ m: '00', s: '00', c: '00' })
  }, [])

  const handleLap = useCallback(() => { 
    if (isRunning) { 
      setLaps(prev => [...prev, { id: Date.now(), time }])
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
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      
      {/* Fixed Background Effects - CSS Only */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* Slow moving gradient orbs */}
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-gradient-to-r from-cyan-500/10 to-blue-500/10 blur-3xl animate-slow-drift-1" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-gradient-to-r from-purple-500/10 to-pink-500/10 blur-3xl animate-slow-drift-2" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-gradient-to-r from-cyan-500/5 to-transparent blur-3xl" />
      </div>

      {/* Main Content */}
      <div className="relative z-10 w-full max-w-lg mx-auto px-4 py-8">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-white/5 backdrop-blur-xl border border-white/10">
            <span className="text-cyan-400">⚡</span>
            <span className="text-sm font-semibold text-white/90 uppercase tracking-widest">Stopwatch Pro</span>
            <div className={`w-2 h-2 rounded-full transition-colors duration-300 ${isRunning ? 'bg-green-400 animate-pulse' : 'bg-white/30'}`} />
          </div>
        </div>

        {/* Timer Display */}
        <div className="relative mb-8">
          {/* Glow effect */}
          <div className={`absolute inset-0 rounded-[2rem] bg-gradient-to-r from-cyan-500/20 via-transparent to-blue-500/20 blur-xl transition-opacity duration-500 ${isRunning ? 'opacity-100 animate-pulse-glow' : 'opacity-50'}`} />
          
          {/* Card */}
          <div className="relative backdrop-blur-2xl bg-white/[0.03] border border-white/10 rounded-[2rem] p-8 sm:p-12">
            
            {/* Status */}
            <div className={`absolute top-6 right-6 sm:right-8 flex items-center gap-2 transition-opacity duration-300 ${isRunning ? 'opacity-100' : 'opacity-0'}`}>
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-green-400 text-xs font-bold uppercase tracking-wider">Running</span>
            </div>

            {/* Timer Display - NO ANIMATION, PURE STATE */}
            <div className="text-center">
              <div className="font-bold text-6xl sm:text-7xl md:text-8xl tracking-tighter text-white" style={{ textShadow: '0 0 60px rgba(0, 200, 255, 0.3)' }}>
                <span className="inline-block min-w-[2ch]">{currentDigits.m}</span>
                <span className="inline-block mx-1 text-cyan-400/60">:</span>
                <span className="inline-block min-w-[2ch]">{currentDigits.s}</span>
                <span className="inline-block mx-1 text-cyan-400/60">.</span>
                <span className="inline-block min-w-[2ch] text-3xl sm:text-4xl md:text-5xl text-cyan-400/80">{currentDigits.c}</span>
              </div>
              <p className="text-white/40 text-sm uppercase tracking-[0.3em] mt-3">
                {isRunning ? '▶ Time Running' : '⏸ Ready'}
              </p>
            </div>

            {/* Stats */}
            {laps.length > 1 && (
              <div className="flex justify-center gap-8 mt-8 pt-6 border-t border-white/10">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-yellow-400 mb-1 text-xs uppercase tracking-wider">
                    🏆 Best
                  </div>
                  <span className="font-mono font-bold text-white">
                    {bestLap ? `+${formatTime(bestLap)}` : '--'}
                  </span>
                </div>
                <div className="w-px bg-white/10" />
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-cyan-400 mb-1 text-xs uppercase tracking-wider">
                    🎯 Avg
                  </div>
                  <span className="font-mono font-bold text-white">
                    {avgLap ? `+${formatTime(avgLap)}` : '--'}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Control Buttons */}
        <div className="flex gap-3 sm:gap-4 mb-8">
          {/* Start/Stop */}
          <button
            className={`flex-1 relative overflow-hidden py-4 sm:py-5 px-4 rounded-2xl font-bold text-base sm:text-lg flex items-center justify-center gap-2 sm:gap-3 text-white transition-all duration-200 ${
              isRunning 
                ? 'bg-gradient-to-br from-rose-500 to-pink-600 shadow-lg shadow-rose-500/30 active:scale-95' 
                : 'bg-gradient-to-br from-emerald-400 to-cyan-500 shadow-lg shadow-emerald-500/30 active:scale-95 hover:scale-[1.02]'
            }`}
            onClick={handleStartStop}
          >
            {isRunning ? '⬛ STOP' : '▶ START'}
          </button>

          {/* Lap */}
          <button 
            className="py-4 sm:py-5 px-5 sm:px-6 rounded-2xl font-bold text-base flex items-center justify-center gap-2 backdrop-blur-xl bg-white/10 border border-white/20 text-white transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed active:scale-95 hover:bg-white/15"
            onClick={handleLap}
            disabled={!isRunning}
          >
            ⏱ LAP
          </button>

          {/* Reset */}
          <button 
            className="py-4 sm:py-5 px-4 sm:px-6 rounded-2xl font-bold text-base flex items-center justify-center backdrop-blur-xl bg-white/5 border border-white/10 text-white/50 transition-all duration-200 disabled:opacity-20 disabled:cursor-not-allowed active:scale-95 hover:bg-white/10"
            onClick={handleReset}
            disabled={time === 0}
          >
            ↺
          </button>
        </div>

        {/* Lap Times */}
        {showLaps && laps.length > 0 && (
          <div className="overflow-hidden rounded-2xl backdrop-blur-xl bg-white/[0.03] border border-white/10">
            <div className="p-4 sm:p-6 border-b border-white/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-amber-500/20 border border-amber-500/30">
                    <span className="text-amber-400">🏅</span>
                  </div>
                  <div>
                    <span className="text-white font-bold block">Lap Times</span>
                    <span className="text-white/50 text-sm">{laps.length} laps</span>
                  </div>
                </div>
                <button
                  className="p-2 rounded-xl bg-white/5 border border-white/10 text-white/50 hover:text-white hover:bg-white/10 transition-all active:scale-95"
                  onClick={() => setShowLaps(false)}
                >
                  ▲
                </button>
              </div>
            </div>

            <div className="max-h-72 overflow-y-auto p-2" style={{ scrollbarWidth: 'thin' }}>
              {[...laps].reverse().map((lap, index) => {
                const lapIndex = laps.length - index
                const prevTime = laps[laps.length - lapIndex]?.time || 0
                const split = lap.time - prevTime
                const isBest = split === bestLap

                return (
                  <div
                    key={lap.id}
                    className={`flex items-center justify-between p-3 sm:p-4 rounded-xl mb-1 transition-colors ${
                      isBest 
                        ? 'bg-green-500/15 border border-green-500/30' 
                        : 'bg-white/[0.02] hover:bg-white/[0.05]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${
                        isBest 
                          ? 'bg-gradient-to-br from-green-400 to-emerald-500 text-white' 
                          : 'bg-white/10 text-white/70'
                      }`}>
                        {lapIndex}
                      </span>
                      <div>
                        <span className="text-white font-mono text-sm sm:text-base block">{formatTime(lap.time)}</span>
                        {isBest && <span className="text-green-400 text-xs">★ Best</span>}
                      </div>
                    </div>
                    <span className={`font-mono font-bold text-sm sm:text-base ${isBest ? 'text-green-400' : 'text-cyan-400'}`}>
                      +{formatTime(split)}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-white/20 text-xs">Built with ❤️ using React + Capacitor</p>
          <p className="text-white/10 text-[10px] mt-1">Framer Motion • Tailwind CSS • Lucide Icons</p>
        </div>
      </div>
    </div>
  )
}

export default App
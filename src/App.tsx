import { useState, useEffect, useRef } from 'react'
import './App.css'

interface Lap {
  id: number
  time: number
}

function App() {
  const [time, setTime] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const [laps, setLaps] = useState<Lap[]>([])
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

  const handleStartStop = () => {
    setIsRunning(!isRunning)
  }

  const handleReset = () => {
    setIsRunning(false)
    setTime(0)
    setLaps([])
  }

  const handleLap = () => {
    if (isRunning) {
      setLaps([...laps, { id: Date.now(), time }])
    }
  }

  return (
    <div className="app">
      <div className="stopwatch">
        <div className="display">
          <span className="time">{formatTime(time)}</span>
          <span className="status">{isRunning ? 'RUNNING' : 'STOPPED'}</span>
        </div>

        <div className="controls">
          <button 
            className={`btn ${isRunning ? 'stop' : 'start'}`}
            onClick={handleStartStop}
          >
            {isRunning ? '■ STOP' : '▶ START'}
          </button>
          
          <button 
            className="btn lap"
            onClick={handleLap}
            disabled={!isRunning && time === 0}
          >
            LAP
          </button>
          
          <button 
            className="btn reset"
            onClick={handleReset}
            disabled={time === 0 && !isRunning}
          >
            ↺ RESET
          </button>
        </div>

        {laps.length > 0 && (
          <div className="laps">
            <div className="laps-header">
              <span>Lap</span>
              <span>Time</span>
              <span>Split</span>
            </div>
            {[...laps].reverse().map((lap, index) => {
              const prevTime = laps[laps.length - index - 2]?.time || 0
              const split = lap.time - prevTime
              return (
                <div key={lap.id} className="lap-row">
                  <span>{laps.length - index}</span>
                  <span>{formatTime(lap.time)}</span>
                  <span className="split">+{formatTime(split)}</span>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default App
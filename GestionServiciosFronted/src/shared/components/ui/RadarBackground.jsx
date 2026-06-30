import { useMemo } from "react"
import "./RadarBackground.css"

function RadarBackground({ children }) {
  const stars = useMemo(() => {
    return Array.from({ length: 50 }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      size: Math.random() * 2.5 + 1,
      duration: `${Math.random() * 3 + 2}s`,
      delay: `${Math.random() * 3}s`,
    }))
  }, [])

  return (
    <div className="radar-pattern">
      <div className="radar-rings" />
      <div className="radar-beam" />
      <div className="radar-center" />
      <div className="radar-stars">
        {stars.map((star) => (
          <div
            key={star.id}
            className="radar-star"
            style={{
              left: star.left,
              top: star.top,
              width: `${star.size}px`,
              height: `${star.size}px`,
              animationDuration: star.duration,
              animationDelay: star.delay,
            }}
          />
        ))}
      </div>
      {children}
    </div>
  )
}

export default RadarBackground

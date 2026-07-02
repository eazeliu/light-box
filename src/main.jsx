import React, { useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';

const colorModes = ['red', 'green', 'blue'];

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function createRandomTiles() {
  return Array.from({ length: 25 }, (_, index) => ({
    id: index,
    mode: colorModes[Math.floor(Math.random() * colorModes.length)],
    delay: `${-(Math.random() * 3).toFixed(2)}s`,
    duration: `${(2.2 + Math.random() * 1.2).toFixed(2)}s`,
  }));
}

function createRandomMultipliers() {
  return Array.from({ length: 25 }, () => `${Math.floor(Math.random() * 50) + 1}x`);
}

function App() {
  const cleanTiles = useMemo(
    () => Array.from({ length: 25 }, (_, index) => ({ id: index, mode: 'clean', delay: '0s', duration: '2.8s' })),
    [],
  );
  const [tiles, setTiles] = useState(cleanTiles);
  const [isHighlighted, setIsHighlighted] = useState(false);
  const [viewAngle, setViewAngle] = useState(0);
  const [cameraDistance, setCameraDistance] = useState(0);
  const [multipliers, setMultipliers] = useState(null);
  const [depthStep, setDepthStep] = useState(15);
  const [orbit, setOrbit] = useState({ x: 0, y: 0 });
  const [dragStart, setDragStart] = useState(null);
  const columnDepths = useMemo(() => [0, depthStep, depthStep * 2, depthStep, 0], [depthStep]);

  const randomizeLights = () => {
    setTiles(createRandomTiles());
    setIsHighlighted(false);
  };

  const cleanLights = () => {
    setTiles(cleanTiles);
    setIsHighlighted(false);
  };

  const highlightLights = () => {
    setIsHighlighted(true);
  };

  const showMultipliers = () => {
    setMultipliers(createRandomMultipliers());
  };

  const handleOrbitPointerDown = (event) => {
    if (event.button !== 0) {
      return;
    }

    event.currentTarget.setPointerCapture(event.pointerId);
    setDragStart({
      x: event.clientX,
      y: event.clientY,
      orbitX: orbit.x,
      orbitY: orbit.y,
    });
  };

  const handleOrbitPointerMove = (event) => {
    if (!dragStart) {
      return;
    }

    const deltaX = event.clientX - dragStart.x;
    const deltaY = event.clientY - dragStart.y;

    setOrbit({
      x: clamp(dragStart.orbitX - deltaY * 0.22, -24, 75),
      y: clamp(dragStart.orbitY + deltaX * 0.22, -42, 42),
    });
  };

  const stopOrbitDrag = () => {
    setDragStart(null);
  };

  return (
    <main className="stage">
      <section
        className={`light-grid ${isHighlighted ? 'is-highlighted' : ''} ${multipliers ? 'has-multipliers' : ''}`}
        aria-label="Light grid"
        style={{
          '--view-angle': `${clamp(viewAngle + orbit.x, -24, 75)}deg`,
          '--orbit-y': `${orbit.y}deg`,
          '--camera-z': `${-cameraDistance}px`,
        }}
        onPointerDown={handleOrbitPointerDown}
        onPointerMove={handleOrbitPointerMove}
        onPointerUp={stopOrbitDrag}
        onPointerCancel={stopOrbitDrag}
        onLostPointerCapture={stopOrbitDrag}
      >
        {tiles.map((tile, index) => (
          <div
            className={`light-unit light-unit--${tile.mode}`}
            key={tile.id}
            style={{
              '--animation-delay': tile.delay,
              '--animation-duration': tile.duration,
              '--tile-z': `${columnDepths[tile.id % 5]}px`,
            }}
          >
            <span className="frame-face frame-face--top">
              {multipliers && <span className="multiplier-value">{multipliers[index]}</span>}
            </span>
            <span className="frame-face frame-face--right" />
            <span className="frame-face frame-face--bottom" />
            <span className="frame-face frame-face--left" />
            <span className="collar-wall collar-wall--top" />
            <span className="collar-wall collar-wall--right" />
            <span className="collar-wall collar-wall--bottom" />
            <span className="collar-wall collar-wall--left" />
          </div>
        ))}
      </section>

      <aside className="viewport-controls" aria-label="Viewport controls">
        <div className="viewport-control">
          <input
            type="range"
            min="0"
            max="75"
            step="1"
            value={viewAngle}
            aria-label="Matrix X axis rotation"
            onChange={(event) => setViewAngle(Number(event.target.value))}
          />
        </div>
        <div className="viewport-control viewport-control--distance">
          <input
            type="range"
            min="0"
            max="650"
            step="10"
            value={cameraDistance}
            aria-label="Camera distance"
            onChange={(event) => setCameraDistance(Number(event.target.value))}
          />
        </div>
      </aside>

      <nav className="bottom-nav" aria-label="Light controls">
        <button type="button" onClick={randomizeLights}>
          Random RGB
        </button>
        <button type="button" onClick={cleanLights}>
          Clean White
        </button>
        <button type="button" onClick={highlightLights}>
          Highlight
        </button>
        <button type="button" onClick={showMultipliers}>
          Multipliers
        </button>
        <label className="depth-control">
          <span>Z Step</span>
          <input
            type="number"
            min="0"
            max="160"
            step="1"
            value={depthStep}
            onChange={(event) => setDepthStep(Number(event.target.value) || 0)}
          />
        </label>
      </nav>
    </main>
  );
}

createRoot(document.getElementById('root')).render(<App />);

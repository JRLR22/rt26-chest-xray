import { useState } from 'react';

// Superpone la radiografía original y el mapa Grad-CAM; el control deslizante
// decide cuánto de cada una se ve (nativo <input type="range">: funciona con teclado y táctil).
export default function CompareSlider({ before, after }) {
  const [pos, setPos] = useState(50);
  return (
    <div>
      <div className="compare">
        <img src={after} alt="Mapa de calor Grad-CAM" />
        <img className="compare-top" src={before} alt="Radiografía original"
          style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }} />
        <div className="compare-line" style={{ left: `calc(${pos}% - 1px)` }} />
        <span className="compare-tag" style={{ left: 8 }}>Original</span>
        <span className="compare-tag" style={{ right: 8 }}>Grad-CAM</span>
      </div>
      <input className="compare-range" type="range" min="0" max="100" value={pos}
        aria-label="Mover la línea para comparar la radiografía original (izquierda) con el Grad-CAM (derecha)"
        onChange={e => setPos(Number(e.target.value))} />
    </div>
  );
}

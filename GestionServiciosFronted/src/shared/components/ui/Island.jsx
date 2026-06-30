import "./Island.css";

function Island({ pattern }) {
  const backgroundStyle = pattern
    ? { backgroundImage: `url(${pattern})` }
    : undefined;

  return (
    <div className="island-wrapper">
      <svg width="0" height="0" style={{ position: "absolute" }}>
        <defs>
          <filter id="octave1">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.01 0.02"
              numOctaves="3"
              seed="2"
              stitchTiles="stitch"
              result="noise1"
            />
            <feColorMatrix in="noise1" type="matrix" values="
              0 0 0 0 0
              0 0 0 0 0
              0 0 0 0 0
              0 0 0 1 0" />
          </filter>

          <filter id="octave2">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.02 0.04"
              numOctaves="2"
              seed="5"
              stitchTiles="stitch"
              result="noise2"
            />
            <feColorMatrix in="noise2" type="matrix" values="
              0 0 0 0 0
              0 0 0 0 0
              0 0 0 0 0
              0 0 0 1 0" />
          </filter>
        </defs>
      </svg>

      <div className="island" style={backgroundStyle} />
      <div className="islandt" style={backgroundStyle} />
    </div>
  );
}

export default Island;

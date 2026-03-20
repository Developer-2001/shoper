const Logo = ({ 
  className = "w-20 h-20", 
  bagColor = "#000000", 
  markColor = "#FFFFFF" 
}) => {
  // We use a slightly different shade for the side panel to keep the 3D effect.
  // If bagColor is pure black, we use a very dark grey for the side.
  const sidePanelColor = bagColor === "#000000" ? "#1A1A1A" : bagColor;

  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Handle - Back */}
      <path
        d="M35 25 C 35 10, 55 10, 55 25"
        fill="none"
        stroke={bagColor}
        strokeWidth="3"
      />

      {/* Handle - Front */}
      <path
        d="M45 25 C 45 15, 65 15, 65 25"
        fill="none"
        stroke={bagColor}
        strokeWidth="3"
      />

      {/* Side Panel (Provides the 3D depth) */}
      <path d="M70 30 L 85 25 L 85 75 L 70 85 Z" fill={sidePanelColor} />

      {/* Front Face (Skewed for perspective) */}
      <path d="M20 35 L 70 30 L 70 85 L 20 95 Z" fill={bagColor} />

      {/* The "S" Logo on the front */}
      <path
        d="M42 50 
           C 35 50, 32 53, 32 58 
           C 32 65, 58 62, 58 73 
           C 58 78, 54 82, 45 82 
           C 38 82, 34 79, 32 76 
           L 32 82 L 28 83 L 28 72 
           C 35 72, 38 75, 45 75 
           C 50 75, 52 73, 52 70 
           C 52 63, 26 67, 26 55 
           C 26 48, 32 44, 42 44 
           C 48 44, 52 46, 54 49 
           L 54 44 L 58 43 L 58 53 
           C 52 53, 49 50, 42 50 Z"
        fill={markColor}
        transform="skewY(-6) translate(5, 5)"
      />
    </svg>
  );
};

export default Logo;
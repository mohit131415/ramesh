import { useState, useEffect } from "react";

export function useMouseParallax(sensitivity = 0.02) {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isEnabled, setIsEnabled] = useState(true);

  useEffect(() => {
    if (!isEnabled) return;

    const handleMouseMove = (e) => {
      // Calculate mouse position relative to the center of the screen
      const x = (window.innerWidth / 2 - e.clientX) * sensitivity;
      const y = (window.innerHeight / 2 - e.clientY) * sensitivity;
      
      setPosition({ x, y });
    };

    window.addEventListener("mousemove", handleMouseMove);
    
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [sensitivity, isEnabled]);

  return { position, setIsEnabled };
}

import { useEffect, useRef } from 'react';

const MatrixBackground = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!containerRef.current) return;
    
    const container = containerRef.current;
    const characters = "アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン01234567890";
    const columns = Math.floor(window.innerWidth / 20);
    
    const createCharacter = () => {
      const char = document.createElement('div');
      char.className = 'matrix-character';
      char.style.left = `${Math.floor(Math.random() * columns) * 20}px`;
      char.style.animationDuration = `${Math.random() * 10 + 5}s`;
      char.style.opacity = `${Math.random() * 0.5 + 0.3}`;
      char.innerText = characters.charAt(Math.floor(Math.random() * characters.length));
      
      container.appendChild(char);
      
      setTimeout(() => {
        char.remove();
      }, 15000);
    };
    
    // Initial characters
    for (let i = 0; i < 50; i++) {
      setTimeout(createCharacter, Math.random() * 5000);
    }
    
    // Keep adding characters
    const interval = setInterval(createCharacter, 500);
    
    return () => {
      clearInterval(interval);
      while (container.firstChild) {
        container.removeChild(container.firstChild);
      }
    };
  }, []);
  
  return <div ref={containerRef} className="matrix-bg"></div>;
};

export default MatrixBackground;

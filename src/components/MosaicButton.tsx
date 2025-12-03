import React, { useRef, useState, useEffect } from 'react';
import { ServiceIcon } from './ServiceIcon';

interface MosaicButtonProps {
  title: string;
  subtitle?: string;
  onClick?: () => void;
  href?: string;
  iconName?: 'Claude' | 'OpenAI' | 'Gemini';
  bgColorClass?: string;
}

interface Square {
  x: number;
  y: number;
  opacity: number;
  life: number;
  decay: number;
}

export default function MosaicButton({ title, subtitle, onClick, href, iconName, bgColorClass }: MosaicButtonProps) {
  const containerRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [position, setPosition] = useState({ x: -100, y: -100 });
  const [opacity, setOpacity] = useState(0);
  
  // Refs for animation loop to avoid state updates
  const mousePos = useRef({ x: -1000, y: -1000 });
  const isHovering = useRef(false);
  const squares = useRef<Square[]>([]);
  const animationFrameId = useRef<number>(0);

  // Handle Mouse Events
  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Update React state for CSS gradients
    setPosition({ x, y });
    setOpacity(1);

    // Update Ref for Canvas animation
    mousePos.current = { x, y };
  };

  const handleMouseEnter = () => {
    setOpacity(1);
    isHovering.current = true;
  };

  const handleMouseLeave = () => {
    setOpacity(0);
    isHovering.current = false;
    mousePos.current = { x: -1000, y: -1000 };
  };

  // Canvas Animation Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const gridSize = 40;

    const resizeCanvas = () => {
        if (containerRef.current && canvas) {
            canvas.width = containerRef.current.offsetWidth;
            canvas.height = containerRef.current.offsetHeight;
        }
    };

    // Initial resize
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const render = () => {
      if (!canvas || !ctx) return;
      
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Spawn new squares if hovering
      if (isHovering.current) {
        // Chance to spawn a new square
        if (Math.random() < 0.4) { // Adjust density
             const { x, y } = mousePos.current;
             // Random offset within radius
             const radius = 200;
             const offsetX = (Math.random() - 0.5) * radius * 2;
             const offsetY = (Math.random() - 0.5) * radius * 2;
             
             // Snap to grid
             const gridX = Math.floor((x + offsetX) / gridSize) * gridSize;
             const gridY = Math.floor((y + offsetY) / gridSize) * gridSize;

             // Check if inside radius (circular mask)
             const dist = Math.sqrt(Math.pow(gridX + gridSize/2 - x, 2) + Math.pow(gridY + gridSize/2 - y, 2));
             
             if (dist < radius) {
                squares.current.push({
                    x: gridX,
                    y: gridY,
                    opacity: Math.random() * 0.5 + 0.2, // Initial opacity 0.2 - 0.7
                    life: 1.0,
                    decay: Math.random() * 0.03 + 0.01 // Random decay speed
                });
             }
        }
      }

      // Update and Draw Squares
      for (let i = squares.current.length - 1; i >= 0; i--) {
          const sq = squares.current[i];
          sq.life -= sq.decay;

          if (sq.life <= 0) {
              squares.current.splice(i, 1);
              continue;
          }

          // Fade out
          const currentOpacity = sq.opacity * sq.life;
          
          ctx.fillStyle = `rgba(255, 255, 255, ${currentOpacity})`;
          ctx.fillRect(sq.x, sq.y, gridSize, gridSize);
      }

      animationFrameId.current = requestAnimationFrame(render);
    };

    render();

    return () => {
        window.removeEventListener('resize', resizeCanvas);
        cancelAnimationFrame(animationFrameId.current);
    };
  }, []);


  const Component = href ? 'a' : 'div';
  const props = href
    ? { href, target: '_blank', rel: 'noopener noreferrer' }
    : { onClick };

  return (
    <Component
      // @ts-ignore
      ref={containerRef}
      {...props}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`relative w-full h-1/3 min-h-[200px] ${bgColorClass || 'bg-neutral-950'} overflow-hidden group border-b border-neutral-900 cursor-pointer flex flex-col items-center justify-center text-center p-6 transition-colors duration-300 block no-underline`}
    >
      {/* Grid Background (Static) */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-10"
        style={{
            backgroundImage: `
                linear-gradient(to right, #888 1px, transparent 1px),
                linear-gradient(to bottom, #888 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px'
        }}
      />

      {/* Mosaic Glow Effect (Radial Light) */}
      <div
        className="absolute inset-0 pointer-events-none transition-opacity duration-300"
        style={{
          opacity,
          background: `radial-gradient(600px circle at ${position.x}px ${position.y}px, rgba(255,255,255,0.1), transparent 40%)`,
        }}
      />

       {/* Canvas for Glitter/Blink Effect */}
       <canvas
          ref={canvasRef}
          className="absolute inset-0 pointer-events-none"
       />

      {/* Focused Grid Glow (Lines) */}
      <div
        className="absolute inset-0 pointer-events-none transition-opacity duration-300"
        style={{
            opacity,
            maskImage: `radial-gradient(200px circle at ${position.x}px ${position.y}px, black, transparent)`,
            WebkitMaskImage: `radial-gradient(200px circle at ${position.x}px ${position.y}px, black, transparent)`,
            backgroundImage: `
                linear-gradient(to right, rgba(255,255,255,0.5) 1px, transparent 1px),
                linear-gradient(to bottom, rgba(255,255,255,0.5) 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px'
        }}
      />

      {/* Content */}
      <div className="relative z-10 pointer-events-none select-none flex flex-col items-center justify-center">
        {iconName && (
          <div className="mb-6 transform transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
            <ServiceIcon name={iconName} size={64} />
          </div>
        )}
        <h2 className="text-6xl md:text-8xl font-black text-white tracking-tighter mb-4 drop-shadow-2xl font-sans uppercase">
          {title}
        </h2>
        {subtitle && (
          <p className="text-neutral-200 text-xl md:text-2xl font-light tracking-wide opacity-90">
            {subtitle}
          </p>
        )}
      </div>
    </Component>
  );
}

import { useRef, useState } from 'react';
import { useTheme } from '@mui/material/styles';

const ZoomAndDrag = ({ children, maxScale = 3, minScale = 0.2, zoomFactor = 0.1 }: any) => {
  const containerRef = useRef(null);
  const [scale, setScale] = useState(0.8);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [lastMousePosition, setLastMousePosition] = useState({ x: 0, y: 0 });
  const theme = useTheme();

  // Handle zoom on wheel
  const handleWheel = (event: any) => {
    event.preventDefault();
    let newScale = scale;

    if (event.deltaY < 0) {
      // Zoom in
      newScale = Math.min(scale + zoomFactor, maxScale);
    } else {
      // Zoom out
      newScale = Math.max(scale - zoomFactor, minScale);
    }

    setScale(newScale);
  };

  // Handle drag start
  const handleMouseDown = (event: any) => {
    setIsDragging(true);
    setLastMousePosition({ x: event.clientX, y: event.clientY });
  };

  // Handle drag move
  const handleMouseMove = (event: any) => {
    if (!isDragging) return;

    const dx = event.clientX - lastMousePosition.x;
    const dy = event.clientY - lastMousePosition.y;

    setLastMousePosition({ x: event.clientX, y: event.clientY });
    setPosition((prev) => ({
      x: prev.x + dx,
      y: prev.y + dy,
    }));
  };

  // Handle drag end
  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <div
      ref={containerRef}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      role="presentation"
      onKeyDown={(e) => {
        if (e.key === 'Escape') {
          setIsDragging(false);
        }
      }}
      style={{
        width: '100%',
        height: '100%',
        background: theme.palette.background.neutral,
        overflow: 'hidden',
        position: 'relative',
        cursor: isDragging ? 'grabbing' : 'grab',
        display: 'flex',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
          transition: isDragging ? 'none' : 'transform 0.1s ease-out',
          position: 'absolute',
        }}
      >
        {children}
      </div>
    </div>
  );
};

export default ZoomAndDrag;

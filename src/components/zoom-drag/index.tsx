import { useTheme } from '@mui/material/styles';
import { Tooltip, IconButton } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import { useRef, useState, useEffect, useCallback } from 'react';

interface ZoomAndDragProps {
  children: React.ReactNode;
  maxScale?: number; // upper zoom bound
  minScale?: number; // lower zoom bound
  zoomFactor?: number; // delta per wheel notch
  initialScale?: number; // starting scale (defaults 0.5)
  showReset?: boolean; // show or hide reset control
  onReset?: () => void; // callback after reset
  enableKeyboardReset?: boolean; // press 'r' to reset
  animatedReset?: boolean; // animate transform on reset
}

const ZoomAndDrag = ({
  children,
  maxScale = 3,
  minScale = 0.2,
  zoomFactor = 0.1,
  initialScale: initialScaleProp = 0.5,
  showReset = true,
  onReset,
  enableKeyboardReset = true,
  animatedReset = true,
}: ZoomAndDragProps) => {
  const containerRef = useRef(null);
  // Sanitize initial scale within bounds
  const sanitizedInitialScale = Math.min(Math.max(initialScaleProp, minScale), maxScale);
  const initialScaleRef = useRef(sanitizedInitialScale);
  const [scale, setScale] = useState(sanitizedInitialScale);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [lastMousePosition, setLastMousePosition] = useState({ x: 0, y: 0 });
  const theme = useTheme();
  const [isResetting, setIsResetting] = useState(false);

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
    setPosition((prev) => ({ x: prev.x + dx, y: prev.y + dy }));
  };

  // Handle drag end
  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Reset to default top-center position and initial scale
  const handleReset = useCallback(() => {
    setIsResetting(true);
    setScale(initialScaleRef.current);
    setPosition({ x: 0, y: 0 });
    onReset?.();
    // Allow transition to play then clear flag
    setTimeout(() => setIsResetting(false), 220);
  }, [onReset]);

  // Key listener for 'r' reset when enabled
  useEffect(() => {
    if (!enableKeyboardReset) return;
    const listener = (e: KeyboardEvent) => {
      if (e.key === 'r' || e.key === 'R') {
        handleReset();
      } else if (e.key === 'Escape') {
        setIsDragging(false);
      }
    };
    window.addEventListener('keydown', listener);
    // eslint-disable-next-line
    return () => {
      window.removeEventListener('keydown', listener);
    };
  }, [enableKeyboardReset, handleReset]);

  return (
    <div
      ref={containerRef}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      role="presentation"
      // Container keydown: only escape handling if keyboard reset disabled
      onKeyDown={(e) => {
        if (!enableKeyboardReset && e.key === 'Escape') {
          setIsDragging(false);
        }
      }}
      style={{
        width: '100%',
        height: '100%',
        background: theme.vars.palette.background.neutral,
        overflow: 'hidden',
        position: 'relative',
        cursor: isDragging ? 'grabbing' : 'grab',
        display: 'flex',
        justifyContent: 'center',
      }}
    >
      {showReset && (
        <div
          role="presentation"
          aria-hidden="true"
          style={{
            position: 'absolute',
            top: 8,
            right: 8,
            zIndex: 10,
            display: 'flex',
          }}
          // Prevent initiating drag when clicking the button
          onMouseDown={(e) => e.stopPropagation()}
        >
          <Tooltip title="Reset view (R)" placement="left" arrow>
            <IconButton size="small" onClick={handleReset} aria-label="reset view">
              <RefreshIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </div>
      )}
      <div
        style={{
          // Position child at top-center by default; drag offsets adjust via position state
          left: '50%',
          top: 0,
          position: 'absolute',
          transform: `translateX(-50%) translate(${position.x}px, ${position.y}px) scale(${scale})`,
          transformOrigin: 'top center',
          transition: isDragging
            ? 'none'
            : animatedReset || isResetting
              ? 'transform 0.2s ease-out'
              : 'transform 0.1s ease-out',
        }}
      >
        {children}
      </div>
    </div>
  );
};

export default ZoomAndDrag;

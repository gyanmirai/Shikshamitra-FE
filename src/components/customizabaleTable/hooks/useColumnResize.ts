import { useRef, useState, useCallback } from 'react';

export function useColumnResize() {
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>({});

  // Stores the natural (initial) width of each column — used as the minimum floor
  const initialWidthsRef = useRef<Record<string, number>>({});

  const resizeRef = useRef<{
    colId: string;
    startX: number;
    startWidth: number;
    minWidth: number;
  } | null>(null);

  const handleResizeStart = useCallback(
    (colId: string, event: React.MouseEvent, currentWidth: number, minWidth: number) => {
      event.preventDefault();
      event.stopPropagation();

      // Record the natural width the FIRST time this column is dragged — never overwrite
      if (!initialWidthsRef.current[colId]) {
        initialWidthsRef.current[colId] = currentWidth;
      }
      const effectiveMin = initialWidthsRef.current[colId] ?? minWidth;

      resizeRef.current = {
        colId,
        startX: event.clientX,
        startWidth: currentWidth,
        minWidth: effectiveMin,
      };

      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';

      const onMouseMove = (e: MouseEvent) => {
        if (!resizeRef.current) return;
        const { colId: id, startX, startWidth, minWidth: min } = resizeRef.current;
        const newWidth = Math.max(min, startWidth + (e.clientX - startX));
        setColumnWidths((prev) => ({ ...prev, [id]: newWidth }));
      };

      const onMouseUp = () => {
        resizeRef.current = null;
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
      };

      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
    },
    []
  );

  const handleResetWidth = useCallback((colId: string) => {
    setColumnWidths((prev) => {
      const next = { ...prev };
      delete next[colId];
      return next;
    });
    // Also clear the stored initial width so it re-seeds on the next drag
    delete initialWidthsRef.current[colId];
  }, []);

  return { columnWidths, handleResizeStart, handleResetWidth };
}

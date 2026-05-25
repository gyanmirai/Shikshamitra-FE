import { useState, useEffect, useCallback } from 'react';

import type { IData, IColumn } from '../types';

interface UseStickyColumnsProps {
  columns: IColumn[];
  columnVisibility: Record<string, boolean>;
  headerRefs: (number | null)[];
  paginatedData: IData[];
  columnWidths: Record<string, number>;
}

export const useStickyColumns = ({
  columns,
  columnVisibility,
  headerRefs,
  paginatedData,
  columnWidths,
}: UseStickyColumnsProps) => {
  const [stickyMap, setStickyMap] = useState<{
    left: Record<string, number>;
    right: Record<string, number>;
  }>({ left: {}, right: {} });
  useEffect(() => {
    const timer = setTimeout(() => {
      const leftSticky: { col: IColumn; idx: number }[] = [];
      const rightSticky: { col: IColumn; idx: number }[] = [];

      columns.forEach((col, idx) => {
        if (!columnVisibility[col.id] || !col.sticky) {
          return;
        }

        if (col.stickyPosition === 'right') {
          rightSticky.push({ col, idx });
        } else {
          leftSticky.push({ col, idx });
        }
      });

      const getColumnWidth = (col: IColumn, idx: number) =>
        columnWidths[col.id] ??
        headerRefs[idx] ??
        (typeof col.minWidth === 'number'
          ? col.minWidth
          : parseInt(String(col.minWidth || 100), 10)) ??
        100;

      const leftOffsets: Record<string, number> = {};
      let left = 0;
      leftSticky.forEach(({ col, idx }) => {
        const width = getColumnWidth(col, idx);
        leftOffsets[col.id as string] = left;
        left += width;
      });

      const rightOffsets: Record<string, number> = {};
      let right = 0;
      [...rightSticky].reverse().forEach(({ col, idx }) => {
        const width = getColumnWidth(col, idx);

        rightOffsets[col.id as string] = right;
        right += width;
      });

      setStickyMap({ left: leftOffsets, right: rightOffsets });
    }, 100);

    return () => clearTimeout(timer);
  }, [columnVisibility, columns, headerRefs, paginatedData, columnWidths]);

  /**
   * Memoization Justification:
   * Used in rendering individual cells/headers, preventing style recalculation
   * on every render if stickiness hasn't changed.
   */
  const getStickyStyle = useCallback(
    (col: IColumn, isHeader: boolean = false): React.CSSProperties => {
      const base: React.CSSProperties = {
        position: col.sticky ? 'sticky' : 'static',
        zIndex: col.sticky ? (isHeader ? 999 : 11) : 1, // Ensure sticky columns are above normal ones
      };

      const colId = col.id as string;
      if (stickyMap.left[colId] !== undefined) {
        return { ...base, left: stickyMap.left[colId] };
      }
      if (stickyMap.right[colId] !== undefined) {
        return { ...base, right: stickyMap.right[colId] };
      }

      return base;
    },
    [stickyMap]
  );

  return { stickyMap, getStickyStyle };
};

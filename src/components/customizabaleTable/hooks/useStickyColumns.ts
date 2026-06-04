import { useState, useEffect, useCallback } from 'react';

import type { IData, IColumn } from '../types';

interface UseStickyColumnsProps {
  columns: IColumn[];
  columnVisibility: Record<string, boolean>;
  headerWidths: Record<string, number>;
  paginatedData: IData[];
  columnWidths: Record<string, number>;
}

export const useStickyColumns = ({
  columns,
  columnVisibility,
  headerWidths,
  paginatedData,
  columnWidths,
}: UseStickyColumnsProps) => {
  const [stickyMap, setStickyMap] = useState<{
    left: Record<string, number>;
    right: Record<string, number>;
  }>({ left: {}, right: {} });

  useEffect(() => {
    const leftSticky: IColumn[] = [];
    const rightSticky: IColumn[] = [];

    const totalVisibleColumns = columns.filter((col) => columnVisibility[col.id]);
    const half = Math.ceil(totalVisibleColumns.length / 2);

    totalVisibleColumns.forEach((col, idx) => {
      if (col.sticky) {
        if (idx < half) {
          leftSticky.push(col);
        } else {
          rightSticky.push(col);
        }
      }
    });

    const leftOffsets: Record<string, number> = {};
    let left = 0;
    leftSticky.forEach((col) => {
      // const configuredWidth = typeof col.width === 'number' ? col.width : undefined;
      const width = columnWidths[col.id] ?? headerWidths[col.id] ?? 100;
      leftOffsets[col.id] = left;
      left += width;
    });

    const rightOffsets: Record<string, number> = {};
    let right = 0;
    [...rightSticky].reverse().forEach((col) => {
      // const configuredWidth = typeof col.width === 'number' ? col.width : undefined;
      const width = columnWidths[col.id] ?? headerWidths[col.id] ?? 100;
      rightOffsets[col.id] = right;
      right += width;
    });

    setStickyMap({ left: leftOffsets, right: rightOffsets });
  }, [columnVisibility, columns, headerWidths, paginatedData, columnWidths]);

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

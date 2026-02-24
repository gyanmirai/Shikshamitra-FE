import type { MutableRefObject } from 'react';

import { useTheme } from '@mui/material/styles';
import { useState, useCallback, useLayoutEffect } from 'react';

import type { IColumn } from '../types';

interface UseStickyColumnsProps {
  columns: IColumn[];
  columnVisibility: Record<string, boolean>;
  headerRefs: MutableRefObject<(HTMLTableCellElement | null)[]>;
}

export const useStickyColumns = ({
  columns,
  columnVisibility,
  headerRefs,
}: UseStickyColumnsProps) => {
  const theme = useTheme();
  const [stickyMap, setStickyMap] = useState<{
    left: Record<string, number>;
    right: Record<string, number>;
  }>({ left: {}, right: {} });

  useLayoutEffect(() => {
    const leftSticky: { col: IColumn; idx: number }[] = [];
    const rightSticky: { col: IColumn; idx: number }[] = [];

    // Divide sticky columns into left and right halves
    const stickyCols = columns.filter((col) => col.sticky);
    const half = Math.ceil(stickyCols.length / 2);

    columns.forEach((col, idx) => {
      if (col.sticky && columnVisibility[col.id]) {
        if (idx < half) {
          leftSticky.push({ col, idx });
        } else {
          rightSticky.push({ col, idx });
        }
      }
    });

    const leftOffsets: Record<string, number> = {};
    let left = 0;
    leftSticky.forEach(({ col, idx }) => {
      const el = headerRefs.current[idx];
      const width = el?.offsetWidth ?? 100;
      leftOffsets[col.id as string] = left;
      left += width;
    });

    const rightOffsets: Record<string, number> = {};
    let right = 0;
    [...rightSticky].reverse().forEach(({ col, idx }) => {
      const el = headerRefs.current[idx];
      const width = el?.offsetWidth ?? 100;
      rightOffsets[col.id as string] = right;
      right += width;
    });

    setStickyMap({ left: leftOffsets, right: rightOffsets });
  }, [columnVisibility, columns, headerRefs]);

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

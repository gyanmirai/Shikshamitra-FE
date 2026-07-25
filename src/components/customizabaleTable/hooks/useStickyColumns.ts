import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useState, useEffect, useCallback } from 'react';

import type { IData, IColumn } from '../types';

interface UseStickyColumnsProps {
  columns: IColumn[];
  columnVisibility: Record<string, boolean>;
  headerRefs: (number | null)[];
  paginatedData: IData[];
  isLoading: boolean;
  tableUniqId: string;
}

/**
 * Pre-compute left sticky offsets from column config widths so columns are
 * sticky from the very first render (before DOM measurement fires).
 * Right-sticky offsets require the table's rendered width to compute accurately,
 * so they are left empty here and corrected after DOM measurement.
 */
const computeInitialStickyMap = (
  cols: IColumn[],
  visibility: Record<string, boolean>,
  mobile: boolean
): { left: Record<string, number>; right: Record<string, number> } => {
  const visibleCols = cols.filter((c) => visibility[c.id] !== false);
  const leftOffsets: Record<string, number> = {};
  let leftAccum = 0;

  visibleCols.forEach((col) => {
    if (col.sticky && (!mobile || col.stickyOnMobile !== false) && col.stickyPosition === 'left') {
      leftOffsets[col.id] = leftAccum;
      leftAccum += (col.width as number) || (col.minWidth as number) || 100;
    }
  });

  return { left: leftOffsets, right: {} };
};

export const useStickyColumns = ({
  columns,
  columnVisibility,
  headerRefs,
  paginatedData,
  isLoading,
  tableUniqId,
}: UseStickyColumnsProps) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [stickyMap, setStickyMap] = useState<{
    left: Record<string, number>;
    right: Record<string, number>;
  }>(() => computeInitialStickyMap(columns, columnVisibility, false));

  useEffect(() => {
    setTimeout(() => {
      const table = document.getElementById(`${tableUniqId}`);
      if (!table) return;
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          const leftSticky: { col: IColumn; idx: number }[] = [];
          const rightSticky: { col: IColumn; idx: number }[] = [];

          const totalVisibleColumns = columns.filter((col) => columnVisibility[col.id]);

          const half = Math.ceil(totalVisibleColumns.length / 2);

          totalVisibleColumns.forEach((col, idx) => {
            if (col.sticky && (!isMobile || col.stickyOnMobile !== false)) {
              if (col.stickyPosition === 'left') {
                leftSticky.push({ col, idx });
              } else if (col.stickyPosition === 'right') {
                rightSticky.push({ col, idx });
              } else if (idx < half) {
                leftSticky.push({ col, idx });
              } else {
                rightSticky.push({ col, idx });
              }
            }
          });

          const leftOffsets: Record<string, number> = {};
          let left = 0;
          leftSticky.forEach(({ col }) => {
            const el = table
              .querySelector(`#${tableUniqId}-column-${col.id}`)
              ?.getBoundingClientRect()?.width;

            const width = el ?? (col.width as number) ?? (col.minWidth as number) ?? 100;
            leftOffsets[col.id as string] = left;
            left += width;
          });

          const rightOffsets: Record<string, number> = {};
          let right = 0;
          [...rightSticky].reverse().forEach(({ col }) => {
            const el = table
              .querySelector(`#${tableUniqId}-column-${col.id}`)
              ?.getBoundingClientRect()?.width;

            const width = el ?? (col.width as number) ?? (col.minWidth as number) ?? 100;

            rightOffsets[col.id as string] = right;
            right += width;
          });

          setStickyMap({ left: leftOffsets, right: rightOffsets });
        });
      });
    }, 100);
  }, [columnVisibility, columns, headerRefs, paginatedData, isLoading, isMobile, tableUniqId]);

  /**
   * Memoization Justification:
   * Used in rendering individual cells/headers, preventing style recalculation
   * on every render if stickiness hasn't changed.
   */
  const getStickyStyle = useCallback(
    (col: IColumn, isHeader: boolean = false): React.CSSProperties => {
      const isSticky = col.sticky && (!isMobile || col.stickyOnMobile !== false);
      const base: React.CSSProperties = {
        position: isSticky ? 'sticky' : 'static',
        zIndex: isSticky ? (isHeader ? 999 : 11) : 1,
        ...(!isHeader && !isSticky ? { backgroundColor: 'transparent', boxShadow: 'none' } : {}),
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
    [isMobile, stickyMap]
  );

  return { stickyMap, getStickyStyle };
};

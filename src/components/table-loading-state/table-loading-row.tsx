import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import { useRef, useState, useEffect } from 'react';

import { TableLoadingState } from '.';

import type { TableLoadingStateProps } from '.';

type Props = TableLoadingStateProps & { colSpan: number };

export function TableLoadingRow({ colSpan, ...props }: Props) {
  const cellRef = useRef<HTMLTableCellElement>(null);
  const [visibleWidth, setVisibleWidth] = useState<number>();

  useEffect(() => {
    if (props.tableWidth) return undefined;
    const container = cellRef.current?.closest<HTMLElement>(
      '.MuiTableContainer-root, .simplebar-content-wrapper'
    );
    if (!container) return undefined;
    const updateWidth = () => setVisibleWidth(container.clientWidth);
    updateWidth();
    const observer = new ResizeObserver(updateWidth);
    observer.observe(container);
    return () => observer.disconnect();
  }, [props.tableWidth]);

  return (
    <TableRow>
      <TableCell ref={cellRef} colSpan={Math.max(1, colSpan)} sx={{ p: 0, verticalAlign: 'middle' }}>
        <TableLoadingState {...props} tableWidth={props.tableWidth || visibleWidth} />
      </TableCell>
    </TableRow>
  );
}

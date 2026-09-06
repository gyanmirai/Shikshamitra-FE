import { useTheme } from '@mui/material/styles';
import { TableRow, Skeleton, TableCell, TableBody as MuiTableBody } from '@mui/material';

import type { IColumn } from '../types';

interface Props {
  columns: IColumn[];
  columnVisibility: Record<string, boolean>;
  dense: boolean;
  rowsPerPage: number;
}

export default function TableBodyLoadingRows({
  columns,
  columnVisibility,
  dense,
  rowsPerPage,
}: Props) {
  const theme = useTheme();
  const hasExpandColumn = columns.some((column) => column.children);

  return (
    <MuiTableBody>
      {[...Array(Math.min(rowsPerPage, 10))].map((_row, rowIndex) => (
        <TableRow key={rowIndex}>
          {hasExpandColumn && (
            <TableCell>
              <Skeleton variant="circular" width={24} height={24} />
            </TableCell>
          )}
          {columns.map(
            (column) =>
              columnVisibility[column.id] && (
                <TableCell
                  key={column.id}
                  sx={{
                    py: dense ? 1.5 : 2,
                    px: 2,
                    borderBottom: `1px dashed ${theme.vars.palette.divider}`,
                  }}
                >
                  <Skeleton variant="text" width="100%" />
                </TableCell>
              )
          )}
        </TableRow>
      ))}
    </MuiTableBody>
  );
}

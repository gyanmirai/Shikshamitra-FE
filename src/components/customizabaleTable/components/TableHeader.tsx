import { TableRow, TableHead, TableCell } from '@mui/material';

import type { IColumn } from '../type';

interface TableHeaderProps {
  columns: IColumn[];
  columnVisibility: { [key: string]: boolean };
  sorts: Array<{ column: string; direction: 'asc' | 'desc' }>;
  onSort: (column: string, originalId?: string) => void;
  getStickyStyle: (col: IColumn) => React.CSSProperties;
  showCheckbox?: boolean;
}

export const TableHeader: React.FC<TableHeaderProps> = ({
  columns,
  columnVisibility,
  sorts,
  onSort,
  getStickyStyle,
  showCheckbox,
}) => (
  <TableHead>
    <TableRow>
      {showCheckbox && <TableCell padding="checkbox" />}
      {columns.map((column, index) =>
        columnVisibility[column.id] ? (
          <TableCell
            key={column.id}
            align={column.align}
            style={getStickyStyle(column)}
            onClick={() => onSort(column.id, column.originalId)}
          >
            {column.label}
            {sorts.find((sort) => sort.column === column.id)?.direction === 'asc' ? '↑' : '↓'}
          </TableCell>
        ) : null
      )}
    </TableRow>
  </TableHead>
);

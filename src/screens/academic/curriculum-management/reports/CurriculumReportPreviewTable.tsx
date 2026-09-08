import { Iconify } from 'src/components/iconify';
import {
  Box,
  Table,
  TableRow,
  Skeleton,
  TableBody,
  TableCell,
  TableHead,
  Typography,
  TableContainer,
} from '@mui/material';

import type { PreviewColumn } from './CurriculumReportPreview.types';

interface CurriculumReportPreviewTableProps {
  columns: PreviewColumn[];
  isLoading: boolean;
  rows: Record<string, string>[];
  rowsPerPage: number;
}

export function CurriculumReportPreviewTable({
  columns,
  isLoading,
  rows,
  rowsPerPage,
}: CurriculumReportPreviewTableProps) {
  return (
    <TableContainer sx={{ flex: 1, overflow: 'auto' }}>
      <Table stickyHeader size="small">
        <TableHead>
          <TableRow>
            {isLoading
              ? Array.from({ length: 5 }).map((_, index) => (
                  <TableCell key={index} sx={{ fontWeight: 700 }}>
                    <Skeleton width={80} height={20} />
                  </TableCell>
                ))
              : columns.map((column) => (
                  <TableCell
                    key={column.id}
                    sx={{
                      fontWeight: 700,
                      whiteSpace: 'nowrap',
                      color: 'text.primary',
                      fontSize: '0.78rem',
                    }}
                  >
                    {column.label}
                  </TableCell>
                ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {isLoading ? (
            Array.from({ length: rowsPerPage }).map((_, rowIndex) => (
              <TableRow key={rowIndex}>
                {Array.from({ length: 5 }).map((__, columnIndex) => (
                  <TableCell key={columnIndex}>
                    <Skeleton height={18} />
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={columns.length || 1} align="center" sx={{ py: 8 }}>
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 1,
                  }}
                >
                  <Iconify icon="mdi:table-off" width={48} sx={{ color: 'text.secondary' }} />
                  <Typography variant="body2" color="text.secondary">
                    No data found for the selected filters
                  </Typography>
                </Box>
              </TableCell>
            </TableRow>
          ) : (
            rows.map((row, rowIndex) => (
              <TableRow
                key={rowIndex}
                hover
                sx={{ '&:nth-of-type(even)': { bgcolor: 'action.hover' } }}
              >
                {columns.map((column) => (
                  <TableCell
                    key={column.id}
                    sx={{
                      fontSize: '0.8rem',
                      whiteSpace: 'nowrap',
                      maxWidth: 220,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {column.id ? (row[column.id] ?? '—') : '—'}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

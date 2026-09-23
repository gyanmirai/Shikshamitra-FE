import { Iconify } from 'src/components/iconify';
import {
  Box,
  Chip,
  Table,
  Alert,
  TableRow,
  TableBody,
  TableCell,
  TableHead,
  Typography,
  TableContainer,
} from '@mui/material';

import type { SubjectImportRow } from './types';

export function SubjectImportPreview({ rows }: { rows: SubjectImportRow[] }) {
  if (!rows.length) return null;
  const invalidCount = rows.filter((row) => row.issues.length > 0).length;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="subtitle2">File preview</Typography>
        <Chip
          size="small"
          variant="outlined"
          color={invalidCount ? 'error' : 'default'}
          label={invalidCount ? `${invalidCount} rows need attention` : `${rows.length} rows ready`}
        />
      </Box>
      {invalidCount > 0 && (
        <Alert severity="error">Correct the listed rows in the file, then upload it again.</Alert>
      )}
      <TableContainer
        sx={{ maxHeight: 300, border: '1px solid', borderColor: 'divider', borderRadius: 1.5 }}
      >
        <Table stickyHeader size="small" aria-label="Subject import preview">
          <TableHead>
            <TableRow>
              <TableCell>Row</TableCell>
              <TableCell>Subject</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Validation</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.rowNumber}>
                <TableCell>{row.rowNumber}</TableCell>
                <TableCell>
                  <Typography variant="body2">{row.name || '—'}</Typography>
                  {row.displayName && (
                    <Typography variant="caption" color="text.secondary">
                      {row.displayName}
                    </Typography>
                  )}
                </TableCell>
                <TableCell>{row.category || '—'}</TableCell>
                <TableCell>{row.status || '—'}</TableCell>
                <TableCell>
                  {row.issues.length ? (
                    <Typography variant="caption" color="error.main">
                      {row.issues.join(' ')}
                    </Typography>
                  ) : (
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.5,
                        color: 'text.secondary',
                      }}
                    >
                      <Iconify icon="solar:check-circle-outline" width={16} />
                      <Typography variant="caption">Ready</Typography>
                    </Box>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}

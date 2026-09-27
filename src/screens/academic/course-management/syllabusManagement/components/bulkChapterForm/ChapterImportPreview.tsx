'use client';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { varAlpha } from 'src/theme/styles';
import {
  Box,
  Paper,
  Stack,
  Table,
  Alert,
  TableRow,
  TableBody,
  TableCell,
  TableHead,
  Typography,
  TableContainer,
} from '@mui/material';

import type { ChapterImportPreviewRow } from './chapterImport';

type Props = {
  fileName: string;
  rows: ChapterImportPreviewRow[];
};

const PreviewStatus = ({ errors }: { errors: string[] }) => {
  const isValid = errors.length === 0;

  return (
    <Stack spacing={0.5} alignItems="flex-start">
      <Label
        variant="soft"
        color={isValid ? 'success' : 'error'}
        startIcon={
          <Iconify icon={isValid ? 'mdi:check-circle-outline' : 'mdi:alert-circle-outline'} />
        }
      >
        {isValid ? 'Ready' : 'Needs correction'}
      </Label>
      {!isValid && (
        <Typography variant="caption" color="error.main" sx={{ maxWidth: 300 }}>
          {errors.join(' • ')}
        </Typography>
      )}
    </Stack>
  );
};

export default function ChapterImportPreview({ fileName, rows }: Props) {
  const validCount = rows.filter((row) => row.errors.length === 0).length;
  const invalidCount = rows.length - validCount;

  return (
    <Paper variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden' }}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        gap={1}
        sx={{ p: 1.5, borderBottom: 1, borderColor: 'divider' }}
      >
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="subtitle2">Spreadsheet preview</Typography>
          <Typography variant="caption" color="text.secondary" noWrap>
            {fileName}
          </Typography>
        </Box>
        <Stack direction="row" gap={0.75} flexWrap="wrap">
          <Label variant="soft" color="success">
            {validCount} ready
          </Label>
          {invalidCount > 0 && (
            <Label variant="soft" color="error">
              {invalidCount} need correction
            </Label>
          )}
        </Stack>
      </Stack>

      {invalidCount > 0 && (
        <Alert severity="error" variant="outlined" sx={{ m: 1.5 }}>
          Correct the highlighted rows in the spreadsheet, then upload the file again.
        </Alert>
      )}
      {invalidCount === 0 && (
        <Alert severity="success" variant="outlined" sx={{ m: 1.5 }}>
          All rows passed validation and are ready to assign.
        </Alert>
      )}

      <TableContainer sx={{ maxHeight: 420 }}>
        <Table stickyHeader size="small" aria-label={`Chapter import preview for ${fileName}`}>
          <TableHead>
            <TableRow>
              <TableCell>Row</TableCell>
              <TableCell>Chapter no.</TableCell>
              <TableCell sx={{ minWidth: 180 }}>Chapter name</TableCell>
              <TableCell sx={{ minWidth: 120 }}>Start date</TableCell>
              <TableCell sx={{ minWidth: 120 }}>End date</TableCell>
              <TableCell sx={{ minWidth: 200 }}>Description</TableCell>
              <TableCell sx={{ minWidth: 240 }}>Validation</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row, index) => {
              const hasErrors = row.errors.length > 0;

              return (
                <TableRow
                  key={row.rowNumber}
                  sx={[
                    { bgcolor: hasErrors ? 'error.lighter' : 'background.paper' },
                    hasErrors
                      ? (theme) =>
                          theme.applyStyles('dark', {
                            bgcolor: varAlpha(theme.vars.palette.error.mainChannel, 0.16),
                          })
                      : {},
                  ]}
                >
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{row.chapterNo || '—'}</TableCell>
                  <TableCell>{row.chapterName || '—'}</TableCell>
                  <TableCell>{row.startDate || '—'}</TableCell>
                  <TableCell>{row.endDate || '—'}</TableCell>
                  <TableCell>{row.description || '—'}</TableCell>
                  <TableCell>
                    <PreviewStatus errors={row.errors} />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}

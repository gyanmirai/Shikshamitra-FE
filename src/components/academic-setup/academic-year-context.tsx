import dayjs from 'dayjs';
import { Iconify } from 'src/components/iconify';
import {
  Box,
  Paper,
  Button,
  Select,
  Tooltip,
  MenuItem,
  InputLabel,
  Typography,
  IconButton,
  FormControl,
} from '@mui/material';

import type { AcademicYearRecord } from './academic-setup-model';

export type AcademicYearContextProps = {
  years: AcademicYearRecord[];
  selectedYearId: string;
  currentYear?: AcademicYearRecord;
  isLoading: boolean;
  onSelectYear: (yearId: string) => void;
  onCreateYear: () => void;
  onEditYear: () => void;
  onAddBoard: () => void;
};

export const AcademicYearContext = ({
  years,
  selectedYearId,
  currentYear,
  isLoading,
  onSelectYear,
  onCreateYear,
  onEditYear,
  onAddBoard,
}: AcademicYearContextProps) => {
  const hasAcademicYear = Boolean(currentYear);

  return (
    <Paper
      component="section"
      aria-label="Academic year context"
      variant="outlined"
      sx={{
        p: 1.25,
        borderRadius: 2,
        bgcolor: 'background.paper',
        display: 'flex',
        alignItems: { xs: 'stretch', md: 'center' },
        justifyContent: 'space-between',
        flexDirection: { xs: 'column', md: 'row' },
        gap: 1,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0 }}>
        <Box
          sx={{
            width: 40,
            height: 40,
            flexShrink: 0,
            borderRadius: 1.5,
            bgcolor: 'primary.lighter',
            color: 'primary.main',
            display: { xs: 'none', sm: 'grid' },
            placeItems: 'center',
          }}
        >
          <Iconify icon="solar:calendar-bold-duotone" width={22} aria-hidden />
        </Box>
        <Box
          sx={{
            minWidth: 0,
            display: 'flex',
            alignItems: { xs: 'stretch', sm: 'center' },
            flexDirection: { xs: 'column', sm: 'row' },
            flexWrap: 'wrap',
            gap: { xs: 0.5, sm: 1 },
          }}
        >
          <Typography variant="caption" color="text.secondary" sx={{ whiteSpace: 'nowrap' }}>
            Working academic year
          </Typography>
          <FormControl size="small" sx={{ minWidth: { xs: '100%', sm: 220 } }}>
            <InputLabel id="academic-year-select-label">Academic year</InputLabel>
            <Select
              labelId="academic-year-select-label"
              label="Academic year"
              value={selectedYearId}
              disabled={isLoading || years.length === 0}
              onChange={(event) => onSelectYear(event.target.value)}
            >
              {years.map((year) => (
                <MenuItem key={year.id} value={year.id}>
                  {year.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          {currentYear?.startDate && currentYear.endDate ? (
            <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'nowrap' }}>
              {dayjs(currentYear.startDate).format('DD MMM YYYY')} –{' '}
              {dayjs(currentYear.endDate).format('DD MMM YYYY')}
            </Typography>
          ) : null}
        </Box>
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 1 }}>
        {hasAcademicYear ? (
          <Tooltip title={`Edit ${currentYear?.name}`}>
            <IconButton
              size="small"
              aria-label={`Edit academic year ${currentYear?.name}`}
              onClick={onEditYear}
              sx={{ width: 36, height: 36 }}
            >
              <Iconify icon="solar:pen-bold" width={18} aria-hidden />
            </IconButton>
          </Tooltip>
        ) : null}
        <Tooltip title="Create another academic year">
          <IconButton
            size="small"
            aria-label="Create academic year"
            onClick={onCreateYear}
            sx={{ width: 36, height: 36 }}
          >
            <Iconify icon="mingcute:add-line" width={20} aria-hidden />
          </IconButton>
        </Tooltip>
        <Button
          type="button"
          size="small"
          variant="contained"
          startIcon={<Iconify icon="mingcute:add-line" aria-hidden />}
          disabled={isLoading}
          onClick={hasAcademicYear ? onAddBoard : onCreateYear}
          sx={{ minHeight: 36, px: 1.5, whiteSpace: 'nowrap' }}
        >
          {hasAcademicYear ? 'Add board' : 'Create academic year'}
        </Button>
      </Box>
    </Paper>
  );
};

import dayjs from 'dayjs';
import { Iconify } from 'src/components/iconify';
import { Box, Paper, Select, MenuItem, InputLabel, Typography, FormControl } from '@mui/material';

import { AcademicYearActions } from './academic-year-actions';

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
}: AcademicYearContextProps) => (
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
      flexWrap: 'wrap',
      flexShrink: 0,
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

    <AcademicYearActions
      currentYear={currentYear}
      isLoading={isLoading}
      onCreateYear={onCreateYear}
      onEditYear={onEditYear}
      onAddBoard={onAddBoard}
    />
  </Paper>
);

import { Box, Button } from '@mui/material';
import { Iconify } from 'src/components/iconify';

import type { AcademicYearContextProps } from './academic-year-context';

type Props = Pick<
  AcademicYearContextProps,
  'currentYear' | 'isLoading' | 'onCreateYear' | 'onEditYear' | 'onAddBoard'
>;

export const AcademicYearActions = ({
  currentYear,
  isLoading,
  onCreateYear,
  onEditYear,
  onAddBoard,
}: Props) => (
  <Box
    sx={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: { xs: 'flex-start', md: 'flex-end' },
      flexWrap: 'wrap',
      flexShrink: 0,
      gap: 1,
    }}
  >
    {currentYear ? (
      <>
        <Button
          type="button"
          size="small"
          variant="outlined"
          color="inherit"
          aria-label={`Edit academic year ${currentYear.name}`}
          onClick={onEditYear}
          startIcon={<Iconify icon="solar:pen-bold" width={16} aria-hidden />}
        >
          Edit year
        </Button>
        <Button
          type="button"
          size="small"
          variant="outlined"
          color="inherit"
          aria-label="Create academic year"
          startIcon={<Iconify icon="mingcute:add-line" width={16} aria-hidden />}
          onClick={onCreateYear}
          sx={{ whiteSpace: 'nowrap' }}
        >
          Academic year
        </Button>
      </>
    ) : null}
    <Button
      type="button"
      size="small"
      variant="contained"
      aria-label={currentYear ? 'Add board' : 'Create academic year'}
      startIcon={<Iconify icon="mingcute:add-line" width={16} aria-hidden />}
      disabled={isLoading}
      onClick={currentYear ? onAddBoard : onCreateYear}
      sx={{ whiteSpace: 'nowrap' }}
    >
      {currentYear ? 'Board' : 'Academic year'}
    </Button>
  </Box>
);

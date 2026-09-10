import { Iconify } from 'src/components/iconify';
import { Box, Button, Tooltip, IconButton } from '@mui/material';

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
        <Tooltip title={`Edit ${currentYear.name}`}>
          <IconButton
            size="small"
            aria-label={`Edit academic year ${currentYear.name}`}
            onClick={onEditYear}
            sx={{ width: { xs: 44, sm: 36 }, height: { xs: 44, sm: 36 } }}
          >
            <Iconify icon="solar:pen-bold" width={18} aria-hidden />
          </IconButton>
        </Tooltip>
        <Button
          type="button"
          size="small"
          variant="outlined"
          startIcon={<Iconify icon="solar:calendar-add-bold-duotone" aria-hidden />}
          onClick={onCreateYear}
          sx={{ minHeight: { xs: 44, sm: 36 }, whiteSpace: 'nowrap' }}
        >
          Create academic year
        </Button>
      </>
    ) : null}
    <Button
      type="button"
      size="small"
      variant="contained"
      startIcon={<Iconify icon="mingcute:add-line" aria-hidden />}
      disabled={isLoading}
      onClick={currentYear ? onAddBoard : onCreateYear}
      sx={{ minHeight: { xs: 44, sm: 36 }, px: 1.5, whiteSpace: 'nowrap' }}
    >
      {currentYear ? 'Add board' : 'Create academic year'}
    </Button>
  </Box>
);

import { Button } from '@mui/material';
import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { usePopover, CustomPopover } from 'src/components/custom-popover';

import StudentDirectoryFilterPanel from './student-directory-filter-panel';

import type { StudentPopulation } from './student-directory-filter-panel';

type Props = {
  population: StudentPopulation;
  onApply: (population: StudentPopulation) => void;
};

export default function StudentDirectoryFilters({ population, onApply }: Props) {
  const popover = usePopover();
  const count = population === 'Former' ? 1 : 0;

  return (
    <>
      <Button
        variant="outlined"
        color={count ? 'primary' : 'inherit'}
        size="small"
        onClick={popover.onOpen}
        startIcon={<Iconify icon="mdi:tune" width={16} />}
        aria-haspopup="dialog"
        aria-expanded={popover.open}
        aria-controls={popover.open ? 'student-directory-filters' : undefined}
      >
        Filters
        {count > 0 && (
          <Label color="primary" variant="soft" sx={{ ml: 0.75 }}>
            {count}
          </Label>
        )}
      </Button>
      <CustomPopover
        open={popover.open}
        anchorEl={popover.anchorEl}
        onClose={popover.onClose}
        slotProps={{
          paper: {
            role: 'dialog',
            id: 'student-directory-filters',
            'aria-labelledby': 'student-directory-filter-title',
            sx: {
              p: 2,
              width: 360,
              maxWidth: 'calc(100vw - 32px)',
              maxHeight: 'calc(100dvh - 32px)',
              display: 'flex',
              flexDirection: 'column',
            },
          },
        }}
      >
        {popover.open && (
          <StudentDirectoryFilterPanel
            key={population}
            {...{ population, onApply }}
            onClose={popover.onClose}
          />
        )}
      </CustomPopover>
    </>
  );
}

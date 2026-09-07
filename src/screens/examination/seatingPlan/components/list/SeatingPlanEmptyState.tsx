import Link from 'next/link';
import Button from '@mui/material/Button';
import { Iconify } from 'src/components/iconify';
import { EmptyContent } from 'src/components/empty-content';
import { academicPaths } from 'src/constants/academic-menu';

interface Props {
  isFiltered: boolean;
  onClearFilter: () => void;
}

export default function SeatingPlanEmptyState({ isFiltered, onClearFilter }: Props) {
  const action = isFiltered ? (
    <Button
      size="small"
      variant="outlined"
      startIcon={<Iconify icon="mdi:filter-remove-outline" />}
      onClick={onClearFilter}
      sx={{ mt: 2, minHeight: 44 }}
    >
      Clear status filter
    </Button>
  ) : (
    <Button
      component={Link}
      href={academicPaths.examination.schedule}
      size="small"
      variant="contained"
      startIcon={<Iconify icon="mdi:calendar-edit-outline" />}
      sx={{ mt: 2, minHeight: 44 }}
    >
      Open examination schedule
    </Button>
  );

  return (
    <EmptyContent
      title={isFiltered ? 'No seating plans match this status' : 'No exams are ready for seating'}
      description={
        isFiltered
          ? 'This class has no exams in the selected status. Clear the filter to see every plan.'
          : 'Complete the exam schedule and assign rooms. Eligible sessions will then appear here automatically.'
      }
      action={action}
      sx={{ minHeight: 260, py: 3 }}
      slotProps={{
        title: { color: 'text.primary' },
        description: {
          color: 'text.secondary',
          typography: 'body2',
          maxWidth: 520,
          lineHeight: 1.6,
        },
      }}
    />
  );
}

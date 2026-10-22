import { Add } from '@mui/icons-material';
import { Box, Button } from '@mui/material';
import { Iconify } from 'src/components/iconify';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

interface Props {
  canView: boolean;
  canAdd: boolean;
  onInsights: () => void;
  onBulkAdd: () => void;
  onAdd: () => void;
}

export function SubjectPageHeader({ canView, canAdd, onInsights, onBulkAdd, onAdd }: Props) {
  return (
    <CustomBreadcrumbs
      heading="Subject Creation"
      description="Manage master subjects used across curriculum, timetable, exams, lesson plans, and reports."
      links={[
        { name: 'Academics', href: '/academic/dashboard' },
        { name: 'Curriculum', href: '/academic/curriculumSubjects' },
        { name: 'Settings' },
        { name: 'Subject Creation' },
      ]}
      action={
        (canView || canAdd) && (
          <Box display="flex" gap={1} flexWrap="wrap" justifyContent="flex-end">
            {canView && (
              <Button
                size="small"
                variant="outlined"
                color="inherit"
                startIcon={<Iconify icon="solar:chart-2-outline" width={18} />}
                onClick={onInsights}
              >
                View full insights
              </Button>
            )}
            {canAdd && (
              <>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={onBulkAdd}
                  startIcon={<Iconify icon="mdi:cloud-upload-outline" width={18} />}
                >
                  Bulk Add
                </Button>
                <Button
                  aria-label="Add subject"
                  sx={{ px: '24px' }}
                  startIcon={<Add />}
                  variant="contained"
                  onClick={onAdd}
                  size="small"
                >
                  Subject
                </Button>
              </>
            )}
          </Box>
        )
      }
    />
  );
}

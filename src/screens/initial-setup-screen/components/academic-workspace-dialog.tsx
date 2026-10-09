import dynamic from 'next/dynamic';
import CustomDialog from 'src/components/customDialog';
import { Box, Button, Skeleton, DialogActions } from '@mui/material';

const YearSetup = dynamic(() => import('src/components/academic-setup/year-setup'), {
  loading: () => <Skeleton variant="rounded" height={400} />,
});
export default function AcademicWorkspaceDialog({
  yearId,
  onClose,
}: {
  yearId: string;
  onClose: () => void;
}) {
  return (
    <CustomDialog
      open
      title="Academic structure"
      handleClose={onClose}
      maxWidth="xl"
      fullWidth
      hasForm={false}
      guardUnsavedChanges={false}
      paperProps={{ sx: { height: '90dvh' } }}
    >
      <Box sx={{ flex: 1, minHeight: 0, overflow: 'auto' }}>
        <YearSetup initialYearId={yearId} />
      </Box>
      <DialogActions sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
        <Button onClick={() => onClose()} variant="outlined">
          Back to setup
        </Button>
      </DialogActions>
    </CustomDialog>
  );
}

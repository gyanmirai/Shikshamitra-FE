import dynamic from 'next/dynamic';
import CustomDialog from 'src/components/customDialog';
import { Box, Button, Skeleton, DialogActions } from '@mui/material';
import { AcademicSetupContext } from 'src/components/academic-setup/academic-setup-context';

const YearSetup = dynamic(() => import('src/components/academic-setup/year-setup'), {
  loading: () => <Skeleton variant="rounded" height={400} />,
});
const ONBOARDING_CONTEXT = { isOnboarding: true };
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
      titleInfo="Manage boards, mediums, stages, classes and divisions for the selected academic year."
      handleClose={onClose}
      maxWidth="xl"
      fullWidth
      hasForm={false}
      guardUnsavedChanges={false}
      paperProps={{ sx: { height: '90dvh' } }}
    >
      <Box sx={{ flex: 1, minHeight: 0, overflow: 'auto' }}>
        <AcademicSetupContext.Provider value={ONBOARDING_CONTEXT}>
          <YearSetup initialYearId={yearId} />
        </AcademicSetupContext.Provider>
      </Box>
      <DialogActions sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
        <Button onClick={() => onClose()} variant="outlined">
          Back to setup
        </Button>
      </DialogActions>
    </CustomDialog>
  );
}

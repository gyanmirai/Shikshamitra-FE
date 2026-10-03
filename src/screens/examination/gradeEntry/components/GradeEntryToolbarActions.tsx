import { LoadingButton } from '@mui/lab';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { GradeEntryWorkflowStatus } from 'src/enums/grade-entry-status';

type Props = {
  workflowStatus: GradeEntryWorkflowStatus;
  allMarksAssigned: boolean;
  isSaveDraftLoading: boolean;
  isBulkSaveLoading: boolean;
  isSubmitLoading: boolean;
  isRequestChangesLoading: boolean;
  isVerifyLoading: boolean;
  isPublishLoading: boolean;
  isUnlockLoading: boolean;
  onSaveDraft: () => void;
  onReview: () => void;
  onRequestChanges: () => void;
  onVerify: () => void;
  onPublish: () => void;
  onUnlock: () => void;
};

export function GradeEntryToolbarActions({
  workflowStatus,
  allMarksAssigned,
  isSaveDraftLoading,
  isBulkSaveLoading,
  isSubmitLoading,
  isRequestChangesLoading,
  isVerifyLoading,
  isPublishLoading,
  isUnlockLoading,
  onSaveDraft,
  onReview,
  onRequestChanges,
  onVerify,
  onPublish,
  onUnlock,
}: Props) {
  return (
    <>
      {workflowStatus === GradeEntryWorkflowStatus.Draft && (
        <LoadingButton
          variant="outlined"
          size="small"
          color="inherit"
          loading={isSaveDraftLoading || isBulkSaveLoading}
          startIcon={<Iconify icon="solar:diskette-bold" />}
          onClick={onSaveDraft}
        >
          Save Draft
        </LoadingButton>
      )}
      {(workflowStatus === GradeEntryWorkflowStatus.Draft ||
        workflowStatus === GradeEntryWorkflowStatus.ChangesRequested) && (
        <LoadingButton
          variant="contained"
          size="small"
          color="primary"
          loading={isSubmitLoading}
          disabled={!allMarksAssigned}
          startIcon={<Iconify icon="solar:plain-bold" />}
          onClick={onReview}
        >
          Review & Submit
        </LoadingButton>
      )}
      {workflowStatus === GradeEntryWorkflowStatus.Submitted && (
        <>
          <LoadingButton
            variant="outlined"
            size="small"
            color="error"
            loading={isRequestChangesLoading}
            startIcon={<Iconify icon="solar:close-circle-bold" />}
            onClick={onRequestChanges}
          >
            Request Corrections
          </LoadingButton>
          <LoadingButton
            variant="outlined"
            size="small"
            color="warning"
            loading={isVerifyLoading}
            startIcon={<Iconify icon="solar:check-circle-bold" />}
            onClick={onVerify}
          >
            Verify Marks
          </LoadingButton>
        </>
      )}
      {workflowStatus === GradeEntryWorkflowStatus.Verified && (
        <LoadingButton
          variant="contained"
          size="small"
          color="primary"
          loading={isPublishLoading}
          disabled={!allMarksAssigned}
          startIcon={<Iconify icon={GlobalIcons.publish} />}
          onClick={onPublish}
        >
          Publish Marks
        </LoadingButton>
      )}
      {workflowStatus === GradeEntryWorkflowStatus.Published && (
        <LoadingButton
          variant="outlined"
          size="small"
          color="error"
          loading={isUnlockLoading}
          startIcon={<Iconify icon="solar:lock-open-bold" />}
          onClick={onUnlock}
        >
          Unlock Marks
        </LoadingButton>
      )}
    </>
  );
}

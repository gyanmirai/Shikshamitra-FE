import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { shikshaMitraToast } from 'src/components/toast';
import { LoadingButton } from 'src/components/loading-button';
import { ConfirmDialog } from 'src/components/confirm-dialog';

import type { SubjectDecisionDialogProps } from './SubjectDecisionDialogs';

export function SubjectDeleteDialog({
  deleteOpen,
  onCloseDelete,
  isDeleteLoading,
  selectedSubject,
  setSelectedSubject,
  currentMedium,
  deleteSubject,
}: Pick<
  SubjectDecisionDialogProps,
  | 'deleteOpen'
  | 'onCloseDelete'
  | 'isDeleteLoading'
  | 'selectedSubject'
  | 'setSelectedSubject'
  | 'currentMedium'
  | 'deleteSubject'
>) {
  return (
    <ConfirmDialog
      open={deleteOpen}
      onClose={() => {
        if (isDeleteLoading) return;
        setSelectedSubject(null);
        onCloseDelete();
      }}
      title="Delete Subject"
      disableBackdropClick
      disableEscapeKeyDown={isDeleteLoading}
      disableCancel={isDeleteLoading}
      content={
        <>
          {selectedSubject?.canDelete ? (
            <>
              Are you sure you want to delete subject{' '}
              <strong>&quot;{selectedSubject?.name}&quot;</strong>?
            </>
          ) : (
            <>
              <strong>&quot;{selectedSubject?.name}&quot;</strong> cannot be deleted because it is
              already used. You can archive this subject instead.
            </>
          )}
        </>
      }
      action={
        <LoadingButton
          loading={isDeleteLoading}
          type="button"
          startIcon={<Iconify icon={GlobalIcons.delete} width={16} />}
          variant="contained"
          color="error"
          size="small"
          disabled={!selectedSubject?.canDelete}
          onClick={async () => {
            if (!selectedSubject) return;
            try {
              await deleteSubject({
                academicMediumId: currentMedium.id,
                id: selectedSubject.id,
              }).unwrap();
              shikshaMitraToast.success({ message: 'Subject deleted successfully' });
            } catch (error: any) {
              shikshaMitraToast.error({
                message: error?.data?.message || 'Failed to delete subject.',
              });
            }
            onCloseDelete();
            setSelectedSubject(null);
          }}
        >
          Delete
        </LoadingButton>
      }
    />
  );
}

import { Button } from '@mui/material';
import { useDispatch } from 'react-redux';
import { useRouter } from 'src/routes/hooks';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import { useUnsavedNavigation } from 'src/hooks/use-unsaved-navigation';
import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';

export function useExamFormClose(open: boolean, dirty: boolean, close: () => void, busy = false) {
  const dispatch = useDispatch();
  const router = useRouter();
  const finish = () => {
    dispatch(setIsChanges(false));
    close();
  };
  const { requestNavigation, confirmation } = useUnsavedNavigation(open && dirty, {
    blockNavigation: open && busy,
    push: (href) => {
      finish();
      router.push(href);
    },
    renderConfirmation: (keepEditing, discard) => (
      <ConfirmDialog
        open
        icon="warning"
        title="Discard Unsaved Changes?"
        content="Your unsaved changes to this exam will be lost. Previously saved steps will remain."
        cancelText="Keep editing"
        onClose={keepEditing}
        action={
          <Button
            size="small"
            color="error"
            variant="contained"
            startIcon={<Iconify icon={GlobalIcons.delete} />}
            onClick={discard}
          >
            Discard changes
          </Button>
        }
      />
    ),
  });

  return {
    handleClose: (_event?: unknown, submitted = false) => {
      if (busy && !submitted) return;
      if (submitted) finish();
      else requestNavigation(finish);
    },
    confirmation: open ? confirmation : null,
  };
}

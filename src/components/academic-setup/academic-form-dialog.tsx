import type { ComponentProps } from 'react';

import { Button } from '@mui/material';
import { GlobalIcons } from 'src/utils/icons';
import { useMemo, useState, useEffect } from 'react';
import { useUnsavedNavigation } from 'src/hooks/use-unsaved-navigation';

import { Iconify } from '../iconify';
import CustomDialog from '../customDialog';
import { ConfirmDialog } from '../confirm-dialog';
import { useAcademicSetupContext } from './academic-setup-context';
import { AcademicFormCloseContext } from './academic-form-close-context';
import { academicFormGuidance, type AcademicFormKind } from './academic-form-guidance';

type Props = Omit<ComponentProps<typeof CustomDialog>, 'titleInfo'> & {
  kind: AcademicFormKind;
};

export function AcademicFormDialog({
  kind,
  open,
  children,
  handleClose,
  disableClose,
  ...props
}: Props) {
  const { isOnboarding } = useAcademicSetupContext();
  const [formState, setFormState] = useState({ dirty: false, busy: false });
  const busy = Boolean(disableClose || formState.busy);
  const { requestNavigation, cancelNavigation, confirmation } = useUnsavedNavigation(
    Boolean(open && formState.dirty),
    {
      blockNavigation: Boolean(open && busy),
      renderConfirmation: (keepEditing, discard) => (
        <ConfirmDialog
          open
          title="Discard Unsaved Changes?"
          content="Your changes to this form will be lost if you discard them."
          icon="warning"
          cancelText="Keep editing"
          disableBackdropClick
          disableCancel={busy}
          onClose={keepEditing}
          onKeyDown={(event) => {
            if (event.key === 'Escape' && !busy) {
              event.stopPropagation();
              keepEditing();
            }
          }}
          action={
            <Button
              type="button"
              variant="contained"
              color="error"
              disabled={busy}
              startIcon={<Iconify icon={GlobalIcons.delete} />}
              onClick={discard}
            >
              Discard changes
            </Button>
          }
        />
      ),
    }
  );

  useEffect(() => {
    if (!open) cancelNavigation();
  }, [open, cancelNavigation]);

  // Keep context consumers stable when only the discard confirmation opens or closes.
  const closeContext = useMemo(
    () => ({
      setFormState,
      requestClose: (...args: Parameters<Props['handleClose']>) =>
        requestNavigation(() => handleClose(...args)),
    }),
    [handleClose, requestNavigation]
  );

  return (
    <>
      <AcademicFormCloseContext.Provider value={closeContext}>
        <CustomDialog
          {...props}
          open={open}
          handleClose={closeContext.requestClose}
          disableClose={busy}
          guardUnsavedChanges={false}
          titleInfo={isOnboarding ? undefined : academicFormGuidance[kind].dialog}
        >
          {children}
        </CustomDialog>
      </AcademicFormCloseContext.Provider>
      {confirmation}
    </>
  );
}

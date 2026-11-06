import type { DialogProps } from '@mui/material';
import type { ReactNode, ComponentProps } from 'react';

import CustomDialog from 'src/components/customDialog';
import { useUnsavedNavigation } from 'src/hooks/use-unsaved-navigation';
import { renderUnsavedConfirmation } from 'src/components/confirm-dialog/render-unsaved-confirmation';

export function ReviewDialog({
  open = true,
  title,
  titleInfo,
  maxWidth = 'sm',
  dirty,
  busy,
  onClose,
  children,
  actions,
  formProps,
}: {
  open?: boolean;
  title: string;
  titleInfo?: string;
  maxWidth?: DialogProps['maxWidth'];
  dirty: boolean;
  busy: boolean;
  onClose: () => void;
  children: ReactNode;
  actions: (requestClose: () => void) => ReactNode;
  formProps?: ComponentProps<typeof CustomDialog>['formProps'];
}) {
  const guard = useUnsavedNavigation(open && dirty, {
    blockNavigation: open && busy,
    guardContextChanges: open,
    renderConfirmation: (keepEditing, discard) =>
      renderUnsavedConfirmation(keepEditing, discard, { busy }),
  });
  const requestClose = () => guard.requestNavigation(onClose);
  return (
    <>
      <CustomDialog
        open={open}
        title={title}
        titleInfo={titleInfo}
        maxWidth={maxWidth}
        handleClose={requestClose}
        guardUnsavedChanges={false}
        disableClose={busy}
        formProps={formProps}
      >
        {children}
        {actions(requestClose)}
      </CustomDialog>
      {guard.confirmation}
    </>
  );
}

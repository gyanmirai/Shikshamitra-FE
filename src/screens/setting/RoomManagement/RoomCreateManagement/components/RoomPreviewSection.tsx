import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import { Alert, Button, DialogActions } from '@mui/material';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';

import { RoomLayoutPreview } from './RoomLayoutPreview';

import type { RoomFormValues } from '../types/room-form';

export function RoomPreviewSection({
  values,
  disabled,
}: {
  values: RoomFormValues;
  disabled?: boolean;
}) {
  const preview = useBoolean();
  return (
    <>
      <Button
        type="button"
        variant="outlined"
        size="small"
        disabled={disabled}
        aria-haspopup="dialog"
        startIcon={<Iconify icon={GlobalIcons.eye} />}
        onClick={preview.onTrue}
        sx={{ alignSelf: 'flex-start' }}
      >
        Preview room
      </Button>
      {preview.value && (
        <CustomDialog
          open
          handleClose={preview.onFalse}
          title="Room Preview"
          titleInfo="Review the entered room layout. Student figures represent capacity, without assigning students."
          maxWidth="md"
          hasForm={false}
          guardUnsavedChanges={false}
          hasUnsavedChanges={false}
        >
          <DialogScrollContent>
            {values.columns !== '' && values.columnRows.length === Number(values.columns) ? (
              <RoomLayoutPreview rows={values.columnRows} benchCapacity={values.benchCapacity} />
            ) : (
              <Alert severity="info">Enter a valid column count to preview the room.</Alert>
            )}
          </DialogScrollContent>
          <DialogActions sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
            <Button type="button" variant="outlined" size="small" onClick={preview.onFalse}>
              Back to form
            </Button>
          </DialogActions>
        </CustomDialog>
      )}
    </>
  );
}

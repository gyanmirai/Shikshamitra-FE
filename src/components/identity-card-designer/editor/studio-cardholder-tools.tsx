import { useState } from 'react';
import { Box, Stack, Button, DialogActions } from '@mui/material';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';

import { DesignerSelect } from '../controls';

import type { IdentityCardPhotoRecord } from '../types';
import type { useStudioPhoto } from './use-studio-photo';

export function StudioCardholderTools({
  photo,
  records,
  disabled,
}: {
  photo: ReturnType<typeof useStudioPhoto>;
  records: IdentityCardPhotoRecord[];
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const select = (label: string) => (
    <DesignerSelect
      label={label}
      value={photo.record?.id ?? ''}
      options={records.map((record) => ({ value: record.id, label: record.name }))}
      onChange={photo.setRecordId}
      disabled={disabled || photo.loading}
    />
  );
  return (
    <>
      <Stack
        direction="row"
        spacing={1}
        alignItems="center"
        sx={{ display: { xs: 'none', sm: 'flex' } }}
      >
        <Box sx={{ width: 180 }}>{select('Preview person')}</Box>
        <Button
          size="small"
          variant="outlined"
          color="inherit"
          onClick={photo.open}
          disabled={disabled || photo.loading}
        >
          {photo.loading ? 'Loading photo…' : 'Edit photo'}
        </Button>
      </Stack>
      <Box sx={{ display: { xs: 'block', sm: 'none' } }}>
        <Button
          size="small"
          variant="outlined"
          color="inherit"
          aria-haspopup="dialog"
          aria-label="Cardholder photo tools"
          loading={photo.loading}
          onClick={() => setOpen(true)}
          disabled={disabled || photo.loading}
          sx={{ minHeight: 44 }}
        >
          Photo
        </Button>
      </Box>
      {open && (
        <CustomDialog
          open={open}
          handleClose={() => setOpen(false)}
          title="Cardholder Photo"
          titleInfo="Select whose card to preview, then edit their photo. These edits apply only to this card workflow."
          maxWidth="xs"
          hasForm={false}
          guardUnsavedChanges={false}
        >
          <DialogScrollContent>{select('Cardholder')}</DialogScrollContent>
          <DialogActions>
            <Button size="small" color="inherit" onClick={() => setOpen(false)}>
              Close
            </Button>
            <Button
              size="small"
              variant="contained"
              onClick={() => {
                setOpen(false);
                photo.open();
              }}
              disabled={disabled || photo.loading}
            >
              Edit photo
            </Button>
          </DialogActions>
        </CustomDialog>
      )}
    </>
  );
}

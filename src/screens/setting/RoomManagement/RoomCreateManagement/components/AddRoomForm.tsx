'use client';

import type { UseBooleanReturn } from 'src/hooks/use-boolean';

import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { useRef, useState, useEffect } from 'react';
import SubmitButton from 'src/components/submit-button';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import { Box, Alert, Stack, Button, DialogActions, CircularProgress } from '@mui/material';

import { RoomFeatures } from './RoomFeatures';
import { RoomImageField } from './RoomImageField';
import { useRoomForm } from '../hooks/useRoomForm';
import { RoomBasicDetails } from './RoomBasicDetails';
import { RoomBenchDetails } from './RoomBenchDetails';
import { RoomPreviewSection } from './RoomPreviewSection';

import type { IRoom } from '../types';

interface IRoomFormProps {
  open: UseBooleanReturn;
  onClose: () => void;
  editData?: IRoom | null;
}

export default function RoomForm({ open, onClose, editData }: IRoomFormProps) {
  const {
    formik,
    buildings,
    floors,
    roomTypes,
    saving: roomSaving,
    loadingOptions,
    optionsError,
    retryOptions,
  } = useRoomForm(editData, onClose);
  const bodyRef = useRef<HTMLDivElement>(null);
  const [featureBusy, setFeatureBusy] = useState(false);
  const saving = roomSaving || featureBusy;

  useEffect(() => {
    if (!formik.submitCount || formik.isSubmitting || formik.isValidating || formik.isValid) return;
    bodyRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]:not(:disabled)')?.focus();
  }, [formik.submitCount, formik.isSubmitting, formik.isValidating, formik.isValid]);

  const cancel = () => {
    if (!saving && (!formik.dirty || window.confirm('Are you sure you want to leave this page?')))
      onClose();
  };

  return (
    <CustomDialog
      open={open.value}
      handleClose={onClose}
      title={editData ? 'Update Room' : 'Add Room'}
      titleInfo="Choose the room location and type, configure its seating, and select the available facilities."
      maxWidth="sm"
      disableClose={saving}
      hasUnsavedChanges={formik.dirty}
      hasForm={false}
    >
      <Box
        component="form"
        noValidate
        id="room-form"
        onSubmit={(event) => {
          event.preventDefault();
          event.stopPropagation();
          if (!saving && !loadingOptions && !optionsError) formik.submitForm();
        }}
        sx={{ display: 'flex', flexDirection: 'column', minHeight: 0, flex: 1 }}
      >
        <DialogScrollContent>
          <Box ref={bodyRef} sx={{ position: 'relative' }} aria-busy={saving}>
            <Box
              component="fieldset"
              disabled={saving}
              inert={saving}
              sx={{ border: 0, p: 0, m: 0, minWidth: 0 }}
            >
              <Stack spacing={2}>
                {optionsError && (
                  <Alert severity="error" action={<Button onClick={retryOptions}>Retry</Button>}>
                    Room options could not be loaded. Retry to choose a building and room type.
                  </Alert>
                )}
                <RoomBasicDetails
                  formik={formik}
                  buildings={buildings}
                  floors={floors}
                  roomTypes={roomTypes}
                  loading={loadingOptions}
                />
                <RoomBenchDetails formik={formik} />
                <RoomImageField formik={formik} room={editData} />
                <RoomFeatures
                  selected={formik.values.features}
                  onChange={(features) => formik.setFieldValue('features', features)}
                  onBusyChange={setFeatureBusy}
                />
                {formik.status && <Alert severity="error">{formik.status}</Alert>}
              </Stack>
            </Box>
            {saving && (
              <Box
                role="status"
                sx={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  gap: 1,
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: 'action.disabledBackground',
                  zIndex: 1,
                }}
              >
                <CircularProgress size={24} aria-hidden />
                Submitting room…
              </Box>
            )}
          </Box>
        </DialogScrollContent>
        <DialogActions
          disableSpacing
          sx={{ p: 2, borderTop: 1, borderColor: 'divider', flexWrap: 'wrap', gap: 1 }}
        >
          <Box sx={{ flexGrow: 1, flexBasis: { xs: '100%', sm: 'auto' } }}>
            <RoomPreviewSection values={formik.values} disabled={saving} />
          </Box>
          <Button
            type="button"
            size="small"
            variant="outlined"
            disabled={saving}
            startIcon={<Iconify icon={GlobalIcons.cancel} />}
            onClick={cancel}
          >
            Cancel
          </Button>
          <SubmitButton loading={saving} disabled={loadingOptions || optionsError} />
        </DialogActions>
      </Box>
    </CustomDialog>
  );
}

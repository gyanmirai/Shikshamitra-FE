'use client';

import type { UseBooleanReturn } from 'src/hooks/use-boolean';

import { useBoolean } from 'src/hooks/use-boolean';
import { useRef, useState, useEffect } from 'react';
import { Box, Alert, Stack, Button } from '@mui/material';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';

import { RoomFeatures } from './RoomFeatures';
import { RoomImageField } from './RoomImageField';
import { useRoomForm } from '../hooks/useRoomForm';
import { RoomFormActions } from './RoomFormActions';
import { RoomBasicDetails } from './RoomBasicDetails';
import { RoomBenchDetails } from './RoomBenchDetails';
import { RoomCapacityAlert } from './RoomCapacityAlert';
import { RoomBuildingEditor } from './RoomBuildingEditor';
import { useRoomDiscardGuard } from './useRoomDiscardGuard';
import { RoomFormSavingState } from './RoomFormSavingState';

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
    capacity,
    capacityBlocked,
    refreshBuildings,
  } = useRoomForm(editData, onClose);
  const buildingEditor = useBoolean();
  const bodyRef = useRef<HTMLDivElement>(null);
  const focusedSubmission = useRef(0);
  const [featureBusy, setFeatureBusy] = useState(false);
  const saving = roomSaving || featureBusy;
  const submitDisabled = loadingOptions || optionsError || capacityBlocked || buildingEditor.value;

  useEffect(() => {
    if (!formik.submitCount) {
      focusedSubmission.current = 0;
      return;
    }
    if (
      formik.isSubmitting ||
      formik.isValidating ||
      focusedSubmission.current === formik.submitCount
    )
      return;
    focusedSubmission.current = formik.submitCount;
    if (!formik.isValid)
      bodyRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]:not(:disabled)')?.focus();
  }, [formik.submitCount, formik.isSubmitting, formik.isValidating, formik.isValid]);

  const { requestClose, confirmation } = useRoomDiscardGuard(
    open.value && formik.dirty,
    saving,
    onClose
  );

  return (
    <>
      <CustomDialog
        open={open.value}
        handleClose={requestClose}
        title={editData ? 'Update Room' : 'Add Room'}
        titleInfo="Choose the room location and type, configure its seating, and select the available facilities."
        maxWidth="sm"
        disableClose={saving}
        guardUnsavedChanges={false}
        hasForm={false}
      >
        <Box
          component="form"
          noValidate
          id="room-form"
          onSubmit={(event) => {
            event.preventDefault();
            event.stopPropagation();
            if (!saving && !submitDisabled) formik.submitForm();
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
                    isEditing={Boolean(editData)}
                  />
                  {capacityBlocked && capacity && (
                    <RoomCapacityAlert
                      building={capacity.building}
                      floor={capacity.floor}
                      disabled={saving || loadingOptions || optionsError}
                      onEdit={buildingEditor.onTrue}
                      onRefresh={refreshBuildings}
                    />
                  )}
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
              {saving && <RoomFormSavingState />}
            </Box>
          </DialogScrollContent>
          <RoomFormActions
            values={formik.values}
            saving={saving}
            submitDisabled={submitDisabled}
            onClose={requestClose}
          />
        </Box>
      </CustomDialog>
      {buildingEditor.value && capacity && (
        <RoomBuildingEditor
          open={buildingEditor}
          building={capacity.building}
          onSaved={async () => {
            await refreshBuildings();
            bodyRef.current?.querySelector<HTMLInputElement>('[name="roomName"]')?.focus();
          }}
        />
      )}
      {confirmation}
    </>
  );
}

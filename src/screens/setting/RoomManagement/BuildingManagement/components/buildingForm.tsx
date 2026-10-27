import { useState } from 'react';
import { FormikProvider } from 'formik';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import SubmitButton from 'src/components/submit-button';
import { FormBusyRegion } from 'src/components/form-busy-region';
import { Box, Stack, Alert, Button, DialogActions } from '@mui/material';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';

import { useBuildingForm } from './use-building-form';
import { useBuildingClose } from './use-building-close';
import { BuildingFloorsSection } from './building-floors-section';
import { BuildingDetailsSection } from './building-details-section';

import type { IBuildingFormProps } from '../types';

const BuildingForm = (props: IBuildingFormProps) => {
  const { editData, onClose, open } = props;
  const [isDragging, setIsDragging] = useState(false);
  const formik = useBuildingForm(props);
  const { requestClose, confirmation } = useBuildingClose(
    open.value && formik.dirty,
    formik.isSubmitting,
    () => {
      formik.resetForm();
      onClose(null, false);
    }
  );
  const hasRemovedFloors = editData?.floors.some(
    (floor) => !formik.values.floors.some((current) => current.id === floor.id)
  );
  return (
    <>
      <CustomDialog
        open={open.value}
        title={editData ? 'Edit Building' : 'Add Building'}
        titleInfo="Enter the building details, add floors, and drag their handles or use the arrows to set the sequence."
        maxWidth="sm"
        hasForm={false}
        guardUnsavedChanges={false}
        disableClose={formik.isSubmitting}
        disableEscapeKeyDown={isDragging}
        handleClose={requestClose}
      >
        <FormikProvider value={formik}>
          <Box
            component="form"
            data-building-form
            noValidate
            onSubmit={formik.handleSubmit}
            sx={{ display: 'flex', flexDirection: 'column', minHeight: 0, flex: 1 }}
          >
            <DialogScrollContent>
              <FormBusyRegion busy={formik.isSubmitting} label="Saving building...">
                <Stack spacing={2}>
                  {formik.usageError && (
                    <Alert
                      severity="error"
                      action={
                        <Button disabled={formik.loadingUsage} onClick={formik.refreshUsage}>
                          Retry
                        </Button>
                      }
                    >
                      Room counts could not be loaded. Retry before updating this building.
                    </Alert>
                  )}
                  <BuildingDetailsSection formik={formik} isEditing={Boolean(editData)} />
                  <BuildingFloorsSection formik={formik} onDraggingChange={setIsDragging} />
                  {editData && (
                    <Box>
                      <Button
                        type="button"
                        size="small"
                        disabled={formik.loadingUsage}
                        onClick={formik.refreshUsage}
                        startIcon={<Iconify icon={GlobalIcons.refresh} />}
                      >
                        Refresh room counts
                      </Button>
                    </Box>
                  )}
                  {formik.status && (
                    <Alert severity="error">
                      {formik.status}
                      {hasRemovedFloors &&
                        ' A floor with assigned rooms cannot be removed. Restore that floor or move its rooms before trying again.'}
                    </Alert>
                  )}
                </Stack>
              </FormBusyRegion>
            </DialogScrollContent>
            <DialogActions>
              <Button
                type="button"
                size="small"
                variant="outlined"
                disabled={formik.isSubmitting}
                startIcon={<Iconify icon={GlobalIcons.cancel} width={18} />}
                onClick={requestClose}
              >
                Cancel
              </Button>
              <SubmitButton
                loading={formik.isSubmitting || formik.loadingUsage}
                disabled={formik.usageError}
                startIcon={<Iconify icon={GlobalIcons.submit} width={18} />}
              />
            </DialogActions>
          </Box>
        </FormikProvider>
      </CustomDialog>
      {confirmation}
    </>
  );
};

export default BuildingForm;

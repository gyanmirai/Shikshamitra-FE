import { useState } from 'react';
import { FormikProvider } from 'formik';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import SubmitButton from 'src/components/submit-button';
import { FormBusyRegion } from 'src/components/form-busy-region';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import { Box, Stack, Alert, Button, Typography, DialogActions } from '@mui/material';

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
              <FormBusyRegion busy={formik.isSaving} label="Saving building...">
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
                  <BuildingFloorsSection
                    formik={formik}
                    occupiedFloorIds={formik.occupiedFloorIds}
                    usagePending={formik.loadingUsage || formik.usageError}
                    onDraggingChange={setIsDragging}
                  />
                  {editData && (
                    <Stack spacing={0.5} alignItems="flex-start">
                      <Button
                        type="button"
                        size="small"
                        disabled={formik.isSubmitting}
                        loading={formik.loadingUsage}
                        loadingPosition="start"
                        onClick={formik.refreshUsage}
                        startIcon={<Iconify icon={GlobalIcons.refresh} />}
                      >
                        Refresh room counts
                      </Button>
                      <Typography variant="caption" color="text.secondary">
                        Use after moving or deleting rooms to check which floors are still in use.
                      </Typography>
                    </Stack>
                  )}
                  {formik.status && <Alert severity="error">{formik.status}</Alert>}
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
                loading={formik.isSaving}
                disabled={formik.isSubmitting || formik.loadingUsage || formik.usageError}
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

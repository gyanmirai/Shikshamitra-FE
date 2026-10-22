'use client';

import { GlobalIcons } from 'src/utils/icons';
import React, { useRef, useEffect } from 'react';
import { Iconify } from 'src/components/iconify';
import { LoadingButton } from 'src/components/loading-button';
import { Box, Grid, Button, DialogActions } from '@mui/material';
import { FormBusyRegion } from 'src/components/form-busy-region';
import { FormSectionCard } from 'src/components/form-section-card';
import { useUnsavedNavigation } from 'src/hooks/use-unsaved-navigation';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';

import { useSubjectForm } from './hooks/useSubjectForm';
import { SubjectDiscardDialog } from './components/SubjectDiscardDialog';
import { SubjectIdentityFields } from './components/SubjectIdentityFields';
import { SubjectConfigurationFields } from './components/SubjectConfigurationFields';

import type { ISubjectFormProps } from './type';

const SettingSubjectForm: React.FC<ISubjectFormProps> = ({ open, onClose, editData }) => {
  const { formik, isSaveLoading, possibleDuplicateDialog } = useSubjectForm({
    onClose,
    editData,
  });
  const busy = isSaveLoading || formik.isSubmitting;
  const contentRef = useRef<HTMLDivElement>(null);
  const focusedSubmit = useRef(0);
  const { requestNavigation, confirmation } = useUnsavedNavigation(formik.dirty, {
    blockNavigation: busy,
    renderConfirmation: (onKeepEditing, onDiscard) => (
      <SubjectDiscardDialog onKeepEditing={onKeepEditing} onDiscard={onDiscard} />
    ),
  });
  const requestClose = () => requestNavigation(() => onClose(null, false));

  useEffect(() => {
    if (
      !formik.submitCount ||
      busy ||
      formik.isValidating ||
      focusedSubmit.current === formik.submitCount
    )
      return;
    focusedSubmit.current = formik.submitCount;
    const first = ['subjectName', 'displayName', 'category', 'subjectColor', 'description'].find(
      (name) => formik.errors[name as keyof typeof formik.errors]
    );
    if (!first) return;
    const selector = first === 'subjectColor' ? '[data-subject-color]' : `[name="${first}"]`;
    const field = contentRef.current?.querySelector<HTMLElement>(selector);
    (field?.getAttribute('type') === 'hidden'
      ? field.parentElement?.querySelector<HTMLElement>('[role="combobox"]')
      : field
    )?.focus();
  }, [formik, busy]);

  return (
    <>
      <CustomDialog
        open={open.value}
        title={editData ? 'Edit Subject' : 'Add Subject'}
        titleInfo="Define the subject name, display name, category, and color used across academics."
        handleClose={requestClose}
        guardUnsavedChanges={false}
        disableClose={busy}
        formProps={{
          noValidate: true,
          onSubmit: (event) => {
            event.preventDefault();
            if (!busy) formik.submitForm();
          },
        }}
      >
        <BackPopUpChecked initialValues={formik.initialValues} currentValues={formik.values}>
          <DialogScrollContent
            onSubmit={() => {
              if (!busy) formik.submitForm();
            }}
          >
            <Box ref={contentRef}>
              <FormBusyRegion busy={busy} label="Saving subject…" showOverlay={false}>
                <FormSectionCard
                  icon="mdi:book-open-page-variant-outline"
                  title="Subject Details"
                  titleTypographyProps={{ variant: 'subtitle1', fontWeight: 600 }}
                  descriptionTooltip="Define how this subject is named, grouped, and identified across academics."
                >
                  <Grid container spacing={2}>
                    <SubjectIdentityFields formik={formik} />
                    <SubjectConfigurationFields
                      formik={formik}
                      isUsed={Boolean(editData?.isUsed)}
                    />
                  </Grid>
                </FormSectionCard>
              </FormBusyRegion>
            </Box>
          </DialogScrollContent>

          <DialogActions sx={{ p: 2, boxShadow: 'var(--shadows-10)' }}>
            <Button
              startIcon={<Iconify icon={GlobalIcons.cancel} />}
              onClick={requestClose}
              type="button"
              variant="outlined"
              size="small"
              disabled={isSaveLoading || formik.isSubmitting}
            >
              Cancel
            </Button>
            <LoadingButton
              size="small"
              variant="contained"
              loading={isSaveLoading || formik.isSubmitting}
              startIcon={<Iconify icon={GlobalIcons.submit} width={20} />}
              type="submit"
            >
              Submit
            </LoadingButton>
          </DialogActions>

          {possibleDuplicateDialog}
        </BackPopUpChecked>
      </CustomDialog>
      {confirmation}
    </>
  );
};

export default SettingSubjectForm;

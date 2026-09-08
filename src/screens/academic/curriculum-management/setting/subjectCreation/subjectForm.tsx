'use client';

import React from 'react';
import { LoadingButton } from '@mui/lab';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { Grid, Button, DialogActions } from '@mui/material';
import { DialogScrollContent } from 'src/components/customDialog';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';

import { useSubjectForm } from './hooks/useSubjectForm';
import { SubjectIdentityFields } from './components/SubjectIdentityFields';
import { SubjectConfigurationFields } from './components/SubjectConfigurationFields';

import type { ISubjectFormProps } from './type';

const SettingSubjectForm: React.FC<ISubjectFormProps> = ({ onClose, editData }) => {
  const { formik, isSaveLoading, possibleDuplicateDialog } = useSubjectForm({
    onClose,
    editData,
  });

  return (
    <BackPopUpChecked initialValues={formik.initialValues} currentValues={formik.values}>
      <DialogScrollContent>
        <Grid container spacing={2}>
          <SubjectIdentityFields formik={formik} />
          <SubjectConfigurationFields formik={formik} isUsed={Boolean(editData?.isUsed)} />
        </Grid>
      </DialogScrollContent>

      <DialogActions sx={{ p: 2, boxShadow: 'var(--shadows-10)' }}>
        <Button
          startIcon={<Iconify icon={GlobalIcons.cancel} />}
          onClick={() => onClose(null, false)}
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
          startIcon={
            <Iconify
              icon={editData ? GlobalIcons.edit : GlobalIcons.submit}
              width={editData ? 16 : 20}
              height={editData ? 16 : 20}
            />
          }
          onClick={() => {
            formik.submitForm();
          }}
          type="submit"
        >
          {editData ? 'Update' : 'Submit'}
        </LoadingButton>
      </DialogActions>

      {possibleDuplicateDialog}
    </BackPopUpChecked>
  );
};

export default SettingSubjectForm;

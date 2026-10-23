'use client';

import React from 'react';
import { LoadingButton } from '@mui/lab';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { Stack, Button, DialogActions } from '@mui/material';
import { DialogScrollContent } from 'src/components/customDialog';
import { FormSectionCard } from 'src/components/form-section-card';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';

import { useElectiveSubjectForm } from '../hooks/useElectiveSubjectForm';
import { ElectiveGroupDetailsFields } from './ElectiveGroupDetailsFields';
import { ElectiveGroupSubjectSelection } from './ElectiveGroupSubjectSelection';

import type { IElectiveSubjectFormProps } from '../type';

const SettingElectiveSubjectForm: React.FC<IElectiveSubjectFormProps> = ({ onClose, editData }) => {
  const { formik, subjectData, isSubjectLoading, isSaveLoading, areSubjectsLocked } =
    useElectiveSubjectForm({ onClose, editData });

  return (
    <BackPopUpChecked initialValues={formik.initialValues} currentValues={formik.values}>
      <DialogScrollContent>
        <Stack spacing={1.5}>
          <FormSectionCard
            icon="mdi:shape-outline"
            title="Group Details"
            titleTypographyProps={{ variant: 'subtitle1', fontWeight: 600 }}
            descriptionTooltip="Define the elective group identity and how it appears across academics."
          >
            <ElectiveGroupDetailsFields formik={formik} />
          </FormSectionCard>

          <FormSectionCard
            icon="mdi:book-multiple-outline"
            title="Subject Selection"
            titleTypographyProps={{ variant: 'subtitle1', fontWeight: 600 }}
            descriptionTooltip="Choose the subjects that belong to this elective group."
          >
            <ElectiveGroupSubjectSelection
              formik={formik}
              subjects={subjectData || []}
              isLoading={isSubjectLoading}
              isLocked={areSubjectsLocked}
            />
          </FormSectionCard>
        </Stack>
      </DialogScrollContent>

      <DialogActions sx={{ p: 2, boxShadow: 'var(--shadows-10)' }}>
        <Button
          startIcon={<Iconify icon={GlobalIcons.cancel} />}
          size="small"
          onClick={() => onClose(null, false)}
          variant="outlined"
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
          onClick={() => formik.submitForm()}
          type="submit"
        >
          Submit
        </LoadingButton>
      </DialogActions>
    </BackPopUpChecked>
  );
};

export default SettingElectiveSubjectForm;

import type { AdmissionDocumentTypeOption } from 'src/redux/student/admissions/admission-document-settings-api';
import type { AdmissionDocumentRequirementPolicy } from 'src/redux/student/admissions/admission-document-policy';

import { useFormik } from 'formik';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import CustomDialog from 'src/components/customDialog';
import { useResponsive } from 'src/hooks/use-responsive';
import { CustomPopover } from 'src/components/custom-popover';
import { StudentFeedback } from 'src/components/student-feedback';
import { FormSectionCard } from 'src/components/form-section-card';
import { documentRequirementSchema } from 'src/redux/student/admissions/admission-document-policy-validation';
import {
  Box,
  Grid,
  Stack,
  Button,
  Switch,
  Divider,
  Typography,
  IconButton,
  FormControlLabel,
} from '@mui/material';

import { AdmissionDialogTitle } from '../../admission-dialog-title';
import { useAdmissionDraftGuard } from '../../use-admission-draft-guard';
import { DocumentRequirementBasics } from './document-requirement-basics';
import { DocumentRequirementClasses } from './document-requirement-classes';
import { DocumentRequirementCollection } from './document-requirement-collection';

import type { DocumentCategoryQueryState } from './document-requirement-collection';

type Props = DocumentCategoryQueryState & {
  initial: AdmissionDocumentRequirementPolicy;
  documentTypes: AdmissionDocumentTypeOption[];
  existingCodes: string[];
  anchorEl?: HTMLElement | null;
  onClose: () => void;
  onSave: (value: AdmissionDocumentRequirementPolicy) => void;
};

export function DocumentRequirementDialog({
  initial,
  documentTypes,
  existingCodes,
  anchorEl,
  onClose,
  onSave,
  documentTypesLoading,
  documentTypesError,
  onRetryDocumentTypes,
}: Props) {
  const desktop = useResponsive('up', 'sm');
  const formik = useFormik<AdmissionDocumentRequirementPolicy>({
    initialValues: initial,
    validationSchema: documentRequirementSchema,
    validate: (values) => {
      const errors: { code?: string; documentTypeId?: string; requirement?: string } = {};
      if (values.requirement === 'conditional')
        errors.requirement = 'Choose required or optional for this document.';
      if (values.code && existingCodes.includes(values.code))
        errors.code = 'This document reference is already in use';
      const mapped = documentTypes.find((item) => item.id === values.documentTypeId);
      if (
        mapped &&
        !values.allowedExtensions.some((extension) => mapped.allowedExtensions.includes(extension))
      ) {
        errors.documentTypeId =
          'Choose a category that accepts at least one of the selected file formats.';
      }
      return errors;
    },
    onSubmit: (values) => {
      onSave({
        ...values,
        name: values.name.trim(),
        description: values.description?.trim(),
        collectionMode: 'upload',
        conditionJson: undefined,
      });
      onClose();
    },
  });
  const guard = useAdmissionDraftGuard({ dirty: formik.dirty, reset: formik.resetForm });
  const requestClose = () => guard.requestNavigation(onClose);
  const body = (
    <Box
      component="form"
      noValidate
      onSubmit={(event) => {
        event.stopPropagation();
        formik.handleSubmit(event);
      }}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: 0,
        maxHeight: 'calc(100dvh - 48px)',
      }}
    >
      {desktop && anchorEl && (
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{ px: 2, py: 1.5 }}
        >
          <Typography id="document-requirement-title" variant="subtitle1" component="h2">
            <AdmissionDialogTitle
              title="Configure Document Requirement"
              helpText="Configure one evidence requirement in the current workflow draft."
              helpLabel="Document requirement information"
            />
          </Typography>
          <IconButton size="small" aria-label="Close Document Requirement" onClick={requestClose}>
            <Iconify icon="mdi:close" />
          </IconButton>
        </Stack>
      )}
      {desktop && anchorEl && <Divider />}
      <Scrollbar sx={{ minHeight: 0 }}>
        <FormSectionCard
          title="Requirement Details"
          icon={GlobalIcons.documentIcon}
          descriptionTooltip="Choose the document evidence, applicable classes and accepted upload category. This updates the workflow draft; it does not verify an applicant's document."
          sx={{ m: 2 }}
        >
          <Stack spacing={1.5} sx={{ p: 2 }}>
            <DocumentRequirementBasics formik={formik} />
            {formik.values.requirement === 'conditional' && (
              <StudentFeedback notificationKey="STU-0510" presentation="inline" severity="warning">
                Choose required or optional for this document.
              </StudentFeedback>
            )}
            <Grid container spacing={1.5}>
              <Grid size={{ xs: 12 }}>
                <DocumentRequirementClasses formik={formik} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControlLabel
                  label="Required document"
                  sx={{
                    m: 0,
                    width: 1,
                    justifyContent: 'space-between',
                    flexDirection: 'row-reverse',
                  }}
                  control={
                    <Switch
                      size="small"
                      slotProps={{ input: { 'aria-label': 'Required document' } }}
                      checked={formik.values.requirement === 'required'}
                      onChange={(_, checked) =>
                        formik.setValues({
                          ...formik.values,
                          requirement: checked ? 'required' : 'optional',
                          conditionJson: undefined,
                        })
                      }
                    />
                  }
                />
              </Grid>
            </Grid>
            <DocumentRequirementCollection
              formik={formik}
              documentTypes={documentTypes}
              documentTypesLoading={documentTypesLoading}
              documentTypesError={documentTypesError}
              onRetryDocumentTypes={onRetryDocumentTypes}
            />
          </Stack>
        </FormSectionCard>
      </Scrollbar>
      <Stack
        direction="row"
        spacing={1}
        justifyContent="flex-end"
        sx={{ p: 1.5, borderTop: 1, borderColor: 'divider', flexShrink: 0 }}
      >
        <Button
          size="small"
          variant="outlined"
          startIcon={<Iconify icon={GlobalIcons.cancel} />}
          onClick={requestClose}
        >
          Cancel
        </Button>
        <Button
          size="small"
          variant="contained"
          color="inherit"
          startIcon={<Iconify icon={GlobalIcons.submit} />}
          type="submit"
        >
          Submit
        </Button>
      </Stack>
    </Box>
  );
  return (
    <>
      {desktop && anchorEl ? (
        <CustomPopover
          open
          anchorEl={anchorEl}
          onClose={requestClose}
          slotProps={{
            arrow: { hide: true },
            paper: { sx: { width: 560, maxWidth: 'calc(100vw - 32px)', overflow: 'hidden' } },
          }}
        >
          <Box role="dialog" aria-modal="true" aria-labelledby="document-requirement-title">
            {body}
          </Box>
        </CustomPopover>
      ) : (
        <CustomDialog
          open
          hasForm={false}
          title="Configure Document Requirement"
          titleInfo="Configure one evidence requirement in the current workflow draft."
          handleClose={requestClose}
          maxWidth="sm"
          guardUnsavedChanges={false}
        >
          {body}
        </CustomDialog>
      )}
      {guard.confirmation}
    </>
  );
}

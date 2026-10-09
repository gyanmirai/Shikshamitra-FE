import type { AdmissionDocumentTypeOption } from 'src/redux/student/admissions/admission-document-settings-api';
import type { AdmissionDocumentRequirementPolicy } from 'src/redux/student/admissions/admission-document-policy';

import { useFormik } from 'formik';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import { Scrollbar } from 'src/components/scrollbar';
import CustomDialog from 'src/components/customDialog';
import { useResponsive } from 'src/hooks/use-responsive';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import { CustomPopover } from 'src/components/custom-popover';
import { documentRequirementSchema } from 'src/redux/student/admissions/admission-document-policy-validation';
import {
  Box,
  Grid,
  Alert,
  Stack,
  Button,
  Switch,
  Divider,
  Typography,
  IconButton,
  FormControlLabel,
} from '@mui/material';

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
  const discard = useBoolean();
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
  const requestClose = () => {
    if (formik.dirty) discard.onTrue();
    else onClose();
  };
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
          <Typography id="document-requirement-title" variant="subtitle1">
            Configure document requirement
          </Typography>
          <IconButton size="small" aria-label="Close document requirement" onClick={requestClose}>
            <Iconify icon="mdi:close" />
          </IconButton>
        </Stack>
      )}
      {desktop && anchorEl && <Divider />}
      <Scrollbar sx={{ minHeight: 0 }}>
        <Stack spacing={1.5} sx={{ p: 2 }}>
          <DocumentRequirementBasics formik={formik} />
          {formik.values.requirement === 'conditional' && (
            <Alert severity="warning">Choose required or optional for this document.</Alert>
          )}
          <Grid container spacing={1.5}>
            <Grid size={{ xs: 12, sm: 6 }}>
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
      </Scrollbar>
      <Stack
        direction="row"
        spacing={1}
        justifyContent="flex-end"
        sx={{ p: 1.5, borderTop: 1, borderColor: 'divider', flexShrink: 0 }}
      >
        <Button size="small" variant="outlined" onClick={requestClose}>
          Cancel
        </Button>
        <Button size="small" variant="contained" type="submit">
          Save requirement
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
          title="Configure document requirement"
          handleClose={requestClose}
          maxWidth="sm"
          guardUnsavedChanges={false}
        >
          {body}
        </CustomDialog>
      )}
      <ConfirmDialog
        open={discard.value}
        onClose={discard.onFalse}
        title="Discard document changes?"
        content="Your changes to this requirement have not been saved."
        action={
          <Button size="small" color="error" variant="contained" onClick={onClose}>
            Discard changes
          </Button>
        }
      />
    </>
  );
}

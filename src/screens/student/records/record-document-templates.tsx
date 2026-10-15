'use client';

import type {
  IdCardTemplate,
  CertificateType,
  CertificateTemplate,
} from 'src/redux/student/records/student-record-documents-api';

import * as Yup from 'yup';
import { useState } from 'react';
import { useFormik } from 'formik';
import { TemplateIdentityAsset } from 'src/screens/setting/school-identity/components/template-identity-asset';
import { selectionSchema, templateIdentitySchema } from 'src/screens/setting/school-identity/identity-form';
import { CertificateIdentityAssets } from './components/certificate-identity-assets';
import { shikshaMitraToast } from 'src/components/toast';
import { FormBusyRegion } from 'src/components/form-busy-region';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import {
  Alert,
  Stack,
  Button,
  Checkbox,
  TextField,
  Typography,
  DialogActions,
  FormControlLabel,
} from '@mui/material';
import {
  useGetRecordIdTemplateQuery,
  useSaveRecordIdTemplateMutation,
  useGetRecordCertificateTemplateQuery,
  useSaveRecordCertificateTemplateMutation,
} from 'src/redux/student/records/student-record-documents-api';

export default function RecordDocumentTemplates({
  open,
  kind,
  certificateType,
  onClose,
}: {
  open: boolean;
  kind: 'certificates' | 'ids';
  certificateType: CertificateType;
  onClose: () => void;
}) {
  const ids = useGetRecordIdTemplateQuery(undefined, { skip: !open || kind !== 'ids' });
  const certificates = useGetRecordCertificateTemplateQuery(certificateType, {
    skip: !open || kind !== 'certificates',
  });
  const query = kind === 'ids' ? ids : certificates;
  if (!open) return null;
  if (query.currentData)
    return kind === 'ids' ? (
      <IdTemplateForm initial={ids.currentData!} onClose={onClose} />
    ) : (
      <CertificateTemplateForm initial={certificates.currentData!} onClose={onClose} />
    );
  return (
    <CustomDialog
      open
      handleClose={onClose}
      title="Document template"
      hasForm={false}
      maxWidth="sm"
    >
      <DialogScrollContent>
        {query.isError ? (
          <Alert severity="error" action={<Button onClick={() => query.refetch()}>Retry</Button>}>
            Template could not be loaded.
          </Alert>
        ) : (
          <Typography role="status">Loading template…</Typography>
        )}
      </DialogScrollContent>
    </CustomDialog>
  );
}

function IdTemplateForm({ initial, onClose }: { initial: IdCardTemplate; onClose: () => void }) {
  const [uploading, setUploading] = useState(false);
  const [save, mutation] = useSaveRecordIdTemplateMutation();
  const state = { ...mutation, isLoading: mutation.isLoading || uploading };
  const [error, setError] = useState(false);
  const form = useFormik({
    initialValues: initial,
    validationSchema: Yup.object({
      schoolName: Yup.string().max(150),
      headerText: Yup.string().max(300),
      footerText: Yup.string().max(500),
      primaryColor: Yup.string()
        .matches(/^#[0-9a-fA-F]{6}$/, 'Use a color such as #00897B.')
        .required(),
      fields: Yup.array().min(1, 'Select at least one field.'),
      logo: selectionSchema().optional().default(undefined),
    }),
    onSubmit: async (values) => {
      setError(false);
      try {
        await save(values).unwrap();
        shikshaMitraToast.success({
          message: 'ID template saved. Existing issued cards retain their original template.',
        });
        onClose();
      } catch {
        setError(true);
      }
    },
  });
  return (
    <CustomDialog
      open
      handleClose={onClose}
      title="Identity card template"
      maxWidth="sm"
      onSubmit={(event) => {
        event.preventDefault();
        form.submitForm();
      }}
      hasUnsavedChanges={form.dirty}
      disableClose={state.isLoading}
    >
      <DialogScrollContent>
        <FormBusyRegion busy={state.isLoading} label="Saving template…">
          <Stack spacing={2}>
            {(['schoolName', 'headerText', 'footerText', 'primaryColor'] as const).map((name) => (
              <TextField
                key={name}
                fullWidth
                label={
                  {
                    schoolName: 'School name',
                    headerText: 'Card heading',
                    footerText: 'Card footer',
                    primaryColor: 'School color',
                  }[name]
                }
                name={name}
                value={form.values[name]}
                onChange={form.handleChange}
                onBlur={form.handleBlur}
                error={!!form.touched[name] && !!form.errors[name]}
                helperText={form.touched[name] && form.errors[name]}
              />
            ))}
            <TemplateIdentityAsset kind="logo" value={form.values.logo} disabled={state.isLoading} onBusy={setUploading}
              onChange={(logo) => { form.setFieldValue('logo', logo); }} />
            <FormControlLabel
              label="Include student photo when available"
              control={
                <Checkbox
                  name="showPhoto"
                  checked={form.values.showPhoto}
                  onChange={form.handleChange}
                />
              }
            />
            <Typography variant="subtitle2">Information shown on the card</Typography>
            <Stack direction="row" useFlexGap flexWrap="wrap">
              {['StudentName', 'GRNumber', 'Class', 'Division', 'AcademicYear', 'DateOfBirth'].map(
                (field) => (
                  <FormControlLabel
                    key={field}
                    label={
                      {
                        StudentName: 'Student name',
                        GRNumber: 'GR number',
                        Class: 'Class',
                        Division: 'Division',
                        AcademicYear: 'Academic year',
                        DateOfBirth: 'Date of birth',
                      }[field]
                    }
                    control={
                      <Checkbox
                        checked={form.values.fields.includes(field)}
                        onChange={(_event, checked) =>
                          form.setFieldValue(
                            'fields',
                            checked
                              ? [...form.values.fields, field]
                              : form.values.fields.filter((value) => value !== field)
                          )
                        }
                      />
                    }
                  />
                )
              )}
            </Stack>
            {typeof form.errors.fields === 'string' && (
              <Alert severity="error">{form.errors.fields}</Alert>
            )}
            {error && (
              <Alert severity="error">
                Template could not be saved. It may have changed; close and reload before retrying.
              </Alert>
            )}
          </Stack>
        </FormBusyRegion>
      </DialogScrollContent>
      <DialogActions>
        <Button disabled={state.isLoading} onClick={onClose}>
          Cancel
        </Button>
        <Button
          variant="contained"
          type="submit"
          loading={state.isLoading}
          disabled={state.isLoading}
        >
          Submit
        </Button>
      </DialogActions>
    </CustomDialog>
  );
}

function CertificateTemplateForm({
  initial,
  onClose,
}: {
  initial: CertificateTemplate;
  onClose: () => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [save, mutation] = useSaveRecordCertificateTemplateMutation();
  const state = { ...mutation, isLoading: mutation.isLoading || uploading };
  const [error, setError] = useState(false);
  const form = useFormik({
    initialValues: initial,
    validationSchema: Yup.object({
      headerContent: Yup.string().max(4000),
      footerContent: Yup.string().max(4000),
      schoolAddress: Yup.string().nullable().max(512),
      identityChoices: templateIdentitySchema,
    }),
    onSubmit: async (values) => {
      setError(false);
      try {
        await save(values).unwrap();
        shikshaMitraToast.success({
          message:
            'Certificate template saved. Existing certificates retain their original template.',
        });
        onClose();
      } catch {
        setError(true);
      }
    },
  });
  return (
    <CustomDialog
      open
      handleClose={onClose}
      title="Certificate template"
      maxWidth="md"
      onSubmit={(event) => {
        event.preventDefault();
        form.submitForm();
      }}
      hasUnsavedChanges={form.dirty}
      disableClose={state.isLoading}
    >
      <DialogScrollContent>
        <FormBusyRegion busy={state.isLoading} label="Saving template…">
          <Stack spacing={2}>
            <Alert severity="info">
              Use placeholders such as {'{{StudentName}}'}, {'{{GRNo}}'}, {'{{Class}}'},{' '}
              {'{{IssueDate}}'}, and {'{{CertificateNo}}'} in the text.
            </Alert>
            <TextField
              fullWidth
              multiline
              minRows={3}
              label="Header text"
              name="headerContent"
              value={form.values.headerContent}
              onChange={form.handleChange}
              onBlur={form.handleBlur}
              error={!!form.touched.headerContent && !!form.errors.headerContent}
              helperText={form.touched.headerContent && form.errors.headerContent}
            />
            <TextField
              fullWidth
              multiline
              minRows={4}
              label="Certificate text / footer"
              name="footerContent"
              value={form.values.footerContent}
              onChange={form.handleChange}
              onBlur={form.handleBlur}
              error={!!form.touched.footerContent && !!form.errors.footerContent}
              helperText={form.touched.footerContent && form.errors.footerContent}
            />
            <TextField
              fullWidth
              label="School address"
              name="schoolAddress"
              value={form.values.schoolAddress ?? ''}
              onChange={form.handleChange}
              onBlur={form.handleBlur}
              error={!!form.touched.schoolAddress && !!form.errors.schoolAddress}
              helperText={form.touched.schoolAddress && form.errors.schoolAddress}
            />
            <CertificateIdentityAssets value={form.values} disabled={state.isLoading} onBusy={setUploading}
              onChange={(choices) => { form.setFieldValue('identityChoices', choices); }} />
            {error && (
              <Alert severity="error">
                Template could not be saved. Check the fields and your access before retrying.
              </Alert>
            )}
          </Stack>
        </FormBusyRegion>
      </DialogScrollContent>
      <DialogActions>
        <Button disabled={state.isLoading} onClick={onClose}>
          Cancel
        </Button>
        <Button
          variant="contained"
          type="submit"
          loading={state.isLoading}
          disabled={state.isLoading}
        >
          Submit
        </Button>
      </DialogActions>
    </CustomDialog>
  );
}

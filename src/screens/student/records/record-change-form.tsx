import type { RootState } from 'src/redux/store';
import type {
  RecordSection,
  RecordSnapshot,
} from 'src/redux/student/records/student-record-changes-api';

import dayjs from 'dayjs';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { useSelector } from 'react-redux';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { GenderType } from 'src/enums/gender';
import { useBoolean } from 'src/hooks/use-boolean';
import { UploadAvatar } from 'src/components/upload';
import CustomSelect from 'src/components/custom-select';
import { shikshaMitraToast } from 'src/components/toast';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { StudentFeedback } from 'src/components/student-feedback';
import { FormSectionCard } from 'src/components/form-section-card';
import { useUnsavedNavigation } from 'src/hooks/use-unsaved-navigation';
import { familyFields } from 'src/components/studentProfile/form-fields/register-fields';
import { Box, Grid, Stack, Button, Skeleton, TextField, Typography } from '@mui/material';
import { profileSectionPayload } from 'src/components/studentProfile/profile-section-payload';
import { medicalFields } from 'src/components/studentProfile/form-fields/render-medical-details';
import AddressSection from 'src/components/studentProfile/form-fields/components/AddressSection';
import { bankDetailsFields } from 'src/components/studentProfile/form-fields/render-bank-details';
import { communicationFields } from 'src/components/studentProfile/form-fields/render-communication';
import { CustomRecordChangeForm } from 'src/screens/student/studentProfile/custom-record-change-form';
import { useGetStudentRecordDetailsQuery } from 'src/redux/student/records/student-record-details-api';
import { previousSchoolFields } from 'src/components/studentProfile/form-fields/render-previous-details';
import { additionalDetailsFields } from 'src/components/studentProfile/form-fields/render-additional-details';
import ContactDetailsSection from 'src/components/studentProfile/form-fields/components/ContactDetailsSection';
import {
  useCreateStudentRecordChangeMutation,
  useUploadStudentRecordPhotoDraftMutation,
} from 'src/redux/student/records/student-record-changes-api';
import {
  bankDetailsInitialValues,
  familyFieldsInitialValues,
  generalFieldsInitialValues,
  medicalFieldsInitialValues,
  additionalDetailsInitialValues,
  CommunicationFieldsInitialValues,
  previousSchoolFieldsInitialValues,
} from 'src/components/studentProfile/form-fields/initialvalues';

import RecordPhotoPreview from './record-photo-preview';

const sectionTabs: Record<RecordSection, number> = {
  general: 0,
  family: 1,
  communication: 2,
  additional: 3,
  medical: 4,
  'previous-school': 5,
  bank: 6,
  placement: 7,
  status: 8,
  photo: 9,
  'custom-details': 10,
  'registration-form': 10,
};
const sectionFields = [
  [],
  familyFields,
  communicationFields,
  additionalDetailsFields,
  medicalFields,
  previousSchoolFields,
  bankDetailsFields,
];
const initializers = [
  generalFieldsInitialValues,
  familyFieldsInitialValues,
  CommunicationFieldsInitialValues,
  additionalDetailsInitialValues,
  medicalFieldsInitialValues,
  previousSchoolFieldsInitialValues,
  bankDetailsInitialValues,
];

type RecordChangeFormProps = {
  studentId: string;
  snapshot: RecordSnapshot;
  correctsChangeId?: string;
  onSubmitted: (id: string) => void;
  onReload?: () => void;
  onDirtyChange?: (dirty: boolean) => void;
};

export default function RecordChangeForm(props: RecordChangeFormProps) {
  const { snapshot } = props;
  if (snapshot.section === 'registration-form')
    return (
      <StudentFeedback notificationKey="STU-0798" presentation="inline" severity="info">
        Edit the Registration form in Student Profile.
      </StudentFeedback>
    );
  return snapshot.section === 'custom-details' ? (
    <CustomRecordChangePage {...props} />
  ) : (
    <StructuredRecordChangeForm {...props} />
  );
}

function CustomRecordChangePage(props: RecordChangeFormProps) {
  const { studentId } = props;
  const [ready, setReady] = useState(false);
  const year = useSelector((state: RootState) => state.globalState.currentYear);
  const details = useGetStudentRecordDetailsQuery({
    studentId,
    academicYearId: year?.id,
  });
  if (details.isError && !ready)
    return (
      <StudentFeedback
        notificationKey="STU-0799"
        presentation="toast"
        severity="error"
        action={<Button onClick={() => details.refetch()}>Retry</Button>}
      >
        School details could not be loaded for this request.
      </StudentFeedback>
    );
  if (!details.currentData || (details.isFetching && !ready))
    return <Skeleton height={180} aria-label="Loading school details" />;
  return (
    <CustomRecordChangeForm
      {...props}
      details={details.currentData}
      onReady={() => setReady(true)}
    />
  );
}

function StructuredRecordChangeForm({
  studentId,
  snapshot: loadedSnapshot,
  correctsChangeId,
  onSubmitted,
  onReload,
  onDirtyChange,
}: {
  studentId: string;
  snapshot: RecordSnapshot;
  correctsChangeId?: string;
  onSubmitted: (id: string) => void;
  onReload?: () => void;
  onDirtyChange?: (dirty: boolean) => void;
}) {
  const router = useRouter();
  const [snapshot] = useState(loadedSnapshot);
  const [failure, setFailure] = useState<string | null>(null);
  const [clientKey] = useState(() => crypto.randomUUID());
  const [submit, submitState] = useCreateStudentRecordChangeMutation();
  const [uploadPhoto, photoState] = useUploadStudentRecordPhotoDraftMutation();
  const tab = sectionTabs[snapshot.section];
  const source = snapshot.data;
  const currentYear = useSelector((state: RootState) => state.globalState.currentYear);
  const classes = (currentYear?.boards ?? [])
    .flatMap((board: any) => board.educationMediums ?? [])
    .flatMap((medium: any) => medium.educationMediumStages ?? [])
    .flatMap((stage: any) => stage.standards ?? []);
  const editable = useBoolean(true);
  const values =
    tab < 7
      ? (initializers[tab] as (value: any) => Record<string, any>)({
          ...source,
          formNo: source.formNumber,
          adharNo: source.aadharNo,
        })
      : { ...source };
  if (snapshot.section === 'family' && Array.isArray(source.siblingStudentIds))
    values.siblingStudents = source.siblingStudentIds.map((id: string) => ({
      id,
      fullName: 'Existing linked sibling',
    }));
  const form = useFormik<Record<string, any>>({
    initialValues: { ...values, changeReason: '', effectiveAt: '', correctsChangeId },
    validationSchema: Yup.object({
      changeReason: Yup.string()
        .trim()
        .min(3, 'Explain the requested change.')
        .max(2000)
        .required('Enter a reason.'),
      ...(snapshot.section === 'general'
        ? {
            firstName: Yup.string().trim().required('Enter the first name.'),
            lastName: Yup.string().trim().max(128).nullable(),
            dob: Yup.mixed().required('Enter the date of birth.'),
            email: Yup.string().email('Enter a valid email.').nullable(),
          }
        : {}),
      ...(snapshot.section === 'placement'
        ? {
            standardId: Yup.string().required('Choose a class.'),
            divisionId: Yup.string().required('Choose a division.'),
            rollNumber: Yup.number().nullable().min(1).integer(),
          }
        : {}),
    }),
    onSubmit: async (formValues) => {
      setFailure(null);
      let payload: Record<string, unknown>;
      if (tab < 7) payload = profileSectionPayload(tab, formValues, source);
      else payload = Object.fromEntries(Object.keys(source).map((key) => [key, formValues[key]]));
      // The API accepts only the owning Update DTO; view-only/form helper keys never leave the UI.
      payload = Object.fromEntries(
        Object.keys(source).map((key) => [key, key in payload ? payload[key] : source[key]])
      );
      if (snapshot.section === 'general') {
        const editableFields = new Set([
          'firstName',
          'middleName',
          'lastName',
          'dateOfBirth',
          'gender',
          'primaryContactNo',
          'secondaryContactNo',
          'email',
          'address1',
          'address2',
          'address3',
          'city',
          'state',
          'country',
          'pincode',
        ]);
        payload = Object.fromEntries(
          Object.keys(source).map((key) => [
            key,
            editableFields.has(key) ? payload[key] : source[key],
          ])
        );
      }
      if (snapshot.section === 'photo') payload = { photoDraftId: formValues.photoDraftId };
      try {
        const result = await submit({
          studentId,
          section: snapshot.section,
          clientKey,
          reason: formValues.changeReason.trim(),
          expectedSnapshot: snapshot.snapshot,
          payload,
          correctsChangeId,
          effectiveAt: formValues.effectiveAt
            ? dayjs(formValues.effectiveAt).toISOString()
            : undefined,
        }).unwrap();
        form.resetForm({ values: formValues });
        shikshaMitraToast.success({
          message:
            result.status === 'Applied'
              ? 'Student record updated and added to history.'
              : 'Change submitted for review.',
        });
        onSubmitted(result.id);
      } catch (error) {
        const code = (error as { data?: { error?: { code?: string } } })?.data?.error?.code;
        setFailure(
          code?.includes('StaleSnapshot')
            ? 'This student record changed while you were editing. Reload the current record and review your changes before submitting.'
            : 'The change could not be submitted. Review the details and school rules, then retry. Your changes have been kept.'
        );
      }
    },
  });
  useEffect(() => {
    onDirtyChange?.(form.dirty);
    return () => onDirtyChange?.(false);
  }, [form.dirty, onDirtyChange]);
  const guard = useUnsavedNavigation(form.dirty, { push: onDirtyChange ? undefined : router.push });
  const divisions =
    classes.find((standard: any) => standard.id === form.values.standardId)?.divisions ?? [];
  return (
    <Box component="form" onSubmit={form.handleSubmit} noValidate>
      <Stack spacing={2}>
        {loadedSnapshot.snapshot !== snapshot.snapshot && (
          <StudentFeedback
            notificationKey="STU-0801"
            presentation="persistent"
            severity="warning"
            action={
              onReload ? (
                <Button
                  color="inherit"
                  onClick={() => (onDirtyChange ? onReload() : guard.requestNavigation(onReload))}
                >
                  Reload current details
                </Button>
              ) : undefined
            }
          >
            The student record has changed. Your draft is preserved; review the current details
            before submitting.
          </StudentFeedback>
        )}
        {failure && (
          <StudentFeedback notificationKey="STU-0802" presentation="persistent" severity="error">
            {failure}
          </StudentFeedback>
        )}
        <FormSectionCard
          icon="mdi:account-edit-outline"
          title={correctsChangeId ? 'Correction request' : 'Change details'}
          descriptionTooltip="School rules decide whether this change applies directly or requires approval."
        >
          <TextField
            label="Reason for change"
            name="changeReason"
            value={form.values.changeReason}
            onChange={form.handleChange}
            onBlur={form.handleBlur}
            error={Boolean(form.touched.changeReason && form.errors.changeReason)}
            helperText={
              form.touched.changeReason
                ? String(form.errors.changeReason ?? '')
                : 'This reason stays in the student history.'
            }
            multiline
            minRows={2}
            disabled={submitState.isLoading}
          />
          <TextField
            type="datetime-local"
            label="Effective date and time (optional)"
            name="effectiveAt"
            value={form.values.effectiveAt}
            onChange={form.handleChange}
            slotProps={{ inputLabel: { shrink: true } }}
            helperText="Leave blank to apply when approved. School date rules are checked by the server."
            disabled={submitState.isLoading}
          />
        </FormSectionCard>
        <Box
          component="fieldset"
          disabled={submitState.isLoading}
          sx={{ border: 0, p: 0, m: 0, minWidth: 0 }}
        >
          {snapshot.section === 'photo' ? (
            <FormSectionCard
              icon="mdi:camera-outline"
              title="Student photo"
              description="Upload a JPG or PNG up to 3 MB. It becomes the student photo after this change applies."
            >
              <UploadAvatar
                value={form.values.photoDraftId ? undefined : form.values.photoUrl}
                maxSize={3 * 1024 * 1024}
                accept={{ 'image/jpeg': ['.jpg', '.jpeg'], 'image/png': ['.png'] }}
                disabled={photoState.isLoading || submitState.isLoading}
                onDrop={async (files) => {
                  const file = files[0];
                  if (!file) return;
                  if (file.size > 3 * 1024 * 1024) {
                    setFailure('Choose a photo up to 3 MB.');
                    return;
                  }
                  const body = new FormData();
                  body.append('file', file);
                  try {
                    const staged = await uploadPhoto({ studentId, body }).unwrap();
                    form.setFieldValue('photoDraftId', staged.id);
                    form.setFieldValue('photoUrl', staged.photoUrl);
                    setFailure(null);
                  } catch {
                    setFailure(
                      'The photo could not be uploaded. Choose a valid JPG or PNG and retry.'
                    );
                  }
                }}
              />
              {photoState.isLoading && <Typography variant="caption">Uploading photo…</Typography>}
              {form.values.photoDraftId && form.values.photoUrl && (
                <RecordPhotoPreview studentId={studentId} uri={form.values.photoUrl} />
              )}
            </FormSectionCard>
          ) : snapshot.section === 'general' ? (
            <Stack spacing={2}>
              <FormSectionCard icon="mdi:account-outline" title="Student identity">
                <Grid container spacing={2}>
                  {(['firstName', 'middleName', 'lastName'] as const).map((name, index) => (
                    <Grid key={name} size={{ xs: 12, md: 4 }}>
                      <TextField
                        fullWidth
                        label={['First name', 'Middle name', 'Last name'][index]}
                        name={name}
                        value={form.values[name]}
                        onChange={form.handleChange}
                        onBlur={form.handleBlur}
                        error={Boolean(form.touched[name] && form.errors[name])}
                        helperText={form.touched[name] ? String(form.errors[name] ?? '') : ''}
                      />
                    </Grid>
                  ))}
                  <Grid size={{ xs: 12, md: 6 }}>
                    <DatePicker
                      label="Date of birth"
                      value={form.values.dob}
                      onChange={(value) => form.setFieldValue('dob', value)}
                      maxDate={dayjs()}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          error: Boolean(form.touched.dob && form.errors.dob),
                          helperText: form.touched.dob ? String(form.errors.dob ?? '') : '',
                        },
                      }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <CustomSelect
                      label="Gender"
                      value={form.values.gender ?? ''}
                      options={[
                        { value: GenderType.Male, label: 'Male' },
                        { value: GenderType.Female, label: 'Female' },
                      ]}
                      onChange={(value) => form.setFieldValue('gender', value)}
                    />
                  </Grid>
                </Grid>
              </FormSectionCard>
              <ContactDetailsSection
                formik={form as any}
                isMainForm
                isEdit={editable}
                onSave={async () => undefined}
                onCancel={() => form.resetForm()}
              />
              <AddressSection
                formik={form as any}
                isMainForm
                isEdit={editable}
                onSave={async () => undefined}
                onCancel={() => form.resetForm()}
              />
            </Stack>
          ) : tab < 7 ? (
            <Grid container spacing={2}>
              {sectionFields[tab].map((field) => (
                <Grid key={field.name} size={12}>
                  {field.renderComp?.({
                    formik: form,
                    field,
                    isEdit: true,
                    isMainForm: true,
                    editData: { studentId },
                  })}
                </Grid>
              ))}
            </Grid>
          ) : snapshot.section === 'placement' ? (
            <FormSectionCard icon="mdi:account-switch-outline" title="Year-specific placement">
              <Typography variant="body2">
                Placement changes update the current Enrollment and profile together. Year-end
                enrollment is handled in Year-End & Transitions.
              </Typography>
              <CustomSelect
                label="Class"
                value={form.values.standardId ?? ''}
                options={classes.map((standard: any) => ({
                  value: standard.id,
                  label: standard.name,
                }))}
                onChange={(value) => {
                  form.setFieldValue('standardId', value);
                  form.setFieldValue('divisionId', '');
                }}
              />
              <CustomSelect
                label="Division"
                value={form.values.divisionId ?? ''}
                options={divisions.map((division: any) => ({
                  value: division.id,
                  label: division.name,
                }))}
                onChange={(value) => form.setFieldValue('divisionId', value)}
              />
              <TextField
                label="Roll number"
                type="number"
                name="rollNumber"
                value={form.values.rollNumber ?? ''}
                onChange={(event) =>
                  form.setFieldValue(
                    'rollNumber',
                    event.target.value ? Number(event.target.value) : null
                  )
                }
                inputProps={{ min: 1 }}
              />
            </FormSectionCard>
          ) : (
            <FormSectionCard icon="mdi:account-check-outline" title="Operational status">
              <CustomSelect
                label="Student status"
                value={
                  typeof form.values.status === 'number'
                    ? form.values.status
                    : form.values.status === 'Enrolled'
                      ? 6
                      : 7
                }
                options={[
                  { value: 6, label: 'Active' },
                  { value: 7, label: 'Inactive' },
                ]}
                onChange={(value) => form.setFieldValue('status', value)}
              />
              <Typography variant="body2" color="text.secondary">
                Graduation, withdrawal, and transfer use Year-End & Transitions.
              </Typography>
            </FormSectionCard>
          )}
        </Box>
        <Button
          type="submit"
          variant="contained"
          loading={submitState.isLoading}
          disabled={
            !form.dirty ||
            photoState.isLoading ||
            (snapshot.section === 'photo' && !form.values.photoDraftId)
          }
          sx={{ alignSelf: 'flex-start' }}
        >
          Submit change
        </Button>
        {guard.confirmation}
      </Stack>
    </Box>
  );
}

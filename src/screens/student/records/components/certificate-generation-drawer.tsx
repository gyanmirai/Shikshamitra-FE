import type { RootState } from 'src/redux/store';
import type { StudentDirectoryItem } from 'src/redux/student/records/student-records-types';

import dayjs from 'dayjs';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { useId, useState } from 'react';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import CustomSelect from 'src/components/custom-select';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { hasGrantedPermission } from 'src/utils/permissions';
import ShakingTextField from 'src/components/shaking-text-field';
import { StudentFeedback } from 'src/components/student-feedback';
import { useUnsavedNavigation } from 'src/hooks/use-unsaved-navigation';
import { FormSectionCard, FormSectionHeader } from 'src/components/form-section-card';
import {
  Box,
  Grid,
  Stack,
  Button,
  Skeleton,
  TextField,
  Typography,
  LinearProgress,
} from '@mui/material';

import CertificateExitCaseSelect from './certificate-exit-case-select';
import { useCertificateGeneration } from './use-certificate-generation';
import CertificateDocumentPreview from './certificate-document-preview';
import { certificateRequest, certificateChoices } from './certificate-flow';
import StudentAssignmentDrawer from '../../onboarding/student-setup/student-assignment-drawer';

import type { CertificateFormValues } from './certificate-flow';

export type CertificateGenerationDrawerProps = {
  students: StudentDirectoryItem[];
  academicYearId: string;
  onClose: () => void;
  onViewHistory?: (studentId: string) => void;
};

export default function CertificateGenerationDrawer({
  students,
  academicYearId,
  onClose,
  onViewHistory,
}: CertificateGenerationDrawerProps) {
  const router = useRouter();
  const formId = useId();
  const [choice, setChoice] = useState<(typeof certificateChoices)[number] | null>(null);
  const [focusedId, setFocusedId] = useState(students[0]?.studentId ?? '');
  const [fullPreview, setFullPreview] = useState(false);
  const year = useSelector((state: RootState) => state.globalState.currentYear?.id);
  const yearName = useSelector((state: RootState) =>
    state.globalState.currentYear?.id === academicYearId
      ? state.globalState.currentYear.name
      : undefined
  );
  const permissions = useSelector((state: RootState) => state.auth.permissions);
  const canIssue =
    hasGrantedPermission(permissions, 'Students.Records.Certificates.View') &&
    hasGrantedPermission(permissions, 'Students.Records.Certificates.Add');
  const validStudents =
    students.length > 0 &&
    students.length <= 100 &&
    new Set(students.map((item) => item.studentId)).size === students.length &&
    students.every(
      (item) =>
        item.studentId &&
        !item.maskedFields.includes('Identity') &&
        (!item.academicYearId || item.academicYearId === academicYearId)
    );
  const yearChanged = !academicYearId || year !== academicYearId;
  const allowed = canIssue && validStudents && !yearChanged;
  const form = useFormik<CertificateFormValues>({
    initialValues: { issueDate: dayjs().format(), reason: '', particulars: '', exitCases: {} },
    validationSchema: Yup.object({
      issueDate: Yup.string()
        .required('Choose an issue date.')
        .test('valid-date', 'Choose a valid issue date.', (value) => dayjs(value).isValid()),
      reason: Yup.string().max(4000, 'Use no more than 4000 characters.'),
      particulars: Yup.string().max(4000, 'Use no more than 4000 characters.'),
      exitCases: Yup.object().test(
        'exit-cases',
        'Choose an exit case for every selected student.',
        (value) =>
          choice?.type !== 3 ||
          students.every((item) => !!(value as Record<string, string>)?.[item.studentId])
      ),
    }),
    onSubmit: async () => {
      if (allowed && flow.preview && !flow.previewLoading && !flow.previewFailed)
        await flow.generate();
    },
  });
  const requests = choice
    ? students.map((item) =>
        certificateRequest(item.studentId, choice.type, form.values, academicYearId)
      )
    : [];
  const flow = useCertificateGeneration(
    requests,
    focusedId,
    allowed && dayjs(form.values.issueDate).isValid()
  );
  const guard = useUnsavedNavigation(!flow.complete && (form.dirty || flow.attempted), {
    push: router.push,
    blockNavigation: flow.busy,
    guardContextChanges: true,
    description: flow.attempted
      ? 'A generation attempt may have saved certificates. Retry this request or review student history before starting another. Closing does not remove issued certificates.'
      : undefined,
  });
  const close = () => guard.requestNavigation(onClose);
  const locked = flow.busy || flow.attempted || !allowed;
  const title = flow.complete
    ? 'Certificates Ready'
    : choice
      ? `Generate ${choice.label} Certificate`
      : 'Generate Certificate';
  const nameOf = (item: StudentDirectoryItem) =>
    [item.firstName, item.middleName, item.lastName].filter(Boolean).join(' ') || 'Student';
  const focusedStudent = students.find((item) => item.studentId === focusedId) ?? students[0];
  return (
    <>
      <StudentAssignmentDrawer
        expanded
        title={title}
        titleInfo="Choose a certificate type, review its details, then generate and download for the selected students. Student and academic selections are retained."
        busy={flow.busy}
        onClose={close}
        context={
          focusedStudent && (
            <Stack
              component="section"
              aria-label="Selected certificate student"
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              spacing={2}
              useFlexGap
              flexWrap="wrap"
              sx={{
                px: { xs: 2, sm: 3 },
                py: 2,
                flexShrink: 0,
                borderBottom: 1,
                borderColor: 'divider',
              }}
            >
              <Stack direction="row" spacing={1.5} alignItems="center" sx={{ minWidth: 0 }}>
                <Iconify
                  icon={GlobalIcons.studentProfile}
                  width={24}
                  sx={{ color: 'text.secondary', flexShrink: 0 }}
                />
                <Box sx={{ minWidth: 0 }}>
                  <Typography variant="subtitle2" sx={{ overflowWrap: 'anywhere' }}>
                    {nameOf(focusedStudent)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {focusedStudent.grNumber || focusedStudent.grNo || '—'} ·{' '}
                    {[focusedStudent.standardName, focusedStudent.divisionName]
                      .filter(Boolean)
                      .join(' / ') || '—'}
                  </Typography>
                </Box>
              </Stack>
              <Stack spacing={0.25} alignItems="flex-end" sx={{ flexShrink: 0 }}>
                {yearName && (
                  <Typography variant="caption" color="text.secondary">
                    Academic year · {yearName}
                  </Typography>
                )}
                {students.length > 1 && (
                  <Typography variant="caption" color="text.secondary">
                    {students.length} students selected
                  </Typography>
                )}
              </Stack>
            </Stack>
          )
        }
        actions={
          <Stack
            direction="row"
            spacing={1}
            justifyContent="flex-end"
            flexWrap="wrap"
            sx={{ px: { xs: 2, sm: 3 }, py: 1.75 }}
          >
            <Button
              size="small"
              variant="outlined"
              color="inherit"
              disabled={flow.busy}
              startIcon={<Iconify icon={GlobalIcons.cancel} />}
              onClick={close}
            >
              {flow.complete ? 'Close' : 'Cancel'}
            </Button>
            {!flow.complete && choice && !flow.attempted && (
              <Button
                size="small"
                color="inherit"
                disabled={flow.busy}
                startIcon={<Iconify icon={GlobalIcons.back} />}
                onClick={() => {
                  setChoice(null);
                  setFullPreview(false);
                }}
              >
                Back
              </Button>
            )}
            {flow.complete
              ? onViewHistory && (
                  <Button
                    size="small"
                    variant="contained"
                    color="inherit"
                    disabled={flow.busy || !allowed}
                    startIcon={<Iconify icon={GlobalIcons.history} />}
                    onClick={() => onViewHistory(students[0].studentId)}
                  >
                    View student history
                  </Button>
                )
              : choice && (
                  <Button
                    size="small"
                    variant="contained"
                    color="inherit"
                    type="submit"
                    form={formId}
                    loading={flow.busy}
                    disabled={
                      flow.busy ||
                      !allowed ||
                      flow.previewLoading ||
                      !flow.preview ||
                      flow.previewFailed
                    }
                    startIcon={<Iconify icon={GlobalIcons.download} />}
                  >
                    {flow.attempted ? 'Retry remaining certificates' : 'Generate & download'}
                  </Button>
                )}
          </Stack>
        }
      >
        <Stack spacing={2}>
          {yearChanged && (
            <Typography role="alert" variant="body2" color="warning.main">
              The academic year changed. Close this drawer and select students again.
            </Typography>
          )}
          {!canIssue && (
            <Typography role="alert" variant="body2">
              You do not have permission to issue certificates.
            </Typography>
          )}
          {!validStudents && (
            <Typography role="alert" variant="body2">
              Select between 1 and 100 students with available identity details in the selected
              academic year.
            </Typography>
          )}
          {flow.busy && (
            <Box role="status">
              <LinearProgress />
              <Typography variant="body2" sx={{ mt: 1 }}>
                {flow.progress || 'Downloading certificate…'}
              </Typography>
            </Box>
          )}
          {flow.failure && (
            <Typography role="alert" variant="body2" color="warning.main">
              {flow.failure}
            </Typography>
          )}
          {flow.complete ? (
            <FormSectionCard
              title="Generated Certificates"
              icon={GlobalIcons.approvedIcon}
              descriptionTooltip="These certificates have been saved. A failed download can be retried here without issuing a new certificate."
            >
              <Stack spacing={2}>
                {flow.results.map((certificate) => (
                  <Stack
                    key={certificate.certificateId}
                    direction={{ xs: 'column', sm: 'row' }}
                    spacing={1}
                    justifyContent="space-between"
                  >
                    <Box>
                      <Typography variant="subtitle2">{certificate.student.studentName}</Typography>
                      <Typography variant="body2">{certificate.certificateNo}</Typography>
                    </Box>
                    <Button
                      size="small"
                      color="inherit"
                      variant="outlined"
                      aria-label={`Download ${certificate.certificateNo}`}
                      disabled={flow.busy || !allowed}
                      startIcon={<Iconify icon={GlobalIcons.download} />}
                      onClick={() => flow.downloadExisting(certificate)}
                    >
                      Download PDF
                    </Button>
                  </Stack>
                ))}
              </Stack>
            </FormSectionCard>
          ) : (
            <>
              {!choice ? (
                <FormSectionCard
                  title="Certificate Type"
                  icon={GlobalIcons.documentIcon}
                  descriptionTooltip="Choose a type to review only the fields needed for that certificate."
                >
                  <Grid container spacing={2}>
                    {certificateChoices.map((item) => (
                      <Grid key={item.type} size={{ xs: 12, sm: 6 }}>
                        <Button
                          size="small"
                          color="inherit"
                          variant="outlined"
                          fullWidth
                          disabled={!allowed || flow.busy}
                          startIcon={<Iconify icon={item.icon} />}
                          onClick={() => {
                            form.setFieldValue('particulars', '');
                            form.setFieldValue('exitCases', {});
                            setChoice(item);
                          }}
                        >
                          {item.label}
                        </Button>
                        <Typography variant="caption" color="text.secondary">
                          {item.description}
                        </Typography>
                      </Grid>
                    ))}
                  </Grid>
                </FormSectionCard>
              ) : (
                <Box
                  component="form"
                  id={formId}
                  onSubmit={(event) => {
                    setFullPreview(false);
                    form.handleSubmit(event);
                  }}
                  noValidate
                >
                  <Stack spacing={2}>
                    {students.length > 1 && (
                      <CustomSelect
                        size="small"
                        label="Student preview"
                        value={focusedId}
                        options={students.map((item) => ({
                          id: item.studentId,
                          name: nameOf(item),
                        }))}
                        valueKey="id"
                        labelKey="name"
                        disabled={flow.busy}
                        onChange={(id) => setFocusedId(String(id))}
                        formControlProps={{ fullWidth: true }}
                      />
                    )}
                    <Box
                      sx={{
                        display: 'grid',
                        gridTemplateColumns: {
                          xs: 'minmax(0, 1fr)',
                          lg: fullPreview ? 'minmax(0, 1fr)' : '280px minmax(0, 1fr)',
                        },
                        gap: 2,
                        alignItems: 'start',
                      }}
                    >
                      <Box sx={{ display: fullPreview ? 'none' : undefined, minWidth: 0 }}>
                        <FormSectionCard
                          title="Certificate Details"
                          icon={GlobalIcons.admissionDetails}
                          descriptionTooltip="Student particulars are read from school records. The entered purpose and other text apply to every selected student."
                        >
                          <Stack spacing={2}>
                            <ShakingTextField
                              error={!!form.touched.issueDate && !!form.errors.issueDate}
                            >
                              <DatePicker
                                label="Issue date"
                                value={
                                  dayjs(form.values.issueDate).isValid()
                                    ? dayjs(form.values.issueDate)
                                    : null
                                }
                                disabled={locked}
                                onChange={(value) =>
                                  form.setFieldValue(
                                    'issueDate',
                                    value?.isValid() ? value.format() : ''
                                  )
                                }
                                slotProps={{
                                  textField: {
                                    size: 'small',
                                    fullWidth: true,
                                    required: true,
                                    name: 'issueDate',
                                    onBlur: form.handleBlur,
                                    error: !!form.touched.issueDate && !!form.errors.issueDate,
                                    helperText: form.touched.issueDate && form.errors.issueDate,
                                  },
                                }}
                              />
                            </ShakingTextField>
                            <TextField
                              size="small"
                              fullWidth
                              name="reason"
                              label="Purpose / reason"
                              multiline
                              minRows={2}
                              disabled={locked}
                              value={form.values.reason}
                              onChange={form.handleChange}
                              onBlur={form.handleBlur}
                              error={!!form.touched.reason && !!form.errors.reason}
                              helperText={form.touched.reason && form.errors.reason}
                            />
                            {(choice.type === 2 || choice.type === 4) && (
                              <TextField
                                size="small"
                                fullWidth
                                name="particulars"
                                label={
                                  choice.type === 2
                                    ? 'Conduct assessment (optional)'
                                    : 'First trial particulars (optional)'
                                }
                                multiline
                                minRows={2}
                                disabled={locked}
                                value={form.values.particulars}
                                onChange={form.handleChange}
                                onBlur={form.handleBlur}
                                error={!!form.touched.particulars && !!form.errors.particulars}
                                helperText={
                                  (form.touched.particulars && form.errors.particulars) ||
                                  'Enter verified information only.'
                                }
                              />
                            )}
                            {students.length > 1 && (
                              <Typography variant="caption">
                                Entered text applies to all {students.length} selected students.
                              </Typography>
                            )}
                            {choice.type === 3 && (
                              <CertificateExitCaseSelect
                                studentId={focusedId}
                                value={form.values.exitCases[focusedId] ?? ''}
                                canView={hasGrantedPermission(
                                  permissions,
                                  'Students.Records.Transitions.View'
                                )}
                                disabled={locked}
                                onChange={(id) =>
                                  form.setFieldValue('exitCases', {
                                    ...form.values.exitCases,
                                    [focusedId]: id,
                                  })
                                }
                                error={
                                  form.submitCount > 0 && form.errors.exitCases
                                    ? String(form.errors.exitCases)
                                    : undefined
                                }
                              />
                            )}
                          </Stack>
                        </FormSectionCard>
                      </Box>
                      <Stack component="section" spacing={2} sx={{ minWidth: 0 }}>
                        <FormSectionHeader
                          title="Certificate Preview"
                          icon={GlobalIcons.eye}
                          descriptionTooltip="Review this student's certificate before generation. Its final number is assigned when it is issued."
                          action={
                            <Button
                              type="button"
                              size="small"
                              color="inherit"
                              aria-expanded={fullPreview}
                              startIcon={
                                <Iconify
                                  icon={fullPreview ? GlobalIcons.back : GlobalIcons.fullPreview}
                                />
                              }
                              onClick={() => setFullPreview(!fullPreview)}
                            >
                              {fullPreview ? 'Show details' : 'Full preview'}
                            </Button>
                          }
                        />
                        <Typography variant="caption" color="text.secondary">
                          A4 · Portrait
                        </Typography>
                        <Box
                          sx={{
                            p: { xs: 0, sm: 2 },
                            bgcolor: { xs: 'transparent', sm: 'background.neutral' },
                            borderRadius: 1,
                            minWidth: 0,
                          }}
                        >
                          {flow.previewLoading ? (
                            <Skeleton
                              variant="rounded"
                              height={320}
                              aria-label="Preparing certificate preview"
                            />
                          ) : flow.previewFailure ? (
                            <StudentFeedback
                              notificationKey="student-certificate-preview-failed"
                              presentation="toast"
                              severity="error"
                              toastAction={
                                <Button
                                  size="small"
                                  color="inherit"
                                  onClick={flow.retryPreview}
                                  disabled={!allowed}
                                >
                                  Retry preview
                                </Button>
                              }
                            >
                              {flow.previewFailure}
                            </StudentFeedback>
                          ) : flow.preview ? (
                            <CertificateDocumentPreview certificate={flow.preview} />
                          ) : (
                            <Typography variant="body2">
                              {choice.type === 3 && !form.values.exitCases[focusedId]
                                ? 'Select an eligible exit case to preview this certificate.'
                                : 'Preview is unavailable. Review the certificate details and student eligibility.'}
                            </Typography>
                          )}
                        </Box>
                      </Stack>
                    </Box>
                  </Stack>
                </Box>
              )}
            </>
          )}
        </Stack>
      </StudentAssignmentDrawer>
      {guard.confirmation}
    </>
  );
}

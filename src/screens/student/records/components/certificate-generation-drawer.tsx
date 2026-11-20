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
import { Scrollbar } from 'src/components/scrollbar';
import CustomSelect from 'src/components/custom-select';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { hasGrantedPermission } from 'src/utils/permissions';
import ShakingTextField from 'src/components/shaking-text-field';
import { StudentFeedback } from 'src/components/student-feedback';
import { FormSectionCard } from 'src/components/form-section-card';
import { useUnsavedNavigation } from 'src/hooks/use-unsaved-navigation';
import {
  Box,
  Stack,
  Radio,
  Button,
  Switch,
  Skeleton,
  TextField,
  RadioGroup,
  Typography,
  LinearProgress,
  FormControlLabel,
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
  const brandingHelpId = useId();
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
    initialValues: {
      issueDate: dayjs().format(),
      reason: '',
      particulars: '',
      exitCases: {},
      showSchoolBranding: true,
    },
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
  const issueDay = dayjs(form.values.issueDate);
  const validIssueDate = issueDay.isValid();
  const flow = useCertificateGeneration(requests, focusedId, allowed && validIssueDate);
  const guard = useUnsavedNavigation(!flow.complete && (form.dirty || flow.attempted), {
    push: router.push,
    blockNavigation: flow.busy,
    guardContextChanges: true,
    description: flow.attempted
      ? 'A generation attempt may have saved certificates. Retry this request or review student history before starting another. Closing does not remove issued certificates.'
      : undefined,
  });
  const close = () => guard.requestNavigation(onClose);
  const locked = form.isSubmitting || flow.busy || flow.attempted || !allowed;
  const title = flow.complete
    ? 'Certificates Ready'
    : choice
      ? `Generate ${choice.label} Certificate`
      : 'Generate Certificate';
  const nameOf = (item: StudentDirectoryItem) =>
    [item.firstName, item.middleName, item.lastName].filter(Boolean).join(' ') || 'Student';
  const focusedStudent = students.find((item) => item.studentId === focusedId) ?? students[0];
  const missingBranding =
    flow.preview && !flow.preview.branding?.bannerDataUrl && !flow.preview.branding?.logoDataUrl;
  const brandingHelp = !form.values.showSchoolBranding
    ? 'School logo and banner are hidden in the preview and PDF.'
    : missingBranding
      ? 'No school logo or banner is configured for this certificate.'
      : 'Uses Institute Setup branding for this certificate’s preview and PDF.';
  return (
    <>
      <StudentAssignmentDrawer
        expanded
        contentLayout={flow.complete ? 'scroll' : 'split'}
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
                disabled={flow.busy || form.isSubmitting}
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
                      form.isSubmitting ||
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
        <Stack spacing={2} sx={{ height: { lg: flow.complete ? 'auto' : 1 }, minHeight: 0 }}>
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
            <Box
              component="form"
              id={formId}
              onSubmit={(event) => {
                setFullPreview(false);
                if (choice?.type === 3) {
                  const firstMissingCase = students.find(
                    (student) => !form.values.exitCases[student.studentId]
                  );
                  if (firstMissingCase) setFocusedId(firstMissingCase.studentId);
                }
                form.handleSubmit(event);
              }}
              noValidate
              sx={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}
            >
              <Stack spacing={2} sx={{ flex: 1, minHeight: 0 }}>
                {choice && students.length > 1 && (
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
                    disabled={flow.busy || form.isSubmitting}
                    onChange={(id) => setFocusedId(String(id))}
                    formControlProps={{ fullWidth: true }}
                  />
                )}
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: {
                      xs: 'minmax(0, 1fr)',
                      lg: fullPreview ? 'minmax(0, 1fr)' : 'minmax(0, 2fr) minmax(0, 3fr)',
                    },
                    gap: 2,
                    alignItems: { xs: 'start', lg: 'stretch' },
                    gridTemplateRows: { lg: 'minmax(0, 1fr)' },
                    flex: 1,
                    minHeight: 0,
                  }}
                >
                  <Scrollbar
                    ariaLabel="Certificate controls"
                    sx={{
                      display: fullPreview ? 'none' : undefined,
                      height: { lg: 1 },
                    }}
                    slotProps={{
                      content: { display: 'grid', gap: 2 },
                      contentWrapper: { overscrollBehaviorY: { lg: 'contain' } },
                    }}
                  >
                    <FormSectionCard
                      title="Certificate Type"
                      icon={GlobalIcons.documentIcon}
                      descriptionTooltip="Choose a type to review the required details and preview."
                    >
                      <RadioGroup
                        aria-label="Certificate Type"
                        name="certificateType"
                        value={choice?.type ?? ''}
                        onChange={(_, value) => {
                          const nextChoice = certificateChoices.find(
                            (item) => String(item.type) === value
                          );
                          if (locked || !nextChoice || nextChoice === choice) return;
                          form.setValues(
                            (values) => ({ ...values, particulars: '', exitCases: {} }),
                            false
                          );
                          form.setFieldTouched('particulars', false, false);
                          form.setFieldError('particulars', undefined);
                          form.setFieldError('exitCases', undefined);
                          setChoice(nextChoice);
                        }}
                        sx={{ gap: 1 }}
                      >
                        {certificateChoices.map((item) => (
                          <FormControlLabel
                            key={item.type}
                            value={item.type}
                            labelPlacement="start"
                            disabled={locked}
                            control={<Radio size="small" />}
                            label={
                              <Stack
                                component="span"
                                direction="row"
                                spacing={1.5}
                                alignItems="center"
                              >
                                <Iconify
                                  icon={item.icon}
                                  sx={{ color: 'text.secondary', flexShrink: 0 }}
                                />
                                <Stack component="span">
                                  <Typography component="span" variant="subtitle2">
                                    {item.label}
                                  </Typography>
                                  <Typography
                                    component="span"
                                    variant="caption"
                                    color="text.secondary"
                                  >
                                    {item.description}
                                  </Typography>
                                </Stack>
                              </Stack>
                            }
                            sx={{
                              m: 0,
                              pl: 1.5,
                              pr: 0.5,
                              py: 0.5,
                              justifyContent: 'space-between',
                              border: 1,
                              borderColor: choice === item ? 'primary.main' : 'divider',
                              bgcolor: choice === item ? 'action.selected' : 'transparent',
                              borderRadius: 1,
                            }}
                          />
                        ))}
                      </RadioGroup>
                    </FormSectionCard>
                    {choice && (
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
                              value={validIssueDate ? issueDay : null}
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
                                form.submitCount > 0 &&
                                form.errors.exitCases &&
                                !form.values.exitCases[focusedId] &&
                                focusedStudent
                                  ? `Choose an eligible exit case for ${nameOf(focusedStudent)}.`
                                  : undefined
                              }
                            />
                          )}
                          <Box>
                            <FormControlLabel
                              label="Include school logo / banner"
                              labelPlacement="start"
                              disabled={locked}
                              control={
                                <Switch
                                  size="small"
                                  checked={form.values.showSchoolBranding}
                                  onChange={(_, checked) =>
                                    form.setFieldValue('showSchoolBranding', checked)
                                  }
                                  slotProps={{
                                    input: { role: 'switch', 'aria-describedby': brandingHelpId },
                                  }}
                                />
                              }
                              sx={{ m: 0, width: 1, justifyContent: 'space-between', gap: 1 }}
                            />
                            <Typography
                              id={brandingHelpId}
                              variant="caption"
                              color="text.secondary"
                              display="block"
                            >
                              {brandingHelp}
                            </Typography>
                          </Box>
                        </Stack>
                      </FormSectionCard>
                    )}
                  </Scrollbar>
                  <FormSectionCard
                    title="Certificate Preview"
                    icon={GlobalIcons.eye}
                    descriptionTooltip="Review this student's certificate before generation. Its final number is assigned when it is issued."
                    sx={{ minWidth: 0, minHeight: 0, display: 'flex', flexDirection: 'column' }}
                    contentSx={{ flex: 1, minHeight: 0 }}
                    action={
                      choice && (
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
                      )
                    }
                  >
                    <Typography variant="caption" color="text.secondary">
                      A4 · Portrait
                    </Typography>
                    <Scrollbar
                      ariaLabel="Certificate document preview"
                      sx={{
                        p: { xs: 0, sm: 2 },
                        bgcolor: { xs: 'transparent', sm: 'background.neutral' },
                        borderRadius: 1,
                        flex: { lg: 1 },
                      }}
                      slotProps={{
                        contentWrapper: { overscrollBehaviorY: { lg: 'contain' } },
                      }}
                    >
                      {flow.previewLoading ? (
                        <Skeleton
                          role="status"
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
                        <Typography variant="body2" color="text.secondary">
                          {!choice
                            ? 'Choose a certificate type to preview it.'
                            : !validIssueDate
                              ? 'Choose a valid issue date to preview this certificate.'
                              : choice.type === 3 && !form.values.exitCases[focusedId]
                                ? 'Select an eligible exit case to preview this certificate.'
                                : 'Preview is unavailable. Review the certificate details and student eligibility.'}
                        </Typography>
                      )}
                    </Scrollbar>
                  </FormSectionCard>
                </Box>
              </Stack>
            </Box>
          )}
        </Stack>
      </StudentAssignmentDrawer>
      {guard.confirmation}
    </>
  );
}

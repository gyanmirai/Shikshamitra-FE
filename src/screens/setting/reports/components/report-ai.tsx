import * as Yup from 'yup';
import { useFormik } from 'formik';
import { Alert, Stack, Button, Typography } from '@mui/material';
import { FormSectionCard } from 'src/components/form-section-card';
import { useUnsavedNavigation } from 'src/hooks/use-unsaved-navigation';
import { AiReportActivity } from 'src/screens/academic/curriculum-management/reports/AiReportActivity';
import { AiReportClarification } from 'src/screens/academic/curriculum-management/reports/AiReportClarification';
import { CurriculumReportPreviewTable } from 'src/screens/academic/curriculum-management/reports/CurriculumReportPreviewTable';

import { ReportDrawer } from './report-drawer';
import { useAiReport } from '../hooks/use-ai-report';
import { ReportAiActions } from './report-ai-actions';
import { ReportAiRequest } from './report-ai-request';
import { reportDiscardConfirmation } from './report-discard-confirmation';

export function InstituteAiDrawer({
  onClose,
  onQueued,
  permittedReportTypes,
}: {
  onClose: () => void;
  onQueued: () => void;
  permittedReportTypes: string[];
}) {
  const workflow = useAiReport(onQueued);
  const form = useFormik({
    initialValues: { prompt: '' },
    validationSchema: Yup.object({
      prompt: Yup.string()
        .trim()
        .min(10, 'Use at least 10 characters.')
        .max(2000)
        .required('Describe the report you need.'),
    }),
    onSubmit: ({ prompt }) => workflow.submit(prompt.trim()),
  });
  const ready = workflow.plan?.status === 'Ready';
  const permittedPlan =
    !workflow.plan?.plan || permittedReportTypes.includes(workflow.plan.plan.reportType);
  const guard = useUnsavedNavigation(form.dirty || Boolean(workflow.plan), {
    blockNavigation: workflow.busy,
    renderConfirmation: (keepEditing, discard) =>
      reportDiscardConfirmation(keepEditing, discard, workflow.busy),
  });
  const requestClose = () => guard.requestNavigation(onClose);
  return (
    <>
      <ReportDrawer
        title="Generate Report With ShikshaMitra AI"
        onClose={requestClose}
        busy={workflow.busy}
        info="AI proposes a report using permitted Institute Setup datasets. Review the plan and preview before approving generation."
        footer={
          <ReportAiActions
            workflow={workflow}
            ready={ready}
            permittedPlan={permittedPlan}
            onClose={requestClose}
            onPrepare={() => form.handleSubmit()}
          />
        }
      >
        <Typography variant="body2" color="text.secondary">
          Report on academic setup, rooms, shifts, School Documents and School Identity, including
          document and profile counts. Choose PDF, Excel or CSV; PDF is the default.
        </Typography>
        <Alert severity="info">
          Available reports follow your source permissions and identity scope. Signature
          configuration requires separate access. Reports include metadata and counts; attachment
          contents, images, student enrolment and staff records are excluded.
        </Alert>
        {workflow.error && (
          <Alert
            severity="error"
            action={
              <Button disabled={workflow.busy} onClick={() => workflow.submit(form.values.prompt)}>
                Retry
              </Button>
            }
          >
            {workflow.error}
          </Alert>
        )}
        {!permittedPlan && (
          <Alert severity="warning">
            This report is no longer available with your current source permissions. Refresh access
            or edit the request.
          </Alert>
        )}
        {!workflow.plan && !workflow.busy && <ReportAiRequest form={form} />}
        {workflow.stage && (
          <AiReportActivity
            stage={workflow.stage === 'creating' ? 'generating' : workflow.stage}
            description={
              workflow.stage === 'planning'
                ? 'Understanding your request and finding permitted Institute Setup fields.'
                : undefined
            }
            scopeMessage="Using permitted Institute Setup data."
          />
        )}
        {workflow.plan?.status === 'NeedsClarification' && (
          <AiReportClarification
            key={JSON.stringify(workflow.plan.clarificationQuestions)}
            questions={workflow.plan.clarificationQuestions}
            onSubmit={(answers) => workflow.submit(form.values.prompt, answers)}
          />
        )}
        {ready && permittedPlan && (
          <Stack spacing={2}>
            <FormSectionCard
              icon="mdi:file-document-check-outline"
              title="Review Report Plan"
              descriptionTooltip="Approve only after checking the requested report, filters and output."
            >
              <Typography>{workflow.plan?.summary}</Typography>
              <Typography variant="body2">
                Format: {workflow.plan?.plan?.format.toUpperCase()}
              </Typography>
              <Typography variant="body2">{workflow.preview?.filterSummary}</Typography>
              <Typography variant="body2">
                {workflow.preview?.totalCount ?? 0} matching rows. The preview shows the first page.
              </Typography>
            </FormSectionCard>
            {workflow.preview && (
              <CurriculumReportPreviewTable
                columns={workflow.preview.columns}
                isLoading={false}
                rowsPerPage={25}
                rows={workflow.preview.rows.map((row) =>
                  Object.fromEntries(
                    Object.entries(row).map(([key, value]) => [key, value ?? 'Not set'])
                  )
                )}
              />
            )}
          </Stack>
        )}
      </ReportDrawer>
      {guard.confirmation}
    </>
  );
}

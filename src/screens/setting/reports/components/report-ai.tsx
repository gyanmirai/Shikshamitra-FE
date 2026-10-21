import * as Yup from 'yup';
import { useFormik } from 'formik';
import SubmitButton from 'src/components/submit-button';
import ShakingTextField from 'src/components/shaking-text-field';
import { FormSectionCard } from 'src/components/form-section-card';
import { Box, Alert, Stack, Button, TextField, Typography } from '@mui/material';
import { AiReportActivity } from 'src/screens/academic/curriculum-management/reports/AiReportActivity';
import { AiReportClarification } from 'src/screens/academic/curriculum-management/reports/AiReportClarification';
import { CurriculumReportPreviewTable } from 'src/screens/academic/curriculum-management/reports/CurriculumReportPreviewTable';

import { ReportDrawer } from './report-drawer';
import { useAiReport } from '../hooks/use-ai-report';

export function InstituteAiDrawer({ onClose, onQueued, permittedReportTypes }: { onClose: () => void; onQueued: () => void; permittedReportTypes: string[] }) {
  const workflow = useAiReport(onQueued);
  const form = useFormik({
    initialValues: { prompt: '' },
    validationSchema: Yup.object({ prompt: Yup.string().trim().min(10, 'Use at least 10 characters.').max(2000).required('Describe the report you need.') }),
    onSubmit: ({ prompt }) => workflow.submit(prompt.trim()),
  });
  const ready = workflow.plan?.status === 'Ready';
  const permittedPlan = !workflow.plan?.plan || permittedReportTypes.includes(workflow.plan.plan.reportType);
  return <ReportDrawer title="Generate Report With ShikshaMitra AI" onClose={onClose} busy={workflow.busy}
    info="AI proposes a report using permitted Institute Setup datasets. Review the plan and preview before approving generation."
    footer={<>
      <Button size="small" variant="outlined" disabled={workflow.busy} onClick={onClose}>Close</Button>
      {workflow.plan && <Button size="small" disabled={workflow.busy} onClick={workflow.reset}>Edit request</Button>}
      {ready ? <SubmitButton type="button" buttonText="Approve and generate report" loading={workflow.busy}
        disabled={!workflow.preview || !permittedPlan} onClick={workflow.generate} /> : !workflow.plan && <SubmitButton type="button" loading={workflow.busy}
          buttonText="Prepare report plan" onClick={() => form.handleSubmit()} />}
    </>}>
    <Typography variant="body2" color="text.secondary">Report on academic setup, rooms, shifts, School Documents and School Identity, including document and profile counts. Choose PDF, Excel or CSV; PDF is the default.</Typography>
    <Alert severity="info">Available reports follow your source permissions and identity scope. Signature configuration requires separate access. Reports include metadata and counts; attachment contents, images, student enrolment and staff records are excluded.</Alert>
    {workflow.error && <Alert severity="error" action={<Button disabled={workflow.busy} onClick={() => workflow.submit(form.values.prompt)}>Retry</Button>}>{workflow.error}</Alert>}
    {!permittedPlan && <Alert severity="warning">This report is no longer available with your current source permissions. Refresh access or edit the request.</Alert>}
    {!workflow.plan && !workflow.busy && <Box component="form" onSubmit={form.handleSubmit}>
      <FormSectionCard icon="mdi:comment-text-outline" title="Report Request" descriptionTooltip="Describe the setup report, filters, columns, sorting and output format.">
        <ShakingTextField error={Boolean(form.touched.prompt && form.errors.prompt)}>
          <TextField fullWidth required size="small" multiline minRows={5} name="prompt" label="What report would you like?"
            placeholder="Example: Which classes have only one division?"
            value={form.values.prompt} onChange={form.handleChange} onBlur={form.handleBlur}
            error={Boolean(form.touched.prompt && form.errors.prompt)} helperText={form.touched.prompt && form.errors.prompt}
            slotProps={{ htmlInput: { maxLength: 2000 } }} />
        </ShakingTextField>
      </FormSectionCard>
    </Box>}
    {workflow.stage && <AiReportActivity stage={workflow.stage === 'creating' ? 'generating' : workflow.stage}
      description={workflow.stage === 'planning' ? 'Understanding your request and finding permitted Institute Setup fields.' : undefined}
      scopeMessage="Using permitted Institute Setup data." />}
    {workflow.plan?.status === 'NeedsClarification' && <AiReportClarification key={JSON.stringify(workflow.plan.clarificationQuestions)}
      questions={workflow.plan.clarificationQuestions} onSubmit={(answers) => workflow.submit(form.values.prompt, answers)} />}
    {ready && permittedPlan && <Stack spacing={2}>
      <FormSectionCard icon="mdi:file-document-check-outline" title="Review Report Plan" descriptionTooltip="Approve only after checking the requested report, filters and output.">
        <Typography>{workflow.plan?.summary}</Typography>
        <Typography variant="body2">Format: {workflow.plan?.plan?.format.toUpperCase()}</Typography>
        <Typography variant="body2">{workflow.preview?.filterSummary}</Typography>
        <Typography variant="body2">{workflow.preview?.totalCount ?? 0} matching rows. The preview shows the first page.</Typography>
      </FormSectionCard>
      {workflow.preview && <CurriculumReportPreviewTable columns={workflow.preview.columns} isLoading={false} rowsPerPage={25}
        rows={workflow.preview.rows.map((row) => Object.fromEntries(Object.entries(row).map(([key, value]) => [key, value ?? 'Not set'])))} />}
    </Stack>}
  </ReportDrawer>;
}

'use client';

import * as Yup from 'yup';
import { useFormik } from 'formik';
import { LoadingButton } from '@mui/lab';
import { Iconify } from 'src/components/iconify';
import { Box, Alert, Stack, Button, Drawer, Divider, Typography } from '@mui/material';
import { AiReportActivity } from 'src/screens/academic/curriculum-management/reports/AiReportActivity';
import { AiReportPromptForm } from 'src/screens/academic/curriculum-management/reports/AiReportPromptForm';
import { AiReportUserMessage } from 'src/screens/academic/curriculum-management/reports/AiReportChatMessage';
import { AiReportDrawerHeader } from 'src/screens/academic/curriculum-management/reports/AiReportDrawerHeader';
import { AiReportClarification } from 'src/screens/academic/curriculum-management/reports/AiReportClarification';
import { isAiReportBusyStage } from 'src/screens/academic/curriculum-management/reports/ai-report-activity-config';

import { useHrAiReport } from '../hooks/useHrAiReport';
import { HrAiReportPlanReview } from './HrAiReportPlanReview';

const promptSchema = Yup.object({
  prompt: Yup.string()
    .trim()
    .min(10, 'Describe the report in at least 10 characters')
    .max(2000, 'Keep the request under 2,000 characters')
    .required('Tell ShikshaMitra AI what report you need'),
});

type Props = {
  open: boolean;
  canBuild: boolean;
  canExport: boolean;
  onClose: () => void;
  onExportQueued: (jobId: string) => void;
};

export function HrAiReportDrawer({ open, canBuild, canExport, onClose, onExportQueued }: Props) {
  const workflow = useHrAiReport(onExportQueued);
  const { stage } = workflow;
  const isWorking = isAiReportBusyStage(stage);
  const showPrompt = stage === 'idle' || stage === 'failed';
  const formik = useFormik({
    initialValues: { prompt: '' },
    validationSchema: promptSchema,
    onSubmit: ({ prompt }) => workflow.planReport(prompt.trim(), []),
  });

  const handleClose = () => {
    if (isWorking) return;
    formik.resetForm();
    workflow.reset();
    onClose();
  };

  const handleEdit = () => {
    workflow.reset();
    window.requestAnimationFrame(() => document.getElementById('ai-report-prompt')?.focus());
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={handleClose}
      PaperProps={{
        'aria-labelledby': 'shikshamitra-ai-drawer-title',
        sx: { width: { xs: '100%', sm: 560, md: 620 }, maxWidth: '100%', display: 'flex', flexDirection: 'column' },
      }}
    >
      <AiReportDrawerHeader
        contextLabel="HR · current tenant and permitted staff scope"
        disableClose={isWorking}
        onClose={handleClose}
      />
      <Divider />
      <Box sx={{ flex: 1, minHeight: 0, overflowY: 'auto', p: { xs: 2, sm: 2.5 } }} aria-busy={isWorking}>
        <Stack spacing={2.25}>
          <Typography variant="body2" color="text.secondary">
            Describe the HR report you need. The agent can design staff, payroll, attendance,
            leave, policy/audit, or performance reports and will ask before making a material assumption.
          </Typography>
          {showPrompt ? (
            <AiReportPromptForm
              prompt={formik.values.prompt}
              error={formik.errors.prompt}
              touched={formik.touched.prompt}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              onSubmit={formik.handleSubmit}
              placeholder="Example: Monthly department payroll totals with gross salary, deductions, and net pay"
            />
          ) : (
            <AiReportUserMessage prompt={formik.values.prompt} />
          )}
          {isAiReportBusyStage(stage) && (
            <AiReportActivity
              stage={stage}
              scopeMessage="Using only your tenant, HR permissions, and current staff scope."
            />
          )}
          {workflow.stage === 'clarifying' && workflow.questions.length > 0 && (
            <AiReportClarification questions={workflow.questions} onSubmit={workflow.submitClarifications} />
          )}
          {workflow.stage === 'planned' && workflow.review && (
            <HrAiReportPlanReview review={workflow.review} onFormatChange={workflow.changeFormat} />
          )}
          {workflow.errorMessage && <Alert severity="error">{workflow.errorMessage}</Alert>}
          {workflow.stage === 'ready' && (
            <Alert severity="success" icon={<Iconify icon="solar:file-check-bold" />}>
              <Typography variant="subtitle2">HR report queued</Typography>
              <Typography variant="body2">
                The permission-scoped export is running in the background and is highlighted in Reports Center.
              </Typography>
            </Alert>
          )}
        </Stack>
      </Box>

      {!isWorking && (
        <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider', bgcolor: 'background.paper' }}>
          <Stack direction="row" spacing={1} justifyContent="flex-end">
            {workflow.stage === 'planned' ? (
              <Button size="small" variant="outlined" onClick={handleEdit}>Edit request</Button>
            ) : (
              <Button size="small" variant="outlined" onClick={handleClose}>
                {workflow.stage === 'ready' ? 'Close' : 'Cancel'}
              </Button>
            )}
            {workflow.stage === 'planned' ? (
              <LoadingButton
                size="small"
                variant="contained"
                disabled={!canExport}
                startIcon={<Iconify icon="solar:document-add-bold" />}
                onClick={workflow.generate}
              >
                Approve &amp; generate {(workflow.review?.plan.format ?? 'excel').toUpperCase()}
              </LoadingButton>
            ) : workflow.stage === 'idle' || workflow.stage === 'failed' ? (
              <LoadingButton
                form="shikshamitra-ai-report-form"
                type="submit"
                size="small"
                variant="contained"
                disabled={!canBuild}
                startIcon={<Iconify icon="solar:magic-stick-3-bold" />}
              >
                Create report plan
              </LoadingButton>
            ) : null}
          </Stack>
          {workflow.stage === 'planned' && !canExport && (
            <Typography variant="caption" color="warning.main" display="block" textAlign="right" sx={{ mt: 0.75 }}>
              HR report export permission is required to generate the file.
            </Typography>
          )}
        </Box>
      )}
    </Drawer>
  );
}

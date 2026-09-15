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

import { useFinanceAiReport } from '../hooks/useFinanceAiReport';
import { FinanceAiReportPlanReview } from './FinanceAiReportPlanReview';

const promptSchema = Yup.object({
  prompt: Yup.string()
    .trim()
    .min(10, 'Describe the report in at least 10 characters')
    .max(2000, 'Keep the request under 2,000 characters')
    .required('Tell ShikshaMitra AI what report you need'),
});

type Props = {
  open: boolean;
  onClose: () => void;
  onExportQueued: (jobId: string) => void;
};

export function FinanceAiReportDrawer({ open, onClose, onExportQueued }: Props) {
  const workflow = useFinanceAiReport(onExportQueued);
  const isWorking = isAiReportBusyStage(workflow.stage);
  const showPrompt = workflow.stage === 'idle' || workflow.stage === 'failed';
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
        sx: { width: { xs: '100%', sm: 560, md: 640 }, maxWidth: '100%', display: 'flex', flexDirection: 'column' },
      }}
    >
      <AiReportDrawerHeader
        contextLabel="Finance · current tenant and permitted academic scope"
        disableClose={isWorking}
        onClose={handleClose}
      />
      <Divider />
      <Box sx={{ flex: 1, minHeight: 0, overflowY: 'auto', p: { xs: 2, sm: 2.5 } }} aria-busy={isWorking}>
        <Stack spacing={2.25}>
          <Typography variant="body2" color="text.secondary">
            Describe the financial question in your own words. The agent selects the best supported
            report and filters, asks when a choice matters, then shows live authorized data for review.
          </Typography>
          {showPrompt ? (
            <AiReportPromptForm
              prompt={formik.values.prompt}
              error={formik.errors.prompt}
              touched={formik.touched.prompt}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              onSubmit={formik.handleSubmit}
              placeholder="Example: Compare monthly fee collection by fee head for 2026–27, PDF"
            />
          ) : (
            <AiReportUserMessage prompt={formik.values.prompt} />
          )}
          {isAiReportBusyStage(workflow.stage) && (
            <AiReportActivity
              stage={workflow.stage}
              scopeMessage="Using only your Finance Reports permission, tenant, and current academic UserScope."
            />
          )}
          {workflow.stage === 'clarifying' && workflow.questions.length > 0 && (
            <AiReportClarification
              questions={workflow.questions}
              onSubmit={workflow.submitClarifications}
            />
          )}
          {workflow.stage === 'planned' && workflow.review && (
            <FinanceAiReportPlanReview review={workflow.review} onFormatChange={workflow.changeFormat} />
          )}
          {workflow.errorMessage && <Alert severity="error">{workflow.errorMessage}</Alert>}
          {workflow.stage === 'ready' && (
            <Alert severity="success" icon={<Iconify icon="solar:file-check-bold" />}>
              <Typography variant="subtitle2">Finance report queued</Typography>
              <Typography variant="body2">The approved, permission-scoped export is running in the background.</Typography>
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
              <LoadingButton size="small" variant="contained" startIcon={<Iconify icon="solar:document-add-bold" />} onClick={workflow.generate}>
                Approve &amp; generate {(workflow.review?.plan.format ?? 'pdf').toUpperCase()}
              </LoadingButton>
            ) : workflow.stage === 'idle' || workflow.stage === 'failed' ? (
              <LoadingButton form="shikshamitra-ai-report-form" type="submit" size="small" variant="contained" startIcon={<Iconify icon="solar:magic-stick-3-bold" />}>
                Create report plan
              </LoadingButton>
            ) : null}
          </Stack>
        </Box>
      )}
    </Drawer>
  );
}

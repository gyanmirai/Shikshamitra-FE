'use client';

import type { TransportAiReportExecutionPlan } from 'src/redux/transport/vehicle-management/dashboard-report-api';

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

import { useTransportAiReport } from './hooks/useTransportAiReport';
import { TransportAiReportPlanReview } from './TransportAiReportPlanReview';

const promptSchema = Yup.object({
  prompt: Yup.string()
    .trim()
    .min(10, 'Describe the report in at least 10 characters')
    .max(2000, 'Keep the request under 2,000 characters')
    .required('Tell ShikshaMitra AI what report you need'),
});

type Props = {
  open: boolean;
  academicMediumId: string;
  academicYearId?: string;
  contextLabel: string;
  onClose: () => void;
  onGenerated: (plan: TransportAiReportExecutionPlan) => void;
};

export function TransportAiReportDrawer({
  open,
  academicMediumId,
  academicYearId,
  contextLabel,
  onClose,
  onGenerated,
}: Props) {
  const workflow = useTransportAiReport({ academicMediumId, academicYearId }, onGenerated);
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
        sx: {
          width: { xs: '100%', sm: 560, md: 680 },
          maxWidth: '100%',
          display: 'flex',
          flexDirection: 'column',
        },
      }}
    >
      <AiReportDrawerHeader
        contextLabel={`Transport · ${contextLabel}`}
        disableClose={isWorking}
        onClose={handleClose}
      />
      <Divider />
      <Box
        sx={{ flex: 1, minHeight: 0, overflowY: 'auto', p: { xs: 2, sm: 2.5 } }}
        aria-busy={isWorking}
      >
        <Stack spacing={2.25}>
          <Typography variant="body2" color="text.secondary">
            Ask naturally in English, Gujarati, or Hindi. The agent selects one supported vehicle,
            route, passenger, compliance, staff, or fee report and asks when a choice matters.
          </Typography>
          {showPrompt ? (
            <AiReportPromptForm
              prompt={formik.values.prompt}
              error={formik.errors.prompt}
              touched={formik.touched.prompt}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              onSubmit={formik.handleSubmit}
              placeholder="Example: Show pending student transport fees for Route A this month"
            />
          ) : (
            <AiReportUserMessage prompt={formik.values.prompt} />
          )}
          {isAiReportBusyStage(workflow.stage) && (
            <AiReportActivity
              stage={workflow.stage}
              scopeMessage="Using only Transport Reports permission, the selected academic context, and permitted student records."
            />
          )}
          {workflow.stage === 'clarifying' && workflow.questions.length > 0 && (
            <AiReportClarification
              questions={workflow.questions}
              onSubmit={workflow.submitClarifications}
            />
          )}
          {workflow.stage === 'planned' && workflow.review && (
            <TransportAiReportPlanReview review={workflow.review} />
          )}
          {workflow.errorMessage && <Alert severity="error">{workflow.errorMessage}</Alert>}
          {workflow.stage === 'ready' && (
            <Alert severity="success" icon={<Iconify icon="solar:file-check-bold" />}>
              <Typography variant="subtitle2">Transport report generated</Typography>
              <Typography variant="body2">
                The authorized CSV was downloaded and the same plan is shown on the reports page.
              </Typography>
            </Alert>
          )}
        </Stack>
      </Box>

      {!isWorking && (
        <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider', bgcolor: 'background.paper' }}>
          <Stack direction="row" spacing={1} justifyContent="flex-end">
            {workflow.stage === 'planned' ? (
              <Button size="small" variant="outlined" onClick={handleEdit}>
                Edit request
              </Button>
            ) : (
              <Button size="small" variant="outlined" onClick={handleClose}>
                {workflow.stage === 'ready' ? 'Close' : 'Cancel'}
              </Button>
            )}
            {workflow.stage === 'planned' ? (
              <LoadingButton
                size="small"
                variant="contained"
                startIcon={<Iconify icon="solar:download-bold" />}
                onClick={workflow.generate}
              >
                Approve &amp; generate CSV
              </LoadingButton>
            ) : workflow.stage === 'idle' || workflow.stage === 'failed' ? (
              <LoadingButton
                form="shikshamitra-ai-report-form"
                type="submit"
                size="small"
                variant="contained"
                startIcon={<Iconify icon="solar:magic-stick-3-bold" />}
              >
                Create report plan
              </LoadingButton>
            ) : null}
          </Stack>
        </Box>
      )}
    </Drawer>
  );
}

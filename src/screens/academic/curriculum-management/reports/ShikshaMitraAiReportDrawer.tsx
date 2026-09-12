'use client';

import type { RootState } from 'src/redux/store';

import * as Yup from 'yup';
import { useFormik } from 'formik';
import { useSelector } from 'react-redux';
import { Box, Alert, Stack, Drawer, Divider, TextField, Typography } from '@mui/material';

import { AiReportActivity } from './AiReportActivity';
import { AiReportUserMessage } from './AiReportChatMessage';
import { AiReportDrawerHeader } from './AiReportDrawerHeader';
import { AiReportDrawerActions } from './AiReportDrawerActions';
import { isAiReportBusyStage } from './ai-report-activity-config';
import { AiReportReady, AiReportPlanPreview } from './AiReportStatus';
import { useAiCurriculumReport } from './hooks/useAiCurriculumReport';

const promptSchema = Yup.object({
  prompt: Yup.string()
    .trim()
    .min(10, 'Describe the report in at least 10 characters')
    .max(2000, 'Keep the request under 2,000 characters')
    .required('Tell ShikshaMitra AI what report you need'),
});

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function ShikshaMitraAiReportDrawer({ open, onClose }: Props) {
  const { currentYear, currentBoard, currentMedium } = useSelector(
    (state: RootState) => state.globalState
  );
  const workflow = useAiCurriculumReport();
  const hasAcademicContext = Boolean(currentYear?.id && currentBoard?.id && currentMedium?.id);
  const isWorking = isAiReportBusyStage(workflow.stage);
  const showPromptEditor = workflow.stage === 'idle' || workflow.stage === 'failed';
  const disableClose = isWorking || workflow.isDownloading;
  const contextLabel = `${currentYear?.name || 'No year'} / ${currentBoard?.name || 'No board'} / ${currentMedium?.name || 'No medium'}`;

  const formik = useFormik({
    initialValues: { prompt: '' },
    validationSchema: promptSchema,
    onSubmit: async ({ prompt }) => workflow.planReport(prompt.trim()),
  });

  const handleClose = () => {
    if (disableClose) return;
    formik.resetForm();
    workflow.reset();
    onClose();
  };

  const handleEditRequest = () => {
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
          width: { xs: '100%', sm: 560, md: 600 },
          maxWidth: '100%',
          display: 'flex',
          flexDirection: 'column',
        },
      }}
    >
      <AiReportDrawerHeader
        contextLabel={contextLabel}
        disableClose={disableClose}
        onClose={handleClose}
      />
      <Divider />
      <Box
        sx={{ flex: 1, minHeight: 0, overflowY: 'auto', p: { xs: 2, sm: 2.5 } }}
        aria-busy={isWorking}
      >
        <Stack spacing={2.25}>
          <Typography variant="body2" color="text.secondary">
            Describe the Curriculum report you need. The agent uses only permitted data from the
            selected academic context and asks you to approve its plan before creating the PDF.
          </Typography>
          {!hasAcademicContext && (
            <Alert severity="warning">Select an Academic Year, Board, and Medium first.</Alert>
          )}
          {showPromptEditor ? (
            <Box
              id="shikshamitra-ai-report-form"
              component="form"
              onSubmit={formik.handleSubmit}
            >
              <TextField
                id="ai-report-prompt"
                fullWidth
                multiline
                minRows={5}
                maxRows={10}
                size="small"
                name="prompt"
                label="What report would you like?"
                placeholder="Example: Nursery subjects with primary teachers"
                value={formik.values.prompt}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.prompt && Boolean(formik.errors.prompt)}
                helperText={
                  (formik.touched.prompt && formik.errors.prompt) ||
                  'Include class, subjects, columns, or filters in your own words.'
                }
                inputProps={{ maxLength: 2000 }}
              />
            </Box>
          ) : (
            <AiReportUserMessage prompt={formik.values.prompt} />
          )}
          {isAiReportBusyStage(workflow.stage) && <AiReportActivity stage={workflow.stage} />}

          {workflow.stage === 'planned' && workflow.plan && (
            <AiReportPlanPreview plan={workflow.plan} />
          )}

          {workflow.errorMessage && <Alert severity="error">{workflow.errorMessage}</Alert>}

          {workflow.stage === 'ready' && workflow.result && (
            <AiReportReady
              reportType={workflow.result.reportType}
              summary={workflow.result.summary}
            />
          )}
        </Stack>
      </Box>

      <AiReportDrawerActions
        stage={workflow.stage}
        hasAcademicContext={hasAcademicContext}
        isDownloading={workflow.isDownloading}
        onClose={handleClose}
        onDownload={workflow.download}
        onEditRequest={handleEditRequest}
        onGenerate={workflow.generate}
      />
    </Drawer>
  );
}

'use client';

import type { RootState } from 'src/redux/store';
import type { AcademicAiReportModule } from 'src/redux/academicAPI/AcademicReportApi';

import * as Yup from 'yup';
import { useFormik } from 'formik';
import { useSelector } from 'react-redux';
import { Box, Alert, Stack, Drawer, Divider, Typography } from '@mui/material';

import { AiReportReady } from './AiReportStatus';
import { AiReportActivity } from './AiReportActivity';
import { AiReportPlanReview } from './AiReportPlanReview';
import { AiReportPromptForm } from './AiReportPromptForm';
import { AiReportUserMessage } from './AiReportChatMessage';
import { AiReportDrawerHeader } from './AiReportDrawerHeader';
import { AiReportClarification } from './AiReportClarification';
import { AiReportDrawerActions } from './AiReportDrawerActions';
import { isAiReportBusyStage } from './ai-report-activity-config';
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
  module?: AcademicAiReportModule;
}

const MODULE_COPY: Record<AcademicAiReportModule, { description: string; placeholder: string }> = {
  Curriculum: {
    description: 'Describe the Curriculum report you need.',
    placeholder: 'Example: Nursery subjects with primary teachers and progress below 70%',
  },
  Timetable: {
    description: 'Describe the Timetable report you need.',
    placeholder: 'Example: Class 8 weekly timetable with subjects, teachers, rooms, and breaks',
  },
  'Homework & Assignment': {
    description: 'Describe the Homework or Assignment report you need.',
    placeholder:
      'Example: Class 8 assignments due this month with subject, marks, and evaluation method',
  },
  Examination: {
    description: 'Describe the Examination report you need.',
    placeholder:
      'Example: Class 10 overall exam results with percentage, grade, rank, and publication status',
  },
  'Student Records': {
    description: 'Describe the Student Records report you need.',
    placeholder:
      'Example: Enrolled Class 8 students grouped by division with roll and GR numbers',
  },
  'Student Attendance': {
    description: 'Describe the Student Attendance report you need.',
    placeholder:
      'Example: Class 10 absent students from 2026-09-01 to 2026-09-15, sorted by date',
  },
};

export default function ShikshaMitraAiReportDrawer({
  open,
  onClose,
  module = 'Curriculum',
}: Props) {
  const { currentYear, currentBoard, currentMedium } = useSelector(
    (state: RootState) => state.globalState
  );
  const workflow = useAiCurriculumReport(module);
  const copy = MODULE_COPY[module];
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
            {copy.description} The agent uses only permitted data from the selected academic context
            and asks you to approve its plan before creating the file.
          </Typography>
          {!hasAcademicContext && (
            <Alert severity="warning">Select an Academic Year, Board, and Medium first.</Alert>
          )}
          {showPromptEditor ? (
            <AiReportPromptForm
              prompt={formik.values.prompt}
              error={formik.errors.prompt}
              touched={formik.touched.prompt}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              onSubmit={formik.handleSubmit}
              placeholder={copy.placeholder}
            />
          ) : (
            <AiReportUserMessage prompt={formik.values.prompt} />
          )}
          {isAiReportBusyStage(workflow.stage) && <AiReportActivity stage={workflow.stage} />}

          {workflow.stage === 'clarifying' && workflow.questions.length > 0 && (
            <AiReportClarification
              questions={workflow.questions}
              onSubmit={workflow.submitClarifications}
            />
          )}

          {workflow.stage === 'planned' && workflow.review && (
            <AiReportPlanReview review={workflow.review} onFormatChange={workflow.changeFormat} />
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
        format={workflow.review?.plan.format}
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

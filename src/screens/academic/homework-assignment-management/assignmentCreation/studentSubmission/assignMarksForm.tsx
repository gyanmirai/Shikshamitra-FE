'use client';

import { Box, Grid, Divider } from '@mui/material';
import { FormBusyRegion } from 'src/components/form-busy-region';
import { DialogScrollContent } from 'src/components/customDialog';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';

import AssignmentMarksSection from './components/assignmentMarksSection';
import AssignmentFeedbackSection from './components/assignmentFeedbackSection';
import AssignmentFeedbackActions from './components/assignmentFeedbackActions';
import AssignmentSubmissionContext from './components/assignmentSubmissionContext';
import StudentSubmissionAttachments from '../../marksAndFeedback/studentSubmissionAttachments';
import {
  useAssignmentFeedbackForm,
  type AssignmentFeedbackFormProps,
} from './hooks/useAssignmentFeedbackForm';

export default function AssignGrade(props: AssignmentFeedbackFormProps) {
  const { data, isEdit = true, requiresMarks = true } = props;
  const state = useAssignmentFeedbackForm(props);
  const { formik, busy } = state;
  return (
    <BackPopUpChecked initialValues={formik.initialValues} currentValues={formik.values}>
      <Box
        component="form"
        noValidate
        onSubmit={state.handleSubmit}
        sx={{ display: 'flex', flexDirection: 'column', minHeight: 0, flex: '1 1 auto' }}
      >
        <DialogScrollContent scrollBarProps={{ sx: { minHeight: 0, flex: '1 1 auto' } }}>
          <FormBusyRegion busy={busy} label="Saving feedback and marks">
            <Grid container spacing={2}>
              <AssignmentSubmissionContext data={data} />
              <Grid size={{ xs: 12 }} sx={{ minWidth: 0 }}>
                <StudentSubmissionAttachments key={data?.studentId} student={data} />
              </Grid>
              {requiresMarks && (
                <Grid size={{ xs: 12, md: 6 }} sx={{ minWidth: 0 }}>
                  <AssignmentMarksSection isEdit={isEdit} state={state} />
                </Grid>
              )}
              <Grid size={{ xs: 12, md: requiresMarks ? 6 : 12 }} sx={{ minWidth: 0 }}>
                <AssignmentFeedbackSection isEdit={isEdit} data={data} state={state} />
              </Grid>
            </Grid>
          </FormBusyRegion>
        </DialogScrollContent>
        <Divider />
        <AssignmentFeedbackActions {...props} state={state} />
      </Box>
    </BackPopUpChecked>
  );
}

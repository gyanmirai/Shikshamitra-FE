
import { GlobalIcons } from 'src/utils/icons';
import { Alert, Stack, Button } from '@mui/material';
import { FormSectionCard } from 'src/components/form-section-card';

import { SubjectListSkeleton } from './SubjectListSkeleton';
import { SubjectsLectureTable } from './SubjectsLectureTable';
import { WeeklyLectureSetupActions } from './WeeklyLectureSetupActions';

import type { useWeeklyLectureForm } from '../hooks/useWeeklyLectureForm';

type WeeklyLectureTargetsProps = Pick<
  ReturnType<typeof useWeeklyLectureForm>,
  | 'formik'
  | 'isSubjectsLoading'
  | 'isDetailsLoading'
  | 'detailsError'
  | 'subjectsError'
  | 'classContext'
  | 'refetchSubjects'
  | 'isSubmitting'
> & { disabled: boolean; isEdit: boolean; hasEditData: boolean };

export function WeeklyLectureTargets({
  formik,
  isSubjectsLoading,
  isDetailsLoading,
  detailsError,
  subjectsError,
  classContext,
  refetchSubjects,
  isSubmitting,
  disabled,
  isEdit,
  hasEditData,
}: WeeklyLectureTargetsProps) {
  return (
    <FormSectionCard
      title="Subject Lecture Targets"
      icon={GlobalIcons.notebook}
      descriptionTooltip="Set each subject's weekly lecture target within the available teaching capacity."
    >
      {isSubjectsLoading || isDetailsLoading ? (
        <Stack role="status" aria-label="Loading subject lecture targets" aria-busy>
          <SubjectListSkeleton />
        </Stack>
      ) : detailsError ? (
        <Alert severity="error">Subject lecture targets could not be loaded.</Alert>
      ) : !hasEditData && subjectsError ? (
        <Alert
          severity="error"
          action={<Button size="small" onClick={refetchSubjects}>Retry</Button>}
        >
          Subject assignments could not be loaded for {classContext}.
        </Alert>
      ) : formik.values.subjects.length === 0 ? (
        <Alert severity="info">
          No published subject assignments were found for {classContext}. Publish this class&apos;s
          subject assignments in Subject Allocation before entering weekly lecture targets.
          <WeeklyLectureSetupActions
            setup="subjects"
            onRefresh={refetchSubjects}
            disabled={isSubmitting}
          />
        </Alert>
      ) : (
        <SubjectsLectureTable formik={formik} disabled={disabled} isEdit={isEdit} />
      )}
    </FormSectionCard>
  );
}

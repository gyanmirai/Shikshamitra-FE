import type { RootState } from 'src/redux/store';

import { useSelector } from 'react-redux';
import { varAlpha } from 'src/theme/styles';
import { Iconify } from 'src/components/iconify';
import { shikshaMitraToast } from 'src/components/toast';
import { LoadingScreen } from 'src/components/loading-screen';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { CustomStepperWithFormik } from 'src/components/custom-stepper';
import { useRef, useMemo, useState, useEffect, useCallback } from 'react';
import { Box, Chip, Tooltip, Typography, LinearProgress } from '@mui/material';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';
import { useGetExaminationTypesQuery } from 'src/redux/academicAPI/ExaminationApi/examSetting/exam-type-api';
import {
  useGetExamScheduleQuery,
  useGetExamSubjectsQuery,
  useGetExamBasicDetailsQuery,
  useUpdateExamScheduleMutation,
  useAddExamBasicDetailsMutation,
  useGetExamRoomAssignmentsQuery,
  useUpdateExamBasicDetailsMutation,
  useUpdateExamRoomAssignmentMutation,
} from 'src/redux/academicAPI/ExaminationApi/ScheduleExamApi/schedule-examApi';

import SelectExam from './selectExamStep1';
import RoomDetails from './roomManageStep3';
import ExamDetails from './examDetailsStep2';
import ExamReviewStep4 from './ExamReviewStep4';
import { validationSchema as stepValidationSchemas } from '../validationSchema';
import {
  mapBackendToFormik,
  defaultExamFormValues,
  serializeSchedulePayload,
  serializeBasicDetailsPayload,
  serializeRoomAssignmentPayload,
} from './initialValues';

import type { INewExamFormProps } from '../type';

const steps = ['Basic Details', 'Schedule', 'Room Details', 'Review'];

// ---------------------------------------------------------------------------
// ExamContextHeader — Compact persistent context bar (NON-BREAKING)
// Visible from Step 2 onwards to remind users what they're scheduling
// ---------------------------------------------------------------------------
const ExamContextHeader = ({ formik, step }: { formik: any; step: number }) => {
  const { currentMedium: medium } = useSelector((state: RootState) => state.globalState);

  const allClass = useMemo(
    () => medium?.educationMediumStages?.flatMap((stage: any) => stage.standards || []) || [],
    [medium]
  );

  const className = useMemo(
    () => allClass.find((c: any) => c.id === formik.values.className)?.name || '',
    [allClass, formik.values.className]
  );

  const divisions = useMemo(() => {
    const classDivisions =
      allClass.find((c: any) => c.id === formik.values.className)?.divisions || [];
    return classDivisions.filter(
      (d: any) => formik.values.divisions.includes(d.id) && d.id !== 'all'
    );
  }, [allClass, formik.values.className, formik.values.divisions]);

  const { examName, subjects } = formik.values;
  const hasContext = className || examName || subjects.length > 0;

  if (!hasContext || step === 0) return null;

  return (
    <Box
      sx={{
        px: 2,
        py: 1,
        display: 'flex',
        flexWrap: 'wrap',
        gap: 0.75,
        alignItems: 'center',
        borderBottom: '1px solid',
        borderColor: 'divider',
        bgcolor: (theme) => varAlpha(theme.vars.palette.grey['500Channel'], 0.04),
      }}
    >
      {examName && (
        <Tooltip title="Exam Name" arrow>
          <Chip
            icon={<Iconify icon="mdi:clipboard-text-outline" width={14} />}
            label={examName}
            size="small"
            variant="soft"
            sx={{ fontWeight: 600, fontSize: '0.7rem', height: 22 }}
          />
        </Tooltip>
      )}
      {className && (
        <Tooltip title="Class" arrow>
          <Chip
            icon={<Iconify icon="mdi:school-outline" width={14} />}
            label={className}
            size="small"
            color="primary"
            variant="soft"
            sx={{ fontSize: '0.7rem', height: 22 }}
          />
        </Tooltip>
      )}
      {divisions.map((div: any) => (
        <Chip
          key={div.id}
          label={`Div ${div.name}`}
          size="small"
          color="info"
          variant="soft"
          sx={{ fontSize: '0.7rem', height: 22 }}
        />
      ))}
      {subjects.slice(0, 5).map((sub: any) => (
        <Chip
          key={sub.subjectId}
          label={sub.subjectName}
          size="small"
          variant="soft"
          sx={{
            fontSize: '0.7rem',
            height: 22,
            bgcolor: sub.subjectColor ? `${sub.subjectColor}22` : undefined,
            color: sub.subjectColor || 'text.secondary',
            '& .MuiChip-label': { fontWeight: 600 },
          }}
        />
      ))}
      {subjects.length > 5 && (
        <Chip
          label={`+${subjects.length - 5} more`}
          size="small"
          variant="soft"
          sx={{ fontSize: '0.7rem', height: 22, color: 'text.secondary' }}
        />
      )}
    </Box>
  );
};

const NewExamForm = ({ onClose, editData }: INewExamFormProps) => {
  const [activeStep, setActiveStep] = useState(0);

  // Mutations
  const [addExamBasicDetails] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useAddExamBasicDetailsMutation,
  });
  const [updateExamBasicDetails] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUpdateExamBasicDetailsMutation,
  });
  const [updateExamSchedule] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUpdateExamScheduleMutation,
  });
  const [updateExamRoomAssignment] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUpdateExamRoomAssignmentMutation,
  });

  const handleBasicDetails = useCallback(
    async (values: any, formik: any) => {
      const payload = serializeBasicDetailsPayload(values);
      if (editData || values.examId) {
        return updateExamBasicDetails({
          examId: editData?.examId || values.examId,
          body: payload,
        }).unwrap();
      }
      const res = await addExamBasicDetails({ body: payload }).unwrap();
      formik.setFieldValue('examId', res?.id);
      return res;
    },
    [addExamBasicDetails, editData, updateExamBasicDetails]
  );

  const handleExamSchedule = useCallback(
    async (values: any) => {
      const payload = serializeSchedulePayload(values);
      return updateExamSchedule({
        examId: editData?.examId || values.examId,
        body: payload,
      }).unwrap();
    },
    [editData, updateExamSchedule]
  );

  const handleRoomAssignment = useCallback(
    async (values: any) => {
      const payload = serializeRoomAssignmentPayload(values);
      return updateExamRoomAssignment({
        examId: editData?.examId || values.examId,
        body: payload,
      }).unwrap();
    },
    [editData, updateExamRoomAssignment]
  );

  const handleSave = useCallback(
    async (
      isLastStep: boolean,
      values: any,
      formik: any,
      setIsLoading: (val: boolean) => void,
      isSaveButton: boolean = false
    ) => {
      try {
        setIsLoading(true);
        if (activeStep === 0) {
          await handleBasicDetails(values, formik);
          shikshaMitraToast.success({ message: 'Basic details saved successfully' });
        } else if (activeStep === 1) {
          await handleExamSchedule(values);
          shikshaMitraToast.success({ message: 'Exam schedule saved successfully' });
        } else if (activeStep === 2) {
          await handleRoomAssignment(values);
          shikshaMitraToast.success({ message: 'Room assignments saved successfully' });
        }
        if (isSaveButton) {
          return;
        }
        if (!isLastStep) {
          setActiveStep((prev) => prev + 1);
        } else {
          onClose();
        }
      } catch (error) {
        console.error('Error saving exam details:', error);
      } finally {
        setIsLoading(false);
      }
    },
    [activeStep, handleBasicDetails, handleExamSchedule, handleRoomAssignment, onClose]
  );

  const allSteps = [SelectExam, ExamDetails, RoomDetails, ExamReviewStep4];

  return (
    <CustomStepperWithFormik
      initialValues={{ ...defaultExamFormValues, examId: editData?.examId || '' }}
      steps={steps}
      activeStep={activeStep}
      handleBack={() => setActiveStep((prev) => prev - 1)}
      validateOnChange={false}
      validationSchema={stepValidationSchemas[activeStep]}
      handleNext={(isLastStep, values, formik, setIsLoading) => {
        handleSave(isLastStep, values, formik, setIsLoading, false);
      }}
      onSave={(isLastStep, values, formik, setIsLoading) => {
        handleSave(isLastStep, values, formik, setIsLoading, true);
      }}
      onStepClick={(index) => {
        if (editData) {
          setActiveStep(index);
        } else if (index < activeStep) {
          setActiveStep(index);
        }
      }}
      isDisabledLabel={!editData}
      renderItem={({ formik, activeStep: step }) => (
        <NewExamStepForm
          activeStep={step}
          formik={formik}
          editData={editData}
          allSteps={allSteps}
          setActiveStep={setActiveStep}
        />
      )}
    />
  );
};

export default NewExamForm;

// ---------------------------------------------------------------------------
// NewExamStepForm: In EDIT mode, loads all backend data in parallel and
// initializes Formik once via mapBackendToFormik.
// In CREATE mode, skips all backend queries — subjects are already set by Step 1.
// ---------------------------------------------------------------------------
const NewExamStepForm = ({ activeStep: step, formik, editData, allSteps, setActiveStep }: any) => {
  const initializedRef = useRef(false);
  const isEditMode = !!editData?.examId;
  const examId = editData?.examId || formik.values.examId;

  // Fetch exam types to resolve the display name from the ID (needed in edit mode)
  const { currentMedium: medium } = useSelector((state: RootState) => state.globalState);
  const { data: examTypeData } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetExaminationTypesQuery,
    params: { academicMediumId: (medium as any)?.id },
    options: { skip: !(medium as any)?.id },
  });

  // Only fire queries in EDIT mode. In CREATE mode, formik already has correct
  // subject data (with names/colors) from the Autocomplete — querying the backend
  // would overwrite it with bare IDs that have no display info.
  const { data: basicDetails, isLoading: basicLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetExamBasicDetailsQuery,
    params: { examId },
    options: { skip: !examId || !isEditMode },
  });

  const { data: scheduleDetails, isLoading: scheduleLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetExamScheduleQuery,
    params: { examId },
    options: { skip: !examId || !isEditMode },
  });

  const { data: roomAssignmentData, isLoading: roomLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetExamRoomAssignmentsQuery,
    params: { examId },
    options: { skip: !examId || !isEditMode },
  });

  // Fetch exam subjects to get names/colors (needed when schedule hasn't been set yet)
  const { data: examSubjectsData, isLoading: subjectsLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetExamSubjectsQuery,
    params: { examId },
    options: { skip: !examId },
  });

  // EDIT mode only: initialize Formik once all queries finish loading.
  // Only basicDetails is required — schedule/rooms may be empty for new exams.
  useEffect(() => {
    if (!isEditMode || !examId) return;
    if (basicLoading || scheduleLoading || roomLoading || subjectsLoading) return;
    if (!basicDetails) return;

    const merged = mapBackendToFormik(
      basicDetails,
      scheduleDetails ?? null,
      roomAssignmentData ?? null,
      examSubjectsData ?? null,
      examTypeData?.items ?? []
    );
    formik.setValues(merged);
    initializedRef.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    basicDetails,
    scheduleDetails,
    roomAssignmentData,
    examSubjectsData,
    basicLoading,
    scheduleLoading,
    roomLoading,
    subjectsLoading,
    examId,
    isEditMode,
  ]);

  if (isEditMode && examId && (basicLoading || scheduleLoading || roomLoading || subjectsLoading)) {
    return <LoadingScreen />;
  }

  const StepComponent = allSteps[step];
  return (
    <BackPopUpChecked initialValues={formik.initialValues} currentValues={formik.values}>
      <Box>
        {/* NON-BREAKING: Step progress indicator */}
        <Box sx={{ px: 2, pt: 1.5, pb: 0.5 }}>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 0.75,
            }}
          >
            <Typography
              variant="caption"
              color="text.secondary"
              fontWeight={600}
              letterSpacing={0.4}
            >
              Step {step + 1} of 4 &bull; {steps[step]}
            </Typography>
            <Typography variant="caption" color="primary.main" fontWeight={700}>
              {Math.round(((step + 1) / 4) * 100)}%
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={((step + 1) / 4) * 100}
            sx={{ height: 3, borderRadius: 2, bgcolor: 'grey.200' }}
          />
        </Box>

        {/* NON-BREAKING: Persistent context chips — visible from Step 2 onwards */}
        <ExamContextHeader formik={formik} step={step} />

        <Box p={2}>
          {/* NON-BREAKING: Pass onEditStep to Review step for section-level edit links */}
          <StepComponent {...formik} onEditStep={step === 3 ? setActiveStep : undefined} />
        </Box>
      </Box>
    </BackPopUpChecked>
  );
};

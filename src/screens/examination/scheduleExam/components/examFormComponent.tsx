import type { RootState } from 'src/redux/store';

import { Box } from '@mui/material';
import { useSelector } from 'react-redux';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { shikshaMitraToast } from 'src/components/toast';
import { LoadingScreen } from 'src/components/loading-screen';
import { useRef, useState, useEffect, useCallback } from 'react';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import { CustomStepperWithFormik } from 'src/components/custom-stepper';
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
import { ExamContextHeader } from './ExamContextHeader';
import {
  fullExamValidationSchema,
  validationSchema as stepValidationSchemas,
} from '../validationSchema';
import {
  mapBackendToFormik,
  defaultExamFormValues,
  serializeSchedulePayload,
  serializeBasicDetailsPayload,
  serializeRoomAssignmentPayload,
} from './initialValues';

import type { INewExamFormProps } from '../type';

const steps = ['Basic Details', 'Schedule', 'Room Details', 'Review'];

const NewExamForm = ({ onClose, editData, onBusyChange }: INewExamFormProps) => {
  const [activeStep, setActiveStep] = useState(0);
  const [maxReachedStep, setMaxReachedStep] = useState(0);
  const [isNavigating, setIsNavigating] = useState(false);

  // Mutations
  const [addExamBasicDetails] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useAddExamBasicDetailsMutation,
    popupConfig: { error: false },
  });
  const [updateExamBasicDetails] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUpdateExamBasicDetailsMutation,
    popupConfig: { error: false },
  });
  const [updateExamSchedule] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUpdateExamScheduleMutation,
    popupConfig: { error: false },
  });
  const [updateExamRoomAssignment] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUpdateExamRoomAssignmentMutation,
    popupConfig: { error: false },
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
        onBusyChange?.(true);
        if (activeStep === 0) {
          await handleBasicDetails(values, formik);
          shikshaMitraToast.success({ message: 'Basic details saved successfully' });
        } else if (activeStep === 1) {
          await handleExamSchedule(values);
          shikshaMitraToast.success({ message: 'Exam schedule saved successfully' });
        } else if (activeStep === 2) {
          await handleRoomAssignment(values);
          if (values.isRoomAssign) {
            shikshaMitraToast.success({ message: 'Room assignments saved successfully' });
          }
        }
        if (isSaveButton) {
          return true;
        }
        if (!isLastStep) {
          setActiveStep((prev) => {
            const nextStep = prev + 1;
            setMaxReachedStep((reachedStep) => Math.max(reachedStep, nextStep));
            return nextStep;
          });
        } else {
          shikshaMitraToast.success({
            message: 'Exam draft is ready. Use Publish exam in the list when you are ready.',
          });
          onClose();
        }
        return true;
      } catch (error) {
        const parsed = parseApiProblemDetail(error);
        shikshaMitraToast.error({
          message:
            parsed.detail || 'Unable to save the exam. Please review the details and try again.',
        });
        return false;
      } finally {
        setIsLoading(false);
        onBusyChange?.(false);
      }
    },
    [
      activeStep,
      handleBasicDetails,
      handleExamSchedule,
      handleRoomAssignment,
      onClose,
      onBusyChange,
    ]
  );

  const allSteps = [SelectExam, ExamDetails, RoomDetails, ExamReviewStep4];

  return (
    <Box
      sx={(theme) => ({
        width: '100%',
        height: '100%',
        minHeight: 0,
        minWidth: 0,
        '& .MuiStepper-root': {
          pt: 2,
          pb: 1.5,
          '& .MuiStep-root': { px: { xs: 0, sm: 1 } },
          '& .MuiStepButton-root': { px: { xs: 0.25, sm: 1 } },
        },
        '& .MuiFormLabel-root.Mui-error, & .MuiFormHelperText-root.Mui-error': {
          color: 'error.dark',
          ...theme.applyStyles('dark', { color: 'error.light' }),
        },
        '& .MuiFormLabel-root.Mui-error.Mui-disabled': {
          color: `${theme.vars.palette.error.dark} !important`,
          ...theme.applyStyles('dark', { color: `${theme.vars.palette.error.light} !important` }),
        },
      })}
    >
      <CustomStepperWithFormik
        initialValues={{ ...defaultExamFormValues, examId: editData?.examId || '' }}
        steps={steps}
        activeStep={activeStep}
        handleBack={() => setActiveStep((prev) => prev - 1)}
        validateOnChange={false}
        validationSchema={
          activeStep === 3 ? fullExamValidationSchema : stepValidationSchemas[activeStep]
        }
        validateForwardStepClick
        showSaveButton={activeStep !== steps.length - 1}
        finalButtonLabel="Finish setup"
        saveButtonLabel="Save draft"
        nextButtonLabel="Save & next"
        saveButtonProps={{
          color: 'inherit',
          loading: isNavigating,
          startIcon: <Iconify icon={GlobalIcons.draftIcon} />,
        }}
        handleNext={(isLastStep, values, formik, setIsLoading) =>
          handleSave(isLastStep, values, formik, setIsLoading, false)
        }
        onSave={(isLastStep, values, formik, setIsLoading) => {
          handleSave(isLastStep, values, formik, setIsLoading, true);
        }}
        onStepClick={async (index, _label, formik) => {
          if (editData || index <= maxReachedStep) {
            if (index > activeStep) {
              const saved = await handleSave(false, formik.values, formik, setIsNavigating, true);
              if (!saved) return;
            }
            setActiveStep(index);
          }
        }}
        isStepClickable={(index) => Boolean(editData) || index <= maxReachedStep}
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
    </Box>
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
    if (initializedRef.current) return;
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

        {/* NON-BREAKING: Persistent context chips — visible from Step 2 onwards */}
        <ExamContextHeader values={formik.values} step={step} />

        <Box sx={{ p: { xs: 1.5, sm: 2 }, minWidth: 0 }}>
          {/* NON-BREAKING: Pass onEditStep to Review step for section-level edit links */}
          <StepComponent {...formik} onEditStep={step === 3 ? setActiveStep : undefined} />
        </Box>
      </Box>
    </BackPopUpChecked>
  );
};

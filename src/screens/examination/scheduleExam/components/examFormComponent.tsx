import * as Yup from 'yup';
import { Box } from '@mui/material';
import { shikshaMitraToast } from 'src/components/toast';
import { LoadingScreen } from 'src/components/loading-screen';
import { useRef, useState, useEffect, useCallback } from 'react';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { CustomStepperWithFormik } from 'src/components/custom-stepper';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';
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
import {
  mapBackendToFormik,
  defaultExamFormValues,
  serializeSchedulePayload,
  serializeBasicDetailsPayload,
  serializeRoomAssignmentPayload,
} from './initialValues';

import type { INewExamFormProps } from '../type';

const steps = ['Basic Details', 'Schedule', 'Room Details', 'Review'];

const NewExamForm = ({ onClose, editData }: INewExamFormProps) => {
  console.log('Edit Data in NewExamForm:', editData);
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
      return updateExamSchedule({ examId: values.examId, body: payload }).unwrap();
    },
    [updateExamSchedule]
  );

  const handleRoomAssignment = useCallback(
    async (values: any) => {
      const payload = serializeRoomAssignmentPayload(values);
      return updateExamRoomAssignment({ examId: values.examId, body: payload }).unwrap();
    },
    [updateExamRoomAssignment]
  );

  const handleSave = useCallback(
    async (isLastStep: boolean, values: any, formik: any, setIsLoading: (val: boolean) => void) => {
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
      validationSchema={Yup.object().shape({})}
      handleNext={(isLastStep, values, formik, setIsLoading) => {
        handleSave(isLastStep, values, formik, setIsLoading);
      }}
      onSave={(isLastStep, values, formik, setIsLoading) => {
        handleSave(isLastStep, values, formik, setIsLoading);
      }}
      renderItem={({ formik, activeStep: step }) => (
        <NewExamStepForm
          activeStep={step}
          formik={formik}
          editData={editData}
          allSteps={allSteps}
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
const NewExamStepForm = ({ activeStep: step, formik, editData, allSteps }: any) => {
  const initializedRef = useRef(false);
  const isEditMode = !!editData?.examId;
  const examId = editData?.examId || formik.values.examId;
  console.log('Exam ID in NewExamStepForm:', examId);

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
    options: { skip: !examId || step !== 1 },
  });

  const { data: roomAssignmentData, isLoading: roomLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetExamRoomAssignmentsQuery,
    params: { examId },
    options: { skip: !examId || step !== 2 },
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
    if (!isEditMode || !examId || initializedRef.current) return;
    if (basicLoading || scheduleLoading || roomLoading || subjectsLoading) return;
    if (!basicDetails) return;

    const merged = mapBackendToFormik(
      basicDetails,
      scheduleDetails ?? null,
      roomAssignmentData ?? null,
      examSubjectsData ?? null
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
      <Box p={2} height="100%">
        <StepComponent {...formik} />
      </Box>
    </BackPopUpChecked>
  );
};

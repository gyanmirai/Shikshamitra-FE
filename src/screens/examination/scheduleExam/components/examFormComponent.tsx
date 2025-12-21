import type { RootState } from 'src/redux/store';

import { Box } from '@mui/material';
import { useSelector } from 'react-redux';
import { useState, useCallback } from 'react';
import { shikshaMitraToast } from 'src/components/toast';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { CustomStepperWithFormik } from 'src/components/custom-stepper';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';
import {
  useUpdateExamScheduleMutation,
  useAddExamBasicDetailsMutation,
  useUpdateExamRoomAssignmentMutation,
} from 'src/redux/academicAPI/ExaminationApi/ScheduleExamApi/schedule-examApi';

import SelectExam from './selectExamStep1';
import RoomDetails from './roomManageStep3';
import ExamDetails from './examDetailsStep2';
import ExamReviewStep4 from './ExamReviewStep4';
import { validationSchema } from '../validationSchema';

import type { INewExamFormProps } from '../type';

const NewExamForm = ({ onClose, editData }: INewExamFormProps) => {
  // State to track the current active step in the multi-step exam creation form
  // 0: Basic Details, 1: Schedule, 2: Room Details
  const [activeStep, setActiveStep] = useState(0);

  const { currentMedium: medium } = useSelector((state: RootState) => state.globalState);

  // Hook for adding basic exam details
  const [addExamBasicDetails] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useAddExamBasicDetailsMutation,
    isThrowError: true,
  });

  // Hook for updating exam schedule
  const [updateExamSchedule] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUpdateExamScheduleMutation,
    isThrowError: true,
  });

  // Hook for updating room assignments
  const [updateExamRoomAssignment] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUpdateExamRoomAssignmentMutation,
    isThrowError: true,
  });

  // Handler for Step 0: Basic Details
  const handleBasicDetails = useCallback(
    async (values: any, formik: any) => {
      const payload = {
        examType: values.examType,
        name: values.examName,
        standardId: values.className,
        divisionIds: values.divisions,
        subjectIds: values.selectedSubjects, // Assuming this is an array of subject IDs
        description: values.description,
      };

      const res = await addExamBasicDetails({
        academicMediumId: medium?.id,
        body: payload,
      }).unwrap();

      // Save the returned examId for subsequent steps
      formik.setFieldValue('examId', res.id);
      // You might also want to populate subjects detailed list here based on response if needed
      // formik.setFieldValue('subjects', res.subjects); // Example if backend returns subjects structure

      return res;
    },
    [addExamBasicDetails, medium?.id]
  );

  // Handler for Step 1: Exam Schedule
  const handleExamSchedule = useCallback(
    async (values: any, formik: any) => {
      const payload = {
        subjects: values.subjects.map((sub: any) => ({
          subjectId: sub.id,
          examDate: sub.examDate ? sub.examDate.format('YYYY-MM-DD') : null,
          startTime: sub.startTime ? sub.startTime.format('HH:mm') : null,
          endTime: sub.endTime ? sub.endTime.format('HH:mm') : null,
          totalMarks: Number(sub.totalMarks),
          passingMarks: Number(sub.passingMarks),
          notes: sub.notes,
        })),
      };

      const res = await updateExamSchedule({
        examId: values.examId,
        body: payload,
      }).unwrap();
      return res;
    },
    [updateExamSchedule]
  );

  // Handler for Step 2: Room Assignment
  const handleRoomAssignment = useCallback(
    async (values: any, formik: any) => {
      // Transform roomDetails into expected API payload format
      const assignments: any[] = [];
      if (values.roomDetails) {
        Object.entries(values.roomDetails).forEach(([subjectName, details]: [string, any]) => {
          // Try to find subjectId from details or look it up in values.subjects
          let { subjectId } = details;
          if (!subjectId && values.subjects) {
            const subject = values.subjects.find((s: any) => s.subjectName === subjectName);
            if (subject) {
              subjectId = subject.id;
            }
          }

          if (details.divisions && subjectId) {
            Object.entries(details.divisions).forEach(([divisionId, divData]: [string, any]) => {
              if (divData.roomIds && divData.roomIds.length > 0) {
                assignments.push({
                  subjectId,
                  divisionId,
                  roomIds: divData.roomIds,
                });
              }
            });
          }
        });
      }

      // Payload structure for room allocations
      const payload = {
        roomAllocations: assignments,
      };

      const res = await updateExamRoomAssignment({
        examId: values.examId,
        body: payload,
      }).unwrap();
      return res;
    },
    [updateExamRoomAssignment]
  );

  // Unified Save Handler
  const handleSave = useCallback(
    async (isLastStep: boolean, values: any, formik: any, setIsLoading: (val: boolean) => void) => {
      try {
        setIsLoading(true);

        if (activeStep === 0) {
          await handleBasicDetails(values, formik);
          shikshaMitraToast.success({ message: 'Basic details saved successfully' });
        } else if (activeStep === 1) {
          await handleExamSchedule(values, formik);
          shikshaMitraToast.success({ message: 'Exam schedule saved successfully' });
        } else if (activeStep === 2) {
          if (values.isRoomAssign) {
            await handleRoomAssignment(values, formik);
            shikshaMitraToast.success({ message: 'Room assignments saved successfully' });
          }
        }

        if (!isLastStep) {
          setActiveStep(activeStep + 1);
        } else {
          // Final step (Review) logic if any, or just close
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

  // Array of step components that correspond to each step in the exam creation process
  // Used to dynamically render the appropriate component based on activeStep
  const allTimetableSteps = [SelectExam, ExamDetails, RoomDetails, ExamReviewStep4];

  return (
    <CustomStepperWithFormik
      scrollbarHeight="400px"
      initialValues={{
        examType: '',
        examName: '',
        className: '',
        divisions: [],
        selectedSubjects: [], // dropdown selection
        subjects: [], // full details with timings
        description: '',
        isRoomAssign: false,
        roomDetails: {},
        examId: '', // To store the created exam ID
      }}
      steps={['Basic Details', 'Schedule', 'Room Details', 'Review']}
      activeStep={activeStep}
      handleBack={() => {
        setActiveStep(activeStep - 1);
      }}
      validateOnChange={false}
      validationSchema={validationSchema[activeStep as keyof typeof validationSchema]}
      handleNext={(isLastStep, values, formik, setIsLoading) => {
        handleSave(isLastStep, values, formik, setIsLoading);
      }}
      renderItem={({ formik, activeStep: step }) => {
        const StepComponent = allTimetableSteps[step];
        return (
          <BackPopUpChecked initialValues={formik.initialValues} currentValues={formik.values}>
            <Box p={2}>
              <StepComponent {...formik} />
            </Box>
          </BackPopUpChecked>
        );
      }}
    />
  );
};

export default NewExamForm;

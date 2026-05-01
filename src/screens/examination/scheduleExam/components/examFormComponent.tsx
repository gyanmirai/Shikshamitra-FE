import { Box } from '@mui/material';
import { shikshaMitraToast } from 'src/components/toast';
import { LoadingScreen } from 'src/components/loading-screen';
import { useRef, useState, useEffect, useCallback } from 'react';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { CustomStepperWithFormik } from 'src/components/custom-stepper';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';
import {
  useGetExamScheduleQuery,
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
import { validationSchema } from '../validationSchema';
import {
  scheduleInitialValues,
  basicDetailsInitialValues,
  roomAssignmentInitialValues,
} from './initialValues';

import type { INewExamFormProps } from '../type';

const steps = ['Basic Details', 'Schedule', 'Room Details', 'Review'];

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
      const payload = {
        examTypeId: values.examType,
        examName: values.examName,
        standardId: values.className,
        divisionIds: values.divisions,
        subjectIds: values.selectedSubjects.map(
          (sub: any) => sub.electiveGroupId || sub?.subjects?.[0]?.subjectId
        ),
      };
      if (editData || values.examId) {
        const res = await updateExamBasicDetails({
          examId: editData?.id || values.examId,
          body: payload,
        }).unwrap();
        return res;
      }
      const res = await addExamBasicDetails({
        body: payload,
      }).unwrap();

      formik.setFieldValue('examId', res?.id);
      return res;
    },
    [addExamBasicDetails, editData, updateExamBasicDetails]
  );

  const handleExamSchedule = useCallback(
    async (values: any, formik: any) => {
      const payload = {
        subjects: values.subjects.map((sub: any) => ({
          subjectId: sub.id || sub.subjectId,
          examDate: sub.examDate ? sub.examDate.toISOString() : null,
          startTime: sub.startTime ? sub.startTime.toISOString() : null,
          endTime: sub.endTime ? sub.endTime.toISOString() : null,
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

  const handleRoomAssignment = useCallback(
    async (values: any, formik: any) => {
      const assignments = values.subjects.map((sub: any) => {
        const subjectRoomDetails = values.roomDetails?.[sub.subjectName]?.divisions || {};
        const divisions = values.divisions.map((divId: string) => {
          const divRoomData = subjectRoomDetails[divId];
          return {
            divisionId: divId,
            roomIds: divRoomData?.roomIds || [],
            capacity: divRoomData?.capacity || 0,
          };
        });
        return {
          subjectId: sub.id || sub.subjectId,
          examDate: sub.examDate ? sub.examDate.toISOString() : null,
          divisions,
        };
      });

      const payload = {
        isRoomAssigned: values.isRoomAssign,
        subjects: assignments,
      };

      const res = await updateExamRoomAssignment({
        examId: values.examId,
        body: payload,
      }).unwrap();
      return res;
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
          await handleExamSchedule(values, formik);
          shikshaMitraToast.success({ message: 'Exam schedule saved successfully' });
        } else if (activeStep === 2) {
          await handleRoomAssignment(values, formik);
          shikshaMitraToast.success({ message: 'Room assignments saved successfully' });
        }

        if (!isLastStep) {
          setActiveStep(activeStep + 1);
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

  const allTimetableSteps = [SelectExam, ExamDetails, RoomDetails, ExamReviewStep4];

  return (
    <CustomStepperWithFormik
      initialValues={{
        examType: '',
        examName: '',
        className: '',
        divisions: [],
        selectedSubjects: [],
        subjects: [],
        description: '',
        isRoomAssign: false,
        roomDetails: {},
        examId: editData?.id || '',
      }}
      steps={steps}
      activeStep={activeStep}
      handleBack={() => {
        setActiveStep(activeStep - 1);
      }}
      validateOnChange={false}
      validationSchema={validationSchema[activeStep as keyof typeof validationSchema]}
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
          allSteps={allTimetableSteps}
        />
      )}
    />
  );
};

export default NewExamForm;

const NewExamStepForm = ({ activeStep: step, formik, editData, allSteps }: any) => {
  const initializedStepsRef = useRef<Record<number, boolean>>({});
  const examId = editData?.id || formik.values.examId;

  const { data: basicDetails, isLoading: basicLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetExamBasicDetailsQuery,
    params: { examId },
    options: { skip: !examId || step !== 0 },
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

  useEffect(() => {
    if (initializedStepsRef.current[step]) return;

    if (basicDetails && step === 0) {
      formik.setValues((pre: any) => ({
        ...pre,
        ...basicDetailsInitialValues(basicDetails),
      }));
      initializedStepsRef.current[step] = true;
    } else if (scheduleDetails && step === 1) {
      const { subjects } = scheduleInitialValues(scheduleDetails);
      formik.setFieldValue('subjects', subjects);
      initializedStepsRef.current[step] = true;
    } else if (roomAssignmentData && step === 2) {
      const roomVals = roomAssignmentInitialValues(roomAssignmentData, formik.values.subjects);
      formik.setFieldValue('isRoomAssign', roomVals.isRoomAssign);
      formik.setFieldValue('roomDetails', roomVals.roomDetails);
      initializedStepsRef.current[step] = true;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [basicDetails, scheduleDetails, roomAssignmentData, step]);

  if (basicLoading || scheduleLoading || roomLoading) {
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

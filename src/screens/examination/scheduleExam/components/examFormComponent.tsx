import { useState } from 'react';
import { Box } from '@mui/material';
import { CustomStepperWithFormik } from 'src/components/custom-stepper';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';

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
      }}
      steps={['Basic Details', 'Schedule', 'Room Details', 'Review']}
      activeStep={activeStep}
      handleBack={() => {
        setActiveStep(activeStep - 1);
      }}
      validateOnChange={false}
      validationSchema={validationSchema[activeStep as keyof typeof validationSchema]}
      handleNext={(isLastStep, _values) => {
        if (isLastStep) return;
        setActiveStep(activeStep + 1);
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

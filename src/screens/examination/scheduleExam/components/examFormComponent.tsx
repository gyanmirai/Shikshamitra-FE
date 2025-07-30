import { useState } from 'react';

import { Box } from '@mui/material';

import { CustomStepperWithFormik } from 'src/components/custom-stepper';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';

import SelectExam from './selectExamStep1';
import RoomDetails from './roomManageStep3';
import ExamDetails from './examDetailsStep2';
// import ExamDetails from './ExamDetailsStep2';
import { validationSchema } from '../validationSchema';

import type { INewExamFormProps } from '../type';
// import ExamDetails from './examDetailsStep2';
// import RoomDetails from './roomManageStep3';
// import SelectExam from './selectExamStep1';

const NewExamForm = ({ onClose, editData }: INewExamFormProps) => {
  // Active step for stepper navigation
  const [activeStep, setActiveStep] = useState(0);
  const allTimetableSteps = [SelectExam, ExamDetails, RoomDetails];

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
      steps={['Basic Details', 'Schedule', 'Room Details']}
      activeStep={activeStep}
      handleBack={() => {
        setActiveStep(activeStep - 1);
      }}
      validateOnChange={false}
      validationSchema={validationSchema[activeStep as keyof typeof validationSchema]}
      // validationSchema={yup.object().shape({})}
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

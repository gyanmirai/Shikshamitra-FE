import { useState } from 'react';

import { Box } from '@mui/material';

import { CustomStepperWithFormik } from 'src/components/custom-stepper';

import SelectExam from './selectExamStep1';
import ExamDetails from './examDetailsStep2';
import AssignTeachers from './assignTeacherStep4';
import { validationSchema } from '../validationSchema';
import EvaluationCriteria from './evaluationCriteriaStep3';

import type { INewExamFormProps } from '../type';

const NewExamForm = ({ onClose, editData }: INewExamFormProps) => {
  // Active step for stepper navigation
  const [activeStep, setActiveStep] = useState(0);
  const allTimetableSteps = [SelectExam, ExamDetails, EvaluationCriteria, AssignTeachers];

  return (
    <CustomStepperWithFormik
      scrollbarHeight="400px"
      initialValues={{
        examType: '',
        examName: '',
        className: '',
        divisions: [],
        subjects: [],
        description: '',
      }}
      steps={['Select Exam Type', 'Exam Details', 'Evaluation Criteria', 'Assign Teacher & Review']}
      activeStep={activeStep}
      handleBack={() => {
        setActiveStep(activeStep - 1);
      }}
      validationSchema={validationSchema[activeStep as keyof typeof validationSchema]}
      // validationSchema={yup.object().shape({})}
      handleNext={(isLastStep, _values) => {
        if (isLastStep) return;
        setActiveStep(activeStep + 1);
      }}
      renderItem={({ formik, activeStep: step }) => {
        const StepComponent = allTimetableSteps[step];
        return (
          <Box p={2}>
            <StepComponent {...formik} />
          </Box>
        );
      }}
    />
  );
};

export default NewExamForm;

'use client';

import React from 'react';
import * as yup from 'yup';

import { Box, TextField, Autocomplete } from '@mui/material';

import { useGetBoardsQuery } from 'src/redux/board/boardApi';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { useGetEmployeeQuery } from 'src/redux/employee/employeeApi';

import { CustomStepperWithFormik } from 'src/components/custom-stepper';

const renderItem = {
  0: (props: any) => <UserScreenStep {...props} />,
  1: (props: any) => <BoardScreenStep {...props} />,
  2: (props: any) => <MediumScreenStep {...props} />,
  3: (props: any) => <OrganizationScreenStep {...props} />,
  4: (props: any) => <ClassScreenStep {...props} />,
  5: (props: any) => <DivisionScreenStep {...props} />,
};

const initialValues = {
  user: null,
};

const validationSchema = {
  0: yup.object().shape({
    user: yup
      .object({ firstName: yup.string().required('User is required') })
      .required('User is required'),
  }),
  1: yup.object().shape({
    board: yup
      .object({ name: yup.string().required('board is required') })
      .required('board is required'),
  }),
  2: yup.object().shape({
    medium: yup
      .object({ name: yup.string().required('medium is required') })
      .required('medium is required'),
  }),
  3: yup.object().shape({
    organization: yup
      .object({ name: yup.string().required('organization is required') })
      .required('organization is required'),
  }),
  4: yup.object().shape({
    class: yup
      .object({ name: yup.string().required('class is required') })
      .required('class is required'),
  }),
  5: yup.object().shape({
    division: yup
      .object({ name: yup.string().required('division is required') })
      .required('division is required'),
  }),
};

const AccessControlScreen = () => {
  const [activeStep, setActiveStep] = React.useState(0);
  return (
    <CustomStepperWithFormik
      initialValues={initialValues}
      steps={[
        'Select User',
        'Select Board',
        'Select Medium',
        'Select Organization',
        'Select Class',
        'Select Division',
      ]}
      activeStep={activeStep}
      handleBack={() => {
        setActiveStep(activeStep - 1);
      }}
      validationSchema={validationSchema[activeStep as keyof typeof validationSchema]}
      handleNext={(isLastStep, values) => {
        if (isLastStep) return;

        setActiveStep(activeStep + 1);
      }}
      renderItem={({ activeStep: step, formik }: any) => (
        <Box p={2}>
          {' '}
          {renderItem[step as keyof typeof renderItem]({ activeStep: step, formik })}
        </Box>
      )}
    />
  );
};

export default AccessControlScreen;

const UserScreenStep = ({ formik }: any) => {
  const { data: employees, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetEmployeeQuery,
  });
  return (
    <Autocomplete
      options={employees?.items || []}
      getOptionLabel={(option: any) => `${option.lastName} ${option.firstName}`}
      id="employees"
      value={formik.values.user}
      loading={isLoading}
      sx={{ maxWidth: 300, width: '100%' }}
      onChange={(event: any, newValue: any | null) => {
        formik.setFieldValue('user', newValue);
      }}
      size="small"
      renderInput={(params) => (
        <TextField
          {...params}
          size="small"
          label="Select Employee"
          helperText={formik.touched.user && formik.errors.user}
          error={formik.touched.user && Boolean(formik.errors.user)}
        />
      )}
    />
  );
};

const BoardScreenStep = ({ formik }: any) => {
  const { data: boards, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetBoardsQuery,
  });
  return (
    <Autocomplete
      options={boards?.items || []}
      getOptionLabel={(option: any) => option.name}
      id="controlled-demo"
      value={formik.values.board}
      loading={isLoading}
      sx={{ maxWidth: 300, width: '100%' }}
      onChange={(event: any, newValue: any | null) => {
        formik.setFieldValue('board', newValue);
      }}
      size="small"
      renderInput={(params) => (
        <TextField
          {...params}
          size="small"
          label="Select Board"
          helperText={formik.touched.board && formik.errors.board}
          error={formik.touched.board && Boolean(formik.errors.board)}
        />
      )}
    />
  );
};

const MediumScreenStep = ({ formik }: any) => (
  <Autocomplete
    options={formik.values.board?.educationMediums || []}
    getOptionLabel={(option: any) => option.name}
    id="controlled-demo"
    value={formik.values.medium}
    loading={false}
    sx={{ maxWidth: 300, width: '100%' }}
    onChange={(event: any, newValue: any | null) => {
      formik.setFieldValue('medium', newValue);
    }}
    size="small"
    renderInput={(params) => (
      <TextField
        {...params}
        size="small"
        label="Select Medium"
        helperText={formik.touched.medium && formik.errors.medium}
        error={formik.touched.medium && Boolean(formik.errors.medium)}
      />
    )}
  />
);

const OrganizationScreenStep = ({ formik }: any) => (
  <Autocomplete
    options={formik.values.medium?.educationMediumStages || []}
    getOptionLabel={(option: any) => option.name}
    id="controlled-demo"
    value={formik.values.organization}
    loading={false}
    sx={{ maxWidth: 300, width: '100%' }}
    onChange={(event: any, newValue: any | null) => {
      formik.setFieldValue('organization', newValue);
    }}
    size="small"
    renderInput={(params) => (
      <TextField
        {...params}
        size="small"
        label="Select Organization"
        helperText={formik.touched.organization && formik.errors.organization}
        error={formik.touched.organization && Boolean(formik.errors.organization)}
      />
    )}
  />
);

const ClassScreenStep = ({ formik }: any) => (
  <Autocomplete
    options={formik.values.organization?.standards || []}
    getOptionLabel={(option: any) => option.name}
    id="controlled-demo"
    value={formik.values.class}
    loading={false}
    sx={{ maxWidth: 300, width: '100%' }}
    onChange={(event: any, newValue: any | null) => {
      formik.setFieldValue('class', newValue);
    }}
    size="small"
    renderInput={(params) => (
      <TextField
        {...params}
        size="small"
        label="Select Class"
        helperText={formik.touched.class && formik.errors.class}
        error={formik.touched.class && Boolean(formik.errors.class)}
      />
    )}
  />
);

const DivisionScreenStep = ({ formik }: any) => (
  <Autocomplete
    options={formik.values.class?.divisions || []}
    getOptionLabel={(option: any) => option.name}
    id="controlled-demo"
    value={formik.values.division}
    loading={false}
    sx={{ maxWidth: 300, width: '100%' }}
    onChange={(event: any, newValue: any | null) => {
      formik.setFieldValue('division', newValue);
    }}
    size="small"
    renderInput={(params) => (
      <TextField
        {...params}
        size="small"
        label="Select Division"
        helperText={formik.touched.division && formik.errors.division}
        error={formik.touched.division && Boolean(formik.errors.division)}
      />
    )}
  />
);

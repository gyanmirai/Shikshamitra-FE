'use client';

import type { RootState } from 'src/redux/store';
import type { Board, Medium, Division, Standards, Organization } from 'src/types/school';

import React from 'react';
import * as yup from 'yup';
import { useSelector } from 'react-redux';

import { Box, Button, TextField, Autocomplete } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { useGetBoardsQuery } from 'src/redux/board/boardApi';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import {
  useGetEmployeeQuery,
  useGetAccessControlQuery,
  useAddAccessControlMutation,
} from 'src/redux/employee/employeeApi';

import CustomDialog from 'src/components/customDialog';
import CustomizableTable from 'src/components/customizabaleTable';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { CustomStepperWithFormik } from 'src/components/custom-stepper';

const renderItem = {
  // 0: (props: any) => <UserScreenStep {...props} />,
  0: (props: any) => <BoardScreenStep {...props} />,
  1: (props: any) => <MediumScreenStep {...props} />,
  2: (props: any) => <OrganizationScreenStep {...props} />,
  3: (props: any) => <ClassScreenStep {...props} />,
  4: (props: any) => <DivisionScreenStep {...props} />,
};

// const validationSchema = {
//   0: yup.object().shape({
//     user: yup
//       .object({ firstName: yup.string().required('User is required') })
//       .required('User is required'),
//   }),
//   1: yup.object().shape({
//     board: yup
//       .object({ name: yup.string().required('board is required') })
//       .required('board is required'),
//   }),
//   2: yup.object().shape({
//     medium: yup
//       .object({ name: yup.string().required('medium is required') })
//       .required('medium is required'),
//   }),
//   3: yup.object().shape({
//     organization: yup
//       .object({ name: yup.string().required('organization is required') })
//       .required('organization is required'),
//   }),
//   4: yup.object().shape({
//     class: yup
//       .object({ name: yup.string().required('class is required') })
//       .required('class is required'),
//   }),
//   5: yup.object().shape({
//     division: yup
//       .object({ name: yup.string().required('division is required') })
//       .required('division is required'),
//   }),
// };

const AccessControlScreen = () => {
  const dialog = useBoolean();
  const { data } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetAccessControlQuery,
  });
  return (
    <Box>
      <CustomBreadcrumbs
        heading="Access Control"
        links={[{ name: 'Security' }, { name: 'Role And Permission' }, { name: 'Access Control' }]}
        sx={{ px: 1, mb: 2 }}
        action={
          <Button variant="contained" onClick={dialog.onTrue}>
            Add Access Control
          </Button>
        }
      />
      <CustomizableTable
        tableId="access-control"
        columns={[
          { id: 'employee', label: 'Employee Name' },
          { id: 'board', label: 'Employee Name' },
        ]}
        data={[]}
      />
      <CustomDialog
        maxWidth="md"
        title="Access Control"
        open={dialog.value}
        handleClose={dialog.onFalse}
      >
        <AccessControlForm />
      </CustomDialog>
    </Box>
  );
};

export const AccessControlForm = ({ user }: any) => {
  const [activeStep, setActiveStep] = React.useState(0);
  const { currentYear } = useSelector((state: RootState) => state.globalState);

  const [addAccessControl] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useAddAccessControlMutation,
    popupConfig: {
      success: true,
      successMessage: 'Access Control added successfully',
    },
  });
  const { data: accessControl, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetAccessControlQuery,
    params: user?.id,
    options: {
      skip: !user?.id,
    },
  });

  // const initial = useMemo(() => {
  //   if (!isLoading && accessControl) {
  //     const board = accessControl.educationBoards;
  //     const medium = accessControl.educationMediums.reduce((acc: any, curr: any) => {
  //       const findBoard = board.find((boar: any) => boar.id === curr.educationBoardId);
  //       acc[findBoard.id] = [...(acc[findBoard.id] || []), curr];
  //       return acc;
  //     }, {});
  //     console.log(accessControl, '🚀 ~ medium ~ medium:', medium);

  //     const organization = accessControl.educationMediumStages.reduce((acc: any, curr: any) => {
  //       const findMedium = medium[curr.educationMediumId];
  //       acc[findMedium.id] = [...(acc[findMedium.id] || []), curr];
  //       return acc;
  //     }, {});
  //     console.log('🚀 ~ organization ~ organization:', organization);

  //     const standard = accessControl.standards.reduce((acc: any, curr: any) => {
  //       const findOrganization = organization[curr.educationMediumStageId];
  //       acc[findOrganization.id] = [...(acc[findOrganization.id] || []), curr];
  //       return acc;
  //     }, {});
  //     console.log('🚀 ~ standard ~ standard:', standard);

  //     const division = accessControl.divisions.reduce((acc: any, curr: any) => {
  //       const findStandard = standard[curr.standardId];
  //       acc[findStandard.id] = [...(acc[findStandard.id] || []), curr];
  //       return acc;
  //     }, {});
  //     console.log('🚀 ~ division ~ division:', division);

  //     return {
  //       board,
  //       medium,
  //       organization,
  //       class: standard,
  //       division,
  //     };
  //   }
  //   return { board: [], medium: {}, organization: {}, class: {}, division: {} };
  // }, [accessControl, isLoading]);

  // console.log(initial, 'initial');

  const initialValues = {
    user,
    board: [],
    medium: {},
    organization: {},
    class: {},
    division: {},
  };
  return (
    <CustomStepperWithFormik
      initialValues={initialValues}
      steps={[
        // 'Select User',
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
      // validationSchema={validationSchema[activeStep as keyof typeof validationSchema]}
      validationSchema={yup.object().shape({})}
      handleNext={(isLastStep, _values) => {
        if (isLastStep) {
          // eslint-disable-next-line @typescript-eslint/no-shadow
          const { user, organization, medium, division, class: classes, board } = _values;
          const payload = {
            academicYearIds: [currentYear.id],
            educationBoardIds: board.map((b: Board) => b.id),
            educationMediumIds: Object.values(medium).flatMap((i: any) =>
              i.map((m: Medium) => m.id)
            ),
            educationMediumStageIds: Object.values(organization).flatMap((i: any) =>
              i.map((m: Organization) => m.id)
            ),
            standardIds: Object.values(classes).flatMap((i: any) => i.map((m: Standards) => m.id)),
            divisionIds: Object.values(division).flatMap((i: any) => i.map((m: Division) => m.id)),
            userId: user.id,
          };
          addAccessControl(payload);
          return;
        }

        setActiveStep(activeStep + 1);
      }}
      renderItem={({ activeStep: step, formik }: any) => {
        console.log(formik, '][][][');
        return (
          <Box p={2}>
            {' '}
            {renderItem[step as keyof typeof renderItem]({ activeStep: step, formik })}
          </Box>
        );
      }}
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
      onChange={(_event: any, newValue: any | null) => {
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
      multiple
      id="tags-standard"
      loading={isLoading}
      options={boards?.items || []}
      value={formik.values.board}
      onChange={(_event: any, newValue: any | null) => {
        formik.setFieldValue('board', newValue);
      }}
      getOptionLabel={(option: any) => option.name}
      sx={{ maxWidth: 300, width: '100%' }}
      ChipProps={{
        variant: 'outlined',
        size: 'small',
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          variant="outlined"
          size="small"
          label="Select Board"
          placeholder="Select Board"
        />
      )}
    />
  );
};

const MediumScreenStep = ({ formik }: any) => (
  <Box display="flex" gap={2} flexWrap="wrap">
    {formik.values.board.map((board: Board) => (
      <Autocomplete
        options={board.educationMediums || []}
        getOptionLabel={(option: any) => option.name}
        id="controlled-demo"
        value={formik?.values?.medium?.[board.name]}
        loading={false}
        sx={{ maxWidth: 300, width: '100%' }}
        onChange={(_event: any, newValue: any | null) => {
          formik.setFieldValue(`medium.${board.name}`, newValue);
        }}
        multiple
        ChipProps={{
          variant: 'outlined',
          size: 'small',
        }}
        size="small"
        renderInput={(params) => (
          <TextField
            {...params}
            size="small"
            label={`Select Medium for Board ${board.name}`}
            helperText={formik.touched.medium?.[board.name] && formik.errors.medium?.[board.name]}
            error={
              formik.touched.medium?.[board.name] && Boolean(formik.errors.medium?.[board.name])
            }
          />
        )}
      />
    ))}
  </Box>
);

const OrganizationScreenStep = ({ formik }: any) => (
  <Box display="flex" gap={2} flexWrap="wrap">
    {Object.values(formik?.values?.medium).map((mediums: any, index: number) =>
      mediums.map((medium: Medium) => (
        <Autocomplete
          key={index}
          options={medium.educationMediumStages || []}
          getOptionLabel={(option: any) => option.name}
          id={`controlled-demo-${index}`}
          value={formik?.values?.organization?.[medium.name]}
          loading={false}
          sx={{ maxWidth: 300, width: '100%' }}
          onChange={(_event: any, newValue: any | null) => {
            formik.setFieldValue(`organization.${medium.name}`, newValue);
          }}
          size="small"
          multiple
          ChipProps={{
            variant: 'outlined',
            size: 'small',
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              size="small"
              label={`Select organization For Medium ${medium.name}  `}
              helperText={
                formik.touched.organization?.[medium.name] &&
                formik.errors.organization?.[medium.name]
              }
              error={
                formik.touched.organization?.[medium.name] &&
                Boolean(formik.errors.organization?.[medium.name])
              }
            />
          )}
        />
      ))
    )}
  </Box>
);

const ClassScreenStep = ({ formik }: any) => (
  <Box display="flex" gap={2} flexWrap="wrap">
    {Object.values(formik.values.organization).map((orgs: any) =>
      orgs.map((org: Organization, index: number) => (
        <Autocomplete
          key={index}
          options={org.standards || []}
          getOptionLabel={(option: any) => option.name}
          id={`controlled-demo-${index}`}
          value={formik?.values?.class?.[org.name]}
          loading={false}
          sx={{ maxWidth: 300, width: '100%' }}
          onChange={(_event: any, newValue: any | null) => {
            formik.setFieldValue(`class.${org.name}`, newValue);
          }}
          size="small"
          multiple
          ChipProps={{
            variant: 'outlined',
            size: 'small',
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              size="small"
              label={`Select class For Organization ${org.name}`}
              helperText={formik.touched.class?.[org.name] && formik.errors.class?.[org.name]}
              error={formik.touched.class?.[org.name] && Boolean(formik.errors.class?.[org.name])}
            />
          )}
        />
      ))
    )}
  </Box>
);

const DivisionScreenStep = ({ formik }: any) => (
  <Box display="flex" gap={2} flexWrap="wrap">
    {Object.values(formik.values.class).map((classes: any) =>
      classes.map((standard: Standards, index: number) => (
        <Autocomplete
          key={index}
          options={standard.divisions || []}
          getOptionLabel={(option: any) => option.name}
          id={`controlled-demo-${index}`}
          value={formik?.values?.division?.[standard.name]}
          loading={false}
          sx={{ maxWidth: 300, width: '100%' }}
          onChange={(_event: any, newValue: any | null) => {
            formik.setFieldValue(`division.${standard.name}`, newValue);
          }}
          size="small"
          multiple
          ChipProps={{
            variant: 'outlined',
            size: 'small',
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              size="small"
              label={`Select division For Class ${standard.name}`}
              helperText={
                formik.touched.division?.[standard.name] && formik.errors.division?.[standard.name]
              }
              error={
                formik.touched.division?.[standard.name] &&
                Boolean(formik.errors.division?.[standard.name])
              }
            />
          )}
        />
      ))
    )}
  </Box>
);

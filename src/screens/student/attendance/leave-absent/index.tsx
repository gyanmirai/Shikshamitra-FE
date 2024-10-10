'use client';

import type { RootState } from 'src/redux/store';
import type { Medium, Division, Standards, Organization } from 'src/types/school';

import * as Yup from 'yup';
import { useSelector } from 'react-redux';
import { Form, Field, Formik } from 'formik';
import React, { useMemo, useState, useEffect } from 'react';

import { DateTimePicker } from '@mui/x-date-pickers';
import { Add, Cancel, CheckCircleOutline } from '@mui/icons-material';
import {
  Box,
  Grid,
  Button,
  Avatar,
  Checkbox,
  MenuItem,
  TextField,
  IconButton,
  FormControlLabel,
} from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { useLazyGetBoardByIdQuery } from 'src/redux/board/boardApi';

import { Label } from 'src/components/label';
import { Editor } from 'src/components/editor';
import CustomDialog from 'src/components/customDialog';
import CustomSelect from 'src/components/custom-select';
import CustomizableTable from 'src/components/customizabaleTable';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

const LeaveAndAbsentScreen = () => {
  // State to control the dialog visibility
  const dialog = useBoolean();

  return (
    <Box>
      <CustomBreadcrumbs
        heading="Leave and Absent"
        links={[{ name: 'Student' }, { name: 'Attendance' }, { name: 'Leave and Absent' }]}
        sx={{ px: 1, mb: 2 }}
        action={
          <Button startIcon={<Add />} variant="contained" size="small" onClick={dialog.onTrue}>
            Add Leave Request
          </Button>
        }
      />
      <CustomizableTable
        columns={[
          {
            id: 'student',
            label: 'Student',
            render(value, row) {
              return (
                <Box display="flex" alignItems="center" gap={1}>
                  <Avatar sx={{ width: 30, height: 30 }} alt={value} title={value} />
                  {value}
                </Box>
              );
            },
          },
          { id: 'medium', label: 'Medium' },
          { id: 'organization', label: 'Organization' },
          { id: 'class', label: 'Class' },
          { id: 'division', label: 'Division' },
          { id: 'leaveType', label: 'Leave Type' },
          { id: 'startDate', label: 'Start Date' },
          { id: 'endDate', label: 'End Date' },
          { id: 'description', label: 'Description' },
          {
            id: 'status',
            label: 'Status',
            render(value, row) {
              return (
                <Label
                  color={
                    value === 'Approved' ? 'success' : value === 'Pending' ? 'warning' : 'error'
                  }
                >
                  {value}
                </Label>
              );
            },
          },
          {
            id: 'actions',
            label: 'Actions',
            isSort: false,
            render(value, row) {
              return (
                <Box display="flex" gap={1}>
                  {row.status === 'Pending' ? (
                    <>
                      <IconButton size="small" color="success">
                        <CheckCircleOutline />
                      </IconButton>
                      <IconButton size="small" color="error">
                        <Cancel />
                      </IconButton>
                    </>
                  ) : (
                    '-'
                  )}
                </Box>
              );
            },
          },
        ]}
        data={[
          {
            medium: 'English',
            organization: 'Primary',
            class: '10th',
            division: 'A',
            student: 'John Doe',
            leaveType: 'Sick Leave',

            startDate: '01-05-2023',
            endDate: '03-05-2023',
            description: 'Fever and cold',
            status: 'Approved',
          },
          {
            medium: 'Spanish',
            organization: 'Secondary',
            class: '9th',
            division: 'B',
            student: 'Jane Smith',
            leaveType: 'Personal Leave',

            startDate: '10-05-2023',
            endDate: '12-05-2023',
            description: 'Family event',
            status: 'Pending',
          },
          {
            medium: 'French',
            organization: 'Primary',
            class: '11th',
            division: 'C',
            student: 'Alice Johnson',
            leaveType: 'Vacation',

            startDate: '01-06-2023',
            endDate: '07-06-2023',
            description: 'Summer vacation',
            status: 'Approved',
          },
        ]}
      />
      <CustomDialog
        maxWidth="md"
        open={dialog.value}
        handleClose={dialog.onFalse}
        title="Leave Request"
      >
        <LeaveRequestForm />
      </CustomDialog>
    </Box>
  );
};

export default LeaveAndAbsentScreen;

const leaveTypes = [
  { value: 'vacation', label: 'Vacation' },
  { value: 'sick', label: 'Sick Leave' },
  { value: 'personal', label: 'Personal Leave' },
];

const LeaveRequestForm = () => {
  // State to store all available mediums
  const [allMediums, setAllMediums] = useState<Medium[]>([]);
  // State to store the selected medium
  const [medium, setMedium] = useState<string>('');
  // State to store all available organizations
  const [allOrganization, setAllOrganization] = useState<Organization[]>([]);
  // State to store the selected organization
  const [organization, setOrganization] = useState<string>('');
  // State to store all available classes
  const [allClass, setAllClass] = useState<Standards[]>([]);
  // State to store the selected class
  const [classes, setClass] = useState<string>('');
  // State to store all available divisions
  const [allDivision, setAllDivision] = useState<Division[]>([]);
  // State to store the selected division
  const [division, setDivision] = useState<string>('');
  // State to store the selected student
  const [student, setStudent] = useState('');
  // Selector to get the current board from Redux store
  const { currentBoard } = useSelector((state: RootState) => state.globalState);
  // Custom hook to get board data
  const [getBoard, { data: boardData }] = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useLazyGetBoardByIdQuery,
  });

  // Effect to fetch board data when currentBoard changes
  useEffect(() => {
    if (currentBoard?.id) {
      if (boardData) {
        setAllMediums(boardData?.educationMediums || []);
        setMedium(boardData?.educationMediums?.[0]?.id || '');
      } else {
        getBoard(currentBoard.id);
      }
    } else {
      setAllMediums([]);
      setMedium('');
    }
  }, [boardData, currentBoard?.id, getBoard]);

  // Effect to update mediums when boardData changes
  useEffect(() => {
    setAllMediums(boardData?.educationMediums || []);
    setMedium(boardData?.educationMediums?.[0]?.id || '');
  }, [boardData]);

  // Effect to update organizations when medium changes
  useEffect(() => {
    setAllOrganization(
      allMediums.find((med: any) => med?.id === medium)?.educationMediumStages || []
    );
    setOrganization(
      allMediums.find((med: any) => med?.id === medium)?.educationMediumStages?.[0]?.id || ''
    );
  }, [medium, allMediums]);

  // Effect to update classes when organization changes
  useEffect(() => {
    setAllClass(allOrganization.find((org: any) => org?.id === organization)?.standards || []);
    setClass(
      allOrganization.find((org: any) => org?.id === organization)?.standards?.[0]?.id || ''
    );
  }, [organization, allOrganization]);

  // Effect to update divisions when class changes
  useEffect(() => {
    setAllDivision(allClass.find((org: any) => org?.id === classes)?.divisions || []);
    setDivision(allClass.find((org: any) => org?.id === classes)?.divisions?.[0]?.id || '');
  }, [allClass, classes]);

  // Memoized validation schema for the form
  const validationSchema = useMemo(
    () =>
      Yup.object().shape({
        leaveType: Yup.string().required('Leave type is required'),
        isHalfDay: Yup.boolean(),
        startDate: Yup.date().required('Start date is required'),
        endDate: Yup.date().when('isHalfDay', (isHalfDay, schema) =>
          isHalfDay ? schema : schema.required('End date is required')
        ),
        description: Yup.string().required('Description is required'),
      }),
    []
  );

  return (
    <Box p={2}>
      <Box display="flex" my={2} gap={2} flexWrap="wrap">
        <CustomSelect
          options={allMediums}
          label="Medium"
          value={medium}
          onChange={(val: string | string[]) => {
            setMedium(val as string);
          }}
          labelKey="name"
          valueKey="id"
          formControlProps={{ sx: { maxWidth: '250px', width: '100%' } }}
        />
        <CustomSelect
          options={allOrganization}
          label="Organization"
          value={organization}
          onChange={(val: string | string[]) => setOrganization(val as string)}
          labelKey="name"
          valueKey="id"
          formControlProps={{ sx: { maxWidth: '250px', width: '100%' } }}
          disabled={!medium}
        />
        <CustomSelect
          options={allClass}
          label="Class"
          value={classes}
          onChange={(val: string | string[]) => setClass(val as string)}
          labelKey="name"
          valueKey="id"
          formControlProps={{ sx: { maxWidth: '250px', width: '100%' } }}
          disabled={!organization}
        />
        <CustomSelect
          options={allDivision}
          label="Division"
          value={division}
          onChange={(val: string | string[]) => setDivision(val as string)}
          labelKey="name"
          valueKey="id"
          formControlProps={{ sx: { maxWidth: '250px', width: '100%' } }}
          disabled={!classes}
        />
        <CustomSelect
          options={[
            { name: 'Jon Doe', id: '1' },
            { name: 'Jane Smith', id: '2' },
            { name: 'Alice Johnson', id: '3' },
            { name: 'Bob Williams', id: '4' },
            { name: 'Emma Brown', id: '5' },
          ]}
          isSearch
          label="Students"
          value={student}
          onChange={(val: string | string[]) => {
            setStudent(val as string);
          }}
          labelKey="name"
          valueKey="id"
          formControlProps={{ sx: { maxWidth: '250px', width: '100%' } }}
          disabled={!division}
        />
      </Box>

      {student && (
        <Formik
          initialValues={{
            leaveType: '',
            description: '',
            startDate: null,
            endDate: null,
            isHalfDay: false,
            rejectionReason: '',
            status: null,
          }}
          validationSchema={validationSchema}
          onSubmit={(values, { setSubmitting }) => {}}
        >
          {({ errors, touched, setFieldValue, values, submitForm }) => (
            <Form style={{ padding: '0 8px' }}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Field
                    name="leaveType"
                    as={TextField}
                    select
                    fullWidth
                    label="Leave Type"
                    size="small"
                    error={touched.leaveType && errors.leaveType}
                    helperText={touched.leaveType && errors.leaveType}
                  >
                    {leaveTypes.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Field>
                </Grid>
                <Grid item xs={4}>
                  <FormControlLabel
                    control={
                      <Field
                        name="isHalfDay"
                        as={Checkbox}
                        onChange={(e: any) => {
                          setFieldValue('isHalfDay', e.target.checked);
                          if (e.target.checked) {
                            setFieldValue('endDate', null);
                          }
                        }}
                      />
                    }
                    label="Half Day"
                  />
                </Grid>
                <Grid item xs={4}>
                  <DateTimePicker
                    label={values.isHalfDay ? 'Date and Time' : 'Start Date and Time'}
                    onChange={(value) => setFieldValue('startDate', value)}
                    slotProps={{
                      textField: {
                        size: 'small',
                        helperText: touched.startDate && errors.startDate,
                        error: touched.startDate && Boolean(errors.startDate),
                      },
                    }}
                  />
                </Grid>
                {!values.isHalfDay && (
                  <Grid item xs={4}>
                    <DateTimePicker
                      label="End Date and Time"
                      onChange={(value) => setFieldValue('endDate', value)}
                      slotProps={{
                        textField: {
                          size: 'small',
                          helperText: touched.endDate && errors.endDate,
                          error: touched.endDate && Boolean(errors.endDate),
                        },
                      }}
                    />
                  </Grid>
                )}
                <Grid item xs={12}>
                  <Editor
                    onChange={(value) => {
                      setFieldValue('description', value);
                    }}
                    placeholder="Leave description"
                    error={touched.description && Boolean(errors.description)}
                    helperText={touched.description && errors.description}
                  />
                </Grid>
                <Grid item xs={12} display="flex" justifyContent="flex-end">
                  <Button type="submit" variant="contained" size="small" color="primary">
                    Submit Leave Request
                  </Button>
                </Grid>
              </Grid>
            </Form>
          )}
        </Formik>
      )}
    </Box>
  );
};

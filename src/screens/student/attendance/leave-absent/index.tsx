'use client';

import type { RootState } from 'src/redux/store';
import type { Medium, Division, Standards, Organization } from 'src/types/school';

import * as Yup from 'yup';
import { useSelector } from 'react-redux';
import { Form, Field, Formik } from 'formik';
import React, { useMemo, useState, useEffect } from 'react';

import { DateTimePicker } from '@mui/x-date-pickers';
import {
  Box,
  Grid,
  Card,
  Button,
  Checkbox,
  MenuItem,
  TextField,
  FormControlLabel,
} from '@mui/material';

import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { useLazyGetBoardByIdQuery } from 'src/redux/board/boardApi';

import { Editor } from 'src/components/editor';
import CustomSelect from 'src/components/custom-select';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

const LeaveAndAbsentScreen = () => {
  const [allMediums, setAllMediums] = useState<Medium[]>([]);
  const [medium, setMedium] = useState<string>('');
  const [allOrganization, setAllOrganization] = useState<Organization[]>([]);
  const [organization, setOrganization] = useState<string>('');
  const [allClass, setAllClass] = useState<Standards[]>([]);
  const [classes, setClass] = useState<string>('');
  const [allDivision, setAllDivision] = useState<Division[]>([]);
  const [division, setDivision] = useState<string>('');
  const [student, setStudent] = useState('');
  const { currentBoard } = useSelector((state: RootState) => state.globalState);
  const [getBoard, { data: boardData }] = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useLazyGetBoardByIdQuery,
  });
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

  useEffect(() => {
    setAllMediums(boardData?.educationMediums || []);
    setMedium(boardData?.educationMediums?.[0]?.id || '');
  }, [boardData]);

  useEffect(() => {
    setAllMediums(boardData?.educationMediums || []);
    setMedium(boardData?.educationMediums?.[0]?.id || '');
  }, [boardData]);

  useEffect(() => {
    setAllOrganization(
      allMediums.find((med: any) => med?.id === medium)?.educationMediumStages || []
    );
    setOrganization(
      allMediums.find((med: any) => med?.id === medium)?.educationMediumStages?.[0]?.id || ''
    );
  }, [medium, allMediums]);

  useEffect(() => {
    setAllClass(allOrganization.find((org: any) => org?.id === organization)?.standards || []);
    setClass(
      allOrganization.find((org: any) => org?.id === organization)?.standards?.[0]?.id || ''
    );
  }, [organization, allOrganization]);
  useEffect(() => {
    setAllDivision(allClass.find((org: any) => org?.id === classes)?.divisions || []);
    setDivision(allClass.find((org: any) => org?.id === classes)?.divisions?.[0]?.id || '');
  }, [allClass, classes]);
  return (
    <Box>
      <CustomBreadcrumbs
        heading="Leave and Absent"
        links={[{ name: 'Student' }, { name: 'Attendance' }, { name: 'Leave and Absent' }]}
        sx={{ px: 1, mb: 2 }}
      />
      <Card sx={{ mb: 2, py: 2, px: 1 }}>
        <Box display="flex" gap={2} flexWrap="wrap">
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
      </Card>
      {student && <LeaveRequestForm />}
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
  );
};

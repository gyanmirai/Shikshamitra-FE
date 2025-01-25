'use client';

import type { Division, Standards } from 'src/types/school';
import type { TabComponentType } from 'src/screens/hr/leave-request';

import { useFormik } from 'formik';
import React, { useState } from 'react';

import { Add } from '@mui/icons-material';
import {
  Box,
  Grid,
  Card,
  Button,
  Checkbox,
  TextField,
  Typography,
  DialogActions,
  FormControlLabel,
} from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { useGetClassQuery } from 'src/redux/class/classApi';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import CustomSelect from 'src/components/custom-select';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

interface TStudentGroup {
  id: number;
  className: string;
  division: string;
  groupName: string;
  groupType: string;
  totalStudents: number;
  dynamicGroup?: string;
}

const initialStudentGroups: TStudentGroup[] = [
  {
    id: 1,
    className: '10th',
    division: 'A',
    groupName: 'High Performers',
    groupType: 'Dynamic',
    dynamicGroup: 'Academic',
    totalStudents: 20,
  },
  {
    id: 2,
    className: '11th',
    division: 'B',
    groupName: 'Sports Team',
    groupType: 'Dynamic',
    dynamicGroup: 'Extracurricular',
    totalStudents: 50,
  },
  {
    id: 3,
    className: '12th',
    division: 'C',
    groupName: 'Top Students',
    groupType: 'Static',
    totalStudents: 40,
  },
];

const StudentGroup = (props: TabComponentType) => {
  const [studentGroups, setStudentGroups] = useState<TStudentGroup[]>(initialStudentGroups);
  const [isEdit, setIsEdit] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<TStudentGroup | null>(null);

  // const dialog = useBoolean();
  const [open, setOpen] = useState(false);
  const deleteConfirmDialog = useBoolean();

  const handleCloseDialog = () => {
    setOpen(false);
  };

  const handleSubmit = () => {};

  return (
    <Box>
      {open ? (
        <CustomBreadcrumbs
          heading="Student Group"
          links={[
            { name: 'Academic and Assignment' },
            { name: 'Activity' },
            { name: 'Student Group' },
            { name: 'Add Student Group' },
          ]}
          sx={{ px: 1, mb: 2 }}
          action={
            <Button
              variant="contained"
              size="small"
              startIcon={<Iconify icon="eva:arrow-back-fill" />}
              onClick={handleCloseDialog}
            >
              Back
            </Button>
          }
        />
      ) : (
        <CustomBreadcrumbs
          heading="Student Group"
          links={[
            { name: 'Academic and Assignment' },
            { name: 'Activity' },
            { name: 'Student Group' },
          ]}
          sx={{ px: 1, mb: 2 }}
          action={
            <Button
              startIcon={<Add />}
              variant="contained"
              size="small"
              onClick={() => {
                setOpen(true);
                // setIsEdit(false);
                // setSelectedSubject(null);
              }}
            >
              Group
            </Button>
          }
        />
      )}

      {open ? (
        <Card>
          <AddGroup
            onSubmit={handleSubmit}
            onClose={() => {
              setOpen(false);
            }}
            data={[]}
            isEdit={isEdit}
          />
        </Card>
      ) : (
        <CustomizableTable
          tableId="student-group-table"
          columns={[
            { id: 'className', label: 'Class' },
            { id: 'division', label: 'Division' },
            { id: 'groupName', label: 'Group Name', minWidth: '180px', align: 'left' },
            { id: 'groupType', label: 'Group Type', minWidth: '180px', align: 'left' },
            {
              id: 'dynamicGroup',
              label: 'Dynamic Group Type',
              minWidth: '200px',
              align: 'left',
              render: (value) => value || '-',
            },
            { id: 'totalStudents', label: 'Total Students', minWidth: '180px', align: 'left' },
            {
              id: 'action',
              label: 'Actions',
              isSort: false,
              render(value, row) {
                return (
                  <ThreeDotsActions
                    // actions={(prop) => actions({ ...props, row })}
                    placement="right-top"
                    showEditIcon
                    showDeleteIcon
                    showViewIcon
                    showThreeDots={false}
                    handleViewClick={() => {
                      setSelectedGroup(row as TStudentGroup);
                    }}
                    handleEditClick={() => {
                      setSelectedGroup(row as TStudentGroup);
                      setIsEdit(true);
                      setOpen(true);
                    }}
                    handleDeleteClick={() => {
                      setSelectedGroup(row as TStudentGroup);
                      deleteConfirmDialog.onTrue();
                    }}
                  />
                );
              },
            },
          ]}
          data={studentGroups}
        />
      )}
    </Box>
  );
};

export default StudentGroup;

// eslint-disable-next-line react/prop-types
const AddGroup = ({ onSubmit, onClose, data, isEdit }: any) => {
  const [classes, setClasses] = useState<string>('');
  const [division, setDivision] = useState<any>([]);
  const [divisionOptions, setDivisionOptions] = useState<Division[]>([]);
  const { data: classData, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetClassQuery,
  });

  const formik = useFormik({
    initialValues: {
      className: '',
      division: '',
      groupName: '',
      groupType: '',
      dynamicGroup: '',
      students: [],

      // Academic Group Specific
      academicSubjects: [],
      minPer: '',
      maxPer: '',
      aggregatePerformance: true,

      // Extracurricular Group Specific
      activityType: [],
      performanceLevels: [],

      // Attendance Group Specific
      attendanceThreshold: '',
      attendancePeriod: null,

      // Behavioral Group Specific
      behavioralTags: [],
      behavioralParticipations: [],
    },
    onSubmit: (values) => {
      console.log('Form Submitted', values);
    },
  });

  const resetDynamicGroupFields = () => {
    // Reset Academic Group fields
    formik.setFieldValue('academicSubjects', []);
    formik.setFieldValue('minPer', '');
    formik.setFieldValue('maxPer', '');
    formik.setFieldValue('aggregatePerformance', false);

    // Reset Extracurricular Group fields
    formik.setFieldValue('activityType', []);
    formik.setFieldValue('performanceLevels', []);

    // Reset Attendance Group fields
    formik.setFieldValue('attendanceThreshold', '');
    formik.setFieldValue('attendancePeriod', null);

    // Reset Behavioral Group fields
    formik.setFieldValue('behavioralTags', []);
    formik.setFieldValue('behavioralParticipations', []);
  };

  const renderDynamicGroupFields = () => {
    switch (formik.values.dynamicGroup) {
      case 'Academic':
        return (
          <>
            <Grid item xs={12}>
              <Typography variant="subtitle1">
                Assign Student Criteria For Academic Groups
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formik.values.aggregatePerformance}
                    onChange={(e) => formik.setFieldValue('aggregatePerformance', e.target.checked)}
                  />
                }
                label="Use Aggregate Performance"
              />
            </Grid>
            {!formik.values.aggregatePerformance && (
              <Grid item xs={12} md={6}>
                <CustomSelect
                  label="Select Subjects"
                  multiple
                  options={[
                    { value: 'math', label: 'Mathematics' },
                    { value: 'science', label: 'Science' },
                    { value: 'english', label: 'English' },
                    { value: 'history', label: 'History' },
                  ]}
                  value={formik.values.academicSubjects}
                  onChange={(val) => formik.setFieldValue('academicSubjects', val)}
                  formControlProps={{ fullWidth: true, sx: { maxWidth: 'unset' } }}
                />
              </Grid>
            )}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                size="small"
                label="Min (%)"
                type="number"
                name="minPer"
                value={formik.values.minPer}
                onChange={formik.handleChange}
                InputProps={{ inputProps: { min: 0 } }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                size="small"
                label="Max (%)"
                type="number"
                name="maxPer"
                value={formik.values.maxPer}
                onChange={formik.handleChange}
                InputProps={{ inputProps: { max: 100 } }}
              />
            </Grid>
          </>
        );

      case 'Extracurricular':
        return (
          <>
            <Grid item xs={12}>
              <Typography variant="subtitle1">
                Assign Student Criteria For Extracurricular Groups
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <CustomSelect
                label="Activity Type"
                multiple
                options={[
                  { value: 'sports', label: 'Sports' },
                  { value: 'music', label: 'Music' },
                  { value: 'drama', label: 'Drama' },
                  { value: 'debate', label: 'Debate' },
                ]}
                value={formik.values.activityType}
                onChange={(val) => {
                  // Reset performance levels when activity types change
                  const performanceLevels = val.map(() => '');
                  formik.setFieldValue('activityType', val);
                  formik.setFieldValue('performanceLevels', performanceLevels);
                }}
                formControlProps={{ fullWidth: true, sx: { maxWidth: 'unset' } }}
              />
            </Grid>
            {formik.values.activityType.map((activity, index) => (
              <Grid item xs={12} md={6} key={activity}>
                <TextField
                  fullWidth
                  size="small"
                  label={`Performance Level for ${activity}`}
                  value={formik.values.performanceLevels[index] || ''}
                  onChange={(e) => {
                    const newPerformanceLevels: any = [...formik.values.performanceLevels];
                    newPerformanceLevels[index] = e.target.value;
                    formik.setFieldValue('performanceLevels', newPerformanceLevels);
                  }}
                  placeholder="e.g., National Level"
                />
              </Grid>
            ))}
          </>
        );

      case 'Attendance':
        return (
          <>
            <Grid item xs={12}>
              <Typography variant="subtitle1">
                Assign Student Criteria For Attendance-Based Groups
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                size="small"
                label="Attendance Threshold (%)"
                type="number"
                name="attendanceThreshold"
                value={formik.values.attendanceThreshold}
                onChange={formik.handleChange}
                InputProps={{ inputProps: { min: 0, max: 100 } }}
              />
            </Grid>
          </>
        );

      case 'Behavioral':
        return (
          <>
            <Grid item xs={12}>
              <Typography variant="subtitle1">
                Assign Student Criteria For Behavioral Groups
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <CustomSelect
                label="Behavioral Tags"
                multiple
                options={[
                  { value: 'leadership', label: 'Leadership' },
                  { value: 'discipline', label: 'Discipline' },
                  { value: 'community', label: 'Community Service' },
                ]}
                value={formik.values.behavioralTags}
                onChange={(val) => {
                  const behavioralParticipations = val.map(() => '');
                  formik.setFieldValue('behavioralTags', val);
                  formik.setFieldValue('behavioralParticipations', behavioralParticipations);
                }}
                formControlProps={{ fullWidth: true, sx: { maxWidth: 'unset' } }}
              />
            </Grid>
            {formik.values.behavioralTags.map((tag, index) => (
              <Grid item xs={12} md={6} key={tag}>
                <TextField
                  fullWidth
                  size="small"
                  label={`Participation for ${tag}`}
                  value={formik.values.behavioralParticipations[index] || ''}
                  onChange={(e) => {
                    const newBehavioralParticipations: any = [
                      ...formik.values.behavioralParticipations,
                    ];
                    newBehavioralParticipations[index] = e.target.value;
                    formik.setFieldValue('behavioralParticipations', newBehavioralParticipations);
                  }}
                  placeholder="e.g., Leader in 2+ activities"
                />
              </Grid>
            ))}
          </>
        );

      default:
        return null;
    }
  };

  return (
    <Box display="flex" flexDirection="column" gap={2}>
      <form onSubmit={formik.handleSubmit}>
        <Scrollbar sx={{ p: 2, height: '450px' }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <CustomSelect
                label="Class"
                options={classData?.items || []}
                value={classes}
                isLoading={isLoading}
                labelKey="name"
                valueKey="id"
                onChange={(val) => {
                  const selectedClass: Standards = classData.items.find(
                    (i: Standards) => i.id === val
                  );
                  formik.setFieldValue('className', selectedClass?.name || '');
                  setClasses(val as string);
                  setDivisionOptions(selectedClass?.divisions || []);
                }}
                formControlProps={{ fullWidth: true, sx: { maxWidth: 'unset' } }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <CustomSelect
                label="Division"
                disabled={!classes}
                labelKey="name"
                valueKey="id"
                options={divisionOptions}
                value={division}
                onChange={(val) => {
                  const selectedDivision = divisionOptions.find((i: Division) => val === i.id);
                  formik.setFieldValue('division', selectedDivision?.name || '');
                  setDivision(val);
                }}
                formControlProps={{ fullWidth: true, sx: { maxWidth: 'unset' } }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Group Name"
                name="groupName"
                size="small"
                value={formik.values.groupName}
                onChange={formik.handleChange}
                error={formik.touched.groupName && Boolean(formik.errors.groupName)}
                helperText={formik.touched.groupName && formik.errors.groupName}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <CustomSelect
                label="Group Type"
                options={[
                  { value: 'Dynamic', label: 'Dynamic' },
                  { value: 'Static', label: 'Static' },
                ]}
                onChange={(val) => {
                  formik.setFieldValue('groupType', val);
                  formik.setFieldValue('dynamicGroup', '');
                }}
                value={formik.values.groupType}
                formControlProps={{ fullWidth: true, sx: { maxWidth: 'unset' } }}
              />
            </Grid>
            {formik.values.groupType === 'Dynamic' && (
              <>
                <Grid item xs={12} md={6}>
                  <CustomSelect
                    label="Select Dynamic Group"
                    options={[
                      { value: 'Academic', label: 'Academic Groups' },
                      { value: 'Extracurricular', label: 'Extracurricular Groups' },
                      { value: 'Attendance', label: 'Attendance-Based Groups' },
                      { value: 'Behavioral', label: 'Behavioral Groups' },
                    ]}
                    value={formik.values.dynamicGroup}
                    onChange={(val) => {
                      resetDynamicGroupFields();
                      formik.setFieldValue('dynamicGroup', val);
                    }}
                    formControlProps={{ fullWidth: true, sx: { maxWidth: 'unset' } }}
                  />
                </Grid>

                {/* Conditional rendering of specific group fields */}
                {renderDynamicGroupFields()}
              </>
            )}

            {formik.values.groupType === 'Static' && (
              <Grid item xs={12} md={6}>
                <CustomSelect
                  label="Select Students"
                  multiple
                  options={[
                    { value: 'student1', label: 'Student 1' },
                    { value: 'student2', label: 'Student 2' },
                    { value: 'student3', label: 'Student 3' },
                  ]}
                  value={formik.values.students}
                  onChange={(val) => {
                    formik.setFieldValue('students', val);
                  }}
                  formControlProps={{ fullWidth: true, sx: { maxWidth: 'unset' } }}
                />
              </Grid>
            )}
          </Grid>
        </Scrollbar>
        <DialogActions>
          {formik.values.groupType === 'Dynamic' && (
            <Button startIcon={<Iconify icon="mdi:eye" />}>Preview Students</Button>
          )}
          <Button type="submit" variant="contained">
            {isEdit ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </form>
    </Box>
  );
};

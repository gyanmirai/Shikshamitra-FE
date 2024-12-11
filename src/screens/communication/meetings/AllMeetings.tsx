import type { Dayjs } from 'dayjs';
import type { TabComponentType } from 'src/screens/hr/leave-request';

import dayjs from 'dayjs';
import { useFormik } from 'formik';
import React, { useState } from 'react';

import { DatePicker, TimePicker } from '@mui/x-date-pickers';
import {
  Box,
  Grid,
  Chip,
  Radio,
  Button,
  Switch,
  MenuItem,
  MenuList,
  FormLabel,
  TextField,
  RadioGroup,
  Typography,
  FormControl,
  DialogActions,
  FormHelperText,
  FormControlLabel,
} from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { useGetClassQuery } from 'src/redux/class/classApi';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import CustomDialog from 'src/components/customDialog';
import CustomSelect from 'src/components/custom-select';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';

interface Meeting {
  id: number;
  title: string;
  status: string;
  audience: string[];
  organization: string[];
  className: string[];
  division: string[];
  students: string[];
  meetingDate: Dayjs | null;
  meetingTime: Dayjs | null;
  meetingAgenda: string;
  link: string;
  meetingType: string;
  classRoom: string;
  isRecurring: boolean;
  repeatFrequency?: 'Daily' | 'Weekly' | 'Monthly' | 'Custom';
  repeatUntil?: Dayjs | number;
}

const meetings: Meeting[] = [
  {
    id: 1,
    title: 'Monthly Staff Meeting',
    status: 'Scheduled',
    audience: ['Teacher'],
    organization: ['ABC School'],
    className: [],
    division: [],
    students: [],
    meetingDate: dayjs('2024-12-15'),
    meetingTime: dayjs('2024-12-15T10:00'),
    meetingAgenda: 'Discuss curriculum updates and training schedules.',
    link: '',
    meetingType: 'Offline',
    classRoom: 'Conference Room 1',
    isRecurring: true,
    repeatFrequency: 'Monthly',
    repeatUntil: dayjs('2025-06-15'),
  },
  {
    id: 2,
    title: 'Parent-Teacher Interaction',
    status: 'Completed',
    audience: ['Parent'],
    organization: [],
    className: ['10'],
    division: ['A'],
    students: ['Student1', 'Student2'],
    meetingDate: dayjs('2024-12-18'),
    meetingTime: dayjs('2024-12-18T09:30'),
    meetingAgenda: 'Discuss individual student progress.',
    link: 'https://example.com/meeting-link',
    meetingType: 'Virtual',
    classRoom: '',
    isRecurring: false,
  },
  {
    id: 3,
    title: 'Class Orientation',
    status: 'Completed',
    audience: ['Student'],
    organization: [],
    className: ['8'],
    division: ['B'],
    students: ['Student3', 'Student4'],
    meetingDate: dayjs('2024-12-10'),
    meetingTime: dayjs('2024-12-10T12:00'),
    meetingAgenda: 'Orientation for new students.',
    link: '',
    meetingType: 'Offline',
    classRoom: 'Auditorium',
    isRecurring: false,
  },
  {
    id: 4,
    title: 'School Board Meeting',
    status: 'Scheduled',
    audience: ['Teacher'],
    organization: ['XYZ Education Trust'],
    className: [],
    division: [],
    students: [],
    meetingDate: dayjs('2024-12-20'),
    meetingTime: dayjs('2024-12-20T14:00'),
    meetingAgenda: 'Discuss budget and infrastructure plans.',
    link: 'https://example.com/board-meeting',
    meetingType: 'Virtual',
    classRoom: '',
    isRecurring: false,
  },
  {
    id: 5,
    title: 'Weekly Parent Discussion',
    status: 'Scheduled',
    audience: ['Parent'],
    organization: [],
    className: ['9'],
    division: ['C'],
    students: ['Student5', 'Student6'],
    meetingDate: dayjs('2024-12-14'),
    meetingTime: dayjs('2024-12-14T16:00'),
    meetingAgenda: "Discuss weekly updates on students' performance.",
    link: '',
    meetingType: 'Offline',
    classRoom: 'Room 202',
    isRecurring: true,
    repeatFrequency: 'Weekly',
    repeatUntil: dayjs('2025-03-14'),
  },
];

const AllMeetings = (props: TabComponentType) => {
  const addNewMeetingDialog = useBoolean();
  const [meetingTableData, setMeetingTableData] = useState(meetings);
  const [selectedMeeting, setSelectedMeeting] = useState<any | null>(null);
  const [isEdit, setIsEdit] = useState(false);

  const handleCloseDialog = () => {
    addNewMeetingDialog.onFalse();
    setSelectedMeeting(null);
    setIsEdit(false);
  };

  const handleSubmit = (values: any) => {
    if (isEdit) {
      setMeetingTableData((prevData) =>
        prevData.map((meeting) =>
          meeting.id === selectedMeeting.id
            ? { ...values, id: selectedMeeting.id }
            : selectedMeeting
        )
      );
    } else {
      const newMeeting = {
        ...values,
        id: String(meetingTableData.length + 1),
      };
      setMeetingTableData((prevData) => [...prevData, newMeeting]);
    }
    handleCloseDialog();
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h6">All Meetings</Typography>
        <Button
          startIcon={<Iconify icon="mdi:plus" />}
          variant="contained"
          onClick={() => {
            addNewMeetingDialog.onTrue();
          }}
        >
          Add New Meeting
        </Button>
      </Box>

      <CustomizableTable
        columns={[
          { id: 'title', label: 'Title' },
          { id: 'meetingType', label: 'Meeting Type' },
          {
            id: 'meetingDate',
            label: 'Meeting Date',
            render: (value, row) => (
              <Typography fontSize="12px" gutterBottom>
                {dayjs(value).format('DD MMM YYYY')}
              </Typography>
            ),
          },
          {
            id: 'meetingTime',
            label: 'Meeting Time',
            render: (value, row) => (
              <Typography fontSize="12px" gutterBottom>
                {dayjs(value).format('HH:mm')}
              </Typography>
            ),
          },
          {
            id: 'audience',
            label: 'Audience',
            render: (value: any) => (
              <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                {value.map((audience: string) => (
                  <Chip
                    key={audience}
                    label={audience}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                ))}
              </Box>
            ),
          },
          {
            id: 'organization',
            label: 'Organizations',
            render: (value: any) => (
              <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                {value && value.length > 0
                  ? value.map((org: string) => (
                      <Chip key={org} label={org} size="small" variant="outlined" />
                    ))
                  : '-'}
              </Box>
            ),
          },
          {
            id: 'className',
            label: 'Class',
            render: (value: any) => (
              <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                {value && value.length > 0
                  ? value.map((org: string) => (
                      <Chip key={org} label={org} size="small" variant="outlined" />
                    ))
                  : '-'}
              </Box>
            ),
          },
          {
            id: 'division',
            label: 'Division',
            render: (value: any) => (
              <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                {value && value.length > 0
                  ? value.map((org: string) => (
                      <Chip key={org} label={org} size="small" variant="outlined" />
                    ))
                  : '-'}
              </Box>
            ),
          },
          {
            id: 'status',
            label: 'Status',
            render: (value: any, row: any) => (
              <Label
                variant="soft"
                color={
                  value === 'Scheduled'
                    ? 'secondary'
                    : value === 'Completed'
                      ? 'primary'
                      : value === 'Cancelled'
                        ? 'error'
                        : 'default'
                }
              >
                {value}
              </Label>
            ),
          },
          {
            id: 'action',
            label: 'Action',
            render: (_: any, row: any) => (
              <ThreeDotsActions
                placement="right-top"
                actions={({ popover }) => (
                  <MenuList>
                    {row.status === 'Completed' && (
                      <MenuItem onClick={() => {}}>
                        <Iconify icon="mdi:eye" sx={{ mr: 1 }} />
                        Details
                      </MenuItem>
                    )}
                    {row.status === 'Scheduled' && (
                      <MenuItem
                        onClick={() => {
                          setSelectedMeeting(row);
                          setIsEdit(true);
                        }}
                      >
                        <Iconify icon="mdi:pencil" sx={{ mr: 1 }} />
                        Edit
                      </MenuItem>
                    )}
                    {row.status === 'Scheduled' && (
                      <MenuItem onClick={() => {}}>
                        <Iconify icon="mdi:delete" sx={{ mr: 1 }} />
                        Cancel
                      </MenuItem>
                    )}
                    {(row.status === 'Cancelled' || row.status === 'Scheduled') && (
                      <MenuItem onClick={() => {}}>
                        <Iconify icon="mdi:bell" sx={{ mr: 1 }} />
                        Notify Audience
                      </MenuItem>
                    )}
                  </MenuList>
                )}
              />
            ),
          },
        ]}
        data={meetingTableData}
      />

      <CustomDialog
        maxWidth="md"
        open={addNewMeetingDialog.value}
        handleClose={handleCloseDialog}
        title={isEdit ? `Edit ${selectedMeeting?.title}` : `Create Meeting`}
      >
        <AddNewMeeting initialValues={selectedMeeting} onSubmit={handleSubmit} isEdit={isEdit} />
      </CustomDialog>
    </Box>
  );
};

export default AllMeetings;

interface AddNewMeetingProps {
  onSubmit: (values: any) => void;
  initialValues?: any | null;
  isEdit?: boolean;
}

const AddNewMeeting: React.FC<AddNewMeetingProps> = ({ onSubmit, initialValues, isEdit }) => {
  const { data: classData, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetClassQuery,
  });

  const divisionOption = [
    { value: 'A', label: 'A' },
    { value: 'B', label: 'B' },
    { value: 'C', label: 'C' },
    { value: 'D', label: 'D' },
  ];

  const allOrganizations = [
    { value: 'Pre Primary', label: 'Pre Primary' },
    { value: 'Primary', label: 'Primary' },
    { value: 'Secondary', label: 'Secondary' },
    { value: 'Higher Secondary', label: 'Higher Secondary' },
  ];

  const classOptions = [{ value: '1', label: '1' }];

  const [isAllDivSelected, setIsAllDivSelected] = useState(
    initialValues?.division?.length === divisionOption.length
  );

  const [isAllOrgSelected, setIsAllOrgSelected] = useState(
    initialValues?.organization?.length === allOrganizations.length
  );

  const [isAllClassSelected, setIsAllClassSelected] = useState(
    initialValues?.division?.length === classOptions.length
  );

  const formik = useFormik({
    initialValues: {
      title: initialValues?.title || '',
      status: initialValues?.status || '',
      audience: initialValues?.audience || [],
      organization: initialValues?.organization || [],
      className: initialValues?.className || [],
      division: initialValues?.division || [],
      students: initialValues?.students || [],
      meetingDate: initialValues?.meetingDate ? dayjs(initialValues?.meetingDate) : dayjs(),
      meetingTime: initialValues?.meetingTime ? dayjs(initialValues?.meetingTime) : null,
      meetingAgenda: initialValues?.meetingAgenda || '',
      link: initialValues?.link || '',
      meetingType: initialValues?.meetingType || '',
      classRoom: initialValues?.classRoom || '',
      isRecurring: initialValues?.isRecurring || false,
      repeatFrequency: initialValues?.repeatFrequency || '',
      repeatUntil: initialValues?.repeatUntil ? dayjs(initialValues?.repeatUntil) : null,
    },
    onSubmit: (values) => {
      console.log('values------', values);
      onSubmit({
        ...values,
        status: 'Scheduled',
      });
    },
  });

  const handleDivisionChange = (selectedValues: string[]) => {
    if (selectedValues.includes('all') || selectedValues.includes('deselectAll')) {
      const allDivision = divisionOption.map((org) => org.value);
      if (isAllDivSelected) {
        formik.setFieldValue('division', []);
      } else {
        formik.setFieldValue('division', allDivision);
      }
      setIsAllDivSelected(!isAllDivSelected);
    } else {
      formik.setFieldValue('division', selectedValues);
      setIsAllDivSelected(selectedValues.length === divisionOption.length);
    }
  };

  const handleOrganizationChange = (selectedValues: string[]) => {
    if (selectedValues.includes('all') || selectedValues.includes('deselectAll')) {
      const allOrganizationValues = allOrganizations.map((org) => org.value);
      if (isAllOrgSelected) {
        formik.setFieldValue('organization', []);
      } else {
        formik.setFieldValue('organization', allOrganizationValues);
      }
      setIsAllOrgSelected(!isAllOrgSelected);
    } else {
      formik.setFieldValue('organization', selectedValues);
      setIsAllOrgSelected(selectedValues.length === allOrganizations.length);
    }
  };

  return (
    <Box display="flex" flexDirection="column" gap={2}>
      <form onSubmit={formik.handleSubmit}>
        <Scrollbar sx={{ p: 2, bgcolor: 'background.neutral', height: '300px' }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Title"
                name="title"
                value={formik.values.title}
                onChange={formik.handleChange}
                error={formik.touched.title && Boolean(formik.errors.title)}
                size="small"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <CustomSelect
                label="Select Audience"
                options={[
                  { value: 'Teachers', label: 'Teachers' },
                  { value: 'Students', label: 'Students' },
                  { value: 'Parents', label: 'Parents' },
                ]}
                multiple
                value={formik.values.audience}
                onChange={(val) => {
                  formik.setFieldValue('audience', val);
                }}
                formControlProps={{ fullWidth: true, sx: { minWidth: '200px' } }}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Meeting Agenda"
                name="meetingAgenda"
                multiline
                value={formik.values.meetingAgenda}
                onChange={formik.handleChange}
                error={formik.touched.meetingAgenda && Boolean(formik.errors.meetingAgenda)}
                size="small"
                rows={4}
              />
            </Grid>

            {formik.values.audience.includes('Teachers') && (
              <Grid item xs={12} md={6}>
                <CustomSelect
                  label="Select Organizations"
                  options={[
                    {
                      value: isAllOrgSelected ? 'deselectAll' : 'all',
                      label: isAllOrgSelected ? 'Deselect All' : 'All',
                    },
                    ...allOrganizations,
                  ]}
                  value={formik.values.organization}
                  onChange={(val) => {
                    handleOrganizationChange(val as string[]);
                  }}
                  multiple
                  formControlProps={{ fullWidth: true, sx: { minWidth: '200px' } }}
                />
                {formik.touched.organization && formik.errors.organization && (
                  <FormHelperText error>{String(formik.errors.organization)}</FormHelperText>
                )}
              </Grid>
            )}

            {(formik.values.audience.includes('Students') ||
              formik.values.audience.includes('Parents')) && (
              <>
                <Grid item xs={12} sm={6}>
                  <CustomSelect
                    options={[
                      {
                        value: isAllClassSelected ? 'deselectAll' : 'all',
                        label: isAllClassSelected ? 'Deselect All' : 'All',
                      },
                      ...classOptions,
                    ]}
                    value={formik.values.className}
                    onChange={(val) => {
                      formik.setFieldValue('className', val);
                    }}
                    label="Select Class"
                    isLoading={isLoading}
                    multiple
                    formControlProps={{ fullWidth: true, sx: { minWidth: '200px' } }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <CustomSelect
                    label="Select Divisions"
                    options={[
                      {
                        value: isAllDivSelected ? 'deselectAll' : 'all',
                        label: isAllDivSelected ? 'Deselect All' : 'All',
                      },
                      ...divisionOption,
                    ]}
                    value={formik.values.division}
                    onChange={(val) => {
                      handleDivisionChange(val as string[]);
                    }}
                    multiple
                    formControlProps={{ fullWidth: true, sx: { minWidth: '200px' } }}
                  />
                  {formik.touched.division && formik.errors.division && (
                    <FormHelperText error>{String(formik.errors.division)}</FormHelperText>
                  )}
                </Grid>
                <Grid item xs={12} md={6}>
                  <CustomSelect
                    label="Select Students"
                    options={[
                      { value: 'student1', label: 'Student 1' },
                      { value: 'student2', label: 'Student 2' },
                      { value: 'student3', label: 'Student 3' },
                      { value: 'student4', label: 'Student 4' },
                    ]}
                    value={formik.values.students}
                    onChange={(val) => {
                      formik.setFieldValue('students', val);
                    }}
                    multiple
                    formControlProps={{ fullWidth: true, sx: { minWidth: '200px' } }}
                  />
                  {formik.touched.students && formik.errors.students && (
                    <FormHelperText error>{String(formik.errors.students)}</FormHelperText>
                  )}
                </Grid>
              </>
            )}
            <Grid item xs={12} md={6}>
              <DatePicker
                label="Meeting Date"
                name="meetingDate"
                value={formik.values.meetingDate}
                onChange={(newValue) => {
                  formik.setFieldValue('meetingDate', newValue);
                }}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    size: 'small',
                  },
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TimePicker
                label="Meeting Time"
                format="HH:mm"
                name="meetingTime"
                value={formik.values.meetingTime}
                onChange={(newValue) => {
                  formik.setFieldValue('meetingTime', newValue);
                }}
                views={['hours', 'minutes']}
                slotProps={{ textField: { fullWidth: true, size: 'small' } }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl component="fieldset">
                <FormLabel component="legend">Meeting Mode</FormLabel>
                <RadioGroup
                  row
                  name="meetingType"
                  value={formik.values.meetingType}
                  onChange={(e) => {
                    const mode = e.target.value;
                    formik.setFieldValue('meetingType', mode); // Sync meetingType with mode
                  }}
                >
                  <FormControlLabel value="virtual" control={<Radio />} label="Virtual" />
                  <FormControlLabel value="offline" control={<Radio />} label="Offline" />
                </RadioGroup>
              </FormControl>
            </Grid>
            {formik.values.meetingType === 'virtual' && (
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Meeting Link"
                  name="link"
                  value={formik.values.link}
                  onChange={formik.handleChange}
                  size="small"
                />
              </Grid>
            )}

            {formik.values.meetingType === 'offline' && (
              <Grid item xs={12} md={6}>
                <CustomSelect
                  label="Select Classroom"
                  options={[
                    { value: 'A101', label: 'A101' },
                    { value: 'A102', label: 'A102' },
                    { value: 'B101', label: 'B102' },
                  ]}
                  value={formik.values.classRoom}
                  onChange={(val) => {
                    formik.setFieldValue('classRoom', val);
                  }}
                  formControlProps={{ fullWidth: true, sx: { minWidth: '200px' } }}
                />
              </Grid>
            )}
            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formik.values.isRecurring}
                    onChange={(e) => {
                      formik.setFieldValue('isRecurring', e.target.checked);
                    }}
                  />
                }
                label="Repeat Meeting"
              />
            </Grid>
            {formik.values.isRecurring && (
              <>
                <Grid item xs={12} md={6}>
                  <CustomSelect
                    label="Select Frequency"
                    options={[
                      { value: 'Daily', label: 'Daily' },
                      { value: 'Weekly', label: 'Weekly' },
                      { value: 'Monthly', label: 'Monthly' },
                    ]}
                    value={formik.values.repeatFrequency}
                    onChange={(val) => {
                      formik.setFieldValue('repeatFrequency', val);
                    }}
                    formControlProps={{ fullWidth: true, sx: { minWidth: '200px' } }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <DatePicker
                    label="Last Date"
                    name="repeatUntil"
                    value={formik.values.repeatUntil}
                    onChange={(newValue) => {
                      formik.setFieldValue('repeatUntil', newValue);
                    }}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        size: 'small',
                      },
                    }}
                  />
                </Grid>
              </>
            )}
          </Grid>
        </Scrollbar>
        <DialogActions>
          <Button type="submit" variant="contained">
            {isEdit ? 'Update' : 'Create'} Meeting
          </Button>
        </DialogActions>
      </form>
    </Box>
  );
};

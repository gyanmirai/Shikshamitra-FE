import React, { FC, useState } from 'react';

import { DatePicker, TimePicker } from '@mui/x-date-pickers';
import {
  Box,
  Radio,
  Button,
  Checkbox,
  TextField,
  RadioGroup,
  Typography,
  DialogActions,
  FormControlLabel,
  Switch,
  MenuList,
  ListItemText,
  MenuItem,
} from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { Iconify } from 'src/components/iconify';
import { UploadBox } from 'src/components/upload';
import { Scrollbar } from 'src/components/scrollbar';
import CustomDialog from 'src/components/customDialog';
import CustomSelect from 'src/components/custom-select';
import CustomizableTable from 'src/components/customizabaleTable';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { useGetClassQuery } from 'src/redux/class/classApi';
import { Division, Standards } from 'src/types/school';
import { useFormik } from 'formik';
import ThreeDotsActions from 'src/components/three-dots-actions';
import dayjs, { Dayjs } from 'dayjs';

interface Assignment {
  class: string;
  division: string;
  assignmentTitle: string;
  subject: string;
  assignmentDesc: string;
  dueDate: Dayjs | null;
  time: Dayjs | null;
  submissionType: string;
  status: string;
}

const assignmentInitialValues: Assignment = {
  class: "",
  division: "",
  assignmentTitle: "",
  subject: "",
  assignmentDesc: "",
  dueDate: null,
  time: null,
  submissionType: "",
  status: "draft"
}

const HomeworkCreation = () => {
  const [publishStatus, setPublishStatus] = useState<{ [key: number]: boolean }>({});
  const dialog = useBoolean();
  const [assignmentData, setAssignmentData] = useState<Assignment[]>([]);

  const handleSwitchChange = (rowId: string) => {

    setPublishStatus(prevStatus => ({
      ...prevStatus,
      [rowId]: !prevStatus[parseInt(rowId)], 
    }));
  };

  const handleSubmit = (values: Assignment, status: 'draft' | 'publish') => {
    console.log("handle submit calls===", values, status);
    const updatedValues = { ...values, status };
    setAssignmentData([...assignmentData, updatedValues]);
    dialog.onFalse();
  }
  return (
    <Box>
      <Box display="flex" gap={2} alignItems="center" justifyContent="flex-end">
        <Button variant="contained" onClick={dialog.onTrue}>
          Create New Assignment
        </Button>
      </Box>
      <CustomizableTable
        columns={[
          { id: 'class', label: 'Class' },
          { id: 'division', label: 'Division' },
          { id: 'assignmentTitle', label: 'Assignment Title' },
          { id: 'subject', label: 'Subject' },
          { id: 'assignmentDesc', label: 'Assignment Description' },
          { id: 'dueDate', label: 'Due Date' },
          { id: 'time', label: 'time' },
          { id: 'submissionType', label: 'Submission Type' },
          {
            id: 'status', label: "Status", render(value,row) {
              const isPublish = publishStatus[row.id] || row.status === "publish";
              return (
                <>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography sx={{ mr: 2 }} fontSize={10}>Draft</Typography>
                    <Switch
                      size='small'
                      checked={isPublish}
                      onChange={(e)=>{handleSwitchChange(row.id)}}
                      inputProps={{ 'aria-label': 'Toggle view' }}
                    />
                    <Typography sx={{ ml: 1 }} fontSize={10}>Publish</Typography>
                  </Box>
                </>
              )
            },
          },
          {
            id: 'action',
            label: 'Action',
            render(value, row) {
              return (
                <ThreeDotsActions
                  placement="right-top"
                  actions={() => (
                    <MenuList>
                      <MenuItem>
                        <Iconify icon="solar:pen-bold" />
                        <ListItemText>Edit</ListItemText>
                      </MenuItem>
                    </MenuList>
                  )}
                />
              );
            },
          },]}
        data={assignmentData}
      />
      <CustomDialog title="New Assignment" open={dialog.value} handleClose={dialog.onFalse} maxWidth={"md"}>
        <HomeWorkCreationForm onsubmit={handleSubmit} />
      </CustomDialog>
    </Box >
  );
};

export default HomeworkCreation;

interface HomeWorkCreationFormProps {
  onsubmit: (values: Assignment, status: 'draft' | 'publish') => void
}

const HomeWorkCreationForm: React.FC<HomeWorkCreationFormProps> = ({ onsubmit }) => {
  const [classes, setClasses] = useState<string>("");
  const [division, setDivision] = useState<string>("");
  const [divisionOptions, setDivisionOptions] = useState<Division[]>([])
  const { data: classData, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetClassQuery,
  });

  const formik = useFormik({
    initialValues: assignmentInitialValues,
    onSubmit: values => {
      console.log("values-------------", values);
    }
  })



  return (
    <Box>
      <Scrollbar sx={{ p: 2, bgcolor: 'background.neutral', height: "300px" }}>
        <Box display="flex" flexDirection="column" gap={2}>
          <CustomSelect
            label="Class"
            options={classData?.items || []}
            value={classes}
            isLoading={isLoading}
            labelKey="name"
            valueKey="id"
            onChange={(val) => {
              const selectedClass: Standards = classData.items.find((i: Standards) => i.id === val);
              formik.setFieldValue('class', selectedClass?.name || '');
              setClasses(val as string)
              setDivisionOptions(selectedClass?.divisions || [])
            }}
            formControlProps={{ fullWidth: true, sx: { maxWidth: 'unset' } }}
          />
          <CustomSelect
            label="Division"
            disabled={!formik.values.class}
            labelKey="name"
            valueKey="id"
            // multiple={true}
            options={divisionOptions}
            value={division}
            onChange={(val) => {
              const selectedDivision = divisionOptions.find((i: Division) => i.id === val);
              formik.setFieldValue('division', selectedDivision?.name || '');
              setDivision(val as string)
            }}
            formControlProps={{ fullWidth: true, sx: { maxWidth: 'unset' } }}
          />
          <TextField label="Assignment Title" size="small" name='assignmentTitle' value={formik.values.assignmentTitle} onChange={formik.handleChange} />
          <CustomSelect
            label="Subject"
            options={[
              { value: "math", label: "Math" },
              { value: "science", label: "Science" }
            ]}
            value={formik.values.subject}
            onChange={(val) => { formik.setFieldValue('subject', val) }}
            formControlProps={{ fullWidth: true, sx: { maxWidth: 'unset' } }}
          />
          <TextField label="Assignment Description" fullWidth multiline rows={4} name='assignmentDesc' value={formik.values.assignmentDesc} onChange={formik.handleChange} />
          <UploadBox
            onDrop={() => { }}
            placeholder={
              <Box
                sx={{
                  gap: 0.5,
                  display: 'flex',
                  alignItems: 'center',
                  color: 'text.disabled',
                  flexDirection: 'column',
                }}
              >
                <Iconify icon="eva:cloud-upload-fill" width={40} />
                <Typography variant="body2">Drag Your Document</Typography>
              </Box>
            }
            sx={{
              py: 2.5,
              width: '100%',
              height: 'auto',
              borderRadius: 1.5,
            }}
          />
          <DatePicker
            name='dueDate'
            label="Due Date"
            slotProps={{ textField: { fullWidth: true, size: 'small' } }}
            format="DD/MM/YYYY"
            value={formik.values.dueDate ? dayjs(formik.values.dueDate) : null}
            onChange={(date) => {
              const formattedDate = date ? date.format('YYYY-MM-DD') : null;
              formik.setFieldValue('dueDate', formattedDate)
            }}
          />
          <TimePicker
            name='time'
            label="Time Picker"
            slotProps={{ textField: { fullWidth: true, size: 'small' } }}
            value={formik.values.time ? dayjs(formik.values.time) : null}
            onChange={(time) => {
              const formattedTime = time ? time.format('HH:mm') : null;
              formik.setFieldValue('time', formattedTime)
            }}
          />

          <Typography variant="subtitle1">Submission Type</Typography>
          <RadioGroup row value={formik.values.submissionType} onChange={(e) => formik.setFieldValue('submissionType', e.target.value)}>
            <FormControlLabel value="online_text" control={<Radio defaultChecked/>} label="Online text" />
            <FormControlLabel value="file_upload" control={<Radio />} label="File upload" />
            <FormControlLabel
              value="in_person"
              control={<Radio />}
              label="In-person submission"
            />
          </RadioGroup>
        </Box>
      </Scrollbar>
      <DialogActions>
        <Button variant="contained"
          onClick={() => {
            onsubmit(formik.values, 'draft')
          }}
        >
          Save Draft
        </Button>
        <Button variant="contained"
          onClick={() => {
            onsubmit(formik.values, 'publish')
          }}
        >
          Publish
        </Button>
      </DialogActions>
    </Box>
  )
}
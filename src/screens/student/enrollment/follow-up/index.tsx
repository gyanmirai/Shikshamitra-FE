'use client';

import type { Dayjs } from 'dayjs';
import type { LabelColor } from 'src/components/label';

import dayjs from 'dayjs';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import React, { useState } from 'react';
import { useDispatch } from 'react-redux';

import { LoadingButton } from '@mui/lab';
import { Add } from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers';
import {
  Box,
  Button,
  Avatar,
  TextField,
  IconButton,
  Typography,
  DialogActions,
} from '@mui/material';

import { dateFormat, dateConvertor } from 'src/utils/dateConvertor';

import { varAlpha } from 'src/theme/styles';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { StudentInquiryApi } from 'src/redux/student/inquiry/inquiry-api';
import { InquiryStatusType, InquiryStatusTypeOptions } from 'src/enums/inquiry-status-type';
import {
  useGetFollowUpQuery,
  useAddFollowUpMutation,
  useGetAllFollowUpQuery,
} from 'src/redux/student/follow-up/follow-up-api';

import { Label } from 'src/components/label';
import { Scrollbar } from 'src/components/scrollbar';
import CustomSelect from 'src/components/custom-select';
import CustomizableTable from 'src/components/customizabaleTable';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

const FollowUpScreen: React.FC = () => {
  const [, setSelectedInquiry] = useState<any>(null);
  const [openDialog, setOpenDialog] = useState(false);

  const { data } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetAllFollowUpQuery,
  });
  console.log('🚀 ~ data:', data);

  // Dummy data
  const dummyData = [
    {
      id: 1,
      name: 'John Doe',
      board: 'CBSE',
      medium: 'English',
      organization: 'Primary',
      class: '10th',
      status: 'Interested',
      remark: 'Wants to join next month',
      reminderDate: '2023-06-15',
    },
    {
      id: 2,
      name: 'Jane Smith',
      board: 'ICSE',
      medium: 'English',
      organization: 'Pre-Primary',
      class: '12th',
      status: 'Pending',
      remark: 'Needs more information',
      reminderDate: '2023-06-20',
    },
    {
      id: 3,
      name: 'Mike Johnson',
      board: 'State Board',
      medium: 'Hindi',
      organization: 'Primary',
      class: '8th',
      status: 'Not Interested',
      remark: 'Prefers another school',
      reminderDate: null,
    },
    {
      id: 4,
      name: 'Sarah Brown',
      board: 'CBSE',
      medium: 'English',
      organization: 'Secondary',
      class: '11th',
      status: 'Interested',
      remark: 'Completed admission process',
      reminderDate: null,
    },
    {
      id: 5,
      name: 'Alex Lee',
      board: 'IB',
      medium: 'English',
      organization: 'High School',
      class: '9th',
      status: 'Pending',
      remark: 'Waiting for seat availability',
      reminderDate: '2023-07-01',
    },
  ];

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedInquiry(null);
  };
  return (
    <Box>
      <CustomBreadcrumbs
        heading="Follow Up"
        links={[{ name: 'Student' }, { name: 'Student Enrollment' }, { name: 'Follow Up' }]}
        sx={{ px: 1, mb: 2 }}
      />
      <CustomizableTable
        tableId="followUpTable"
        columns={[
          { id: 'name', label: 'Name' },
          { id: 'board', label: 'Board' },
          { id: 'medium', label: 'Medium' },
          { id: 'organization', label: 'Organization' },
          { id: 'class', label: 'class' },
          // { id: 'status', label: 'Status' },
          { id: 'remark', label: 'Remark' },
          { id: 'reminderDate', label: 'Reminder Date' },
          {
            id: 'status',
            label: 'Status',
            render(value, row) {
              let color: LabelColor = 'success';
              if (value === 'Interested') {
                color = 'success';
              } else if (value === 'Pending') {
                color = 'warning';
              } else {
                color = 'error';
              }
              return <Label color={color}>{value}</Label>;
            },
          },
          {
            id: 'conversation',
            label: 'Conversation',
            isSort: false,
            align: 'center',
            render(value, row) {
              return (
                <IconButton
                  sx={{
                    backgroundColor: (theme) => varAlpha(theme.palette.primary.mainChannel, 0.3),
                    color: (theme) => theme.palette.primary.main,
                    '&:hover': {
                      backgroundColor: (theme) => varAlpha(theme.palette.primary.mainChannel, 0.3),
                    },
                    height: '24px',
                    width: '24px',
                  }}
                  onClick={() => setOpenDialog(true)}
                >
                  <Add sx={{ height: '18px', width: '18px' }} />
                </IconButton>
              );
            },
          },
        ]}
        data={dummyData}
      />

      {/* <CustomDialog open={openDialog} handleClose={handleCloseDialog} title="Communication History">
        <CommunicationForm handleCloseDialog={handleCloseDialog} />
      </CustomDialog> */}
    </Box>
  );
};

export default FollowUpScreen;

interface IFollowUpResponse {
  followUps: {
    message: string;
    author: string;
    timestamp: string;
  }[];
  inquiryStatusType: number;
  dueDate: string;
}
export const CommunicationForm = ({
  handleCloseDialog,
  studentEnrollmentId,
}: {
  handleCloseDialog: () => void;
  studentEnrollmentId: string;
}) => {
  const [addFollowUp, { isLoading: isAddLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useAddFollowUpMutation,
  });
  const dispatch = useDispatch();
  const { data, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetFollowUpQuery,
    params: studentEnrollmentId,
    options: {
      skip: !studentEnrollmentId,
    },
  });
  const formik = useFormik<{
    msg: string;
    status: InquiryStatusType;
    dueDate: Dayjs | null;
  }>({
    initialValues: {
      msg: '',
      status: data?.inquiryStatusType ?? InquiryStatusType.Pending,
      dueDate: data?.dueDate ? dayjs(data?.dueDate) : null,
    },
    validationSchema: Yup.object({
      msg: Yup.string().required('Message is required'),
      status: Yup.string().required('Status is required'),
      dueDate: Yup.string().required('Due Date is required'),
    }),
    enableReinitialize: true,
    onSubmit: async (values) => {
      console.log('Form values:', values);
      try {
        await addFollowUp({
          studentEnrollmentId,
          body: {
            message: values.msg,
            inquiryStatusType: values.status,
            dueDate: dateConvertor((values.dueDate as Dayjs).format(dateFormat)),
          },
        }).unwrap();
        dispatch(StudentInquiryApi.util.invalidateTags(['Student-Inquiry']));
        handleCloseDialog();
      } catch (error) {
        console.log('Error submitting form:', error);
      }
    },
  });

  return (
    <Box component="form" onSubmit={formik.handleSubmit}>
      <Scrollbar
        sx={{
          bgcolor: 'background.neutral',

          position: 'relative',
          height: '350px',
          p: 2,
        }}
      >
        {isLoading ? (
          <Box className="loader" />
        ) : (
          data?.followUps?.map((followUp: IFollowUpResponse['followUps'][0], index: number) => (
            <Box key={index} py={1} borderBottom={1} borderColor="divider">
              <Box display="flex" alignItems="center" gap={1}>
                <Avatar />
                <Box display="flex" flexDirection="column">
                  <Typography variant="subtitle1">{followUp?.author}</Typography>
                  <Typography component="span" variant="subtitle2" color="text.secondary">
                    {dayjs(followUp?.timestamp).format('DD-MM-YYYY')}
                  </Typography>
                </Box>
              </Box>
              <Typography variant="body2" sx={{ mt: 1 }}>
                {followUp?.message}
              </Typography>
            </Box>
          ))
        )}
      </Scrollbar>
      <Box
        sx={{
          p: 2,
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          flexDirection: 'column',
        }}
      >
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Follow Up Message"
          size="small"
          value={formik.values.msg}
          name="msg"
          onChange={formik.handleChange}
          multiline
          rows={2}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              formik.handleSubmit();
            }
          }}
          error={!!formik.errors.msg && formik.touched.msg}
          helperText={formik.touched.msg && formik.errors.msg}
        />
        <DatePicker
          label="Due Date"
          slotProps={{
            textField: {
              size: 'small',
              fullWidth: true,
              helperText:
                formik.touched.dueDate && formik.errors.dueDate ? formik.errors.dueDate : '',
              error: formik.touched.dueDate && !!formik.errors.dueDate,
            },
          }}
          value={formik.values.dueDate}
          format="DD-MM-YYYY"
          onChange={(newValue) => formik.setFieldValue('dueDate', newValue)}
        />
        <CustomSelect
          options={InquiryStatusTypeOptions}
          value={formik.values.status}
          onChange={(val) => {
            formik.setFieldValue('status', val);
          }}
          label="Change Status"
          formControlProps={{ sx: { maxWidth: 'unset' }, fullWidth: true }}
        />
      </Box>
      <DialogActions>
        <Button onClick={handleCloseDialog} variant="outlined" color="error">
          Close
        </Button>
        <LoadingButton loading={isAddLoading} type="submit" variant="contained">
          Submit
        </LoadingButton>
      </DialogActions>
    </Box>
  );
};

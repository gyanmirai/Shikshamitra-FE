'use client';

import type { Dayjs } from 'dayjs';
import type { LabelColor } from 'src/components/label';

import dayjs from 'dayjs';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { useDispatch } from 'react-redux';
import React, { useMemo, useState } from 'react';

import { Add } from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers';
import {
  Box,
  Paper,
  Button,
  TextField,
  IconButton,
  Typography,
  DialogActions,
} from '@mui/material';
import {
  Timeline,
  TimelineDot,
  TimelineItem,
  LoadingButton,
  TimelineContent,
  TimelineConnector,
  TimelineSeparator,
  TimelineOppositeContent,
} from '@mui/lab';

import { GlobalIcons } from 'src/utils/icons';
import { dateFormat, dateConvertor } from 'src/utils/dateConvertor';

import { varAlpha } from 'src/theme/styles';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { StudentInquiryApi } from 'src/redux/student/inquiry/inquiry-api';
import {
  FollowUpStatusType,
  FollowUpStatusTypeColors,
  FollowUpStatusTypeOptions,
} from 'src/enums/inquiry-status-type';
import {
  useGetFollowUpQuery,
  useAddFollowUpMutation,
  useGetAllFollowUpQuery,
} from 'src/redux/student/follow-up/follow-up-api';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import CustomDialog from 'src/components/customDialog';
import CustomSelect from 'src/components/custom-select';
import CustomizableTable from 'src/components/customizabaleTable';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import type { IInquiryData } from '../Inquiry';

const FollowUpScreen: React.FC = () => {
  const [selectedInquiry, setSelectedInquiry] = useState<any>(null);
  const [openDialog, setOpenDialog] = useState(false);

  const { data, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetAllFollowUpQuery,
  });

  const tableData = useMemo(
    () =>
      data?.items?.map((followUps: IInquiryData) => ({
        ...followUps,
        name: `${followUps?.firstName} ${followUps?.lastName}`,
        dueDateValue: dayjs(followUps?.dueDate).format('DD-MM-YYYY'),
      })) || [],
    [data?.items]
  );

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedInquiry(null);
  };
  return (
    <Box>
      <CustomBreadcrumbs
        heading="Follow Up"
        description="Follow up with students and parents to ensure their inquiries are addressed promptly and effectively."
        links={[{ name: 'Student' }, { name: 'Student Enrollment' }, { name: 'Follow Up' }]}
        sx={{ px: 1, mb: 2 }}
      />
      <CustomizableTable
        tableId="followUpTable"
        noDataText={<>No Follow Up Data Found </>}
        searchFieldProps={{
          placeholder: 'Search by Name, Board, Medium, Organization, Class..',
          label: 'Search by Name, Board, Medium, Organization, Class..',
          sx: {
            maxWidth: '400px',
            width: '100%',
          },
        }}
        isLoading={isLoading}
        columns={[
          { id: 'name', label: 'Name' },
          { id: 'educationBoard.name', label: 'Board' },
          { id: 'educationMedium.name', label: 'Medium' },
          { id: 'organization', label: 'Organization' },
          { id: 'standard.name', label: 'class' },
          { id: 'remark', label: 'Remark' },
          {
            id: 'dueDateValue',
            label: 'Reminder Date',
            filterType: 'date',
            minWidth: '180px',
            align: 'left',
          },
          {
            id: 'followUpStatusType',
            label: 'Status',
            filterType: 'enum',
            enumOptions: FollowUpStatusTypeOptions,
            minWidth: '180px',
            align: 'left',
            render(value, row) {
              const color = FollowUpStatusTypeColors[value as FollowUpStatusType] as LabelColor;

              return <Label color={color}>{FollowUpStatusType[value]}</Label>;
            },
          },
          {
            id: 'conversation',
            label: 'Conversation',
            isSort: false,
            align: 'center',
            isFilter: false,
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
                  onClick={() => {
                    setSelectedInquiry(row.id);
                    setOpenDialog(true);
                  }}
                >
                  <Add sx={{ height: '18px', width: '18px' }} />
                </IconButton>
              );
            },
          },
        ]}
        data={tableData}
      />{' '}
      <CustomDialog open={openDialog} handleClose={handleCloseDialog} title="Communication History">
        <CommunicationForm
          handleCloseDialog={handleCloseDialog}
          studentEnrollmentId={selectedInquiry}
        />
      </CustomDialog>
    </Box>
  );
};

export default FollowUpScreen;

interface IFollowUpResponse {
  followUps: {
    message: string;
    author: string;
    timestamp: string;
    dueDate: string;
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
    status: FollowUpStatusType;
    dueDate: Dayjs | null;
  }>({
    initialValues: {
      msg: '',
      status: data?.inquiryStatusType ?? FollowUpStatusType.Pending,
      dueDate: data?.dueDate ? dayjs(data?.dueDate) : null,
    },
    validationSchema: Yup.object({
      msg: Yup.string().required('Message is required'),
      status: Yup.string().required('Status is required'),
      dueDate: Yup.string(),
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
          // bgcolor: 'background.neutral',

          position: 'relative',
          height: '350px',
          p: 2,
        }}
      >
        {isLoading ? (
          <Box className="loader" />
        ) : (
          <Timeline>
            {data?.followUps?.map((item: IFollowUpResponse['followUps'][0], index: number) => (
              <TimelineItem key={index}>
                <TimelineOppositeContent>
                  <Typography sx={{ color: 'text.primary' }}>
                    {dayjs(item?.timestamp).format('DD-MM-YYYY')}
                  </Typography>
                  <Typography sx={{ color: 'text.secondary' }}>{item?.author}</Typography>
                </TimelineOppositeContent>
                <TimelineSeparator>
                  <TimelineDot color="primary" />
                  {data?.followUps.length === index ? null : <TimelineConnector />}
                </TimelineSeparator>
                <TimelineContent>
                  <Paper
                    sx={{
                      p: 3,
                      bgcolor: (theme) => varAlpha(theme.vars.palette.grey['500Channel'], 0.12),
                    }}
                  >
                    <Typography> {item?.message}</Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      Due Date : {dayjs(item.dueDate).format('DD-MM-YYYY')}
                    </Typography>
                  </Paper>
                </TimelineContent>
              </TimelineItem>
            ))}
          </Timeline>
          // data?.followUps?.map((followUp: IFollowUpResponse['followUps'][0], index: number) => (
          //   <Box key={index} py={1} borderBottom={1} borderColor="divider">
          //     <Box display="flex" alignItems="center" gap={1}>
          //       <Avatar />
          //       <Box display="flex" flexDirection="column">
          //         <Typography variant="subtitle1">{followUp?.author}</Typography>
          //         <Typography component="span" variant="subtitle2" color="text.secondary">
          //           {dayjs(followUp?.timestamp).format('DD-MM-YYYY')}
          //         </Typography>
          //       </Box>
          //     </Box>
          //     <Typography variant="body2" sx={{ mt: 1 }}>
          //       {followUp?.message}
          //     </Typography>
          //   </Box>
          // ))
        )}
      </Scrollbar>
      <Box
        sx={{
          p: 2,
          display: 'flex',
          alignItems: 'center',
          gap: 3,
          flexDirection: 'column',
        }}
      >
        <TextField
          fullWidth
          // sx={{ marginBottom: '10px' }}
          variant="outlined"
          placeholder="Notes"
          size="small"
          value={formik.values.msg}
          name="msg"
          onChange={formik.handleChange}
          multiline
          rows={2}
          autoFocus
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              formik.handleSubmit();
            }
          }}
          error={!!formik.errors.msg && formik.touched.msg}
          helperText={formik.touched.msg && formik.errors.msg}
        />
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            width: '100%',
          }}
        >
          <DatePicker
            label="Next Reminder Date"
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
            options={FollowUpStatusTypeOptions}
            value={formik.values.status}
            isLoading={isLoading}
            sx={{ minWidth: 200, flex: 1 }}
            onChange={(newValue) => {
              formik.setFieldValue('status', newValue);
            }}
            size="small"
            label="Status"
          />
        </Box>
      </Box>

      <DialogActions sx={{ p: 2 }}>
        <Button
          startIcon={<Iconify icon={GlobalIcons.cancel} />}
          onClick={handleCloseDialog}
          variant="outlined"
          size="small"
        >
          Cancel
        </Button>
        <LoadingButton
          startIcon={<Iconify icon={GlobalIcons.submit} />}
          loading={isAddLoading}
          type="submit"
          variant="contained"
          size="small"
        >
          Submit
        </LoadingButton>
      </DialogActions>
    </Box>
  );
};

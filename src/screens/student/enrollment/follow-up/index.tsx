'use client';

import type { Dayjs } from 'dayjs';
import type { LabelColor } from 'src/components/label';

import dayjs from 'dayjs';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { useDispatch } from 'react-redux';
import { Add } from '@mui/icons-material';
import { varAlpha } from 'src/theme/styles';
import { Label } from 'src/components/label';
import { GlobalIcons } from 'src/utils/icons';
import React, { useMemo, useState } from 'react';
import { DatePicker } from '@mui/x-date-pickers';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import CustomSelect from 'src/components/custom-select';
import { shikshaMitraToast } from 'src/components/toast';
import { EmptyContent } from 'src/components/empty-content';
import ShakingTextField from 'src/components/shaking-text-field';
import CustomizableTable from 'src/components/customizabaleTable';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { dateFormat, dateConvertor } from 'src/utils/dateConvertor';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { StudentInquiryApi } from 'src/redux/student/inquiry/inquiry-api';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import {
  FollowUpStatusType,
  FollowUpStatusTypeColors,
  FollowUpStatusTypeOptions,
} from 'src/enums/inquiry-status-type';
import {
  Box,
  Grid,
  Paper,
  Button,
  TextField,
  IconButton,
  Typography,
  DialogActions,
} from '@mui/material';
import {
  useGetFollowUpQuery,
  useAddFollowUpMutation,
  useGetAllFollowUpQuery,
} from 'src/redux/student/follow-up/follow-up-api';
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

import type { IInquiryData } from '../Inquiry';
import type { IInquiryResponse } from '../Inquiry/type';
import type { IGeneralInformationResponse } from '../register/type';

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
        sx={{ mb: 2 }}
      />
      <CustomizableTable
        tableId="followUpTable"
        noDataText={<>No Follow Up Data Found </>}
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
                    backgroundColor: (theme) =>
                      varAlpha(theme.vars.palette.primary.mainChannel, 0.3),
                    color: (theme) => theme.palette.primary.main,
                    '&:hover': {
                      backgroundColor: (theme) =>
                        varAlpha(theme.vars.palette.primary.mainChannel, 0.3),
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
  followUps: { message: string; author: string; timestamp: string; dueDate: string }[];
  inquiryStatusType: number;
  dueDate: string;
}
export const CommunicationForm = ({
  handleCloseDialog,
  studentEnrollmentId,
  selectedStudent,
  isStatus = true,
}: {
  handleCloseDialog: () => void;
  studentEnrollmentId: string;
  isStatus?: boolean;
  selectedStudent?: IInquiryResponse | IGeneralInformationResponse | null;
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
    options: { skip: !studentEnrollmentId },
  });
  const formik = useFormik<{ msg: string; status: FollowUpStatusType; dueDate: Dayjs | null }>({
    initialValues: {
      msg: '',
      status: data?.inquiryStatusType ?? FollowUpStatusType.Pending,
      dueDate: data?.dueDate ? dayjs(data?.dueDate) : null,
    },
    validationSchema: Yup.object({
      msg: Yup.string().trim().min(1, 'Notes are required').required('Notes are required'),
      status: Yup.string().required('Status is required'),
      dueDate: Yup.string().required('Next Reminder Date is required'),
    }),
    enableReinitialize: true,
    onSubmit: async (values) => {
      try {
        await addFollowUp({
          studentEnrollmentId,
          body: {
            message: values.msg,
            inquiryStatusType: isStatus ? values.status : FollowUpStatusType.Interested,
            dueDate: dateConvertor((values.dueDate as Dayjs).format(dateFormat)),
          },
        }).unwrap();
        dispatch(StudentInquiryApi.util.invalidateTags(['Student-Inquiry']));
        shikshaMitraToast.success({
          message: `Note added successfully for ${selectedStudent?.firstName} ${selectedStudent?.lastName} `,
        });
        handleCloseDialog();
      } catch (error) {
        console.error(error);
      }
    },
  });

  return (
    <Box>
      <DialogScrollContent sx={{ p: 0 }}>
        <Scrollbar
          sx={{
            // bgcolor: 'background.neutral',

            position: 'relative',
            height: '350px',
          }}
        >
          {isLoading ? (
            <Box className="loader" />
          ) : (
            <Timeline>
              {data?.followUps?.length ? (
                data?.followUps?.map((item: IFollowUpResponse['followUps'][0], index: number) => (
                  <TimelineItem key={index}>
                    <TimelineOppositeContent>
                      <Typography sx={{ color: 'text.primary' }}>
                        {dayjs(item?.timestamp).format('DD-MM-YYYY')}
                      </Typography>
                      <Typography sx={{ color: 'text.secondary' }}>
                        {item?.author
                          ? item.author.charAt(0).toUpperCase() + item.author.slice(1)
                          : ''}
                      </Typography>
                    </TimelineOppositeContent>
                    <TimelineSeparator>
                      <TimelineDot color="primary" />
                      {data?.followUps.length === index ? null : <TimelineConnector />}
                    </TimelineSeparator>
                    <TimelineContent>
                      <Paper
                        sx={{
                          p: 2,
                          bgcolor: (theme) => varAlpha(theme.vars.palette.grey['500Channel'], 0.12),
                        }}
                      >
                        <Typography> {item?.message}</Typography>
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                          Reminder Date : {dayjs(item.dueDate).format('DD-MM-YYYY')}
                        </Typography>
                      </Paper>
                    </TimelineContent>
                  </TimelineItem>
                ))
              ) : (
                <EmptyContent title="No Notes history yet." />
              )}
            </Timeline>
          )}
        </Scrollbar>

        <Grid container spacing={3} p={2}>
          <Grid size={{ xs: 12 }}>
            <ShakingTextField error={!!(formik.touched.msg && formik.errors.msg) || false}>
              <TextField
                fullWidth
                variant="outlined"
                label="Notes *"
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
            </ShakingTextField>
          </Grid>

          <Grid size={{ xs: 12, md: isStatus ? 6 : 12 }}>
            <ShakingTextField error={!!(formik.touched.dueDate && formik.errors.dueDate) || false}>
              <DatePicker
                label="Next Reminder Date *"
                format="DD/MM/YYYY"
                views={['year', 'month', 'day']}
                value={formik.values.dueDate}
                onChange={(newValue) => {
                  formik.setFieldValue('dueDate', newValue);
                }}
                minDate={dayjs()}
                sx={{ minWidth: 180, width: '100%' }}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    size: 'small',
                    error: !!(formik.touched.dueDate && formik.errors.dueDate) || false,
                    helperText: formik.touched.dueDate && formik.errors.dueDate,
                  },
                }}
              />
            </ShakingTextField>
          </Grid>

          {isStatus && (
            <Grid size={{ xs: 12, md: 6 }}>
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
            </Grid>
          )}
        </Grid>
      </DialogScrollContent>
      <DialogActions>
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
          onClick={(e: any) => formik.handleSubmit(e)}
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

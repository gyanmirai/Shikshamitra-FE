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
import { DatePicker } from '@mui/x-date-pickers';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import CustomSelect from 'src/components/custom-select';
import { shikshaMitraToast } from 'src/components/toast';
import React, { useMemo, useState, useEffect } from 'react';
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
  useGetFollowUpQuery,
  useAddFollowUpMutation,
  useGetAllFollowUpQuery,
} from 'src/redux/student/follow-up/follow-up-api';
import {
  Box,
  Grid,
  Paper,
  Button,
  Skeleton,
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

import type { IGeneralInformationResponse } from '../register/type';
import type { IInquiryData, IInquiryResponse } from '../Inquiry/type';

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
  note: string;
  status: FollowUpStatusType;
  nextReminderDate: string;
  createdAt?: string;
  creatorName?: string;
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
      status: data?.slice(0, 1)?.status ?? FollowUpStatusType.Pending,
      dueDate: data?.slice(0, 1)?.nextReminderDate
        ? dayjs(data?.slice(0, 1)?.nextReminderDate)
        : null,
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
          studentId: studentEnrollmentId,
          body: {
            note: values.msg,
            status: isStatus ? values.status : FollowUpStatusType.Interested,
            nextReminderDate: dateConvertor((values.dueDate as Dayjs).format(dateFormat)),
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

  useEffect(() => {
    if (data?.length) {
      formik.setFieldValue('msg', '');
      formik.setFieldValue('status', data?.slice(0, 1)?.[0]?.status ?? FollowUpStatusType.Pending);
      formik.setFieldValue(
        'dueDate',
        data?.slice(0, 1)?.[0]?.nextReminderDate
          ? dayjs(data?.slice(0, 1)?.[0]?.nextReminderDate)
          : null
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

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
            <Timeline
              sx={{
                [`& .MuiTimelineOppositeContent-root`]: {
                  flex: 0.25,
                  minWidth: 100,
                  textAlign: 'left',
                  pl: 0,
                  pt: 1.5,
                },
              }}
            >
              {[1, 2, 3].map((_, index) => (
                <TimelineItem key={index}>
                  <TimelineOppositeContent>
                    <Skeleton variant="text" width={80} height={20} />
                    <Skeleton variant="text" width={60} height={16} sx={{ mt: 0.5 }} />
                  </TimelineOppositeContent>
                  <TimelineSeparator>
                    <TimelineDot sx={{ bgcolor: 'divider' }} />
                    {index < 2 && <TimelineConnector sx={{ bgcolor: 'divider' }} />}
                  </TimelineSeparator>
                  <TimelineContent sx={{ pb: 3, pr: 0 }}>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 2,
                        bgcolor: (theme) => varAlpha(theme.vars.palette.grey['500Channel'], 0.04),
                        border: (theme) =>
                          `1px solid ${varAlpha(theme.vars.palette.grey['500Channel'], 0.12)}`,
                        borderRadius: 1.5,
                      }}
                    >
                      <Skeleton variant="text" width={100} height={24} sx={{ mb: 1.5 }} />
                      <Skeleton variant="text" width="80%" height={20} />
                      <Skeleton variant="text" width="60%" height={20} sx={{ mb: 1.5 }} />
                      <Skeleton variant="text" width={140} height={16} />
                    </Paper>
                  </TimelineContent>
                </TimelineItem>
              ))}
            </Timeline>
          ) : (
            <Timeline
              sx={{
                [`& .MuiTimelineOppositeContent-root`]: {
                  flex: 0.25,
                  minWidth: 100,
                  textAlign: 'left',
                  pl: 0,
                  pt: 1.5,
                },
              }}
            >
              {data?.length ? (
                data?.map((item: IFollowUpResponse, index: number) => {
                  const colorKey =
                    FollowUpStatusTypeColors[item.status as FollowUpStatusType] || 'primary';
                  return (
                    <TimelineItem key={index}>
                      <TimelineOppositeContent>
                        <Typography
                          variant="subtitle2"
                          sx={{ color: 'text.secondary', fontWeight: 'bold' }}
                        >
                          {dayjs(item?.createdAt || item?.nextReminderDate).format('YYYY-MM-DD')}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{ color: 'text.disabled', fontWeight: 'bold', display: 'block' }}
                        >
                          {dayjs(item?.createdAt || item?.nextReminderDate).format('hh:mm A')}
                        </Typography>
                      </TimelineOppositeContent>
                      <TimelineSeparator>
                        <TimelineDot sx={{ bgcolor: `${colorKey}.main` }} />
                        {data?.length === index + 1 ? null : (
                          <TimelineConnector sx={{ bgcolor: 'divider' }} />
                        )}
                      </TimelineSeparator>
                      <TimelineContent sx={{ pb: 3, pr: 0 }}>
                        <Paper
                          elevation={0}
                          sx={{
                            p: 2,
                            bgcolor: (theme) =>
                              varAlpha(theme.vars.palette.grey['500Channel'], 0.04),
                            border: (theme) =>
                              `1px solid ${varAlpha(theme.vars.palette.grey['500Channel'], 0.12)}`,
                            borderRadius: 1.5,
                          }}
                        >
                          <Typography
                            variant="subtitle2"
                            sx={{
                              color: `${colorKey}.main`,
                              mb: 1.5,
                              fontWeight: 700,
                            }}
                          >
                            {
                              FollowUpStatusType[
                                item.status as unknown as keyof typeof FollowUpStatusType
                              ]
                            }
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{
                              color: 'text.primary',
                              mb: 1.5,
                              fontWeight: 500,
                              lineHeight: 1.5,
                            }}
                          >
                            {item?.note}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Typography
                              variant="caption"
                              sx={{ color: 'text.secondary', fontWeight: 500 }}
                            >
                              • Creator: {item?.creatorName || 'admin'}
                            </Typography>
                          </Box>
                        </Paper>
                      </TimelineContent>
                    </TimelineItem>
                  );
                })
              ) : (
                <EmptyContent title="No notes added yet" />
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
                placeholder="Enter your notes here..."
                inputProps={{ maxLength: 500 }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    formik.handleSubmit();
                  }
                }}
                error={!!formik.errors.msg && formik.touched.msg}
                helperText={
                  formik.touched.msg && formik.errors.msg
                    ? formik.errors.msg
                    : `${formik.values.msg.length}/500 characters`
                }
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
                loading={isLoading}
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

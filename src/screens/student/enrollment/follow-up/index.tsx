'use client';

import type { Dayjs } from 'dayjs';
import type { RootState } from 'src/redux/store';
import type { LabelColor } from 'src/components/label';

import dayjs from 'dayjs';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { Add } from '@mui/icons-material';
import { varAlpha } from 'src/theme/styles';
import { Label } from 'src/components/label';
import { GlobalIcons } from 'src/utils/icons';
import { DatePicker } from '@mui/x-date-pickers';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { useDispatch, useSelector } from 'react-redux';
import CustomSelect from 'src/components/custom-select';
import { shikshaMitraToast } from 'src/components/toast';
import React, { useMemo, useState, useEffect } from 'react';
import { EmptyContent } from 'src/components/empty-content';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import ShakingTextField from 'src/components/shaking-text-field';
import CustomizableTable from 'src/components/customizabaleTable';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { dateFormat, dateConvertor } from 'src/utils/dateConvertor';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';
import { StudentInquiryApi } from 'src/redux/student/inquiry/inquiry-api';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';
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
  const [confirmOpen, setConfirmOpen] = useState(false);

  const { isChanges } = useSelector((state: RootState) => state.confirmPopup);
  const dispatch = useDispatch();

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
    if (isChanges) {
      setConfirmOpen(true);
    } else {
      setOpenDialog(false);
      setSelectedInquiry(null);
    }
  };

  const handleConfirmClose = () => {
    dispatch(setIsChanges(false));
    setOpenDialog(false);
    setSelectedInquiry(null);
    setConfirmOpen(false);
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
      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        icon="warning"
        title="Alert"
        content={
          <Typography variant="body2">
            You have unsaved changes on this step. If you navigate away, your changes will be lost.
            Are you sure you want to continue?
          </Typography>
        }
        action={
          <Button
            variant="contained"
            color="inherit"
            startIcon={<Iconify icon={GlobalIcons.tick} />}
            sx={{
              bgcolor: 'grey.900',
              color: 'common.white',
              '&:hover': { bgcolor: 'grey.800' },
            }}
            size="small"
            onClick={handleConfirmClose}
          >
            Yes
          </Button>
        }
      />
    </Box>
  );
};

export default FollowUpScreen;

interface IFollowUpResponse {
  note: string;
  creationTime: string;
  status: FollowUpStatusType;
  nextReminderDate: string;
  creatorName?: string;
}
export const CommunicationForm = ({
  handleCloseDialog,
  studentEnrollmentId,
  selectedStudent,
}: {
  handleCloseDialog: () => void;
  studentEnrollmentId: string;
  selectedStudent?: IInquiryResponse | IGeneralInformationResponse | null;
}) => {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [addFollowUp, { isLoading: isAddLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useAddFollowUpMutation,
  });
  const dispatch = useDispatch();
  const { isChanges } = useSelector((state: RootState) => state.confirmPopup);
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
      dueDate: Yup.mixed()
        .nullable()
        .required('Next Reminder Date is required')
        .test(
          'isFutureDate',
          'Next Reminder Date cannot be a past date',
          (value) => !value || dayjs(value as any).isAfter(dayjs(), 'day')
        ),
    }),
    enableReinitialize: true,
    onSubmit: async (values) => {
      try {
        await addFollowUp({
          studentId: studentEnrollmentId,
          body: {
            note: values.msg,
            status: values.status,
            nextReminderDate: dateConvertor((values.dueDate as Dayjs).format(dateFormat)),
          },
        }).unwrap();
        dispatch(StudentInquiryApi.util.invalidateTags(['Student-Inquiry']));
        shikshaMitraToast.success({
          message: `Note added successfully for ${selectedStudent?.firstName} ${selectedStudent?.lastName} `,
        });
        dispatch(setIsChanges(false));
        handleCloseDialog();
      } catch (error) {
        console.error(error);
      }
    },
  });

  const handleCancelClick = () => {
    if (isChanges) {
      setConfirmOpen(true);
    } else {
      dispatch(setIsChanges(false));
      handleCloseDialog();
    }
  };

  const handleConfirmCancel = () => {
    dispatch(setIsChanges(false));
    handleCloseDialog();
    setConfirmOpen(false);
  };

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
    <BackPopUpChecked initialValues={formik.initialValues} currentValues={formik.values}>
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
                          {dayjs(item?.creationTime || item?.nextReminderDate).format(
                            'DD MMM YYYY'
                          )}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{ color: 'text.disabled', fontWeight: 'bold', display: 'block' }}
                        >
                          {dayjs(item?.creationTime || item?.nextReminderDate).format('hh:mm A')}
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
                            p: 1,
                            bgcolor: (theme) =>
                              varAlpha(theme.vars.palette.grey['500Channel'], 0.04),
                            border: (theme) =>
                              `1px solid ${varAlpha(theme.vars.palette.grey['500Channel'], 0.12)}`,
                            borderRadius: 1,
                          }}
                        >
                          <Box sx={{ mb: 1.5 }}>
                            <Label color={colorKey as LabelColor}>
                              {
                                FollowUpStatusType[
                                  item.status as unknown as keyof typeof FollowUpStatusType
                                ]
                              }
                            </Label>
                          </Box>
                          <Typography
                            variant="body2"
                            sx={{
                              color: 'text.primary',
                              mb: 2,
                              fontWeight: 500,
                              lineHeight: 1.6,
                              wordBreak: 'break-word',
                              overflowWrap: 'break-word',
                            }}
                          >
                            {item?.note}
                          </Typography>
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                            }}
                          >
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Box
                                sx={{
                                  width: 28,
                                  height: 28,
                                  borderRadius: '50%',
                                  bgcolor: `${colorKey}.main`,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                }}
                              >
                                <Typography
                                  variant="caption"
                                  sx={{ color: 'white', fontWeight: 700, fontSize: '0.7rem' }}
                                >
                                  {(item?.creatorName || 'Admin')
                                    .split(' ')
                                    .map((n: string) => n[0])
                                    .join('')
                                    .toUpperCase()
                                    .slice(0, 2)}
                                </Typography>
                              </Box>
                              <Typography
                                variant="body2"
                                sx={{ color: 'text.secondary', fontWeight: 500 }}
                              >
                                {item?.creatorName || 'Admin'}
                              </Typography>
                            </Box>
                            {item?.nextReminderDate && (
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <Iconify
                                  icon="mdi:calendar-outline"
                                  width={16}
                                  sx={{ color: 'text.disabled' }}
                                />
                                <Typography
                                  variant="caption"
                                  sx={{ color: 'text.secondary', fontWeight: 600 }}
                                >
                                  Remind{' '}
                                  <strong>
                                    {dayjs(item.nextReminderDate).format('DD MMM YYYY')}
                                  </strong>
                                </Typography>
                              </Box>
                            )}
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

          <Grid size={{ xs: 12, md: 6 }}>
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
        </Grid>
      </DialogScrollContent>
      <DialogActions>
        <Button
          startIcon={<Iconify icon={GlobalIcons.cancel} />}
          onClick={handleCancelClick}
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
      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        icon="warning"
        title="Alert"
        content={
          <Typography variant="body2">
            You have unsaved changes on this step. If you navigate away, your changes will be lost.
            Are you sure you want to continue?
          </Typography>
        }
        action={
          <Button
            variant="contained"
            color="inherit"
            startIcon={<Iconify icon={GlobalIcons.tick} />}
            sx={{
              bgcolor: 'grey.900',
              color: 'common.white',
              '&:hover': { bgcolor: 'grey.800' },
            }}
            size="small"
            onClick={handleConfirmCancel}
          >
            Yes
          </Button>
        }
      />
    </BackPopUpChecked>
  );
};

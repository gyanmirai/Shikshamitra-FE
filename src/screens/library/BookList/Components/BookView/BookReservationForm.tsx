import dayjs from 'dayjs';
import { useFormik } from 'formik';
import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { GlobalIcons } from 'src/utils/icons';
import { DatePicker } from '@mui/x-date-pickers';
import { Iconify } from 'src/components/iconify';
import { shikshaMitraToast } from 'src/components/toast';
import ShakingTextField from 'src/components/shaking-text-field';
import { DialogScrollContent } from 'src/components/customDialog';
import CustomizableTable from 'src/components/customizabaleTable';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { useGetAllMembersQuery } from 'src/redux/library/bookList/memberApi';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';
import {
  Box,
  Grid,
  Card,
  Button,
  Avatar,
  TextField,
  Typography,
  CardContent,
  DialogActions,
  CircularProgress,
} from '@mui/material';

import { getReserveBookSchema } from './gerBookReserveValidationSchema';

export interface ReservationBookModalProps {
  onClose: (e: any, isSubmit: boolean) => void;
  editData: any; // IBook type
}

const ReservationBookModal: React.FC<ReservationBookModalProps> = ({ onClose, editData }) => {
  const [searchMember, setSearchMember] = useState('');
  const [selectedMember, setSelectedMember] = useState<any | null>(null);
  const [loadingMember, setLoadingMember] = useState(false);
  const { currentYear } = useSelector((state: any) => state.globalState);
  const { data: memberData, isLoading: memberLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetAllMembersQuery, // ✅ just pass the hook reference
  });

  const formik = useFormik({
    initialValues: {
      memberId: '',
      requestedDate: dayjs(),
      reserveDueDate: null,
    },
    validationSchema: getReserveBookSchema(currentYear),
    onSubmit: (values) => {
      shikshaMitraToast.success({ message: `Book reserved successfully for ${values.memberId}` });
      onClose(null, true);
    },
  });

  const handleMemberSearch = (value: string) => {
    const trimmedValue = value.trim();
    formik.setFieldValue('memberId', trimmedValue); // update Formik for UI

    if (!trimmedValue) return;

    setLoadingMember(true);
    setTimeout(() => {
      const foundMember = memberData.find(
        (member: any) => member.memberId === trimmedValue // use trimmedValue here!
      );

      if (foundMember) {
        setSelectedMember(foundMember);
        formik.setFieldValue('memberId', foundMember.memberId);
      } else {
        setSelectedMember(null);
      }

      setLoadingMember(false);
    }, 400);
  };

  const reservedList = memberData?.filter((member: any) =>
    editData?.reservationMemberIds.includes(member.memberId)
  );

  return (
    <BackPopUpChecked initialValues={formik.initialValues} currentValues={formik.values}>
      <DialogScrollContent>
        <Grid container spacing={3}>
          {/* Member Search */}
          <Grid size={{ xs: 12 }}>
            <TextField
              variant="outlined"
              size="small"
              value={formik.values.memberId}
              onChange={(e) => handleMemberSearch(e.target.value)}
              label="Search Member Id"
              placeholder="Search By Member Id"
              fullWidth
            />
          </Grid>
          {loadingMember ? (
            <Grid size={{ xs: 12 }}>
              <Box display="flex" justifyContent="center" alignItems="center">
                <CircularProgress size={20} />
              </Box>
            </Grid>
          ) : selectedMember ? (
            <Grid size={{ xs: 12 }}>
              <Card variant="outlined" sx={{ boxShadow: 'var(--shadows-8)', p: 2 }}>
                <CardContent sx={{ padding: '0 !important' }}>
                  <Grid container spacing={2}>
                    {/* Avatar / Reservation Icon */}
                    <Grid
                      size={{ xs: 12, md: 2 }}
                      sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                      <Avatar src={selectedMember.avatarUrl} sx={{ width: 80, height: 80 }} />
                    </Grid>

                    {/* Reservation Details */}
                    <Grid size={{ xs: 12, md: 10 }}>
                      <Grid container spacing={1}>
                        <Grid size={{ xs: 12, md: 4 }}>
                          <Typography fontWeight={600}>Reservation Name</Typography>
                          <Typography>{selectedMember.name || 'N/A'}</Typography>
                        </Grid>
                        <Grid size={{ xs: 12, md: 4 }}>
                          <Typography fontWeight={600}>Reservation ID</Typography>
                          <Typography>{selectedMember.reservationId || 'N/A'}</Typography>
                        </Grid>
                        <Grid size={{ xs: 12, md: 4 }}>
                          <Typography fontWeight={600}>Email</Typography>
                          <Typography>{selectedMember.email || 'N/A'}</Typography>
                        </Grid>

                        <Grid size={{ xs: 12, md: 4 }}>
                          <Typography fontWeight={600}>Phone</Typography>
                          <Typography>{selectedMember.contactNo || 'N/A'}</Typography>
                        </Grid>
                        <Grid size={{ xs: 12, md: 4 }}>
                          <Typography fontWeight={600}>Reservation Type</Typography>
                          <Typography>{selectedMember.type || 'N/A'}</Typography>
                        </Grid>
                        <Grid size={{ xs: 12, md: 4 }}>
                          <Typography fontWeight={600}>Reservation Date</Typography>
                          <Typography>{selectedMember.date || 'N/A'}</Typography>
                        </Grid>
                      </Grid>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          ) : formik.values.memberId !== '' ? (
            <Grid size={{ xs: 12 }}>
              <div
                style={{
                  padding: '12px',
                  backgroundColor: '#ffebee',
                  borderRadius: '4px',
                  border: '1px solid #f44336',
                  color: '#d32f2f',
                }}
              >
                Member with ID not found.
              </div>
            </Grid>
          ) : null}
          {/* Requested Date */}
          {/* Requested Date */}
          <Grid size={{ xs: 12, md: 6 }}>
            <ShakingTextField
              error={!!(formik.touched.requestedDate && formik.errors.requestedDate)}
            >
              <DatePicker
                label="Requested Date *"
                format="DD-MM-YYYY"
                value={formik.values.requestedDate}
                onChange={(newValue) => {
                  formik.setFieldValue('requestedDate', newValue);
                  formik.setFieldTouched('requestedDate', false);
                }}
                minDate={dayjs(currentYear?.startDate)}
                maxDate={dayjs(currentYear?.endDate)}
                sx={{ minWidth: 180, width: '100%' }}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    size: 'small',
                    error: !!(formik.touched.requestedDate && formik.errors.requestedDate),
                    helperText: (formik.touched.requestedDate &&
                      formik.errors.requestedDate) as string,
                  },
                }}
              />
            </ShakingTextField>
          </Grid>
          {/* Reserve Due Date */}
          <Grid size={{ xs: 12, md: 6 }}>
            <ShakingTextField
              error={!!(formik.touched.reserveDueDate && formik.errors.reserveDueDate)}
            >
              <DatePicker
                label="Reserve Due Date *"
                format="DD-MM-YYYY"
                value={formik.values.reserveDueDate}
                onChange={(newValue) => {
                  formik.setFieldValue('reserveDueDate', newValue);
                  formik.setFieldTouched('reserveDueDate', false);
                }}
                minDate={dayjs(formik.values.requestedDate || currentYear?.startDate)} // ensures reserve due date is after requested date
                maxDate={dayjs(currentYear?.endDate)}
                sx={{ minWidth: 180, width: '100%' }}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    size: 'small',
                    error: !!(formik.touched.reserveDueDate && formik.errors.reserveDueDate),
                    helperText: (formik.touched.reserveDueDate &&
                      formik.errors.reserveDueDate) as string,
                  },
                }}
              />
            </ShakingTextField>
          </Grid>
          {/* Reserved List Table */}
          <Grid size={12}>
            {reservedList?.length ? (
              <>
                <Typography variant="subtitle1">Reserved List</Typography>
                <CustomizableTable
                  tableId="reserved-members-table"
                  noDataText="No Reserved Members Found"
                  isLoading={memberLoading}
                  columns={[
                    {
                      id: 'memberId',
                      label: 'Member ID',
                      align: 'left',
                      sticky: true,
                      minWidth: 120,
                    },
                    { id: 'name', label: 'Member Name', align: 'left', minWidth: 140 },
                    { id: 'role', label: 'Role', align: 'left' },
                    { id: 'class', label: 'Class', align: 'left' },
                    { id: 'division', label: 'Division', align: 'left' },
                    { id: 'rollNo', label: 'Roll No.', align: 'left', minWidth: 90 },
                    { id: 'grNo', label: 'GR No.', align: 'left', minWidth: 90 },
                    {
                      id: 'accessionNo',
                      label: 'Accession No.',
                      align: 'left',
                      minWidth: 140,
                    },
                    {
                      id: 'reservedBook',
                      label: 'Reserved Book',
                      minWidth: 140,
                      align: 'left',
                      render: (value) => (
                        <Typography variant="caption" fontSize="13px">
                          {typeof value === 'object' ? value?.title || '-' : value || '-'}
                        </Typography>
                      ),
                    },
                    {
                      id: 'requestedDate',
                      label: 'Requested Date',
                      minWidth: 150,
                      align: 'left',
                      filterType: 'date',
                      render: (value) => (
                        <Typography variant="caption" fontSize="13px">
                          {dayjs(value).format('DD-MM-YYYY')}
                        </Typography>
                      ),
                    },
                    {
                      id: 'reserveDueDate',
                      label: 'Reserve Due Date',
                      align: 'left',
                      minWidth: 160,
                      filterType: 'date',
                      render: (value) => (
                        <Typography variant="caption" fontSize="13px">
                          {dayjs(value).format('DD-MM-YYYY')}
                        </Typography>
                      ),
                    },
                  ]}
                  data={reservedList || []}
                />
              </>
            ) : (
              <Typography>No reservations yet</Typography>
            )}
          </Grid>
        </Grid>
      </DialogScrollContent>

      <DialogActions sx={{ p: 2 }}>
        <Button
          variant="outlined"
          size="small"
          onClick={() => onClose(null, false)}
          startIcon={<Iconify icon={GlobalIcons.cancel} />}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          size="small"
          onClick={() => formik.handleSubmit()}
          startIcon={<Iconify icon={GlobalIcons.submit} />}
        >
          Submit
        </Button>
      </DialogActions>
    </BackPopUpChecked>
  );
};

export default ReservationBookModal;

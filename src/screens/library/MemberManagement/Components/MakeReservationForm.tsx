import type { RootState } from 'src/redux/store';

import React from 'react';
import dayjs from 'dayjs';
import { useFormik } from 'formik';
import { useSelector } from 'react-redux';
import { GlobalIcons } from 'src/utils/icons';
import { useTheme } from '@mui/material/styles';
import { DatePicker } from '@mui/x-date-pickers';
import { Iconify } from 'src/components/iconify';
import CustomSelect from 'src/components/custom-select';
import { shikshaMitraToast } from 'src/components/toast';
import ShakingTextField from 'src/components/shaking-text-field';
import { DialogScrollContent } from 'src/components/customDialog';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';
import { Box, Grid, Card, Button, Avatar, Typography, DialogActions } from '@mui/material';
import {
  useGetBookTitleOptionsQuery,
  useGetBookCategoryOptionsQuery,
} from 'src/redux/memberManagement/memberManagementApi';

import { makeReservationValidationSchema } from './MemberManagementSchema';
import { getInitialReservationData } from './MemberManagementInitialValues';

import type { IMakeReservationPayload, IMakeReservationFormProps } from './type';

const MakeReservationForm: React.FC<IMakeReservationFormProps> = ({
  open,
  onClose,
  selectedMember,
}) => {
  const theme = useTheme();

  const { currentYear } = useSelector((state: RootState) => state.globalState);

  const { data: bookCategoryOptions, isLoading: bookCategoryLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetBookCategoryOptionsQuery,
  });

  const { data: bookTitleOptions, isLoading: bookTitleLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetBookTitleOptionsQuery,
  });

  const formik = useFormik<IMakeReservationPayload>({
    initialValues: getInitialReservationData(),
    validationSchema: makeReservationValidationSchema,
    validateOnChange: true,
    onSubmit: (values) => {
      shikshaMitraToast.success({
        message: `Reservation for "${values.bookTitle}" submitted successfully`,
      });
      onClose(null, true);
    },
  });

  const isLoading = bookCategoryLoading || bookTitleLoading;

  return isLoading ? (
    <Box display="flex" justifyContent="center" alignItems="center" p={2}>
      <Box className="loader" height={24} />
    </Box>
  ) : (
    <BackPopUpChecked initialValues={formik.initialValues} currentValues={formik.values}>
      <DialogScrollContent>
        {/* Member Information Card */}
        <Card
          sx={{
            p: 2,
            mb: 2,
            borderRadius: 3,
            boxShadow: 2,
            bgcolor: theme.vars.palette.background.paper,
          }}
        >
          <Typography variant="h6" gutterBottom>
            Member Information
          </Typography>

          <Grid container spacing={1}>
            {/* Left Side: Avatar */}
            <Grid size={{ xs: 12, sm: 2 }} display="flex">
              <Avatar
                src="/assets/images/avatar/avatar-1.jpg"
                alt={selectedMember?.name || 'Member'}
                sx={{ mt: 2, width: { xs: 60, sm: 80 }, height: { xs: 60, sm: 80 } }}
              />
            </Grid>

            {/* Right Side: Member Details */}
            <Grid size={{ xs: 12, sm: 10 }}>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 3 }}>
                  <Typography variant="body2" color="text.secondary">
                    Member Name
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {selectedMember?.name || 'Dharmik Jinjala'}
                  </Typography>
                </Grid>

                <Grid size={{ xs: 12, sm: 3 }}>
                  <Typography variant="body2" color="text.secondary">
                    Member ID
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {selectedMember?.id || 'DDVS001'}
                  </Typography>
                </Grid>

                <Grid size={{ xs: 12, sm: 3 }}>
                  <Typography variant="body2" color="text.secondary">
                    Current Issued Books
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {selectedMember?.currentIssue || '10'}
                  </Typography>
                </Grid>

                <Grid size={{ xs: 12, sm: 3 }}>
                  <Typography variant="body2" color="text.secondary">
                    Overdue Return Books
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {selectedMember?.overdueReturn || '01'}
                  </Typography>
                </Grid>

                <Grid size={{ xs: 12, sm: 3 }}>
                  <Typography variant="body2" color="text.secondary">
                    Role
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {selectedMember?.role || 'Student'}
                  </Typography>
                </Grid>

                <Grid size={{ xs: 12, sm: 3 }}>
                  <Typography variant="body2" color="text.secondary">
                    Contact No.
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    +91 6355030866
                  </Typography>
                </Grid>

                <Grid size={{ xs: 12, sm: 3 }}>
                  <Typography variant="body2" color="text.secondary">
                    Pending Return Books
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    10
                  </Typography>
                </Grid>

                <Grid size={{ xs: 12, sm: 3 }}>
                  <Typography variant="body2" color="text.secondary">
                    Reserved Books
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    02
                  </Typography>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Card>

        <Grid container spacing={2}>
          {/* Book Category */}
          <Grid size={6}>
            <ShakingTextField error={!!(formik.touched.bookCategory && formik.errors.bookCategory)}>
              <CustomSelect
                label="Book Category *"
                name="bookCategory"
                options={bookCategoryOptions || []}
                value={formik.values.bookCategory}
                onChange={(value) => formik.setFieldValue('bookCategory', value)}
                error={!!(formik.touched.bookCategory && formik.errors.bookCategory)}
                helperText={(formik.touched.bookCategory && formik.errors.bookCategory) as string}
                formControlProps={{ fullWidth: true }}
              />
            </ShakingTextField>
          </Grid>

          {/* Book Title */}
          <Grid size={6}>
            <ShakingTextField error={!!(formik.touched.bookTitle && formik.errors.bookTitle)}>
              <CustomSelect
                label="Book Title *"
                name="bookTitle"
                options={bookTitleOptions || []}
                value={formik.values.bookTitle}
                onChange={(value) => formik.setFieldValue('bookTitle', value)}
                error={!!(formik.touched.bookTitle && formik.errors.bookTitle)}
                helperText={(formik.touched.bookTitle && formik.errors.bookTitle) as string}
                formControlProps={{ fullWidth: true }}
              />
            </ShakingTextField>
          </Grid>

          {/* Requested Date */}
          <Grid size={6}>
            <ShakingTextField
              error={!!(formik.touched.requestedDate && formik.errors.requestedDate) || false}
            >
              <DatePicker
                label="Requested Date *"
                format="DD/MM/YYYY"
                value={dayjs(formik.values.requestedDate)}
                onChange={(newValue) => {
                  formik.setFieldValue('requestedDate', newValue?.toDate() || new Date());
                }}
                minDate={dayjs(currentYear?.startDate)}
                maxDate={dayjs(currentYear?.endDate)}
                sx={{ minWidth: 180, width: '100%' }}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    size: 'small',
                    error: !!(formik.touched.requestedDate && formik.errors.requestedDate) || false,
                    helperText:
                      formik.touched.requestedDate && (formik.errors.requestedDate as string),
                  },
                }}
              />
            </ShakingTextField>
          </Grid>

          <Grid size={6}>
            <ShakingTextField error={!!(formik.touched.dueDate && formik.errors.dueDate) || false}>
              <DatePicker
                label="Due Date *"
                format="DD/MM/YYYY"
                value={dayjs(formik.values.dueDate)}
                onChange={(newValue) => {
                  formik.setFieldValue('dueDate', newValue?.toDate() || new Date());
                }}
                minDate={dayjs(currentYear?.startDate)}
                maxDate={dayjs(currentYear?.endDate)}
                sx={{ minWidth: 180, width: '100%' }}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    size: 'small',
                    error: !!(formik.touched.dueDate && formik.errors.dueDate) || false,
                    helperText: formik.touched.dueDate && (formik.errors.dueDate as string),
                  },
                }}
              />
            </ShakingTextField>
          </Grid>
        </Grid>
      </DialogScrollContent>

      <DialogActions sx={{ p: 2, boxShadow: 'var(--shadows-10)' }}>
        <Button
          startIcon={<Iconify icon={GlobalIcons.cancel} />}
          onClick={() => onClose(null, false)}
          variant="outlined"
          size="small"
        >
          Cancel
        </Button>
        <Button
          startIcon={<Iconify icon={GlobalIcons.submit} width={20} height={20} />}
          type="submit"
          variant="contained"
          size="small"
          onClick={(e: any) => formik.handleSubmit(e)}
        >
          Submit
        </Button>
      </DialogActions>
    </BackPopUpChecked>
  );
};

export default MakeReservationForm;

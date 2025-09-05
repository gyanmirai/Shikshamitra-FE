import type { RootState } from 'src/redux/store';

import React from 'react';
import dayjs from 'dayjs';
import { useFormik } from 'formik';
import { useSelector } from 'react-redux';
import { GlobalIcons } from 'src/utils/icons';
import { DatePicker } from '@mui/x-date-pickers';
import { Iconify } from 'src/components/iconify';
import CustomSelect from 'src/components/custom-select';
import { shikshaMitraToast } from 'src/components/toast';
import ShakingTextField from 'src/components/shaking-text-field';
import { DialogScrollContent } from 'src/components/customDialog';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';
import { Grid, Card, Button, Avatar, Typography, CardContent, DialogActions } from '@mui/material';
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
    'loading.. ...'
  ) : (
    <BackPopUpChecked initialValues={formik.initialValues} currentValues={formik.values}>
      <DialogScrollContent>
        {/* Member Information Card */}
        <Card sx={{ mb: 3, border: '1px solid', borderColor: 'black', borderRadius: 2 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Member Information
            </Typography>

            <Grid container spacing={2} alignItems="center">
              <Grid size={12}>
                <Avatar
                  src="/assets/images/avatar/avatar-1.jpg"
                  alt={selectedMember?.name || 'Member'}
                  sx={{ width: 60, height: 60 }}
                />
              </Grid>

              <Grid size={12}>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 6, md: 3 }}>
                    <Typography variant="body2" color="text.secondary">
                      Member Name
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {selectedMember?.name || 'Dharmik Jinjala'}
                    </Typography>
                  </Grid>

                  <Grid size={{ xs: 6, md: 3 }}>
                    <Typography variant="body2" color="text.secondary">
                      Member ID
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {selectedMember?.memberId || 'DDVS001'}
                    </Typography>
                  </Grid>

                  <Grid size={{ xs: 6, md: 3 }}>
                    <Typography variant="body2" color="text.secondary">
                      Class/Division
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {selectedMember?.class || '10-A'}
                    </Typography>
                  </Grid>

                  <Grid size={{ xs: 6, md: 3 }}>
                    <Typography variant="body2" color="text.secondary">
                      Overdue Return Books
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {selectedMember?.overdueBooks || '01'}
                    </Typography>
                  </Grid>

                  <Grid size={{ xs: 6, md: 3 }}>
                    <Typography variant="body2" color="text.secondary">
                      Role
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {selectedMember?.role || 'Student'}
                    </Typography>
                  </Grid>

                  <Grid size={{ xs: 6, md: 3 }}>
                    <Typography variant="body2" color="text.secondary">
                      Contact No.
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {selectedMember?.contact || '+91 6355030866'}
                    </Typography>
                  </Grid>

                  <Grid size={{ xs: 6, md: 3 }}>
                    <Typography variant="body2" color="text.secondary">
                      Current Issued Books
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {selectedMember?.issuedBooks || '10'}
                    </Typography>
                  </Grid>

                  <Grid size={{ xs: 6, md: 3 }}>
                    <Typography variant="body2" color="text.secondary">
                      Reserved Books
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {selectedMember?.reservedBooks || '02'}
                    </Typography>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </CardContent>
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
          Submit Reservation
        </Button>
      </DialogActions>
    </BackPopUpChecked>
  );
};

export default MakeReservationForm;

import type { LabelColor } from 'src/components/label';

import dayjs from 'dayjs';
import { useFormik } from 'formik';
import { Label } from 'src/components/label';
import { GlobalIcons } from 'src/utils/icons';
import { DatePicker } from '@mui/x-date-pickers';
import { Iconify } from 'src/components/iconify';
import React, { useState, useCallback } from 'react';
import CustomSelect from 'src/components/custom-select';
import ShakingTextField from 'src/components/shaking-text-field';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import { DialogScrollContent } from 'src/components/customDialog';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import NumericFormatCustom from 'src/components/custom-numeric-format';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';
import { useGetReservationBooksQuery } from 'src/redux/book-reservation-api/book-reservation-api';
import {
  Grid,
  Button,
  MenuItem,
  MenuList,
  TextField,
  Typography,
  DialogActions,
} from '@mui/material';
import {
  LibraryBookStatus,
  LibraryBookStatusColors,
  LibraryBookStatusOptions,
} from 'src/enums/library-book-status';

import { buildInitialBookReturnValues } from './ReturnInitialValues';
import { bookReturnValidationSchema } from './ReturnValidatioSchema';

import type { ReturnBookFormProps } from './type';

const ReturnBookForm: React.FC<ReturnBookFormProps> = ({ open, onClose, editData }) => {
  const [showReservation, setShowReservation] = useState(true);
  //   Fetch issued/returned books
  const { data: reservedBooks, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetReservationBooksQuery,
  });
  const formik = useFormik({
    initialValues: buildInitialBookReturnValues(editData),
    validationSchema: bookReturnValidationSchema,
    onSubmit: (values) => {
      onClose(values, true);
    },
  });

  const actions = useCallback(
    ({ popover: pop, row }: any) => (
      <MenuList>
        <MenuItem
          onClick={() => {
            pop.onClose();
          }}
        >
          <Iconify icon={GlobalIcons.bell} sx={{ height: '16px', width: '16px' }} />
          Send Notification
        </MenuItem>
      </MenuList>
    ),
    []
  );

  return (
    <BackPopUpChecked initialValues={formik.initialValues} currentValues={formik.values}>
      <DialogScrollContent>
        <Grid container spacing={3}>
          {/* Book Category */}
          <Grid size={{ xs: 12, md: 4 }}>
            <ShakingTextField error={!!(formik.touched.bookCategory && formik.errors.bookCategory)}>
              <CustomSelect
                label="Book Category *"
                options={[
                  { id: 'text', value: 'Text Book', label: 'Text Book' },
                  { id: 'ref', value: 'Reference Book', label: 'Reference Book' },
                  { id: 'science', value: 'Science Book', label: 'Science Book' },
                ]}
                disabled
                value={formik.values.bookCategory}
                onChange={(val) => formik.setFieldValue('bookCategory', val)}
                error={!!(formik.touched.bookCategory && formik.errors.bookCategory)}
                helperText={(formik.touched.bookCategory && formik.errors.bookCategory) as string}
                formControlProps={{ fullWidth: true }}
              />
            </ShakingTextField>
          </Grid>

          {/* Book Title */}
          <Grid size={{ xs: 12, md: 4 }}>
            <TextField
              fullWidth
              size="small"
              disabled
              label="Book Title *"
              name="bookTitle"
              value={formik.values.bookTitle}
              onChange={formik.handleChange}
              error={!!(formik.touched.bookTitle && formik.errors.bookTitle)}
              helperText={(formik.touched.bookTitle && formik.errors.bookTitle) as string}
            />
          </Grid>

          {/* Edition */}
          <Grid size={{ xs: 12, md: 4 }}>
            <TextField
              fullWidth
              size="small"
              label="Edition *"
              disabled
              name="edition"
              value={formik.values.edition}
              onChange={formik.handleChange}
              error={!!(formik.touched.edition && formik.errors.edition)}
              helperText={(formik.touched.edition && formik.errors.edition) as string}
            />
          </Grid>

          {/* Member ID */}
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              disabled
              size="small"
              label="Member ID *"
              name="memberId"
              value={formik.values.memberId}
              onChange={formik.handleChange}
              error={!!(formik.touched.memberId && formik.errors.memberId)}
              helperText={(formik.touched.memberId && formik.errors.memberId) as string}
            />
          </Grid>

          {/* Member Name */}
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              size="small"
              label="Member Name *"
              disabled
              name="memberName"
              value={formik.values.memberName}
              onChange={formik.handleChange}
              error={!!(formik.touched.memberName && formik.errors.memberName)}
              helperText={(formik.touched.memberName && formik.errors.memberName) as string}
            />
          </Grid>

          {/* Due Date */}
          <Grid size={{ xs: 12, md: 6 }}>
            <DatePicker
              label="Due Date *"
              disabled
              value={dayjs(formik.values.dueDate)}
              onChange={(val) => formik.setFieldValue('dueDate', val)}
              format="DD-MM-YYYY"
              slotProps={{
                textField: {
                  fullWidth: true,
                  size: 'small',
                  error: !!(formik.touched.dueDate && formik.errors.dueDate),
                  helperText: (formik.touched.dueDate && formik.errors.dueDate) as string,
                },
              }}
            />
          </Grid>

          {/* Return Date */}
          <Grid size={{ xs: 12, md: 6 }}>
            <DatePicker
              label="Return Date *"
              value={dayjs(formik.values.returnDate)}
              onChange={(val) => formik.setFieldValue('returnDate', val)}
              format="DD-MM-YYYY"
              disabled
              slotProps={{
                textField: {
                  fullWidth: true,
                  size: 'small',
                  error: !!(formik.touched.returnDate && formik.errors.returnDate),
                  helperText: (formik.touched.returnDate && formik.errors.returnDate) as string,
                },
              }}
            />
          </Grid>

          {/* Book Condition */}
          <Grid size={{ xs: 12, md: 6 }}>
            <ShakingTextField
              error={!!(formik.touched.bookCondition && formik.errors.bookCondition)}
            >
              <CustomSelect
                label="Book Condition *"
                options={[
                  { id: 'good', value: 'Good', label: 'Good' },
                  { id: 'damaged', value: 'Damaged', label: 'Damaged' },
                ]}
                value={formik.values.bookCondition}
                onChange={(val) => formik.setFieldValue('bookCondition', val)}
                formControlProps={{ fullWidth: true }}
                error={!!(formik.touched.bookCondition && formik.errors.bookCondition)}
                helperText={(formik.touched.bookCondition && formik.errors.bookCondition) as string}
              />
            </ShakingTextField>
          </Grid>

          {/* Fine Amount */}
          <Grid size={{ xs: 12, md: 6 }}>
            <ShakingTextField error={!!(formik.touched.fineAmount && formik.errors.fineAmount)}>
              <NumericFormatCustom
                size="small"
                label="Fine Amount *"
                name="fineAmount"
                value={formik.values.fineAmount}
                onChange={formik.handleChange}
                fullWidth
                error={!!(formik.touched.fineAmount && formik.errors.fineAmount)}
                helperText={(formik.touched.fineAmount && formik.errors.fineAmount) as string}
              />
            </ShakingTextField>
          </Grid>

          {/* Reserved List */}
          {showReservation && (
            <Grid size={12}>
              <Typography variant="subtitle1">Reserved List</Typography>
              <CustomizableTable
                tableId="reserved-list"
                columns={[
                  { id: 'memberId', label: 'Member ID', align: 'left' },
                  { id: 'memberName', label: 'Member Name', align: 'left' },
                  {
                    id: 'notificationSentOn',
                    label: 'Notification Sent on',
                    align: 'left',
                    filterType: 'date',
                  },
                  {
                    id: 'status',
                    label: 'Status',
                    align: 'left',
                    filterType: 'enum',
                    enumOptions: LibraryBookStatusOptions,
                    sticky: true,
                    render(value, row) {
                      const color = LibraryBookStatusColors[value as LibraryBookStatus];
                      return <Label color={color as LabelColor}>{LibraryBookStatus[value]}</Label>;
                    },
                  },
                  {
                    id: 'actions',
                    label: 'Action',
                    align: 'left',
                    isSort: false,
                    isFilter: false,
                    minWidth: 60,
                    sticky: true,
                    render(value, row) {
                      return (
                        <ThreeDotsActions
                          showDeleteIcon
                          handleDeleteClick={() => {}}
                          actions={(prop) => actions({ ...prop, row })}
                          placement="right-top"
                        />
                      );
                    },
                  },
                ]}
                data={reservedBooks || []}
              />
            </Grid>
          )}
        </Grid>
      </DialogScrollContent>

      <DialogActions sx={{ p: 2, boxShadow: 'var(--shadows-10)' }}>
        <Button
          variant="outlined"
          size="small"
          onClick={() => onClose(null, false)}
          startIcon={<Iconify icon={GlobalIcons.cancel} />}
        >
          Cancel
        </Button>
        <Button
          startIcon={<Iconify icon={GlobalIcons.submit} width={16} height={16} />}
          onClick={(e: any) => formik.handleSubmit(e)}
          type="submit"
          size="small"
          variant="contained"
        >
          Submit
        </Button>
      </DialogActions>
    </BackPopUpChecked>
  );
};

export default ReturnBookForm;

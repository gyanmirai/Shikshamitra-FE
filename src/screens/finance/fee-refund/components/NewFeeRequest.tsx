import type { RootState } from 'src/redux/store';
import type { Board, Medium, Division } from 'src/types/school';

import { useFormik } from 'formik';
import { useSelector } from 'react-redux';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import CustomSelect from 'src/components/custom-select';
import React, { useMemo, useState, useEffect } from 'react';
import ShakingTextField from 'src/components/shaking-text-field';
import { useLazyGetFilterStudentsQuery } from 'src/redux/student';
import { DialogScrollContent } from 'src/components/custom-dialog';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import NumericFormatCustom from 'src/components/custom-numeric-format';
import { useLazyGetClassByMediumQuery } from 'src/redux/class/classApi';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';
import { Grid, Chip, Button, TextField, Autocomplete, DialogActions } from '@mui/material';

import { refundValidationSchema } from './NewRequestValidation';
import { getInitialRefundFormData } from './NewrequestInitialValues';

export const termOptions = [
  { name: 'Quarter 1', amount: 5000 },
  { name: 'Quarter 2', amount: 5000 },
  { name: 'Quarter 3', amount: 5000 },
  { name: 'Quarter 4', amount: 5000 },
];

const NewFeeRequestRefundForm: React.FC<any> = ({ onClose, editData }) => {
  //   const { currentYear } = useSelector((state: RootState) => state.globalState);
  const { currentYear } = useSelector((state: RootState) => state.globalState);
  // Lazy query hook to fetch classes by medium
  const [getClassByMedium, { data: classes }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useLazyGetClassByMediumQuery,
  });
  // Local state to store filtered boards based on academic year
  const [boards, setBoards] = useState([]);
  const [mediums, setMediums] = useState<Medium[]>([]);

  // State to store all divisions for the selected class
  const [allDivision, setAllDivision] = useState<Division[]>([]);

  const formik = useFormik({
    initialValues: getInitialRefundFormData(editData),
    validationSchema: refundValidationSchema,
    enableReinitialize: true,
    onSubmit: () => {
      onClose(null, true);
    },
  });
  useEffect(() => {
    setBoards(currentYear?.boards);
    const selectedBoard = boards?.find((item: any) => item.id === formik.values.board);

    setMediums((selectedBoard as unknown as Board)?.educationMediums || []);
    if (formik.values.medium) {
      getClassByMedium(formik.values.medium);
    }
  }, [
    boards,
    currentYear?.boards,
    editData,
    formik.values.board,
    formik.values.medium,
    getClassByMedium,
  ]);

  // Update divisions when class changes
  useEffect(() => {
    setAllDivision(
      classes?.find((org: any) => org?.id === formik.values.className)?.divisions || []
    );
  }, [classes, formik.values.className]);

  // Initialize query hook for fetching students
  const [getStudents, { data: StudentsData, isLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useLazyGetFilterStudentsQuery,
  });

  // Fetch students when division, class and organization are all selected
  useEffect(() => {
    if (formik.values.className && formik.values.division) {
      getStudents({
        standardId: formik.values.className,
        divisionId: formik.values.division,
      });
    }
  }, [classes, formik.values.className, formik.values.division, getStudents]);

  // Transform student data to include full name
  const tableData = useMemo(
    () =>
      StudentsData?.items?.map((item: any) => ({
        ...item,
        name: `${item.firstName} ${item.lastName} ${item.middleName}`,
      })) || [],
    [StudentsData?.items]
  );

  return (
    <BackPopUpChecked initialValues={formik.initialValues} currentValues={formik.values}>
      <DialogScrollContent>
        <Grid container spacing={3}>
          {/* Board */}
          <Grid size={{ xs: 12, md: 6 }}>
            <ShakingTextField error={!!(formik.touched.board && formik.errors.board)}>
              <CustomSelect
                name="board"
                label="Board *"
                // isLoading={boardLoading}
                options={boards || []}
                labelKey="name"
                valueKey="id"
                value={formik.values.board || ''}
                onChange={(value) => {
                  formik.setFieldValue('medium', '');
                  formik.setFieldValue('class', '');
                  formik.setFieldValue('board', value);
                }}
                error={!!(formik.touched.board && formik.errors.board) || false}
                helperText={(formik.touched.board && formik.errors.board) || ''}
                formControlProps={{ fullWidth: true, sx: { maxWidth: 'unset' } }}
              />
            </ShakingTextField>
          </Grid>

          {/* Medium */}
          <Grid size={{ xs: 12, md: 6 }}>
            <ShakingTextField error={!!(formik.touched.medium && formik.errors.medium)}>
              <CustomSelect
                label="Medium *"
                options={mediums || []}
                labelKey="name"
                valueKey="id"
                value={formik.values.medium}
                onChange={(val) => formik.setFieldValue('medium', val)}
                error={!!(formik.touched.medium && formik.errors.medium)}
                helperText={(formik.touched.medium && formik.errors.medium) as string}
                formControlProps={{ fullWidth: true }}
              />
            </ShakingTextField>
          </Grid>

          {/* Class */}
          <Grid size={{ xs: 12, md: 6 }}>
            <ShakingTextField error={!!(formik.touched.className && formik.errors.className)}>
              <CustomSelect
                label="Class *"
                options={classes || []}
                labelKey="name"
                valueKey="id"
                value={formik.values.className}
                onChange={(val) => formik.setFieldValue('className', val)}
                error={!!(formik.touched.className && formik.errors.className)}
                helperText={(formik.touched.className && formik.errors.className) as string}
                formControlProps={{ fullWidth: true }}
              />
            </ShakingTextField>
          </Grid>

          {/* Division */}
          <Grid size={{ xs: 12, md: 6 }}>
            <ShakingTextField error={!!(formik.touched.division && formik.errors.division)}>
              <CustomSelect
                label="Division *"
                options={allDivision}
                labelKey="name"
                valueKey="id"
                value={formik.values.division}
                onChange={(val) => formik.setFieldValue('division', val)}
                error={!!(formik.touched.division && formik.errors.division)}
                helperText={(formik.touched.division && formik.errors.division) as string}
                formControlProps={{ fullWidth: true }}
              />
            </ShakingTextField>
          </Grid>

          {/* Student */}
          <Grid size={{ xs: 12, md: 6 }}>
            <ShakingTextField error={!!(formik.touched.student && formik.errors.student) || false}>
              <Autocomplete
                loading={isLoading}
                noOptionsText="No Student Found"
                fullWidth
                value={formik.values.student}
                onChange={(e, value: any) => {
                  formik.setFieldValue('student', value);
                }}
                renderTags={(tagValue, getTagProps) =>
                  tagValue.map((option, index) => (
                    <Chip
                      label={option.name}
                      variant="soft"
                      size="small"
                      {...getTagProps({ index })}
                    />
                  ))
                }
                options={tableData}
                getOptionLabel={(option: any) => option?.name || ''}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    size="small"
                    label="Student *"
                    fullWidth
                    error={!!(formik.touched.student && formik.errors.student)}
                    helperText={(formik.touched.student && formik.errors.student) as string}
                  />
                )}
                renderOption={(prop: any, option: any) => (
                  <li {...prop} key={option.id}>
                    {option.name}
                  </li>
                )}
              />
            </ShakingTextField>
          </Grid>

          {/* Paid Terms */}
          <Grid size={{ xs: 12, md: 6 }}>
            <ShakingTextField error={!!(formik.touched.paidTerms && formik.errors.paidTerms)}>
              <CustomSelect
                label="Paid Terms *"
                options={termOptions}
                value={formik.values.paidTerms}
                labelKey="name"
                valueKey="name"
                onChange={(val) => {
                  const selectedTerm = termOptions.find((term) => term.name === val);
                  formik.setFieldValue('paidTerms', val);
                  formik.setFieldValue('amountApplicable', selectedTerm?.amount || '');
                }}
                error={!!(formik.touched.paidTerms && formik.errors.paidTerms)}
                helperText={(formik.touched.paidTerms && formik.errors.paidTerms) as string}
                formControlProps={{ fullWidth: true }}
              />
            </ShakingTextField>
          </Grid>

          {/* Amount Applicable For Refund */}
          <Grid size={{ xs: 12, md: 6 }}>
            <ShakingTextField
              error={!!(formik.touched.amountApplicable && formik.errors.amountApplicable)}
            >
              <NumericFormatCustom
                size="small"
                fullWidth
                label="Amount Applicable For Refund *"
                name="amountApplicable"
                value={formik.values.amountApplicable || ''}
                disabled
                error={!!(formik.touched.amountApplicable && formik.errors.amountApplicable)}
                helperText={formik.touched.amountApplicable && formik.errors.amountApplicable}
              />
            </ShakingTextField>
          </Grid>

          {/* Refund Amount */}
          <Grid size={{ xs: 12, md: 6 }}>
            <ShakingTextField error={!!(formik.touched.refundAmount && formik.errors.refundAmount)}>
              <NumericFormatCustom
                size="small"
                fullWidth
                label="Refund Amount *"
                name="refundAmount"
                value={formik.values.refundAmount || ''}
                onChange={(e) => {
                  const val = e.target.value.replace(/[₹,\s]/g, '');
                  formik.setFieldValue('refundAmount', Number(val));
                }}
                error={!!(formik.touched.refundAmount && formik.errors.refundAmount)}
                helperText={formik.touched.refundAmount && formik.errors.refundAmount}
              />
            </ShakingTextField>
          </Grid>

          {/* Refund Method */}
          <Grid size={12}>
            <ShakingTextField error={!!(formik.touched.refundMethod && formik.errors.refundMethod)}>
              <CustomSelect
                label="Refund Method *"
                options={[
                  { name: 'Bank Transfer', value: 'Bank Transfer' },
                  { name: 'Cash', value: 'Cash' },
                  { name: 'Cheque', value: 'Cheque' },
                ]}
                labelKey="name"
                valueKey="value"
                value={formik.values.refundMethod}
                onChange={(val) => formik.setFieldValue('refundMethod', val)}
                error={!!(formik.touched.refundMethod && formik.errors.refundMethod)}
                helperText={(formik.touched.refundMethod && formik.errors.refundMethod) as string}
                formControlProps={{ fullWidth: true }}
              />
            </ShakingTextField>
          </Grid>

          {/* Reason of Refund */}
          <Grid size={12}>
            <ShakingTextField error={!!(formik.touched.reason && formik.errors.reason)}>
              <TextField
                fullWidth
                multiline
                minRows={3}
                label="Reason of Refund *"
                name="reason"
                value={formik.values.reason}
                onChange={formik.handleChange}
                error={!!(formik.touched.reason && formik.errors.reason)}
                helperText={formik.touched.reason && formik.errors.reason}
              />
            </ShakingTextField>
          </Grid>
        </Grid>
      </DialogScrollContent>

      {/* Actions */}
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
          startIcon={
            <Iconify
              icon={editData ? GlobalIcons.edit : GlobalIcons.submit}
              width={16}
              height={16}
            />
          }
          onClick={(e: any) => {
            formik.handleSubmit(e);
          }}
          type="submit"
          size="small"
          variant="contained"
        >
          {editData ? 'Update' : 'Submit'}
        </Button>
      </DialogActions>
    </BackPopUpChecked>
  );
};

export default NewFeeRequestRefundForm;

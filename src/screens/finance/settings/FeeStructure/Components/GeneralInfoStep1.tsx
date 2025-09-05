import type { FormikProps } from 'formik';
import type { Board } from 'src/types/school';

import { capitalize } from 'lodash';
import React, { useState, useEffect } from 'react';

import { Grid, TextField } from '@mui/material';

import { useGetYearQuery } from 'src/redux/year/yearApi';
import { useGetBoardsQuery } from 'src/redux/board/boardApi';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { useLazyGetClassByMediumQuery } from 'src/redux/class/classApi';
import { FeeStructureClassStatusType } from 'src/enums/fee-structure-statusType';

import CustomSelect from 'src/components/custom-select';
import ShakingTextField from 'src/components/shaking-text-field';

import type { IFeeStructure, IClassWiseFeeData } from '../type';

type Props = {
  formik: FormikProps<IFeeStructure>;
  editData?: any;
};

const GeneralInfoStep = ({ formik, editData }: Props) => {
  console.log('formik--values---', formik?.values);

  // Queries
  const { data: academicYear, isLoading: yearLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetYearQuery,
  });
  console.log('academicYear', academicYear);
  const [getClassByMedium, { data: classes }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useLazyGetClassByMediumQuery,
  });

  const { data: board, isLoading: boardLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetBoardsQuery,
  });

  // Local state
  const [boards, setBoards] = useState<any[]>([]);
  const [selectedAcademicYear, setSelectedAcademicYear] = useState<string>();

  // Handle edit case
  useEffect(() => {
    if (editData) {
      const findBoards = board?.items?.filter(
        (item: any) => item.academicYearId === editData.academicYear
      );
      setBoards(findBoards);

      const year = academicYear?.items?.find((item: any) => item.id === formik.values.academicYear);
      setSelectedAcademicYear(year?.name || '');

      if (editData.medium) {
        getClassByMedium(editData.medium);
      }
    }
  }, [academicYear?.items, board?.items, editData, formik?.values?.academicYear, getClassByMedium]);

  //   Initialize class-wise fee structure if medium changes
  // Initialize class-wise fee structure if medium changes
  useEffect(() => {
    if (classes?.length > 0 && !editData) {
      const updatedClassWiseFees: Record<string, IClassWiseFeeData[]> = {};

      classes.forEach((classItem: any) => {
        const className = classItem.name;

        // initialize with ONE empty fee structure
        updatedClassWiseFees[className] = [
          {
            feeStructureName: '',
            status: FeeStructureClassStatusType.Remaining,
            feeItems: [],
          },
        ];
      });

      formik.setFieldValue('feeStructureClasses', updatedClassWiseFees);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classes, editData, formik.setFieldValue]);

  return (
    <Grid container spacing={3}>
      {/* Fee Structure Name */}
      <Grid size={{ xs: 12, md: 4 }}>
        <ShakingTextField
          error={!!(formik?.touched?.feeStructureName && formik?.errors?.feeStructureName)}
        >
          <TextField
            fullWidth
            size="small"
            name="feeStructureName"
            label="Fee Structure Name *"
            value={formik?.values?.feeStructureName}
            onChange={(e) => {
              const onlyLetters = e.target.value.replace(/[^a-zA-Z\s]/g, '');
              const capitalized = capitalize(onlyLetters);
              formik.setFieldValue('feeStructureName', capitalized);
            }}
            error={formik?.touched?.feeStructureName && Boolean(formik?.errors?.feeStructureName)}
            helperText={formik?.touched?.feeStructureName && formik?.errors?.feeStructureName}
          />
        </ShakingTextField>
      </Grid>

      {/* Academic Year */}
      <Grid size={{ xs: 12, md: 4 }}>
        <ShakingTextField error={!!(formik?.touched?.academicYear && formik?.errors?.academicYear)}>
          <CustomSelect
            name="academicYear"
            label="Academic Year *"
            options={academicYear?.items || []}
            value={formik?.values?.academicYear || ''}
            labelKey="name"
            valueKey="id"
            onChange={(val) => {
              formik?.setFieldValue('academicYear', val);
              const filteredBoards =
                board?.items?.filter((b: any) => b.academicYearId === val) || [];
              setBoards(filteredBoards);
            }}
            // loading={yearLoading}
            error={formik?.touched?.academicYear && Boolean(formik?.errors?.academicYear)}
            helperText={(formik?.touched?.academicYear && formik?.errors?.academicYear) as string}
          />
        </ShakingTextField>
      </Grid>

      {/* Board */}
      <Grid size={{ xs: 12, md: 4 }}>
        <ShakingTextField error={!!(formik?.touched?.board && formik?.errors?.board)}>
          <CustomSelect
            name="board"
            label="Board *"
            labelKey="name"
            valueKey="id"
            options={boards || []}
            value={formik?.values?.board || ''}
            onChange={(val) => formik?.setFieldValue('board', val)}
            // loading={boardLoading}
            error={formik?.touched?.board && Boolean(formik?.errors?.board)}
            helperText={(formik?.touched?.board && formik?.errors?.board) as string}
          />
        </ShakingTextField>
      </Grid>

      {/* Medium */}
      <Grid size={{ xs: 12, md: 4 }}>
        <ShakingTextField error={!!(formik?.touched?.medium && formik?.errors?.medium)}>
          <CustomSelect
            name="medium"
            label="Medium *"
            options={
              board?.items?.find((item: Board) => item.id === formik?.values?.board)
                ?.educationMediums || []
            }
            labelKey="name"
            valueKey="id"
            value={formik?.values?.medium || ''}
            onChange={(val) => {
              formik.setFieldValue('medium', val);
              getClassByMedium(val);
            }}
            error={formik?.touched?.medium && Boolean(formik?.errors?.medium)}
            helperText={(formik?.touched?.medium && formik?.errors?.medium) as string}
          />
        </ShakingTextField>
      </Grid>

      {/* Receipt Book */}
      <Grid size={{ xs: 12, md: 4 }}>
        <ShakingTextField error={!!(formik?.touched?.receiptBook && formik?.errors?.receiptBook)}>
          <CustomSelect
            name="receiptBook"
            label="Receipt Book *"
            options={[
              { id: 'book1', name: 'Receipt Book 1' },
              { id: 'book2', name: 'Receipt Book 2' },
            ]}
            labelKey="name"
            valueKey="id"
            value={formik?.values?.receiptBook}
            onChange={(val) => formik.setFieldValue('receiptBook', val)}
            error={formik?.touched?.receiptBook && Boolean(formik?.errors?.receiptBook)}
            helperText={(formik?.touched?.receiptBook && formik?.errors?.receiptBook) as string}
          />
        </ShakingTextField>
      </Grid>

      {/* Payment Term */}
      <Grid size={{ xs: 12, md: 4 }}>
        <ShakingTextField error={!!(formik?.touched?.paymentTerm && formik?.errors?.paymentTerm)}>
          <CustomSelect
            name="paymentTerm"
            label="Payment Term *"
            options={[
              { id: 'monthly', name: 'Monthly' },
              { id: 'quarterly', name: 'Quarterly' },
              { id: 'halfYearly', name: 'Half Yearly' },
              { id: 'yearly', name: 'Yearly' },
            ]}
            labelKey="name"
            valueKey="id"
            value={formik?.values?.paymentTerm}
            onChange={(val) => formik.setFieldValue('paymentTerm', val)}
            error={formik?.touched?.paymentTerm && Boolean(formik?.errors?.paymentTerm)}
            helperText={(formik?.touched?.paymentTerm && formik?.errors?.paymentTerm) as string}
          />
        </ShakingTextField>
      </Grid>

      {/* Payment Method */}
      <Grid size={{ xs: 12, md: 4 }}>
        <ShakingTextField
          error={!!(formik?.touched?.paymentMethod && formik?.errors?.paymentMethod)}
        >
          <CustomSelect
            name="paymentMethod"
            label="Payment Method *"
            multiple
            options={[
              { id: 'cash', name: 'Cash' },
              { id: 'cheque', name: 'Cheque' },
              { id: 'upi', name: 'UPI' },
            ]}
            labelKey="name"
            valueKey="id"
            value={formik?.values?.paymentMethod || ''}
            onChange={(val) => formik.setFieldValue('paymentMethod', val)}
            error={formik?.touched?.paymentMethod && Boolean(formik?.errors?.paymentMethod)}
            helperText={(formik?.touched?.paymentMethod && formik?.errors?.paymentMethod) as string}
          />
        </ShakingTextField>
      </Grid>
    </Grid>
  );
};

export default GeneralInfoStep;

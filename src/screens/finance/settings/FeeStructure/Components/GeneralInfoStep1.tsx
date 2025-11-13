import type { FormikProps } from 'formik';
import type { RootState } from 'src/redux/store';
import type { Board, Medium } from 'src/types/school';

import { capitalize } from 'lodash';
import { useSelector } from 'react-redux';
import { Grid, TextField } from '@mui/material';
import React, { useState, useEffect } from 'react';
import CustomSelect from 'src/components/custom-select';
import { useGetBoardsQuery } from 'src/redux/board/boardApi';
import ShakingTextField from 'src/components/shaking-text-field';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { useLazyGetClassByMediumQuery } from 'src/redux/class/classApi';

import type { IFeeStructure, IClassWiseFeeData } from '../type';

type Props = {
  formik: FormikProps<IFeeStructure>;
  editData?: any;
};

const GeneralInfoStep = ({ formik, editData }: Props) => {
  console.log('formik--values---', formik?.values);
  const { currentYear } = useSelector((state: RootState) => state.globalState);

  // Queries
  // const { data: academicYear, isLoading: yearLoading } = useQueryAndMutation({
  //   type: 'query',
  //   currentQueryAndMutation: useGetYearQuery,
  // });
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

  useEffect(() => {
    if (!editData && currentYear && board?.items) {
      const filteredBoards = board.items.filter((b: any) => b.academicYearId === currentYear.id);
      setBoards(filteredBoards);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editData, currentYear, board?.items]);

  useEffect(() => {
    if (editData) {
      const findBoards = board?.items?.filter(
        (item: any) => item.academicYearId === editData.academicYear
      );
      setBoards(findBoards);

      setSelectedAcademicYear(editData.academicYearName || currentYear?.name || '');
      // formik?.setFieldValue('academicYear', currentYear?.id);
      // formik.setFieldValue('academicYearName', currentYear?.name);
      if (editData.medium) {
        getClassByMedium(editData.medium);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editData, board?.items, currentYear?.name, getClassByMedium]);

  //   Initialize class-wise fee structure if medium changes
  // Initialize class-wise fee structure if medium changes
  useEffect(() => {
    if (classes?.length > 0 && !editData) {
      const updatedClassWiseFees: Record<string, IClassWiseFeeData[]> = {};

      classes.forEach((classItem: any) => {
        const className = classItem.name;

        // initialize with ONE empty fee structure
        updatedClassWiseFees[className] = [];
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
            onChange={(val) => {
              const selectedBoard = boards?.find((item) => item.id === val);
              formik?.setFieldValue('board', val);
              formik.setFieldValue('boardName', selectedBoard?.name);
            }}
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
            disabled={!formik.values.board}
            options={
              board?.items?.find((item: Board) => item.id === formik?.values?.board)
                ?.educationMediums || []
            }
            labelKey="name"
            valueKey="id"
            value={formik?.values?.medium || ''}
            onChange={(val) => {
              const selectedMedium = board?.items
                ?.find((item: Board) => item.id === formik?.values?.board)
                ?.educationMediums?.find((m: Medium) => m.id === val);
              formik.setFieldValue('medium', val);
              formik.setFieldValue('mediumName', selectedMedium?.name);
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

      {/* Payment Method */}
      <Grid size={{ xs: 12, md: 4 }}>
        <ShakingTextField
          error={!!(formik?.touched?.paymentMethod && formik?.errors?.paymentMethod)}
        >
          <CustomSelect
            name="paymentMethod"
            label="Payment Methods *"
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

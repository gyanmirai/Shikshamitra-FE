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
import { useGetReceiptBooksQuery } from 'src/redux/finance/receiptBookApi';

import type { IFeeStructure } from '../type';

type Props = {
  formik: FormikProps<IFeeStructure>;
  editData?: any;
};

const GeneralInfoStep = ({ formik, editData }: Props) => {
  const { currentYear } = useSelector((state: RootState) => state.globalState);
  // GET receipt book
  const { data: receiptBookData, isLoading: receiptBookLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetReceiptBooksQuery,
    params: { academicYearId: currentYear?.id },
  });
  const [getClassByMedium, { data: classes }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useLazyGetClassByMediumQuery,
  });

  const { data: board } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetBoardsQuery,
  });
  console.log('initalvalues values----', formik.initialValues);

  console.log('formik values----', formik.values);
  // Local state
  const [boards, setBoards] = useState<any[]>([]);

  useEffect(() => {
    if (board?.items && formik.values.academicYearId) {
      const filteredBoards = board.items.filter(
        (b: any) => b.academicYearId === formik.values.academicYearId
      );
      setBoards(filteredBoards);
    }
  }, [board?.items, formik.values.academicYearId]);

  useEffect(() => {
    if (formik.values.mediumId) {
      getClassByMedium(formik.values.mediumId);
    }
  }, [formik.values.mediumId, getClassByMedium]);

  // Store class list for names in formik state
  useEffect(() => {
    if (classes?.length > 0) {
      formik.setFieldValue('classList', classes);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classes, editData]);

  return (
    <Grid container spacing={3}>
      {/* Fee Structure Name */}
      <Grid size={{ xs: 12, md: 4 }}>
        <ShakingTextField error={!!(formik?.touched?.name && formik?.errors?.name)}>
          <TextField
            fullWidth
            size="small"
            name="name"
            label="Fee Structure Name *"
            value={formik?.values?.name}
            onChange={(e) => {
              const onlyLetters = e.target.value.replace(/[^a-zA-Z\s]/g, '');
              const capitalized = capitalize(onlyLetters);
              formik.setFieldValue('name', capitalized);
            }}
            error={formik?.touched?.name && Boolean(formik?.errors?.name)}
            helperText={formik?.touched?.name && formik?.errors?.name}
          />
        </ShakingTextField>
      </Grid>

      {/* Academic Year */}

      {/* Board */}
      <Grid size={{ xs: 12, md: 4 }}>
        <ShakingTextField error={!!(formik?.touched?.boardId && formik?.errors?.boardId)}>
          <CustomSelect
            name="board"
            label="Board *"
            labelKey="name"
            valueKey="id"
            options={boards || []}
            value={formik?.values?.boardId || ''}
            onChange={(val) => {
              const selectedBoard = boards?.find((item) => item.id === val);
              formik?.setFieldValue('boardId', val);
              formik.setFieldValue('boardName', selectedBoard?.name);
            }}
            // loading={boardLoading}
            error={formik?.touched?.boardId && Boolean(formik?.errors?.boardId)}
            helperText={(formik?.touched?.boardId && formik?.errors?.boardId) as string}
          />
        </ShakingTextField>
      </Grid>

      {/* Medium */}
      <Grid size={{ xs: 12, md: 4 }}>
        <ShakingTextField error={!!(formik?.touched?.mediumId && formik?.errors?.mediumId)}>
          <CustomSelect
            name="medium"
            label="Medium *"
            disabled={!formik.values.boardId}
            options={
              board?.items?.find((item: Board) => item.id === formik?.values?.boardId)
                ?.educationMediums || []
            }
            labelKey="name"
            valueKey="id"
            value={formik?.values?.mediumId || ''}
            onChange={(val) => {
              const selectedMedium = board?.items
                ?.find((item: Board) => item.id === formik?.values?.boardId)
                ?.educationMediums?.find((m: Medium) => m.id === val);
              formik.setFieldValue('mediumId', val);
              formik.setFieldValue('mediumName', selectedMedium?.name);
              getClassByMedium(val);
            }}
            error={formik?.touched?.mediumId && Boolean(formik?.errors?.mediumId)}
            helperText={(formik?.touched?.mediumId && formik?.errors?.mediumId) as string}
          />
        </ShakingTextField>
      </Grid>

      {/* Receipt Book */}
      <Grid size={{ xs: 12, md: 4 }}>
        <ShakingTextField
          error={!!(formik?.touched?.receiptBookId && formik?.errors?.receiptBookId)}
        >
          <CustomSelect
            name="receiptBook"
            label="Receipt Book *"
            options={receiptBookData?.items || []}
            labelKey="name"
            valueKey="id"
            isLoading={receiptBookLoading}
            value={formik?.values?.receiptBookId || ''}
            onChange={(val) => {
              formik.setFieldValue('receiptBookId', val);
              const selectedReceiptBook = receiptBookData?.items?.find(
                (item: any) => item.id === val
              );
              formik.setFieldValue('receiptBookName', selectedReceiptBook?.name);
            }}
            error={formik?.touched?.receiptBookId && Boolean(formik?.errors?.receiptBookId)}
            helperText={(formik?.touched?.receiptBookId && formik?.errors?.receiptBookId) as string}
          />
        </ShakingTextField>
      </Grid>
    </Grid>
  );
};

export default GeneralInfoStep;

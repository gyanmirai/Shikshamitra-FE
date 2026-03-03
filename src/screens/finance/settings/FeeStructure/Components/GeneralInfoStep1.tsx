import type { FormikProps } from 'formik';
import type { Board } from 'src/types/school';
import type { RootState } from 'src/redux/store';

import { capitalize } from 'lodash';
import { useSelector } from 'react-redux';
import React, { useState, useEffect } from 'react';
import { Grid, Skeleton, TextField } from '@mui/material';
import { useGetBoardsQuery } from 'src/redux/board/boardApi';
import ShakingTextField from 'src/components/shaking-text-field';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { useLazyGetClassByMediumQuery } from 'src/redux/class/classApi';
import { useGetReceiptBooksQuery } from 'src/redux/finance/receiptBookApi';
import { PaginatedSearchSelect } from 'src/components/paginated-search-select';

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
  // Local state
  const [boards, setBoards] = useState<any[]>([]);
  const mediums: any[] =
    board?.items?.find((item: Board) => item.id === formik?.values?.boardId)?.educationMediums ||
    [];

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
          <PaginatedSearchSelect
            key={boards?.length ? 'boards-loaded' : 'boards-empty'}
            label="Board *"
            noOptionsText="No Board Found"
            fetchOptions={async (query: string, page: number) => {
              const filtered = (boards || []).filter((b: any) =>
                b?.name?.toLowerCase().includes(query.toLowerCase())
              );
              const pageSize = 10;
              const start = (page - 1) * pageSize;
              const end = start + pageSize;
              return {
                data: filtered.slice(start, end).map((item: any) => ({
                  label: item.name,
                  id: item.id,
                })),
                hasMore: end < filtered.length,
              };
            }}
            value={
              boards?.find((b: any) => b.id === formik?.values?.boardId)
                ? {
                    label: boards.find((b: any) => b.id === formik?.values?.boardId)?.name,
                    id: formik?.values?.boardId,
                  }
                : null
            }
            isOptionEqualToValue={(option: any, value: any) => option?.id === value?.id}
            renderOption={(prop, option: any) => (
              <li {...prop} key={option.id}>
                {option.label}
              </li>
            )}
            getOptionLabel={(option: any) => option?.label || ''}
            minChars={0}
            onChange={(_, val: any) => {
              const selectedBoard = boards?.find((item) => item.id === val?.id);
              formik?.setFieldValue('boardId', val?.id || '');
              formik.setFieldValue('boardName', selectedBoard?.name || '');
              formik.setFieldValue('mediumId', '');
              formik.setFieldValue('mediumName', '');
            }}
            size="small"
            sx={{ width: '100%' }}
            error={formik?.touched?.boardId && Boolean(formik?.errors?.boardId)}
            helperText={(formik?.touched?.boardId && formik?.errors?.boardId) as string}
          />
        </ShakingTextField>
      </Grid>

      {/* Medium */}
      <Grid size={{ xs: 12, md: 4 }}>
        <ShakingTextField error={!!(formik?.touched?.mediumId && formik?.errors?.mediumId)}>
          <PaginatedSearchSelect
            key={`medium-${formik?.values?.boardId || 'empty'}`}
            label="Medium *"
            noOptionsText="No Medium Found"
            disabled={!formik.values.boardId}
            fetchOptions={async (query: string, page: number) => {
              const filtered = (mediums || []).filter((m: any) =>
                m?.name?.toLowerCase().includes(query.toLowerCase())
              );
              const pageSize = 10;
              const start = (page - 1) * pageSize;
              const end = start + pageSize;
              return {
                data: filtered.slice(start, end).map((item: any) => ({
                  label: item.name,
                  id: item.id,
                })),
                hasMore: end < filtered.length,
              };
            }}
            value={
              mediums?.find((m: any) => m.id === formik?.values?.mediumId)
                ? {
                    label: mediums.find((m: any) => m.id === formik?.values?.mediumId)?.name,
                    id: formik?.values?.mediumId,
                  }
                : null
            }
            isOptionEqualToValue={(option: any, value: any) => option?.id === value?.id}
            renderOption={(prop, option: any) => (
              <li {...prop} key={option.id}>
                {option.label}
              </li>
            )}
            getOptionLabel={(option: any) => option?.label || ''}
            minChars={0}
            onChange={(_, val: any) => {
              const selectedMedium = mediums?.find((m: any) => m.id === val?.id);
              formik.setFieldValue('mediumId', val?.id || '');
              formik.setFieldValue('mediumName', selectedMedium?.name || '');
              if (val?.id) getClassByMedium(val.id);
            }}
            size="small"
            sx={{ width: '100%' }}
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
          {receiptBookLoading ? (
            <Skeleton variant="rounded" height={40} />
          ) : (
            <PaginatedSearchSelect
              key={receiptBookData?.items?.length ? 'receipt-loaded' : 'receipt-empty'}
              label="Receipt Book *"
              noOptionsText="No Receipt Book Found"
              fetchOptions={async (query: string, page: number) => {
                const filtered = (receiptBookData?.items || []).filter((r: any) =>
                  r?.name?.toLowerCase().includes(query.toLowerCase())
                );
                const pageSize = 10;
                const start = (page - 1) * pageSize;
                const end = start + pageSize;
                return {
                  data: filtered.slice(start, end).map((item: any) => ({
                    label: item.name,
                    id: item.id,
                  })),
                  hasMore: end < filtered.length,
                };
              }}
              value={
                receiptBookData?.items?.find((r: any) => r.id === formik?.values?.receiptBookId)
                  ? {
                      label: receiptBookData.items.find(
                        (r: any) => r.id === formik?.values?.receiptBookId
                      )?.name,
                      id: formik?.values?.receiptBookId,
                    }
                  : null
              }
              isOptionEqualToValue={(option: any, value: any) => option?.id === value?.id}
              renderOption={(prop, option: any) => (
                <li {...prop} key={option.id}>
                  {option.label}
                </li>
              )}
              getOptionLabel={(option: any) => option?.label || ''}
              minChars={0}
              onChange={(_, val: any) => {
                formik.setFieldValue('receiptBookId', val?.id || '');
                const selectedReceiptBook = receiptBookData?.items?.find(
                  (item: any) => item.id === val?.id
                );
                formik.setFieldValue('receiptBookName', selectedReceiptBook?.name || '');
              }}
              size="small"
              sx={{ width: '100%' }}
              error={formik?.touched?.receiptBookId && Boolean(formik?.errors?.receiptBookId)}
              helperText={
                (formik?.touched?.receiptBookId && formik?.errors?.receiptBookId) as string
              }
            />
          )}
        </ShakingTextField>
      </Grid>
    </Grid>
  );
};

export default GeneralInfoStep;

'use client';

import type { FormikProps } from 'formik';
import type { IColumn } from 'src/components/customizabaleTable/types';

import { useMemo, useCallback } from 'react';
import { Box, Chip, Divider, Typography } from '@mui/material';
import CustomizableTable from 'src/components/customizabaleTable';

import { SubjectNameCell } from './SubjectNameCell';
import { SubjectLectureField } from './SubjectLectureField';
import { getWeeklyLectureTotal } from '../weeklyLectureValue';
import { WeeklyLectureBulkApply } from './WeeklyLectureBulkApply';

import type { ISubject, ISubjectFormValues } from '../type';

interface SubjectsLectureTableProps {
  formik: FormikProps<ISubjectFormValues>;
  disabled?: boolean;
  isEdit: boolean;
}

/**
 * Renders the editable subject list as a table.
 *
 * `useMemo` for the columns is justified – the column definitions are
 * referentially passed to `CustomizableTable`. Recomputing on every render
 * would defeat the table's internal memoization.
 *
 * `useCallback` for the cell renderers is justified for the same reason.
 */
export function SubjectsLectureTable({ formik, disabled, isEdit }: SubjectsLectureTableProps) {
  const isInputDisabled = disabled && !isEdit;

  /** Total lectures across all subjects — UI-only, does not affect payload. */
  const totalLectures = useMemo(
    () => getWeeklyLectureTotal(formik.values.subjects),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [formik.values.subjects]
  );

  const handleApplyAll = (lectureCount: number) => {
    formik.setFieldValue(
      'subjects',
      formik.values.subjects.map((subject) => ({ ...subject, noOfLecture: lectureCount }))
    );
  };

  const renderSubjectName: any = useCallback(
    (value: unknown, row: ISubject) => <SubjectNameCell value={value} row={row} />,
    []
  );

  const renderLectureCell: any = useCallback(
    (_value: unknown, row: ISubject) => {
      const index = formik.values.subjects.findIndex((item) => item.id === row.id);
      if (index < 0) return null;
      return (
        <SubjectLectureField index={index} formik={formik} disabled={disabled} isEdit={isEdit} />
      );
    },
    [formik, disabled, isEdit]
  );

  const columns = useMemo<IColumn[]>(
    () => [
      {
        id: 'name',
        label: 'Subject',
        isFilter: false,
        align: 'left',
        render: renderSubjectName,
      },
      {
        id: 'noOfLecture',
        label: 'Weekly Lectures',
        isSort: false,
        isFilter: false,
        align: 'left',

        render: renderLectureCell,
      },
    ],
    [renderSubjectName, renderLectureCell]
  );

  return (
    <Box
      display="flex"
      flexDirection="column"
      gap={1}
      sx={{ maxHeight: 'calc(100vh - 380px)', overflow: 'hidden' }}
    >
      {/* ── Toolbar: subject count + apply-to-all ── */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 1,
          px: 0.5,
        }}
      >
        <Chip
          size="small"
          label={`${formik.values.subjects.length} subject${formik.values.subjects.length !== 1 ? 's' : ''}`}
          variant="outlined"
          sx={{ fontWeight: 500, fontSize: '12px' }}
        />

        {!isInputDisabled && <WeeklyLectureBulkApply onApply={handleApplyAll} />}
      </Box>

      <CustomizableTable
        tableId="table-subject-list"
        isSearch={false}
        isShowedDense={false}
        noDataText={<>No Subject&apos;s weekly lectures Found </>}
        isFilter={false}
        columns={columns}
        data={formik.values.subjects}
      />

      {/* ── Footer: total lectures (UI-only) ── */}
      {formik.values.subjects.length > 0 && (
        <>
          <Divider />
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'flex-end',
              alignItems: 'center',
              gap: 1,
              px: 1,
              py: 0.5,
            }}
          >
            <Typography variant="caption" color="text.secondary">
              Total weekly lectures:
            </Typography>
            <Typography variant="caption" fontWeight={700} color="text.primary">
              {totalLectures}
            </Typography>
          </Box>
        </>
      )}
    </Box>
  );
}

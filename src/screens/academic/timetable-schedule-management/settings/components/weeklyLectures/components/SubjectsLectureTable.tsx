'use client';

import type { FormikProps } from 'formik';
import type { IColumn } from 'src/components/customizabaleTable/types';

import { useMemo, useCallback } from 'react';
import CustomTooltip from 'src/components/custom-tooltip';
import { Box, Typography, ListItemText } from '@mui/material';
import CustomizableTable from 'src/components/customizabaleTable';
import { SubjectColorIndicator } from 'src/components/subject-color/SubejctColor';
import { SubjectType } from 'src/screens/academic/curriculum-management/subjectAssignment/enum/subjectType';

import { SubjectLectureField } from './SubjectLectureField';

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
  const renderSubjectName = useCallback(
    (value: unknown, row: ISubject) => (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        <ListItemText
          primary={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <SubjectColorIndicator color={row.subjectColor} />
              <Typography variant="caption" fontSize="13px">
                {value as string}
              </Typography>
              {row?.subjects && row.subjects.length > 0 && (
                <CustomTooltip
                  title={
                    <Box display="flex" flexDirection="column" gap={0.5}>
                      {row.subjects.map((sub) => (
                        <Typography key={sub.subjectId} variant="caption">
                          {sub.subjectName} ({sub.subjectCode})
                        </Typography>
                      ))}
                    </Box>
                  }
                >
                  <Typography
                    variant="caption"
                    fontSize="13px"
                    sx={{ cursor: 'pointer' }}
                    color="primary"
                  >
                    ({row.subjectCount})
                  </Typography>
                </CustomTooltip>
              )}
            </Box>
          }
          secondary={`(${SubjectType[row.subjectType ?? 0]})`}
        />
      </Box>
    ),
    []
  );

  const renderLectureCell = useCallback(
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
        render: renderSubjectName,
      },
      {
        id: 'noOfLecture',
        label: 'Weekly Lectures',
        isSort: false,
        isFilter: false,
        render: renderLectureCell,
      },
    ],
    [renderSubjectName, renderLectureCell]
  );

  return (
    <Box display="flex" flexDirection="column" gap={2} maxHeight="500px" height="100%">
      <CustomizableTable
        tableId="table-subject-list"
        isSearch={false}
        isShowedDense={false}
        noDataText={<>No Subject&apos;s weekly lectures Found </>}
        isFilter={false}
        columns={columns}
        data={formik.values.subjects}
      />
    </Box>
  );
}

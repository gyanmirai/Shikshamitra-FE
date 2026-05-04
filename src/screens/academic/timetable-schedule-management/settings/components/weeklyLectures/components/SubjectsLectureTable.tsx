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
  const renderSubjectName: any = useCallback((value: unknown, row: ISubject) => {
    const subjects = row?.subjects || row?.electiveGroupSubjects || [];
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        <ListItemText
          primary={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <SubjectColorIndicator color={row.subjectColor || row.electiveGroupColor} />
              <Typography variant="caption" fontSize="13px">
                {value as string}
              </Typography>
              {subjects && subjects.length > 0 && (
                <CustomTooltip
                  title={
                    <Box display="flex" flexDirection="column" gap={1} p={1}>
                      {subjects.map((sub) => (
                        <Typography key={sub.subjectId} variant="caption">
                          {sub.subjectName || (sub?.name as any)}{' '}
                          {sub.subjectCode && `(${sub.subjectCode})`}
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
                    ({subjects.length})
                  </Typography>
                </CustomTooltip>
              )}
            </Box>
          }
          secondary={`(${SubjectType[row.subjectType ?? 0]})`}
        />
      </Box>
    );
  }, []);

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

  console.log('SubjectsLectureTable render with subjects:', formik.values.subjects); // Debug log

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

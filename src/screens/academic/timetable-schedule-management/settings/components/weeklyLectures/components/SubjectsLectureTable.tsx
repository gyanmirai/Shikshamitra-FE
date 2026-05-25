'use client';

import type { FormikProps } from 'formik';
import type { IColumn } from 'src/components/customizabaleTable/types';

import { useMemo, useState, useCallback } from 'react';
import CustomTooltip from 'src/components/custom-tooltip';
import CustomizableTable from 'src/components/customizabaleTable';
import { SubjectColorIndicator } from 'src/components/subject-color/SubejctColor';
import { SubjectType } from 'src/screens/academic/curriculum-management/subjectAssignment/enum/subjectType';
import {
  Box,
  Chip,
  Button,
  Divider,
  TextField,
  Typography,
  ListItemText,
  InputAdornment,
} from '@mui/material';

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
  const [applyAllValue, setApplyAllValue] = useState<string>('');

  const isInputDisabled = disabled && !isEdit;

  /** Total lectures across all subjects — UI-only, does not affect payload. */
  const totalLectures = useMemo(
    () => formik.values.subjects.reduce((sum, s) => sum + Number(s.noOfLecture || 0), 0),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [formik.values.subjects]
  );

  /**
   * Apply a single value to every subject row.
   * Only mutates formik state — no API calls, no validation bypass.
   */
  const handleApplyAll = useCallback(() => {
    const parsed = Number(applyAllValue);
    if (!applyAllValue || Number.isNaN(parsed) || parsed < 0) return;
    formik.values.subjects.forEach((_, i) => {
      formik.setFieldValue(`subjects[${i}].noOfLecture`, parsed);
    });
  }, [applyAllValue, formik]);

  const handleApplyAllKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') handleApplyAll();
      if (['e', 'E', '+', '-', '.'].includes(e.key)) e.preventDefault();
    },
    [handleApplyAll]
  );

  const renderSubjectName: any = useCallback((value: unknown, row: ISubject) => {
    const subjects = row?.subjects || row?.electiveGroupSubjects || [];
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        <ListItemText
          primary={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <SubjectColorIndicator color={row.subjectColor || row.electiveGroupColor} />
              <Typography variant="caption" fontSize="13px" fontWeight={600}>
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
          secondary={
            <Typography variant="caption" fontSize="11px" color="text.disabled">
              {SubjectType[row.subjectType ?? 0]}
            </Typography>
          }
          disableTypography={false}
          sx={{ my: 0 }}
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

        {!isInputDisabled && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
            <TextField
              type="number"
              size="small"
              placeholder="Apply to all"
              value={applyAllValue}
              onChange={(e) => setApplyAllValue(e.target.value)}
              onKeyDown={handleApplyAllKeyDown}
              inputProps={{ min: 0, 'aria-label': 'Apply lecture count to all subjects' }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <Typography
                      variant="caption"
                      color="text.disabled"
                      sx={{ whiteSpace: 'nowrap' }}
                    >
                      lec/wk
                    </Typography>
                  </InputAdornment>
                ),
              }}
              sx={{
                width: '140px',
                '& input[type=number]::-webkit-outer-spin-button, & input[type=number]::-webkit-inner-spin-button':
                  { WebkitAppearance: 'none' },
                '& input[type=number]': { MozAppearance: 'textfield' },
              }}
            />
            <Button
              size="small"
              variant="outlined"
              onClick={handleApplyAll}
              disabled={!applyAllValue}
              sx={{ whiteSpace: 'nowrap', height: 32, fontSize: '12px' }}
            >
              Apply to all
            </Button>
          </Box>
        )}
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

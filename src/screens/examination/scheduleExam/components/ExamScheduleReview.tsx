import type { FormikProps } from 'formik';

import React from 'react';
import dayjs from 'dayjs';
import { varAlpha } from 'src/theme/styles';
import { Iconify } from 'src/components/iconify';
import CustomizableTable from 'src/components/customizabaleTable';
import { Box, Chip, Grid, Button, Typography, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';

import type { IExamFormValues } from '../type';

/**
 * Flattens the formik subjects array into review rows.
 */
function buildReviewRows(subjects: any[]): any[] {
  const rows: any[] = [];
  subjects.forEach((sub) => {
    if (!sub.electiveGroupId) {
      // Core subject
      rows.push(sub);
    } else if (sub.schedulingMode === 'separate' && (sub.subjects ?? []).length > 0) {
      // Separate-mode elective: expand into individual subject rows
      (sub.subjects as any[]).forEach((s) => {
        rows.push({
          subjectId: s.subjectId,
          subjectName: s.subjectName || s.name || '',
          subjectCode: s.subjectCode || s.code || '',
          subjectColor: s.subjectColor || sub.subjectColor || '#9E9E9E',
          electiveGroupId: sub.electiveGroupId,
          electiveGroupName: sub.electiveGroupName || sub.subjectName || '',
          examDate: s.examDate,
          startTime: s.startTime,
          endTime: s.endTime,
          totalMarks: s.totalMarks,
          passingMarks: s.passingMarks,
          notes: s.notes,
        });
      });
    } else {
      // Combined-mode elective: one row for the whole group
      rows.push(sub);
    }
  });
  return rows;
}

const ExamScheduleReview = ({
  formik,
  onEdit,
}: {
  formik: FormikProps<IExamFormValues>;
  onEdit?: () => void;
}) => {
  const reviewRows = buildReviewRows(formik.values.subjects);

  return (
    <Accordion
      defaultExpanded
      disableGutters
      elevation={0}
      sx={{
        borderRadius: 2,
        boxShadow: (theme) =>
          theme.customShadows?.card ||
          '0 0 2px 0 rgba(145, 158, 171, 0.2), 0 12px 24px -4px rgba(145, 158, 171, 0.12)',
        border: (theme) => `1px solid ${varAlpha(theme.palette.grey['500Channel'], 0.12)}`,
        overflow: 'hidden',
        mb: 2,
        '&:before': { display: 'none' },
      }}
    >
      <AccordionSummary
        expandIcon={<Iconify icon="eva:chevron-down-fill" width={20} />}
        sx={{
          px: 2,
          py: 1,
          bgcolor: (theme) => varAlpha(theme.palette.primary.mainChannel, 0.04),
          borderBottom: (theme) => `1px dashed ${varAlpha(theme.palette.grey['500Channel'], 0.2)}`,
          '& .MuiAccordionSummary-content': {
            my: 0.5,
            alignItems: 'center',
            justifyContent: 'space-between',
          },
        }}
      >
        <Box display="flex" alignItems="center" gap={1}>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: '50%',
              bgcolor: 'common.white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: (theme) =>
                `0 4px 8px ${varAlpha(theme.palette.primary.mainChannel, 0.16)}`,
              border: (theme) => `1px solid ${varAlpha(theme.palette.primary.mainChannel, 0.1)}`,
            }}
          >
            <Iconify icon="solar:calendar-bold-duotone" width={24} color="primary.main" />
          </Box>

          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
              Subject Schedule
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
              Exam schedule details for each subject
            </Typography>
          </Box>
        </Box>

        {onEdit && (
          <Button
            size="small"
            variant="outlined"
            startIcon={<Iconify icon="eva:edit-2-fill" width={16} />}
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            sx={{ fontSize: '0.75rem' }}
          >
            Edit
          </Button>
        )}
      </AccordionSummary>

      <AccordionDetails sx={{ p: 2 }}>
        <Grid size={12}>
          <CustomizableTable
            tableId="exam-schedule-view"
            columns={[
              {
                id: 'subjectName',
                label: 'Subject',
                align: 'left',
                render: (_value: any, row: any) => (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Box sx={{ width: 4, height: 18, borderRadius: 1, bgcolor: row.subjectColor }} />
                    <Box>
                      <Typography variant="caption" display="block">
                        {row.subjectName}
                        {row.subjectCode ? ` (${row.subjectCode})` : ''}
                      </Typography>
                      {row.electiveGroupName && (
                        <Chip
                          label={row.electiveGroupName}
                          size="small"
                          color="warning"
                          variant="soft"
                          sx={{ fontSize: '0.62rem', height: 16, mt: 0.25 }}
                        />
                      )}
                    </Box>
                  </Box>
                ),
              },
              {
                id: 'examDate',
                label: 'Date',
                filterType: 'date',
                align: 'left',
                render: (value: any) => (value ? dayjs(value).format('DD-MM-YYYY') : '-'),
              },
              {
                id: 'startTime',
                label: 'Start Time',
                align: 'left',
                render: (value: any) => (value ? dayjs(value).format('hh:mm A') : '-'),
              },
              {
                id: 'endTime',
                label: 'End Time',
                align: 'left',
                render: (value: any) => (value ? dayjs(value).format('hh:mm A') : '-'),
              },
              {
                id: 'totalMarks',
                label: 'Total Marks',
                filterType: 'number',
                align: 'left',
                render: (value: any) => (value != null && value !== '' ? value : '-'),
              },
              {
                id: 'passingMarks',
                label: 'Passing Marks',
                filterType: 'number',
                align: 'left',
                render: (value: any) => (value != null && value !== '' ? value : '-'),
              },
              {
                id: 'notes',
                label: 'Notes',
                align: 'left',
                render: (value: any) => value || '-',
              },
            ]}
            data={reviewRows}
            isFilter={false}
            isPagination={false}
            isScrollbar={false}
            isSearch={false}
            isShowedDense={false}
          />
        </Grid>
      </AccordionDetails>
    </Accordion>
  );
};

export default ExamScheduleReview;

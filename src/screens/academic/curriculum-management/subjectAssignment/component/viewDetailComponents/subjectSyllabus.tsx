'use client';

import React from 'react';
import { varAlpha } from 'src/theme/styles';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import {
  Box,
  Paper,
  Stack,
  Button,
  Divider,
  Accordion,
  Typography,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import { useGetChaptersByStandardQuery } from 'src/redux/academicAPI/CurriculumManagementApi/Subject-AssignmentApi.ts/Chapter-management-api';

import { SubjectSyllabusSkeleton } from './SubjectSyllabusSkeleton';

import type { ISubjectDetail } from '../type';

interface SubjectSyllabusProps {
  subject: ISubjectDetail | null;
}

const SubjectSyllabus: React.FC<SubjectSyllabusProps> = ({ subject }) => {
  const {
    data: chaptersData,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetChaptersByStandardQuery,
    params: { standardId: subject?.classId, subjectId: subject?.subjectId },
    options: { skip: !subject?.classId || !subject?.subjectId },
  });

  const chapters: any[] =
    chaptersData?.data?.items ??
    chaptersData?.items ??
    chaptersData?.records ??
    (Array.isArray(chaptersData) ? chaptersData : []);

  if (isLoading || isFetching) {
    return <SubjectSyllabusSkeleton />;
  }

  if (error) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Paper
          variant="outlined"
          sx={{
            p: 4,
            maxWidth: 420,
            mx: 'auto',
            borderRadius: 2,
            borderStyle: 'dashed',
            borderColor: 'error.main',
            bgcolor: (theme) => varAlpha(theme.palette.error.mainChannel, 0.04),
          }}
        >
          <Iconify icon="solar:danger-triangle-bold" width={48} sx={{ color: 'error.main', mb: 1.5 }} />
          <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'text.primary', mb: 0.5 }}>
            Unable to load syllabus
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Something went wrong while fetching syllabus chapters for this subject.
          </Typography>
          <Button
            size="small"
            variant="contained"
            color="primary"
            startIcon={<Iconify icon="mdi:refresh" />}
            onClick={() => refetch()}
          >
            Retry
          </Button>
        </Paper>
      </Box>
    );
  }

  return (
    <Box sx={{ height: '100%', p: { xs: 1.5, sm: 2 } }}>
      <Scrollbar sx={{ height: '100%', pb: 2, pr: 0.5 }}>
        {chapters.length > 0 ? (
          <Stack spacing={1.25}>
            {chapters.map((chapter: any) => (
              <Accordion
                key={chapter.id || chapter.chapterNumber}
                sx={{
                  borderRadius: 1.5,
                  boxShadow: 'none',
                  border: (theme) => `1px solid ${theme.palette.divider}`,
                  '&:before': { display: 'none' },
                  '&.Mui-expanded': {
                    margin: 0,
                    boxShadow: 'var(--shadows-2)',
                    borderColor: 'primary.light',
                  },
                }}
              >
                <AccordionSummary
                  expandIcon={<Iconify icon="eva:arrow-ios-downward-fill" />}
                  sx={{
                    minHeight: 56,
                    px: 2,
                    '& .MuiAccordionSummary-content': { my: 0.5 },
                    '&.Mui-expanded': {
                      minHeight: 56,
                      bgcolor: (theme) => varAlpha(theme.palette.primary.mainChannel, 0.04),
                    },
                  }}
                >
                  <Stack direction="row" alignItems="center" spacing={1.5} sx={{ minWidth: 0 }}>
                    <Box
                      sx={{
                        width: 36,
                        height: 36,
                        borderRadius: 1,
                        bgcolor: (theme) => varAlpha(theme.palette.primary.mainChannel, 0.08),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'primary.main',
                        flexShrink: 0,
                      }}
                    >
                      <Iconify icon="mdi:book-open-page-variant" width={20} />
                    </Box>
                    <Box sx={{ minWidth: 0 }}>
                      <Typography
                        variant="caption"
                        sx={{
                          color: 'text.disabled',
                          fontWeight: 700,
                          letterSpacing: 0.5,
                          textTransform: 'uppercase',
                        }}
                      >
                        Chapter {chapter.chapterNumber}
                      </Typography>
                      <Typography variant="subtitle2" noWrap sx={{ fontWeight: 600, color: 'text.primary' }}>
                        {chapter.chapterName}
                      </Typography>
                    </Box>
                  </Stack>
                </AccordionSummary>

                <AccordionDetails sx={{ pt: 1, pb: 2.5, px: 2.5 }}>
                  <Divider sx={{ borderStyle: 'dashed', mb: 1.5 }} />
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    component="div"
                    sx={{
                      lineHeight: 1.7,
                      '& p, & ul, & ol': { margin: 0, lineHeight: 1.7 },
                      '& p:not(:last-child)': { marginBottom: 1 },
                      '& ul, & ol': { paddingLeft: 2 },
                    }}
                    dangerouslySetInnerHTML={{
                      __html: chapter.description || 'No description provided for this chapter.',
                    }}
                  />
                </AccordionDetails>
              </Accordion>
            ))}
          </Stack>
        ) : (
          <Paper
            variant="outlined"
            sx={{
              p: 5,
              textAlign: 'center',
              borderRadius: 2,
              bgcolor: (theme) => varAlpha(theme.palette.grey['500Channel'], 0.02),
              borderStyle: 'dashed',
            }}
          >
            <Iconify
              icon="solar:notebook-minimalistic-broken"
              width={56}
              sx={{ color: 'text.disabled', mb: 1.5, opacity: 0.6 }}
            />
            <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'text.primary', mb: 0.5 }}>
              No Syllabus Available
            </Typography>
            <Typography variant="body2" color="text.secondary">
              There are no syllabus chapters configured for this subject yet.
            </Typography>
          </Paper>
        )}
      </Scrollbar>
    </Box>
  );
};

export default React.memo(SubjectSyllabus);

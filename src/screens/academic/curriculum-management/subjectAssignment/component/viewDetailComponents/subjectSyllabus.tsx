import React from 'react';
import { varAlpha } from 'src/theme/styles';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { sanitizeHtml } from 'src/utils/sanitize-html';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import {
  Box,
  Paper,
  Divider,
  Accordion,
  Typography,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import { useGetChaptersByStandardQuery } from 'src/redux/academicAPI/CurriculumManagementApi/Subject-AssignmentApi.ts/Chapter-management-api';

import { SubjectSyllabusSkeleton } from './SubjectSyllabusSkeleton';

import type { ISubjectDetail } from '../type';

const SubjectSyllabus = ({ subject }: { subject: ISubjectDetail }) => {
  const {
    data: chaptersData,
    isLoading,
    isFetching,
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

  return (
    <Box sx={{ height: '100%' }}>
      <Scrollbar sx={{ height: '100%', pb: 2 }}>
        {chapters.length > 0 ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {chapters.map((chapter: any) => (
              <Accordion
                key={chapter.id}
                sx={{
                  borderRadius: 2,
                  boxShadow: 'none',
                  border: (theme) => `1px solid ${theme.palette.divider}`,
                  '&:before': { display: 'none' },
                  '&.Mui-expanded': {
                    margin: 0,
                    boxShadow: 'var(--shadows-3)',
                    borderColor: 'transparent',
                  },
                }}
              >
                <AccordionSummary
                  expandIcon={<Iconify icon="eva:arrow-ios-downward-fill" />}
                  sx={{
                    minHeight: 64,
                    '& .MuiAccordionSummary-content': { my: 0 },
                    '&.Mui-expanded': {
                      minHeight: 64,
                      bgcolor: (theme) => varAlpha(theme.palette.primary.mainChannel, 0.04),
                    },
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: 1,
                        bgcolor: (theme) => varAlpha(theme.palette.primary.mainChannel, 0.08),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'primary.main',
                        mr: 2,
                      }}
                    >
                      <Iconify icon="mdi:book-open-page-variant" width={24} />
                    </Box>
                    <Box>
                      <Typography variant="overline" sx={{ color: 'text.disabled' }}>
                        Chapter NO. {chapter.chapterNumber}
                      </Typography>
                      <Typography variant="subtitle1" sx={{ color: 'text.primary' }}>
                        {chapter.chapterName}
                      </Typography>
                    </Box>
                  </Box>
                </AccordionSummary>

                <AccordionDetails sx={{ pt: 1, pb: 3, px: 3 }}>
                  <Divider sx={{ borderStyle: 'dashed', mb: 2 }} />
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ lineHeight: 1.8 }}
                    dangerouslySetInnerHTML={{
                      __html: sanitizeHtml(chapter.description) || 'No description provided.',
                    }}
                  />
                </AccordionDetails>
              </Accordion>
            ))}
          </Box>
        ) : (
          <Paper
            variant="outlined"
            sx={{
              p: 5,
              textAlign: 'center',
              borderRadius: 2,
              bgcolor: (theme) => varAlpha(theme.palette.grey['500Channel'], 0.04),
              borderStyle: 'dashed',
            }}
          >
            <Iconify
              icon="solar:notebook-minimalistic-broken"
              width={64}
              sx={{ color: 'text.disabled', mb: 2 }}
            />
            <Typography variant="h6" color="text.secondary">
              No Syllabus available
            </Typography>
            <Typography variant="body2" color="text.disabled">
              There are no syllabus chapters created for this subject yet.
            </Typography>
          </Paper>
        )}
      </Scrollbar>
    </Box>
  );
};

export default SubjectSyllabus;

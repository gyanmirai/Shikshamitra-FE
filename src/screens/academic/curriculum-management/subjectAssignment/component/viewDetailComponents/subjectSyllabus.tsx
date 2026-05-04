import React from 'react';
import { varAlpha } from 'src/theme/styles';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import {
  Box,
  Paper,
  Divider,
  Skeleton,
  Accordion,
  Typography,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import { useGetChaptersByStandardQuery } from 'src/redux/academicAPI/CurriculumManagementApi/Subject-AssignmentApi.ts/Chapter-management-api';

import type { ISubjectDetail } from '../type';

const SubjectSyllabus = ({ subject }: { subject: ISubjectDetail }) => {
  const {
    data: _chaptersData,
    isLoading: _isLoading,
    isFetching: _isFetching,
  } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetChaptersByStandardQuery,
    params: { assignedStandardId: subject?.assignedSubjectId },
  });

  if (_isLoading || _isFetching) {
    return (
      <Box sx={{ height: '100%' }}>
        <Scrollbar sx={{ height: '100%', pb: 2 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {[...Array(5)].map((_, index) => (
              <Box
                key={index}
                sx={{
                  borderRadius: 2,
                  border: (theme) => `1px solid ${theme.palette.divider}`,
                  overflow: 'hidden',
                }}
              >
                {/* AccordionSummary skeleton */}
                <Box
                  sx={{
                    minHeight: 64,
                    px: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Skeleton
                      variant="rounded"
                      width={40}
                      height={40}
                      sx={{ borderRadius: 1, mr: 2, flexShrink: 0 }}
                    />
                    <Box>
                      <Skeleton variant="text" width={80} height={16} />
                      <Skeleton variant="text" width={180} height={22} sx={{ mt: 0.5 }} />
                    </Box>
                  </Box>
                  <Skeleton variant="circular" width={20} height={20} />
                </Box>
              </Box>
            ))}
          </Box>
        </Scrollbar>
      </Box>
    );
  }

  return (
    <Box sx={{ height: '100%' }}>
      <Scrollbar sx={{ height: '100%', pb: 2 }}>
        {_chaptersData?.length > 0 ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {_chaptersData.map((chapter: any) => (
              <Accordion
                key={chapter.id}
                sx={{
                  borderRadius: 2,
                  boxShadow: 'none',
                  border: (theme) => `1px solid ${theme.palette.divider}`,
                  '&:before': { display: 'none' }, // Remove default divider
                  '&.Mui-expanded': {
                    margin: 0, // Prevent default margin shift
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
                      __html: chapter.description || 'No description provided.',
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
              No chapters available
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

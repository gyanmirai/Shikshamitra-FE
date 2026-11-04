'use client';

import { GlobalIcons } from 'src/utils/icons';
import { Scrollbar } from 'src/components/scrollbar';
import { Box, Grid, Stack, Typography } from '@mui/material';
import { FormSectionCard } from 'src/components/form-section-card';

import { SubjectTeachingStaff } from './SubjectTeachingStaff';
import { SubjectInformationCard } from './SubjectInformationCard';
import { SubjectOverviewSkeleton } from './SubjectOverviewSkeleton';

import type { ISubjectDetail } from '../type';

export { SubjectOverviewSkeleton } from './SubjectOverviewSkeleton';

interface SubjectOverviewProps {
  subject: ISubjectDetail | null;
  status?: number | string;
  subjectType?: number;
  isLoading?: boolean;
}

const CONTENT_SECTIONS = [
  {
    field: 'learningGoals',
    title: 'Learning Goals',
    icon: GlobalIcons.learningGoal,
    help: 'Recorded concepts and skills students are expected to achieve in this subject.',
    emptyText: 'No learning goals recorded.',
  },
  {
    field: 'prerequisites',
    title: 'Prerequisites',
    icon: GlobalIcons.prerequisites,
    help: 'Recorded knowledge or skills students should have before starting this subject.',
    emptyText: 'No prerequisites recorded.',
  },
  {
    field: 'description',
    title: 'Description',
    icon: GlobalIcons.documentIcon,
    help: 'Saved overview of the subject scope and teaching objectives.',
    emptyText: 'No description recorded.',
  },
] as const;

export default function SubjectOverview({
  subject,
  status,
  subjectType,
  isLoading,
}: SubjectOverviewProps) {
  if (isLoading) return <SubjectOverviewSkeleton />;

  return (
    <Box sx={{ height: 1, minWidth: 0, p: { xs: 1.5, sm: 2 } }}>
      <Scrollbar sx={{ height: 1 }}>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, lg: 8 }} sx={{ minWidth: 0 }}>
            <Stack spacing={2}>
              <SubjectInformationCard subject={subject} status={status} subjectType={subjectType} />
              {CONTENT_SECTIONS.map(({ field, title, icon, help, emptyText }) => {
                const content = subject?.[field];
                const hasContent =
                  Boolean(content?.replace(/<[^>]*>|&nbsp;/g, '').trim()) && content !== 'N/A';
                return (
                  <FormSectionCard
                    key={field}
                    title={title}
                    icon={icon}
                    descriptionTooltip={help}
                    titleTypographyProps={{ fontWeight: 600 }}
                    sx={{ minWidth: 0 }}
                  >
                    {hasContent ? (
                      <Typography
                        variant="body2"
                        component="div"
                        sx={{
                          color: 'text.primary',
                          overflowWrap: 'anywhere',
                          '& p, & ul, & ol': { margin: 0 },
                          '& p:not(:last-child)': { mb: 1 },
                          '& ul, & ol': { pl: 2.5 },
                          '& img': { maxWidth: '100%', height: 'auto' },
                        }}
                        dangerouslySetInnerHTML={{ __html: content! }}
                      />
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        {emptyText}
                      </Typography>
                    )}
                  </FormSectionCard>
                );
              })}
            </Stack>
          </Grid>
          <Grid size={{ xs: 12, lg: 4 }} sx={{ minWidth: 0 }}>
            <SubjectTeachingStaff subject={subject} />
          </Grid>
        </Grid>
      </Scrollbar>
    </Box>
  );
}

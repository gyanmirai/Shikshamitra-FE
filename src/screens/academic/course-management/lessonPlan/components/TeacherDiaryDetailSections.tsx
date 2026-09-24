'use client';

import dayjs from 'dayjs';
import { Iconify } from 'src/components/iconify';
import { Box, Card, Stack, Typography } from '@mui/material';

import { LessonDiaryDetailSection } from './LessonDiaryDetailSection';
import { DetailTile, ProgressTile, DetailTileGrid } from './LessonDiaryDetailFields';

import type { TeacherDiaryRow } from '../lessonPlanData';

export function TeacherDiaryDetailSections({ diary }: { diary?: TeacherDiaryRow | null }) {
  if (!diary) {
    return (
      <Card
        variant="outlined"
        sx={{ p: 2, borderRadius: 2, bgcolor: 'background.paper', overflow: 'visible' }}
      >
        <Stack
          spacing={1}
          alignItems="center"
          justifyContent="center"
          sx={{
            py: 4,
            px: 2,
            borderRadius: 1.5,
            border: 1,
            borderStyle: 'dashed',
            borderColor: 'divider',
            color: 'text.secondary',
            textAlign: 'center',
          }}
        >
          <Box
            sx={{
              width: 44,
              height: 44,
              display: 'grid',
              placeItems: 'center',
              borderRadius: 1.5,
              bgcolor: 'primary.lighter',
              color: 'primary.main',
            }}
          >
            <Iconify icon="mdi:notebook-remove-outline" width={24} />
          </Box>
          <Typography variant="body2">No diary has been submitted for this lesson yet.</Typography>
        </Stack>
      </Card>
    );
  }

  return (
    <Stack spacing={1.5}>
      <LessonDiaryDetailSection
        icon="mdi:calendar-check"
        title="Core Execution Details"
        subtitle="What was delivered in the classroom"
        accent="success"
      >
        <DetailTileGrid>
          <DetailTile
            label="Actual Date"
            value={diary.actualDate ? dayjs(diary.actualDate).format('DD-MM-YYYY') : '-'}
          />
          <DetailTile label="Class Conducted" value={diary.classConducted ? 'Yes' : 'No'} />
          <DetailTile
            label="Actual Topic Covered"
            value={diary.actualTopicCovered || diary.actualTopicTaught}
            wide
          />
        </DetailTileGrid>
      </LessonDiaryDetailSection>

      <LessonDiaryDetailSection
        icon="mdi:chart-bar"
        title="Classroom Metrics & Engagement"
        subtitle="Completion and student participation"
        accent="warning"
      >
        <DetailTileGrid>
          <DetailTile label="Understanding Level" value={diary.classUnderstandingLevel} />
          <DetailTile label="Engagement Level" value={diary.studentEngagementLevel} />
        </DetailTileGrid>
        <ProgressTile
          label="Actual Completion"
          value={diary.actualCompletionPercentage}
          accent="warning"
        />
      </LessonDiaryDetailSection>

      <LessonDiaryDetailSection
        icon="mdi:comment-quote"
        title="Reflections & Takeaways"
        subtitle="Teacher observations and lesson outcomes"
        accent="info"
      >
        <DetailTileGrid>
          <DetailTile label="Content Summary" value={diary.actualContentSummary} wide />
          <DetailTile label="Student Response" value={diary.studentResponse} wide />
          <DetailTile label="Reflection" value={diary.reflection} wide />
          <DetailTile label="What Went Well" value={diary.whatWentWell} />
          <DetailTile label="Difficulties Encountered" value={diary.whatWasDifficult} />
        </DetailTileGrid>
      </LessonDiaryDetailSection>

      <LessonDiaryDetailSection
        icon="mdi:account-group"
        title="Targeted Student Support & Follow-up"
        subtitle="Actions required after the lesson"
        accent="secondary"
      >
        <DetailTileGrid>
          <DetailTile label="Students Needing Support" value={diary.studentsNeedingSupport} wide />
          <DetailTile label="Next Class Follow-up" value={diary.nextClassFollowUp} wide />
          <DetailTile label="Homework Assigned" value={diary.homeworkAssigned} />
          <DetailTile label="Teacher Remarks" value={diary.teacherRemarks} />
        </DetailTileGrid>
      </LessonDiaryDetailSection>
    </Stack>
  );
}

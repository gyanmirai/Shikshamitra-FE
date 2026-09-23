'use client';

import dayjs from 'dayjs';

import { LessonReviewComment } from './LessonReviewComment';
import { formatTeachingMethods } from '../lessonPlanTeachingMethods';
import { LessonDiaryDetailSection } from './LessonDiaryDetailSection';
import { DetailTile, ProgressTile, DetailTileGrid } from './LessonDiaryDetailFields';

import type { LessonPlanRow } from '../lessonPlanData';

export function LessonPlanDetailSection({ plan }: { plan: LessonPlanRow }) {
  const reviewRemarks = plan.reviewRemarks?.trim();

  return (
    <LessonDiaryDetailSection
      icon="mdi:clipboard-text-outline"
      title="Plan Details"
      subtitle="Schedule, curriculum and preparation information"
      accent="primary"
    >
      <DetailTileGrid>
        <DetailTile
          label="Date"
          value={plan.plannedDate ? dayjs(plan.plannedDate).format('DD-MM-YYYY') : '-'}
        />
        <DetailTile label="Period" value={plan.period} />
        <DetailTile label="Time" value={plan.plannedTime} />
        <DetailTile
          label="Class / Division"
          value={
            plan.className || plan.divisionName
              ? `${plan.className || '-'}-${plan.divisionName || '-'}`
              : undefined
          }
        />
        <DetailTile label="Teacher" value={plan.teacherName} wide />
      </DetailTileGrid>

      <DetailTileGrid>
        <DetailTile label="Topic" value={plan.topic} wide />
        <DetailTile label="Learning Objective" value={plan.learningObjective} wide />
        <DetailTile label="Teaching Methods" value={formatTeachingMethods(plan.teachingMethod)} />
        <DetailTile label="Resources Required" value={plan.resourcesRequired} />
      </DetailTileGrid>

      <ProgressTile
        label="Planned Completion"
        value={plan.plannedCompletionPercentage}
        accent="primary"
      />

      {reviewRemarks ? (
        <LessonReviewComment remarks={reviewRemarks} reviewerName={plan.reviewedByName} />
      ) : null}
    </LessonDiaryDetailSection>
  );
}

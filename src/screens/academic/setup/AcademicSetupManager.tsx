'use client';

import dynamic from 'next/dynamic';
import { Skeleton } from '@mui/material';

import type { AcademicSetupSettingKey } from './academic-setup-catalog';

const LoadingSetting = () => <Skeleton variant="rounded" height={240} aria-label="Loading setting" />;
const managers = {
  subjects: dynamic(() => import('src/screens/academic/curriculum-management/setting/subjectCreation'), { loading: LoadingSetting }),
  'elective-groups': dynamic(() => import('src/screens/academic/curriculum-management/setting/electiveSubjectSetting'), { loading: LoadingSetting }),
  'weekly-lectures': dynamic(() => import('src/screens/academic/timetable-schedule-management/settings/components/weeklyLectures/weeklyLectures'), { loading: LoadingSetting }),
  'lecture-slots': dynamic(() => import('src/screens/academic/timetable-schedule-management/settings/components/lectureSlots/lectureSlots'), { loading: LoadingSetting }),
  'homework-types': dynamic(() => import('src/screens/academic/homework-assignment-management/setting/homeworkType'), { loading: LoadingSetting }),
  'assignment-types': dynamic(() => import('src/screens/academic/homework-assignment-management/setting/assignmentType'), { loading: LoadingSetting }),
  rubrics: dynamic(() => import('src/screens/academic/homework-assignment-management/setting/rubricConfig'), { loading: LoadingSetting }),
  'grading-scales': dynamic(() => import('src/screens/examination/settings/gradeScaleManagement/gradeScaling'), { loading: LoadingSetting }),
  'exam-types': dynamic(() => import('src/screens/examination/settings/examAssessmentTypeSetting.tsx/examTypeSetting/examTypeSetting'), { loading: LoadingSetting }),
};

export default function AcademicSetupManager({ setting }: { setting: AcademicSetupSettingKey }) {
  const Manager = managers[setting];
  return <Manager />;
}

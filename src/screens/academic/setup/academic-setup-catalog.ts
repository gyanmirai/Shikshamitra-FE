import { academicPaths as paths, academicPermissions as permissions } from 'src/constants/academic-menu';

export const academicSetupStages = [
  { key: 'welcome', title: 'Welcome' },
  { key: 'curriculum', title: 'Curriculum' },
  { key: 'timetable', title: 'Timetable' },
  { key: 'homework', title: 'Homework & Assignment' },
  { key: 'examination', title: 'Examination' },
  { key: 'review', title: 'Review & Finish' },
] as const;

export const academicSetupSettings = [
  { key: 'subjects', stage: 'curriculum', title: 'Subjects Creation',
    description: 'Create the subjects your school teaches.',
    path: paths.curriculum.settings.subjectsCreation, permission: permissions.curriculum.settings.subjectsCreation },
  { key: 'elective-groups', stage: 'curriculum', title: 'Elective Group Creation',
    description: 'Group optional subjects students can choose from.',
    path: paths.curriculum.settings.electiveGroupCreation, permission: permissions.curriculum.settings.electiveGroupCreation },
  { key: 'lecture-slots', stage: 'timetable', title: 'Lecture Slots',
    description: 'Define the school day and assign period timings to classes.',
    path: paths.timetable.settings.lectureSlots, permission: permissions.timetable.settings.lectureSlots },
  { key: 'weekly-lectures', stage: 'timetable', title: 'Weekly Lectures',
    description: 'Set weekly teaching periods for each class and subject.',
    path: paths.timetable.settings.weeklyLectures, permission: permissions.timetable.settings.weeklyLectures },
  { key: 'homework-types', stage: 'homework', title: 'Homework Types',
    description: 'Create the categories teachers use for homework.',
    path: paths.homework.settings.homeworkTypes, permission: permissions.homework.settings.homeworkTypes },
  { key: 'assignment-types', stage: 'homework', title: 'Assignment Types',
    description: 'Create the categories teachers use for assignments.',
    path: paths.homework.settings.assignmentTypes, permission: permissions.homework.settings.assignmentTypes },
  { key: 'rubrics', stage: 'homework', title: 'Rubric Templates',
    description: 'Build reusable assessment criteria and scoring levels.',
    path: paths.homework.settings.rubricConfig, permission: permissions.homework.settings.rubricConfig },
  { key: 'grading-scales', stage: 'examination', title: 'Grade Scaling',
    description: 'Define grade boundaries and their grading rules.',
    path: paths.examination.settings.gradeScaling, permission: permissions.examination.settings.gradeScaling },
  { key: 'exam-types', stage: 'examination', title: 'Exam Types',
    description: 'Create the exam categories used when scheduling assessments.',
    path: paths.examination.settings.examTypes, permission: permissions.examination.settings.examTypes },
] as const;

export type AcademicSetupStageKey = typeof academicSetupStages[number]['key'];
export type AcademicSetupSettingKey = typeof academicSetupSettings[number]['key'];
export type AcademicSetupPosition = { stage: AcademicSetupStageKey; setting: AcademicSetupSettingKey | null };
